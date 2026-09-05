"use client";

import React from "react";

/**
 * Nhiều ảnh của 1 đề xuất Kaizen được LƯU GỘP thành 1 chuỗi phân cách bởi dấu phẩy trong đúng
 * 1 field (before_image_url / after_image_url) — xem KaizenPublicSubmitForm.tsx.
 */

export function splitImageUrls(raw?: string | null): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function firstImageUrl(raw?: string | null): string {
  return splitImageUrls(raw)[0] || "";
}

/** Ảnh đại diện tốt nhất để hiển thị: ưu tiên ảnh TRƯỚC, không có thì lấy ảnh SAU. */
export function primaryImageUrl(beforeRaw?: string | null, afterRaw?: string | null): string {
  return firstImageUrl(beforeRaw) || firstImageUrl(afterRaw);
}

export function normalizeCategoryId(catRaw?: string): string {
  if (!catRaw) return "PRODUCTIVITY";
  const cat = catRaw.trim();
  if (cat === "MATERIAL_SAVING" || cat === "SAVE_MATERIAL" || cat.includes("1.") || cat.includes("Vật tư") || cat.includes("Vat tu")) {
    return "MATERIAL_SAVING";
  }
  if (cat === "COST_SAVING" || cat === "SAVE_COST" || cat.includes("2.") || cat.includes("Chi phí") || cat.includes("Chi phi")) {
    return "COST_SAVING";
  }
  if (cat === "PRODUCTIVITY" || cat === "INCREASE_PRODUCTIVITY" || cat.includes("3.") || cat.includes("Năng suất") || cat.includes("Nang suat")) {
    return "PRODUCTIVITY";
  }
  if (cat === "SAFETY" || cat.includes("4.") || cat.includes("An toàn") || cat.includes("An toan")) {
    return "SAFETY";
  }
  if (cat === "5S" || cat.includes("5.")) {
    return "5S";
  }
  if (cat === "AUTOMATION" || cat.includes("6.") || cat.includes("Tự động") || cat.includes("Tu dong")) {
    return "AUTOMATION";
  }
  if (cat === "EQUIPMENT" || cat === "MMTB_CCDC" || cat.includes("7.") || cat.includes("MMTB") || cat.includes("CCDC")) {
    return "EQUIPMENT";
  }
  return "PRODUCTIVITY";
}

export function extractProposalVideos(proposal: any): { type: string; url: string; title: string }[] {
  const videos: { type: string; url: string; title: string }[] = [];
  const seenUrls = new Set<string>();

  const addVideo = (url?: string | null, type = "video", title = "Video Clip") => {
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed || seenUrls.has(trimmed)) return;
    seenUrls.add(trimmed);
    videos.push({ type, url: trimmed, title });
  };

  // 1. Extract from attachments_json if present
  if (proposal?.attachments_json) {
    try {
      const atts = typeof proposal.attachments_json === "string" ? JSON.parse(proposal.attachments_json) : proposal.attachments_json;
      if (Array.isArray(atts)) {
        atts.forEach((a: any) => {
          if (a && a.url) {
            const isVid =
              a.type?.startsWith("video") ||
              a.url.match(/\.(mp4|mov|webm|avi|mkv)$/i) ||
              a.url.includes("youtube.com") ||
              a.url.includes("youtu.be") ||
              a.url.includes("drive.google.com") ||
              (a.url.includes("cloudinary.com") && a.url.includes("/video/")) ||
              a.url.startsWith("data:video/");
            if (isVid) {
              addVideo(a.url, a.type || "video", a.title || "Video Clip");
            }
          }
        });
      }
    } catch (e) {}
  }

  // 2. Extract from direct video attributes
  const beforeVid = proposal?.before_video_url || proposal?.beforeVideoUrl || proposal?.before_video_link || proposal?.beforeVideoLink;
  const afterVid = proposal?.after_video_url || proposal?.afterVideoUrl || proposal?.after_video_link || proposal?.afterVideoLink;

  addVideo(beforeVid, "video_before", "Video TRƯỚC Cải Tiến");
  addVideo(afterVid, "video_after", "Video SAU Cải Tiến");

  // 3. Scan description fields (before_description & after_solution) for pasted video URLs
  const urlRegex = /(https?:\/\/[^\s<"']+)/gi;
  const scanTextForVideos = (text?: string | null, defaultTitle = "Video Clip") => {
    if (!text) return;
    const matches = text.match(urlRegex);
    if (matches) {
      matches.forEach((u) => {
        const cleanUrl = u.replace(/[.,;)]+$/, "");
        if (
          cleanUrl.match(/\.(mp4|mov|webm|avi|mkv)$/i) ||
          cleanUrl.includes("youtube.com") ||
          cleanUrl.includes("youtu.be") ||
          cleanUrl.includes("drive.google.com") ||
          (cleanUrl.includes("cloudinary.com") && cleanUrl.includes("/video/"))
        ) {
          addVideo(cleanUrl, "video", defaultTitle);
        }
      });
    }
  };

  scanTextForVideos(proposal?.before_description, "Video TRƯỚC Cải Tiến");
  scanTextForVideos(proposal?.after_solution, "Video SAU Cải Tiến");

  return videos;
}

