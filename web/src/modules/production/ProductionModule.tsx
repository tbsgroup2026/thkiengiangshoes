"use client";

import React, { useState } from "react";
import {
  IconBuildingFactory,
  IconTools,
  IconAlertTriangle,
  IconGauge,
  IconPackage,
  IconUsers,
  IconFileText,
  IconSettings,
  IconSearch,
  IconFilter,
  IconPlus,
  IconChevronRight,
  IconArrowLeft,
  IconMapPin,
  IconCheck,
  IconClock,
  IconCircleCheck,
  IconRefresh,
  IconChevronDown,
  IconAdjustments,
  IconChartPie,
  IconActivity,
  IconDeviceDesktop,
} from "@tabler/icons-react";

interface FactoryComplex {
  id: string;
  name: string;
  shortName: string;
  subTitle: string;
  outputMonthly: string;
  outputTrend: string;
  linesCount: string;
  linesStatus: string;
  oee: string;
  oeeTrend: string;
  orderProgress: string;
  orderStatus: string;
  totalDevices: number;
  activeCount: number;
  maintenanceCount: number;
  issueCount: number;
  stoppedCount: number;
}

const FACTORY_COMPLEXES: FactoryComplex[] = [
  {
    id: "kg1",
    name: "Tổ hợp Nhà máy Kiên Giang 1",
    shortName: "TH-NM: Kiên Giang 1",
    subTitle: "Cập nhật lúc: 10:30 | 19/05/2026",
    outputMonthly: "586,000 Đôi",
    outputTrend: "+15% so với tháng trước",
    linesCount: "33 Chuyền",
    linesStatus: "100% hoạt động",
    oee: "92.4%",
    oeeTrend: "+5% so với tháng trước",
    orderProgress: "89.2%",
    orderStatus: "Đạt kế hoạch",
    totalDevices: 152,
    activeCount: 102,
    maintenanceCount: 23,
    issueCount: 15,
    stoppedCount: 12,
  },
  {
    id: "kg2",
    name: "Tổ hợp Nhà máy Kiên Giang 2",
    shortName: "TH-NM: Kiên Giang 2",
    subTitle: "Cập nhật lúc: 10:15 | 19/05/2026",
    outputMonthly: "492,000 Đôi",
    outputTrend: "+8% so với tháng trước",
    linesCount: "28 Chuyền",
    linesStatus: "96% hoạt động",
    oee: "90.8%",
    oeeTrend: "+3.2% so với tháng trước",
    orderProgress: "91.5%",
    orderStatus: "Vượt kế hoạch",
    totalDevices: 138,
    activeCount: 98,
    maintenanceCount: 20,
    issueCount: 12,
    stoppedCount: 8,
  },
  {
    id: "kg3",
    name: "Tổ hợp Nhà máy Kiên Giang 3",
    shortName: "TH-NM: Kiên Giang 3",
    subTitle: "Cập nhật lúc: 09:45 | 19/05/2026",
    outputMonthly: "410,000 Đôi",
    outputTrend: "+12% so với tháng trước",
    linesCount: "24 Chuyền",
    linesStatus: "100% hoạt động",
    oee: "88.9%",
    oeeTrend: "+4.1% so với tháng trước",
    orderProgress: "87.0%",
    orderStatus: "Đạt kế hoạch",
    totalDevices: 115,
    activeCount: 82,
    maintenanceCount: 18,
    issueCount: 9,
    stoppedCount: 6,
  },
  {
    id: "mientrong",
    name: "Tổ hợp Miền Đông",
    shortName: "TH-NM: Miền Đông",
    subTitle: "Cập nhật lúc: 10:00 | 19/05/2026",
    outputMonthly: "720,000 Đôi",
    outputTrend: "+18% so với tháng trước",
    linesCount: "42 Chuyền",
    linesStatus: "98% hoạt động",
    oee: "94.1%",
    oeeTrend: "+6.5% so với tháng trước",
    orderProgress: "94.8%",
    orderStatus: "Vượt tiến độ",
    totalDevices: 195,
    activeCount: 145,
    maintenanceCount: 28,
    issueCount: 14,
    stoppedCount: 8,
  },
  {
    id: "mientrung",
    name: "Tổ hợp Miền Trung",
    shortName: "TH-NM: Miền Trung",
    subTitle: "Cập nhật lúc: 09:30 | 19/05/2026",
    outputMonthly: "350,000 Đôi",
    outputTrend: "+5% so với tháng trước",
    linesCount: "20 Chuyền",
    linesStatus: "95% hoạt động",
    oee: "87.5%",
    oeeTrend: "+2.0% so với tháng trước",
    orderProgress: "86.4%",
    orderStatus: "Đạt kế hoạch",
    totalDevices: 98,
    activeCount: 68,
    maintenanceCount: 16,
    issueCount: 8,
    stoppedCount: 6,
  },
  {
    id: "mienbac",
    name: "Nhà máy Miền Bắc",
    shortName: "TH-NM: Miền Bắc",
    subTitle: "Cập nhật lúc: 10:20 | 19/05/2026",
    outputMonthly: "510,000 Đôi",
    outputTrend: "+11% so với tháng trước",
    linesCount: "30 Chuyền",
    linesStatus: "100% hoạt động",
    oee: "91.3%",
    oeeTrend: "+4.8% so với tháng trước",
    orderProgress: "90.2%",
    orderStatus: "Đạt kế hoạch",
    totalDevices: 140,
    activeCount: 105,
    maintenanceCount: 20,
    issueCount: 10,
    stoppedCount: 5,
  },
];

