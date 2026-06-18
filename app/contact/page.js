"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const whatsappBase = "https://wa.me/13475768888?text=";

const whoList = [
  "有产品、有服务，但网上客户不主动来。",
  "已经有网站，但客户看完没有咨询。",
  "想做海外市场，但英文表达、信任感和内容结构不够。",
  "依赖平台获客，想建立自己的客户入口。",
  "想让企业内容更适合AI搜索和未来客户发现方式。",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    company: "",
    website: "",
    problem: "",
  });

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = [
      `姓名：${form.name}`,
      `联系方式：${form.contact}`,
      `公司/项目：${form.company}`,
      form.website ? `网站链接：${form.website}` : "",
      `当前问题：${form.problem}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappBase + encodeURIComponent(text), "_blank");
  }

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
          <div className="contact-form-card">
            <p className="form-title">提交你的企业信息</p>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="name">姓名</label>
                <input
                  id="name"
                  type="text"
                  placeholder="你的姓名"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="contact">联系方式</label>
                <input
                  id="contact"
                  type="text"
                  placeholder="微信 / 手机 / WhatsApp"
                  value={form.contact}
                  onChange={set("contact")}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="company">公司或项目名称</label>
                <input
                  id="company"
                  type="text"
                  placeholder="你的公司或项目"
                  value={form.company}
                  onChange={set("company")}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="website">网站或店铺链接（选填）</label>
                <input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  value={form.website}
                  onChange={set("website")}
                />
              </div>
              <div className="form-field">
                <label htmlFor="problem">你现在最想解决的问题</label>
                <textarea
                  id="problem"
                  rows={4}
                  placeholder="简单描述你的当前情况和最想改善的问题"
                  value={form.problem}
                  onChange={set("problem")}
                  required
                />
              </div>
              <button type="submit" className="button primary wide">
                提交诊断咨询 <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
