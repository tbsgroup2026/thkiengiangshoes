"""
TBS II — Upload Guard (File Upload Security)
=============================================
Wrapper upload anh/QR: gioi han size, kiem tra MIME type that,
quet malware stub truoc khi luu len R2/Firebase Storage.

Su dung:
  from security.upload_guard import UploadGuard

  guard = UploadGuard(max_size_mb=10, allowed_types=["image/jpeg", "image/png"])
  guard.validate(uploaded_file)

  # Hoac dung nhu FastAPI dependency:
  @router.post("/upload")
  async def upload_file(
      file: UploadFile,
      guard: UploadGuard = Depends(get_upload_guard)
  ):
      guard.validate(file)
      ...
"""

import os
import magic  # python-magic — kiem tra MIME type that
from typing import List, Optional, BinaryIO
from dataclasses import dataclass
from enum import Enum

from fastapi import UploadFile, HTTPException, status


class UploadErrorType(Enum):
    FILE_TOO_LARGE = "FILE_TOO_LARGE"
    INVALID_TYPE = "INVALID_TYPE"
    MIME_MISMATCH = "MIME_MISMATCH"  # MIME khai bao khong khop MIME that
    MALICIOUS_CONTENT = "MALICIOUS_CONTENT"
    EMPTY_FILE = "EMPTY_FILE"
    FILENAME_TOO_LONG = "FILENAME_TOO_LONG"


