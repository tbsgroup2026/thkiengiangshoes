"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconCalendar, IconEye, IconNews, IconExternalLink } from "@tabler/icons-react";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category_name: string;
  category_slug: string;
  category_color: string;
  featured_image: string | null;
  tags: string;
  is_featured: boolean;
  view_count: number;
  source_name: string;
  published_at: string;
  created_at: string;
}

const FALLBACK_IMAGES = [
  "/images/crawled/TBS-GROUP_team_1836-x-765-2.jpg",
  "/images/crawled/TBS-GROUP_chong-dich_1836-x-765-2.jpg",
  "/images/crawled/TB-Nghi%CC%89-Te%CC%82%CC%81t_16-9-Group-2.jpg",
  "/images/crawled/05.webp",
  "/images/crawled/56.webp",
  "/images/crawled/60.webp",
];

const CATEGORY_LABELS: Record<string, string> = {
  "tin-tap-doan": "Tập đoàn",
  "san-xuat-cong-nghiep": "Sản xuất",
  "doi-tac-chien-luoc": "Đối tác",
  "su-kien-hoi-thao": "Sự kiện",
  "phat-trien-ben-vung": "Bền vững",
  "noi-bo-van-hoa": "Nội bộ",
  "cong-nghe-doi-moi": "Công nghệ",
  "bat-dong-san-ha-tang": "Bất động sản",
};

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ slug: string; name: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const [newsRes, catRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/news?limit=6"),
          fetch("http://localhost:8000/api/v1/news/categories"),
        ]);
        if (newsRes.ok) {
          const data = await newsRes.json();
          setNews(data.items || []);
        }
        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data.map((c: any) => ({ slug: c.slug, name: c.name, count: c.news_count })));
        }
      } catch {
        console.warn("News API not available, showing fallback");
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const filteredNews = activeCategory
    ? news.filter((n) => n.category_slug === activeCategory)
    : news;

  return (
    <section id="news" className="relative py-24 lg:py-32 bg-[#f8faf9] overflow-hidden">
      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] tracking-[0.2em] uppercase font-bold">
              <IconNews size={14} /> Truyền Thông Tập Đoàn
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-tbs-dark">
              Tin tức & Sự kiện
            </h2>
            <p className="text-gray-500 text-base lg:text-lg">
              Cập nhật hoạt động đổi mới công nghệ, hội nghị chiến lược và phát triển bền vững của TBS Group.
            </p>
          </div>

          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                !activeCategory
                  ? "bg-tbs-dark text-white shadow-lg"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"
              }`}
            >
              Tất cả
            </button>
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                  activeCategory === cat.slug
                    ? "bg-tbs-dark text-white shadow-lg"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-300"
                }`}
              >
                {CATEGORY_LABELS[cat.slug] || cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-6 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredNews.length > 0 ? (
              filteredNews.map((item, i) => (
                <Link
                  href={`/news/${item.slug}`}
                  key={item.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.featured_image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Category badge */}
                    {item.category_name && (
                      <span
                        className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur"
                        style={{ backgroundColor: (item.category_color || "#1a56db") + "CC" }}
                      >
                        {item.category_name}
                      </span>
                    )}

                    {/* Featured badge */}
                    {item.is_featured && (
                      <span className="absolute top-4 right-4 px-2.5 py-1 bg-amber-400 text-tbs-dark rounded-full text-[9px] font-black uppercase tracking-wider">
                        ★ Nổi bật
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <IconCalendar size={13} />
                        {new Date(item.published_at).toLocaleDateString("vi-VN", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconEye size={13} />
                        {item.view_count || 0}
                      </span>
                    </div>

                    <h3 className="font-black text-base text-tbs-dark leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>
                    )}

                    <div className="pt-3 mt-auto flex items-center gap-2 text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                      Đọc tiếp <IconArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-400">
                <IconNews size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Chưa có tin tức nào trong danh mục này</p>
              </div>
            )}
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-12">
          <a
            href="/news"
            className="inline-flex items-center gap-2 bg-tbs-dark hover:bg-[#0a3025] text-white font-bold px-8 py-4 rounded-full text-sm tracking-wider uppercase shadow-xl transition-all hover:scale-[1.02]"
          >
            Xem Tất Cả Tin Tức
            <IconExternalLink size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
