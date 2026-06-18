import { Eye, BarChart2, Cpu, ArrowRight } from "lucide-react";

const values = [
  { Icon: Eye, title: "用镜子看见问题", text: "很多企业老板不是不努力，而是看不清问题出在哪。我们帮你照镜子——客观、直接、不绕弯子。" },
  { Icon: BarChart2, title: "用数据发现机会", text: "不靠感觉，不靠经验拍脑袋。用结构化的方法，找出最值得改善的那一步。" },
  { Icon: Cpu, title: "用AI帮企业找到增长方向", text: "AI改变了客户发现企业的方式。我们帮你把企业内容整理清楚，让AI和搜索引擎更容易理解你。" },
];

const beliefs = [
  "企业不是没有机会，很多时候只是客户没有真正看懂你。",
  "不是所有问题都需要花大钱解决。先找到最关键的那一步。",
  "先诊断，再决定。不猜，不推销，不绑定。",
  "帮一个企业增长，比做一百个普通网站更有价值。",
];

export default function AboutPage() {
  return (
    <div className="page-inner page-top-pad">
      <div className="about-hero">
        <p className="eyebrow">关于商镜Global</p>
        <h1 className="page-h1">帮企业看清：<br />客户为什么没有主动来。</h1>
        <p className="lead">
          商镜Global是一家专注企业获客诊断的服务机构。我们不是建站公司，也不是广告公司。我们只做一件事：帮企业老板找出客户流失的真正原因，再给出最小代价的改善方向。
        </p>
      </div>

      <div className="about-values">
        <h2 className="about-section-title">我们的三个方法</h2>
        <div className="about-values-grid">
          {values.map(({ Icon, title, text }) => (
            <article key={title} className="about-value-card">
              <div className="about-value-icon"><Icon size={28} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="about-beliefs">
        <h2 className="about-section-title">我们相信</h2>
        <div className="about-belief-list">
          {beliefs.map((item, i) => (
            <div key={i} className="about-belief-item">
              <span className="about-belief-num">{String(i + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-cta">
        <div className="about-cta-inner">
          <h2>有问题？先做一次免费诊断。</h2>
          <p>15分钟之内，你会知道企业获客的问题出在哪里。</p>
          <div className="about-cta-buttons">
            <a className="button primary" href="/diagnosis">立即免费诊断 <ArrowRight size={18} /></a>
            <a className="button secondary" href="/contact">直接联系我们</a>
          </div>
        </div>
      </div>
    </div>
  );
}
