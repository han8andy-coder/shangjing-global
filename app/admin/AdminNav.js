"use client";

import { usePathname } from "next/navigation";

const links = [
  ["/admin", "数据看板"],
  ["/admin/leads", "客户管理"],
];

export default function AdminNav() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="admin-nav">
      <a className="admin-brand" href="/admin">
        <strong>商镜</strong>Global <span>客户增长系统</span>
      </a>
      <nav>
        {links.map(([href, label]) => (
          <a
            className={
              pathname === href ||
              (href !== "/admin" && pathname.startsWith(`${href}/`))
                ? "active"
                : ""
            }
            href={href}
            key={href}
          >
            {label}
          </a>
        ))}
        <button type="button" onClick={logout}>
          退出
        </button>
      </nav>
    </header>
  );
}
