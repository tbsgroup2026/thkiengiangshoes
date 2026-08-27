"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobCard from "@/components/recruitment/JobCard";
import ApplyModal from "@/components/recruitment/ApplyModal";
import AIChatBubble from "@/components/recruitment/AIChatBubble";
import { fetchJobs, type Job } from "@/lib/api";
import { IconSearch, IconLoader2, IconBriefcase } from "@tabler/icons-react";

const CATEGORIES = [
  { value: "", label: "Tất cả ngành nghề" },
  { value: "it", label: "Công nghệ" },
  { value: "san-xuat", label: "Sản xuất" },
  { value: "qc", label: "Kiểm soát chất lượng" },
  { value: "ky-thuat", label: "Kỹ thuật" },
  { value: "hanh-chinh-nhan-su", label: "Hành chính — Nhân sự" },
  { value: "ke-toan", label: "Kế toán" },
  { value: "logistics", label: "Logistics" },
];

const PROVINCES = [
  { value: "", label: "Tất cả địa điểm" },
  { value: "An Giang", label: "An Giang" },
  { value: "Bình Dương", label: "Bình Dương" },
  { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
];

export default function CareersPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchJobs({
        search: search || undefined,
        category: category || undefined,
        province: province || undefined,
      });
      setJobs(data);
    } catch {
      setError("Không thể tải danh sách việc làm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [search, category, province]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  const handleApplySuccess = (applicationId: string) => {
    setApplyModalOpen(false);
    router.push(`/careers/interview-confirmation?applicationId=${applicationId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-tbs-light font-sans antialiased text-ink">
      <Header />

      <main className="flex-1">
        {/* Hero Banner — Clean editorial typography */}
        <section className="relative py-20 lg:py-24 bg-gradient-to-b from-tbs-dark via-tbs-mid to-[#158a63] text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 text-display">
              Tuyển Dụng{" "}
              <span className="bg-gradient-to-r from-gold-light to-[#d9b96a] bg-clip-text text-transparent">
                TBS Group
              </span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Gia nhập tập đoàn đa ngành hàng đầu Việt Nam với 50.000+ nhân sự, 6 lĩnh vực trụ cột
              và môi trường làm việc chuyên nghiệp
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-10 border-t border-white/10 pt-6">
              {[
                { value: "50.000+", label: "Nhân Sự" },
                { value: "6", label: "Ngành Trụ Cột" },
                { value: "30+", label: "Năm Phát Triển" },
              ].map((s, i) => (
                <div key={i} className="text-center p-2">
                  <div className="text-2xl sm:text-3xl font-black text-gold-light font-mono tabular-nums">{s.value}</div>
                  <div className="text-xs text-gray-300 font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 sm:p-6 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm vị trí, kỹ năng..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              {/* Category filter */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* Province filter */}
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent bg-white"
              >
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <IconLoader2 size={40} className="animate-spin text-accent mb-4" />
              <p className="text-sm text-gray-500">Đang tải danh sách việc làm...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 text-sm">
              {error}
              <button
                onClick={loadJobs}
                className="block mx-auto mt-3 px-4 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
              >
                Thử Lại
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <IconBriefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-tbs-dark mb-2">Không tìm thấy vị trí phù hợp</h3>
              <p className="text-sm text-gray-500">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-tbs-dark text-display">
                  {jobs.length} Vị Trí Đang Tuyển Dụng
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="relative">
                    <JobCard job={job} />
                    <button
                      onClick={() => handleApply(job)}
                      className="absolute bottom-20 right-6 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d9b96a] to-gold-light text-tbs-dark text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-amber-200"
                    >
                      Ứng Tuyển Ngay
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* TBS Company Info */}
        <section className="bg-gradient-to-b from-white to-[#eef7f2] py-16 border-t border-emerald-100">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
            <h3 className="text-2xl font-black text-tbs-dark text-display">TBS Group Tuyển Dụng</h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl mx-auto">
              Với hơn 30 năm phát triển, TBS Group tự hào là một trong những tập đoàn sản xuất công
              nghiệp hàng đầu Việt Nam. Chúng tôi luôn chào đón những nhân tài mong muốn phát triển
              sự nghiệp trong môi trường chuyên nghiệp, năng động và đầy cơ hội.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              {[
                { title: "Môi Trường Chuyên Nghiệp", desc: "33 chuyền sản xuất công nghệ cao, hệ thống quản lý số hóa toàn diện" },
                { title: "Phát Triển Sự Nghiệp", desc: "Lộ trình thăng tiến rõ ràng, đào tạo kỹ năng liên tục" },
                { title: "Phúc Lợi Toàn Diện", desc: "Living Wage, bảo hiểm, học bổng cho con em CBCNV" },
              ].map((item, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-left">
                  <h4 className="font-bold text-tbs-dark text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* AI Chat Bubble */}
      <AIChatBubble />
    </div>
  );
}
