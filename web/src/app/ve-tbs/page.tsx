"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavLink from "@/components/NavLink";
import {
  IconBuildingFactory2,
  IconTruckDelivery,
  IconBuildingStore,
  IconBriefcase,
  IconCpu,
  IconShieldCheck,
  IconAward,
  IconUsers,
  IconHistory,
  IconArrowRight,
  IconCheck,
  IconSparkles,
} from "@tabler/icons-react";

const STATS = [
  { label: "Cán Bộ CNV", value: "50,000+", desc: "Nguồn nhân lực chất lượng cao trên toàn quốc" },
  { label: "Năm Phát Triển", value: "35+ Năm", desc: "Hành trình bền vững từ năm 1989" },
  { label: "Ngành Trụ Cột", value: "06 Ngành", desc: "Sản xuất, Logistics, BĐS & Thương mại" },
  { label: "Năng Lực Xuất Khẩu", value: "30M+", desc: "Sản phẩm giày da & túi xách mỗi năm" },
];

const TIMELINE = [
  {
    year: "1989",
    title: "Khởi Đầu Hành Trình",
    desc: "Thành lập xưởng sản xuất giày nhỏ đầu tiên tại tỉnh Bình Dương với tinh thần kiên cường và khát vọng vươn tầm quốc tế.",
  },
  {
    year: "2000s",
    title: "Hợp Tác Chiến Lược Toàn Cầu",
    desc: "Trở thành đối tác sản xuất chiến lược của các thương hiệu hàng đầu thế giới như Skechers, Decathlon, Coach.",
  },
  {
    year: "2010s",
    title: "Phát Triển Hệ Sinh Thái Đa Ngành",
    desc: "Mở rộng sang Hạ tầng Logistics (ICD TBS Logistics), Bất động sản (TBS Land), Khách sạn (Mai House) và Sân golf (Montgomerie Links).",
  },
  {
    year: "2026",
    title: "Tiên Phong Chuyển Đổi Số 4.0",
    desc: "Đầu tư mạnh mẽ vào Smart Factory, OEE Real-time, Ticket Số hóa Bảo trì và Trí tuệ nhân tạo Kaizen AI trong vận hành chuỗi.",
  },
];

const PILLARS = [
  {
    id: "footwear",
    title: "Sản Xuất Giày Da",
    subtitle: "Trụ cột cốt lõi sản xuất công nghiệp",
    description:
      "TBS Group sở hữu chuỗi nhà máy hiện đại tại Bình Dương, Đồng Nai, An Giang với công nghệ tự động hóa tiến tiến, sản xuất hơn 30 triệu đôi giày mỗi năm cho các thương hiệu hàng đầu như Skechers, Decathlon.",
    image: "/images/tbs-factory-plant.png",
    icon: IconBuildingFactory2,
    badge: "Xuất Khẩu Toàn Cầu",
  },
  {
    id: "logistics",
    title: "Hạ Tầng Logistics & ICD",
    subtitle: "Trung tâm tiếp vận quy mô hàng đầu",
    description:
      "ICD TBS Logistics sở hữu hơn 115,000 m² kho bãi đạt chuẩn quốc tế, kết nối giao thông huyết mạch, cung cấp dịch vụ logistics trọn gói từ kho vận, hải quan đến vận tải chuỗi cung ứng.",
    image: "/images/tbs-logistics-hub.png",
    icon: IconTruckDelivery,
    badge: "115,000 m² Kho Vận",
  },
  {
    id: "retail",
    title: "Thương Mại & Bán Lẻ Skechers",
    subtitle: "Chuỗi phân phối & trải nghiệm khách hàng",
    description:
      "Tổ hợp Kiên Giang - TBS Group vận hành hệ thống cửa hàng bán lẻ hiện đại trên toàn quốc, mang lại dịch vụ khách hàng xuất sắc và giải pháp quản lý hàng hóa thời gian thực.",
    image: "/images/tbs-skechers-store.png",
    icon: IconBuildingStore,
    badge: "Hệ Thống Chuỗi Chuẩn Quốc Tế",
  },
  {
    id: "digital",
    title: "Công Nghệ Số & Vận Hành 4.0",
    subtitle: "Chuyển đổi số toàn diện doanh nghiệp",
    description:
      "Ứng dụng công nghệ Cloudflare Workers, Next.js Native, đo lường OEE dừng máy thời gian thực, ticket Gemba Walk số hóa và phân tích dữ liệu AI giúp tối ưu hiệu suất 24/7.",
    image: "/images/tbs-hq-hero.png",
    icon: IconCpu,
    badge: "Smart Factory & AI Kaizen",
  },
];

