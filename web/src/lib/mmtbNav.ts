// Cấu trúc menu sidebar RIÊNG cho khu vực "Quản Lý MMTB" — tách khỏi CNCI_CARDS_DATA (vốn chỉ
// dùng cho thẻ "Quản Lý MMTB" ở trang /work, danh sách rút gọn hơn) vì sidebar cần đầy đủ + có
// nhóm xổ xuống (Danh mục), khớp cấu trúc menu admin bên tbsMayMoc.
export type MmtbNavLeaf = { type: 'link'; id: string; label: string; href: string; iconName: string };
export type MmtbNavGroup = { type: 'group'; id: string; label: string; iconName: string; children: MmtbNavLeaf[] };
export type MmtbNavEntry = MmtbNavLeaf | MmtbNavGroup;

export const MMTB_NAV: MmtbNavEntry[] = [
  { type: 'link', id: 'overview', label: 'Tổng Quan', href: '/maintenance', iconName: 'IconLayoutDashboard' },
  { type: 'link', id: 'machines', label: 'Danh Sách MMTB', href: '/maintenance/machines', iconName: 'IconDeviceLaptop' },
  { type: 'link', id: 'employees', label: 'Nhân Sự', href: '/maintenance/employees', iconName: 'IconUsers' },
  { type: 'link', id: 'schedule', label: 'Bảo Dưỡng MMTB', href: '/maintenance/schedule', iconName: 'IconTools' },
  { type: 'link', id: 'tickets', label: 'Nhu Cầu Sửa Chữa', href: '/maintenance/tickets', iconName: 'IconClipboardList' },
  { type: 'link', id: 'proposals', label: 'Đề Xuất Cải Tiến', href: '/maintenance/proposals', iconName: 'IconBulb' },
  {
    type: 'group',
    id: 'categories',
    label: 'Danh Mục',
    iconName: 'IconCategory',
    children: [
      { type: 'link', id: 'cat-areas', label: 'Quản Lý Khu Vực', href: '/maintenance/categories/areas', iconName: 'IconMapPin' },
      { type: 'link', id: 'cat-failure', label: 'Danh Mục Hư', href: '/maintenance/failure-categories', iconName: 'IconAlertTriangle' },
      { type: 'link', id: 'cat-maintenance', label: 'Bảo Trì', href: '/maintenance/categories/maintenance-periods', iconName: 'IconCalendarStats' },
      { type: 'link', id: 'cat-status', label: 'Trạng Thái Máy', href: '/maintenance/categories/machine-status', iconName: 'IconCircleCheck' },
      { type: 'link', id: 'cat-types', label: 'Phân Loại Máy', href: '/maintenance/categories/machine-types', iconName: 'IconDeviceLaptop' },
      { type: 'link', id: 'cat-parts', label: 'Phụ Tùng / Linh Kiện', href: '/maintenance/categories/parts', iconName: 'IconPackage' },
    ],
  },
  { type: 'link', id: 'floor-plan', label: 'Sơ Đồ Nhà Máy', href: '/maintenance/floor-plan', iconName: 'IconMapPin' },
  { type: 'link', id: 'response-time', label: 'Thời Gian Phản Hồi', href: '/maintenance/response-time', iconName: 'IconStopwatch' },
  { type: 'link', id: 'announcements', label: 'Thông Báo', href: '/maintenance/announcements', iconName: 'IconSpeakerphone' },
];
