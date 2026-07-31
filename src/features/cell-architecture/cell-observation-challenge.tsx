"use client";

import { useMemo, useState } from "react";
import type { CellStructure, CellStructureId } from "./types";
import styles from "./cell-architecture.module.css";

type AnswerMap = Partial<Record<CellStructureId, CellStructureId>>;

type CellObservationChallengeProps = {
  structures: CellStructure[];
};

const choiceOrder: Record<CellStructureId, CellStructureId[]> = {
  "cell-membrane": ["nucleus", "cell-membrane", "mitochondrion"],
  nucleus: ["cell-membrane", "mitochondrion", "nucleus"],
  mitochondrion: ["mitochondrion", "nucleus", "cell-membrane"],
};

export function CellObservationChallenge({
  structures,
}: CellObservationChallengeProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [checkedAnswers, setCheckedAnswers] = useState<AnswerMap | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const structureById = useMemo(
    () => new Map(structures.map((structure) => [structure.id, structure])),
    [structures],
  );
  const answeredCount = structures.filter((structure) => answers[structure.id]).length;
  const checkedScore = checkedAnswers
    ? structures.filter(
        (structure) => checkedAnswers[structure.id] === structure.id,
      ).length
    : 0;
  const isComplete = checkedScore === structures.length;

  const selectAnswer = (
    questionId: CellStructureId,
    answerId: CellStructureId,
  ) => {
    setAnswers((current) => ({ ...current, [questionId]: answerId }));
    setCheckedAnswers(null);
  };

  const checkAnswers = () => {
    if (answeredCount !== structures.length) return;

    setCheckedAnswers({ ...answers });
    setAttemptCount((current) => current + 1);
  };

  const resetChallenge = () => {
    setAnswers({});
    setCheckedAnswers(null);
    setAttemptCount(0);
  };

  return (
    <div
      className={styles.observationChallenge}
      data-testid="cell-observation-challenge"
      data-score={checkedAnswers ? `${checkedScore}/${structures.length}` : "pending"}
    >
      <div className={styles.challengeHeader}>
        <div>
          <span className={styles.challengeKicker}>OBS-001 · 结构与功能</span>
          <h3>不翻答案，先完成三次判断</h3>
          <p>
            每道题选择一个结构。提交后会标出证据；答错可以回到上面的图和事实卡，再订正到 3/3。
          </p>
        </div>
        <span className={styles.challengeProgress} aria-live="polite">
          {checkedAnswers
            ? `答对 ${checkedScore}/${structures.length}`
            : `已作答 ${answeredCount}/${structures.length}`}
        </span>
      </div>

      <form
        className={styles.challengeForm}
        onSubmit={(event) => {
          event.preventDefault();
          checkAnswers();
        }}
      >
        {structures.map((question, index) => {
          const selectedId = answers[question.id];
          const checkedId = checkedAnswers?.[question.id];
          const wasChecked = checkedId !== undefined;
          const isCorrect = checkedId === question.id;
          const selectedStructure = checkedId
            ? structureById.get(checkedId)
            : undefined;
          const options = choiceOrder[question.id]
            .map((id) => structureById.get(id))
            .filter((structure): structure is CellStructure => Boolean(structure));

          return (
            <fieldset
              className={styles.challengeQuestion}
              data-question-id={question.id}
              key={question.id}
            >
              <legend>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {question.observationQuestion}
              </legend>

              <div className={styles.challengeOptions}>
                {options.map((option) => {
                  const isSelected = selectedId === option.id;
                  const optionIsCorrect = wasChecked && option.id === question.id;
                  const optionIsWrong =
                    wasChecked && checkedId === option.id && option.id !== question.id;
                  const optionClassName = optionIsCorrect
                    ? styles.challengeOptionCorrect
                    : optionIsWrong
                      ? styles.challengeOptionWrong
                      : isSelected
                        ? styles.challengeOptionSelected
                        : styles.challengeOption;

                  return (
                    <label className={optionClassName} key={option.id}>
                      <input
                        type="radio"
                        name={`observation-${question.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={() => selectAnswer(question.id, option.id)}
                      />
                      <span>
                        <strong>{option.name}</strong>
                        <small>{option.englishName}</small>
                      </span>
                      {optionIsCorrect ? (
                        <span className={styles.optionResult}>正确答案</span>
                      ) : optionIsWrong ? (
                        <span className={styles.optionResult}>这次所选</span>
                      ) : null}
                    </label>
                  );
                })}
              </div>

              {wasChecked ? (
                <p
                  className={isCorrect ? styles.challengeFeedbackCorrect : styles.challengeFeedbackWrong}
                  role="status"
                >
                  {isCorrect
                    ? `判断正确。${question.summary}`
                    : `这次选择了“${selectedStructure?.name ?? "未知结构"}”。正确答案是“${question.name}”；请根据功能线索再核对一次。`}
                </p>
              ) : null}
            </fieldset>
          );
        })}

        <div className={styles.challengeFooter}>
          <div className={styles.challengeResult} aria-live="polite">
            {checkedAnswers ? (
              isComplete ? (
                <>
                  <strong>挑战完成：3/3</strong>
                  <span>你已经把三个结构和它们的主要功能对应起来了。</span>
                </>
              ) : (
                <>
                  <strong>第 {attemptCount} 次检查：{checkedScore}/3</strong>
                  <span>修改标出的错题后，再次点击“检查答案”。</span>
                </>
              )
            ) : (
              <>
                <strong>目标：订正到 3/3</strong>
                <span>答案只保留在当前页面，不记录姓名，也不会上传。</span>
              </>
            )}
          </div>

          {isComplete ? (
            <button
              type="button"
              className={styles.challengeResetButton}
              onClick={resetChallenge}
            >
              重新挑战
            </button>
          ) : (
            <button
              type="submit"
              className={styles.challengeCheckButton}
              disabled={answeredCount !== structures.length}
            >
              {checkedAnswers ? "再次检查" : "检查答案"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
