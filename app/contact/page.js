import { CheckCircle2 } from "lucide-react";
import LeadForm from "../components/LeadForm";

export const metadata = {
  title: "联系商镜Global",
  description:
    "提交企业、网站和获客问题，商镜Global将结合诊断结果提供网站、广告、地图商铺或品牌印刷建议。",
};

const whoList = [
  "有产品、有服务，但网上客户不主动来。",
  "已经有网站，但客户看完没有咨询。",
  "想做海外市场，但英文表达、信任感和内容结构不够。",
  "依赖平台获客，想建立自己的客户入口。",
  "想让企业内容更适合AI搜索和未来客户发现方式。",
];

export default function ContactPage() {
  return (
    <div className="page-inner page-top-pad">
      <div className="contact-page-grid">
        <div className="contact-page-left">
          <p className="eyebrow">联系商镜Global</p>
          <h1 className="page-h1">先诊断，再决定怎么做。</h1>
          <p className="lead">
            告诉我们你的企业、网站和当前问题。我们先帮你判断：问题在哪里，是否值得优化，应该从哪一步开始。
          </p>
          <div className="who-section">
            <p className="who-label">适合联系我们的企业</p>
            <ul className="who-list">
              {whoList.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={17} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="contact-form-wrap">
          <LeadForm language="zh" />
        </div>
      </div>
    </div>
  );
}
