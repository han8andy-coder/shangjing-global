"use client";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [diagnosis, setDiagnosis] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shangjing_diagnosis");
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data.score === "number") {
          setDiagnosis(data);
        }
      }
    } catch {
      // invalid stored data, ignore
    }
  }, []);

  if (!diagnosis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-[#06265a] mb-4">暂无诊断结果</h1>
        <p className="text-gray-500 mb-8">请先完成免费诊断，再查看结果报告。</p>
        <a
          href="/diagnosis"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-[#1a60a8] text-white hover:bg-[#06265a] transition-colors"
        >
          立即免费诊断 →
        </a>
      </div>
    );
  }

  const { score, label } = diagnosis;
  const color =
    score >= 80 ? "#16a34a" :
    score >= 60 ? "#1a60a8" :
    score >= 40 ? "#ca8a04" : "#dc2626";

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">诊断报告</p>
          <h1 className="text-3xl font-black text-[#06265a] mb-6">您的企业增长诊断结果</h1>

          <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="text-6xl font-black" style={{ color }}>{score}</div>
              <div className="text-gray-400 text-sm mt-1">满分 100</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">{label ?? "诊断完成"}</div>
              <div className="text-gray-500 mt-1">根据您的回答生成</div>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="/contact"
              className="block w-full text-center bg-[#1a60a8] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#06265a] transition-colors"
            >
              获取专属增长方案 →
            </a>
            <a
              href="/diagnosis"
              className="block w-full text-center border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold hover:border-[#1a60a8] hover:text-[#1a60a8] transition-colors"
            >
              重新诊断
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
