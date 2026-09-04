"use client";

import React, { useState } from "react";
import NavLink from "@/components/NavLink";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  IconHelpCircle,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconFileText,
  IconPhoneCall,
  IconMail,
  IconBuildingBank,
} from "@tabler/icons-react";

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const faqs = [
    {
      q: "Hệ thống Quản trị Tổ hợp Kiên Giang - TBS Group có những phân hệ nào?",
      a: "Hệ thống gồm 10 phân hệ số hóa toàn diện: Quản trị Nhân sự & Tuyển dụng, Tài chính - Kế toán chuỗi, Lịch công tác & Di chuyển, Đặt phòng họp thông minh, Quản lý R&D phát triển mẫu, Kiểm soát chất lượng (QC), Quản lý tài sản & máy móc thiết bị, Quản trị văn bản & phê duyệt điện tử, Báo cáo BI & KPI điều hành.",
    },
    {
      q: "Quy trình lập và phê duyệt Phiếu Chi / Thanh toán công tác phí diễn ra như thế nào?",
      a: "Quy trình gồm 4 cấp độ: (1) Cán bộ nhân viên lập đề xuất & đính kèm hóa đơn chứng từ VAT -> (2) Trưởng bộ phận duyệt cấp 1 -> (3) Kế toán kiểm tra đối chiếu mã số thuế & hợp đồng -> (4) Giám đốc tài chính / Ban Tổng Giám Đốc ký duyệt điện tử và chuyển ngân hàng chi trả tự động.",
    },
    {
      q: "Làm thế nào để đính kèm và kiểm tra tính hợp lệ của hóa đơn điện tử XML?",
      a: "Tại phân hệ Hóa đơn (hoặc trực tiếp tại Bảng danh sách chuyến công tác), người dùng nhấn nút 'Import Hóa Đơn' và tải lên tệp XML/PDF. Hệ thống tự động kiểm tra chữ ký số CQT và đối chiếu số tiền với chứng từ thanh toán.",
    },
    {
      q: "Thời gian hoàn ứng công tác quy định trong bao lâu sau khi kết thúc chuyến đi?",
      a: "Theo quy chế tài chính TBS Group, trong vòng tối đa 05 ngày làm việc kể từ ngày kết thúc chuyến công tác, cán bộ nhân viên cần hoàn tất 'Giấy đề nghị thanh toán hoàn ứng' kèm theo đầy đủ hóa đơn chứng từ hợp lệ trên hệ thống.",
    },
    {
      q: "Tôi cần hỗ trợ kỹ thuật hoặc cấp quyền tài khoản thì liên hệ bộ phận nào?",
      a: "Vui lòng gửi email đến it.support@tbsgroup.vn hoặc liên hệ Tổng đài nội bộ Tổ hợp Kiên Giang - TBS Group: (0274) 3788 888 (Ext: 102 - Khối CNTT & Chuyển đổi số).",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006838] text-xs font-black uppercase tracking-wider">
            <IconHelpCircle size={15} />
            <span>Trung tâm trợ giúp &amp; Hỏi đáp</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Câu Hỏi Thường Gặp (FAQ)
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Giải đáp mọi thắc mắc về quy trình vận hành, kế toán, duyệt đơn và sử dụng hệ thống TBS Group
          </p>

          <div className="relative pt-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm câu hỏi hoặc từ khóa quy định..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-900 shadow-xs outline-none focus:border-[#006838]"
            />
            <IconSearch size={18} className="absolute left-3.5 top-5 text-slate-400" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold">
              Không tìm thấy câu hỏi phù hợp với từ khóa của bạn.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-4.5 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {faq.q}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                      {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-emerald-100/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="bg-gradient-to-r from-[#006838] to-[#004d29] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-black tracking-tight">Bạn vẫn cần thêm sự trợ giúp?</h3>
            <p className="text-xs text-emerald-100 font-medium">
              Đội ngũ Hỗ trợ Kỹ thuật &amp; Kế toán Chuỗi luôn sẵn sàng giải đáp 24/7.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NavLink
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-white text-[#006838] font-black text-xs hover:bg-emerald-50 transition-all shadow-xs"
            >
              Liên hệ Hotline
            </NavLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