export default function VeTBSPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-[#006838] selection:text-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section — Match Home Page Dark Premium Aesthetic */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#08221a] text-white border-b border-[#2fd39a]/20">
          {/* Background Gate Image + Gradient Overlays matching Home Page */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-50"
            style={{ backgroundImage: "url('/images/tbs-gate.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08221a]/90 via-[#08221a]/70 to-[#08221a]/50 pointer-events-none" />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2fd39a]/15 border border-[#2fd39a]/40 text-[#2fd39a] text-xs font-black uppercase tracking-widest shadow-2xs backdrop-blur-xs">
                <IconSparkles size={14} className="text-[#2fd39a]" />
                <span>Tập Đoàn Đa Ngành Hàng Đầu Việt Nam</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.08] font-display">
                TẬP ĐOÀN <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2fd39a] via-[#52e8b2] to-[#f2dc9a]">TBS GROUP</span>
              </h1>

              <p className="text-base sm:text-xl text-gray-300 font-medium leading-relaxed max-w-3xl mx-auto">
                35 năm bền vững kiến tạo hệ sinh thái sản xuất công nghiệp, logistics, bất động sản và thương mại dịch vụ số hóa chuẩn mực quốc tế.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <NavLink
                  href="/careers"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2fd39a] to-[#f2dc9a] text-[#08221a] font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <span>Gia Nhập TBS Group</span>
                  <IconArrowRight size={16} />
                </NavLink>

                <NavLink
                  href="/work"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-sm uppercase tracking-wider backdrop-blur-xs transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <span>Hệ Thống Quản Trị</span>
                </NavLink>
              </div>
            </div>

            {/* Key Statistics Bento Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/15">
              {STATS.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-[#0d2419]/90 border border-[#2fd39a]/30 backdrop-blur-md rounded-2xl p-5 text-center hover:border-[#2fd39a] hover:shadow-xl hover:shadow-emerald-950/50 transition-all duration-200"
                >
                  <div className="text-2xl sm:text-4xl font-black text-[#2fd39a] font-mono tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-extrabold text-white uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-gray-300 mt-1 leading-snug font-medium">
                    {stat.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: 6 Ngành Trụ Cột Chiến Lược */}
        <section className="py-20 bg-slate-50/70 border-t border-slate-200/80 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono font-black text-[#006838] uppercase tracking-widest block">
                HỆ SINH THÁI ĐA NGÀNH
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight">
                Các Ngành Trụ Cột Chiến Lược
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                TBS Group liên tục đầu tư và mở rộng quy mô trên 6 lĩnh vực chính, đóng góp tích cực vào sự phát triển kinh tế xã hội đất nước.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PILLARS.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.id}
                    className="group bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm hover:border-[#006838] hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Pillar Image Frame */}
                    <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100">
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 bg-[#006838] text-white px-3.5 py-1 rounded-full text-[11px] font-extrabold shadow-md">
                        {pillar.badge}
                      </div>
                    </div>

                    {/* Pillar Content */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4 text-left">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#006838] border border-emerald-200 flex items-center justify-center font-black">
                            <IconComponent size={22} />
                          </div>
                          <div>
                            <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#006838] transition-colors">
                              {pillar.title}
                            </h3>
                            <span className="text-xs text-[#006838] font-bold">
                              {pillar.subtitle}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 font-medium">
                          {pillar.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#006838]">
                        <span>Tiêu chuẩn ISO &amp; OEE 4.0</span>
                        <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Lịch Sử 35 Năm Phát Triển */}
        <section className="py-20 bg-white relative overflow-hidden border-t border-slate-200/80">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl mb-16 space-y-3 text-left">
              <span className="text-xs font-mono font-black text-[#006838] uppercase tracking-widest block">
                HÀNH TRÌNH BỀN VỮNG
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight">
                35 Năm Lịch Sử &amp; Phát Triển
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                Từ những bước khởi đầu kiên cường đến vị thế tập đoàn đa ngành có tầm ảnh hưởng quốc tế.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TIMELINE.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-50/40 border border-emerald-200/90 rounded-3xl p-6 relative hover:border-[#006838] transition-colors shadow-2xs text-left"
                >
                  <div className="text-4xl font-black font-mono text-[#006838] mb-3">
                    {item.year}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Mối Quan Hệ Chiến Lược Skechers & Số Hóa Vận Hành */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80 relative">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
            <div className="bg-gradient-to-br from-[#006838] via-[#00542d] to-[#041a13] text-white rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-emerald-600/40 text-left">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-bold border border-white/20">
                  <IconShieldCheck size={16} />
                  <span>Tổ hợp Kiên Giang - TBS Group</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white uppercase leading-tight">
                  Đối Tác Sản Xuất &amp; Phân Phối Chuỗi Skechers Toàn Cầu
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                  Với năng lực sản xuất chuẩn mực và quản lý vận hành hiện đại, Tổ hợp Kiên Giang thuộc TBS Group giữ vai trò then chốt trong việc duy trì chuỗi cung ứng ổn định, chất lượng đồng nhất và chuyển đổi số quy trình bảo trì, kiểm toán Gemba Walk thời gian thực.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-white font-semibold">
                    <IconCheck size={16} className="text-emerald-300" />
                    <span>Đo lường OEE dừng máy tự động</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white font-semibold">
                    <IconCheck size={16} className="text-emerald-300" />
                    <span>Ticket số hóa bảo trì bằng mã QR</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white font-semibold">
                    <IconCheck size={16} className="text-emerald-300" />
                    <span>Hệ thống phân tích Kaizen AI</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white font-semibold">
                    <IconCheck size={16} className="text-emerald-300" />
                    <span>An ninh dữ liệu Cloudflare Workers</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                  <img
                    src="/images/tbs-skechers-store.png"
                    alt="Skechers Retail Store"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