@dataclass
class UploadGuard:
    """
    File upload security wrapper.

    Args:
        max_size_mb: Kich thuoc toi da (MB)
        allowed_types: Danh sach MIME type duoc phep
        max_filename_length: Do dai ten file toi da
        scan_content: Quet noi dung file tim malware signature (stub)
        allow_empty: Cho phep file rong khong
    """

    max_size_mb: int = 10
    allowed_types: List[str] = None
    max_filename_length: int = 255
    scan_content: bool = True
    allow_empty: bool = False

    def __post_init__(self):
        if self.allowed_types is None:
            self.allowed_types = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ]

    def _get_max_bytes(self) -> int:
        return self.max_size_mb * 1024 * 1024

    def validate(self, file: UploadFile) -> None:
        """
        Validate toan dien mot file upload.
        Raise HTTPException neu khong hop le.
        """
        # 1. Kiem tra file rong
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ten file khong duoc de trong",
            )
        if not file.filename.strip():
            if not self.allow_empty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File khong duoc de trong",
                )

        # 2. Kiem tra do dai ten file
        if len(file.filename) > self.max_filename_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ten file khong duoc vuot qua {self.max_filename_length} ky tu",
            )

        # 3. Kiem tra ky tu nguy hiem trong ten file
        dangerous_chars = ["../", "..\\", "\\", "\x00", "<", ">", "|", ";", "&"]
        for char in dangerous_chars:
            if char in file.filename:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ten file chua ky tu khong hop le: {repr(char)}",
                )

        # 4. Kiem tra extension trung voi MIME type (basic check)
        ext = os.path.splitext(file.filename)[1].lower()
        blocked_extensions = [
            ".exe", ".dll", ".so", ".sh", ".bat", ".cmd", ".ps1",
            ".vbs", ".js", ".php", ".asp", ".jsp", ".war",
            ".py", ".rb", ".pl",  # Script files
        ]
        if ext in blocked_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Loai file .{ext} khong duoc phep upload",
            )

        # 5. Kiem tra content type khai bao
        if file.content_type and file.content_type not in self.allowed_types:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Loai file {file.content_type} khong duoc ho tro. "
                f"Cac loai duoc phep: {', '.join(self.allowed_types)}",
            )

    async def validate_after_read(self, file: UploadFile) -> None:
        """
        Validate sau khi doc noi dung file (kiem tra MIME that + scan malware).
        Goi SAU KHI da doc file content.
        """
        content = await file.read()

        # Reset con tro file de doc lai sau nay
        await file.seek(0)

        # 1. Kiem tra kich thuoc
        size = len(content)
        max_bytes = self._get_max_bytes()
        if size > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File vuot qua gioi han {self.max_size_mb}MB "
                f"(size={size / (1024*1024):.1f}MB)",
            )

        if size == 0 and not self.allow_empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File rong khong duoc phep",
            )

        # 2. Kiem tra MIME type that (bang magic bytes)
        if self.scan_content and size > 0:
            try:
                detected_mime = magic.from_buffer(content[:2048], mime=True)
            except Exception:
                detected_mime = "application/octet-stream"

            # Kiem tra MIME co khop voi danh sach allowed khong
            if detected_mime not in self.allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"MIME type thuc te ({detected_mime}) khong khop "
                    f"voi loai file duoc phep",
                )

            # Kiem tra MIME khai bao vs MIME that (cảnh báo mismatch)
            if (
                file.content_type
                and detected_mime != "application/octet-stream"
                and file.content_type != detected_mime
            ):
                # MIME mismatch — co the la tan cong disguised file
                # Cho phep nhung canh bao audit log
                print(
                    f"[SECURITY WARNING] MIME mismatch: "
                    f"claimed={file.content_type} actual={detected_mime} "
                    f"file={file.filename}"
                )

            # 3. Quet malware signature (STUB — can tich hop ClamAV trong production)
            self._scan_malware_stub(content, file.filename)

    def _scan_malware_stub(self, content: bytes, filename: str) -> None:
        """
        Quet malware signature co ban (STUB).
        Trong production: tich hop ClamAV hoac cloud scanning API.

        Phat hien: EICAR test string, PHP/JS webshell patterns,
        SQL injection payloads trong file upload.
        """
        # EICAR test string (anti-malware test)
        eicar = b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"
        if eicar in content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File chua malware signature (EICAR)",
            )

        # Common webshell patterns (kiem tra file text/image co chua code injection khong)
        text_preview = content[:4096]
        suspicious_patterns = [
            b"<?php", b"<?=", b"eval(", b"system(", b"exec(",
            b"base64_decode", b"shell_exec", b"passthru",
            b"<script", b"javascript:", b"onerror=", b"onload=",
            b"SELECT ", b"INSERT ", b"DROP TABLE", b"UNION SELECT",
        ]
        for pattern in suspicious_patterns:
            if pattern in text_preview:
                # Chi chan neu day la file anh (khong phai text/document)
                if file.content_type and file.content_type.startswith("image/"):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"File anh chua noi dung dang ngo: {pattern.decode()}",
                    )
                break  # Document co the chua text hop le

    def validate_image_dimensions(
        self, file: UploadFile, max_width: int = 8000, max_height: int = 8000
    ) -> None:
        """
        Kiem tra kich thuoc anh (tranh pixel flood attack).
        Can doc file truoc.
        """
        try:
            from PIL import Image
            img = Image.open(file.file)
            width, height = img.size
            if width > max_width or height > max_height:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Kich thuoc anh ({width}x{height}) vuot qua "
                    f"gioi han ({max_width}x{max_height})",
                )
            # Reset file pointer
            file.file.seek(0)
        except ImportError:
            pass  # PIL khong cai dat
        except HTTPException:
            raise
        except Exception:
            pass  # Khong phai anh


# ============================================================
# PRE-CONFIGURED GUARDS
# ============================================================

def get_qr_upload_guard() -> UploadGuard:
    """Guard cho upload anh QR (tu mobile app)."""
    return UploadGuard(
        max_size_mb=10,
        allowed_types=["image/jpeg", "image/png", "image/webp"],
        scan_content=True,
    )


def get_document_upload_guard() -> UploadGuard:
    """Guard cho upload tai lieu (Word/PDF)."""
    return UploadGuard(
        max_size_mb=25,
        allowed_types=[
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        scan_content=True,
    )


def get_avatar_upload_guard() -> UploadGuard:
    """Guard cho upload avatar nguoi dung."""
    return UploadGuard(
        max_size_mb=2,
        allowed_types=["image/jpeg", "image/png", "image/webp"],
        scan_content=True,
    )
