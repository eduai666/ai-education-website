"use client";

import { useMemo, useState } from "react";

type Category = "人工智能" | "自动化" | "普通程序";

const categories: Category[] = ["人工智能", "自动化", "普通程序"];

const examples: Array<{
  id: string;
  icon: string;
  title: string;
  description: string;
  answer: Category;
  explanation: string;
}> = [
  {
    id: "voice",
    icon: "声",
    title: "语音助手听懂提问",
    description: "同一句话换一种说法，它通常仍能识别你的意思。",
    answer: "人工智能",
    explanation: "它需要从语音输入中识别模式并推断你可能表达的意思。",
  },
  {
    id: "calculator",
    icon: "算",
    title: "计算器计算 24 × 36",
    description: "输入相同的算式，总会按照确定规则得到相同答案。",
    answer: "普通程序",
    explanation: "计算过程由明确的数学规则决定，不需要从数据中识别模式。",
  },
  {
    id: "light",
    icon: "灯",
    title: "天黑后感应灯自动亮起",
    description: "传感器达到设定条件，灯就执行开启动作。",
    answer: "自动化",
    explanation: "这是“满足条件就行动”的自动控制，不一定使用人工智能。",
  },
  {
    id: "photo",
    icon: "图",
    title: "相册把同一个人分到一组",
    description: "照片角度和光线不同，系统仍尝试判断是否为同一张脸。",
    answer: "人工智能",
    explanation: "它会根据图像特征进行相似度判断，结果也可能出错。",
  },
  {
    id: "cooker",
    icon: "煮",
    title: "电饭煲按固定程序煮饭",
    description: "按下按钮后，它依照预设时间和温度完成步骤。",
    answer: "自动化",
    explanation: "它自动执行预先设定的流程，但没有因此就成为人工智能。",
  },
  {
    id: "video",
    icon: "荐",
    title: "视频平台推荐下一条内容",
    description: "推荐结果会根据观看、停留和反馈等信息发生变化。",
    answer: "人工智能",
    explanation: "系统从行为数据中寻找模式，预测你可能感兴趣的内容。",
  },
];

export function AiClassificationLab() {
  const [answers, setAnswers] = useState<Record<string, Category>>({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => examples.filter((example) => answers[example.id] === example.answer).length,
    [answers],
  );

  return (
    <div className="classification-lab">
      <div className="lab-heading">
        <div>
          <span className="lab-kicker">互动分类卡</span>
          <h3>它属于人工智能、自动化，还是普通程序？</h3>
          <p>先阅读场景，再选择你的判断。答错也没关系，解释比得分更重要。</p>
        </div>
        <div className="lab-progress" aria-label={`已完成 ${answeredCount} 个，共 ${examples.length} 个`}>
          <strong>{answeredCount}</strong><span> / {examples.length}</span>
        </div>
      </div>

      <div className="classification-list">
        {examples.map((example) => {
          const selection = answers[example.id];
          const isCorrect = selection === example.answer;

          return (
            <section className="classification-item" key={example.id}>
              <div className="classification-copy">
                <span className="classification-icon" aria-hidden="true">{example.icon}</span>
                <div>
                  <h4>{example.title}</h4>
                  <p>{example.description}</p>
                </div>
              </div>
              <div className="classification-actions" aria-label={`${example.title}的分类选项`}>
                {categories.map((category) => (
                  <button
                    className={selection === category ? "is-selected" : undefined}
                    type="button"
                    key={category}
                    aria-pressed={selection === category}
                    onClick={() => setAnswers((current) => ({ ...current, [example.id]: category }))}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {selection ? (
                <p className={`classification-feedback ${isCorrect ? "is-correct" : "is-incorrect"}`} role="status">
                  <strong>{isCorrect ? "判断正确。" : `再想一想，较合适的分类是“${example.answer}”。`}</strong>
                  {example.explanation}
                </p>
              ) : null}
            </section>
          );
        })}
      </div>

      {answeredCount === examples.length ? (
        <div className="lab-result" aria-live="polite">
          <div><span>本次完成</span><strong>{correctCount} / {examples.length}</strong></div>
          <p>{correctCount === examples.length ? "全部判断正确！现在试着向别人解释每个答案。" : "已经完成所有分类。看看解释，再挑战一次会更有收获。"}</p>
          <button type="button" onClick={() => setAnswers({})}>重新挑战</button>
        </div>
      ) : null}
    </div>
  );
}
