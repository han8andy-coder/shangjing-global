export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "quoted",
  "won",
  "paused",
];

export const LEAD_STATUS_LABELS = {
  new: "新客户",
  contacted: "已联系",
  qualified: "需求确认",
  quoted: "已报价",
  won: "已成交",
  paused: "暂不跟进",
};

export function isLeadStatus(value) {
  return LEAD_STATUSES.includes(value);
}
