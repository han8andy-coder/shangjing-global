"use client";

import { useState } from "react";

export default function AdminRecoverPage() {
  const [form, setForm] = useState({
    recoveryKey: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(key) {
    return (event) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "重置失败。");
      setSuccess(true);
    } catch (recoveryError) {
      setError(recoveryError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">SECURE RECOVERY</p>
        <h1>重设管理员密码</h1>
        {success ? (
          <div className="admin-recovery-success">
            <strong>密码已经更新</strong>
            <p>所有旧登录已失效，请使用新密码重新登录。</p>
            <a className="button primary wide" href="/admin/login">
              返回登录
            </a>
          </div>
        ) : (
          <>
            <p>
              输入服务器配置的恢复密钥，并设置一个新的后台密码。
            </p>
            <form onSubmit={submit}>
              <label htmlFor="admin-recovery-key">恢复密钥</label>
              <input
                id="admin-recovery-key"
                type="password"
                autoComplete="off"
                value={form.recoveryKey}
                onChange={update("recoveryKey")}
                required
              />
              <label htmlFor="admin-new-password">新密码</label>
              <input
                id="admin-new-password"
                type="password"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={update("newPassword")}
                minLength={12}
                required
              />
              <p className="admin-password-hint">
                至少 12 个字符，并同时包含字母和数字。
              </p>
              <label htmlFor="admin-confirm-password">确认新密码</label>
              <input
                id="admin-confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                minLength={12}
                required
              />
              {error && <p className="form-error">{error}</p>}
              <button className="button primary wide" disabled={submitting}>
                {submitting ? "正在重设…" : "重设密码"}
              </button>
              <a className="admin-forgot-link" href="/admin/login">
                返回登录
              </a>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
