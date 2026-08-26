import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  IconDeviceMobile,
  IconBrandAndroid,
  IconBrandApple,
} from "@tabler/icons-react";

export default function MobileGuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header />
      <main className="flex-1 py-16 max-w-3xl mx-auto px-5 sm:px-8">
        <div className="bg-surface p-10 rounded-3xl border border-border shadow-sm space-y-6">
          {/* Header icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-wash text-accent flex items-center justify-center">
            <IconDeviceMobile size={32} />
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-ink text-display">
              Tải ứng dụng Mobile Native TBS Group
            </h1>
            <p className="text-steel text-sm leading-relaxed max-w-lg mx-auto">
              Tài khoản của bạn thuộc vai trò Công nhân hoặc Nhân viên bảo trì.
              Vui lòng sử dụng app Native chính thức trên thiết bị di động để
              thực hiện thao tác quét mã QR máy hỏng và cập nhật tiến độ sửa
              chữa.
            </p>
          </div>

          {/* Platform cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-6 rounded-2xl bg-accent-deep text-white border border-accent-soft/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-lg text-accent-soft">
                <IconBrandAndroid size={22} />
                Android App
              </div>
              <p className="text-xs text-white/40">
                Viết bằng Kotlin + Jetpack Compose, quét mã bằng Google ML Kit.
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-accent-soft/15 text-accent-soft text-xs font-mono rounded-lg">
                  TBS_Group_v1.0.aab
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-accent-deep text-white border border-accent-soft/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-lg text-accent-soft">
                <IconBrandApple size={22} />
                iOS App
              </div>
              <p className="text-xs text-white/40">
                Viết bằng Swift + SwiftUI, quét mã bằng AVFoundation & Vision.
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-accent-soft/15 text-accent-soft text-xs font-mono rounded-lg">
                  TBS_Group_v1.0.ipa
                </span>
              </div>
            </div>
          </div>

          {/* Shared core note */}
          <div className="pt-4 border-t border-border text-xs text-muted text-center">
            Cả 2 ứng dụng mobile đều dùng chung bộ lõi C++ Shared Core (
            <code className="font-mono text-accent">core-cpp/</code>) giúp đồng
            bộ dữ liệu offline tức thì khi nhà xưởng chập chờn wifi.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
