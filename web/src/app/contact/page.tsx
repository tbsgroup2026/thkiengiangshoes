import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconBuildingFactory,
} from "@tabler/icons-react";
import { COMPANY_INFO } from "@/lib/companyData";

const LOCATIONS = [
  {
    icon: IconBuildingFactory,
    title: "Tổ hợp Kiên Giang - TBS Group",
    address:
      "Tổ hợp Kiên Giang - TBS Group, Tỉnh Kiên Giang, Việt Nam",
  },
  {
    icon: IconMapPin,
    title: "Văn phòng điều hành",
    address: "Số 5, Đường ĐT 743, Phường An Bình, TP. Dĩ An, Bình Dương",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas font-sans antialiased text-ink">
      <Header />

      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          {/* Page header — clean editorial layout */}
          <div className="max-w-3xl mb-16 space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight text-display">
              Liên hệ với TBS Group
            </h1>
            <p className="text-steel text-lg leading-relaxed max-w-[55ch]">
              Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp thắc mắc của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Locations */}
            <div className="lg:col-span-2 space-y-6">
              {LOCATIONS.map((loc, idx) => {
                const Icon = loc.icon;
                return (
                  <div
                    key={idx}
                    className="bg-surface rounded-3xl p-8 border border-border shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent-wash text-accent flex items-center justify-center shrink-0">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-ink text-lg text-display mb-1">
                          {loc.title}
                        </h3>
                        <p className="text-steel text-sm leading-relaxed">
                          {loc.address}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Contact info */}
              <div className="bg-surface rounded-3xl p-8 border border-border shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <IconPhone size={20} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                        Điện thoại
                      </div>
                      <div className="text-ink font-semibold">
                        {COMPANY_INFO.contact.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IconMail size={20} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                        Email
                      </div>
                      <div className="text-ink font-semibold">
                        {COMPANY_INFO.contact.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Portal CTA Card */}
            <div className="bg-accent-deep rounded-3xl p-8 text-white flex flex-col justify-between border border-white/10 shadow-lg">
              <div>
                <h3 className="text-xl font-black text-display mb-3">
                  Cổng Dành Cho Cán Bộ Nhân Viên
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  Đối với cán bộ công nhân viên TBS Group, vui lòng đăng nhập
                  tài khoản nội bộ để quản lý công việc và xử lý quy trình biểu mẫu.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full text-center py-3.5 rounded-xl bg-white text-accent-deep font-bold text-sm hover:bg-accent-soft hover:text-white transition-colors duration-200 active:scale-[0.98]"
              >
                Đăng nhập tài khoản
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
