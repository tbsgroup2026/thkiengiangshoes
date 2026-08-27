"""
TBS II — Sanitizer (XSS Prevention cho BI Dashboard & Response)
================================================================
Chong XSS cho du lieu hien thi len BI dashboard.
Mo rong validators.py co san — KHONG thay the.

Su dung:
  from security.sanitizer import (
      sanitize_html, sanitize_dashboard_data, sanitize_url,
      strip_dangerous_tags, SanitizerConfig
  )

  # Cho BI dashboard data:
  safe_data = sanitize_dashboard_data(raw_user_input)

  # Cho HTML response:
  safe_html = sanitize_html(user_content)
"""

import re
import html
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass
from enum import Enum


class SanitizeMode(Enum):
    STRICT = "strict"      # Strip ALL HTML, chi giu text
    ALLOW_BASIC = "basic"  # Cho phep <b><i><u><p><br><ul><ol><li>
    DASHBOARD = "dashboard"  # Mode cho BI dashboard — triet de


@dataclass
class SanitizerConfig:
    mode: SanitizeMode = SanitizeMode.STRICT
    max_length: int = 10000
    strip_null_bytes: bool = True
    normalize_unicode: bool = True
    allow_urls: bool = False


# ============================================================
# XSS PATTERNS TO STRIP
# ============================================================

# Event handlers (onclick, onerror, onload, ...)
EVENT_HANDLER_PATTERN = re.compile(
    r'\bon\w+\s*=\s*["\'][^"\']*["\']|\bon\w+\s*=\s*[^\s>]+',
    re.IGNORECASE,
)

# Javascript protocol
JAVASCRIPT_PATTERN = re.compile(
    r'javascript\s*:', re.IGNORECASE
)

# Data URI voi script
DATA_URI_SCRIPT_PATTERN = re.compile(
    r'data\s*:\s*text\/html', re.IGNORECASE
)

# CSS expression (IE)
CSS_EXPRESSION_PATTERN = re.compile(
    r'expression\s*\(', re.IGNORECASE
)

# Script tags
SCRIPT_PATTERN = re.compile(
    r'<script[^>]*>.*?</script>', re.IGNORECASE | re.DOTALL
)

# Inline style voi url/javacript
INLINE_STYLE_DANGEROUS = re.compile(
    r'style\s*=\s*["\'][^"\']*(?:url|javascript|expression|behavior)[^"\']*["\']',
    re.IGNORECASE,
)

# Meta refresh redirect
META_REFRESH_PATTERN = re.compile(
    r'<meta[^>]*http-equiv\s*=\s*["\']?refresh["\']?[^>]*>',
    re.IGNORECASE,
)

# Object/embed tags
OBJECT_EMBED_PATTERN = re.compile(
    r'<(?:object|embed|applet|iframe|frame|frameset)[^>]*>.*?</(?:object|embed|applet|iframe|frame|frameset)>',
    re.IGNORECASE | re.DOTALL,
)

# Comment injection
COMMENT_INJECTION_PATTERN = re.compile(
    r'<!--.*?-->', re.DOTALL
)


# ============================================================
# SANITIZATION FUNCTIONS
# ============================================================

def _strip_null_bytes(text: str) -> str:
    """Xoa null bytes — tranh null byte injection."""
    return text.replace('\x00', '')


def _normalize_unicode(text: str) -> str:
    """Chuan hoa Unicode — tranh homoglyph attacks."""
    import unicodedata
    return unicodedata.normalize('NFKC', text)


def strip_dangerous_tags(html_text: str) -> str:
    """
    Xoa cac the HTML nguy hiem nhung giu lai noi dung text ben trong.
    """
    if not html_text:
        return ""

    # Remove script tags (ca noi dung)
    result = SCRIPT_PATTERN.sub('', html_text)

    # Remove object/embed/iframe (ca noi dung)
    result = OBJECT_EMBED_PATTERN.sub('', result)

    # Remove meta refresh
    result = META_REFRESH_PATTERN.sub('', result)

    # Remove event handlers
    result = EVENT_HANDLER_PATTERN.sub('', result)

    # Remove javascript: URLs
    result = JAVASCRIPT_PATTERN.sub('', result)

    # Remove CSS expressions
    result = CSS_EXPRESSION_PATTERN.sub('', result)

    # Remove inline styles with dangerous content
    result = INLINE_STYLE_DANGEROUS.sub('', result)

    # Remove data:text/html
    result = DATA_URI_SCRIPT_PATTERN.sub('', result)

    # Remove HTML comments
    result = COMMENT_INJECTION_PATTERN.sub('', result)

    return result.strip()


