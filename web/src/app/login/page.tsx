"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavLink from "@/components/NavLink";
import {
  IconUser,
  IconLock,
  IconEye,
  IconEyeOff,
  IconSparkles,
  IconShieldCheck,
  IconChartBar,
  IconCamera,
  IconBuildingFactory,
  IconArrowRight,
} from "@tabler/icons-react";
import { loginWithD1Database, loginUserProfile, SYSTEM_USERS } from "@/lib/userProfiles";

// EXECUTIVE_PERSONNEL_MAP (chọn tay Chức vụ/Vai trò trước khi đăng nhập) đã bỏ hẳn — vai trò lấy
// đúng từ chính tài khoản (SYSTEM_USERS/userProfiles.ts) khi đăng nhập, không cần chọn tay nữa.
// EXECUTIVE_PERSONNEL map lọc danh sách cán bộ theo đúng cấp bậc chức vụ
const EXECUTIVE_PERSONNEL: Record<
  string,
  { empCode: string; name: string; title: string }[]
> = {
  ceo: [
    { empCode: "200405004", name: "PHẠM MINH TÙNG", title: "Tổng Giám Đốc (TGĐ)" },
  ],
  deputy_ceo: [
    { empCode: "119504004", name: "Bùi Đình Trung", title: "Phó Tổng Giám Đốc KHCB & TTPP" },
  ],
  director: [
    { empCode: "101403004", name: "Nguyễn Hữu Đạt", title: "Giám Đốc Khối KD PTSP" },
    { empCode: "201306001", name: "Trần Hoàng Thảo", title: "Giám Đốc Công Nghệ - PPH & CI" },
    { empCode: "200105001", name: "Lê Văn Phương", title: "Giám Đốc KHCB Vật Tư" },
  ],
  deputy_director: [
    { empCode: "201809012", name: "Kiều Thanh Vũ", title: "Phó Giám Đốc Phân Hệ CN CI PPH (PGĐ)" },
    { empCode: "201604020", name: "Phạm Thị Dương", title: "Phó Giám Đốc QLCL & AUDIT (PGĐ)" },
    { empCode: "210608003", name: "Vũ Thành Lê", title: "Phó Giám Đốc KHCB ĐHSX" },
    { empCode: "201403017", name: "Lý Huỳnh Duy", title: "Phó Giám Đốc KHCB VT" },
  ],
};

