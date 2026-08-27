"use client";

import { useState, useEffect } from "react";
import { ROLES } from "@/lib/permissions";
import UserAvatar from "@/components/UserAvatar";
import { IconUsers, IconUserPlus, IconLock, IconLockOpen, IconSearch, IconCheck, IconShield, IconBuilding, IconTrash, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { INITIAL_370_EMPLOYEES } from "@/lib/initialEmployees";

interface UserAccount {
  id: string;
  empCode: string;
  name: string;
  email: string;
  department: string;
  managedDepartmentId?: string;
  roles: string[];
  status: "ACTIVE" | "LOCKED";
}

const DEPARTMENTS_LIST = [
  { id: "cn_pph_ci", name: "CN-PPH & CI" },
  { id: "kd_ptsp", name: "KD PTSP" },
  { id: "khcb_ttpp", name: "KHCB-TTPP" },
  { id: "nhansu_hc", name: "NHÂN SỰ-HC" },
  { id: "qlcl_lab", name: "QLCL & LAB" },
  { id: "dh_qt", name: "ĐH-QT" },
];

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Fetch real user data from D1 database on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const apiUsers: UserAccount[] = json.data.map((u: any, idx: number) => ({
              id: u.id || u.emp_code || `user-${idx}`,
              empCode: u.emp_code || u.empCode || u.msnv || "",
              name: u.name || u.full_name || u.fullName || "N/A",
              email: u.email || "",
              department: u.department || u.phong_ban_hien_tai || u.phong_ban || "N/A",
              managedDepartmentId: u.managed_department_id,
              roles: Array.isArray(u.roles) ? u.roles : [u.role_code || "CBCNV"],
              status: (u.is_active === false || u.status === "LOCKED") ? "LOCKED" : "ACTIVE",
            }));
            setUsers(apiUsers);
          }
        }
      } catch (e) {
        console.error("Failed to load users:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleLock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "ACTIVE" ? "LOCKED" : "ACTIVE" }
          : u
      )
    );
    showToast("Đã cập nhật trạng thái khóa/mở khóa tài khoản thành công!");
  };

  const handleDeleteUser = async (id: string, empCode: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản nhân sự "${name}" (${empCode}) khỏi hệ thống D1?`)) {
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));

    try {
      await fetch(`/api/users?id=${encodeURIComponent(id)}&empCode=${encodeURIComponent(empCode)}`, {
        method: "DELETE",
      });
      showToast(`🗑️ Đã xóa vĩnh viễn tài khoản "${name}" (${empCode})!`);
    } catch (e) {
      showToast(`🗑️ Đã xóa tài khoản "${name}" khỏi danh sách!`);
    }
  };

  const handleToggleRoleForUser = (roleKey: string) => {
    if (!editingUser) return;
    const currentRoles = editingUser.roles || [];
    const hasRole = currentRoles.includes(roleKey);
    const updated = hasRole
      ? currentRoles.filter((r) => r !== roleKey)
      : [...currentRoles, roleKey];

    setEditingUser({ ...editingUser, roles: updated });
  };

  const handleSaveUserRoles = () => {
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    setEditingUser(null);
    showToast("Đã lưu phân quyền & phòng ban quản lý cho tài khoản!");
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !searchQuery.trim() ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDept = deptFilter === "ALL" || u.department.includes(deptFilter);
    return matchSearch && matchDept;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#006838] rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-semibold">Đang tải danh sách nhân sự từ D1...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#08221a] flex items-center gap-2">
            <IconUsers size={26} className="text-[#006838]" />
            <span>Quản Lý Nhân Viên &amp; Gán Vai Trò (Roles Assignment)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gán một hoặc nhiều role cùng lúc, cấu hình phòng ban quản lý (`managedDepartmentId`) cho Trưởng phòng
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo Tên, MSNV hoặc Email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 font-medium outline-none focus:border-[#006838]"
            />
            <IconSearch size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-gray-300 font-bold outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả Phòng Ban</option>
            {DEPARTMENTS_LIST.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-gray-500">
          Tổng cộng: <span className="text-[#006838] font-black">{filteredUsers.length} tài khoản</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#08221a] text-white font-bold uppercase tracking-wider">
              <th className="p-3.5">Mã NV</th>
              <th className="p-3.5">Họ và Tên</th>
              <th className="p-3.5">Phòng Ban Công Tác</th>
              <th className="p-3.5">Phòng Quản Lý (`managedDept`)</th>
              <th className="p-3.5">Các Role Sở Hữu</th>
              <th className="p-3.5 text-center">Trạng Thái</th>
              <th className="p-3.5 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-slate-800">
            {paginatedUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="p-3.5 font-mono font-bold text-[#006838]">{u.empCode}</td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={u.name} size="xs" />
                    <div>
                      <div className="font-extrabold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3.5 font-medium text-slate-700">{u.department}</td>
                <td className="p-3.5 font-mono font-bold text-emerald-700">
                  {u.managedDepartmentId ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                      {u.managedDepartmentId}
                    </span>
                  ) : (
                    <span className="text-gray-400 font-normal">--</span>
                  )}
                </td>
                <td className="p-3.5">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <span key={r} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-mono font-bold">
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3.5 text-center">
                  {u.status === "ACTIVE" ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#006838] text-[10px] font-black uppercase">
                      ✓ Hoạt động
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                      🔒 Đã khóa
                    </span>
                  )}
                </td>
                <td className="p-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#006838] hover:bg-[#006838] hover:text-white font-bold text-[11px] transition cursor-pointer border border-emerald-200"
                    >
                      Gán Roles
                    </button>
                    <button
                      onClick={() => handleToggleLock(u.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        u.status === "ACTIVE"
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-600 hover:text-white"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white"
                      }`}
                      title={u.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    >
                      {u.status === "ACTIVE" ? <IconLock size={15} /> : <IconLockOpen size={15} />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.empCode, u.name)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Xóa tài khoản vĩnh viễn"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-4 py-4 bg-white rounded-2xl border border-gray-200 shadow-md text-xs">
          <div className="text-gray-600 font-semibold">
            Hiển thị <span className="text-[#006838] font-bold">{startIndex + 1}</span> đến{" "}
            <span className="text-[#006838] font-bold">{Math.min(endIndex, filteredUsers.length)}</span> của{" "}
            <span className="text-[#006838] font-bold">{filteredUsers.length}</span> tài khoản
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-[#006838] border-[#006838] hover:bg-[#006838] hover:text-white"
              }`}
            >
              <IconChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxButtons = 7;
                const halfSide = Math.floor(maxButtons / 2);

                let startPage = Math.max(1, currentPage - halfSide);
                let endPage = Math.min(totalPages, currentPage + halfSide);

                if (endPage - startPage < maxButtons - 1) {
                  if (startPage === 1) {
                    endPage = Math.min(totalPages, startPage + maxButtons - 1);
                  } else if (endPage === totalPages) {
                    startPage = Math.max(1, endPage - maxButtons + 1);
                  }
                }

                if (startPage > 1) {
                  pages.push(
                    <button
                      key="first"
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-semibold transition"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="dot1" className="px-2 py-1 text-gray-500">
                        ...
                      </span>
                    );
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition border ${
                        i === currentPage
                          ? "bg-[#006838] text-white border-[#006838]"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="dot2" className="px-2 py-1 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key="last"
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-semibold transition"
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-[#006838] border-[#006838] hover:bg-[#006838] hover:text-white"
              }`}
            >
              <IconChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
        </div>
      )}

      {/* MODAL GÁN ROLES & MANAGED DEPARTMENT */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-xs">
            <div className="p-4 bg-[#08221a] text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <IconShield size={18} className="text-[#2fd39a]" />
                  <span>Phân Quyền Cho: {editingUser.name}</span>
                </h3>
                <span className="text-[11px] text-gray-300 font-mono">{editingUser.empCode} • {editingUser.department}</span>
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Select managedDepartmentId */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block flex items-center gap-1">
                  <IconBuilding size={15} className="text-[#006838]" />
                  <span>Phòng Ban Quản Lý (`managedDepartmentId` cho Trưởng Phòng):</span>
                </label>
                <select
                  value={editingUser.managedDepartmentId || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, managedDepartmentId: e.target.value || undefined })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-bold outline-none bg-slate-50 cursor-pointer"
                >
                  <option value="">-- Không làm Trưởng phòng --</option>
                  {DEPARTMENTS_LIST.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-role Selection Checklist */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">
                  Chọn các Roles gán cho tài khoản (Hợp quyền Multi-role):
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {Object.keys(ROLES).map((rKey) => {
                    const isChecked = editingUser.roles?.includes(rKey);
                    return (
                      <label key={rKey} className="flex items-center gap-2 cursor-pointer select-none p-1.5 rounded hover:bg-white transition">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRoleForUser(rKey)}
                          className="rounded text-[#006838] focus:ring-[#006838] cursor-pointer"
                        />
                        <span className="font-mono text-xs font-bold text-slate-800">{rKey}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveUserRoles}
                className="px-5 py-2 rounded-xl bg-[#006838] text-white font-bold hover:bg-[#00522c] cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

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
