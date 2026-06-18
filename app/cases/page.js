import { ArrowRight, CheckCircle2 } from "lucide-react";

const highlights = [
  {
    title: "服务讲清楚",
    text: "客户打开页面，就知道能不能服务他的路线和需求。",
  },
  {
    title: "信任做出来",
    text: "通过服务区域、机场接送说明、常见问题、订单流程，降低客户顾虑。",
  },
  {
    title: "预约更直接",
    text: "减少无效沟通，让客户更容易提交行程信息并确认服务。",
  },
  {
    title: "AI更容易理解",
    text: "把服务项目、城市路线、机场名称、学校专线等内容整理清楚，方便搜索和AI识别。",
  },
];

const directions = [
  {
    tag: "外贸工厂",
    text: "把产品优势、生产能力、出口市场和询盘入口讲清楚。",
  },
  {
    tag: "本地服务",
    text: "把服务范围、价格逻辑、案例和预约流程讲清楚。",
  },
  {
    tag: "批发贸易",
    text: "把产品分类、供应能力、合作方式和客户信任点讲清楚。",
  },
];

export default function CasesPage() {
  return (
    <div className="page-inner page-top-pad">
      <div className="page-hero-text">
        <p className="eyebrow">案例参考</p>
        <h1 className="page-h1">
          先用真实项目验证方法，<br />再复制到更多企业。
        </h1>
        <p className="lead">
          早期没有大量外部案例时，不空讲理论。我们先用真实项目展示：怎样把一个普通网站，优化成更容易获得客户咨询的入口。
        </p>
      </div>

      <div className="case-card">
        <div className="case-card-header">
          <span className="case-tag">示例项目</span>
          <h2>Grandlink · 纽约机场用车服务</h2>
          <p>
            Grandlink是一个纽约用车服务网站。它的目标不是简单介绍公司，而是让客户快速了解服务范围、价格逻辑、机场接送、学校专线、商务包车，并完成预约。
          </p>
        </div>
        <div className="case-highlights">
          {highlights.map(({ title, text }) => (
            <div key={title} className="case-highlight-item">
              <CheckCircle2 size={20} />
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="directions-section">
        <div className="section-title">
          <h2>可复制到的方向</h2>
          <p>同样的方法，可以用于不同类型的企业。</p>
        </div>
        <div className="directions-grid">
          {directions.map(({ tag, text }) => (
            <article key={tag} className="direction-card">
              <span className="direction-tag">{tag}</span>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="why-cta">
          <a className="button primary" href="/diagnosis">
            为我的企业做诊断 <ArrowRight size={18} />
          </a>
          <a className="button secondary" href="/contact">
            直接咨询
          </a>
        </div>
      </div>
    </div>
  );
}
