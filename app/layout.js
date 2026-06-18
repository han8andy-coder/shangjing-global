import Header from "./Header";
import "./globals.css";

export const metadata = {
  title: "商镜Global | 企业订单增长诊断",
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
              <img src="/logo.png" alt="商镜 Global" className="footer-logo" />
              <p className="footer-belief">
                我们相信：企业不是没有机会，很多时候只是客户没有真正看懂你。
              </p>
            </div>
            <div className="footer-services">
              <p className="footer-label">服务方向</p>
              <ul>
                <li>企业获客诊断</li>
                <li>网站转化优化</li>
                <li>AI搜索内容优化</li>
                <li>海外客户入口建设</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 商镜Global · 保留所有权利</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
