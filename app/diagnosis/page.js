"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";


const fields = [
  {
    key: "source",
    label: "客户现在是从哪里找到你？",
    options: ["搜索引擎", "展会或平台", "老客户介绍", "广告投放", "没有稳定来源"],
    // 最好→最差: 搜索引擎20 / 广告投放16 / 展会或平台12 / 老客户介绍6 / 没有稳定来源0
    scores: { "搜索引擎": 20, "广告投放": 16, "展会或平台": 12, "老客户介绍": 6, "没有稳定来源": 0 },
  },
  {
    key: "site",
    label: "客户打开网站后，能在10秒内看懂你做什么吗？",
    options: ["能，非常清楚", "大概能看懂", "不够清楚", "没有网站", "不清楚效果"],
    scores: { "能，非常清楚": 20, "大概能看懂": 14, "不清楚效果": 8, "不够清楚": 4, "没有网站": 0 },
  },
  {
    key: "trust",
    label: "网站里是否有真实案例、服务流程或客户评价？",
    options: ["有，内容完整", "有一些", "很少", "几乎没有", "不确定"],
    scores: { "有，内容完整": 20, "有一些": 14, "不确定": 8, "很少": 4, "几乎没有": 0 },
  },
  {
    key: "ai",
    label: "你的企业内容是否清楚，让AI和搜索引擎能理解？",
    options: ["内容完整清楚", "有些内容不完整", "内容比较简单", "不太清楚", "没考虑过"],
    scores: { "内容完整清楚": 20, "有些内容不完整": 14, "内容比较简单": 8, "不太清楚": 4, "没考虑过": 0 },
  },
  {
    key: "blocker",
    label: "客户从看到你到联系你，中间哪一步最容易流失？",
    options: ["找不到我", "看了不联系", "询盘质量低", "竞争太激烈", "不知道问题在哪"],
    scores: { "竞争太激烈": 20, "询盘质量低": 14, "看了不联系": 8, "找不到我": 4, "不知道问题在哪": 0 },
  },
];

function getScore(answers) {
  let total = 0;
  for (const field of fields) {
    const val = answers[field.key];
    if (val && field.scores[val] !== undefined) {
      total += field.scores[val];
    }
  }
  return total; // 0–100
}

function getAdvice(score, answers) {
  if (score >= 80) {
    return {
      label: "优秀",
      title: "获客体系已相当完善",
      stage: "精细化放大",
      text: "你的获客体系已有坚实基础，下一步重点是持续放大有效入口，追求精细化转化提升。",
      actions: ["主推一个产品线或服务方向", "强化第一屏价值判断", "整理案例、资质和服务流程"],
    };
  }
  if (score >= 60) {
    return {
      label: "良好",
      title: "已有获客基础，可进一步放大",
      stage: "放大有效入口",
      text: "已有一定获客基础，下一步重点是让价值表达更清楚，把证明材料和联系入口做得更强。",
      actions: ["主推一个产品线或服务方向", "强化第一屏价值判断", "整理案例、资质和服务流程"],
    };
  }
  if (score >= 40) {
    return {
      label: "待改善",
      title: "价值表达和证明材料需要加强",
      stage: "补强证明",
      text: "已有曝光，但产品价值、证明材料和咨询路径还不够强。应先改善内容展示顺序。",
      actions: ["重写产品或服务价值表达", "补齐信任证明（案例、流程、FAQ）", "把联系入口放到关键位置"],
    };
  }
  return {
    label: "需优先处理",
    title: answers.site === "没有网站" ? "缺少可信的线上承接点" : "入口和联系路径需要补齐",
    stage: "先补入口和证明",
    text: "现在不建议盲目加广告。先补清楚入口、表达、证明和联系路径，再谈转化和放大。",
    actions: ["明确目标客户和主推产品", "建立或重做承接页", "用小预算测试一个入口"],
  };
}

function getBarValue(key, answers) {
  const field = fields.find((f) => f.key === key);
  if (!field) return 0;
  const val = answers[key];
  if (!val || field.scores[val] === undefined) return 0;
  // 转换为百分比显示 (每题满分20)
  return Math.round((field.scores[val] / 20) * 100);
}

