"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const english = pathname.startsWith("/en");
  const close = () => setMenuOpen(false);

  const links = english
    ? [
        ["/en/services", "Services"],
        ["/en/contact", "Contact"],
      ]
    : [
        ["/services", "服务"],
        ["/cases", "案例"],
        ["/diagnosis", "免费诊断"],
        ["/about", "关于我们"],
        ["/contact", "联系"],
      ];

  return (
    <header className="site-header">
      <a className="brand" href={english ? "/en" : "/"} aria-label={english ? "Shangjing Global home" : "商镜Global首页"}>
        <span className="brand-text">
          <strong>{english ? "Shangjing" : "商镜"}</strong>
          <span>Global</span>
        </span>
        <small>{english ? "Business Growth Solutions" : "企业获客与品牌增长服务"}</small>
      </a>
      <nav className={menuOpen ? "nav-open" : ""}>
        {links.map(([href, label]) => <a key={href} href={href} onClick={close}>{label}</a>)}
        <a className="language-link" href={english ? "/" : "/en"} onClick={close}>
          {english ? "Chinese" : "EN"}
        </a>
      </nav>
      <button
        className="nav-toggle"
        aria-label={menuOpen ? (english ? "Close menu" : "关闭菜单") : (english ? "Open menu" : "打开菜单")}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span /><span /><span />
      </button>
    </header>
  );
}
