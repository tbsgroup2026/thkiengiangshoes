"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplyModal from "@/components/recruitment/ApplyModal";
import AIChatBubble from "@/components/recruitment/AIChatBubble";
import { fetchJob, fetchJobs, type Job } from "@/lib/api";
import {
  IconMapPin, IconClock, IconUsers, IconBriefcase, IconCash,
  IconArrowLeft, IconLoader2, IconShare, IconMail, IconPhone,
  IconBuilding, IconCheck, IconSchool,
} from "@tabler/icons-react";

const CATEGORY_LABELS: Record<string, string> = {
  "it": "Công nghệ", "san-xuat": "Sản xuất", "qc": "Kiểm soát chất lượng",
  "ky-thuat": "Kỹ thuật", "hanh-chinh-nhan-su": "Hành chính — Nhân sự",
  "ke-toan": "Kế toán", "logistics": "Logistics",
};

const EDU_LABELS: Record<string, string> = {
  "khong-yeu-cau": "Không yêu cầu", "trung-cap": "Trung cấp",
  "cao-dang": "Cao đẳng", "dai-hoc": "Đại học", "tren-dai-hoc": "Trên đại học",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
}

export default function JobDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true); setError("");
      try {
        const [jobData, allJobs] = await Promise.all([fetchJob(id), fetchJobs()]);
        setJob(jobData);
        setSimilarJobs(allJobs.filter((j) => j.id !== id && j.category === jobData.category).slice(0, 3));
      } catch {
        setError("Không tìm thấy tin tuyển dụng này.");
      } finally { setLoading(false); }
    }
    load();
  }, [id]);

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const generateCalendarLink = () => {
    if (!job) return "#";
    const start = new Date(); start.setDate(start.getDate() + 7); start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return `https://calendar.google.com/calendar/render?${new URLSearchParams({
      action: "TEMPLATE", text: `Phỏng vấn: ${job.title} - TBS Group`,
      details: `Phỏng vấn vị trí ${job.title} tại TBS Group.%0AĐịa điểm: ${job.location}%0ALiên hệ: ${job.contactPhone}`,
      location: job.location, dates: `${fmt(start)}/${fmt(end)}`, ctz: "Asia/Ho_Chi_Minh",
    }).toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-tbs-light">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center"><IconLoader2 size={48} className="animate-spin text-accent mx-auto mb-4" /><p className="text-gray-500 text-sm">Đang tải chi tiết...</p></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-tbs-light">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <IconBriefcase size={56} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-tbs-dark mb-2">Không Tìm Thấy</h2>
            <p className="text-sm text-gray-500 mb-6">{error || "Tin tuyển dụng không tồn tại hoặc đã hết hạn."}</p>
            <Link href="/careers" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors"><IconArrowLeft size={18} />Xem Tất Cả Vị Trí</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-tbs-light">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-accent">Trang chủ</Link><span>/</span>
            <Link href="/careers" className="hover:text-accent">Tuyển dụng</Link><span>/</span>
            <span className="text-tbs-dark font-medium truncate max-w-[200px]">{job.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl shrink-0">
                    <IconBriefcase size={28} className="text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-black text-tbs-dark leading-tight">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {job.category && CATEGORY_LABELS[job.category] && (
                        <span className="text-xs font-semibold text-accent bg-emerald-50 px-2.5 py-0.5 rounded-full">{CATEGORY_LABELS[job.category]}</span>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${job.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        {job.status === "ACTIVE" ? "Đang tuyển" : "Đã đóng"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[{ icon: IconCash, label: "Mức Lương", val: job.salary },
                    { icon: IconMapPin, label: "Địa Điểm", val: job.location },
                    { icon: IconUsers, label: "Số Lượng", val: `${job.slots} vị trí` },
                    { icon: IconClock, label: "Hạn Nộp", val: job.expiresAt ? formatDate(job.expiresAt) : "Đang cập nhật" },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <m.icon size={18} className="text-accent shrink-0" />
                      <div><div className="text-[10px] text-gray-400">{m.label}</div><div className="font-semibold text-tbs-dark text-xs">{m.val}</div></div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setApplyModalOpen(true)} className="px-6 py-3 rounded-xl bg-accent-light hover:bg-accent text-white font-bold text-sm active:scale-[0.98] transition-all duration-200">Ứng tuyển ngay</button>
                  <a href={generateCalendarLink()} target="_blank" rel="noopener noreferrer" className="px-4 py-3 rounded-xl bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200 hover:bg-amber-100 transition-colors">Gợi ý lịch phỏng vấn</a>
                  <div className="flex items-center gap-1">
                    <button onClick={handleCopyLink} className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100" title="Sao chép">{copied ? <IconCheck size={18} className="text-green-500" /> : <IconShare size={18} />}</button>
                    <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100" title="Facebook">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </button>
                    <button onClick={() => window.open(`https://zalo.me/share?u=${encodeURIComponent(window.location.href)}`, "_blank")} className="p-2.5 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100" title="Zalo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.49 10.2722v-.4496h4.3414v.4496H12.49zm0-.8991v-.4496h4.3414v.4496H12.49zm4.3414 1.7983H12.49v-.4496h4.3414v.4496zM8.223 3.005C4.117 3.005.779 6.376.779 10.523c0 3.004 1.767 5.135 4.126 6.524-.197.438-.67 2.04-.827 2.604-.04.146-.005.22.147.142.367-.188 2.246-1.576 2.608-1.831.527.142 1.07.22 1.626.22 4.106 0 7.444-3.37 7.444-7.518S12.33 3.005 8.223 3.005zM5.532 9.401h.547v3.18h-.547V9.4zm2.051 0h.546v3.18h-.547V9.4zm2.09 0h.547v3.18h-.547V9.4zm3.321.029h.486v3.183h-.486V9.43z"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
                <h2 className="text-lg font-bold text-tbs-dark mb-4">Mô Tả Công Việc</h2>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
                <h2 className="text-lg font-bold text-tbs-dark mb-4">Yêu Cầu Ứng Viên</h2>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{job.requirements}</div>
              </div>

              {job.benefits && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-tbs-dark mb-4">Quyền Lợi & Chế Độ</h2>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{job.benefits}</div>
                </div>
              )}

              {similarJobs.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-tbs-dark mb-4">Vị Trí Tương Tự</h2>
                  <div className="space-y-3">
                    {similarJobs.map((sj) => (
                      <Link key={sj.id} href={`/careers/${sj.id}`} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors group">
                        <div>
                          <h3 className="text-sm font-semibold text-tbs-dark group-hover:text-accent transition-colors">{sj.title}</h3>
                          <div className="flex gap-3 text-[11px] text-gray-500 mt-1"><span>{sj.salary}</span><span>{sj.location}</span></div>
                        </div>
                        <span className="text-xs text-accent font-semibold bg-white px-3 py-1 rounded-full border border-emerald-200 group-hover:bg-accent group-hover:text-white transition-colors">Xem →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <img src="/images/tbs-logo.png" alt="TBS Group" className="w-12 h-12 object-contain" />
                  <div><h3 className="font-bold text-tbs-dark text-sm">TBS Group</h3><p className="text-[10px] text-gray-400">Tập Đoàn Sản Xuất & Đầu Tư Đa Ngành</p></div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2"><IconBuilding size={16} className="text-accent shrink-0 mt-0.5" /><div><p className="text-[10px] text-gray-400">Địa điểm</p><p className="font-semibold text-tbs-dark text-xs">{job.location}</p></div></div>
                  <div className="flex items-start gap-2"><IconMail size={16} className="text-accent shrink-0 mt-0.5" /><div><p className="text-[10px] text-gray-400">Email</p><a href={`mailto:${job.contactEmail}`} className="font-semibold text-accent text-xs hover:underline">{job.contactEmail}</a></div></div>
                  <div className="flex items-start gap-2"><IconPhone size={16} className="text-accent shrink-0 mt-0.5" /><div><p className="text-[10px] text-gray-400">Điện thoại</p><a href={`tel:${job.contactPhone}`} className="font-semibold text-accent text-xs hover:underline">{job.contactPhone}</a></div></div>
                  {job.educationLevel && <div className="flex items-start gap-2"><IconSchool size={16} className="text-accent shrink-0 mt-0.5" /><div><p className="text-[10px] text-gray-400">Trình độ</p><p className="font-semibold text-tbs-dark text-xs">{EDU_LABELS[job.educationLevel] || job.educationLevel}</p></div></div>}
                </div>
                <hr className="my-4 border-gray-100" />
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-emerald-50 rounded-xl p-3"><div className="text-lg font-black text-accent">{job.viewCount}</div><div className="text-[10px] text-gray-500">Lượt xem</div></div>
                  <div className="bg-amber-50 rounded-xl p-3"><div className="text-lg font-black text-amber-600">{job.applyCount}</div><div className="text-[10px] text-gray-500">Lượt ứng tuyển</div></div>
                </div>
                <button onClick={() => setApplyModalOpen(true)} className="w-full mt-4 py-3 rounded-xl bg-accent-light hover:bg-accent text-white font-bold text-sm active:scale-[0.98] transition-all duration-200">Ứng tuyển ngay</button>
                <p className="text-[10px] text-gray-400 text-center mt-3">Đăng ngày {formatDate(job.createdAt)} • Hạn nộp: {job.expiresAt ? formatDate(job.expiresAt) : "Đang cập nhật"}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ApplyModal jobId={job.id} jobTitle={job.title} isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} onSuccess={(aid) => { setApplyModalOpen(false); router.push(`/careers/interview-confirmation?applicationId=${aid}`); }} />
      <AIChatBubble />
    </div>
  );
}
