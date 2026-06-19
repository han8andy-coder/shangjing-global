import Header from "./Header";
import "./globals.css";
import "./business.css";

export const metadata = {
  title: "商镜Global | 网站建设、Google广告、地图商铺与品牌印刷",
  description: "商镜Global为企业提供网站建设与优化、Google Ads、地图商铺运营、样本册、包装及商业印刷服务，帮助企业建立完整获客入口。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <a href="/" className="footer-brand-name"><strong>商镜</strong><span>Global</span></a>
              <p className="footer-belief">网站、广告、地图商铺与品牌印刷，一套完整的企业增长服务。</p>
              <p className="footer-tagline">DIGITAL GROWTH & BRAND PRODUCTION</p>
            </div>
            <div className="footer-col">
              <p className="footer-label">数字获客</p>
              <ul>
                <li><a href="/services">网站建设与优化</a></li>
                <li><a href="/services">Google Ads广告</a></li>
                <li><a href="/services">地图商铺运营</a></li>
                <li><a href="/diagnosis">企业获客诊断</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-label">品牌与印刷</p>
              <ul>
                <li><a href="/services">企业样本册</a></li>
                <li><a href="/services">产品包装与标签</a></li>
                <li><a href="/services">展会与商业印刷品</a></li>
                <li><a href="/contact">联系我们</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 商镜Global · Shangjing Global · 中文 / English / Multilingual Solutions</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
