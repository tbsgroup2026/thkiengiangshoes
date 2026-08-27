"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import WorkspaceGallery from "@/components/home/WorkspaceGallery";
import { getLandingCMS, DEFAULT_LANDING_CMS } from "@/lib/landingCMS";
import { useTranslation } from "@/hooks/useTranslation";

export default function HomePage() {
  const { lang } = useTranslation();
  const [cmsData, setCmsData] = useState(DEFAULT_LANDING_CMS);

  useEffect(() => { 
    const loadCMS = () => {
      const config = getLandingCMS();
      if (config) {
        setCmsData(config);
      }
    };
    loadCMS();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_landing_cms_updated", loadCMS);
      return () => window.removeEventListener("tbs_landing_cms_updated", loadCMS);
    }
  }, []);

  const { excellence, products } = cmsData;

  return (
    <div className="min-h-screen flex flex-col bg-[#08221a] font-sans antialiased text-white selection:bg-[#2fd39a] selection:text-[#08221a]">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION & BRAND STRIP */}
        <HeroSection />

        {/* WORKSPACE GALLERY (#workspace) */}
        <div className="bg-white text-slate-900">
          <WorkspaceGallery />
        </div>

        {/* BRAND EXCELLENCE */}
        <section
          id="excellence"
          className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white text-slate-900"
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl border border-slate-200 group bg-slate-100">
                <img
                  src={excellence.image || "/images/tbs-factory-plant.png"}
                  alt="Brand Quality"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {excellence.title || (lang === "VN" 
                    ? "Dấu Ấn Thương Hiệu & Đẳng Cấp Chuỗi Cung Ứng"
                    : "Brand Excellence & Supply Chain Quality")}
                </h2>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {excellence.description ||
                    (lang === "VN"
                      ? "Tổ hợp Kiên Giang - TBS Group tuân thủ nghiêm ngặt các tiêu chuẩn chất lượng cao nhất của đối tác chiến lược toàn cầu."
                      : "SKECHERS Supply Chain Office - TBS Group strictly adheres to the highest quality standards of SKECHERS global partners.")}
                </p>

                <div className="space-y-4 pt-2">
                  {(excellence.points || DEFAULT_LANDING_CMS.excellence.points).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#08221a] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCTS GRID */}
        <section
          id="products"
          className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white text-slate-900 border-t border-slate-100"
        >
          <div className="max-w-[1400px] mx-auto space-y-12">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {products.title || (lang === "VN" 
                  ? "Dòng Sản Phẩm Tiêu Biểu SKECHERS"
                  : "Featured SKECHERS Product Line")}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {products.description ||
                  (lang === "VN"
                    ? "Các mẫu sản phẩm thuộc chuỗi cung ứng SKECHERS được sản xuất và kiểm soát chất lượng tại hệ thống nhà máy TBS Group."
                    : "SKECHERS product samples from the supply chain are manufactured and quality-controlled at TBS Group's factory system.")}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {(products.items || DEFAULT_LANDING_CMS.products.items).map((prod, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#006838]/50 hover:shadow-xl transition-all duration-300 shadow-sm flex flex-col"
                >
                  <div className="relative aspect-square bg-slate-100/70 overflow-hidden flex items-center justify-center">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/crawled/Da-giay1.jpg";
                        }}
                      />
                    ) : (
                      <div className="text-center space-y-1.5 p-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#006838] text-white flex items-center justify-center mx-auto p-2 shadow-sm">
                          <img src="/images/tbs-logo.png" alt="TBS Group Logo" className="w-full h-full object-contain brightness-0 invert" />
                        </div>
                      </div>
                    )}

                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[#006838] text-[10px] font-mono font-bold shadow-xs border border-slate-200">
                      {prod.code}
                    </span>
                  </div>

                  <div className="p-4 bg-white border-t border-slate-100 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#006838] transition-colors line-clamp-1">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {lang === "VN" ? "Tiêu chuẩn SKECHERS Global" : "SKECHERS Global Standard"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
