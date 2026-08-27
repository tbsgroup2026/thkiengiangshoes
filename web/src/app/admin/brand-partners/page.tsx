"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminBrandPartnersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin?tab=brand_partners");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-300">Đang chuyển hướng sang Quản lý Đối tác Thương hiệu...</p>
      </div>
    </div>
  );
}
