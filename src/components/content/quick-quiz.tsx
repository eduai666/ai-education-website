"use client";

import { useMemo, useState } from "react";

const questions = [
  {
    question: "下面哪句话更准确地描述了人工智能系统？",
    options: [
      "只要能自动运行，就一定是人工智能",
      "它能根据输入和模型推断，生成预测、内容或建议等输出",
      "它像人一样真正拥有情绪和生活经验",
    ],
    answer: 1,
    explanation: "人工智能的重要特点是从输入中进行推断并产生输出；“自动运行”本身并不足以判断。",
  },
  {
    question: "为什么视频推荐系统可能把你不喜欢的内容推给你？",
    options: [
      "因为人工智能的判断并不保证正确",
      "因为它故意让每个人失望",
      "因为所有推荐结果都是随机的",
    ],
    answer: 0,
    explanation: "推荐是一种基于有限信息的预测。数据不完整、兴趣变化等都可能让预测出错。",
  },
  {
    question: "使用生成式人工智能完成学习任务时，哪种做法更合适？",
    options: [
      "直接提交它生成的答案，不再检查",
      "输入真实姓名、住址和账号密码，获得更个性化的答案",
      "核对信息、保护隐私，并对最终作品负责",
    ],
    answer: 2,
    explanation: "人工智能是辅助工具。使用者仍需查证结果、保护个人信息，并承担最终决定的责任。",
  },
];

export function QuickQuiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const completed = Object.keys(answers).length === questions.length;
  const score = useMemo(
    () => questions.filter((question, index) => answers[index] === question.answer).length,
    [answers],
  );

  return (
    <div className="quick-quiz">
      <div className="quiz-heading">
        <span>3 题自测</span>
        <h3>看看你是否抓住了关键概念</h3>
      </div>
      {questions.map((question, questionIndex) => {
        const selected = answers[questionIndex];
        const hasAnswer = selected !== undefined;
        const correct = selected === question.answer;

        return (
          <fieldset className="quiz-question" key={question.question}>
            <legend><span>{questionIndex + 1}</span>{question.question}</legend>
            <div className="quiz-options">
              {question.options.map((option, optionIndex) => (
                <button
                  className={selected === optionIndex ? "is-selected" : undefined}
                  type="button"
                  key={option}
                  aria-pressed={selected === optionIndex}
                  onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}
                >
                  <span aria-hidden="true">{String.fromCharCode(65 + optionIndex)}</span>
                  {option}
                </button>
              ))}
            </div>
            {hasAnswer ? (
              <p className={`quiz-feedback ${correct ? "is-correct" : "is-incorrect"}`} role="status">
                <strong>{correct ? "回答正确。" : "这个答案还可以再想想。"}</strong>{question.explanation}
              </p>
            ) : null}
          </fieldset>
        );
      })}
      {completed ? (
        <div className="quiz-result" aria-live="polite">
          <div><span>你的结果</span><strong>{score} / {questions.length}</strong></div>
          <p>{score === questions.length ? "非常棒，你已经掌握了本课的核心内容。" : "完成比满分更重要。根据解释回看相关章节，再试一次吧。"}</p>
          <button type="button" onClick={() => setAnswers({})}>重新作答</button>
        </div>
      ) : null}
    </div>
  );
}
