import { ArrowRight, Brain, ClipboardCheck, Search } from "lucide-react";

const features = [
  {
    Icon: ClipboardCheck,
    title: "90秒初步诊断",
    text: "快速判断企业获客问题，不盲目重做网站。",
  },
  {
    Icon: Search,
    title: "5大获客环节检查",
    text: "从客户搜索、网站第一眼、信任建立、内容表达、联系转化逐项分析。",
  },
  {
    Icon: Brain,
    title: "AI时代内容优化",
    text: "让客户和AI都更容易理解你的企业、产品和服务。",
  },
];

const problems = [
  {
    q: "客户为什么看了不联系？",
    a: "你的产品可能很好，但网站没有把优势讲清楚，客户看完没有信心，也没有行动理由。",
  },
  {
    q: "为什么同行能被找到，你却很少被看到？",
    a: "客户正在用搜索引擎、平台和AI寻找供应商。内容结构不清楚，企业就很难被推荐。",
  },
  {
    q: "钱应该花在哪里最有效？",
    a: "不是所有企业都需要重做网站。先诊断问题，再决定优化首页、内容、案例、广告或搜索入口。",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">替企业看清获客问题</p>
          <h1>
            <span>让客户看见你，</span>
            <span>让订单主动靠近你。</span>
          </h1>
          <p className="lead">
            很多企业不是产品不好，而是客户在搜索、比较、信任和联系之前，就已经流失了。商镜Global帮你诊断企业获客问题，找出订单机会卡在哪里。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/diagnosis">
              立即免费诊断 <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="/cases">
              查看诊断样板
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/hero-diagnosis.png" alt="商镜Global企业增长诊断视觉图" />
          <div className="visual-panel">
            <span>诊断重点</span>
            <strong>先找最影响询盘的那一步</strong>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="page-inner">
          <div className="features-grid">
            {features.map(({ Icon, title, text }) => (
              <div key={title} className="feature-card">
                <Icon size={32} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="page-inner">
          <div className="section-title">
            <p className="eyebrow">为什么需要商镜</p>
            <h2>
              客户不是没有需求，<br />而是没有选择你。
            </h2>
            <p className="lead">
              今天的客户不会只看价格。他们会搜索、比较、询问AI、查看网站、判断可信度。如果你的企业信息不清楚、网站不专业、内容没有说服力，客户很可能在联系你之前，已经选择了别人。
            </p>
          </div>
          <div className="problem-grid">
            {problems.map(({ q, a }) => (
              <article key={q} className="problem-card">
                <h3>{q}</h3>
                <p>{a}</p>
              </article>
            ))}
          </div>
          <div className="why-cta">
            <a className="button primary" href="/diagnosis">
              做一次免费诊断 <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="/contact">
              直接咨询
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