export default function LoginPage() {
  const router = useRouter();
  const [quickPersonCode, setQuickPersonCode] = useState("");
  const [selectedRoleGroup, setSelectedRoleGroup] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Kiểm tra vai trò thuộc cấp PGĐ trở lên
  const isExecutiveRole = Boolean(selectedRoleGroup && EXECUTIVE_PERSONNEL[selectedRoleGroup]);
  const availablePersonnel = selectedRoleGroup ? (EXECUTIVE_PERSONNEL[selectedRoleGroup] || []) : [];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isExecutiveRole) {
        if (!quickPersonCode && !empCode) {
          throw new Error("Vui lòng chọn tên Cán bộ / Lãnh đạo từ danh sách");
        }
      } else {
        if (!empCode.trim()) {
          throw new Error("Vui lòng nhập Mã số nhân viên (MSNV)");
        }
      }

      if (!password) {
        throw new Error("Vui lòng nhập Mật khẩu xác thực");
      }

      const cleanEmpCode = (empCode || quickPersonCode).trim();
      await loginWithD1Database(cleanEmpCode, password, selectedRoleGroup, rememberMe);
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi đăng nhập";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#08221a] font-sans antialiased text-white selection:bg-[#2fd39a] selection:text-[#08221a]">
      {/* CỘT TRÁI — FORM ĐĂNG NHẬP */}
      <div className="w-full md:w-[48%] lg:w-[45%] bg-white text-gray-900 flex flex-col justify-between p-6 sm:p-8 lg:p-10 shadow-2xl relative z-10 overflow-y-auto max-h-screen">
        <div>
          {/* Header nhỏ trên cùng */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-3">
              <img src="/images/tbs-logo.png" alt="TBS Group Logo" className="h-8 sm:h-9 w-auto object-contain" />
            </div>
            <NavLink
              href="/"
              className="text-xs font-bold text-gray-500 hover:text-[#08221a] transition-colors"
            >
              Về trang chủ
            </NavLink>
          </div>

          {/* Tiêu đề chào mừng */}
          <div className="space-y-1.5 mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#08221a] tracking-tight">
              Đăng Nhập Hệ Thống <br />
              <span className="text-[#0f4133]">Tổ hợp Kiên Giang - TBS Group</span>
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Chọn vai trò hoặc tài khoản demo bên dưới để bắt đầu làm việc
            </p>
          </div>

          {/* Form Đăng nhập trực tiếp */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* FIELD 1: Chức vụ / Vai trò đăng nhập */}
            <div className="space-y-1.5">
              <label htmlFor="roleSelect" className="text-xs font-bold text-gray-800 flex items-center gap-2">
                <IconShieldCheck size={16} className="text-gray-700" />
                <span>Chức vụ / Vai trò đăng nhập</span>
              </label>
              <div className="relative">
                <select
                  id="roleSelect"
                  value={selectedRoleGroup}
                  onChange={(e) => {
                    const roleVal = e.target.value;
                    setSelectedRoleGroup(roleVal);
                    setError("");

                    if (EXECUTIVE_PERSONNEL[roleVal]) {
                      const list = EXECUTIVE_PERSONNEL[roleVal];
                      if (list.length === 1) {
                        setQuickPersonCode(list[0].empCode);
                        setEmpCode(list[0].empCode);
                        if (!password) setPassword("123456");
                      } else {
                        setQuickPersonCode("");
                        setEmpCode("");
                      }
                    } else {
                      setQuickPersonCode("");
                      setEmpCode("");
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 border border-gray-200/90 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-[#08221a] focus:ring-2 focus:ring-[#08221a]/10 transition-all cursor-pointer appearance-none"
                >
                  <option value="">-- Chọn nhóm Chức vụ / Vai trò đăng nhập --</option>
                  <option value="ceo">👑 Tổng Giám Đốc (TGĐ)</option>
                  <option value="deputy_ceo">🌟 Phó Tổng Giám Đốc (P.TGĐ)</option>
                  <option value="director">🏢 Giám Đốc Khối (GĐ)</option>
                  <option value="deputy_director">💼 Phó Giám Đốc Khối (PGĐ)</option>
                  <option value="department_head">👔 Trưởng Phòng (TP)</option>
                  <option value="admin">🔧 Quản Trị Viên Hệ Thống (Admin)</option>
                  <option value="employee">👤 Cán Bộ Công Nhân Viên (CBCNV)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* FIELD 2 (CHỈ HIỆN KHI LÀ PGĐ TRỞ LÊN): Chọn Tên Cán bộ Lãnh đạo lọc theo chức vụ */}
            {isExecutiveRole && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label htmlFor="quickSelect" className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <IconSparkles size={16} className="text-amber-600" />
                  <span>Tên Cán bộ / Lãnh đạo ({availablePersonnel.length} nhân sự)</span>
                </label>
                <div className="relative">
                  <select
                    id="quickSelect"
                    value={quickPersonCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuickPersonCode(val);
                      setEmpCode(val);
                      if (val) {
                        if (val === "202608001") {
                          setPassword("21032004");
                        } else if (!password) {
                          setPassword("123456");
                        }
                      }
                      setError("");
                    }}
                    className="w-full px-4 py-3 bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-[#08221a] focus:ring-2 focus:ring-[#08221a]/10 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">-- Chọn tên cán bộ từ danh sách --</option>
                    {availablePersonnel.map((person) => (
                      <option key={person.empCode} value={person.empCode}>
                        {person.name} — {person.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* FIELD 3 (CHỈ HIỆN KHI KHÔNG PHẢI PGĐ TRỞ LÊN): Nhập MSNV thủ công */}
            {!isExecutiveRole && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label htmlFor="empCode" className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <IconUser size={16} className="text-gray-700" />
                  <span>Mã số nhân viên (MSNV)</span>
                </label>
                <input
                  id="empCode"
                  type="text"
                  required={!isExecutiveRole}
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  placeholder="VD: 202608001, 222102020, KT-001..."
                  className="w-full px-4 py-3 bg-[#eef4ff] border border-blue-100 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-[#08221a] focus:ring-2 focus:ring-[#08221a]/10 transition-all placeholder:text-gray-400 font-mono"
                />
              </div>
            )}

            {/* FIELD 4: Mật khẩu xác thực vai trò */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-gray-800 flex items-center gap-2">
                <IconLock size={16} className="text-gray-700" />
                <span>Mật khẩu xác thực vai trò</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-3 bg-[#eef4ff] border border-blue-100 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-[#08221a] focus:ring-2 focus:ring-[#08221a]/10 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            {/* Hàng dưới cùng form */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#08221a] focus:ring-[#08221a]"
                />
                <span>Ghi nhớ 30 ngày</span>
              </label>
              <a href="#forgot" className="font-bold text-[#0f4133] hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#08221a] via-[#0f4133] to-[#08221a] text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-emerald-950/20 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>{loading ? "Đang xác thực..." : "ĐĂNG NHẬP HỆ THỐNG"}</span>
            </button>
          </form>


        </div>

        {/* Footer nhỏ cuối form */}
        <div className="pt-6 border-t border-gray-100 text-center text-[11px] text-gray-400">
          © 2026 TBS Group · Tổ hợp Kiên Giang · v1.0
        </div>
      </div>



      {/* ════════════════════════════════════════════════════════════════
          CỘT PHẢI — PANEL GIỚI THIỆU (Nền tối Emerald-Black, 55% Desktop, Ẩn Mobile)
         ════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#08221a] via-[#0d2419] to-[#061a14] p-10 lg:p-16 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(47,211,154,0.12)_0%,_transparent_60%)] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-300/80">Tổ hợp Kiên Giang - TBS Group</span>
        </div>

        {/* Center Main Content */}
        <div className="relative z-10 space-y-6 my-auto max-w-xl">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Quản trị chuỗi cung ứng <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2fd39a] to-[#f2dc9a]">
              chuẩn xác &amp; thời gian thực
            </span>
          </h2>

          <p className="text-gray-300 text-sm leading-relaxed">
            Hệ thống kết nối toàn bộ quy trình Gemba Walk tại hiện trường nhà máy, theo dõi tiến độ Cải tiến CI, đăng ký Kaizen và đo lường BI Dashboard 24/7.
          </p>

          {/* Danh sách 4 tính năng nổi bật */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {[
              {
                icon: IconBuildingFactory,
                title: "Gemba Walk Nhanh Gọn",
                desc: "Lập biên bản sự cố và chụp ảnh trực tiếp tại hiện trường",
              },
              {
                icon: IconShieldCheck,
                title: "Phân Quyền Phòng Ban",
                desc: "Đúng người đúng việc theo bảng Department Permissions",
              },
              {
                icon: IconCamera,
                title: "Đính Kèm Minh Chứng R2",
                desc: "Lưu trữ hình ảnh minh chứng an toàn trên Cloudflare R2",
              },
              {
                icon: IconChartBar,
                title: "BI Dashboard 24/7",
                desc: "Donut chart phân bố cải tiến thời gian thực theo khu vực",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3 backdrop-blur-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-[#2fd39a]/20 text-[#2fd39a] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <feature.icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">
                    {feature.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-gray-400 pt-6 border-t border-white/10 flex items-center justify-between">
          <span>© 2026 TBS Group – Skechers Supply Chain System</span>
        </div>
      </div>
    </div>
  );
}
