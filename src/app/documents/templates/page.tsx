'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DocumentTemplatesPage() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      title: 'Đơn Xin Nghỉ Phép',
      dept: 'Nhân Sự (HR)',
      docType: 'docx',
      placeholders: ['ho_ten', 'ma_nhan_vien', 'phong_ban', 'so_ngay_nghi', 'ly_do_nghi', 'ngay_bat_dau'],
      createdAt: '2026-08-01',
    },
    {
      id: 2,
      title: 'Giấy Đề Xuất Mua Phụ Tùng Máy',
      dept: 'Bảo Trì - Kỹ Thuật',
      docType: 'docx',
      placeholders: ['ma_may', 'ten_phu_tung', 'so_luong', 'don_gia_du_kien', 'ly_do_thay'],
      createdAt: '2026-08-01',
    },
    {
      id: 3,
      title: 'Biên Bản Kiểm Tra Chất Lượng (QC)',
      dept: 'QC',
      docType: 'pdf',
      placeholders: ['ma_lo_hang', 'ten_san_pham', 'so_luong_dat', 'so_luong_loi', 'nguoi_kiem_tra'],
      createdAt: '2026-08-01',
    },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Nhân Sự (HR)');
  const [detectedKeys, setDetectedKeys] = useState<string[]>([]);
  const [ocrWarning, setOcrWarning] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.pdf')) {
      // Simulate OCR warning or extraction
      setOcrWarning(true);
    } else {
      setOcrWarning(false);
    }

    // Auto detect placeholders from document
    setDetectedKeys(['ho_ten', 'ma_nhan_vien', 'phong_ban', 'ngay_tai_tao', 'ly_do']);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setTemplates([
      ...templates,
      {
        id: templates.length + 1,
        title: newTitle || 'Mẫu Biểu Mới',
        dept: newDept,
        docType: ocrWarning ? 'pdf (OCR)' : 'docx',
        placeholders: detectedKeys,
        createdAt: new Date().toISOString().split('T')[0],
      },
    ]);
    setShowUploadModal(false);
    setNewTitle('');
    setDetectedKeys([]);
    setOcrWarning(false);
  };

  return (
    <div className="min-h-screen bg-tbs-light p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">Thư Viện Biểu Mẫu Số Hóa</h1>
          <p className="text-xs text-gray-500 mt-1">Upload file Word/PDF mẫu, tự động dò placeholder và sinh form nhập liệu</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/documents/create"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d9b96a] to-gold-light text-tbs-dark text-xs font-bold shadow-md"
          >
            Điền giấy tờ mới
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light transition shadow-md"
          >
            + Upload Mẫu File Mới (.docx / .pdf)
          </button>
        </div>
      </div>

      {/* TEMPLATES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-accent">
                {tpl.dept}
              </span>
              <span className="text-[11px] font-mono text-gray-400 uppercase">{tpl.docType}</span>
            </div>
            <h3 className="text-lg font-bold text-tbs-dark">{tpl.title}</h3>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">Placeholder Tự Động Dò ({tpl.placeholders.length}):</div>
              <div className="flex flex-wrap gap-1.5">
                {tpl.placeholders.map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-mono text-gray-700">
                    &#123;&#123;{p}&#125;&#125;
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-400">Ngày tạo: {tpl.createdAt}</span>
              <Link href={`/documents/create?templateId=${tpl.id}`} className="text-accent font-bold hover:underline">
                Điền Mẫu →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD TEMPLATE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-tbs-dark">Upload File Mẫu Mới (.docx / .pdf)</h2>
            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tên Tên Mẫu Giấy Tờ *</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Đề Xuất Tăng Ca Nhà Máy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phòng Ban Quản Lý</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-accent"
                >
                  <option value="Nhân Sự (HR)">Nhân Sự (HR)</option>
                  <option value="Bảo Trì - Kỹ Thuật">Bảo Trì - Kỹ Thuật</option>
                  <option value="QC">Kiểm Soát Chất Lượng (QC)</option>
                  <option value="Sản Xuất">Sản Xuất</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Chọn File Word hoặc PDF *</label>
                <input
                  type="file"
                  accept=".docx,.pdf"
                  onChange={handleSimulatedUpload}
                  className="w-full p-2 rounded-lg border border-dashed border-gray-300 bg-gray-50"
                />
              </div>

              {ocrWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl space-y-1">
                  <div className="font-bold">Phát hiện File PDF dạng ảnh scan</div>
                  <p>Hệ thống tự động kích hoạt chế độ OCR (Tesseract Text Extractor) để nhận diện chữ và placeholder.</p>
                </div>
              )}

              {detectedKeys.length > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
                  <div className="font-bold mb-1">Đã phát hiện {detectedKeys.length} placeholder:</div>
                  <div className="flex flex-wrap gap-1">
                    {detectedKeys.map((k) => (
                      <span key={k} className="px-2 py-0.5 bg-emerald-200 text-tbs-dark font-mono text-[10px] rounded">
                        &#123;&#123;{k}&#125;&#125;
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-accent text-white font-bold hover:bg-accent-light"
                >
                  Lưu Vào Thư Viện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
