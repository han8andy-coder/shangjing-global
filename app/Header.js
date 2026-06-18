"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="商镜Global首页">
        <img src="/logo.png" alt="商镜 Global" className="brand-logo" />
      </a>
      <nav className={menuOpen ? "nav-open" : ""}>
        <a href="/diagnosis" onClick={() => setMenuOpen(false)}>免费诊断</a>
        <a href="/services" onClick={() => setMenuOpen(false)}>服务</a>
        <a href="/cases" onClick={() => setMenuOpen(false)}>案例</a>
        <a href="/contact" onClick={() => setMenuOpen(false)}>联系</a>
      </nav>
      <button
        className="nav-toggle"
        aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
