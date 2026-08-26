"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar, Footer } from "@/components/home";
import {
  IconSearch, IconCalendar, IconEye, IconArrowRight,
  IconNews, IconChevronLeft, IconChevronRight, IconX
} from "@tabler/icons-react";

interface NewsItem {
  id: number; title: string; slug: string; summary: string;
  category_name: string; category_slug: string; category_color: string;
  featured_image: string | null; tags: string;
  is_featured: boolean; view_count: number; source_name: string;
  published_at: string; created_at: string;
}

const FALLBACK_IMAGES = [
  "/images/crawled/TBS-GROUP_team_1836-x-765-2.jpg",
  "/images/crawled/TBS-GROUP_chong-dich_1836-x-765-2.jpg",
  "/images/crawled/TB-Nghi%CC%89-Te%CC%82%CC%81t_16-9-Group-2.jpg",
  "/images/crawled/05.webp",
  "/images/crawled/56.webp",
  "/images/crawled/60.webp",
];

const CATEGORIES = [
  { slug: "", name: "Tất cả" },
  { slug: "tin-tap-doan", name: "Tin Tập đoàn" },
  { slug: "san-xuat-cong-nghiep", name: "Sản xuất" },
  { slug: "doi-tac-chien-luoc", name: "Đối tác" },
  { slug: "su-kien-hoi-thao", name: "Sự kiện" },
  { slug: "phat-trien-ben-vung", name: "Bền vững" },
  { slug: "noi-bo-van-hoa", name: "Nội bộ" },
  { slug: "cong-nghe-doi-moi", name: "Công nghệ" },
];

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Read ?category= from URL on mount
  const getInitialCategory = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || "";
  };
  const [categorySlug, setCategorySlug] = useState(getInitialCategory);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "9");
      if (categorySlug) params.set("category_slug", categorySlug);
      if (search) params.set("search", search);

      const res = await fetch(`http://localhost:8000/api/v1/news?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNews(data.items || []);
        setTotalPages(data.pagination?.total_pages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch { console.warn("News API unavailable"); }
    finally { setLoading(false); }
  }, [page, categorySlug, search]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8faf9]">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-12 bg-tbs-dark">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-[10px] tracking-[0.2em] uppercase font-bold mb-4">
            <IconNews size={14} /> Truyền Thông
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">Tin tức & Sự kiện</h1>
          <p className="text-white/50 mt-3 max-w-xl mx-auto">
            Cập nhật hoạt động mới nhất từ TBS Group
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm tin tức..."
              className="w-full px-5 py-4 pl-12 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 transition-colors"
            />
            <IconSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <IconX size={18} />
              </button>
            )}
          </form>
        </div>
      </section>

      {/* Category tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-[72px] z-30">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 flex gap-1 overflow-x-auto py-3 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setCategorySlug(cat.slug); setPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                categorySlug === cat.slug
                  ? "bg-tbs-dark text-white shadow"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <section className="flex-grow py-12">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-100" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-6 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item, i) => (
                  <Link href={`/news/${item.slug}`} key={item.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="relative h-52 overflow-hidden">
                      <img src={item.featured_image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                        alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {item.category_name && (
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase text-white backdrop-blur"
                          style={{ backgroundColor: (item.category_color || "#1a56db") + "CC" }}>
                          {item.category_name}
                        </span>
                      )}
                      {item.is_featured && (
                        <span className="absolute top-4 right-4 px-2 py-0.5 bg-amber-400 text-tbs-dark rounded-full text-[9px] font-black uppercase">★ Nổi bật</span>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow space-y-3">
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1"><IconCalendar size={13} />
                          {new Date(item.published_at).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1"><IconEye size={13} />{item.view_count || 0}</span>
                      </div>
                      <h3 className="font-black text-base text-tbs-dark leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                      {item.summary && <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{item.summary}</p>}
                      <div className="pt-2 mt-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        Đọc tiếp <IconArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 disabled:opacity-30 hover:border-emerald-300 transition-colors">
                    <IconChevronLeft size={18} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                          p === page ? "bg-tbs-dark text-white" : "bg-white border border-gray-200 hover:border-emerald-300"
                        }`}>{p}</button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 disabled:opacity-30 hover:border-emerald-300 transition-colors">
                    <IconChevronRight size={18} />
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-gray-400 mt-6">{total} bài viết</p>
            </>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <IconNews size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Không tìm thấy bài viết nào</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
