import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Tổng quan", end: true },
  { to: "/admin/thong-tin", label: "Thông tin cá nhân" },
  { to: "/admin/khoa-hoc", label: "Khóa học" },
  { to: "/admin/lien-he", label: "Liên hệ" },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-cream-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-primary-100 bg-white p-5 sm:flex">
        <p className="font-display text-lg font-bold text-primary-800">Admin</p>
        <p className="mb-6 text-xs text-primary-900/50">Đăng nhập: {admin?.username}</p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-primary-500 text-white" : "text-primary-900 hover:bg-primary-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-auto rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-primary-600 hover:bg-primary-50"
        >
          Đăng xuất
        </button>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-primary-100 bg-white px-4 py-3 sm:hidden">
          <p className="font-display font-bold text-primary-800">Admin</p>
          <button onClick={logout} className="text-sm font-semibold text-primary-600">
            Đăng xuất
          </button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-primary-100 bg-white px-4 py-2 sm:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isActive ? "bg-primary-500 text-white" : "text-primary-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
