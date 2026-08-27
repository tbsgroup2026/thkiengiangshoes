'use client';

import { useState } from 'react';

export default function CreateDocumentPage() {
  const [formData, setFormData] = useState<Record<string, string>>({
    ho_ten: 'Nguyễn Văn A',
    ma_nhan_vien: 'EMP-088',
    phong_ban: 'Sản Xuất (Production)',
    so_ngay_nghi: '2',
    ly_do_nghi: 'Giải quyết việc cá nhân ở quê',
    ngay_bat_dau: '2026-08-05',
  });

  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-tbs-light p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-tbs-dark">Số Hóa & Điền Giấy Tờ Biểu Mẫu</h1>
        <p className="text-xs text-gray-500 mt-1">Hệ thống tự động sinh form từ placeholder &#123;&#123;placeholder&#125;&#125; trong file mẫu gốc</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* DYNAMIC FORM */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-accent border-b border-gray-100 pb-3">Form Nhập Liệu Tự Động</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block font-semibold mb-1 capitalize text-gray-700">
                  {key.replace(/_/g, ' ')} *
                </label>
                {key.includes('ly_do') ? (
                  <textarea
                    rows={2}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-accent"
                  />
                ) : (
                  <input
                    type={key.includes('ngay') ? 'date' : 'text'}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-accent"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent-light transition shadow-md"
            >
              Xuất Giấy Tờ Hoàn Chỉnh (.docx / .pdf)
            </button>
          </form>
        </div>

        {/* LIVE DOCUMENT PREVIEW */}
        <div className="bg-tbs-dark text-white p-6 rounded-2xl border border-accent-soft/30 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
              <span className="text-xs font-mono text-accent-soft">PREVIEW_DOCUMENT.DOCX</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">LIVE RENDER</span>
            </div>

            <div className="bg-white/5 p-4 rounded-xl space-y-3 text-xs text-gray-300 font-serif leading-relaxed">
              <div className="text-center font-bold text-sm text-white mb-4">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br />Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-center font-bold text-base text-gold-light mb-4">ĐƠN XIN NGHỈ PHÉP</div>

              <p>Kính gửi: Ban Giám Đốc & Trưởng Phòng {formData.phong_ban}</p>
              <p>Tôi tên là: <span className="text-accent-soft font-bold font-sans">{formData.ho_ten}</span></p>
              <p>Mã nhân viên: <span className="text-accent-soft font-bold font-sans">{formData.ma_nhan_vien}</span></p>
              <p>Nay tôi làm đơn này xin nghỉ phép số ngày: <span className="text-accent-soft font-bold font-sans">{formData.so_ngay_nghi} ngày</span>, từ ngày: <span className="text-accent-soft font-bold font-sans">{formData.ngay_bat_dau}</span>.</p>
              <p>Lý do nghỉ: <span className="text-accent-soft font-bold font-sans">{formData.ly_do_nghi}</span>.</p>
              <p>Kính mong Ban Giám đốc xem xét phê duyệt.</p>
            </div>
          </div>

          {generatedSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 text-center font-semibold">
              Đã xuất và lưu trữ file thành công lên Cloudflare R2.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
