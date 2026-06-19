"use client";

import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const whatsappBase = "https://wa.me/13475768888?text=";
const WHATSAPP_NUMBER = "+1-347-576-8888";

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
  const [blocked, setBlocked] = useState(false);
  const [toast, setToast] = useState("");

  // 读取并校验 localStorage 诊断数据
  function loadDiagnosis() {
    try {
      const raw = localStorage.getItem("shangjing_diagnosis");
      if (!raw) return null;
      const data = JSON.parse(raw);
      // 校验结构合法性
      if (
        typeof data.score !== "number" ||
        data.score < 0 ||
        data.score > 100 ||
        typeof data.label !== "string" ||
        typeof data.title !== "string"
      ) {
        localStorage.removeItem("shangjing_diagnosis"); // 非法数据删除
        return null;
      }
      return data;
    } catch (_) {
      localStorage.removeItem("shangjing_diagnosis");
      return null;
    }
  }

  // 读取诊断结果（如有）
  const [diagnosis, setDiagnosis] = useState(null);
  useEffect(() => {
    setDiagnosis(loadDiagnosis());
  }, []);

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const lines = [
      `姓名：${form.name}`,
      `联系方式：${form.contact}`,
      `公司/项目：${form.company}`,
      form.website ? `网站链接：${form.website}` : "",
      `当前问题：${form.problem}`,
    ].filter(Boolean);

    // 附加诊断结果（如有）
    if (diagnosis) {
      lines.push("");
      lines.push("---诊断结果---");
      lines.push(`得分：${diagnosis.score}/100`);
      lines.push(`主要问题：${diagnosis.title}`);
    }

    const text = lines.join("\n");
    const win = window.open(whatsappBase + encodeURIComponent(text), "_blank");

    if (!win) {
      // 弹窗被浏览器阻止
      setBlocked(true);
      showToast(`请允许弹出窗口，或直接 WhatsApp 联系 ${WHATSAPP_NUMBER}`);
    } else {
      setBlocked(false); // 成功打开则清除警告
    }
  }

  return (
    <div className="page-inner page-top-pad">
      {/* Toast 提示 */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: "var(--ink)",
            color: "#fff",
            borderRadius: 8,
            padding: "14px 22px",
            fontSize: 14,
            fontWeight: 800,
            boxShadow: "0 8px 24px rgba(6,38,90,0.22)",
            maxWidth: "calc(100vw - 40px)",
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}

      <div className="contact-page-grid">
        <div className="contact-page-left">
          <p className="eyebrow">联系商镜Global</p>
          <h1 className="page-h1">先诊断，再决定怎么做。</h1>
          <p className="lead">
            告诉我们你的企业、网站和当前问题。我们先帮你判断：问题在哪里，是否值得优化，应该从哪一步开始。
          </p>

          {/* 如有诊断结果，显示小摘要 */}
          {diagnosis && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: "1px solid rgba(217,163,58,0.36)",
                borderRadius: 10,
                padding: "14px 18px",
                background: "#fff8ea",
                marginBottom: 24,
                fontSize: 14,
                fontWeight: 900,
                color: "var(--accent-dark)",
              }}
            >
              <CheckCircle2 size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
              <span>
                已读取你的诊断结果（{diagnosis.score}/100 · {diagnosis.label}），将随咨询一起发送。
              </span>
            </div>
          )}

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
                通过 WhatsApp 发送咨询 <ArrowRight size={18} />
              </button>
              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  fontSize: 13,
                  color: "var(--muted)",
                  textAlign: "center",
                  lineHeight: 1.65,
                }}
              >
                提交后将跳转至 WhatsApp，发送消息给我们的顾问
              </p>
            </form>

            {/* 弹窗被阻止时的备用显示 */}
            {blocked && (
              <div
                style={{
                  marginTop: 16,
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "16px 18px",
                  background: "var(--paper)",
                  fontSize: 14,
                  fontWeight: 900,
                  lineHeight: 1.7,
                }}
              >
                <p style={{ marginBottom: 8, color: "var(--ink)" }}>弹出窗口被浏览器阻止，请直接联系我们：</p>
                <a
                  href={`https://wa.me/13475768888`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#25d366",
                    fontWeight: 900,
                    fontSize: 16,
                  }}
                >
                  WhatsApp：{WHATSAPP_NUMBER}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
