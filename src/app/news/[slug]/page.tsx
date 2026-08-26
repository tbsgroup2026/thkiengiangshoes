import React from "react";
import Link from "next/link";
import { Navbar, Footer } from "@/components/home";
import { IconCalendar, IconEye, IconArrowLeft } from "@tabler/icons-react";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { slug: 'sample-news-1' },
    { slug: 'tbs-group-digital-transformation' }
  ];
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const sampleArticle = {
    id: 1,
    title: "TBS Group Đột Phá Trong Chuyển Đổi Số Vận Hành Nhà Máy",
    slug: slug,
    summary: "Hệ thống số hóa 100% quy trình giấy tờ biểu mẫu và tích hợp app mobile native bảo trì máy móc.",
    content: "<p>Hệ thống số hóa doanh nghiệp TBS Group áp dụng kiến trúc Next.js Web, Cloudflare D1/R2, C++ Shared Core và Native Android/iOS Apps giúp đo lường hiệu suất vận hành 24/7.</p>",
    category_name: "Chuyển Đổi Số",
    category_color: "#158a63",
    published_at: "2026-08-01",
    view_count: 1240,
    author_name: "Ban Công Nghệ TBS",
    featured_image: null,
    tags: "TBS Group, Chuyển đổi số, Smart Factory",
    source_url: null,
    source_name: "TBS Group",
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8faf9]">
      <Navbar />

      <article className="flex-grow pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-600 transition-colors mb-6">
            <IconArrowLeft size={16} /> Tin tức
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase text-white bg-accent">
              {sampleArticle.category_name}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <IconCalendar size={14} /> {sampleArticle.published_at}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <IconEye size={14} /> {sampleArticle.view_count} lượt xem
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-tbs-dark leading-[1.15] mb-4">
            {sampleArticle.title}
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed mb-8 border-l-4 border-emerald-400 pl-5 italic">
            {sampleArticle.summary}
          </p>

          <div
            className="prose prose-lg max-w-none prose-headings:text-tbs-dark prose-headings:font-black prose-a:text-emerald-600 prose-strong:text-tbs-dark prose-img:rounded-2xl prose-li:text-gray-600 prose-p:text-gray-600 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sampleArticle.content }}
          />
        </div>
      </article>

      <Footer />
    </div>
  );
}
