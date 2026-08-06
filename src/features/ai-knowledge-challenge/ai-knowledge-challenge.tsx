"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  advanceChallenge,
  answerCurrentQuestion,
  calculateChallengeResult,
  createIntroState,
  getAnswer,
  moveToPreviousQuestion,
  selectBalancedQuestions,
  startChallenge,
} from "./game-logic";
import {
  challengeQuestionBank,
  challengeUnitIds,
  challengeUnitLabels,
} from "./question-bank";
import styles from "./ai-knowledge-challenge.module.css";

const questionsPerUnit = 3;
const bestScoreStorageKey = "ai-knowledge-challenge-best-score-v1";
const bestScoreEventName = "ai-knowledge-challenge-best-score-change";
const optionLabels = ["A", "B", "C", "D"] as const;

function getBestScoreSnapshot(): number | null {
  let stored: string | null;

  try {
    stored = window.localStorage.getItem(bestScoreStorageKey);
  } catch {
    return null;
  }

  if (stored === null) return null;

  const score = Number(stored);
  return Number.isInteger(score) && score >= 0 && score <= 100 ? score : null;
}

function getBestScoreServerSnapshot(): null {
  return null;
}

function subscribeToBestScore(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === bestScoreStorageKey) callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(bestScoreEventName, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(bestScoreEventName, callback);
  };
}

function saveBestScore(score: number) {
  const previous = getBestScoreSnapshot();
  if (previous !== null && score <= previous) return;

  try {
    window.localStorage.setItem(bestScoreStorageKey, String(score));
    window.dispatchEvent(new Event(bestScoreEventName));
  } catch {
    // The game still works when private or restricted browsers block storage.
  }
}

function getAchievement(percentage: number) {
  if (percentage === 100) {
    return {
      label: "全能领航员",
      message: "四个单元全部通过，知识地图已经连成一片。",
    };
  }
  if (percentage >= 85) {
    return {
      label: "知识探索家",
      message: "基础非常扎实，回看少量错题就能向满分出发。",
    };
  }
  if (percentage >= 60) {
    return {
      label: "稳步进阶者",
      message: "主线已经掌握，跟着单元报告补齐薄弱环节吧。",
    };
  }
  return {
    label: "勇敢启程者",
    message: "每道错题都是路线提示，先复习解析，再来挑战一次。",
  };
}

