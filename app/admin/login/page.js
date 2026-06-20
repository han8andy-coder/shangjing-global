"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "登录失败。");
      window.location.href = "/admin";
    } catch (loginError) {
      setError(loginError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">SHANGJING CRM</p>
        <h1>客户管理后台</h1>
        <p>登录后查看客户、诊断结果和跟进进度。</p>
        <form onSubmit={submit}>
          <label htmlFor="admin-password">管理员密码</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="form-error">{error}</p>}
          <button className="button primary wide" disabled={submitting}>
            {submitting ? "正在登录…" : "进入后台"}
          </button>
          <a className="admin-forgot-link" href="/admin/recover">
            忘记密码？
          </a>
        </form>
      </div>
    </div>
  );
}
