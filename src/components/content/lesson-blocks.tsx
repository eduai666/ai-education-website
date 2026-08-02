import type { ReactNode } from "react";

type LearningGoalsProps = {
  items: string[];
};

export function LearningGoals({ items }: LearningGoalsProps) {
  return (
    <div className="learning-goals">
      <div className="learning-goals-heading">
        <p>完成本课后，你将能够</p>
      </div>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

type Scene = {
  icon: string;
  title: string;
  description: string;
  tag: string;
};

export function SceneGrid({ scenes }: { scenes: Scene[] }) {
  return (
    <div className="scene-grid">
      {scenes.map((scene) => (
        <article className="scene-card" key={scene.title}>
          <span className="scene-icon" aria-hidden="true">{scene.icon}</span>
          <span className="scene-tag">{scene.tag}</span>
          <h3>{scene.title}</h3>
          <p>{scene.description}</p>
        </article>
      ))}
    </div>
  );
}

type CalloutProps = {
  children: ReactNode;
  label?: string;
  title: string;
  tone?: "info" | "caution" | "idea";
};

export function Callout({ children, label = "关键理解", title, tone = "info" }: CalloutProps) {
  return (
    <aside className={`lesson-callout lesson-callout-${tone}`}>
      <span className="callout-label">{label}</span>
      <h3>{title}</h3>
      <div>{children}</div>
    </aside>
  );
}

type ComparisonItem = {
  name: string;
  cue: string;
  method: string;
  example: string;
};

export function ComparisonCards({ items }: { items: ComparisonItem[] }) {
  return (
    <div className="comparison-grid">
      {items.map((item, index) => (
        <article key={item.name}>
          <span className="comparison-index">0{index + 1}</span>
          <h3>{item.name}</h3>
          <p className="comparison-cue">{item.cue}</p>
          <dl>
            <div><dt>主要方式</dt><dd>{item.method}</dd></div>
            <div><dt>生活例子</dt><dd>{item.example}</dd></div>
          </dl>
        </article>
      ))}
    </div>
  );
}

type ProcessStep = {
  label: string;
  title: string;
  description: string;
};

export function ProcessFlow({ steps }: { steps: ProcessStep[] }) {
  return (
    <ol className="process-flow">
      {steps.map((step, index) => (
        <li key={step.title}>
          <div className="process-marker">{index + 1}</div>
          <div>
            <span>{step.label}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ReflectionPrompt({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="reflection-prompt">
      <span aria-hidden="true">想一想</span>
      <div>
        <h3>{title}</h3>
        <div>{children}</div>
      </div>
    </div>
  );
}

type AnswerRevealProps = {
  children: ReactNode;
  label?: string;
};

export function AnswerReveal({
  children,
  label = "我已作答，查看参考答案",
}: AnswerRevealProps) {
  return (
    <details className="answer-reveal">
      <summary>{label}</summary>
      <div className="answer-reveal-content">{children}</div>
    </details>
  );
}

export function LessonSummary({ items }: { items: string[] }) {
  return (
    <div className="lesson-summary-card">
      <p className="summary-kicker">带走这 4 句话</p>
      <ol>
        {items.map((item, index) => (
          <li key={item}><span>{index + 1}</span><p>{item}</p></li>
        ))}
      </ol>
    </div>
  );
}
