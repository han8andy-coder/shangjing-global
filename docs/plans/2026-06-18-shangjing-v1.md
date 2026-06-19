# 商镜Global 网站 V1 实施方案

> **执行前必读：** 用 `/executing-plans` 逐任务执行。每改完一个 Task 必须 `npm run build`。

**目标：** 完成商镜Global企业订单增长诊断中心第一版静态网站，消除所有破损图片，补全 About 页，强化首页痛点冲击力。

**技术栈：** Next.js 15 App Router · 纯 CSS (globals.css) · Lucide React 图标 · 无需图片文件

## 全局约束

- 禁止使用任何 `<img src="...">` 引用不存在的文件（logo.png, hero-diagnosis.png 均不存在）
- 品牌名用纯 CSS 文字样式替代 logo 图片
- 所有页面必须在 `npm run build` 后无报错
- 文案要商业化、口语化，直击企业老板痛点
- 不写技术词，多写"订单/客户/机会/咨询"

---

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `app/Header.js` | 修改 | 品牌改为纯文字样式；nav 加"关于我们"链接 |
| `app/layout.js` | 修改 | Footer logo 改为纯文字；Footer 加联系信息 |
| `app/page.js` | 重写 | 强化 Hero 标题；Hero visual 改为 CSS 诊断面板；加四步流程模块 |
| `app/about/page.js` | 新建 | 公司理念页 |
| `app/globals.css` | 修改 | 新增：纯文字品牌样式；Hero CSS 诊断面板；四步流程；About 页样式 |

**不动的文件：** `diagnosis/page.js`、`services/page.js`、`cases/page.js`、`contact/page.js`（内容已完善）

---

## Task 1：修复 Header — 移除 logo 图片，加"关于我们"

**文件：**
- 修改：`app/Header.js`
- 修改：`app/globals.css`（`.brand-text` 样式）

**目标：** 品牌区域改为纯 CSS 文字，不再依赖 logo.png；导航加"关于我们"。

- [ ] **Step 1：Read `app/Header.js`**（已读，确认当前用 `<img src="/logo.png">`）

- [ ] **Step 2：修改 `app/Header.js`**

```jsx
"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="商镜Global首页">
        <span className="brand-text">
          <strong>商镜</strong><span>Global</span>
        </span>
        <small>企业订单增长诊断中心</small>
      </a>
      <nav className={menuOpen ? "nav-open" : ""}>
        <a href="/diagnosis" onClick={() => setMenuOpen(false)}>免费诊断</a>
        <a href="/services" onClick={() => setMenuOpen(false)}>服务</a>
        <a href="/cases" onClick={() => setMenuOpen(false)}>案例</a>
        <a href="/about" onClick={() => setMenuOpen(false)}>关于我们</a>
        <a href="/contact" onClick={() => setMenuOpen(false)}>联系</a>
      </nav>
      <button
        className="nav-toggle"
        aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
```

- [ ] **Step 3：在 `globals.css` 替换 `.brand-logo` 相关样式，加入 `.brand-text`**

删除以下旧样式：
```css
.brand-logo { ... }
.brand-icon { ... }
.brand strong { ... }
.brand strong span { ... }
.brand small { ... }
```

新增：
```css
.brand {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
  text-decoration: none;
}

.brand-text {
  display: flex;
  align-items: baseline;
  gap: 0;
  line-height: 1;
}

.brand-text strong {
  font-size: 26px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.brand-text span {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.brand small {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: var(--muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

- [ ] **Step 4：`npm run build`** — 确认无报错

- [ ] **Step 5：commit**
```
git add app/Header.js app/globals.css
git commit -m "fix: Header 品牌改纯文字，加关于我们导航"
```

---

## Task 2：修复 Footer — 移除 logo 图片，加联系信息

**文件：** `app/layout.js`、`app/globals.css`

- [ ] **Step 1：Read `app/layout.js`**（已读，确认用 `<img src="/logo.png">` 和 `<img src="/footer-logo">`）

- [ ] **Step 2：修改 `app/layout.js`**

```jsx
import Header from "./Header";
import "./globals.css";

