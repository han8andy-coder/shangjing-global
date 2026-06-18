import { ArrowRight } from "lucide-react";

const services = [
  {
    tag: "免费",
    title: "企业获客体检",
    audience: "不知道问题在哪里，只知道客户咨询太少。",
    items: ["检查网站第一眼印象", "客户入口和来源分析", "内容表达和信任感评估", "联系转化路径诊断"],
    goal: "让老板先看清问题，再决定是否继续优化。",
    cta: "开始免费体检",
    href: "/diagnosis",
    primary: true,
  },
  {
    tag: "优化",
    title: "网站转化优化",
    audience: "已经有网站，但客户看了不联系。",
    items: ["优化首页和服务页", "强化案例和信任模块", "补充FAQ和服务流程", "完善联系入口"],
    goal: '让网站从"展示资料"变成"客户咨询入口"。',
    cta: "咨询优化方案",
    href: "/contact",
    primary: false,
  },
  {
    tag: "AI内容",
    title: "AI搜索内容优化",
    audience: "希望被Google、AI搜索、ChatGPT类工具更容易推荐。",
    items: ["整理企业介绍和产品说明", "优化服务优势表达", "补充行业问答内容", "调整搜索内容结构"],
    goal: "让企业内容更容易被搜索和AI识别，提升未来被推荐的机会。",
    cta: "了解AI内容优化",
    href: "/contact",
    primary: false,
  },
];

export default function ServicesPage() {
  return (
    <div className="page-inner page-top-pad">
      <div className="page-hero-text">
        <p className="eyebrow">服务内容</p>
        <h1 className="page-h1">
          不是简单做网站，<br />而是帮企业提升客户咨询机会。
        </h1>
        <p className="lead">
          我们先诊断问题，再给解决方案。不盲目上系统，不盲目投广告，先找出最容易产生订单改善的地方。
        </p>
      </div>

      <div className="services-grid">
        {services.map((s) => (
          <article key={s.title} className={`service-card${s.primary ? " service-card--primary" : ""}`}>
            <div className="service-tag">{s.tag}</div>
            <h2>{s.title}</h2>
            <div className="service-block">
              <p className="service-label">适合企业</p>
              <p>{s.audience}</p>
            </div>
            <div className="service-block">
              <p className="service-label">服务内容</p>
              <ul className="service-list">
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="service-block">
              <p className="service-label">目标</p>
              <p>{s.goal}</p>
            </div>
            <a
              className={`button${s.primary ? " primary" : " secondary"} wide`}
              href={s.href}
            >
              {s.cta} <ArrowRight size={17} />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
