"use client";

import { useState, useEffect } from "react";
import { IconDeviceMobile, IconShare, IconPlus, IconX, IconCheck, IconDownload } from "@tabler/icons-react";

export default function PWAInstallGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if app is already running in standalone PWA mode (added to home screen)
    const isAppStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    setIsStandalone(isAppStandalone);

    // Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleIOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleIOS);

    // Capture Android BeforeInstallPromptEvent
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      setIsOpen(true);
    }
  };

  if (isStandalone) {
    return null; // Already running as PWA home screen app
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-[#004d29] text-white text-[11px] font-extrabold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
        title="Đưa ứng dụng ra Màn hình chính Điện thoại (PWA)"
      >
        <IconDeviceMobile size={14} />
        <span>📲 Thêm vào MH chính ĐT</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006838]">
                  <IconDeviceMobile size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Cài đặt SKECHERS - TBS Group
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold">
                    Đưa ra Màn hình chính Điện thoại (PWA App)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <IconX size={16} />
              </button>
            </div>

            {isIOS ? (
              /* iOS Installation Instructions */
              <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-xs">
                <h4 className="font-extrabold text-[#006838] flex items-center gap-1.5 text-sm">
                  <span>📱 Hướng dẫn trên iPhone / iPad (Safari):</span>
                </h4>
                <ol className="space-y-2.5 font-medium text-slate-700 list-decimal pl-4">
                  <li>
                    Bấm vào nút <span className="font-bold text-slate-900 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200"><IconShare size={14} className="text-blue-600" /> Chia sẻ (Share)</span> ở thanh dưới cùng Safari.
                  </li>
                  <li>
                    Cuộn xuống danh sách chọn <span className="font-bold text-slate-900 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200"><IconPlus size={14} className="text-emerald-600" /> Thêm vào MH chính (Add to Home Screen)</span>.
                  </li>
                  <li>
                    Bấm <span className="font-bold text-[#006838]">Thêm (Add)</span> ở góc phải trên cùng.
                  </li>
                </ol>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px] text-[#006838] font-bold">
                  ✨ Biểu tượng 👟 SKECHERS TBS sẽ xuất hiện trên màn hình chính ĐT của bạn, gửi thông báo trực tiếp giống như app tải từ App Store!
                </div>
              </div>
            ) : (
              /* Android / Chrome Instructions */
              <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-xs">
                <h4 className="font-extrabold text-[#006838] flex items-center gap-1.5 text-sm">
                  <span>🤖 Hướng dẫn trên Điện thoại Android (Chrome / Zalo / Edge):</span>
                </h4>
                <ol className="space-y-2.5 font-medium text-slate-700 list-decimal pl-4">
                  <li>
                    Bấm vào biểu tượng <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">⋮ (3 chấm)</span> ở góc phải trên trình duyệt.
                  </li>
                  <li>
                    Chọn <span className="font-bold text-slate-900 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200"><IconDownload size={14} className="text-emerald-600" /> Cài đặt ứng dụng</span> hoặc <span className="font-bold text-slate-900 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200"><IconPlus size={14} className="text-emerald-600" /> Thêm vào màn hình chính</span>.
                  </li>
                  <li>
                    Xác nhận <span className="font-bold text-[#006838]">Cài đặt (Install)</span>.
                  </li>
                </ol>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px] text-[#006838] font-bold">
                  🔔 Ứng dụng sẽ gửi thông báo rung & chuông trực tiếp về điện thoại ngay cả khi bạn không mở web!
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#006838] hover:bg-[#004d29] text-white text-xs font-black transition cursor-pointer shadow-md"
              >
                Đã Hiểu - Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