export const metadata = {
  title: "商镜Global | 企业订单增长诊断中心",
  description: "商镜Global帮助B2B企业用一次快速诊断，发现客户流失环节、询盘承接问题和优先改善方向。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <a href="/" className="footer-brand-name">
                <strong>商镜</strong><span>Global</span>
              </a>
              <p className="footer-belief">
                用镜子看见问题，用数据发现机会，用AI帮企业找到增长方向。
              </p>
              <p className="footer-tagline">企业订单增长诊断中心</p>
            </div>
            <div className="footer-col">
              <p className="footer-label">服务方向</p>
              <ul>
                <li><a href="/services">企业获客诊断</a></li>
                <li><a href="/services">网站转化优化</a></li>
                <li><a href="/services">AI搜索内容优化</a></li>
                <li><a href="/services">海外客户入口建设</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-label">快速入口</p>
              <ul>
                <li><a href="/diagnosis">免费诊断</a></li>
                <li><a href="/cases">案例参考</a></li>
                <li><a href="/about">关于我们</a></li>
                <li><a href="/contact">联系我们</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 商镜Global · 保留所有权利 · 企业获客问题，先诊断再决定</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
```

- [ ] **Step 3：更新 globals.css Footer 相关样式**

删除旧的 `.footer-logo`、`.footer-services` 样式，替换为：

```css
.footer-brand-name {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  margin-bottom: 14px;
  text-decoration: none;
}

.footer-brand-name strong {
  font-size: 24px;
  font-weight: 900;
  color: var(--ink);
}

.footer-brand-name span {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}

.footer-tagline {
  font-size: 12px;
  font-weight: 800;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 8px;
}

.footer-col .footer-label {
  font-size: 12px;
  font-weight: 900;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  border-left: 3px solid var(--accent);
  padding-left: 10px;
}

.footer-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.footer-col li a {
  font-size: 15px;
  color: var(--ink);
  font-weight: 700;
  transition: color 160ms ease;
}

.footer-col li a:hover {
  color: var(--brand);
}
```

更新 `.footer-inner`：
```css
.footer-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 48px;
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 52px 0 40px;
  align-items: start;
}
```

响应式（960px 以下）`footer-inner` 改为 `grid-template-columns: 1fr 1fr`；560px 以下改为 `grid-template-columns: 1fr`。

- [ ] **Step 4：`npm run build`** — 确认无报错

- [ ] **Step 5：commit**
```
git add app/layout.js app/globals.css
git commit -m "fix: Footer 改纯文字品牌，加导航列，移除破损图片"
```

---

## Task 3：重写首页 — 强化痛点 Hero + 加四步诊断流程

**文件：** `app/page.js`、`app/globals.css`

**目标：** 
- Hero 标题改为"同行有询盘，为什么客户没有主动找你？"
- Hero 右侧改为 CSS 诊断评分面板（不用图片）
- 加四步流程：发现问题 → 分析损失 → 找到机会 → 给出方案

- [ ] **Step 1：Read `app/page.js`**（已读，确认现有结构）

- [ ] **Step 2：重写 `app/page.js`**

```jsx
import { ArrowRight, Search, BarChart3, Lightbulb, FileText, TrendingUp, Users, AlertCircle } from "lucide-react";

const problems = [
  {
    q: "同行有询盘，为什么客户没有主动找你？",
    a: "多数情况不是产品问题。是客户在决定联系之前，已经在网站上找不到信任感，选择了别人。",
  },
  {
    q: "花了钱做网站，客户看了为什么不联系？",
    a: "网站是展示给老板看的，不是给客户用的。一个能带来咨询的网站，逻辑完全不一样。",
  },
  {
    q: "怎么判断问题出在哪里，钱花在哪里有效？",
    a: "不同企业问题不同。先诊断，再决定。盲目重做网站、盲目投广告，往往钱打水漂。",
  },
];

