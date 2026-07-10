import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Trang chủ" },
  { to: "/gioi-thieu", label: "Giới thiệu" },
  { to: "/khoa-hoc", label: "Khóa học" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-primary-500 text-white"
        : "text-primary-900 hover:bg-primary-50"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-primary-100 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Khánh Huyền Chinese" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-lg font-bold text-primary-800">
            Khánh Huyền Chinese
          </span>
        </NavLink>

        <nav className="hidden items-center gap-2 sm:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary-700 sm:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Mở menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-primary-100 px-4 pb-4 sm:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
