"use client";

import { useMemo, useState } from "react";
import type { AiReferenceDecision, AiSuggestion } from "./types";
import styles from "./cell-architecture.module.css";

const decisionOptions: Array<{
  value: AiReferenceDecision;
  label: string;
}> = [
  { value: "accept", label: "采用" },
  { value: "modify", label: "修改" },
  { value: "reject", label: "拒绝" },
];

type AiDecisionLabProps = {
  fixtureId: string;
  summary: string;
  suggestions: AiSuggestion[];
};

export function AiDecisionLab({
  fixtureId,
  summary,
  suggestions,
}: AiDecisionLabProps) {
  const [decisions, setDecisions] = useState<
    Partial<Record<string, AiReferenceDecision>>
  >({});

  const completedCount = useMemo(
    () => suggestions.filter((suggestion) => decisions[suggestion.id]).length,
    [decisions, suggestions],
  );

  return (
    <div className={styles.aiLab} data-fixture-id={fixtureId}>
      <div className={styles.aiLabHeader}>
        <div>
          <span className={styles.fixtureLabel}>本地固定回答 · {fixtureId}</span>
          <p>{summary}</p>
        </div>
        <span className={styles.aiLabProgress} aria-live="polite">
          已判断 {completedCount}/{suggestions.length}
        </span>
      </div>

      <div className={styles.suggestionList}>
        {suggestions.map((suggestion) => {
          const selectedDecision = decisions[suggestion.id];
          const isSameAsReference =
            selectedDecision === suggestion.referenceDecision;

          return (
            <article
              className={styles.suggestionCard}
              key={suggestion.id}
              aria-labelledby={`${suggestion.id}-title`}
            >
              <span className={styles.suggestionId}>{suggestion.id}</span>
              <h3 id={`${suggestion.id}-title`}>{suggestion.text}</h3>

              <div
                className={styles.decisionButtons}
                role="group"
                aria-label={`判断 ${suggestion.id}`}
              >
                {decisionOptions.map((option) => (
                  <button
                    type="button"
                    className={
                      selectedDecision === option.value
                        ? styles.decisionButtonSelected
                        : styles.decisionButton
                    }
                    aria-pressed={selectedDecision === option.value}
                    onClick={() =>
                      setDecisions((current) => ({
                        ...current,
                        [suggestion.id]: option.value,
                      }))
                    }
                    key={option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <p className={styles.decisionFeedback} aria-live="polite">
                {selectedDecision
                  ? isSameAsReference
                    ? "你的判断与项目记录一致。继续查看理由。"
                    : "这是可以讨论的不同判断。请用范围、事实和体验说明理由。"
                  : "先作出自己的判断，再打开项目记录。"}
              </p>

              <details className={styles.referenceDecision}>
                <summary>查看项目的人工审核记录</summary>
                <p>
                  <strong>{suggestion.decisionLabel}：</strong>
                  {suggestion.reason}
                </p>
              </details>
            </article>
          );
        })}
      </div>
    </div>
  );
}
