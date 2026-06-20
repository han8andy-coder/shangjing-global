"use client";

import { useState } from "react";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "../../../../lib/lead-status";

export default function LeadEditor({ lead }) {
  const [status, setStatus] = useState(lead.status);
  const [owner, setOwner] = useState(lead.owner || "");
  const [nextFollowUpAt, setNextFollowUpAt] = useState(
    lead.next_follow_up_at?.slice(0, 16) || "",
  );
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, owner, nextFollowUpAt, note }),
      });
      if (!response.ok) throw new Error("保存失败");
      setNote("");
      setMessage("已保存。");
      window.setTimeout(() => window.location.reload(), 350);
    } catch {
      setMessage("保存失败，请重试。");
      setSaving(false);
    }
  }

  return (
    <form className="lead-editor" onSubmit={save}>
      <h2>跟进管理</h2>
      <label>
        当前状态
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {LEAD_STATUSES.map((item) => (
            <option value={item} key={item}>
              {LEAD_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <label>
        负责人
        <input
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="例如：老韩"
        />
      </label>
      <label>
        下次联系时间
        <input
          type="datetime-local"
          value={nextFollowUpAt}
          onChange={(event) => setNextFollowUpAt(event.target.value)}
        />
      </label>
      <label>
        新增跟进记录
        <textarea
          rows={5}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="记录电话、WhatsApp、报价或客户反馈"
        />
      </label>
      {message && <p className="form-message">{message}</p>}
      <button className="button primary wide" disabled={saving}>
        {saving ? "正在保存…" : "保存跟进"}
      </button>
    </form>
  );
}
