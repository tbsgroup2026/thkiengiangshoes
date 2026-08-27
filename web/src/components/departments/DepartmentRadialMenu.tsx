"use client";

import { useState, useEffect } from "react";
import CircularMenu, { MenuItem } from "@/components/home/CircularMenu";
import {
  IconBuildingFactory,
  IconShieldCheck,
  IconUsers,
  IconShip,
  IconTool,
  IconBuildingStore,
  IconChartBar,
  IconSparkles,
  IconClipboardCheck,
  IconHierarchy,
  IconDeviceLaptop,
  IconAward,
  IconLayersIntersect,
  IconRocket,
} from "@tabler/icons-react";

interface DepartmentRadialMenuProps {
  userRoleCode?: string;
  userDepartmentCode?: string;
  onSelectDepartment?: (deptCode: string, deptName: string) => void;
}

export default function DepartmentRadialMenu({
  userRoleCode = "SUPER_ADMIN",
  userDepartmentCode,
  onSelectDepartment,
}: DepartmentRadialMenuProps) {
  const isSuperAdmin = userRoleCode === "SUPER_ADMIN" || userRoleCode === "ADMIN";

  // List of 14 SKECHERS - TBS Group Departments
  const departmentsConfig = [
    {
      id: "KE_HOACH_CBVT",
      label: "Kế Hoạch & Cung Ứng",
      subLabel: "SKECHERS Supply",
      icon: IconClipboardCheck,
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      id: "QC",
      label: "Quản Lý Chất Lượng QC",
      subLabel: "Quy Chuẩn Quốc Tế",
      icon: IconShieldCheck,
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "HR",
      label: "Nhân Sự & Đào Tạo",
      subLabel: "5,000+ CBCNV",
      icon: IconUsers,
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "LOGISTICS",
      label: "Kho Vận & ICD",
      subLabel: "TBS Tân Vạn",
      icon: IconShip,
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "MAINTENANCE",
      label: "Bảo Trì & Kỹ Thuật",
      subLabel: "Sửa Máy 24/7",
      icon: IconTool,
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "FINANCE",
      label: "Tài Chính & Kế Toán",
      subLabel: "Ngân Sách & Chi Phí",
      icon: IconBuildingStore,
      allowedRoles: ["SUPER_ADMIN"],
    },
    {
      id: "PROD_1",
      label: "Sản Xuất Giày 1",
      subLabel: "Chuyền 1–16",
      icon: IconBuildingFactory,
      allowedRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    },
    {
      id: "PROD_2",
      label: "Sản Xuất Giày 2",
      subLabel: "Chuyền 17–33",
      icon: IconBuildingFactory,
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "EHS_5S",
      label: "An Toàn & 5S",
      subLabel: "Môi Trường Xanh",
      icon: IconAward,
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "RND",
      label: "Nghiên Cứu Mẫu R&D",
      subLabel: "SKECHERS Lab",
      icon: IconSparkles,
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "IT",
      label: "Công Nghệ Thông Tin",
      subLabel: "TBS II Platform",
      icon: IconDeviceLaptop,
      allowedRoles: ["SUPER_ADMIN"],
    },
    {
      id: "BOARD",
      label: "Ban Giám Đốc",
      subLabel: "Điều Hành Chuỗi",
      icon: IconHierarchy,
      allowedRoles: ["SUPER_ADMIN"],
    },
    {
      id: "COMMUNICATIONS",
      label: "Truyền Thông Nội Bộ",
      subLabel: "Văn Hoá TBS",
      icon: IconLayersIntersect,
      allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "GLOBAL_SUPPLY",
      label: "Chuỗi Cung Ứng Toàn Cầu",
      subLabel: "SKECHERS International",
      icon: IconRocket,
      allowedRoles: ["SUPER_ADMIN"],
    },
  ];

  // Map to MenuItem format with permissions
  const menuItems: MenuItem[] = departmentsConfig.map((dept) => {
    const hasPermission =
      isSuperAdmin ||
      dept.allowedRoles.includes(userRoleCode) ||
      dept.id === userDepartmentCode;

    return {
      id: dept.id,
      label: dept.label,
      subLabel: dept.subLabel,
      icon: dept.icon,
      isActive: hasPermission,
      disabledReason: hasPermission ? undefined : "Không có quyền truy cập",
      onClick: () => {
        if (hasPermission && onSelectDepartment) {
          onSelectDepartment(dept.id, dept.label);
        }
      },
    };
  });

  return (
    <div className="w-full">
      <CircularMenu
        items={menuItems}
        centerTotalCount={14}
        onCenterClick={() => {
          alert("Danh sách 14 Phòng Ban Tổ hợp Kiên Giang - TBS Group");
        }}
      />
    </div>
  );
}
