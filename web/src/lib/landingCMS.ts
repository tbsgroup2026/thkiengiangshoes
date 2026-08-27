export interface BrandPartner {
  id: string;
  name: string;
  logo: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShoeImageItem {
  id: string;
  url: string;
  name?: string;
  order: number;
}

export interface ShoeGroup {
  id: string;
  title: string;
  order: number;
  items: ShoeImageItem[];
}

export interface ShoeLinesConfig {
  title: string;
  groups: ShoeGroup[];
}

export interface LandingCMSConfig {
  // 1. Hero Section
  hero: {
    titlePrefix: string;
    titleHighlight: string;
    quoteItalic: string;
    description: string;
    bgImage: string;
    handsImage: string;
    teamImage: string;
    quoteBadgeText: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
  };

  // 2. Workspace Gallery
  workspace: {
    headline: string;
    description: string;
    pillars: Array<{
      title: string;
      desc: string;
    }>;
  };

  // 3. Brand Excellence
  excellence: {
    title: string;
    description: string;
    image: string;
    points: Array<{
      title: string;
      desc: string;
    }>;
  };

  // 4. Products Showcase
  products: {
    title: string;
    description: string;
    items: Array<{
      name: string;
      code: string;
      image?: string;
    }>;
  };

  // 5. Brand Partners Carousel
  brandPartners: BrandPartner[];

  // 6. Featured Shoe Lines (Dòng Giày Tiêu Biểu)
  shoeLines: ShoeLinesConfig;

  // 7. Workspace Departments Gallery
  workspaceDepartments?: WorkspaceDepartment[];
}

export interface WorkspaceImageItem {
  id: string;
  src: string;
  caption?: string;
  order: number;
}

export interface WorkspaceDepartment {
  id: string;
  name: string;
  icon: string; // "building" | "factory" | "briefcase" | "check-shield" | "monitor" | "users" | "file-text" | "users-round"
  order: number;
  images: WorkspaceImageItem[];
}

export const DEFAULT_BRAND_PARTNERS: BrandPartner[] = [
  { id: "bp-1", name: "Decathlon", logo: "/images/brands/256000.png", displayOrder: 1, isActive: true },
  { id: "bp-2", name: "256026", logo: "/images/brands/256026.png", displayOrder: 2, isActive: true },
  { id: "bp-3", name: "256133", logo: "/images/brands/256133.jpg", displayOrder: 3, isActive: true },
  { id: "bp-4", name: "256003", logo: "/images/brands/256003.png", displayOrder: 4, isActive: true },
  { id: "bp-5", name: "195001", logo: "/images/brands/195001.jpg", displayOrder: 5, isActive: true },
  { id: "bp-6", name: "ECCO", logo: "/images/brands/ecco.svg", displayOrder: 6, isActive: true },
  { id: "bp-7", name: "Cole Haan", logo: "/images/brands/cole-haan.svg", displayOrder: 7, isActive: true },
  { id: "bp-8", name: "Rockport", logo: "/images/brands/rockport.svg", displayOrder: 8, isActive: true },
  { id: "bp-9", name: "Skechers", logo: "/images/brands/skechers.svg", displayOrder: 9, isActive: true },
  { id: "bp-10", name: "Coach", logo: "/images/brands/coach.svg", displayOrder: 10, isActive: true },
  { id: "bp-11", name: "Osprey", logo: "/images/brands/osprey.svg", displayOrder: 11, isActive: true },
  { id: "bp-12", name: "Kate Spade", logo: "/images/brands/kate-spade.svg", displayOrder: 12, isActive: true },
  { id: "bp-13", name: "Vera Bradley", logo: "/images/brands/vera-bradley.svg", displayOrder: 13, isActive: true },
];

export const DEFAULT_SHOE_GROUPS: ShoeGroup[] = [
  {
    id: "sg-1",
    title: "WATER PROOF",
    order: 1,
    items: [
      { id: "img-1-1", url: "/images/brands/256000.png", name: "Waterproof Hiking Boot", order: 1 },
      { id: "img-1-2", url: "/images/crawled/56.webp", name: "Waterproof Safety Shoe", order: 2 },
      { id: "img-1-3", url: "/images/brands/256026.png", name: "All-Terrain Waterproof", order: 3 },
      { id: "img-1-4", url: "/images/brands/256133.jpg", name: "Waterproof Trail Boot", order: 4 },
      { id: "img-1-5", url: "/images/brands/195001.jpg", name: "Waterproof Leather Work", order: 5 },
    ],
  },
  {
    id: "sg-2",
    title: "MEN'S SPORT",
    order: 2,
    items: [
      { id: "img-2-1", url: "/images/crawled/04.webp", name: "Sport Lifestyle Sneaker", order: 1 },
      { id: "img-2-2", url: "/images/crawled/05.webp", name: "Athletic Runner Max", order: 2 },
      { id: "img-2-3", url: "/images/crawled/60.webp", name: "Sport Comfort Trainer", order: 3 },
      { id: "img-2-4", url: "/images/brands/256003.png", name: "Sport Mesh Slip-On", order: 4 },
      { id: "img-2-5", url: "/images/crawled/005.webp", name: "Sport Performance Runner", order: 5 },
    ],
  },
  {
    id: "sg-3",
    title: "MEN USA",
    order: 3,
    items: [
      { id: "img-3-1", url: "/images/brands/256133.jpg", name: "USA Classic Outdoor", order: 1 },
      { id: "img-3-2", url: "/images/brands/256003.png", name: "USA Leather Chelsea", order: 2 },
      { id: "img-3-3", url: "/images/brands/195001.jpg", name: "USA Heritage Work Boot", order: 3 },
      { id: "img-3-4", url: "/images/brands/256000.png", name: "USA All-Weather Boot", order: 4 },
      { id: "img-3-5", url: "/images/crawled/58.webp", name: "USA Steel Toe Master", order: 5 },
    ],
  },
  {
    id: "sg-4",
    title: "WORK SHOES",
    order: 4,
    items: [
      { id: "img-4-1", url: "/images/crawled/58.webp", name: "Steel Toe Work Safety", order: 1 },
      { id: "img-4-2", url: "/images/crawled/005.webp", name: "Industrial Comfort Work", order: 2 },
      { id: "img-4-3", url: "/images/crawled/Da-giay1.jpg", name: "Heavy Duty Work Shoe", order: 3 },
      { id: "img-4-4", url: "/images/brands/256026.png", name: "Heavy Duty Leather Boot", order: 4 },
      { id: "img-4-5", url: "/images/crawled/56.webp", name: "Safety Grip Professional", order: 5 },
    ],
  },
  {
    id: "sg-5",
    title: "PERFORMANCE",
    order: 5,
    items: [
      { id: "img-5-1", url: "/images/brands/256000.png", name: "Performance GoRun Pro", order: 1 },
      { id: "img-5-2", url: "/images/crawled/05.webp", name: "Performance Speed Elite", order: 2 },
      { id: "img-5-3", url: "/images/brands/256026.png", name: "Performance Trail Burst", order: 3 },
      { id: "img-5-4", url: "/images/crawled/04.webp", name: "Performance Energy Max", order: 4 },
      { id: "img-5-5", url: "/images/crawled/60.webp", name: "Performance Dynamic Flex", order: 5 },
    ],
  },
];

export const DEFAULT_SHOE_LINES_CONFIG: ShoeLinesConfig = {
  title: "DÒNG GIÀY TIÊU BIỂU",
  groups: DEFAULT_SHOE_GROUPS,
};

export const DEFAULT_WORKSPACE_DEPARTMENTS: WorkspaceDepartment[] = [
  {
    id: "sanh",
    name: "Sảnh",
    icon: "building",
    order: 1,
    images: [
      { id: "img-sanh-1", src: "/images/KGLV/MẶT TIỀN SẢNH.png", caption: "Không gian làm việc chuẩn mực", order: 1 },
      { id: "img-sanh-2", src: "/images/KGLV/SẢNH GÓC TỪ TRONG NHÌN RA.png", caption: "Khu làm việc phối hợp", order: 2 },
      { id: "img-sanh-3", src: "/images/KGLV/CĐTT 2 GÓC HÌNH VP2.png", caption: "Điểm nhấn thiết kế nội thất", order: 3 },
      { id: "img-sanh-4", src: "/images/KGLV/3 DÒNG GIÀY CHÍNH.png", caption: "Góc nhìn môi trường VPTX", order: 4 },
      { id: "img-sanh-5", src: "/images/KGLV/CĐTT 1 GÓC 4 ĐÔI GIÀY.png", caption: "Khu trưng bày 4 đôi giày kỷ niệm", order: 5 },
      { id: "img-sanh-6", src: "/images/KGLV/CĐTT 2 GÓC HÌNH CHIẾC GIÀY.png", caption: "Biểu tượng chiếc giày kỷ niệm", order: 6 },
      { id: "img-sanh-7", src: "/images/KGLV/CĐTT 2 GÓC 3 CHIẾC GIÀY.png", caption: "Góc trưng bày 3 chiếc giày", order: 7 },
      { id: "img-sanh-8", src: "/images/KGLV/CĐTT 1 LỐI VÀO.png", caption: "Chuyên đề truyền thống 1 - Lối vào", order: 8 },
      { id: "img-sanh-9", src: "/images/KGLV/CĐTT 2 LỐI VÀO.png", caption: "Chuyên đề truyền thống 2 - Lối vào", order: 9 },
      { id: "img-sanh-10", src: "/images/KGLV/BẢNG LỊCH SỬ & KỈ NIỆM CHƯƠNG.png", caption: "Bảng lịch sử & kỷ niệm chương", order: 10 },
    ],
  },
  {
    id: "nhamay1",
    name: "Nhà máy 1",
    icon: "factory",
    order: 2,
    images: [
      { id: "img-nm1-1", src: "/images/KGLV/CĐTT 2 GÓC QUI TRÌNH GIÀY.png", caption: "Quy trình sản xuất giày SKECHERS", order: 1 },
      { id: "img-nm1-2", src: "/images/tbs-factory-plant.png", caption: "Toàn cảnh xưởng may Nhà máy 1", order: 2 },
      { id: "img-nm1-3", src: "/images/tbs-gate.jpg", caption: "Lối vào khu vực sản xuất Nhà máy 1", order: 3 },
      { id: "img-nm1-4", src: "/images/crawled/56.webp", caption: "Dây chuyền gò dán tự động", order: 4 },
      { id: "img-nm1-5", src: "/images/crawled/58.webp", caption: "Khu vực kiểm định chất lượng hàng ngày", order: 5 },
      { id: "img-nm1-6", src: "/images/crawled/60.webp", caption: "Hệ thống băng chuyền thông minh", order: 6 },
      { id: "img-nm1-7", src: "/images/crawled/04.webp", caption: "Tổ máy may công nghệ cao", order: 7 },
      { id: "img-nm1-8", src: "/images/crawled/05.webp", caption: "Khu hoàn thiện sản phẩm", order: 8 },
      { id: "img-nm1-9", src: "/images/crawled/005.webp", caption: "Đội ngũ công nhân kỹ thuật lành nghề", order: 9 },
      { id: "img-nm1-10", src: "/images/crawled/Da-giay1.jpg", caption: "Góc ép đế giày tự động", order: 10 },
      { id: "img-nm1-11", src: "/images/crawled/04_LOGISTICS.jpg", caption: "Khu vực logistics Nhà máy 1", order: 11 },
      { id: "img-nm1-12", src: "/images/crawled/05_HOSPITALITY.jpg", caption: "Khu tiếp nhận nguyên liệu xưởng 1", order: 12 },
    ],
  },
  {
    id: "nhamay2",
    name: "Nhà máy 2",
    icon: "factory",
    order: 3,
    images: [
      { id: "img-nm2-1", src: "/images/tbs-factory-plant.png", caption: "Khu xưởng gò Nhà máy 2", order: 1 },
      { id: "img-nm2-2", src: "/images/crawled/56.webp", caption: "Băng chuyền sản xuất thể thao SKECHERS", order: 2 },
      { id: "img-nm2-3", src: "/images/crawled/58.webp", caption: "Khu vực sấy gò tự động", order: 3 },
      { id: "img-nm2-4", src: "/images/crawled/60.webp", caption: "Tổ kiểm định 100% sản phẩm", order: 4 },
      { id: "img-nm2-5", src: "/images/crawled/04.webp", caption: "Khu vực cắt laser tự động", order: 5 },
      { id: "img-nm2-6", src: "/images/crawled/05.webp", caption: "Dây chuyền dán đế tự động", order: 6 },
      { id: "img-nm2-7", src: "/images/crawled/005.webp", caption: "Bảng quản trị Kaizen tại chuyền", order: 7 },
      { id: "img-nm2-8", src: "/images/crawled/Da-giay1.jpg", caption: "Khu vực đóng gói xuất khẩu", order: 8 },
      { id: "img-nm2-9", src: "/images/tbs-gate.jpg", caption: "Khuôn viên xanh Nhà máy 2", order: 9 },
      { id: "img-nm2-10", src: "/images/crawled/04_LOGISTICS.jpg", caption: "Kho nguyên liệu Nhà máy 2", order: 10 },
      { id: "img-nm2-11", src: "/images/crawled/05_HOSPITALITY.jpg", caption: "Khu nghỉ giải lao xưởng 2", order: 11 },
    ],
  },
  {
    id: "nhamay3",
    name: "Nhà máy 3",
    icon: "factory",
    order: 4,
    images: [
      { id: "img-nm3-1", src: "/images/crawled/56.webp", caption: "Tổ hợp xưởng may Nhà máy 3", order: 1 },
      { id: "img-nm3-2", src: "/images/crawled/58.webp", caption: "Chuyền sản xuất dòng sản phẩm Work Shoes", order: 2 },
      { id: "img-nm3-3", src: "/images/crawled/60.webp", caption: "Thiết bị kiểm tra độ bền kéo đế", order: 3 },
      { id: "img-nm3-4", src: "/images/crawled/04.webp", caption: "Hệ thống chiếu sáng tự nhiên nhà xưởng", order: 4 },
      { id: "img-nm3-5", src: "/images/crawled/05.webp", caption: "Khu vực phân loại bán thành phẩm", order: 5 },
      { id: "img-nm3-6", src: "/images/crawled/005.webp", caption: "Tổ may tự động hóa", order: 6 },
      { id: "img-nm3-7", src: "/images/crawled/Da-giay1.jpg", caption: "Máy kiểm tra kim loại tự động", order: 7 },
      { id: "img-nm3-8", src: "/images/tbs-factory-plant.png", caption: "Cảnh quan xanh xung quanh Nhà máy 3", order: 8 },
      { id: "img-nm3-9", src: "/images/crawled/04_LOGISTICS.jpg", caption: "Khu xuất hàng tập trung Nhà máy 3", order: 9 },
      { id: "img-nm3-10", src: "/images/crawled/05_HOSPITALITY.jpg", caption: "Phòng họp kỹ thuật tại chuyền", order: 10 },
    ],
  },
  {
    id: "vpdieuhanh",
    name: "Văn phòng Điều hành",
    icon: "briefcase",
    order: 5,
    images: [
      { id: "img-vp-1", src: "/images/KGLV/CĐTT 2 GÓC HÌNH VP2.png", caption: "Sảnh điều hành trung tâm TBS Kiên Giang", order: 1 },
      { id: "img-vp-2", src: "/images/KGLV/SẢNH GÓC TỪ TRONG NHÌN RA.png", caption: "Hành lang kết nối khu văn phòng", order: 2 },
      { id: "img-vp-3", src: "/images/tbs-hands.png", caption: "Phòng làm việc Ban Giám đốc", order: 3 },
      { id: "img-vp-4", src: "/images/tbs-team-banner.png", caption: "Khu vực họp điều hành nhanh hằng ngày", order: 4 },
      { id: "img-vp-5", src: "/images/crawled/03_INVESTMENT_ASSET_MANAGEMENT.jpg", caption: "Phòng quản lý dự án & đầu tư", order: 5 },
      { id: "img-vp-6", src: "/images/crawled/2023.jpg", caption: "Góc làm việc hiện đại mở rộng", order: 6 },
      { id: "img-vp-7", src: "/images/crawled/2024.jpg", caption: "Không gian làm việc sáng tạo", order: 7 },
      { id: "img-vp-8", src: "/images/KGLV/MẶT TIỀN SẢNH.png", caption: "Khu vực tiếp đối tác quốc tế SKECHERS", order: 8 },
    ],
  },
  {
    id: "qc",
    name: "Phòng QC",
    icon: "check-shield",
    order: 6,
    images: [
      { id: "img-qc-1", src: "/images/KGLV/PHÒNG R&D.png", caption: "Phòng Lab kiểm định chất lượng R&D", order: 1 },
      { id: "img-qc-2", src: "/images/KGLV/CĐTT 1 LỐI ĐI XUỐNG KV MẪU.png", caption: "Khu vực kiểm tra mẫu thử nghiệm", order: 2 },
      { id: "img-qc-3", src: "/images/crawled/58.webp", caption: "Bàn thử nghiệm độ co giãn da & vải", order: 3 },
      { id: "img-qc-4", src: "/images/crawled/60.webp", caption: "Máy đo màu quang phổ chuẩn SKECHERS", order: 4 },
      { id: "img-qc-5", src: "/images/crawled/56.webp", caption: "Khu thử nghiệm mài mòn đế giày", order: 5 },
      { id: "img-qc-6", src: "/images/crawled/04.webp", caption: "Phòng kiểm tra khả năng chống nước", order: 6 },
      { id: "img-qc-7", src: "/images/crawled/05.webp", caption: "Tủ thử nghiệm lão hóa nhiệt độ", order: 7 },
      { id: "img-qc-8", src: "/images/crawled/005.webp", caption: "Bảng lưu trữ mẫu chuẩn Golden Sample", order: 8 },
      { id: "img-qc-9", src: "/images/crawled/Da-giay1.jpg", caption: "Khu vực cấp chứng nhận QC theo lô", order: 9 },
    ],
  },
  {
    id: "it",
    name: "Phòng IT",
    icon: "monitor",
    order: 7,
    images: [
      { id: "img-it-1", src: "/images/crawled/03_INVESTMENT_ASSET_MANAGEMENT.jpg", caption: "Phòng máy chủ Server Data Center", order: 1 },
      { id: "img-it-2", src: "/images/crawled/2024.jpg", caption: "Khu vực hỗ trợ hạ tầng công nghệ thông tin", order: 2 },
      { id: "img-it-3", src: "/images/crawled/2023.jpg", caption: "Hệ thống màn hình giám sát MES thời gian thực", order: 3 },
      { id: "img-it-4", src: "/images/crawled/2022.jpg", caption: "Góc phát triển phần mềm Kaizen & ERP", order: 4 },
      { id: "img-it-5", src: "/images/crawled/2021.jpg", caption: "Tủ mạng & thiết bị kết nối IoT nhà máy", order: 5 },
      { id: "img-it-6", src: "/images/crawled/2020.jpg", caption: "Phòng trực điều hành an ninh mạng", order: 6 },
    ],
  },
  {
    id: "hr",
    name: "Phòng Nhân sự",
    icon: "users",
    order: 8,
    images: [
      { id: "img-hr-1", src: "/images/tbs-team-banner.png", caption: "Phòng tiếp đón nhân sự & tuyển dụng", order: 1 },
      { id: "img-hr-2", src: "/images/crawled/06_RETAIL.jpg", caption: "Khu vực đào tạo kỹ năng công nhân mới", order: 2 },
      { id: "img-hr-3", src: "/images/crawled/2019.jpg", caption: "Góc làm việc bộ phận chế độ & chính sách", order: 3 },
      { id: "img-hr-4", src: "/images/crawled/2018.jpg", caption: "Phòng truyền thông nội bộ & văn hóa", order: 4 },
      { id: "img-hr-5", src: "/images/crawled/2017.jpg", caption: "Không gian sinh hoạt công đoàn TBS", order: 5 },
      { id: "img-hr-6", src: "/images/crawled/bg-2024.jpg", caption: "Khu tư vấn & giải đáp chế độ người lao động", order: 6 },
      { id: "img-hr-7", src: "/images/crawled/bg-2023.jpg", caption: "Phòng lưu trữ hồ sơ nhân sự bảo mật", order: 7 },
    ],
  },
  {
    id: "ketoan",
    name: "Phòng Kế toán",
    icon: "file-text",
    order: 9,
    images: [
      { id: "img-kt-1", src: "/images/KGLV/PHÒNG THƯ VIỆN VẬT TƯ.png", caption: "Khu vực đối soát tài sản & chứng từ vật tư", order: 1 },
      { id: "img-kt-2", src: "/images/crawled/2023.jpg", caption: "Phòng kế toán tổng hợp & tài chính", order: 2 },
      { id: "img-kt-3", src: "/images/crawled/2022.jpg", caption: "Góc nghiệp vụ thanh toán quốc tế SKECHERS", order: 3 },
      { id: "img-kt-4", src: "/images/crawled/2021.jpg", caption: "Tủ lưu trữ hóa đơn & chứng từ thuế", order: 4 },
      { id: "img-kt-5", src: "/images/crawled/2020.jpg", caption: "Bàn làm việc bộ phận chi phí & ngân sách", order: 5 },
      { id: "img-kt-6", src: "/images/crawled/2019.jpg", caption: "Phòng họp kiểm toán & tài chính định kỳ", order: 6 },
    ],
  },
  {
    id: "phonghop",
    name: "Phòng Họp",
    icon: "users-round",
    order: 10,
    images: [
      { id: "img-ph-1", src: "/images/KGLV/CĐTT 2 GÓC HÌNH VP2.png", caption: "Phòng họp hội nghị quốc tế 50 chỗ", order: 1 },
      { id: "img-ph-2", src: "/images/KGLV/SẢNH GÓC TỪ TRONG NHÌN RA.png", caption: "Phòng họp điều hành nhanh Ban Giám đốc", order: 2 },
      { id: "img-ph-3", src: "/images/crawled/05_HOSPITALITY.jpg", caption: "Phòng họp nhóm thiết kế & kỹ thuật", order: 3 },
      { id: "img-ph-4", src: "/images/crawled/06_RETAIL.jpg", caption: "Phòng họp trao đổi đối tác SKECHERS", order: 4 },
      { id: "img-ph-5", src: "/images/crawled/2024.jpg", caption: "Phòng họp trực tuyến Video Conference", order: 5 },
      { id: "img-ph-6", src: "/images/crawled/2023.jpg", caption: "Phòng họp sáng tạo & Kaizen", order: 6 },
      { id: "img-ph-7", src: "/images/crawled/2022.jpg", caption: "Khu vực thảo luận mở hành lang phòng họp", order: 7 },
      { id: "img-ph-8", src: "/images/crawled/2021.jpg", caption: "Phòng họp đào tạo quy trình sản xuất", order: 8 },
    ],
  },
];

export const DEFAULT_LANDING_CMS: LandingCMSConfig = {
  hero: {
    titlePrefix: "Tổ hợp Kiên Giang",
    titleHighlight: "TBS Group",
    quoteItalic: "“Excellence in Manufacturing. Excellence in Leadership.”",
    description:
      "Không gian điều hành đại diện cho năng lực quản trị, văn hóa doanh nghiệp và tiêu chuẩn vận hành của Tổ hợp Kiên Giang - TBS Group. Thiết kế hướng đến sự tinh gọn, hiện đại và chuyên nghiệp, phản ánh vị thế của một doanh nghiệp sản xuất trong chuỗi cung ứng toàn cầu.",
    bgImage: "/images/tbs-gate.jpg",
    handsImage: "/images/tbs-hands.png",
    teamImage: "/images/tbs-team-banner.png",
    quoteBadgeText: "Chung sức kiến tạo tương lai",
    stat1Value: "30+",
    stat1Label: "Năm Kinh Nghiệm",
    stat2Value: "10M+",
    stat2Label: "Sản Phẩm / Năm",
    stat3Value: "5,000+",
    stat3Label: "Nhân Sự Vận Hành",
  },
  workspace: {
    headline: "Môi trường làm việc chuẩn Corporate",
    description:
      "Mỗi không gian được kiến tạo nhằm thúc đẩy hiệu suất, sự kết nối và tinh thần đổi mới. Đây là nơi đội ngũ cùng chia sẻ mục tiêu, nâng cao chất lượng và không ngừng hoàn thiện để mang đến những giá trị vượt kỳ vọng cho khách hàng và đối tác trên toàn cầu.",
    pillars: [
      {
        title: "Chuẩn mực không gian",
        desc: "Thiết kế hiện đại, tối giản theo tiêu chuẩn corporate, tạo nên môi trường làm việc chuyên nghiệp, đồng bộ và hiệu quả.",
      },
      {
        title: "Hiệu quả vận hành",
        desc: "Không gian được quy hoạch khoa học, tối ưu kết nối giữa các phòng ban, hỗ trợ quy trình điều hành nhanh chóng và chính xác.",
      },
      {
        title: "Bản sắc thương hiệu",
        desc: "Hệ thống nhận diện được ứng dụng xuyên suốt, phản ánh giá trị thương hiệu TBS và vị thế của doanh nghiệp trong chuỗi cung ứng toàn cầu.",
      },
      {
        title: "Môi trường truyền cảm hứng",
        desc: "Không gian mở, tiện nghi và thân thiện, khuyến khích sự hợp tác, sáng tạo và phát triển bền vững của đội ngũ.",
      },
    ],
  },
  workspaceDepartments: DEFAULT_WORKSPACE_DEPARTMENTS,
  excellence: {
    title: "Dấu Ấn Thương Hiệu & Đẳng Cấp Chuỗi Cung Ứng",
    description:
      "Tổ hợp Kiên Giang - TBS Group tuân thủ nghiêm ngặt các tiêu chuẩn chất lượng cao nhất của các đối tác chiến lược toàn cầu. Hệ thống áp dụng quy trình số hóa 100%, nâng cao năng suất và đảm bảo an toàn lao động.",
    image: "/images/tbs-factory-plant.png",
    points: [
      {
        title: "Vận Hành Chuẩn Hóa 4.0",
        desc: "Áp dụng hệ thống quản trị sản xuất số hóa (MES) và tự động hóa quy trình giúp kiểm soát thời gian thực.",
      },
      {
        title: "Cam Kết Bền Vững (ESG)",
        desc: "Sử dụng năng lượng mặt trời áp mái, giảm phát thải carbon và tuân thủ các chứng nhận an toàn hóa chất quốc tế.",
      },
      {
        title: "Phát Triển Con Người",
        desc: "Liên tục đào tạo nâng cao tay nghề cho hơn 5,000 cán bộ công nhân viên với môi trường nhân văn.",
      },
    ],
  },
  products: {
    title: "Sản Phẩm Skechers Nổi Bật",
    description:
      "Các dòng sản phẩm giày thể thao, thời trang và bảo hộ lao động đạt tiêu chuẩn xuất khẩu sang các thị trường toàn cầu.",
    items: [
      { name: "Skechers Performance GoRun", code: "SK-P001", image: "/images/brands/256000.png" },
      { name: "Skechers Lifestyle Arch Fit", code: "SK-L002", image: "/images/crawled/56.webp" },
      { name: "Skechers Work Steel Toe", code: "SK-W003", image: "/images/brands/256026.png" },
      { name: "Skechers Outdoor Trail", code: "SK-O004", image: "/images/brands/256133.jpg" },
    ],
  },
  brandPartners: DEFAULT_BRAND_PARTNERS,
  shoeLines: DEFAULT_SHOE_LINES_CONFIG,
};

export const CMS_STORAGE_KEY = "tbs_landing_cms";

export function getLandingCMS(): LandingCMSConfig {
  if (typeof window === "undefined") return DEFAULT_LANDING_CMS;
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) return DEFAULT_LANDING_CMS;
    const parsed = JSON.parse(raw);

    const storedProducts = parsed.products || {};
    const storedItems = storedProducts.items || [];
    const mergedItems = [...storedItems];
    for (const defItem of DEFAULT_LANDING_CMS.products.items) {
      if (!mergedItems.some((i: any) => i.code === defItem.code)) {
        mergedItems.push(defItem);
      }
    }

    const cleanedPartners = Array.isArray(parsed.brandPartners)
      ? parsed.brandPartners.filter((p: any) => p && p.id && p.name && p.logo)
      : DEFAULT_BRAND_PARTNERS;

    const existingIds = new Set(cleanedPartners.map((p: BrandPartner) => p.id));
    const mergedPartners = [...cleanedPartners];
    for (const defPartner of DEFAULT_BRAND_PARTNERS) {
      if (!existingIds.has(defPartner.id)) {
        mergedPartners.push(defPartner);
      }
    }

    const rawShoeLines = parsed.shoeLines && Array.isArray(parsed.shoeLines.groups) && parsed.shoeLines.groups.length > 0
      ? parsed.shoeLines
      : DEFAULT_SHOE_LINES_CONFIG;

    const rawWorkspaceDeps = Array.isArray(parsed.workspaceDepartments) && parsed.workspaceDepartments.length > 0
      ? parsed.workspaceDepartments
      : DEFAULT_WORKSPACE_DEPARTMENTS;

    return {
      hero: { ...DEFAULT_LANDING_CMS.hero, ...(parsed.hero || {}) },
      workspace: { ...DEFAULT_LANDING_CMS.workspace, ...(parsed.workspace || {}) },
      workspaceDepartments: rawWorkspaceDeps,
      excellence: { ...DEFAULT_LANDING_CMS.excellence, ...(parsed.excellence || {}) },
      products: {
        title: storedProducts.title || DEFAULT_LANDING_CMS.products.title,
        description: storedProducts.description || DEFAULT_LANDING_CMS.products.description,
        items: mergedItems,
      },
      brandPartners: mergedPartners,
      shoeLines: {
        title: rawShoeLines.title || DEFAULT_SHOE_LINES_CONFIG.title,
        groups: rawShoeLines.groups || DEFAULT_SHOE_GROUPS,
      },
    };
  } catch (e) {
    return DEFAULT_LANDING_CMS;
  }
}

export function saveLandingCMS(config: LandingCMSConfig) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("tbs_landing_cms_updated"));
  }
}
