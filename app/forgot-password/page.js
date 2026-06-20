"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: "", recoveryCode: "", newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) return setError("两次密码不一致。");
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, recoveryCode: form.recoveryCode.trim(), newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "重置失败。");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">SHANGJING GLOBAL</p>
        <h1>找回密码</h1>
        {success ? (
          <>
            <p>密码已重置成功！请使用新密码登录。</p>
            <a className="button primary wide" href="/login" style={{ display: "block", textAlign: "center", marginTop: 16 }}>前往登录</a>
          </>
        ) : (
          <form onSubmit={submit}>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>输入注册邮箱和注册时保存的恢复码，即可重置密码。</p>
            <label htmlFor="fp-email">注册邮箱</label>
            <input id="fp-email" type="email" autoComplete="email" value={form.email} onChange={update("email")} required />
            <label htmlFor="fp-code">恢复码</label>
            <input id="fp-code" type="text" autoComplete="off" value={form.recoveryCode} onChange={update("recoveryCode")} placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX" required />
            <label htmlFor="fp-pwd">新密码</label>
            <input id="fp-pwd" type="password" autoComplete="new-password" value={form.newPassword} onChange={update("newPassword")} minLength={8} required />
            <p className="admin-password-hint">至少 8 个字符，含字母和数字。</p>
            <label htmlFor="fp-confirm">确认新密码</label>
            <input id="fp-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={update("confirm")} minLength={8} required />
            {error && <p className="form-error">{error}</p>}
            <button className="button primary wide" disabled={submitting}>
              {submitting ? "重置中…" : "确认重置密码"}
            </button>
            <a className="admin-forgot-link" href="/login">返回登录</a>
          </form>
        )}
      </div>
    </div>
  );
}
