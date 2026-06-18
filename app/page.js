import { ArrowRight, Search, BarChart3, Lightbulb, FileText, AlertCircle } from "lucide-react";

const problems = [
  {
    q: "同行有询盘，为什么客户没有主动找你？",
    a: "多数情况不是产品问题。是客户在决定联系之前，已经在网站上找不到信任感，选择了别人。",
  },
  {
    q: "花了钱做网站，客户看了为什么不联系？",
    a: "网站是展示给老板看的，不是给客户用的。一个能带来咨询的网站，逻辑完全不一样。",
  },
  {
    q: "怎么判断问题出在哪里，钱花在哪里有效？",
    a: "不同企业问题不同。先诊断，再决定。盲目重做网站、盲目投广告，往往钱打水漂。",
  },
];

const steps = [
  { Icon: Search, num: "01", title: "发现问题", text: "检查客户入口、网站第一眼、信任感、联系路径，找出最影响询盘的环节。" },
  { Icon: BarChart3, num: "02", title: "分析损失", text: "量化每个问题可能造成的订单损失，让老板看清改这里值多少钱。" },
  { Icon: Lightbulb, num: "03", title: "找到机会", text: "从现有资源出发，找出成本最低、收益最快的改善机会，不是让你全部重来。" },
  { Icon: FileText, num: "04", title: "给出方案", text: "针对企业现状，给出优先级清单和可执行的优化方向。先做什么，再做什么，说清楚。" },
];

const scores = [
  { label: "获客入口", value: 58 },
  { label: "网站转化", value: 42 },
  { label: "信任感建立", value: 35 },
  { label: "AI可见度", value: 28 },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">企业订单增长诊断中心</p>
          <h1>
            <span>同行有询盘，</span>
            <span>为什么客户</span>
            <span>没有主动找你？</span>
          </h1>
          <p className="lead">
            不先卖建站，不先讲技术。先帮你看清问题出在哪，再决定怎么解决。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/diagnosis">立即免费诊断 <ArrowRight size={18} /></a>
            <a className="button secondary" href="/cases">查看诊断样板</a>
          </div>
          <div className="hero-sub">不推销，不绑定。诊断完全免费，结果当场告诉你。</div>
        </div>

        <div className="hero-panel">
          <div className="panel-head">
            <span className="panel-badge">企业获客诊断报告</span>
            <strong className="panel-score">47<small>/100</small></strong>
          </div>
          <div className="panel-label">需要优先改善</div>
          <div className="panel-bars">
            {scores.map(({ label, value }) => (
              <div className="panel-bar" key={label}>
                <div className="panel-bar-top">
                  <span>{label}</span>
                  <b style={{ color: value < 50 ? "#d9a33a" : "#1a60a8" }}>{value}%</b>
                </div>
                <div className="panel-bar-track">
                  <div className="panel-bar-fill" style={{ width: `${value}%`, background: value < 50 ? "#d9a33a" : "#1a60a8" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="panel-advice">
            <AlertCircle size={16} />
            <span>网站转化和信任感是当前最大阻力</span>
          </div>
          <a className="panel-cta" href="/diagnosis">开始你的企业诊断 →</a>
        </div>
      </section>

      <section className="steps-section">
        <div className="page-inner">
          <div className="section-title center">
            <p className="eyebrow">诊断流程</p>
            <h2>四步看清你的订单机会</h2>
            <p className="lead" style={{ margin: "0 auto 0" }}>
              不猜，不假设。用结构化方法找出客户在哪一步流失，机会在哪里。
            </p>
          </div>
          <div className="steps-grid">
            {steps.map(({ Icon, num, title, text }) => (
              <article key={num} className="step-card">
                <div className="step-top">
                  <span className="step-num">{num}</span>
                  <Icon size={26} className="step-icon" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="steps-cta">
            <a className="button primary" href="/diagnosis">开始免费诊断 <ArrowRight size={18} /></a>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="page-inner">
          <div className="section-title">
            <p className="eyebrow">为什么订单没有主动来</p>
            <h2>客户不是没有需求，<br />而是没有选择你。</h2>
            <p className="lead">
              今天的客户在联系你之前，会搜索、对比、看网站、判断可信度。如果你的信息不够清楚，客户很可能在联系前就走了。
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
            <a className="button primary" href="/diagnosis">做一次免费诊断 <ArrowRight size={18} /></a>
            <a className="button secondary" href="/contact">直接咨询</a>
          </div>
        </div>
      </section>
    </>
  );
}
