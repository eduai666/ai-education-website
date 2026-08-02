export const LEARNING_STORAGE_KEY = "ai-education.learning-center";
export const LEARNING_STORAGE_EVENT = "ai-education:learning-center";

export type LearningRecentItem = {
  path: string;
  visitedAt: string;
};

export type LearningStateV1 = {
  version: 1;
  updatedAt: string;
  recent: LearningRecentItem[];
  completed: Record<string, string>;
  favorites: Record<string, string>;
};

const EMPTY_STATE: LearningStateV1 = {
  version: 1,
  updatedAt: "",
  recent: [],
  completed: {},
  favorites: {},
};

export function createEmptyLearningState(): LearningStateV1 {
  return {
    ...EMPTY_STATE,
    recent: [],
    completed: {},
    favorites: {},
  };
}

function parseDatedPaths(
  candidate: unknown,
  knownPaths: ReadonlySet<string>,
): Record<string, string> {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return {};

  return Object.fromEntries(
    Object.entries(candidate).filter(
      (entry): entry is [string, string] =>
        knownPaths.has(entry[0]) &&
        typeof entry[1] === "string" &&
        Number.isFinite(Date.parse(entry[1])),
    ),
  );
}

export function parseLearningState(
  rawValue: string | null,
  knownPaths: ReadonlySet<string>,
): LearningStateV1 {
  if (!rawValue) return createEmptyLearningState();

  try {
    const candidate = JSON.parse(rawValue) as Partial<LearningStateV1>;
    if (candidate.version !== 1 || !Array.isArray(candidate.recent)) {
      return createEmptyLearningState();
    }

    const seenPaths = new Set<string>();
    const recent = candidate.recent
      .filter(
        (item): item is LearningRecentItem => {
          const isValid =
            Boolean(item) &&
            typeof item.path === "string" &&
            typeof item.visitedAt === "string" &&
            Number.isFinite(Date.parse(item.visitedAt)) &&
            knownPaths.has(item.path) &&
            !seenPaths.has(item.path);

          if (isValid) seenPaths.add(item.path);
          return isValid;
        },
      )
      .slice(0, 20);

    return {
      version: 1,
      updatedAt:
        typeof candidate.updatedAt === "string" &&
        Number.isFinite(Date.parse(candidate.updatedAt))
          ? candidate.updatedAt
          : "",
      recent,
      completed: parseDatedPaths(candidate.completed, knownPaths),
      favorites: parseDatedPaths(candidate.favorites, knownPaths),
    };
  } catch {
    return createEmptyLearningState();
  }
}

export function readLearningState(knownPaths: ReadonlySet<string>) {
  try {
    return parseLearningState(window.localStorage.getItem(LEARNING_STORAGE_KEY), knownPaths);
  } catch {
    return createEmptyLearningState();
  }
}

export function writeLearningState(state: LearningStateV1) {
  try {
    window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(LEARNING_STORAGE_EVENT));
  } catch {
    // Learning history is optional; storage restrictions must not block a lesson.
  }
}

export function recordRecentLearning(path: string, knownPaths: ReadonlySet<string>) {
  if (!knownPaths.has(path)) return;

  const now = new Date().toISOString();
  const state = readLearningState(knownPaths);
  const recent = [
    { path, visitedAt: now },
    ...state.recent.filter((item) => item.path !== path),
  ].slice(0, 20);

  writeLearningState({
    ...state,
    updatedAt: now,
    recent,
  });
}

export function clearLearningState() {
  try {
    window.localStorage.removeItem(LEARNING_STORAGE_KEY);
    window.dispatchEvent(new Event(LEARNING_STORAGE_EVENT));
  } catch {
    // Keep the learning center usable when browser storage is unavailable.
  }
}
