/**
 * Example: Login Page with Redirect Support
 * 
 * This example demonstrates how to:
 * 1. Read the redirect_uri query parameter
 * 2. Display it to the user for clarity
 * 3. Redirect after successful login
 * 
 * Location: src/app/login/page.tsx (or integrate into existing login)
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPageExample() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get the redirect destination, default to /work dashboard
  const redirectUri = searchParams.get('redirect_uri') || '/work';
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call your login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      const token = data.token;

      // Save token to cookie
      // (Backend likely sets this via Set-Cookie header, but you can also do it client-side)
      document.cookie = `tbs_token=${token}; path=/; secure; samesite=strict; max-age=86400`;

      // Save user profile to localStorage for UI display
      localStorage.setItem('tbs_current_user', JSON.stringify(data.user));

      // Trigger custom event for other components listening to auth changes
      window.dispatchEvent(new CustomEvent('tbs_profile_updated', { detail: data.user }));

      // Redirect to original destination or default dashboard
      router.push(redirectUri);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-black text-slate-900">Đăng Nhập TBS II</h1>
          <p className="text-sm text-slate-600">Quản lý quy trình công việc tập trung</p>
        </div>

        {/* Redirect Info */}
        {redirectUri && redirectUri !== '/work' && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
            <strong className="block mb-1">ℹ️ Quay lại trang yêu cầu</strong>
            <code className="block font-mono break-all">{redirectUri}</code>
            <p className="text-[11px] mt-1 opacity-80">
              Sau khi đăng nhập, bạn sẽ được chuyển hướng tới trang này
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
            <strong>❌ Lỗi:</strong> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900">
              Email hoặc Mã Nhân Viên
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: user@example.com hoặc EMP001"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900">Mật Khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Đang xử lý...
              </>
            ) : (
              <>
                <span>🔐</span>
                Đăng Nhập
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 text-center">
          <p>
            Quên mật khẩu?{' '}
            <a href="/forgot-password" className="font-bold text-blue-600 hover:underline">
              Khôi phục mật khẩu
            </a>
          </p>
        </div>

        {/* Debug Info (Remove in Production) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="pt-4 border-t border-slate-200 text-xs text-slate-500">
            <summary className="cursor-pointer font-bold">🔍 Debug Info</summary>
            <pre className="mt-2 bg-slate-50 p-2 rounded overflow-auto text-[10px]">
              {JSON.stringify(
                {
                  redirectUri,
                  searchParams: Object.fromEntries(searchParams),
                  timestamp: new Date().toISOString(),
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Usage Notes:
 * 
 * 1. Direct Login (default redirect to /work):
 *    User navigates to: /login
 *    redirect_uri not set → After login → /work
 * 
 * 2. Protected Route Redirect:
 *    User tries: /work/kaizen (no token)
 *    Middleware redirects to: /login?redirect_uri=/work/kaizen
 *    After login → /work/kaizen
 * 
 * 3. Nested Protected Route:
 *    User tries: /work/kaizen/proposal/123 (no token)
 *    Middleware redirects to: /login?redirect_uri=/work/kaizen/proposal/123
 *    After login → /work/kaizen/proposal/123
 * 
 * 4. Public Route (no redirect):
 *    User tries: /work/kaizen/register (no token)
 *    Allowed directly (public) → No redirect needed
 */
