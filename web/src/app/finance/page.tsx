"use client";

import React, { useState, useEffect, Suspense } from "react";
import NavLink from "@/components/NavLink";
import { useSearchParams, useRouter } from "next/navigation";
import FinanceShell from "@/components/FinanceShell";
import { usePermission } from "@/hooks/usePermission";

import {
  IconCoins,
  IconClock,
  IconTrendingUp,
  IconAdjustmentsHorizontal,
  IconWallet,
  IconFileInvoice,
  IconUsers,
  IconCalendarEvent,
  IconChartPie,
  IconDeviceDesktop,
  IconPackage,
  IconArrowsRightLeft,
  IconShieldCheck,
  IconChartBar,
  IconArrowRight,
  IconPlus,
  IconCalculator,
  IconPaperclip,
  IconCheck,
  IconSend,
  IconRefresh,
  IconDatabase,
  IconSearch,
  IconPrinter,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

interface FinanceTransaction {
  id: string;
  type: string;
  typeCode: "thu" | "chi" | "tam_ung" | "hoan_ung" | "hoa_don" | "cong_no";
  date: string;
  party: string;
  dept: string;
  debit: string;
  credit: string;
  amount: number;
  note: string;
  status: string;
  statusColor: string;
}


const MODULES = [
  {
    href: "/finance/thu-chi",
    icon: IconWallet,
    title: "1. 💰 Thu – Chi",
    badge: "8 phiếu T8",
    desc: ["Tạo phiếu thu / Tạo phiếu chi", "Tạm ứng / Hoàn ứng", "Theo dõi quỹ tiền mặt & NH", "Duyệt phiếu thu/chi & Lịch sử"],
  },
  {
    href: "/finance/hoa-don",
    icon: IconFileInvoice,
    title: "2. 🧾 Hóa đơn & Chứng từ",
    badge: "47 HĐ T8",
    desc: ["Hóa đơn đầu vào & đầu ra", "Nhập & tra cứu hóa đơn", "Đính kèm chứng từ điện tử", "Đối chiếu hóa đơn - Phiếu chi"],
  },
  {
    href: "/finance/cong-no",
    icon: IconUsers,
    title: "3. 🤝 Công nợ",
    badge: "2 quá hạn",
    desc: ["Công nợ phải trả & phải thu", "Danh sách đối tác & NCC", "Theo dõi hạn & quá hạn", "Cảnh báo & đối chiếu công nợ"],
  },
  {
    href: "/finance/ngan-sach",
    icon: IconCalendarEvent,
    title: "4. 📊 Ngân sách",
    badge: "1 PB vượt NS",
    desc: ["Lập & phân bổ ngân sách", "Ngân sách theo PB / Đơn vị", "Theo dõi Budget / Actual", "Cảnh báo vượt & điều chỉnh"],
  },
  {
    href: "/finance/chi-phi",
    icon: IconChartPie,
    title: "5. 💸 Chi phí",
    badge: "1.77 tỷ đ",
    desc: ["Chi phí văn phòng, nhân sự", "Chi phí công tác & R&D", "Chi phí mua sắm & dịch vụ", "Chi phí thuê mặt bằng & vận hành"],
  },
  {
    href: "/finance/tai-san",
    icon: IconDeviceDesktop,
    title: "6. 🏢 Tài sản",
    badge: "1 TS sửa",
    desc: ["Danh sách tài sản & cấp phát", "Bàn giao & điều chuyển TS", "Kiểm kê & theo dõi khấu hao", "Tài sản hư hỏng & thanh lý"],
  },
  {
    href: "/finance/vat-tu-kho",
    icon: IconPackage,
    title: "7. 📦 Vật tư & Kho",
    badge: "2 tồn thấp",
    desc: ["Nhập kho / Xuất kho", "Điều chuyển & kiểm kê kho", "Theo dõi nhập - xuất - tồn", "Cảnh báo tồn kho thấp"],
  },
  {
    href: "/finance/doi-soat",
    icon: IconArrowsRightLeft,
    title: "8. 🔄 Đối soát",
    badge: "3 chênh lệch",
    desc: ["Đối soát thu chi & ngân hàng", "Đối soát hóa đơn & công nợ", "Đối soát chứng từ & NS", "Ghi nhận nguyên nhân lệch"],
  },
  {
    href: "/finance/phe-duyet",
    icon: IconShieldCheck,
    title: "9. ✅ Phê duyệt",
    badge: "2 chờ duyệt",
    desc: ["Quy trình workflow 4 cấp", "Duyệt phiếu chi & tạm ứng", "Duyệt đề nghị mua sắm", "Duyệt điều chỉnh ngân sách"],
  },
  {
    href: "/finance/bao-cao",
    icon: IconChartBar,
    title: "10. 📈 Báo cáo quản trị",
    badge: "8 báo cáo",
    desc: ["BC Thu-Chi & Chi phí", "BC Ngân sách & Công nợ", "BC Tài sản, Kho & Dòng tiền", "Xuất file Excel/PDF định kỳ"],
  },
];

function FinanceHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canEditModule, isExecutiveOrAdmin, user } = usePermission();
  const isFinanceEditor = canEditModule("finance");

  const tabParam = searchParams.get("tab");
  const [activeMainTab, setActiveMainTab] = useState<"desk" | "overview">(
    tabParam === "overview" ? "overview" : "desk"
  );

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab === "overview") {
      setActiveMainTab("overview");
    } else {
      setActiveMainTab("desk");
    }
  }, [searchParams]);

  const switchTab = (tab: "desk" | "overview") => {
    setActiveMainTab(tab);
    router.push(`/finance?tab=${tab}`, { scroll: false });
  };

  // Accounting Desk State
  const [finEntryType, setFinEntryType] = useState<"thu" | "chi" | "tam_ung" | "hoan_ung" | "hoa_don" | "cong_no">("thu");
  const [finForm, setFinForm] = useState({
    code: "PT-2026-0818",
    date: "2026-08-17",
    party: "Công ty Da Giày TBS - Skechers",
    dept: "Sản Xuất (Nhà Máy 1)",
    accountDebit: "1111",
    accountCredit: "5111",
    amount: "45000000",
    note: "Thu tiền bán hàng chuyển Skechers ca 1",
    attachment: "Chung-tu-kem-theo.pdf",
  });

  const [finTransactions, setFinTransactions] = useState<FinanceTransaction[]>([
    {
      id: "PT-2026-0818",
      type: "Thu",
      typeCode: "thu",
      date: "2026-08-17",
      party: "SKECHERS USA Inc.",
      dept: "Kinh Doanh & Xuất Khẩu",
      debit: "1121 - VCB",
      credit: "1311 - Phải thu KH",
      amount: 450000000,
      note: "Thanh toán đợt 1 hợp đồng xuất khẩu giày Skechers Foamies",
      status: "Đã ghi sổ",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "PC-2026-0817",
      type: "Chi",
      typeCode: "chi",
      date: "2026-08-17",
      party: "Công ty CP Vật Liệu Đế TBS",
      dept: "Sản Xuất (NM1)",
      debit: "3311 - Phải trả NCC",
      credit: "1121 - VCB",
      amount: 185000000,
      note: "Chi tiền mua đế cao su đúc nguyên khối cho lô D'Lites",
      status: "Đã duyệt",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "TU-2026-0816",
      type: "Tạm ứng",
      typeCode: "tam_ung",
      date: "2026-08-16",
      party: "Trần Minh Quang (QC Lead)",
      dept: "Quản Lý Chất Lượng (QC)",
      debit: "1411 - Tạm ứng NV",
      credit: "1111 - Tiền mặt",
      amount: 15000000,
      note: "Tạm ứng chi phí công tác kiểm định chất lượng tại Nhà máy 3",
      status: "Chờ duyệt",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "HD-2026-0815",
      type: "Hóa đơn",
      typeCode: "hoa_don",
      date: "2026-08-15",
      party: "Điện Lực Bình Dương",
      dept: "Hành Chánh - Quản Trị",
      debit: "6427 - CP dịch vụ",
      credit: "3311 - Phải trả NCC",
      amount: 68500000,
      note: "Hóa đơn tiền điện trạm biến áp xưởng sản xuất tháng 07/2026",
      status: "Đã đối chiếu",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "CN-2026-0814",
      type: "Công nợ",
      typeCode: "cong_no",
      date: "2026-08-14",
      party: "Tập Đoàn Hóa Chất TexChem",
      dept: "R&D Phát Triển",
      debit: "1521 - Nguyên liệu",
      credit: "3311 - Phải trả NCC",
      amount: 230000000,
      note: "Ghi nhận công nợ keo dán Eco thân thiện môi trường",
      status: "Đến hạn TT",
      statusColor: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ]);

  const [finFilterTab, setFinFilterTab] = useState<string>("all");
  const [finSearchText, setFinSearchText] = useState<string>("");
  const [isFinPrintModalOpen, setIsFinPrintModalOpen] = useState(false);
  const [selectedFinItem, setSelectedFinItem] = useState<FinanceTransaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveFinEntry = (isSubmitForApproval = false) => {
    if (!isFinanceEditor) {
      showToast("🔒 Bạn đang ở chế độ Chỉ Xem! Chỉ Kế Toán & Ban Giám Đốc mới có quyền ghi sổ / hạch toán tài chính.");
      return;
    }
    if (!finForm.amount || Number(finForm.amount) <= 0) {
      showToast("⚠️ Vui lòng nhập số tiền hợp lệ!");
      return;
    }

    const typeLabelMap: Record<string, string> = {
      thu: "Thu",
      chi: "Chi",
      tam_ung: "Tạm ứng",
      hoan_ung: "Hoàn ứng",
      hoa_don: "Hóa đơn",
      cong_no: "Công nợ",
    };
    const newEntry: FinanceTransaction = {
      id: finForm.code || `CT-${Date.now().toString().slice(-6)}`,
      type: typeLabelMap[finEntryType] || "Thu",
      typeCode: finEntryType,
      date: finForm.date || new Date().toISOString().slice(0, 10),
      party: finForm.party || "Đối tác TBS",
      dept: finForm.dept || "Sản Xuất",
      debit: finForm.accountDebit,
      credit: finForm.accountCredit,
      amount: Number(finForm.amount),
      note: finForm.note || "Giao dịch phát sinh",
      status: isSubmitForApproval ? "Chờ duyệt" : "Đã ghi sổ",
      statusColor: isSubmitForApproval
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    setFinTransactions([newEntry, ...finTransactions]);
    showToast(isSubmitForApproval ? "⚡ Đã lưu và chuyển chứng từ sang hàng đợi Phê Duyệt!" : "💾 Đã ghi sổ chứng từ thành công vào hệ thống D1!");

    // Reset form code
    const prefix = finEntryType === "thu" ? "PT" : finEntryType === "chi" ? "PC" : finEntryType === "tam_ung" ? "TU" : finEntryType === "hoa_don" ? "HD" : "CN";
    setFinForm({
      ...finForm,
      code: `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: "",
      note: "",
    });
  };

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: activeMainTab === "desk" ? "Bàn làm việc nhập liệu" : "Tổng quan phân hệ" },
      ]}
      activeSubmenu={activeMainTab === "overview" ? "Tổng quan 10 phân hệ" : "Bàn làm việc kế toán"}
    >
      {/* ════════ MAIN TAB SWITCHER NAVIGATION ════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => switchTab("desk")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === "desk"
                ? "bg-white text-[#006838] shadow-xs border border-emerald-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <IconCalculator size={16} className={activeMainTab === "desk" ? "text-[#006838]" : "text-slate-500"} />
            <span>Bàn Làm Việc Nhập Liệu (D1 Live)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => switchTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === "overview"
                ? "bg-white text-[#006838] shadow-xs border border-emerald-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <IconChartBar size={16} className={activeMainTab === "overview" ? "text-[#006838]" : "text-slate-500"} />
            <span>Tổng Quan KPI &amp; 10 Phân Hệ</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            href="/finance/thu-chi?tab=chi"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-200 text-xs font-black transition-all flex items-center gap-1.5"
          >
            <IconPlus size={15} />
            <span>Form Phiếu Chi Chuẩn Mẫu ERP</span>
          </NavLink>
        </div>
      </div>

      {/* ════════ TAB 1: BÀN LÀM VIỆC KẾ TOÁN & NHẬP LIỆU NGHIỆP VỤ ════════ */}
      {activeMainTab === "desk" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {!isFinanceEditor && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🔒</span>
                <span><b>Chế độ Chỉ Xem (Read-Only):</b> Tài khoản <b>{user?.name || "Bộ phận khác"}</b> ({user?.title || "Ngoài ngành Kế toán"}) chỉ có quyền xem dữ liệu. Quyền tạo &amp; duyệt hạch toán chỉ dành riêng cho <b>Kế Toán &amp; Ban Giám Đốc</b>.</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 text-amber-950 text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                Chỉ Xem
              </span>
            </div>
          )}

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">

            {/* Header Desk */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
                  <IconCalculator size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                      {isFinanceEditor ? "Bàn Làm Việc Kế Toán & Nhập Liệu Nghiệp Vụ" : "Cổng Đề Xuất Tạm Ứng & Tra Cứu Tài Chính Cá Nhân"}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#006838] border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
                      {isFinanceEditor ? "D1 Cloud Live" : "Cá Nhân CBCNV"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isFinanceEditor
                      ? "Hạch toán chứng từ nhanh, phát sinh bút toán Nợ/Có và lưu trữ vào sổ nhật ký kế toán TBS"
                      : "Nộp đơn đề xuất tạm ứng công tác/chi phí và tra cứu kết quả báo cáo thu nhập cá nhân"}
                  </p>
                </div>
              </div>

              {/* Top quick links */}
              <div className="flex items-center gap-2">
                <NavLink
                  href="/finance/thu-chi"
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#006838] border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <IconWallet size={14} />
                  <span>Sổ Quỹ</span>
                </NavLink>
                <NavLink
                  href="/finance/hoa-don"
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#006838] border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <IconFileInvoice size={14} />
                  <span>Hóa Đơn</span>
                </NavLink>
                <NavLink
                  href="/finance/cong-no"
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#006838] border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <IconUsers size={14} />
                  <span>Công Nợ</span>
                </NavLink>
              </div>
            </div>

            {/* Operation Switcher Tabs */}
            {isFinanceEditor ? (
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200/80 overflow-x-auto">
                {[
                  { key: "thu", label: "💰 Phiếu Thu (PT)", prefix: "PT", debit: "1111", credit: "5111" },
                  { key: "chi", label: "💸 Phiếu Chi (PC)", prefix: "PC", debit: "3311", credit: "1121" },
                  { key: "tam_ung", label: "📑 Tạm Ứng (TU)", prefix: "TU", debit: "1411", credit: "1111" },
                  { key: "hoan_ung", label: "🔄 Hoàn Ứng (HU)", prefix: "HU", debit: "1111", credit: "1411" },
                  { key: "hoa_don", label: "🧾 Hóa Đơn VAT (HĐ)", prefix: "HD", debit: "6427", credit: "3311" },
                  { key: "cong_no", label: "🤝 Ghi Nhận Công Nợ (CN)", prefix: "CN", debit: "1521", credit: "3311" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setFinEntryType(tab.key as any);
                      setFinForm({
                        ...finForm,
                        code: `${tab.prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                        accountDebit: tab.debit,
                        accountCredit: tab.credit,
                      });
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      finEntryType === tab.key
                        ? "bg-white text-[#006838] shadow-xs border border-emerald-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006838] text-xs font-bold flex items-center justify-between">
                <span>📑 Form Đề Xuất Tạm Ứng Chi Phí / Thanh Toán Cá Nhân CBCNV</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300">Tài Khoản: {user?.name}</span>
              </div>
            )}


            {/* Direct Entry Form Grid */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Field 1: Mã chứng từ */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">Mã chứng từ / Bút toán</label>
                    <button
                      type="button"
                      onClick={() => {
                        const prefix = finEntryType === "thu" ? "PT" : finEntryType === "chi" ? "PC" : finEntryType === "tam_ung" ? "TU" : finEntryType === "hoa_don" ? "HD" : "CN";
                        setFinForm({ ...finForm, code: `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}` });
                      }}
                      className="text-[10px] font-bold text-[#006838] hover:underline cursor-pointer"
                    >
                      Tạo mã mới ↺
                    </button>
                  </div>
                  <input
                    type="text"
                    value={finForm.code}
                    onChange={(e) => setFinForm({ ...finForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white shadow-2xs"
                    placeholder="PT-2026-0818"
                  />
                </div>

                {/* Field 2: Ngày ghi sổ */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Ngày hạch toán / Ghi sổ</label>
                  <input
                    type="date"
                    value={finForm.date}
                    onChange={(e) => setFinForm({ ...finForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white shadow-2xs"
                  />
                </div>

                {/* Field 3: Đối tượng */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    {finEntryType === "thu"
                      ? "Người nộp / Khách hàng"
                      : finEntryType === "chi"
                      ? "Người nhận / Nhà cung cấp"
                      : finEntryType === "tam_ung" || finEntryType === "hoan_ung"
                      ? "Cán bộ / Nhân viên tạm ứng"
                      : "Đơn vị / Đối tác xuất hóa đơn"}
                  </label>
                  <input
                    type="text"
                    value={finForm.party}
                    onChange={(e) => setFinForm({ ...finForm, party: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white shadow-2xs"
                    placeholder="Công ty Da Giày TBS - Skechers..."
                  />
                </div>

                {/* Field 4: Bộ phận */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Bộ phận / Phân xưởng</label>
                  <select
                    value={finForm.dept}
                    onChange={(e) => setFinForm({ ...finForm, dept: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white shadow-2xs cursor-pointer"
                  >
                    <option value="Sản Xuất (NM1)">Sản Xuất (Nhà Máy 1)</option>
                    <option value="Sản Xuất (NM2)">Sản Xuất (Nhà Máy 2)</option>
                    <option value="Sản Xuất (NM3)">Sản Xuất (Nhà Máy 3)</option>
                    <option value="R&D Phát Triển Mẫu">R&amp;D (Phát Triển Mẫu)</option>
                    <option value="Quản Lý Chất Lượng (QC)">Quản Lý Chất Lượng (QC)</option>
                    <option value="CN-CI Cải Tiến">CN-CI (Kỹ Thuật &amp; Cải Tiến)</option>
                    <option value="Hành Chánh - Quản Trị">Hành Chánh - Quản Trị</option>
                    <option value="Kinh Doanh & Xuất Khẩu">Kinh Doanh &amp; Xuất Khẩu</option>
                    <option value="Logistics & Kho Vận">Logistics &amp; Kho Vận</option>
                  </select>
                </div>

                {/* Field 5: Số tiền */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Số tiền phát sinh (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={finForm.amount}
                      onChange={(e) => setFinForm({ ...finForm, amount: e.target.value })}
                      className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-900 outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white shadow-2xs"
                      placeholder="45000000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      VNĐ
                    </span>
                  </div>
                </div>

                {/* Field 6: Tài khoản Nợ */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Tài khoản Nợ (Debit)</label>
                  <select
                    value={finForm.accountDebit}
                    onChange={(e) => setFinForm({ ...finForm, accountDebit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white shadow-2xs cursor-pointer"
                  >
                    <option value="1111">1111 - Tiền mặt tại quỹ</option>
                    <option value="1121">1121 - Tiền gửi Ngân hàng VCB</option>
                    <option value="1311">1311 - Phải thu của khách hàng</option>
                    <option value="1411">1411 - Tạm ứng nhân viên</option>
                    <option value="1521">1521 - Nguyên vật liệu da, đế, keo</option>
                    <option value="1531">1531 - Công cụ dụng cụ xưởng</option>
                    <option value="3311">3311 - Phải trả cho người bán / NCC</option>
                    <option value="6271">6271 - Chi phí sản xuất chung</option>
                    <option value="6427">6427 - Chi phí dịch vụ mua ngoài</option>
                    <option value="6428">6428 - Chi phí quản lý doanh nghiệp</option>
                  </select>
                </div>

                {/* Field 7: Tài khoản Có */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Tài khoản Có (Credit)</label>
                  <select
                    value={finForm.accountCredit}
                    onChange={(e) => setFinForm({ ...finForm, accountCredit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white shadow-2xs cursor-pointer"
                  >
                    <option value="1111">1111 - Tiền mặt tại quỹ</option>
                    <option value="1121">1121 - Tiền gửi Ngân hàng VCB</option>
                    <option value="1311">1311 - Phải thu của khách hàng</option>
                    <option value="1411">1411 - Hoàn ứng nhân viên</option>
                    <option value="3311">3311 - Phải trả cho người bán / NCC</option>
                    <option value="5111">5111 - Doanh thu bán giày Skechers</option>
                    <option value="7111">7111 - Thu nhập tài chính khác</option>
                  </select>
                </div>

                {/* Field 8: Chứng từ đính kèm */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Chứng từ / Hóa đơn đính kèm</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={finForm.attachment}
                      onChange={(e) => setFinForm({ ...finForm, attachment: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-white shadow-2xs"
                      placeholder="Chung-tu.pdf"
                    />
                    <button
                      type="button"
                      onClick={() => showToast("📎 Đã đính kèm chứng từ điện tử từ máy tính!")}
                      className="px-2.5 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      title="Tải tệp đính kèm"
                    >
                      <IconPaperclip size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Diễn giải nghiệp vụ */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Nội dung diễn giải chi tiết</label>
                <input
                  type="text"
                  value={finForm.note}
                  onChange={(e) => setFinForm({ ...finForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white shadow-2xs"
                  placeholder="Thu tiền bán hàng chuyển Skechers ca 1..."
                />
              </div>

              {/* Toolbar Actions Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveFinEntry(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <IconCheck size={16} />
                    <span>💾 Lưu &amp; Ghi Sổ D1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveFinEntry(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <IconSend size={16} />
                    <span>⚡ Lưu &amp; Gửi Duyệt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const prefix = finEntryType === "thu" ? "PT" : finEntryType === "chi" ? "PC" : finEntryType === "tam_ung" ? "TU" : finEntryType === "hoa_don" ? "HD" : "CN";
                      setFinForm({
                        code: `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                        date: new Date().toISOString().slice(0, 10),
                        party: "",
                        dept: "Sản Xuất (NM1)",
                        accountDebit: "1111",
                        accountCredit: "5111",
                        amount: "",
                        note: "",
                        attachment: "Chung-tu-kem-theo.pdf",
                      });
                      showToast("🔄 Đã làm mới form nhập liệu!");
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <IconRefresh size={15} />
                    <span>Làm Mới</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast("📥 Đang kết nối nạp mẫu chứng từ tự động từ Cloudflare D1...");
                      setTimeout(() => {
                        showToast("✅ Đã nạp thành công 12 chứng từ mẫu từ D1 Database!");
                      }, 800);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <IconDatabase size={15} />
                    <span>Dữ Liệu Mẫu D1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMainTab("overview")}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Tất cả 10 Phân hệ →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ════════ SỔ NHẬT KÝ GIAO DỊCH & CHỨNG TỪ PHÁT SINH ════════ */}
            <div className="space-y-2.5 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    Sổ Nhật Ký Giao Dịch &amp; Chứng Từ Phát Sinh
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200">
                    {finTransactions.length} bút toán
                  </span>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                    {[
                      { key: "all", label: "Tất cả" },
                      { key: "thu", label: "Thu" },
                      { key: "chi", label: "Chi" },
                      { key: "tam_ung", label: "Tạm ứng" },
                      { key: "hoa_don", label: "Hóa đơn" },
                      { key: "cong_no", label: "Công nợ" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setFinFilterTab(f.key)}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          finFilterTab === f.key
                            ? "bg-white text-[#006838] font-black shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={finSearchText}
                      onChange={(e) => setFinSearchText(e.target.value)}
                      placeholder="Tìm mã, đối tác..."
                      className="pl-7 pr-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-white w-36 sm:w-44"
                    />
                    <IconSearch size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Interactive Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Mã Chứng Từ</th>
                      <th className="py-2.5 px-3">Ngày</th>
                      <th className="py-2.5 px-3">Loại</th>
                      <th className="py-2.5 px-3">Đối tượng / Đối tác</th>
                      <th className="py-2.5 px-3">Phòng Ban</th>
                      <th className="py-2.5 px-3">Hạch toán (Nợ/Có)</th>
                      <th className="py-2.5 px-3 text-right">Số tiền (VNĐ)</th>
                      <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                      <th className="py-2.5 px-3 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {finTransactions
                      .filter((t) => (finFilterTab === "all" ? true : t.typeCode === finFilterTab))
                      .filter((t) =>
                        finSearchText
                          ? t.id.toLowerCase().includes(finSearchText.toLowerCase()) ||
                            t.party.toLowerCase().includes(finSearchText.toLowerCase()) ||
                            t.note.toLowerCase().includes(finSearchText.toLowerCase())
                          : true
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {row.id}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-600 whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              row.typeCode === "thu" ? "bg-emerald-100 text-emerald-800" :
                              row.typeCode === "chi" ? "bg-rose-100 text-rose-800" :
                              row.typeCode === "tam_ung" ? "bg-amber-100 text-amber-800" :
                              row.typeCode === "hoa_don" ? "bg-purple-100 text-purple-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800 max-w-[160px] truncate" title={row.party}>
                            {row.party}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-[130px] truncate font-medium" title={row.dept}>
                            {row.dept}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                            Nợ <span className="font-bold text-slate-900">{row.debit}</span> / Có <span className="font-bold text-slate-900">{row.credit}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                            {row.amount.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${row.statusColor}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFinItem(row);
                                  setIsFinPrintModalOpen(true);
                                }}
                                className="p-1 rounded-lg hover:bg-emerald-100 text-[#006838] transition-colors cursor-pointer"
                                title="In phiếu thu/chi"
                              >
                                <IconPrinter size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFinTransactions(finTransactions.filter((item) => item.id !== row.id));
                                  showToast(`🗑️ Đã xóa chứng từ ${row.id}!`);
                                }}
                                className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                title="Xóa chứng từ"
                              >
                                <IconTrash size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-500 font-bold">Tổng thu: </span>
                    <span className="font-mono font-black text-emerald-700">
                      {finTransactions
                        .filter((t) => t.typeCode === "thu")
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Tổng chi: </span>
                    <span className="font-mono font-black text-rose-700">
                      {finTransactions
                        .filter((t) => t.typeCode === "chi" || t.typeCode === "tam_ung")
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-bold">Dòng tiền ròng: </span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    +{(
                      finTransactions.filter((t) => t.typeCode === "thu").reduce((acc, curr) => acc + curr.amount, 0) -
                      finTransactions.filter((t) => t.typeCode === "chi" || t.typeCode === "tam_ung").reduce((acc, curr) => acc + curr.amount, 0)
                    ).toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ TAB 2: TỔNG QUAN KPI & 10 PHÂN HỆ NGHIỆP VỤ ════════ */}
      {activeMainTab === "overview" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 4 Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100/80 shadow-2xs">
                <IconCoins size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-slate-500 block truncate">Doanh thu tháng</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                  12.4 tỷ
                </div>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                  +12% so với tháng trước ↑
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100/80 shadow-2xs">
                <IconClock size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-slate-500 block truncate">Chi phí vận hành</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                  3.1 tỷ
                </div>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                  -8% so với tháng trước ↓
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100/80 shadow-2xs">
                <IconTrendingUp size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-slate-500 block truncate">Lợi nhuận ròng</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                  2.6 tỷ
                </div>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                  +18% so với tháng trước ↑
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100/80 shadow-2xs">
                <IconAdjustmentsHorizontal size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-slate-500 block truncate">Tỷ lệ chi phí/doanh thu</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                  25.0%
                </div>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                  -3% so với tháng trước ↓
                </span>
              </div>
            </div>
          </div>

          {/* Grid 10 Modules */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Danh Mục 10 Phân Hệ Nghiệp Vụ Kế Toán
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Truy cập nhanh các nghiệp vụ quản lý tài chính, ngân sách, tài sản và dòng tiền
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {MODULES.map((mod, idx) => {
                const ModIcon = mod.icon;
                return (
                  <NavLink
                    key={idx}
                    href={mod.href}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-[#006838]/60 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-200/50">
                        <h4 className="text-xs font-black text-slate-900 group-hover:text-[#006838] transition-colors leading-tight flex items-center gap-1.5">
                          <ModIcon size={16} className="text-[#006838]" />
                          <span>{mod.title}</span>
                        </h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#006838] border border-emerald-100 flex-shrink-0">
                          {mod.badge}
                        </span>
                      </div>

                      <ul className="space-y-0.5 pt-2">
                        {mod.desc.map((d, dIdx) => (
                          <li key={dIdx} className="text-[10px] text-slate-600 flex items-start gap-1 leading-snug">
                            <span className="text-[#006838] font-bold">•</span>
                            <span className="truncate">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-extrabold text-[#006838] group-hover:translate-x-0.5 transition-transform">
                      <span>Mở phân hệ</span>
                      <IconArrowRight size={12} />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL IN PHIẾU THU / CHI CHUẨN A5 (TT 200/2014/TT-BTC) ════════ */}
      {isFinPrintModalOpen && selectedFinItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconPrinter size={18} className="text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Xem Trước Bản In Chứng Từ Kế Toán Chuẩn A5
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFinPrintModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Print Preview Sheet (Phôi chứng từ giấy A5 chuẩn Thông tư 200/2014/TT-BTC) */}
            <div className="p-6 sm:p-8 bg-slate-100 flex justify-center">
              <div className="bg-white w-full max-w-lg p-6 rounded-xl border border-slate-300 shadow-md text-slate-900 text-xs space-y-4 font-serif">
                {/* Header Tiêu Đề Doanh Nghiệp */}
                <div className="flex justify-between items-start border-b pb-3 border-slate-300">
                  <div className="space-y-0.5 font-sans">
                    <p className="font-extrabold text-[11px] text-slate-900 uppercase">TẬP ĐOÀN TBS GROUP</p>
                    <p className="text-[10px] text-slate-600 font-bold">Tổ hợp Kiên Giang - TBS Group</p>
                    <p className="text-[9px] text-slate-500">KCN Sông Mây, Trảng Bom, Đồng Nai</p>
                  </div>
                  <div className="text-right font-sans space-y-0.5">
                    <p className="font-bold text-[10px] text-slate-800">
                      Mẫu số: {selectedFinItem.typeCode === "thu" ? "01-TT" : "02-TT"}
                    </p>
                    <p className="text-[9px] text-slate-500 italic">
                      (Ban hành theo TT số 200/2014/TT-BTC)
                    </p>
                    <p className="font-mono font-bold text-[10px] text-[#006838]">
                      Số: {selectedFinItem.id}
                    </p>
                  </div>
                </div>

                {/* Tên Phiếu */}
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-black tracking-wider uppercase text-slate-900">
                    {selectedFinItem.typeCode === "thu"
                      ? "PHIẾU THU TIỀN"
                      : selectedFinItem.typeCode === "chi"
                      ? "PHIẾU CHI TIỀN"
                      : selectedFinItem.typeCode === "tam_ung"
                      ? "GIẤY ĐỀ NGHỊ TẠM ỨNG"
                      : "CHỨNG TỪ GIAO DỊCH"}
                  </h2>
                  <p className="italic text-[10px] text-slate-500">
                    Ngày {selectedFinItem.date.slice(8, 10)} tháng {selectedFinItem.date.slice(5, 7)} năm {selectedFinItem.date.slice(0, 4)}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-slate-700">
                    Quyển số: 08/2026 • Bút toán Nợ: {selectedFinItem.debit} | Có: {selectedFinItem.credit}
                  </p>
                </div>

                {/* Chi tiết nội dung phiếu */}
                <div className="space-y-2 text-[11px] leading-relaxed font-sans">
                  <div className="flex">
                    <span className="w-36 font-semibold text-slate-700">
                      {selectedFinItem.typeCode === "thu" ? "Họ tên người nộp:" : "Họ tên người nhận:"}
                    </span>
                    <span className="font-bold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      {selectedFinItem.party}
                    </span>
                  </div>

                  <div className="flex">
                    <span className="w-36 font-semibold text-slate-700">Địa chỉ / Bộ phận:</span>
                    <span className="text-slate-800 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      {selectedFinItem.dept}
                    </span>
                  </div>

                  <div className="flex">
                    <span className="w-36 font-semibold text-slate-700">Lý do thu / chi:</span>
                    <span className="text-slate-800 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      {selectedFinItem.note}
                    </span>
                  </div>

                  <div className="flex">
                    <span className="w-36 font-semibold text-slate-700">Số tiền bằng số:</span>
                    <span className="font-mono font-black text-base text-[#006838] border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      {selectedFinItem.amount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>

                  <div className="flex">
                    <span className="w-36 font-semibold text-slate-700">Kèm theo:</span>
                    <span className="text-slate-600 italic border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      01 Chứng từ điện tử gốc ({selectedFinItem.id}.pdf)
                    </span>
                  </div>
                </div>

                {/* Chữ ký */}
                <div className="grid grid-cols-4 gap-2 pt-6 text-center text-[10px] font-sans text-slate-700">
                  <div>
                    <p className="font-bold text-slate-900 uppercase">Thủ trưởng</p>
                    <p className="italic text-slate-400 text-[9px]">(Ký, đóng dấu)</p>
                    <div className="h-14 flex items-end justify-center">
                      <span className="text-[10px] font-bold text-emerald-800">[Đã Duyệt]</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 uppercase">Kế toán trưởng</p>
                    <p className="italic text-slate-400 text-[9px]">(Ký, họ tên)</p>
                    <div className="h-14 flex items-end justify-center">
                      <span className="text-[10px] font-bold text-emerald-800">Trần Thị Mai</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 uppercase">Người lập phiếu</p>
                    <p className="italic text-slate-400 text-[9px]">(Ký, họ tên)</p>
                    <div className="h-14 flex items-end justify-center">
                      <span className="text-[10px] font-bold text-slate-800">Phạm Nguyễn Anh Huy</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 uppercase">
                      {selectedFinItem.typeCode === "thu" ? "Người nộp tiền" : "Người nhận tiền"}
                    </p>
                    <p className="italic text-slate-400 text-[9px]">(Ký, họ tên)</p>
                    <div className="h-14 flex items-end justify-center">
                      <span className="text-[10px] font-bold text-slate-800">{selectedFinItem.party.split(" ")[0]}...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-mono">
                Mã bảo mật D1: #TBS-FIN-{selectedFinItem.id}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFinPrintModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`🖨️ Đang gửi lệnh in chứng từ ${selectedFinItem.id} tới máy in...`);
                    setTimeout(() => {
                      setIsFinPrintModalOpen(false);
                      showToast(`✅ Đã in thành công chứng từ ${selectedFinItem.id}!`);
                    }, 1200);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <IconPrinter size={16} />
                  <span>In Chứng Từ Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <IconCheck size={16} />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </FinanceShell>
  );
}

export default function FinanceHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f7f5] flex items-center justify-center">
          <div className="p-8 text-center space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#006838] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Đang tải trung tâm kế toán &amp; quản trị...</p>
          </div>
        </div>
      }
    >
      <FinanceHubContent />
    </Suspense>
  );
}