interface DeviceItem {
  id: string;
  code: string;
  name: string;
  type: string;
  line: string;
  status: "active" | "maintenance" | "issue" | "stopped";
  oee: string;
  lastMaintenance: string;
  nextMaintenance: string;
}

const INITIAL_DEVICES: DeviceItem[] = [
  {
    id: "1",
    code: "EP-12",
    name: "Máy ép nhiệt EP-12",
    type: "Máy ép",
    line: "Chuyền 03",
    status: "issue",
    oee: "85.2%",
    lastMaintenance: "12/05/2026",
    nextMaintenance: "12/06/2026",
  },
  {
    id: "2",
    code: "JUKI-00125",
    name: "Máy may 1 kim JUKI DDL-9000",
    type: "Máy may",
    line: "Chuyền 05",
    status: "active",
    oee: "90.1%",
    lastMaintenance: "10/05/2026",
    nextMaintenance: "10/06/2026",
  },
  {
    id: "3",
    code: "KM-09",
    name: "Máy cắt vải tự động KM-09",
    type: "Máy cắt",
    line: "Chuyền 02",
    status: "maintenance",
    oee: "78.6%",
    lastMaintenance: "05/05/2026",
    nextMaintenance: "05/06/2026",
  },
  {
    id: "4",
    code: "EP-07",
    name: "Máy ép nhiệt tự động EP-07",
    type: "Máy ép",
    line: "Chuyền 01",
    status: "issue",
    oee: "0%",
    lastMaintenance: "01/05/2026",
    nextMaintenance: "01/06/2026",
  },
  {
    id: "5",
    code: "DESMA-04",
    name: "Máy đúc đế tự động DESMA 24 Station",
    type: "Máy đúc đế",
    line: "Chuyền 08",
    status: "active",
    oee: "94.5%",
    lastMaintenance: "14/05/2026",
    nextMaintenance: "14/06/2026",
  },
  {
    id: "6",
    code: "BROTHER-012",
    name: "Máy lập trình may tự động Brother BAS",
    type: "Máy may",
    line: "Chuyền 04",
    status: "active",
    oee: "92.0%",
    lastMaintenance: "11/05/2026",
    nextMaintenance: "11/06/2026",
  },
];

