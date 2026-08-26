"use client";

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
}

export const DEFAULT_LANDING_CMS: LandingCMSConfig = {
  hero: {
    titlePrefix: "Văn Phòng Chuỗi",
    titleHighlight: "SKECHERS - TBS Group",
    quoteItalic: "“Excellence in Manufacturing. Excellence in Leadership.”",
    description:
      "Không gian điều hành đại diện cho năng lực quản trị, văn hóa doanh nghiệp và tiêu chuẩn vận hành của ngành SKECHERS - TBS Group. Thiết kế hướng đến sự tinh gọn, hiện đại và chuyên nghiệp, phản ánh vị thế của một doanh nghiệp sản xuất trong chuỗi cung ứng toàn cầu.",
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
  excellence: {
    title: "Dấu Ấn Thương Hiệu & Đẳng Cấp Chuỗi Cung Ứng",
    description:
      "Văn Phòng Chuỗi SKECHERS - TBS Group tuân thủ nghiêm ngặt các tiêu chuẩn chất lượng cao nhất của đối tác SKECHERS toàn cầu. Hệ thống áp dụng quy trình số hóa 100%, nâng cao năng suất và đảm bảo an toàn lao động.",
    image: "/images/tbs-factory-plant.png",
    points: [
      {
        title: "Vận Hành Chuẩn Hóa 4.0",
        desc: "Tự động hóa báo cáo sự cố Gemba Walk và đánh giá Cải tiến CI.",
      },
      {
        title: "Kiểm Soát Chất Lượng Thời Gian Thực",
        desc: "BI Dashboard đo lường chỉ số OEE và tỷ lệ lỗi trên từng chuyền sản xuất.",
      },
      {
        title: "Tối Ưu Kaizen Bằng Trí Tuệ Nhân Tạo",
        desc: "Tích hợp AI Groq so sánh trùng lặp ý tưởng Kaizen thông minh.",
      },
    ],
  },
  products: {
    title: "Dòng Sản Phẩm Tiêu Biểu SKECHERS",
    description:
      "Các mẫu sản phẩm thuộc chuỗi cung ứng SKECHERS được sản xuất và kiểm soát chất lượng tại hệ thống nhà máy TBS Group.",
    items: [
      { name: "Performance Footwear", code: "SK-PERF-01", image: "/images/crawled/Da-giay1.jpg" },
      { name: "Lifestyle Casual Shoes", code: "SK-LIFE-02", image: "/images/crawled/04.webp" },
      { name: "Athletic Sport Line", code: "SK-SPORT-03", image: "/images/crawled/05.webp" },
      { name: "Work & Safety Shoes", code: "SK-WORK-04", image: "/images/crawled/56.webp" },
      { name: "Outdoor Trekking Series", code: "SK-OUT-05", image: "/images/crawled/58.webp" },
      { name: "Kids Comfort Collection", code: "SK-KIDS-06", image: "/images/crawled/60.webp" },
      { name: "Handbag & Accessories", code: "SK-ACC-07", image: "/images/crawled/Tui-xach1.jpg" },
      { name: "Special Edition Series", code: "SK-SPEC-08", image: "/images/crawled/005.webp" },
    ],
  },
};

export const CMS_STORAGE_KEY = "tbs_landing_cms";

export function getLandingCMS(): LandingCMSConfig {
  if (typeof window === "undefined") return DEFAULT_LANDING_CMS;
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) return DEFAULT_LANDING_CMS;
    const parsed = JSON.parse(raw);
    const storedProducts = parsed.products || {};
    const rawItems = Array.isArray(storedProducts.items) && storedProducts.items.length > 0
      ? storedProducts.items
      : DEFAULT_LANDING_CMS.products.items;

    const mergedItems = rawItems.map((item: any, idx: number) => {
      const defaultItem = DEFAULT_LANDING_CMS.products.items[idx] || DEFAULT_LANDING_CMS.products.items[0];
      return {
        name: item.name || defaultItem.name,
        code: item.code || defaultItem.code,
        image: item.image || defaultItem?.image || "/images/crawled/Da-giay1.jpg",
      };
    });

    return {
      hero: { ...DEFAULT_LANDING_CMS.hero, ...(parsed.hero || {}) },
      workspace: { ...DEFAULT_LANDING_CMS.workspace, ...(parsed.workspace || {}) },
      excellence: { ...DEFAULT_LANDING_CMS.excellence, ...(parsed.excellence || {}) },
      products: {
        title: storedProducts.title || DEFAULT_LANDING_CMS.products.title,
        description: storedProducts.description || DEFAULT_LANDING_CMS.products.description,
        items: mergedItems,
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