def sanitize_html(text: str, config: Optional[SanitizerConfig] = None) -> str:
    """
    Sanitize HTML input — mac dinh STRICT mode (strip tat ca HTML).
    """
    if not text:
        return ""

    cfg = config or SanitizerConfig()

    if cfg.strip_null_bytes:
        text = _strip_null_bytes(text)

    if cfg.normalize_unicode:
        text = _normalize_unicode(text)

    if cfg.mode == SanitizeMode.STRICT:
        # Strip EVERYTHING, chi giu text
        # Remove all HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        # HTML entity decode + re-encode de sach
        text = html.escape(html.unescape(text))
        # Trim
        text = text.strip()

    elif cfg.mode == SanitizeMode.ALLOW_BASIC:
        # Strip dangerous tags first
        text = strip_dangerous_tags(text)
        # Cho phep basic formatting tags, strip con lai
        allowed_tags = ['b', 'i', 'u', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'h3', 'h4']
        # Strip tat ca the khong duoc phep
        for tag in re.findall(r'</?(\w+)', text):
            if tag.lower() not in allowed_tags:
                text = re.sub(
                    rf'</?{re.escape(tag)}[^>]*>', '', text, flags=re.IGNORECASE
                )

    elif cfg.mode == SanitizeMode.DASHBOARD:
        # Aggressive sanitization cho BI dashboard
        text = strip_dangerous_tags(text)
        text = re.sub(r'<[^>]+>', '', text)  # Strip ALL HTML
        text = html.escape(text)
        text = text.strip()

    # Truncate if too long
    if len(text) > cfg.max_length:
        text = text[: cfg.max_length]

    return text


def sanitize_dashboard_data(data: Any) -> Any:
    """
    Sanitize du lieu truoc khi hien thi len BI dashboard.
    Xu ly ca string, dict, list, nested objects.
    """
    if isinstance(data, str):
        return sanitize_html(
            data,
            SanitizerConfig(mode=SanitizeMode.DASHBOARD, max_length=1000),
        )

    if isinstance(data, dict):
        return {k: sanitize_dashboard_data(v) for k, v in data.items()}

    if isinstance(data, list):
        return [sanitize_dashboard_data(item) for item in data]

    # Numbers, bool, None — pass through
    return data


def sanitize_url(url: str) -> str:
    """
    Validate va sanitize URL — chi cho phep http/https.
    """
    if not url:
        return ""

    url = url.strip()

    # Block javascript: protocol
    if re.match(r'^\s*javascript\s*:', url, re.IGNORECASE):
        return ""

    # Block data: protocol
    if re.match(r'^\s*data\s*:', url, re.IGNORECASE):
        return ""

    # Chi cho phep http/https
    if not url.lower().startswith(('http://', 'https://')):
        return ""

    # HTML encode URL
    url = html.escape(url, quote=True)

    if len(url) > 2048:
        return ""

    return url


def escape_json_for_html(data: Any) -> str:
    """
    Escape JSON data de nhung an toan vao HTML attribute.
    Tranh XSS qua JSON injection.
    """
    import json
    json_str = json.dumps(data, ensure_ascii=False)
    # Escape HTML entities
    json_str = json_str.replace('&', '\\u0026')
    json_str = json_str.replace('<', '\\u003c')
    json_str = json_str.replace('>', '\\u003e')
    json_str = json_str.replace("'", '\\u0027')
    return json_str


def safe_text_length(text: str, max_length: int = 5000) -> str:
    """
    Cat text an toan, khong cat giua chung ky tu Unicode.
    """
    if not text:
        return ""
    if len(text) <= max_length:
        return text
    # Tim diem cat an toan (space hoac newline)
    cut_point = max_length
    for i in range(max_length - 1, max(0, max_length - 100), -1):
        if text[i] in (' ', '\n', '\t', '.', '。', '、', ','):
            cut_point = i + 1
            break
    return text[:cut_point] + '…'
