'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconUser, IconLock, IconEye, IconEyeOff, IconTools } from '@tabler/icons-react';

// Đăng nhập RIÊNG cho MMTB — tách khỏi đăng nhập chung (tbs_token) của cả trang
// thkiengiangshoes. Dùng đúng tài khoản tbsMayMoc (cùng hệ với App Mobile Native), chỉ vai trò
// Quản trị (ADMIN) mới vào được — worker tự kiểm tra ở /api/mmtb-kg/login.
export default function MmtbLoginPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/mmtb-kg/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeCode: employeeCode.trim(), password }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Đăng nhập thất bại');
        return;
      }
      router.push('/maintenance');
    } catch {
      setError('Không kết nối được tới hệ thống MMTB');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08221a] p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center">
            <IconTools size={26} className="text-accent" />
          </div>
          <h1 className="text-xl font-extrabold text-tbs-dark">Đăng Nhập MMTB</h1>
          <p className="text-xs text-gray-500">Quản Lý Máy Móc Thiết Bị — Tổ hợp Kiên Giang</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">⚠️ {error}</div>
          )}
          <label className="block text-xs font-bold text-gray-700 space-y-1.5">
            <span className="flex items-center gap-1.5"><IconUser size={14} className="text-gray-400" /> Mã số nhân viên</span>
            <input
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="VD: 202608001"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </label>
          <label className="block text-xs font-bold text-gray-700 space-y-1.5">
            <span className="flex items-center gap-1.5"><IconLock size={14} className="text-gray-400" /> Mật khẩu</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-tbs-dark text-white text-xs font-extrabold uppercase tracking-wide hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400">Chỉ tài khoản Quản trị mới truy cập được MMTB</p>
      </div>
    </div>
  );
}