const steps = [
  {
    Icon: Search,
    num: "01",
    title: "发现问题",
    text: "检查客户入口、网站第一眼、信任感、联系路径，找出最影响询盘的环节。",
  },
  {
    Icon: BarChart3,
    num: "02",
    title: "分析损失",
    text: "量化每个问题可能造成的订单损失，让老板看清"改这里值多少钱"。",
  },
  {
    Icon: Lightbulb,
    num: "03",
    title: "找到机会",
    text: "从现有资源出发，找出成本最低、收益最快的改善机会，不是让你全部重来。",
  },
  {
    Icon: FileText,
    num: "04",
    title: "给出方案",
    text: "针对企业现状，给出优先级清单和可执行的优化方向。先做什么，再做什么，说清楚。",
  },
];

const scores = [
  { label: "获客入口", value: 58 },
  { label: "网站转化", value: 42 },
  { label: "信任感建立", value: 35 },
  { label: "AI可见度", value: 28 },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">企业订单增长诊断中心</p>
          <h1>
            <span>同行有询盘，</span>
            <span>为什么客户</span>
            <span>没有主动找你？</span>
          </h1>
          <p className="lead">
            不先卖建站，不先讲技术。先帮你看清问题出在哪，再决定怎么解决。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/diagnosis">
              立即免费诊断 <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="/cases">
              查看诊断样板
            </a>
          </div>
          <div className="hero-sub">
            不推销，不绑定。诊断完全免费，结果当场告诉你。
          </div>
        </div>

        {/* CSS 诊断面板 — 不用图片 */}
        <div className="hero-panel">
          <div className="panel-head">
            <span className="panel-badge">企业获客诊断报告</span>
            <strong className="panel-score">47<small>/100</small></strong>
          </div>
          <div className="panel-label">需要优先改善</div>
          <div className="panel-bars">
            {scores.map(({ label, value }) => (
              <div className="panel-bar" key={label}>
                <div className="panel-bar-top">
                  <span>{label}</span>
                  <b style={{ color: value < 50 ? "#d9a33a" : "#1a60a8" }}>{value}%</b>
                </div>
                <div className="panel-bar-track">
                  <div className="panel-bar-fill" style={{ width: `${value}%`, background: value < 50 ? "#d9a33a" : "#1a60a8" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="panel-advice">
            <AlertCircle size={16} />
            <span>网站转化和信任感是当前最大阻力</span>
          </div>
          <a className="panel-cta" href="/diagnosis">开始你的企业诊断 →</a>
        </div>
      </section>

      {/* ── 四步诊断流程 ── */}
      <section className="steps-section">
        <div className="page-inner">
          <div className="section-title center">
            <p className="eyebrow">诊断流程</p>
            <h2>四步看清你的订单机会</h2>
            <p className="lead" style={{ margin: "0 auto 0" }}>
              不猜，不假设。用结构化方法找出客户在哪一步流失，机会在哪里。
            </p>
          </div>
          <div className="steps-grid">
            {steps.map(({ Icon, num, title, text }) => (
              <article key={num} className="step-card">
                <div className="step-top">
                  <span className="step-num">{num}</span>
                  <Icon size={26} className="step-icon" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="steps-cta">
            <a className="button primary" href="/diagnosis">
              开始免费诊断 <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* ── 三个痛点 ── */}
      <section className="why-section">
        <div className="page-inner">
          <div className="section-title">
            <p className="eyebrow">为什么订单没有主动来</p>
            <h2>
              客户不是没有需求，<br />而是没有选择你。
            </h2>
            <p className="lead">
              今天的客户在联系你之前，会搜索、对比、看网站、判断可信度。如果你的信息不够清楚，客户很可能在联系前就走了。
            </p>
          </div>
          <div className="problem-grid">
            {problems.map(({ q, a }) => (
              <article key={q} className="problem-card">
                <h3>{q}</h3>
                <p>{a}</p>
              </article>
            ))}
          </div>
          <div className="why-cta">
            <a className="button primary" href="/diagnosis">
              做一次免费诊断 <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="/contact">
              直接咨询
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3：在 `globals.css` 新增 Hero 面板 + 四步流程样式**

```css
/* ── Hero CSS 诊断面板 ── */
.hero-sub {
  margin-top: 18px;
  font-size: 14px;
  color: var(--muted);
  font-weight: 800;
}

.hero-panel {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 28px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(24, 33, 47, 0.12);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.panel-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  border-radius: 8px;
  padding: 0 12px;
  background: rgba(6, 38, 90, 0.08);
  color: var(--ink);
  font-size: 13px;
  font-weight: 900;
}

.panel-score {
  font-size: 46px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}

.panel-score small {
  font-size: 18px;
  color: var(--muted);
  font-weight: 700;
}

.panel-label {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  border-radius: 6px;
  padding: 0 10px;
  margin-bottom: 20px;
  color: #8b6417;
  background: #fff3d6;
  font-size: 12px;
  font-weight: 900;
}

.panel-bars {
  display: grid;
  gap: 14px;
  margin-bottom: 18px;
}

.panel-bar-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 900;
}

.panel-bar-track {
  height: 8px;
  border-radius: 999px;
  background: var(--paper);
  overflow: hidden;
}

.panel-bar-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.4s ease;
}

.panel-advice {
  display: flex;
  gap: 8px;
  align-items: center;
  border: 1px solid rgba(217, 163, 58, 0.36);
  border-radius: 8px;
  padding: 12px 14px;
  background: #fff8ea;
  font-size: 13px;
  font-weight: 900;
  color: var(--accent-dark);
  margin-bottom: 16px;
}

.panel-advice svg {
  flex: 0 0 auto;
  color: var(--accent);
}

.panel-cta {
  display: block;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: var(--ink);
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  transition: background 160ms ease;
}

.panel-cta:hover {
  background: var(--brand);
}

/* ── 四步诊断流程 ── */
.steps-section {
  border-top: 1px solid var(--line);
  padding: 76px 0;
  background: var(--paper);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin: 40px 0 36px;
  counter-reset: steps;
}

.step-card {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 26px 22px;
  background: #fff;
  position: relative;
}

.step-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.step-num {
  font-size: 32px;
  font-weight: 900;
  color: var(--line);
  line-height: 1;
}

.step-icon {
  color: var(--brand);
}

.step-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: var(--ink);
}

.step-card p {
  color: var(--muted);
  line-height: 1.75;
  margin: 0;
  font-size: 15px;
}

.steps-cta {
  text-align: center;
}
```

在 `@media (max-width: 960px)` 中加：
```css
.steps-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
```

在 `@media (max-width: 560px)` 中加：
```css
.steps-grid { grid-template-columns: 1fr; }
.hero-panel { padding: 20px; }
```

- [ ] **Step 4：`npm run build`** — 确认无报错

- [ ] **Step 5：commit**
```
git add app/page.js app/globals.css
git commit -m "feat: 首页重写——强化痛点Hero，加四步诊断流程，Hero改CSS面板"
```

---

## Task 4：新建 About 页

**文件：** 新建 `app/about/page.js`、`app/globals.css`（新增 about 样式）

- [ ] **Step 1：创建目录和文件 `app/about/page.js`**

```jsx
import { Eye, BarChart2, Cpu, ArrowRight } from "lucide-react";

const values = [
  {
    Icon: Eye,
    title: "用镜子看见问题",
    text: "很多企业老板不是不努力，而是看不清问题出在哪。我们帮你照镜子——客观、直接、不绕弯子。",
  },
  {
    Icon: BarChart2,
    title: "用数据发现机会",
    text: "不靠感觉，不靠经验拍脑袋。用结构化的方法，找出最值得改善的那一步。",
  },
  {
    Icon: Cpu,
    title: "用AI帮企业找到增长方向",
    text: "AI改变了客户发现企业的方式。我们帮你把企业内容整理清楚，让AI和搜索引擎更容易理解你。",
  },
];

const beliefs = [
  "企业不是没有机会，很多时候只是客户没有真正看懂你。",
  "不是所有问题都需要花大钱解决。先找到最关键的那一步。",
  "先诊断，再决定。不猜，不推销，不绑定。",
  "帮一个企业增长，比做一百个普通网站更有价值。",
];

export default function AboutPage() {
  return (
    <div className="page-inner page-top-pad">
      <div className="about-hero">
        <p className="eyebrow">关于商镜Global</p>
        <h1 className="page-h1">
          帮企业看清：<br />客户为什么没有主动来。
        </h1>
        <p className="lead">
          商镜Global是一家专注企业获客诊断的服务机构。我们不是建站公司，也不是广告公司。我们只做一件事：帮企业老板找出客户流失的真正原因，再给出最小代价的改善方向。
        </p>
      </div>

      <div className="about-values">
        <h2 className="about-section-title">我们的三个方法</h2>
        <div className="about-values-grid">
          {values.map(({ Icon, title, text }) => (
            <article key={title} className="about-value-card">
              <div className="about-value-icon">
                <Icon size={28} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="about-beliefs">
        <h2 className="about-section-title">我们相信</h2>
        <div className="about-belief-list">
          {beliefs.map((item, i) => (
            <div key={i} className="about-belief-item">
              <span className="about-belief-num">{String(i + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-cta">
        <div className="about-cta-inner">
          <h2>有问题？先做一次免费诊断。</h2>
          <p>15分钟之内，你会知道企业获客的问题出在哪里。</p>
          <div className="about-cta-buttons">
            <a className="button primary" href="/diagnosis">
              立即免费诊断 <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="/contact">
              直接联系我们
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2：在 `globals.css` 新增 About 页样式**

```css
/* ── About 页 ── */
.about-hero {
  max-width: 780px;
  margin-bottom: 64px;
}

.about-section-title {
  font-size: 26px;
  font-weight: 900;
  color: var(--ink);
  margin-bottom: 28px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--line);
}

.about-values {
  margin-bottom: 64px;
}

.about-values-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.about-value-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 28px 24px;
  background: var(--paper);
}

.about-value-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  color: #fff;
  background: var(--ink);
  margin-bottom: 20px;
}

.about-value-card h3 {
  font-size: 19px;
  margin-bottom: 12px;
}

.about-value-card p {
  color: var(--muted);
  line-height: 1.78;
  margin: 0;
}

.about-beliefs {
  margin-bottom: 64px;
}

.about-belief-list {
  display: grid;
  gap: 16px;
}

.about-belief-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 22px 24px;
  background: #fff;
}

.about-belief-num {
  font-size: 28px;
  font-weight: 900;
  color: var(--line);
  line-height: 1;
  flex: 0 0 auto;
  margin-top: 2px;
}

.about-belief-item p {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.7;
  color: var(--ink);
  margin: 0;
}

.about-cta {
  margin-bottom: 40px;
}

.about-cta-inner {
  border: 1px solid rgba(217, 163, 58, 0.36);
  border-radius: 14px;
  padding: 48px 40px;
  background: linear-gradient(135deg, rgba(6,38,90,0.04) 0%, rgba(217,163,58,0.06) 100%);
  text-align: center;
}

.about-cta-inner h2 {
  margin-bottom: 12px;
}

.about-cta-inner p {
  color: var(--muted);
  margin-bottom: 28px;
}

.about-cta-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
```

在 `@media (max-width: 960px)` 加：
```css
.about-values-grid { grid-template-columns: 1fr; }
```

在 `@media (max-width: 560px)` 加：
```css
.about-cta-inner { padding: 32px 20px; }
.about-cta-buttons { flex-direction: column; }
.about-cta-buttons .button { width: 100%; }
```

- [ ] **Step 3：`npm run build`** — 确认无报错

- [ ] **Step 4：commit**
```
git add app/about/page.js app/globals.css
git commit -m "feat: 新建关于我们页面，三个方法+四个信念+CTA"
```

---

## 最终验收

- [ ] `npm run build` 全部通过，无报错无警告
- [ ] 所有页面无破损图片引用
- [ ] 导航5个链接全部跳转正确：免费诊断/服务/案例/关于我们/联系
- [ ] 首页 Hero 标题："同行有询盘，为什么客户没有主动找你？"
- [ ] 首页显示四步诊断流程模块
- [ ] About 页面存在且内容完整
- [ ] 移动端（375px）布局正常，无横向滚动
