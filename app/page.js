import {
  ArrowRight, BookOpen, Box, Globe2, MapPinned, Megaphone,
  SearchCheck, TrendingUp, Wrench,
} from "lucide-react";

const digitalServices = [
  { Icon: Globe2, title: "企业网站建设", text: "从品牌定位、内容结构到移动端体验，建设真正能承接客户咨询的网站。" },
  { Icon: Wrench, title: "网站与SEO优化", text: "优化速度、搜索结构、案例、服务页和联系路径，让流量更容易变成询盘。" },
  { Icon: Megaphone, title: "Google Ads获客", text: "关键词研究、广告搭建、落地页与转化跟踪，广告费直接支付给Google。" },
  { Icon: MapPinned, title: "地图商铺运营", text: "按目标地区配置Google商家、Apple Maps、Bing、Yelp或当地地图商铺平台。" },
];

const printServices = [
  { Icon: BookOpen, title: "企业样本册与产品目录", text: "策划、文案、设计、排版与印刷一体化，让销售资料更专业、更容易成交。" },
  { Icon: Box, title: "包装与印刷品", text: "包装盒、标签、贴纸、折页、海报、名片及展会物料，从设计到生产交付。" },
];

const process = [
  ["01", "诊断定位", "了解企业、客户、地区和当前获客问题。"],
  ["02", "建立入口", "建设网站、地图商铺与可信的品牌资料。"],
  ["03", "精准引流", "通过Google广告、搜索内容和本地平台触达客户。"],
  ["04", "持续优化", "跟踪电话、表单和询盘，持续改善转化与成本。"],
];

export default function Home() {
  return (
    <>
      <section className="growth-hero page-inner">
        <div>
          <p className="eyebrow">网站 · 广告 · 地图商铺 · 品牌印刷</p>
          <h1>帮企业建立完整的<br /><span>客户增长入口。</span></h1>
          <p className="lead">
            商镜Global为企业提供网站建设与优化、Google广告、本地地图商铺运营，
            以及样本册和包装印刷服务，让客户看见你、信任你并主动联系你。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/contact">咨询增长方案 <ArrowRight size={18} /></a>
            <a className="button secondary" href="/services">查看全部服务</a>
          </div>
          <p className="hero-sub">先分析企业和目标市场，再决定网站、广告、地图或印刷从哪一步开始。</p>
        </div>
        <div className="growth-system-card">
          <p className="system-kicker">SHANGJING GROWTH SYSTEM</p>
          <h2>从被看见，到被选择</h2>
          <div className="system-flow">
            <span><Globe2 size={20} />网站承接</span>
            <i>→</i>
            <span><MapPinned size={20} />地图曝光</span>
            <i>→</i>
            <span><Megaphone size={20} />广告引流</span>
            <i>→</i>
            <span><TrendingUp size={20} />询盘增长</span>
          </div>
          <div className="system-note"><SearchCheck size={18} />按地区、行业与预算组合渠道，不套用同一方案。</div>
        </div>
      </section>

      <section className="business-section">
        <div className="page-inner">
          <div className="section-title">
            <p className="eyebrow">数字获客服务</p>
            <h2>把线上曝光变成真实客户咨询</h2>
            <p>网站负责承接，地图负责本地发现，广告负责精准流量，数据负责持续改善。</p>
          </div>
          <div className="business-grid">
            {digitalServices.map(({ Icon, title, text }) => (
              <article className="business-card" key={title}>
                <Icon size={26} /><h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="business-section print-section">
        <div className="page-inner">
          <div className="section-title">
            <p className="eyebrow">品牌设计与印刷</p>
            <h2>让线上获客与线下销售使用同一套品牌语言</h2>
            <p>从网站到样本册，从产品包装到展会资料，让企业每一次出现都专业、统一、可信。</p>
          </div>
          <div className="print-grid">
            {printServices.map(({ Icon, title, text }) => (
              <article className="print-card" key={title}>
                <Icon size={30} /><div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="steps-section">
        <div className="page-inner">
          <div className="section-title center">
            <p className="eyebrow">合作流程</p>
            <h2>一套可以持续增长的获客系统</h2>
          </div>
          <div className="steps-grid">
            {process.map(([num, title, text]) => (
              <article className="step-card" key={num}>
                <span className="step-num">{num}</span><h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
          <div className="steps-cta">
            <a className="button primary" href="/diagnosis">先做免费诊断 <ArrowRight size={18} /></a>
          </div>
        </div>
      </section>
    </>
  );
}
