import AdminNav from "./AdminNav";
import { requireAdminPage } from "../../lib/auth";
import { getDashboardData } from "../../lib/leads";
import { LEAD_STATUS_LABELS } from "../../lib/lead-status";

export const dynamic = "force-dynamic";
export const metadata = { title: "数据看板" };

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`${value}Z`));
}

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const { totals, byStatus, recent } = getDashboardData();
  const statusCounts = Object.fromEntries(
    byStatus.map((item) => [item.status, item.count]),
  );
  const conversionRate = totals.total
    ? Math.round((totals.won / totals.total) * 100)
    : 0;

  return (
    <div className="admin-app">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>客户增长看板</h1>
          </div>
          <a className="button primary" href="/admin/leads">
            查看全部客户
          </a>
        </div>

        <section className="admin-stat-grid">
          <article>
            <span>客户总数</span>
            <strong>{totals.total}</strong>
          </article>
          <article>
            <span>今日新增</span>
            <strong>{totals.today}</strong>
          </article>
          <article>
            <span>近 7 天新增</span>
            <strong>{totals.last_seven_days}</strong>
          </article>
          <article>
            <span>成交转化率</span>
            <strong>{conversionRate}%</strong>
          </article>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>客户阶段</h2>
          </div>
          <div className="admin-status-grid">
            {Object.entries(LEAD_STATUS_LABELS).map(([status, label]) => (
              <a href={`/admin/leads?status=${status}`} key={status}>
                <span>{label}</span>
                <strong>{statusCounts[status] || 0}</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>最近客户</h2>
            <a href="/admin/leads">全部客户 →</a>
          </div>
          {recent.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>客户</th>
                    <th>联系方式</th>
                    <th>状态</th>
                    <th>提交时间</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <a href={`/admin/leads/${lead.id}`}>
                          <strong>{lead.name}</strong>
                          <span>{lead.company}</span>
                        </a>
                      </td>
                      <td>{lead.contact}</td>
                      <td>
                        <span className={`lead-status status-${lead.status}`}>
                          {LEAD_STATUS_LABELS[lead.status] || lead.status}
                        </span>
                      </td>
                      <td>{formatDate(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">还没有客户提交，网站表单已准备接收。</div>
          )}
        </section>
      </div>
    </div>
  );
}
