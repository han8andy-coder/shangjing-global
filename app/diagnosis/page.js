"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";

const whatsappUrl =
  "https://wa.me/13475768888?text=%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E5%B8%A6%E7%9D%80%E8%AF%8A%E6%96%AD%E7%BB%93%E6%9E%9C%E6%9D%A5%E5%92%A8%E8%AF%A2%EF%BC%8C%E6%83%B3%E4%BA%86%E8%A7%A3%E4%BC%81%E4%B8%9A%E8%8E%B7%E5%AE%A2%E4%BC%98%E5%8C%96%E3%80%82";

const fields = [
  {
    key: "source",
    label: "客户现在是从哪里找到你？",
    options: ["搜索引擎", "展会或平台", "老客户介绍", "广告投放", "没有稳定来源"],
  },
  {
    key: "site",
    label: "客户打开网站后，能在10秒内看懂你做什么吗？",
    options: ["能，非常清楚", "大概能看懂", "不够清楚", "没有网站", "不清楚效果"],
  },
  {
    key: "trust",
    label: "网站里是否有真实案例、服务流程或客户评价？",
    options: ["有，内容完整", "有一些", "很少", "几乎没有", "不确定"],
  },
  {
    key: "ai",
    label: "你的企业内容是否清楚，让AI和搜索引擎能理解？",
    options: ["内容完整清楚", "有些内容不完整", "内容比较简单", "不太清楚", "没考虑过"],
  },
  {
    key: "blocker",
    label: "客户从看到你到联系你，中间哪一步最容易流失？",
    options: ["找不到我", "看了不联系", "询盘质量低", "竞争太激烈", "不知道问题在哪"],
  },
];

const defaultAnswers = {
  source: "展会或平台",
  site: "大概能看懂",
  trust: "有一些",
  ai: "有些内容不完整",
  blocker: "看了不联系",
};

function getScore(answers) {
  let score = 80;
  if (answers.source === "没有稳定来源") score -= 14;
  else if (answers.source === "老客户介绍") score -= 6;
  else if (answers.source === "展会或平台") score -= 4;
  if (answers.site === "没有网站") score -= 16;
  else if (answers.site === "不够清楚") score -= 10;
  else if (answers.site === "大概能看懂") score -= 4;
  else if (answers.site === "不清楚效果") score -= 7;
  if (answers.trust === "几乎没有") score -= 16;
  else if (answers.trust === "很少") score -= 10;
  else if (answers.trust === "有一些") score -= 5;
  if (answers.ai === "没考虑过") score -= 9;
  else if (answers.ai === "不太清楚") score -= 7;
  else if (answers.ai === "内容比较简单") score -= 4;
  else if (answers.ai === "有些内容不完整") score -= 2;
  if (answers.blocker === "不知道问题在哪") score -= 7;
  else if (answers.blocker === "找不到我") score -= 6;
  else if (answers.blocker === "看了不联系") score -= 5;
  return Math.max(30, Math.min(90, score));
}

function getAdvice(score, answers) {
  if (score >= 72) {
    return {
      label: "可放大",
      title: "已有可放大的获客基础",
      stage: "放大有效入口",
      text: "已有一定获客基础，下一步重点是让价值表达更清楚，把证明材料和联系入口做得更强。",
      actions: ["主推一个产品线或服务方向", "强化第一屏价值判断", "整理案例、资质和服务流程"],
    };
  }
  if (score >= 56) {
    return {
      label: "待改善",
      title: "价值表达和证明材料需要加强",
      stage: "补强证明",
      text: "已有曝光，但产品价值、证明材料和咨询路径还不够强。应先改善内容展示顺序。",
      actions: ["重写产品或服务价值表达", "补齐信任证明（案例、流程、FAQ）", "把联系入口放到关键位置"],
    };
  }
  return {
    label: "优先处理",
    title: answers.site === "没有网站" ? "缺少可信的线上承接点" : "入口和联系路径需要补齐",
    stage: "先补入口和证明",
    text: "现在不建议盲目加广告。先补清楚入口、表达、证明和联系路径，再谈转化和放大。",
    actions: ["明确目标客户和主推产品", "建立或重做承接页", "用小预算测试一个入口"],
  };
}

function getBarValue(key, answers, score) {
  const map = {
    source: { "搜索引擎": 85, "展会或平台": 64, "老客户介绍": 60, "广告投放": 72, "没有稳定来源": 32 },
    site: { "能，非常清楚": 92, "大概能看懂": 68, "不够清楚": 46, "没有网站": 22, "不清楚效果": 40 },
    trust: { "有，内容完整": 90, "有一些": 62, "很少": 44, "几乎没有": 24, "不确定": 38 },
    ai: { "内容完整清楚": 88, "有些内容不完整": 60, "内容比较简单": 46, "不太清楚": 36, "没考虑过": 26 },
  };
  return map[key]?.[answers[key]] ?? Math.min(90, score + 5);
}

export default function DiagnosisPage() {
  const [answers, setAnswers] = useState(defaultAnswers);
  const score = useMemo(() => getScore(answers), [answers]);
  const advice = useMemo(() => getAdvice(score, answers), [score, answers]);
  const answeredCount = fields.filter((f) => answers[f.key]).length;

  const bars = [
    ["获客入口", getBarValue("source", answers, score)],
    ["网站转化", getBarValue("site", answers, score)],
    ["信任感建立", getBarValue("trust", answers, score)],
    ["AI搜索可见度", getBarValue("ai", answers, score)],
  ];

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
              <span>{answeredCount} / {fields.length} 已选择</span>
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
          <div className="score-summary">
            <div>
              <p>{advice.label}</p>
              <strong>{score}</strong>
              <span>/100</span>
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
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            带着结果咨询 <ArrowRight size={18} />
          </a>
        </aside>
      </div>
    </div>
  );
}
