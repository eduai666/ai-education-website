import {
  challengeUnitIds,
  challengeUnitLabels,
  type ChallengeQuestion,
  type ChallengeUnitId,
} from "./question-bank";

export type RandomSource = () => number;

export type AnswerRecord = {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
};

export type ChallengeGameState = {
  status: "intro" | "playing" | "finished";
  questions: readonly ChallengeQuestion[];
  currentIndex: number;
  answers: readonly AnswerRecord[];
};

export type ChallengeUnitResult = {
  unit: ChallengeUnitId;
  unitLabel: string;
  correct: number;
  total: number;
};

export type ChallengeResult = {
  correct: number;
  total: number;
  percentage: number;
  unitResults: readonly ChallengeUnitResult[];
  wrongAnswers: readonly {
    question: ChallengeQuestion;
    answer: AnswerRecord;
  }[];
};

function shuffled<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
      throw new RangeError("随机数生成器必须返回大于等于 0 且小于 1 的数值。");
    }

    const targetIndex = Math.floor(sample * (index + 1));
    [result[index], result[targetIndex]] = [result[targetIndex], result[index]];
  }

  return result;
}

export function selectBalancedQuestions(
  bank: readonly ChallengeQuestion[],
  questionsPerUnit = 3,
  random: RandomSource = Math.random,
): ChallengeQuestion[] {
  if (!Number.isInteger(questionsPerUnit) || questionsPerUnit < 1) {
    throw new RangeError("每单元抽题数必须是正整数。");
  }

  const selected = challengeUnitIds.flatMap((unit) => {
    const candidates = bank.filter((question) => question.unit === unit);
    if (candidates.length < questionsPerUnit) {
      throw new RangeError(
        `${challengeUnitLabels[unit]}的题目不足 ${questionsPerUnit} 道。`,
      );
    }

    return shuffled(candidates, random).slice(0, questionsPerUnit);
  });

  return shuffled(selected, random);
}

export function createIntroState(): ChallengeGameState {
  return {
    status: "intro",
    questions: [],
    currentIndex: 0,
    answers: [],
  };
}

export function startChallenge(
  questions: readonly ChallengeQuestion[],
): ChallengeGameState {
  if (questions.length === 0) {
    throw new RangeError("开始挑战前至少需要一道题。");
  }

  return {
    status: "playing",
    questions: [...questions],
    currentIndex: 0,
    answers: [],
  };
}

export function getAnswer(
  state: ChallengeGameState,
  questionId: string,
): AnswerRecord | undefined {
  return state.answers.find((answer) => answer.questionId === questionId);
}

export function answerCurrentQuestion(
  state: ChallengeGameState,
  selectedOptionIndex: number,
): ChallengeGameState {
  if (state.status !== "playing") return state;

  const question = state.questions[state.currentIndex];
  if (!question || getAnswer(state, question.id)) return state;

  if (
    !Number.isInteger(selectedOptionIndex) ||
    selectedOptionIndex < 0 ||
    selectedOptionIndex >= question.options.length
  ) {
    throw new RangeError("所选答案不在当前题目的选项范围内。");
  }

  return {
    ...state,
    answers: [
      ...state.answers,
      {
        questionId: question.id,
        selectedOptionIndex,
        isCorrect: selectedOptionIndex === question.correctOptionIndex,
      },
    ],
  };
}

export function moveToPreviousQuestion(
  state: ChallengeGameState,
): ChallengeGameState {
  if (state.status !== "playing" || state.currentIndex === 0) return state;

  return {
    ...state,
    currentIndex: state.currentIndex - 1,
  };
}

export function advanceChallenge(state: ChallengeGameState): ChallengeGameState {
  if (state.status !== "playing") return state;

  const question = state.questions[state.currentIndex];
  if (!question || !getAnswer(state, question.id)) return state;

  if (state.currentIndex === state.questions.length - 1) {
    return { ...state, status: "finished" };
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
  };
}

export function calculateChallengeResult(
  questions: readonly ChallengeQuestion[],
  answers: readonly AnswerRecord[],
): ChallengeResult {
  const answerByQuestionId = new Map(
    answers.map((answer) => [answer.questionId, answer]),
  );
  const correct = questions.reduce(
    (total, question) =>
      total + (answerByQuestionId.get(question.id)?.isCorrect ? 1 : 0),
    0,
  );
  const total = questions.length;

  return {
    correct,
    total,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
    unitResults: challengeUnitIds.map((unit) => {
      const unitQuestions = questions.filter((question) => question.unit === unit);
      const unitCorrect = unitQuestions.reduce(
        (count, question) =>
          count + (answerByQuestionId.get(question.id)?.isCorrect ? 1 : 0),
        0,
      );

      return {
        unit,
        unitLabel: challengeUnitLabels[unit],
        correct: unitCorrect,
        total: unitQuestions.length,
      };
    }),
    wrongAnswers: questions.flatMap((question) => {
      const answer = answerByQuestionId.get(question.id);
      return answer && !answer.isCorrect ? [{ question, answer }] : [];
    }),
  };
}
