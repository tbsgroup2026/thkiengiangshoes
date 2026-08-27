export interface CompanyStat {
  value: string;
  label: string;
  description: string;
}

export interface CompanySector {
  id: string;
  title: string;
  description: string;
  highlight: string;
  /** Tabler icon name — resolved in component */
  icon: string;
  image: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export const COMPANY_INFO = {
  name: "TBS GROUP - Công Ty Cổ Phần Thái Bình Kiên Giang",
  shortName: "TBS GROUP - Công Ty Cổ Phần Thái Bình Kiên Giang",
  subTitle: "Hệ Thống Quản Trị Vận Hành Công Ty Cổ Phần Thái Bình Kiên Giang",
  slogan: "Nâng Tầm Chuỗi Cung Ứng — Vận Hành Chuẩn Quốc Tế",
  intro:
    "Tổ hợp Kiên Giang - TBS Group là trung tâm điều hành vận hành sản xuất tại khu vực Kiên Giang của TBS Group, chuyển đổi số toàn diện quy trình Gemba Walk, Cải tiến CI, Kaizen và quản trị hằng ngày.",
  contact: {
    address:
      "Tổ hợp Kiên Giang — TBS Group, Tỉnh Kiên Giang, Việt Nam",
    headquarter: "Tổ hợp Kiên Giang — TBS Group, Tỉnh Kiên Giang",
    phone: "0296 3878 099",
    email: "kiengiang-office@tbsgroup.vn",
    website: "https://www.tbsgroup.vn",
  },
};

export const COMPANY_STATS: CompanyStat[] = [
  {
    value: "32",
    label: "Năm phát triển",
    description:
      "Hành trình từ 1989 với khát vọng đưa công nghiệp Việt Nam hội nhập chuỗi giá trị toàn cầu.",
  },
  {
    value: "6",
    label: "Ngành trụ cột",
    description:
      "Da giày, Túi xách, BĐS & Hạ tầng, Logistics, Du lịch khách sạn và Thương mại dịch vụ.",
  },
  {
    value: "24.7M",
    label: "Đôi giày mỗi năm",
    description:
      "Năng lực sản xuất toàn tập đoàn với 33 chuyền công nghệ cao vận hành liên tục.",
  },
  {
    value: "10.3M",
    label: "Sản phẩm mỗi năm",
    description:
      "Sản lượng Tổ hợp Kiên Giang cung ứng cho các đối tác chiến lược quốc tế.",
  },
  {
    value: "51,200",
    label: "Nhân sự toàn cầu",
    description:
      "Đội ngũ chuyên nghiệp toàn hệ thống, trong đó 5,000 nhân sự tại Tổ hợp Kiên Giang.",
  },
  {
    value: "218,500 m²",
    label: "Kho bãi logistics",
    description:
      "Trung tâm ICD TBS Tân Vạn — sức chứa 60,000 container tại vùng kinh tế phía Nam.",
  },
];

export const COMPANY_SECTORS: CompanySector[] = [
  {
    id: "da-giay",
    title: "Sản xuất công nghiệp da giày",
    description:
      "Duy trì vị thế dẫn đầu với sản phẩm đạt tiêu chuẩn chất lượng quốc tế. Sở hữu 33 chuyền sản xuất hiện đại cùng 17,000 công nhân tay nghề cao.",
    highlight: "24.7 triệu đôi/năm · 33 chuyền sản xuất",
    icon: "IconShoe",
    image:
      "https://www.tbsgroup.vn/wp-content/uploads/2014/12/Da-giay1.jpg",
  },
  {
    id: "tui-xach",
    title: "Sản xuất công nghiệp túi xách",
    description:
      "Cung cấp túi xách cao cấp cho các thương hiệu hàng đầu thế giới. Tăng trưởng bình quân 19.7% mỗi năm.",
    highlight: "10.3 triệu sản phẩm · Tăng trưởng 19.7%/năm",
    icon: "IconBackpack",
    image:
      "https://www.tbsgroup.vn/wp-content/uploads/2014/12/Tui-xach1.jpg",
  },
  {
    id: "logistics",
    title: "Cảng & Dịch vụ Logistics",
    description:
      "ICD TBS Tân Vạn tọa lạc tại vị trí chiến lược tứ giác kinh tế TP.HCM – Bình Dương – Đồng Nai – Vũng Tàu.",
    highlight: "218,500 m² kho · 60,000 container",
    icon: "IconShip",
    image:
      "https://www.tbsgroup.vn/wp-content/uploads/2014/12/04_LOGISTICS.jpg",
  },
  {
    id: "bds",
    title: "Đầu tư BĐS & Hạ tầng công nghiệp",
    description:
      "Phát triển, quản lý và vận hành các khu công nghiệp, dự án bất động sản công nghiệp và khu đô thị dân dụng quy mô lớn.",
    highlight: "Khu công nghiệp & Khu đô thị cao cấp",
    icon: "IconBuildingSkyscraper",
    image:
      "https://www.tbsgroup.vn/wp-content/uploads/2014/12/03_INVESTMENT_ASSET_MANAGEMENT.jpg",
  },
  {
    id: "hospitality",
    title: "Du lịch, Khách sạn & Sân Golf",
    description:
      "Đầu tư và quản lý chuỗi khách sạn 5 sao thương hiệu Mai House, khu nghỉ dưỡng cao cấp và sân golf tiêu chuẩn quốc tế.",
    highlight: "Mai House Hotels 5★ & Montgomerie Links",
    icon: "IconBuildingStore",
    image:
      "https://www.tbsgroup.vn/wp-content/uploads/2014/12/05_HOSPITALITY.jpg",
  },
  {
    id: "retail",
    title: "Thương Mại & Phân Phối Dịch Vụ",
    description:
      "Phân phối độc quyền thương hiệu thời trang ECCO và các nhãn hàng quốc tế uy tín tại thị trường Việt Nam.",
    highlight: "Phân phối độc quyền thương hiệu ECCO",
    icon: "IconShoppingBag",
    image:
      "https://www.tbsgroup.vn/wp-content/uploads/2014/12/06_RETAIL.jpg",
  },
];

export const COMPANY_TIMELINE: TimelineEvent[] = [
  {
    year: "2017",
    title: "Khởi nguồn hành trình Tổ hợp Kiên Giang",
    subtitle: "Đặt nền móng cơ sở hạ tầng & đào tạo nhân lực",
    description:
      "TBS Group chính thức triển khai dự án Tổ hợp Kiên Giang - TBS Group. Đón đoàn đánh giá của đối tác chiến lược quốc tế Decathlon và khởi công Block 1 nhà máy.",
    image: "https://tbs-thoaisonshoes.com/images/slides/05.webp",
  },
  {
    year: "2018",
    title: "Dấu ấn sản phẩm xuất khẩu đầu tiên",
    subtitle: "Sản xuất thành công đôi giày Decathlon đầu tiên",
    description:
      "Khởi công trạm xử lý nước thải hiện đại. Tháng 11/2018 ghi dấu mốc lịch sử khi đôi giày Decathlon đầu tiên xuất xưởng đạt chuẩn chất lượng quốc tế.",
    image: "https://tbs-thoaisonshoes.com/images/slides/56.webp",
  },
  {
    year: "2019",
    title: "Vận hành ổn định & mở rộng chuyền",
    subtitle: "Hoàn thiện quy trình & chuẩn hóa năng suất",
    description:
      "Dây chuyền sản xuất đi vào hoạt động ổn định với 33 chuyền, đáp ứng xuất sắc các tiêu chí về sản lượng và tiêu chuẩn an toàn lao động.",
    image: "https://tbs-thoaisonshoes.com/images/slides/60.webp",
  },
  {
    year: "2020",
    title: "Thích ứng linh hoạt vượt đại dịch",
    subtitle: "Số hóa báo cáo & giám sát từ xa",
    description:
      "Ứng dụng các giải pháp quản lý linh hoạt, số hóa quy trình báo cáo và duy trì hoạt động sản xuất an toàn thông suốt trong giai đoạn dịch bệnh.",
    image: "https://tbs-thoaisonshoes.com/images/slides/58.webp",
  },
  {
    year: "2021",
    title: "Phát triển bền vững & môi trường",
    subtitle: "Tối ưu hóa năng lượng & an toàn lao động",
    description:
      "Đẩy mạnh các chương trình cải tiến môi trường làm việc, đầu tư hệ thống năng lượng xanh và đào tạo nâng cao tay nghề cho đội ngũ nhân sự.",
    image: "https://tbs-thoaisonshoes.com/images/slides/04.webp",
  },
  {
    year: "2022–2023",
    title: "Mở rộng quy mô & nâng cao chất lượng",
    subtitle: "Chạm mốc 10 triệu sản phẩm mỗi năm",
    description:
      "Nâng cấp trang thiết bị hiện đại, mở rộng công suất sản xuất chạm mốc 10 triệu đôi giày mỗi năm cho Tổ hợp Kiên Giang - TBS Group.",
    image: "https://tbs-thoaisonshoes.com/images/slides/005.webp",
  },
  {
    year: "2024–2025",
    title: "Chuyển đổi số toàn diện TBS II",
    subtitle: "Xây dựng mô hình nhà máy thông minh Industry 4.0",
    description:
      "Triển khai hệ thống TBS II: số hóa 100% giấy tờ biểu mẫu, tích hợp app mobile native quét QR báo lỗi máy thời gian thực và BI Dashboard 24/7.",
    image:
      "https://www.tbsgroup.vn/wp-content/uploads/2014/12/TBS-GROUP_team_1836-x-765-2.jpg",
  },
];
