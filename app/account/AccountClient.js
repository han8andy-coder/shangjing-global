"use client";

export default function AccountClient({ user, diagnoses }) {
  async function logout() {
    await fetch("/api/user/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="admin-content" style={{ paddingTop: 60 }}>
      <div className="admin-heading">
        <div>
          <h1>我的账户</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>{user.display_name || user.email}</p>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 13 }}>{user.email}</p>
        </div>
        <button className="button" onClick={logout}>退出登录</button>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>诊断历史</h2>
          <a href="/diagnosis" className="button primary">再次诊断</a>
        </div>
        {diagnoses.length === 0 ? (
          <div className="admin-empty">
            <p>还没有诊断记录。完成诊断后，结果会自动保存到这里。</p>
            <a className="button primary" href="/diagnosis" style={{ display: "inline-block", marginTop: 12 }}>立即免费诊断</a>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>日期</th><th>得分</th><th>评级</th><th>结论</th></tr>
              </thead>
              <tbody>
                {diagnoses.map((d) => (
                  <tr key={d.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{new Date(d.created_at).toLocaleDateString("zh-CN")}</td>
                    <td><strong style={{ color: "var(--brand)", fontSize: 18 }}>{d.score}</strong><span style={{ color: "var(--muted)", fontSize: 12 }}>/100</span></td>
                    <td>{d.label}</td>
                    <td style={{ color: "var(--muted)" }}>{d.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
