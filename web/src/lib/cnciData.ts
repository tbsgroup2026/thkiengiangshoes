export interface CNCIItem {
  id: string;
  name: string;
  href: string;
  iconName: string;
  isHalfWidth?: boolean;
}

export interface CNCICard {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconBgClass: string;
  iconColorClass: string;
  cardBorderHoverClass: string;
  items: CNCIItem[];
}

export interface CNCIBannerConfig {
  welcomeText: string;
  title: string;
  description: string;
}

export const CNCI_BANNER_DATA: CNCIBannerConfig = {
  welcomeText: "CHÀO MỪNG TRỞ LẠI",
  title: "Cải Tiến Liên Tục & Năng Suất 4.0",
  description: "Chọn phân hệ bên dưới để quản lý, theo dõi và cải tiến hiệu quả công việc mỗi ngày.",
};

export const CNCI_CARDS_DATA: CNCICard[] = [
  {
    id: "tech-deployment",
    title: "Triển Khai Công Nghệ",
    description: "Quản lý và triển khai các dự án công nghệ mới",
    iconName: "IconCpu",
    iconBgClass: "bg-[#006838]",
    iconColorClass: "text-white",
    cardBorderHoverClass: "hover:border-[#006838]",
    items: [
      {
        id: "phieu-de-nghi",
        name: "Phiếu Đề Nghị",
        href: "/documents/create",
        iconName: "IconFileText",
      },
      {
        id: "app-cong-nghe",
        name: "App Công Nghệ",
        href: "/mobile-guide",
        iconName: "IconDeviceMobile",
      },
      {
        id: "quan-ly-kho",
        name: "Quản Lý Kho",
        href: "/finance/vat-tu-kho",
        iconName: "IconBuildingStore",
      },
    ],
  },
  {
    id: "ci-activities",
    title: "Hoạt Động CI",
    description: "Quản lý các hoạt động cải tiến liên tục",
    iconName: "IconTrendingUp",
    iconBgClass: "bg-blue-600",
    iconColorClass: "text-white",
    cardBorderHoverClass: "hover:border-blue-600",
    items: [
      {
        id: "he-thong-kaizen",
        name: "Hệ Thống Kaizen",
        href: "/work/kaizen",
        iconName: "IconBulb",
      },
      {
        id: "he-thong-dao-tao",
        name: "Hệ Thống Đào Tạo",
        href: "/careers",
        iconName: "IconSchool",
      },
      {
        id: "truc-quan-san-luong",
        name: "Trực Quan Sản Lượng",
        href: "/work/ci",
        iconName: "IconChartBar",
        isHalfWidth: true,
      },
      {
        id: "gemba",
        name: "Gemba",
        href: "/work/gemba",
        iconName: "IconMapPin",
        isHalfWidth: true,
      },
    ],
  },
  {
    id: "mmtb-management",
    title: "Quản Lý MMTB",
    description: "Quản lý máy móc thiết bị và bảo trì",
    iconName: "IconTools",
    iconBgClass: "bg-amber-500",
    iconColorClass: "text-white",
    cardBorderHoverClass: "hover:border-amber-500",
    items: [
      {
        id: "bao-duong-mmtb",
        name: "Bảo Dưỡng MMTB",
        href: "/maintenance/schedule",
        iconName: "IconTools",
      },
      {
        id: "nhu-cau-sua-chua",
        name: "Nhu Cầu Sửa Chữa",
        href: "/maintenance/tickets",
        iconName: "IconClipboardList",
      },
      {
        id: "danh-sach-mmtb",
        name: "Danh Sách MMTB",
        href: "/maintenance/machines",
        iconName: "IconDeviceLaptop",
      },
      {
        id: "de-xuat-cai-tien",
        name: "Đề Xuất Cải Tiến",
        href: "/maintenance/proposals",
        iconName: "IconChartPie",
      },
      {
        id: "thoi-gian-phan-hoi",
        name: "Thời Gian Phản Hồi",
        href: "/maintenance/response-time",
        iconName: "IconStar",
      },
      {
        id: "so-do-nha-may",
        name: "Sơ Đồ Nhà Máy",
        href: "/maintenance/floor-plan",
        iconName: "IconMapPin",
      },
      {
        id: "danh-muc-mmtb",
        name: "Quản Lý Danh Mục",
        href: "/maintenance/categories",
        iconName: "IconCategory",
      },
    ],
  },
];
