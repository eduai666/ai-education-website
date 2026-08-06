import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const featureDirectory = resolve(
  repositoryRoot,
  "src/features/ai-knowledge-challenge",
);

let compiledDirectory;
let gameLogic;
let questionBankModule;

async function transpileFeatureModule(fileName) {
  const source = await readFile(resolve(featureDirectory, fileName), "utf8");
  const output = ts.transpileModule(source, {
    fileName,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      strict: true,
    },
  });

  await writeFile(
    resolve(compiledDirectory, fileName.replace(/\.ts$/u, ".js")),
    output.outputText,
    "utf8",
  );
}

test.before(async () => {
  compiledDirectory = await mkdtemp(join(tmpdir(), "ai-challenge-tests-"));
  await transpileFeatureModule("question-bank.ts");
  await transpileFeatureModule("game-logic.ts");

  const require = createRequire(import.meta.url);
  questionBankModule = require(resolve(compiledDirectory, "question-bank.js"));
  gameLogic = require(resolve(compiledDirectory, "game-logic.js"));
});

test.after(async () => {
  await rm(compiledDirectory, { recursive: true, force: true });
});

test("题库覆盖四个单元且每道题的答案与来源合法", () => {
  const {
    challengeQuestionBank,
    challengeUnitIds,
    challengeUnitLabels,
  } = questionBankModule;

  assert.equal(challengeQuestionBank.length, 20);
  assert.equal(new Set(challengeQuestionBank.map((question) => question.id)).size, 20);

  for (const unit of challengeUnitIds) {
    const unitQuestions = challengeQuestionBank.filter(
      (question) => question.unit === unit,
    );
    assert.equal(unitQuestions.length, 5, `${challengeUnitLabels[unit]}应有 5 道题`);
  }

  for (const question of challengeQuestionBank) {
    assert.equal(question.options.length, 4, `${question.id}应有 4 个选项`);
    assert.ok(Number.isInteger(question.correctOptionIndex));
    assert.ok(question.correctOptionIndex >= 0);
    assert.ok(question.correctOptionIndex < question.options.length);
    assert.equal(new Set(question.options).size, 4, `${question.id}的选项不能重复`);
    assert.ok(question.prompt.endsWith("？"));
    assert.ok(question.explanation.length >= 20);
    assert.match(question.source.href, /^\/courses\//u);
    assert.ok(question.source.title.length > 0);
  }
});

test("均衡抽题每轮从四个单元各取 3 题且不重复", () => {
  const { challengeQuestionBank, challengeUnitIds } = questionBankModule;
  const { selectBalancedQuestions } = gameLogic;
  const selected = selectBalancedQuestions(challengeQuestionBank, 3, () => 0.37);

  assert.equal(selected.length, 12);
  assert.equal(new Set(selected.map((question) => question.id)).size, 12);
  for (const unit of challengeUnitIds) {
    assert.equal(
      selected.filter((question) => question.unit === unit).length,
      3,
    );
  }
});

test("抽题逻辑拒绝无效数量、缺题题库与越界随机数", () => {
  const { challengeQuestionBank } = questionBankModule;
  const { selectBalancedQuestions } = gameLogic;

  assert.throws(
    () => selectBalancedQuestions(challengeQuestionBank, 0),
    /正整数/u,
  );
  assert.throws(
    () => selectBalancedQuestions(challengeQuestionBank.slice(0, 3), 3),
    /题目不足/u,
  );
  assert.throws(
    () => selectBalancedQuestions(challengeQuestionBank, 3, () => 1),
    /随机数生成器/u,
  );
});

test("当前题未答不能前进，每题只能计分一次，已答题可以返回复看", () => {
  const { challengeQuestionBank } = questionBankModule;
  const {
    advanceChallenge,
    answerCurrentQuestion,
    getAnswer,
    moveToPreviousQuestion,
    selectBalancedQuestions,
    startChallenge,
  } = gameLogic;
  const questions = selectBalancedQuestions(challengeQuestionBank, 3, () => 0.21);
  const initial = startChallenge(questions);

  assert.equal(advanceChallenge(initial), initial, "未答题时不应前进");

  const answered = answerCurrentQuestion(
    initial,
    questions[0].correctOptionIndex,
  );
  assert.equal(answered.answers.length, 1);
  assert.equal(getAnswer(answered, questions[0].id).isCorrect, true);
  assert.equal(
    answerCurrentQuestion(answered, (questions[0].correctOptionIndex + 1) % 4),
    answered,
    "同一题第二次作答不应改变状态",
  );

  const onSecondQuestion = advanceChallenge(answered);
  assert.equal(onSecondQuestion.currentIndex, 1);
  assert.equal(advanceChallenge(onSecondQuestion), onSecondQuestion);

  const backOnFirst = moveToPreviousQuestion(onSecondQuestion);
  assert.equal(backOnFirst.currentIndex, 0);
  assert.equal(advanceChallenge(backOnFirst).currentIndex, 1);
});

test("计分、四单元表现与错题回顾保持一致", () => {
  const { challengeQuestionBank } = questionBankModule;
  const {
    advanceChallenge,
    answerCurrentQuestion,
    calculateChallengeResult,
    selectBalancedQuestions,
    startChallenge,
  } = gameLogic;
  const questions = selectBalancedQuestions(challengeQuestionBank, 3, () => 0.63);
  const deliberatelyWrongUnits = new Set();
  let state = startChallenge(questions);

  for (const question of questions) {
    const shouldBeWrong = !deliberatelyWrongUnits.has(question.unit);
    if (shouldBeWrong) deliberatelyWrongUnits.add(question.unit);

    const selectedOptionIndex = shouldBeWrong
      ? (question.correctOptionIndex + 1) % question.options.length
      : question.correctOptionIndex;
    state = answerCurrentQuestion(state, selectedOptionIndex);
    state = advanceChallenge(state);
  }

  assert.equal(state.status, "finished");
  const result = calculateChallengeResult(state.questions, state.answers);
  assert.equal(result.correct, 8);
  assert.equal(result.total, 12);
  assert.equal(result.percentage, 67);
  assert.equal(result.wrongAnswers.length, 4);
  assert.deepEqual(
    result.unitResults.map(({ correct, total }) => [correct, total]),
    [
      [2, 3],
      [2, 3],
      [2, 3],
      [2, 3],
    ],
  );

  for (const { question, answer } of result.wrongAnswers) {
    assert.equal(answer.questionId, question.id);
    assert.notEqual(answer.selectedOptionIndex, question.correctOptionIndex);
  }
});
