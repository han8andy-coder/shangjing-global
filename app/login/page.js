"use client";

import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败。");
      window.location.href = "/account";
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">SHANGJING GLOBAL</p>
        <h1>用户登录</h1>
        <form onSubmit={submit}>
          <label htmlFor="login-email">邮箱</label>
          <input id="login-email" type="email" autoComplete="email" value={form.email} onChange={update("email")} required />
          <label htmlFor="login-password">密码</label>
          <input id="login-password" type="password" autoComplete="current-password" value={form.password} onChange={update("password")} required />
          {error && <p className="form-error">{error}</p>}
          <button className="button primary wide" disabled={submitting}>
            {submitting ? "登录中…" : "登录"}
          </button>
          <a className="admin-forgot-link" href="/forgot-password">忘记密码？</a>
          <a className="admin-forgot-link" href="/register">还没有账户？立即注册</a>
        </form>
      </div>
    </div>
  );
}
