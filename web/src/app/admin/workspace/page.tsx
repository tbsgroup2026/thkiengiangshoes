"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminWorkspaceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin?tab=workspace_gallery");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-mono text-sm">
      <span>Đang chuyển hướng đến Cổng Quản Trị Không Gian Làm Việc...</span>
    </div>
  );
}