export function AiKnowledgeChallenge() {
  const [game, setGame] = useState(createIntroState);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const bestScore = useSyncExternalStore(
    subscribeToBestScore,
    getBestScoreSnapshot,
    getBestScoreServerSnapshot,
  );

  const currentQuestion = game.questions[game.currentIndex];
  const currentAnswer = currentQuestion
    ? getAnswer(game, currentQuestion.id)
    : undefined;
  const liveResult = useMemo(
    () => calculateChallengeResult(game.questions, game.answers),
    [game.answers, game.questions],
  );

  useEffect(() => {
    if (game.status === "playing") questionHeadingRef.current?.focus();
  }, [game.currentIndex, game.status]);

  function beginNewChallenge() {
    const questions = selectBalancedQuestions(
      challengeQuestionBank,
      questionsPerUnit,
    );
    setGame(startChallenge(questions));
  }

  function chooseOption(optionIndex: number) {
    setGame((currentGame) =>
      answerCurrentQuestion(currentGame, optionIndex),
    );
  }

  function showNextQuestion() {
    const nextGame = advanceChallenge(game);
    if (nextGame.status === "finished") {
      const result = calculateChallengeResult(
        nextGame.questions,
        nextGame.answers,
      );
      saveBestScore(result.percentage);
    }
    setGame(nextGame);
  }

  if (game.status === "intro") {
    return (
      <article className={styles.challenge} id="challenge">
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>AI 知识探索站 · 实践项目</p>
            <h1>AI 知识闯关</h1>
            <p className={styles.heroLead}>
              四个单元，十二道随机关卡。不是比谁点得快，而是把每次选择变成一次真正的复习。
            </p>
            <div className={styles.heroActions}>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={beginNewChallenge}
              >
                开始本轮挑战
                <span aria-hidden="true">→</span>
              </button>
              <Link href="/courses/ai-basics/ai-around-us">
                先回第一单元复习
              </Link>
            </div>
          </div>

          <div className={styles.orbitGraphic} aria-hidden="true">
            <span className={styles.orbitCore}>AI</span>
            <span className={styles.orbitOne}>01</span>
            <span className={styles.orbitTwo}>02</span>
            <span className={styles.orbitThree}>03</span>
            <span className={styles.orbitFour}>04</span>
          </div>
        </header>

        <section className={styles.introGrid} aria-labelledby="how-to-play">
          <div className={styles.rulePanel}>
            <p className={styles.panelIndex}>闯关说明</p>
            <h2 id="how-to-play">先读规则，再出发</h2>
            <ol className={styles.rules}>
              <li>
                <span>01</span>
                <p>
                  每轮从四个单元<strong>各抽 3 题</strong>，共 12 题。
                </p>
              </li>
              <li>
                <span>02</span>
                <p>每题只能作答一次，选择后立即显示正误和课程解释。</p>
              </li>
              <li>
                <span>03</span>
                <p>当前题未作答不能前进；可以返回已答题查看解析。</p>
              </li>
              <li>
                <span>04</span>
                <p>结束后查看四单元表现和错题，再随机开启新一轮。</p>
              </li>
            </ol>
          </div>

          <aside className={styles.missionPanel}>
            <div>
              <span>本轮任务</span>
              <strong>{challengeUnitIds.length * questionsPerUnit}</strong>
              <small>道单选题</small>
            </div>
            <dl>
              <div>
                <dt>题库</dt>
                <dd>{challengeQuestionBank.length} 题</dd>
              </div>
              <div>
                <dt>计分</dt>
                <dd>每题 1 分</dd>
              </div>
              <div>
                <dt>最高纪录</dt>
                <dd>{bestScore === null ? "等待首战" : `${bestScore}%`}</dd>
              </div>
            </dl>
            <p>题目只在本地运行，不登录，也不会把作答发送到服务器。</p>
          </aside>
        </section>

        <section className={styles.unitMap} aria-labelledby="unit-map-title">
          <div className={styles.sectionHeading}>
            <p>知识地图</p>
            <h2 id="unit-map-title">四个单元，缺一不可</h2>
          </div>
          <ol>
            {challengeUnitIds.map((unit, index) => (
              <li key={unit}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{challengeUnitLabels[unit].split(" · ")[1]}</strong>
                <small>本轮 3 题</small>
              </li>
            ))}
          </ol>
        </section>
      </article>
    );
  }

  if (game.status === "finished") {
    const achievement = getAchievement(liveResult.percentage);
    const displayedBestScore = Math.max(bestScore ?? 0, liveResult.percentage);

    return (
      <article className={styles.challenge} id="challenge">
        <section className={styles.resultHero} aria-labelledby="result-title">
          <div className={styles.resultScore}>
            <span>{liveResult.percentage}</span>
            <small>分</small>
          </div>
          <div>
            <p className={styles.eyebrow}>本轮闯关完成</p>
            <h1 id="result-title">{achievement.label}</h1>
            <p>{achievement.message}</p>
            <div className={styles.resultActions}>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={beginNewChallenge}
              >
                重新随机挑战
                <span aria-hidden="true">↻</span>
              </button>
              <Link href="/courses/ai-basics/ai-around-us">回到课程起点</Link>
            </div>
          </div>
          <dl className={styles.resultSummary}>
            <div>
              <dt>答对</dt>
              <dd>
                {liveResult.correct} / {liveResult.total}
              </dd>
            </div>
            <div>
              <dt>本地最高</dt>
              <dd>{displayedBestScore}%</dd>
            </div>
          </dl>
        </section>

        <section className={styles.unitReport} aria-labelledby="unit-report-title">
          <div className={styles.sectionHeading}>
            <p>单元报告</p>
            <h2 id="unit-report-title">看看知识能量分布</h2>
          </div>
          <div className={styles.unitReportGrid}>
            {liveResult.unitResults.map((unitResult, index) => {
              const unitPercentage = unitResult.total
                ? Math.round((unitResult.correct / unitResult.total) * 100)
                : 0;

              return (
                <article key={unitResult.unit}>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{unitResult.correct}/{unitResult.total}</strong>
                  </div>
                  <h3>{unitResult.unitLabel.split(" · ")[1]}</h3>
                  <div className={styles.meter} aria-hidden="true">
                    <i style={{ width: `${unitPercentage}%` }} />
                  </div>
                  <p>{unitPercentage === 100 ? "本单元全部通过" : "回看错题，补齐线索"}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.reviewSection} aria-labelledby="review-title">
          <div className={styles.sectionHeading}>
            <p>错题回顾</p>
            <h2 id="review-title">
              {liveResult.wrongAnswers.length === 0
                ? "本轮没有错题"
                : `${liveResult.wrongAnswers.length} 道题值得再看一眼`}
            </h2>
          </div>

          {liveResult.wrongAnswers.length === 0 ? (
            <div className={styles.allCorrect}>
              <span aria-hidden="true">✓</span>
              <p>你已经把四个单元的关键线索全部连上了，可以重新挑战一组不同题目。</p>
            </div>
          ) : (
            <div className={styles.reviewList}>
              {liveResult.wrongAnswers.map(({ question, answer }, index) => (
                <article key={question.id}>
                  <div className={styles.reviewNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p>{question.unitLabel}</p>
                    <h3>{question.prompt}</h3>
                    <dl>
                      <div>
                        <dt>你的选择</dt>
                        <dd>{question.options[answer.selectedOptionIndex]}</dd>
                      </div>
                      <div>
                        <dt>正确答案</dt>
                        <dd>{question.options[question.correctOptionIndex]}</dd>
                      </div>
                    </dl>
                    <p className={styles.reviewExplanation}>
                      {question.explanation}
                    </p>
                    <Link href={question.source.href}>
                      回到《{question.source.title}》复习 →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </article>
    );
  }

  if (!currentQuestion) return null;

  return (
    <article className={styles.challenge} id="challenge">
      <header className={styles.gameHeader}>
        <div>
          <p className={styles.eyebrow}>AI 知识闯关 · 挑战进行中</p>
          <h1>把四个单元串起来</h1>
        </div>
        <dl>
          <div>
            <dt>当前得分</dt>
            <dd>{liveResult.correct}</dd>
          </div>
          <div>
            <dt>已作答</dt>
            <dd>{game.answers.length}/{game.questions.length}</dd>
          </div>
          <div>
            <dt>最高纪录</dt>
            <dd>{bestScore === null ? "—" : `${bestScore}%`}</dd>
          </div>
        </dl>
      </header>

      <section className={styles.gameBoard} aria-label="答题区域">
        <div className={styles.progressHeader}>
          <div>
            <span>
              第 {game.currentIndex + 1} / {game.questions.length} 题
            </span>
            <strong>{currentQuestion.unitLabel}</strong>
          </div>
          <progress
            max={game.questions.length}
            value={game.answers.length}
            aria-label={`已完成 ${game.answers.length} 道，共 ${game.questions.length} 道`}
          />
        </div>

        <div className={styles.questionPanel}>
          <p className={styles.questionKicker}>单选题 · 作答后锁定</p>
          <h2 ref={questionHeadingRef} tabIndex={-1}>
            {currentQuestion.prompt}
          </h2>

          <fieldset
            className={styles.options}
            aria-describedby={currentAnswer ? "answer-feedback" : undefined}
          >
            <legend>请选择一个答案</legend>
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected =
                currentAnswer?.selectedOptionIndex === optionIndex;
              const isCorrect =
                Boolean(currentAnswer) &&
                optionIndex === currentQuestion.correctOptionIndex;
              const isWrongSelection = Boolean(
                currentAnswer && isSelected && !currentAnswer.isCorrect,
              );
              const optionClassName = isCorrect
                ? styles.optionCorrect
                : isWrongSelection
                  ? styles.optionWrong
                  : isSelected
                    ? styles.optionSelected
                    : styles.option;

              return (
                <button
                  className={optionClassName}
                  key={option}
                  type="button"
                  disabled={Boolean(currentAnswer)}
                  onClick={() => chooseOption(optionIndex)}
                >
                  <span>{optionLabels[optionIndex]}</span>
                  <strong>{option}</strong>
                  {isCorrect ? <small>正确答案</small> : null}
                  {isWrongSelection ? <small>你的选择</small> : null}
                </button>
              );
            })}
          </fieldset>

          <div
            className={
              currentAnswer?.isCorrect
                ? styles.feedbackCorrect
                : currentAnswer
                  ? styles.feedbackWrong
                  : styles.feedbackPlaceholder
            }
            id="answer-feedback"
            role={currentAnswer ? "status" : undefined}
            aria-live="polite"
          >
            {currentAnswer ? (
              <>
                <span aria-hidden="true">
                  {currentAnswer.isCorrect ? "✓" : "!"}
                </span>
                <div>
                  <strong>
                    {currentAnswer.isCorrect
                      ? "回答正确，继续保持！"
                      : `回答错误，正确答案是 ${optionLabels[currentQuestion.correctOptionIndex]}。`}
                  </strong>
                  <p>{currentQuestion.explanation}</p>
                  <Link href={currentQuestion.source.href}>
                    来源：《{currentQuestion.source.title}》
                  </Link>
                </div>
              </>
            ) : (
              <p>选择后会在这里看到答案解释和课程来源。</p>
            )}
          </div>
        </div>

        <footer className={styles.gameFooter}>
          <button
            className={styles.secondaryButton}
            type="button"
            disabled={game.currentIndex === 0}
            onClick={() => setGame(moveToPreviousQuestion(game))}
          >
            ← 上一题
          </button>
          <p aria-live="polite">
            {currentAnswer ? "答案已锁定，可以继续" : "请先完成当前题"}
          </p>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={!currentAnswer}
            onClick={showNextQuestion}
          >
            {game.currentIndex === game.questions.length - 1
              ? "查看最终成绩"
              : "下一题"}
            <span aria-hidden="true">→</span>
          </button>
        </footer>
      </section>
    </article>
  );
}
