"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "13475768888";

const copy = {
  zh: {
    title: "提交你的企业信息",
    name: "姓名",
    namePlaceholder: "你的姓名",
    contact: "联系方式",
    contactPlaceholder: "微信 / 手机 / WhatsApp",
    company: "公司或项目名称",
    companyPlaceholder: "你的公司或项目",
    website: "网站或店铺链接（选填）",
    problem: "你现在最想解决的问题",
    problemPlaceholder: "简单描述你的当前情况和最想改善的问题",
    submit: "提交咨询",
    submitting: "正在保存…",
    privacy: "提交后信息会安全保存，方便顾问联系和持续跟进。",
    success: "咨询已提交",
    reference: "咨询编号",
    next: "顾问会尽快联系你。你也可以继续通过 WhatsApp 沟通。",
    whatsapp: "继续在 WhatsApp 联系",
    errorFallback: "保存失败时，你仍可通过 WhatsApp 直接联系我们。",
    diagnosis: "已读取你的诊断结果，将随咨询一起保存。",
  },
  en: {
    title: "Tell us about your business",
    name: "Name",
    namePlaceholder: "Your name",
    contact: "Contact",
    contactPlaceholder: "Phone / Email / WhatsApp",
    company: "Company or project",
    companyPlaceholder: "Your company",
    website: "Website (optional)",
    problem: "What would you like to improve?",
    problemPlaceholder:
      "Tell us about your market, current challenge and desired outcome.",
    submit: "Submit inquiry",
    submitting: "Saving…",
    privacy:
      "Your information will be saved securely so our team can follow up.",
    success: "Inquiry received",
    reference: "Reference",
    next:
      "Our team will contact you soon. You can also continue on WhatsApp.",
    whatsapp: "Continue on WhatsApp",
    errorFallback:
      "If saving fails, you can still contact us directly on WhatsApp.",
    diagnosis: "Your diagnosis result will be saved with this inquiry.",
  },
};

function loadDiagnosis() {
  try {
    const raw = localStorage.getItem("shangjing_diagnosis");
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (
      typeof value.score !== "number" ||
      value.score < 0 ||
      value.score > 100 ||
      typeof value.label !== "string" ||
      typeof value.title !== "string"
    ) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export default function LeadForm({ language = "zh" }) {
  const text = copy[language] || copy.zh;
  const [form, setForm] = useState({
    name: "",
    contact: "",
    company: "",
    website: "",
    problem: "",
    companyWebsite: "",
  });
  const [diagnosis, setDiagnosis] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    setDiagnosis(loadDiagnosis());
  }, []);

  function update(key) {
    return (event) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  const whatsappMessage = useMemo(() => {
    const lines =
      language === "en"
        ? [
            `Reference: ${reference || "Website inquiry"}`,
            `Name: ${form.name}`,
            `Company: ${form.company}`,
            `Contact: ${form.contact}`,
            `Need: ${form.problem}`,
          ]
        : [
            `咨询编号：${reference || "网站咨询"}`,
            `姓名：${form.name}`,
            `公司：${form.company}`,
            `联系方式：${form.contact}`,
            `需求：${form.problem}`,
          ];
    return encodeURIComponent(lines.join("\n"));
  }, [form, language, reference]);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const parameters = new URLSearchParams(window.location.search);
    const payload = {
      ...form,
      language,
      diagnosis,
      sourcePage: window.location.pathname,
      referrer: document.referrer,
      utmSource: parameters.get("utm_source") || "",
      utmMedium: parameters.get("utm_medium") || "",
      utmCampaign: parameters.get("utm_campaign") || "",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit.");
      setReference(result.reference);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="lead-success">
        <CheckCircle2 size={34} />
        <p className="form-title">{text.success}</p>
        <p>
          {text.reference}：<strong>{reference}</strong>
        </p>
        <p>{text.next}</p>
        <a
          className="button primary wide"
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
        >
          {text.whatsapp} <ArrowRight size={18} />
        </a>
      </div>
    );
  }

  return (
    <div className="contact-form-card">
      <p className="form-title">{text.title}</p>
      {diagnosis && language === "zh" && (
        <div className="lead-diagnosis-summary">
          <CheckCircle2 size={18} />
          <span>
            {text.diagnosis}（{diagnosis.score}/100 · {diagnosis.label}）
          </span>
        </div>
      )}
      <form onSubmit={submit}>
        <div className="form-field">
          <label htmlFor={`${language}-lead-name`}>{text.name}</label>
          <input
            id={`${language}-lead-name`}
            value={form.name}
            onChange={update("name")}
            placeholder={text.namePlaceholder}
            maxLength={120}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${language}-lead-contact`}>{text.contact}</label>
          <input
            id={`${language}-lead-contact`}
            value={form.contact}
            onChange={update("contact")}
            placeholder={text.contactPlaceholder}
            maxLength={180}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${language}-lead-company`}>{text.company}</label>
          <input
            id={`${language}-lead-company`}
            value={form.company}
            onChange={update("company")}
            placeholder={text.companyPlaceholder}
            maxLength={180}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${language}-lead-website`}>{text.website}</label>
          <input
            id={`${language}-lead-website`}
            type="url"
            value={form.website}
            onChange={update("website")}
            placeholder="https://..."
            maxLength={500}
          />
        </div>
        <div className="form-field lead-honeypot" aria-hidden="true">
          <label htmlFor={`${language}-company-website`}>Company website</label>
          <input
            id={`${language}-company-website`}
            value={form.companyWebsite}
            onChange={update("companyWebsite")}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${language}-lead-problem`}>{text.problem}</label>
          <textarea
            id={`${language}-lead-problem`}
            rows={5}
            value={form.problem}
            onChange={update("problem")}
            placeholder={text.problemPlaceholder}
            maxLength={3000}
            required
          />
        </div>
        {error && (
          <div className="lead-submit-error">
            <strong>{error}</strong>
            <span>{text.errorFallback}</span>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
        )}
        <button className="button primary wide" disabled={submitting}>
          {submitting ? text.submitting : text.submit}
          {!submitting && <ArrowRight size={18} />}
        </button>
        <p className="lead-form-note">{text.privacy}</p>
      </form>
    </div>
  );
}