export default function ProductionModule() {
  const [selectedComplexId, setSelectedComplexId] = useState<string>("kg1");
  const [activeTabFunction, setActiveTabFunction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewDetailDevice, setViewDetailDevice] = useState<DeviceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Equipment Form State
  const [newDevice, setNewDevice] = useState({
    code: "",
    name: "",
    type: "Máy may",
    line: "Chuyền 01",
    status: "active" as "active" | "maintenance" | "issue" | "stopped",
    oee: "90%",
    lastMaintenance: "19/05/2026",
    nextMaintenance: "19/06/2026",
  });

  const [devicesList, setDevicesList] = useState<DeviceItem[]>(INITIAL_DEVICES);

  const currentComplex =
    FACTORY_COMPLEXES.find((c) => c.id === selectedComplexId) || FACTORY_COMPLEXES[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.code || !newDevice.name) {
      showToast("Vui lòng điền đầy đủ Mã thiết bị và Tên thiết bị!");
      return;
    }

    const created: DeviceItem = {
      id: Date.now().toString(),
      code: newDevice.code.toUpperCase(),
      name: newDevice.name,
      type: newDevice.type,
      line: newDevice.line,
      status: newDevice.status,
      oee: newDevice.oee,
      lastMaintenance: newDevice.lastMaintenance,
      nextMaintenance: newDevice.nextMaintenance,
    };

    setDevicesList([created, ...devicesList]);
    setShowAddModal(false);
    setNewDevice({
      code: "",
      name: "",
      type: "Máy may",
      line: "Chuyền 01",
      status: "active",
      oee: "90%",
      lastMaintenance: "19/05/2026",
      nextMaintenance: "19/06/2026",
    });
    showToast(`Đã thêm thiết bị mới ${created.code} thành công!`);
  };

  // Filtered devices list
  const filteredDevices = devicesList.filter((device) => {
    const matchSearch =
      device.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.line.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || device.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-500/40 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#2fd39a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          1. TOP COMPLEX SELECTOR PILLS
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-[#006838] flex items-center justify-center font-bold">
              <IconBuildingFactory size={18} />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Chọn Tổ hợp Nhà máy (TH-NM)
              </span>
              <span className="text-[11px] text-slate-500">
                Điều hành 5 khu vực tổ hợp sản xuất SKECHERS toàn hệ thống TBS Group
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              📅 19/05/2026
            </span>
          </div>
        </div>

        {/* Horizontal Scroll Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {FACTORY_COMPLEXES.map((complex) => {
            const isActive = selectedComplexId === complex.id;
            return (
              <button
                key={complex.id}
                onClick={() => setSelectedComplexId(complex.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex-shrink-0 flex items-center gap-2 border ${
                  isActive
                    ? "bg-[#006838] text-white border-[#006838] shadow-md shadow-[#006838]/20 scale-[1.02]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? "bg-[#2fd39a] animate-pulse" : "bg-slate-400"
                  }`}
                />
                <span>{complex.shortName}</span>
              </button>
            );
          })}
          <button
            onClick={() => showToast("Đang hiển thị tổng hợp tất cả 5 Tổ hợp nhà máy")}
            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition cursor-pointer flex-shrink-0"
          >
            ::: Tất cả
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          2. BANNER / INFO HERO CARD FOR SELECTED FACTORY COMPLEX
         ════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#08221a] via-[#0d2e23] to-[#041a13] text-white p-6 lg:p-8 shadow-xl border border-emerald-900/40">
        {/* Decorative background glow & mesh pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(47,211,154,0.15)_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Title & Details */}
          <div className="lg:col-span-5 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2fd39a]/15 border border-[#2fd39a]/30 text-[#2fd39a] text-[11px] font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#2fd39a] animate-ping" />
              <span>{currentComplex.shortName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentComplex.name}
            </h1>
            <p className="text-xs text-emerald-200/80 font-medium">
              {currentComplex.subTitle}
            </p>
          </div>

          {/* 4 Stat Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Stat 1 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <span className="text-[11px] font-bold text-gray-300 block">Sản lượng tháng</span>
              <div className="text-base sm:text-lg font-black text-white">{currentComplex.outputMonthly}</div>
              <span className="text-[10px] font-extrabold text-[#2fd39a] block">{currentComplex.outputTrend}</span>
            </div>

            {/* Stat 2 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <span className="text-[11px] font-bold text-gray-300 block">Số dây chuyền</span>
              <div className="text-base sm:text-lg font-black text-white">{currentComplex.linesCount}</div>
              <span className="text-[10px] font-extrabold text-[#2fd39a] block">{currentComplex.linesStatus}</span>
            </div>

            {/* Stat 3 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <span className="text-[11px] font-bold text-gray-300 block">Hiệu suất chuyền</span>
              <div className="text-base sm:text-lg font-black text-[#2fd39a]">{currentComplex.oee}</div>
              <span className="text-[10px] font-extrabold text-emerald-300 block">{currentComplex.oeeTrend}</span>
            </div>

            {/* Stat 4 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <span className="text-[11px] font-bold text-gray-300 block">Tiến độ đơn hàng</span>
              <div className="text-base sm:text-lg font-black text-amber-300">{currentComplex.orderProgress}</div>
              <span className="text-[10px] font-extrabold text-amber-200 block">{currentComplex.orderStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          3. CHỨC NĂNG LÀM VIỆC (8 FUNCTION TILES GRID)
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <span>🛠️ Chức năng làm việc</span>
            <span className="text-xs font-normal text-slate-500 lowercase">(Tổ hợp Nhà máy TH-NM)</span>
          </h2>
          <span className="text-xs font-bold text-[#006838]">8 ứng dụng chuyên môn</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            {
              id: "mmtb",
              title: "Quản lý MMTB",
              sub: "Danh mục thiết bị",
              icon: IconTools,
              color: "emerald",
              bg: "bg-emerald-50 text-[#006838] border-emerald-200/60",
            },
            {
              id: "baotri",
              title: "Bảo trì MMTB",
              sub: "Lịch bảo trì, định kỳ",
              icon: IconSettings,
              color: "blue",
              bg: "bg-blue-50 text-blue-700 border-blue-200/60",
            },
            {
              id: "suco",
              title: "Sự cố thiết bị",
              sub: "Báo hỏng, xử lý",
              icon: IconAlertTriangle,
              color: "amber",
              bg: "bg-amber-50 text-amber-700 border-amber-200/60",
            },
            {
              id: "hieusuat",
              title: "Hiệu suất MMTB",
              sub: "OEE, hiệu suất máy",
              icon: IconGauge,
              color: "teal",
              bg: "bg-teal-50 text-teal-700 border-teal-200/60",
            },
            {
              id: "vattu",
              title: "Vật tư phụ tùng",
              sub: "Tồn kho, xuất nhập",
              icon: IconPackage,
              color: "indigo",
              bg: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
            },
            {
              id: "phancong",
              title: "Phân công vận hành",
              sub: "Nhân sự vận hành",
              icon: IconUsers,
              color: "purple",
              bg: "bg-purple-50 text-purple-700 border-purple-200/60",
            },
            {
              id: "baocao",
              title: "Báo cáo MMTB",
              sub: "Báo cáo, thống kê",
              icon: IconFileText,
              color: "sky",
              bg: "bg-sky-50 text-sky-700 border-sky-200/60",
            },
            {
              id: "caidat",
              title: "Cài đặt",
              sub: "Danh mục, cấu hình",
              icon: IconAdjustments,
              color: "slate",
              bg: "bg-slate-100 text-slate-700 border-slate-200/60",
            },
          ].map((item) => {
            const IconComp = item.icon;
            const isSelected = activeTabFunction === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTabFunction(item.id);
                  showToast(`Đã mở phân hệ: ${item.title}`);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-center flex flex-col items-center justify-between group ${
                  isSelected
                    ? "bg-[#006838] text-white border-[#006838] shadow-md scale-[1.03]"
                    : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-[#006838]/60 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
                    isSelected ? "bg-white/20 text-white" : item.bg
                  }`}
                >
                  <IconComp size={20} />
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {item.title}
                  </h4>
                  <p className={`text-[10px] mt-0.5 ${isSelected ? "text-emerald-100" : "text-slate-500"}`}>
                    {item.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          4. 3 DETAILED WIDGETS ROW (EQUIPMENT STATUS, OEE TREND, LIVE ALERTS)
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WIDGET 1: TÌNH TRẠNG THIẾT BỊ (DONUT CHART & BREAKDOWN) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <IconChartPie size={16} className="text-[#006838]" />
              <span>Tình trạng thiết bị</span>
            </h3>
            <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {currentComplex.totalDevices} Thiết bị
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto">
            {/* Custom SVG Donut Chart */}
            <div className="sm:col-span-5 flex justify-center relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Active Segment (Green) - 67.1% */}
                <path
                  className="text-[#006838]"
                  strokeWidth="4.5"
                  strokeDasharray="67, 100"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Maintenance Segment (Amber) - 15.1% */}
                <path
                  className="text-amber-500"
                  strokeWidth="4.5"
                  strokeDasharray="15, 100"
                  strokeDashoffset="-67"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Issue Segment (Red) - 9.9% */}
                <path
                  className="text-rose-500"
                  strokeWidth="4.5"
                  strokeDasharray="10, 100"
                  strokeDashoffset="-82"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-slate-900">{currentComplex.totalDevices}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Thiết bị</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="sm:col-span-7 space-y-2 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006838]" />
                  <span className="text-slate-600 font-medium">Đang hoạt động</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {currentComplex.activeCount} <span className="text-slate-400 font-normal">(67.1%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 font-medium">Chờ bảo trì</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {currentComplex.maintenanceCount} <span className="text-slate-400 font-normal">(15.1%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 font-medium">Đang sự cố</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {currentComplex.issueCount} <span className="text-slate-400 font-normal">(9.9%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600 font-medium">Ngừng sử dụng</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {currentComplex.stoppedCount} <span className="text-slate-400 font-normal">(7.9%)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              onClick={() => showToast("Đã tải báo cáo tình trạng toàn bộ thiết bị MMTB")}
              className="text-xs font-extrabold text-[#006838] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Xem chi tiết tình trạng →</span>
            </button>
          </div>
        </div>

        {/* WIDGET 2: HIỆU SUẤT THIẾT BỊ (OEE TREND LINE GRAPH) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <IconActivity size={16} className="text-teal-600" />
              <span>Hiệu suất thiết bị (OEE)</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              7 ngày gần nhất
            </span>
          </div>

          {/* OEE Sub-metrics */}
          <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">OEE</span>
              <span className="text-sm font-black text-[#006838]">82.6%</span>
              <span className="text-[9px] font-bold text-emerald-600 block">+3.2%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Hiệu suất</span>
              <span className="text-sm font-black text-slate-800">88.4%</span>
              <span className="text-[9px] font-bold text-teal-600 block">+2.1%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Chất lượng</span>
              <span className="text-sm font-black text-slate-800">94.2%</span>
              <span className="text-[9px] font-bold text-blue-600 block">+1.4%</span>
            </div>
          </div>

          {/* SVG Trend Line Chart */}
          <div className="relative h-28 w-full my-auto flex items-end">
            <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area Gradient Fill */}
              <defs>
                <linearGradient id="oeeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006838" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#006838" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 50 Q 50 35, 100 45 T 200 30 T 300 25 L 300 80 L 0 80 Z"
                fill="url(#oeeGrad)"
              />

              {/* Line Curve */}
              <path
                d="M 0 50 Q 50 35, 100 45 T 200 30 T 300 25"
                fill="none"
                stroke="#006838"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="0" cy="50" r="3" fill="#006838" />
              <circle cx="50" cy="38" r="3" fill="#006838" />
              <circle cx="100" cy="45" r="3" fill="#006838" />
              <circle cx="150" cy="35" r="3" fill="#006838" />
              <circle cx="200" cy="30" r="3" fill="#006838" />
              <circle cx="250" cy="32" r="3" fill="#006838" />
              <circle cx="300" cy="25" r="4" fill="#2fd39a" stroke="#006838" strokeWidth="2" />
            </svg>
          </div>

          {/* Date Axis */}
          <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
            <span>13/05</span>
            <span>14/05</span>
            <span>15/05</span>
            <span>16/05</span>
            <span>17/05</span>
            <span>18/05</span>
            <span className="text-[#006838]">19/05</span>
          </div>
        </div>

        {/* WIDGET 3: SỰ CỐ THIẾT BỊ HÔM NAY (LIVE ALERTS FEED) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <IconAlertTriangle size={16} className="text-amber-600" />
              <span>Sự cố thiết bị hôm nay</span>
            </h3>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>

          <div className="space-y-2.5 my-auto">
            {/* Alert Item 1 */}
            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 flex items-start justify-between gap-2.5 hover:bg-rose-100/60 transition">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconAlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Máy ép nhiệt EP-12</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Sự cố kẹt trục ép chuyền 03</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="px-2 py-0.5 rounded-md bg-rose-200/70 text-rose-800 text-[10px] font-bold block">
                  Đang xử lý
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">09:15</span>
              </div>
            </div>

            {/* Alert Item 2 */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start justify-between gap-2.5 hover:bg-amber-100/60 transition">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconAlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Máy may 1 kim JUKI DDL-9000</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Lỗi motor bước chuyền 05</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-800 text-[10px] font-bold block">
                  Đang chờ
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">08:40</span>
              </div>
            </div>

            {/* Alert Item 3 */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start justify-between gap-2.5 hover:bg-amber-100/60 transition">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconAlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Máy cắt vải KM-09</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Lỗi cảm biến an toàn chuyền 02</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-800 text-[10px] font-bold block">
                  Đang chờ
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">08:10</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              onClick={() => showToast("Xem danh sách 15 sự cố thiết bị đang ghi nhận")}
              className="text-xs font-extrabold text-[#006838] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Xem tất cả sự cố →</span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          5. DANH SÁCH THIẾT BỊ NỔI BẬT (INTERACTIVE DATA TABLE)
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>📋 DANH SÁCH THIẾT BỊ NỔI BẬT</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý chi tiết danh mục máy móc thiết bị MMTB tại {currentComplex.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm thiết bị..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#006838]"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-[#006838]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="maintenance">Chờ bảo trì</option>
              <option value="issue">Đang sự cố</option>
            </select>

            {/* Add Device Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#006838] hover:bg-[#08221a] text-white text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              <IconPlus size={16} />
              <span>Thêm thiết bị</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4">Mã thiết bị</th>
                <th className="py-3 px-4">Tên thiết bị</th>
                <th className="py-3 px-4">Loại thiết bị</th>
                <th className="py-3 px-4">Dây chuyền</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Hiệu suất (OEE)</th>
                <th className="py-3 px-4">Bảo trì gần nhất</th>
                <th className="py-3 px-4">Bảo trì tiếp theo</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không tìm thấy thiết bị nào khớp với từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#006838] font-bold text-[11px] border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-[#006838]" />
                      Đang hoạt động
                    </span>
                  );
                  if (device.status === "maintenance") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Chờ bảo trì
                      </span>
                    );
                  } else if (device.status === "issue") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        Đang sự cố
                      </span>
                    );
                  }

                  return (
                    <tr key={device.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{device.code}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-800">{device.name}</td>
                      <td className="py-3 px-4 text-slate-600">{device.type}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{device.line}</td>
                      <td className="py-3 px-4">{statusBadge}</td>
                      <td className="py-3 px-4 font-bold text-[#006838]">{device.oee}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{device.lastMaintenance}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{device.nextMaintenance}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setViewDetailDevice(device)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#006838] hover:text-white text-slate-700 font-bold text-[11px] transition cursor-pointer"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: THÊM THIẾT BỊ MỚI
         ════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Thêm thiết bị MMTB mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã thiết bị *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: EP-15"
                    value={newDevice.code}
                    onChange={(e) => setNewDevice({ ...newDevice, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#006838]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dây chuyền *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Chuyền 06"
                    value={newDevice.line}
                    onChange={(e) => setNewDevice({ ...newDevice, line: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#006838]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên thiết bị *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Máy dán keo tự động Brother"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#006838]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại thiết bị</label>
                  <select
                    value={newDevice.type}
                    onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#006838]"
                  >
                    <option value="Máy ép">Máy ép</option>
                    <option value="Máy may">Máy may</option>
                    <option value="Máy cắt">Máy cắt</option>
                    <option value="Máy đúc đế">Máy đúc đế</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái ban đầu</label>
                  <select
                    value={newDevice.status}
                    onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#006838]"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="maintenance">Chờ bảo trì</option>
                    <option value="issue">Đang sự cố</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#006838] text-white font-extrabold hover:bg-[#08221a]"
                >
                  Lưu thiết bị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: CHI TIẾT THIẾT BỊ MMTB
         ════════════════════════════════════════════════════════════════ */}
      {viewDetailDevice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-[#006838]">{viewDetailDevice.code}</span>
                <h3 className="text-base font-black text-slate-900">{viewDetailDevice.name}</h3>
              </div>
              <button
                onClick={() => setViewDetailDevice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Vị trí lắp đặt:</span>
                  <span className="font-bold text-slate-800">{viewDetailDevice.line}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Chủng loại MMTB:</span>
                  <span className="font-bold text-slate-800">{viewDetailDevice.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Hiệu suất OEE:</span>
                  <span className="font-black text-[#006838]">{viewDetailDevice.oee}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Bảo trì gần nhất:</span>
                  <span className="font-mono font-bold text-slate-800">{viewDetailDevice.lastMaintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Bảo trì dự kiến:</span>
                  <span className="font-mono font-bold text-[#006838]">{viewDetailDevice.nextMaintenance}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setViewDetailDevice(null)}
                className="px-5 py-2 rounded-xl bg-[#006838] text-white font-extrabold hover:bg-[#08221a]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
