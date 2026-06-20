import { notFound } from "next/navigation";
import AdminNav from "../../AdminNav";
import LeadEditor from "./LeadEditor";
import { requireAdminPage } from "../../../../lib/auth";
import { getLead } from "../../../../lib/leads";
import { LEAD_STATUS_LABELS } from "../../../../lib/lead-status";

export const dynamic = "force-dynamic";
export const metadata = { title: "客户详情" };

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`${value}Z`));
}

export default async function LeadDetailPage({ params }) {
  await requireAdminPage();
  const { id } = await params;
  const result = await getLead(id);
  if (!result) notFound();
  const { lead, activities } = result;

  return (
    <div className="admin-app">
      <AdminNav />
      <div className="admin-content">
        <a className="admin-back" href="/admin/leads">← 返回客户列表</a>
        <div className="lead-detail-heading">
          <div>
            <small>{lead.reference}</small>
            <h1>{lead.name}</h1>
            <p>{lead.company}</p>
          </div>
          <span className={`lead-status status-${lead.status}`}>
            {LEAD_STATUS_LABELS[lead.status] || lead.status}
          </span>
        </div>

        <div className="lead-detail-grid">
          <div>
            <section className="admin-panel lead-info">
              <h2>客户资料</h2>
              <dl>
                <div><dt>联系方式</dt><dd>{lead.contact}</dd></div>
                <div><dt>网站</dt><dd>{lead.website ? <a href={lead.website} target="_blank" rel="noreferrer">{lead.website}</a> : "—"}</dd></div>
                <div><dt>提交语言</dt><dd>{lead.language === "en" ? "English" : "中文"}</dd></div>
                <div><dt>来源页面</dt><dd>{lead.source_page || "—"}</dd></div>
                <div><dt>提交时间</dt><dd>{formatDate(lead.created_at)}</dd></div>
              </dl>
              <h3>当前问题</h3>
              <p className="lead-problem">{lead.problem}</p>
            </section>

            {lead.diagnosis_score !== null && (
              <section className="admin-panel lead-diagnosis">
                <h2>诊断结果</h2>
                <strong>{lead.diagnosis_score}<span>/100</span></strong>
                <div>
                  <b>{lead.diagnosis_label}</b>
                  <p>{lead.diagnosis_title}</p>
                </div>
              </section>
            )}

            <section className="admin-panel">
              <h2>跟进记录</h2>
              <div className="activity-list">
                {activities.map((activity) => (
                  <article key={activity.id}>
                    <span>{formatDate(activity.created_at)}</span>
                    <p>{activity.note}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
          <aside>
            <LeadEditor lead={lead} />
          </aside>
        </div>
      </div>
    </div>
  );
}