export function UniversalVideoPlayer({ url, title }: { url: string; title?: string }) {
  if (!url) return null;
  const trimmedUrl = url.trim();

  // Helper to convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (link: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  // Helper to convert Google Drive view URL to preview embed format
  const getGoogleDriveEmbedUrl = (link: string) => {
    if (link.includes("drive.google.com")) {
      const matchFile = link.match(/\/file\/d\/([^\/\?]+)/);
      if (matchFile && matchFile[1]) {
        return `https://drive.google.com/file/d/${matchFile[1]}/preview`;
      }
      const matchId = link.match(/[?&]id=([^&]+)/);
      if (matchId && matchId[1]) {
        return `https://drive.google.com/file/d/${matchId[1]}/preview`;
      }
    }
    return null;
  };

  const ytEmbed = getYouTubeEmbedUrl(trimmedUrl);
  const driveEmbed = getGoogleDriveEmbedUrl(trimmedUrl);

  if (ytEmbed) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-300 bg-black shadow-2xs">
        <iframe src={ytEmbed} title={title || "YouTube Video"} className="w-full h-full" allowFullScreen />
      </div>
    );
  }

  if (driveEmbed) {
    return (
      <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-300 bg-black shadow-2xs">
        <iframe src={driveEmbed} title={title || "Google Drive Video"} className="w-full h-full" allow="autoplay" allowFullScreen />
      </div>
    );
  }

  // Standard video (Cloudinary, MP4, WEBM, MOV, Blob/Data URL)
  return (
    <div className="space-y-1.5 w-full">
      <video
        controls
        playsInline
        preload="metadata"
        src={trimmedUrl}
        className="w-full max-h-64 object-contain rounded-xl border border-slate-300 bg-black shadow-2xs"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const fallbackBtn = target.nextElementSibling as HTMLElement;
          if (fallbackBtn) fallbackBtn.style.display = "flex";
        }}
      />
      <div className="hidden flex-col items-center justify-center p-4 rounded-xl bg-slate-900 text-white text-center space-y-2 border border-slate-700">
        <span className="text-xs font-bold text-amber-300">🎬 Đã đính kèm Video Clip</span>
        <a
          href={trimmedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <span>▶️ Bấm để mở xem Video trực tiếp</span>
        </a>
      </div>
    </div>
  );
}

export interface MediaItem {
  type: "image" | "video";
  url: string;
  title?: string;
}

export interface KaizenMediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  currentIndex?: number;
}

export function KaizenMediaLightbox({
  isOpen,
  onClose,
  items,
  currentIndex = 0,
}: KaizenMediaLightboxProps) {
  const [index, setIndex] = React.useState(currentIndex);

  React.useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && items.length > 1) {
        setIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
      }
      if (e.key === "ArrowRight" && items.length > 1) {
        setIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items.length, onClose]);

  if (!isOpen || !items || items.length === 0) return null;

  const currentItem = items[index] || items[0];

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="w-full max-w-5xl flex items-center justify-between text-white shrink-0 pb-3 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-black tracking-wider text-amber-300">
            {currentItem.type === "video" ? "🎬 VIDEO" : "🖼️ HÌNH ẢNH"} ({index + 1}/{items.length})
          </span>
          {currentItem.title && (
            <span className="text-xs font-bold text-slate-200 truncate max-w-xs sm:max-w-md">
              {currentItem.title}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer shadow-md"
          title="Đóng (Esc)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Content Viewport */}
      <div
        className="flex-1 w-full max-w-5xl my-auto flex items-center justify-center relative overflow-hidden p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))}
            className="absolute left-2 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-xl backdrop-blur-xs"
            title="Trang trước (phím Mũi tên Trái)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Media Container */}
        <div className="max-w-full max-h-[78vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
          {currentItem.type === "image" ? (
            <img
              src={currentItem.url}
              alt={currentItem.title || "Media preview"}
              className="max-w-full max-h-[78vh] object-contain rounded-2xl select-none"
            />
          ) : (
            <div className="w-full max-w-3xl min-w-[320px] aspect-video">
              <UniversalVideoPlayer url={currentItem.url} title={currentItem.title} />
            </div>
          )}
        </div>

        {/* Next Button */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))}
            className="absolute right-2 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-xl backdrop-blur-xs"
            title="Trang sau (phím Mũi tên Phải)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Footer Navigation Dots / Thumbnails */}
      {items.length > 1 && (
        <div
          className="w-full max-w-5xl flex items-center justify-center gap-2 pt-3 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((it, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                idx === index ? "bg-amber-400 scale-125 ring-2 ring-amber-400/50" : "bg-white/30 hover:bg-white/60"
              }`}
              title={it.title || `Media #${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