export default function DiagnosisPage() {
  const [answers, setAnswers] = useState({
    source: "",
    site: "",
    trust: "",
    ai: "",
    blocker: "",
  });

  const answeredCount = fields.filter((f) => answers[f.key] !== "").length;
  const allAnswered = answeredCount === fields.length;

  const score = useMemo(() => (allAnswered ? getScore(answers) : 0), [answers, allAnswered]);
  const advice = useMemo(() => (allAnswered ? getAdvice(score, answers) : null), [score, answers, allAnswered]);

  const bars = [
    ["获客入口", getBarValue("source", answers)],
    ["网站转化", getBarValue("site", answers)],
    ["信任感建立", getBarValue("trust", answers)],
    ["AI搜索可见度", getBarValue("ai", answers)],
    ["客户流失环节", getBarValue("blocker", answers)],
  ];

  // 组件挂载时清除旧结果，防止残留
  useEffect(() => {
    try { localStorage.removeItem("shangjing_diagnosis"); } catch (_) {}
  }, []); // 空依赖数组，只在挂载时运行一次

  // 诊断完成后存入 localStorage 供咨询页读取
  useEffect(() => {
    if (allAnswered && advice) {
      try {
        localStorage.setItem(
          "shangjing_diagnosis",
          JSON.stringify({
            score,
            label: advice.label,
            title: advice.title,
            answers,
          }),
        );
        fetch("/api/user/me")
          .then((r) => r.json())
          .then(({ user }) => {
            if (!user) return;
            return fetch("/api/user/diagnoses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ score, label: advice.label, title: advice.title, answers }),
            });
          })
          .catch(() => {});
      } catch (_) {}
    }
  }, [allAnswered, score, advice]);

  return (
    <div className="page-inner page-top-pad">
      <div className="page-hero-text">
        <p className="eyebrow">90秒快速诊断</p>
        <h1 className="page-h1">企业订单增长免费诊断</h1>
        <p className="lead">
          不用先谈建站，也不用先谈广告。先看看你的企业为什么没有获得更多客户咨询。
        </p>
      </div>

      <div className="diagnosis-workspace">
        <div className="question-column">
          <div className="workspace-head">
            <ClipboardCheck size={24} />
            <div>
              <strong>基础诊断问题</strong>
              <span>已完成 {answeredCount} / {fields.length}</span>
            </div>
          </div>
          {fields.map((field, index) => (
            <fieldset key={field.key}>
              <legend>{index + 1}. {field.label}</legend>
              <div className="options">
                {field.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={answers[field.key] === option ? "selected" : ""}
                    onClick={() =>
                      setAnswers((cur) => ({ ...cur, [field.key]: option }))
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <aside className="result-column">
          {!allAnswered ? (
            <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--muted)" }}>
              <ClipboardCheck size={40} style={{ margin: "0 auto 16px", display: "block", color: "var(--line)" }} />
              <p style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>
                请回答全部 {fields.length} 道问题
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
                已完成 <strong style={{ color: "var(--brand)" }}>{answeredCount}</strong> / {fields.length}，
                完成后自动显示诊断结果。
              </p>
            </div>
          ) : (
            <>
              <div className="score-summary">
                <div>
                  <p>{advice.label}</p>
                  <strong>{score}</strong>
                  <span> / 100</span>
                </div>
                <div className="meter" style={{ "--score": `${score}%` }}>
                  <span>{score}</span>
                </div>
              </div>

              <div className="bar-list">
                {bars.map(([label, value]) => (
                  <div className="bar" key={label}>
                    <div>
                      <span>{label}</span>
                      <b>{value}%</b>
                    </div>
                    <i>
                      <em style={{ width: `${value}%` }} />
                    </i>
                  </div>
                ))}
              </div>

              <div className="advice-box">
                <span>{advice.stage}</span>
                <h3>{advice.title}</h3>
                <p>{advice.text}</p>
                <ul>
                  {advice.actions.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={17} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                className="button primary wide"
                href={`https://wa.me/13475768888?text=${encodeURIComponent(
                  `你好，我完成了获客诊断，得分 ${score}/100（${advice.label}：${advice.title}），想进一步咨询。`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                带着结果咨询 <ArrowRight size={18} />
              </a>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
