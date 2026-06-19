import { ArrowRight, BookOpen, Box, Globe2, MapPinned, Megaphone, SearchCheck } from "lucide-react";

const groups = [
  {
    eyebrow: "数字获客",
    title: "让客户找到你，并愿意联系你",
    services: [
      { Icon: Globe2, title: "企业网站建设", desc: "适合新企业、旧网站重做和海外市场入口建设。", items: ["品牌与目标客户定位", "中英文及多语言内容结构", "手机与电脑端设计", "咨询表单与转化跟踪"] },
      { Icon: SearchCheck, title: "网站优化与SEO", desc: "适合已有网站但流量少、咨询少的企业。", items: ["技术与速度优化", "Google搜索内容结构", "服务页、案例与FAQ", "AI搜索可理解内容"] },
      { Icon: Megaphone, title: "Google Ads广告", desc: "适合需要快速获得精准搜索流量的企业。", items: ["关键词与竞争分析", "广告账户与系列搭建", "落地页和转化追踪", "持续优化获客成本"] },
      { Icon: MapPinned, title: "地图商铺与本地获客", desc: "适合门店、本地服务和有明确服务区域的企业。", items: ["Google Business Profile", "Apple Maps、Bing、Yelp", "中国及当地常用地图平台", "资料、图片、评价与排名优化"] },
    ],
  },
  {
    eyebrow: "品牌与印刷",
    title: "让产品和销售资料更有说服力",
    services: [
      { Icon: BookOpen, title: "样本册与产品目录", desc: "适合制造、贸易、批发、展会及销售团队。", items: ["内容策划与文案梳理", "产品摄影与图片处理", "中英文多语言排版", "印前检查与印刷交付"] },
      { Icon: Box, title: "包装与商业印刷品", desc: "适合产品品牌升级和线下推广。", items: ["包装盒、标签与贴纸", "折页、海报与名片", "展会和门店物料", "打样、生产与质量跟进"] },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="page-inner page-top-pad">
      <div className="page-hero-text">
        <p className="eyebrow">商镜Global服务体系</p>
        <h1 className="page-h1">从品牌展示到客户获客，<br />线上线下一起做好。</h1>
        <p className="lead">根据企业所在国家、目标市场和行业，组合网站、搜索广告、地图商铺、样本册与包装服务。</p>
      </div>
      {groups.map((group) => (
        <section className="service-group" key={group.eyebrow}>
          <div className="section-title">
            <p className="eyebrow">{group.eyebrow}</p><h2>{group.title}</h2>
          </div>
          <div className="expanded-services-grid">
            {group.services.map(({ Icon, title, desc, items }) => (
              <article className="expanded-service-card" key={title}>
                <Icon size={28} /><h3>{title}</h3><p>{desc}</p>
                <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>
      ))}
      <div className="service-final-cta">
        <h2>不知道应该先做哪一项？</h2>
        <p>告诉我们你的业务、地区和目标客户，我们先帮你判断最值得投入的入口。</p>
        <a className="button primary" href="/contact">咨询适合我的方案 <ArrowRight size={18} /></a>
      </div>
    </div>
  );
}
