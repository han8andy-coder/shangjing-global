import AdminNav from "../AdminNav";
import { requireAdminPage } from "../../../lib/auth";
import { listLeads } from "../../../lib/leads";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "../../../lib/lead-status";

export const dynamic = "force-dynamic";
export const metadata = { title: "客户管理" };

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`${value}Z`));
}

export default async function LeadsPage({ searchParams }) {
  await requireAdminPage();
  const query = await searchParams;
  const status = String(query.status || "");
  const search = String(query.search || "");
  const leads = listLeads({ status, search });

  return (
    <div className="admin-app">
      <AdminNav />
      <div className="admin-content">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">LEADS</p>
            <h1>客户管理</h1>
            <p>查看客户需求、诊断结果和跟进状态。</p>
          </div>
        </div>

        <form className="admin-filters" method="get">
          <input
            name="search"
            defaultValue={search}
            placeholder="搜索姓名、公司、联系方式或咨询编号"
          />
          <select name="status" defaultValue={status}>
            <option value="">全部状态</option>
            {LEAD_STATUSES.map((item) => (
              <option value={item} key={item}>
                {LEAD_STATUS_LABELS[item]}
              </option>
            ))}
          </select>
          <button className="button primary">筛选</button>
          {(search || status) && <a href="/admin/leads">清除</a>}
        </form>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>{leads.length} 位客户</h2>
          </div>
          {leads.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>咨询编号 / 客户</th>
                    <th>需求</th>
                    <th>诊断</th>
                    <th>状态</th>
                    <th>时间</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <a href={`/admin/leads/${lead.id}`}>
                          <small>{lead.reference}</small>
                          <strong>{lead.name}</strong>
                          <span>{lead.company} · {lead.contact}</span>
                        </a>
                      </td>
                      <td className="admin-problem-cell">{lead.problem}</td>
                      <td>
                        {lead.diagnosis_score === null
                          ? "—"
                          : `${lead.diagnosis_score}/100`}
                      </td>
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
            <div className="admin-empty">没有符合条件的客户。</div>
          )}
        </section>
      </div>
    </div>
  );
}
