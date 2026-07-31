export const CELL_STRUCTURE_IDS = [
  "cell-membrane",
  "nucleus",
  "mitochondrion",
] as const;

export type CellStructureId = (typeof CELL_STRUCTURE_IDS)[number];

export type CellSource = {
  id: string;
  title: string;
  organization: string;
  edition: string;
  section: string;
  url: string;
  accessedAt: string;
  license: string;
};

export type CellStructure = {
  id: CellStructureId;
  factId: string;
  name: string;
  englishName: string;
  summary: string;
  visualCue: string;
  observationQuestion: string;
  observationAnswer: string;
  sourceIds: string[];
  reviewStatus: "verified-against-source" | "teacher-approved";
  color: string;
};

export type CellSceneConfig = {
  seed: string;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
    near: number;
    far: number;
    minDistance: number;
    maxDistance: number;
  };
  modelRotation: [number, number, number];
  initialDpr: 1;
  fallbackDpr: 0.75;
  background: "transparent";
};

export type CellDemoContent = {
  schemaVersion: "cell-demo.schema.v1";
  demoVersion: "bio-cell-demo-v0.2";
  requirementsVersion: "requirements-v1";
  factsVersion: "facts-v1";
  contentReviewStatus: "pending-teacher-approval" | "teacher-approved";
  initialStructureId: CellStructureId;
  scene: CellSceneConfig;
  sources: CellSource[];
  structures: CellStructure[];
  modelLimitations: string[];
};

export type AiReferenceDecision = "accept" | "modify" | "reject";

export type AiSuggestion = {
  id: string;
  text: string;
  referenceDecision: AiReferenceDecision;
  decisionLabel: string;
  reason: string;
};

export type CellAiFixture = {
  schemaVersion: "cell-ai-fixture.schema.v1";
  fixtureId: "BIO-G3-PLAN-001";
  demoVersion: "bio-cell-demo-v0.2";
  requirementsVersion: "requirements-v1";
  factsVersion: "facts-v1";
  source: "synthetic-offline-fixture";
  reviewStatus: "implementation-example";
  encoding: "UTF-8";
  lineEndings: "LF";
  model: {
    provider: string;
    modelId: string;
    generatedAt: string;
    parameters: Record<string, unknown>;
  };
  messages: Array<{
    role: "system" | "user" | "assistant" | "tool";
    content: string;
  }>;
  parsed: {
    summary: string;
    suggestions: AiSuggestion[];
  };
};

export type CellSceneStats = {
  drawCalls: number;
  triangles: number;
};
