import Header from "./Header";
import "./globals.css";

export const metadata = {
  title: "商镜Global | 企业订单增长诊断中心",
  description: "商镜Global帮助B2B企业用一次快速诊断，发现客户流失环节、询盘承接问题和优先改善方向。",
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
              <a href="/" className="footer-brand-name">
                <strong>商镜</strong><span>Global</span>
              </a>
              <p className="footer-belief">
                用镜子看见问题，用数据发现机会，用AI帮企业找到增长方向。
              </p>
              <p className="footer-tagline">企业订单增长诊断中心</p>
            </div>
            <div className="footer-col">
              <p className="footer-label">服务方向</p>
              <ul>
                <li><a href="/services">企业获客诊断</a></li>
                <li><a href="/services">网站转化优化</a></li>
                <li><a href="/services">AI搜索内容优化</a></li>
                <li><a href="/services">海外客户入口建设</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-label">快速入口</p>
              <ul>
                <li><a href="/diagnosis">免费诊断</a></li>
                <li><a href="/cases">案例参考</a></li>
                <li><a href="/about">关于我们</a></li>
                <li><a href="/contact">联系我们</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 商镜Global · 保留所有权利 · 企业获客问题，先诊断再决定</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
