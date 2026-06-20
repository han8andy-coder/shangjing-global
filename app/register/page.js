"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", displayName: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("两次输入的密码不一致。");
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, displayName: form.displayName, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "注册失败。");
      setRecoveryCode(data.recoveryCode);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (recoveryCode && !confirmed) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <p className="eyebrow">注册成功</p>
          <h1>保存您的恢复码</h1>
          <p>这是您<strong>唯一的密码找回方式</strong>，请立即截图或抄写，关闭此页面后无法再次查看。</p>
          <div style={{
            margin: "20px 0", padding: "20px",
            background: "#f5f8fc", border: "2px solid var(--accent)",
            borderRadius: 10, textAlign: "center",
            fontSize: 20, fontWeight: 900, letterSpacing: 3, color: "var(--ink)",
          }}>
            {recoveryCode}
          </div>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            忘记密码时，在"找回密码"页面输入此码即可重置。
          </p>
          <button className="button primary wide" onClick={() => setConfirmed(true)}>
            已保存，进入账户
          </button>
        </div>
      </div>
    );
  }

  if (confirmed) {
    if (typeof window !== "undefined") window.location.href = "/account";
    return null;
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">SHANGJING GLOBAL</p>
        <h1>创建账户</h1>
        <p>注册后可保存诊断记录，随时查看增长建议。</p>
        <form onSubmit={submit}>
          <label htmlFor="reg-name">您的称呼</label>
          <input id="reg-name" type="text" autoComplete="name" value={form.displayName} onChange={update("displayName")} placeholder="例：张总" required />
          <label htmlFor="reg-email">邮箱</label>
          <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={update("email")} required />
          <label htmlFor="reg-password">密码</label>
          <input id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={update("password")} minLength={8} required />
          <p className="admin-password-hint">至少 8 个字符，含字母和数字。</p>
          <label htmlFor="reg-confirm">确认密码</label>
          <input id="reg-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={update("confirm")} minLength={8} required />
          {error && <p className="form-error">{error}</p>}
          <button className="button primary wide" disabled={submitting}>
            {submitting ? "注册中…" : "立即注册"}
          </button>
          <a className="admin-forgot-link" href="/login">已有账户？立即登录</a>
        </form>
      </div>
    </div>
  );
}
