"use client";

import { useState, useEffect } from "react";
import { PERMISSIONS, ROLES, Permission } from "@/lib/permissions";
import { IconCheck, IconShield, IconDeviceFloppy, IconRefresh } from "@tabler/icons-react";

export default function RolesAdminPage() {
  const [rolePermissions, setRolePermissions] = useState<Record<string, Permission[]>>(ROLES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const permissionKeys = Object.values(PERMISSIONS);
  const roleKeys = Object.keys(ROLES);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tbs_role_permissions");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRolePermissions(parsed);
        } catch (e) {}
      }
    }
  }, []);

  const handleTogglePermission = (role: string, permission: Permission) => {
    if (role === "admin") {
      showToast("⚠️ Role Admin luôn sở hữu toàn bộ permissions!");
      return;
    }

    setRolePermissions((prev) => {
      const currentList = prev[role] || [];
      const hasPerm = currentList.includes(permission);
      const updated = hasPerm
        ? currentList.filter((p) => p !== permission)
        : [...currentList, permission];

      return {
        ...prev,
        [role]: updated,
      };
    });
  };

  const handleSavePermissions = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tbs_role_permissions", JSON.stringify(rolePermissions));
      window.dispatchEvent(new Event("tbs_profile_updated"));
    }
    showToast("💾 Đã lưu cấu hình ma trận Phân quyền Roles thành công!");
  };

  const handleResetDefaults = () => {
    setRolePermissions(ROLES);
    if (typeof window !== "undefined") {
      localStorage.removeItem("tbs_role_permissions");
    }
    showToast("🔄 Đã khôi phục cấu hình Phân quyền mặc định!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#08221a] flex items-center gap-2">
            <IconShield size={26} className="text-[#006838]" />
            <span>Ma Trận Phân Quyền Vai Trò (RBAC Permission Matrix)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Bật/tắt các hành động cụ thể (`module:action`) cho từng vai trò trong toàn bộ hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer"
          >
            <IconRefresh size={16} />
            <span>Mặc định</span>
          </button>

          <button
            onClick={handleSavePermissions}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-extrabold transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconDeviceFloppy size={16} />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#08221a] text-white font-bold uppercase tracking-wider">
                <th className="p-3.5 sticky left-0 bg-[#08221a] z-10 w-44 shadow-r">Vai Trò (Role)</th>
                {permissionKeys.map((perm) => (
                  <th key={perm} className="p-3 text-center min-w-[120px] border-l border-white/10 font-mono text-[10px]">
                    {perm}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
              {roleKeys.map((role) => {
                const perms = rolePermissions[role] || [];
                const isAdmin = role === "admin";

                return (
                  <tr key={role} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 sticky left-0 bg-white font-bold text-slate-900 border-r border-gray-200 shadow-r">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-emerald-800 uppercase">{role}</span>
                        {isAdmin && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">ALL</span>}
                      </div>
                    </td>

                    {permissionKeys.map((perm) => {
                      const isChecked = isAdmin || perms.includes(perm);

                      return (
                        <td key={perm} className="p-3 text-center border-l border-gray-100">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              disabled={isAdmin}
                              checked={isChecked}
                              onChange={() => handleTogglePermission(role, perm)}
                              className="w-4.5 h-4.5 rounded text-[#006838] focus:ring-[#006838] cursor-pointer disabled:opacity-50"
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Info Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
        <span className="font-bold block text-sm">💡 Quy tắc Ma trận Phân quyền:</span>
        <p>• Mô hình RBAC tự động hợp (Union) toàn bộ quyền của các Role được gán cho một người dùng.</p>
        <p>• Nút UI chỉ kiểm tra thông qua hook <code className="font-mono bg-white px-1 py-0.5 rounded border">usePermission()</code> và component <code className="font-mono bg-white px-1 py-0.5 rounded border">&lt;Can permission="..."&gt;</code>.</p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <IconCheck size={16} />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
