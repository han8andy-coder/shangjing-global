## 返工记录 2026-06-18 第1轮

### 本次修复
- 问题1 → 移除英文导航中不存在的 `/cases` 和 `/about` 链接，避免 404 | 文件：app/Header.js
- 问题4 → 手机端 560px 断点下 `.question-column` 和 `.result-column` 改为 `max-width: 100%`，诊断页全宽显示 | 文件：app/globals.css

### 判定为误判，不修改
- 问题2：diagnosis/page.js blocker 评分逻辑正确——"竞争太激烈"高分表示客户至少能找到你，是合理商业逻辑
- 问题3：contact/page.js 已有 blocked 状态降级（显示 WhatsApp 直连链接），无需额外改动

### 仍未解决
- 英文版 /en/cases 和 /en/about 页面尚未创建（属于新功能，不在本次返工范围）
- Playwright 截图本轮跳过（MCP 需重启 Claude Code 后生效）
