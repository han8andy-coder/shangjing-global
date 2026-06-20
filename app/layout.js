import Header from "./Header";
import { headers } from "next/headers";
import "./globals.css";
import "./business.css";

export const metadata = {
  title: "商镜Global | 网站建设、Google广告、地图商铺与品牌印刷",
  description: "商镜Global为企业提供网站建设与优化、Google Ads、地图商铺运营、样本册、包装及商业印刷服务，帮助企业建立完整获客入口。",
};

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-sjg-pathname") || "/";
  const english = requestHeaders.get("x-sjg-language") === "en";
  const admin = pathname.startsWith("/admin");

  return (
    <html lang={english ? "en" : "zh-CN"}>
      <body>
        {!admin && <Header />}
        <main>{children}</main>
        {!admin && <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <a href={english ? "/en" : "/"} className="footer-brand-name">
                <strong>{english ? "Shangjing" : "商镜"}</strong>
                <span>Global</span>
              </a>
              <p className="footer-belief">
                {english
                  ? "Websites, advertising, local listings and brand production in one growth system."
                  : "网站、广告、地图商铺与品牌印刷，一套完整的企业增长服务。"}
              </p>
              <p className="footer-tagline">DIGITAL GROWTH & BRAND PRODUCTION</p>
            </div>
            <div className="footer-col">
              <p className="footer-label">{english ? "Digital Growth" : "数字获客"}</p>
              <ul>
                <li><a href={english ? "/en/services" : "/services"}>{english ? "Website Development" : "网站建设与优化"}</a></li>
                <li><a href={english ? "/en/services" : "/services"}>{english ? "Google Ads" : "Google Ads广告"}</a></li>
                <li><a href={english ? "/en/services" : "/services"}>{english ? "Local Business Listings" : "地图商铺运营"}</a></li>
                <li><a href={english ? "/en/contact" : "/diagnosis"}>{english ? "Growth Consultation" : "企业获客诊断"}</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-label">{english ? "Brand & Print" : "品牌与印刷"}</p>
              <ul>
                <li><a href={english ? "/en/services" : "/services"}>{english ? "Catalogs & Brochures" : "企业样本册"}</a></li>
                <li><a href={english ? "/en/services" : "/services"}>{english ? "Packaging & Labels" : "产品包装与标签"}</a></li>
                <li><a href={english ? "/en/services" : "/services"}>{english ? "Trade-show Materials" : "展会与商业印刷品"}</a></li>
                <li><a href={english ? "/en/contact" : "/contact"}>{english ? "Contact Us" : "联系我们"}</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              {english
                ? "© 2026 Shangjing Global · English / Multilingual Solutions"
                : "© 2026 商镜Global · Shangjing Global · 中文 / English / Multilingual Solutions"}
            </p>
          </div>
        </footer>}
      </body>
    </html>
  );
}
