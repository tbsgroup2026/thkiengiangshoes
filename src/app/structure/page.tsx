"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  IconHierarchy2,
  IconUsers,
  IconBuildingFactory2,
  IconShieldCheck,
  IconFlask,
  IconCalculator,
  IconBriefcase,
  IconArrowRight,
} from "@tabler/icons-react";

export default function StructurePage() {
  const departments = [
    {
      title: "Hội Đồng Quản Trị & Ban Tổng Giám Đốc",
      role: "Định hướng chiến lược & Quản trị cấp cao",
      lead: "Chủ tịch HĐQT: Nguyễn Đức Thuấn",
      members: "Ban Tổng Giám Đốc & Hội Đồng Cố Vấn Chiến Lược",
      badge: "Cấp Điều Hành Tối Cao",
      color: "from-emerald-800 to-emerald-950 text-white",
    },
    {
      title: "Khối Văn Phòng Chuỗi SKECHERS",
      role: "Điều phối chuỗi cung ứng toàn cầu & Quản lý đơn hàng",
      lead: "Giám Đốc Chuỗi SKECHERS",
      members: "Bộ phận Kế hoạch (PMC), Logistics & Quản lý Chuỗi",
      badge: "Headquarter SKECHERS",
      color: "from-[#006838] to-[#004d29] text-white",
    },
    {
      title: "Trung Tâm Nghiên Cứu & Phát Triển Mẫu (R&D Center)",
      role: "Sáng tạo phom mẫu, phát triển vật liệu công nghệ mới",
      lead: "Giám Đốc R&D: Lê Minh Tuấn",
      members: "Kỹ thuật 3D CAD/CAM, May mẫu, Tạo khuôn & Thử nghiệm LAB",
      badge: "R&D Innovation",
      color: "from-blue-600 to-indigo-800 text-white",
    },
    {
      title: "Khối Quản Lý Chất Lượng (Quality Assurance & QC)",
      role: "Kiểm định tiêu chuẩn chất lượng Skechers toàn cầu (AQL 1.0)",
      lead: "Trưởng Ban QC Chuỗi: Hoàng Thị Thảo",
      members: "Đội ngũ QA/QC tại các Nhà máy Kiên Giang, Thoại Sơn, Sài Gòn",
      badge: "Global QA Standard",
      color: "from-teal-600 to-emerald-800 text-white",
    },
    {
      title: "Khối Tài Chính - Kế Toán & Quản Trị",
      role: "Quản lý dòng tiền, ngân sách, hóa đơn điện tử & công nợ",
      lead: "Kế Toán Trưởng / Giám Đốc Tài Chính",
      members: "Kế toán tổng hợp, Kế toán chi phí sản xuất, Thủ quỹ",
      badge: "Finance & Accounting",
      color: "from-amber-600 to-amber-800 text-white",
    },
    {
      title: "Khối Sản Xuất & Hệ Thống Nhà Máy Vệ Tinh",
      role: "Gia công và sản xuất hàng loạt giày thể thao Skechers",
      lead: "Giám Đốc Cụm Nhà Máy",
      members: "Nhà máy Kiên Giang (KG1, KG2), Nhà máy Thoại Sơn, NM Sài Gòn",
      badge: "Manufacturing Plants",
      color: "from-slate-700 to-slate-900 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006838] text-xs font-black uppercase tracking-wider">
            <IconHierarchy2 size={15} />
            <span>Cơ cấu tổ chức &amp; Bộ máy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Sơ Đồ Tổ Chức Chuỗi Cung Ứng SKECHERS - TBS Group
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Mô hình quản trị liên thông, kết nối từ Văn phòng Chuỗi điều hành, Trung tâm R&amp;D đến các Nhà máy sản xuất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${dept.color} shadow-xs space-y-1.5`}>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                    {dept.badge}
                  </span>
                  <h3 className="text-base font-black text-white tracking-tight leading-snug">
                    {dept.title}
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase">Chức năng nhiệm vụ</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{dept.role}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase">Phụ trách</span>
                    <p className="font-bold text-slate-900 mt-0.5">{dept.lead}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase">Thành phần trực thuộc</span>
                    <p className="text-slate-600 font-medium mt-0.5">{dept.members}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/work"
                  className="text-xs font-black text-[#006838] hover:underline flex items-center gap-1"
                >
                  <span>Truy cập phân hệ làm việc</span>
                  <IconArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
