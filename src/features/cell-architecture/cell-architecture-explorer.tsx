"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { CellDiagram } from "./cell-diagram";
import {
  CELL_MODEL_BY_ID,
  CELL_MODEL_CATALOG,
  type CellModelId,
} from "./cell-model-catalog";
import type {
  CellSceneConfig,
  CellSceneStats,
  CellStructure,
  CellStructureId,
} from "./types";
import type { CellSceneController } from "./cell-three-runtime";
import styles from "./cell-architecture.module.css";

type ExplorerView = "2d" | "loading" | "3d" | "error";
type ExplorerError =
  | "webgl2-unavailable"
  | "context-lost"
  | "scene-load-timeout"
  | "model-load-failed"
  | "scene-mount-failed";

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
    addEventListener?: (type: "change", listener: () => void) => void;
    removeEventListener?: (type: "change", listener: () => void) => void;
  };
};

type CellArchitectureExplorerProps = {
  structures: CellStructure[];
  scene: CellSceneConfig;
  initialStructureId: CellStructureId;
  localReferenceModelsEnabled: boolean;
};

const errorMessages: Record<ExplorerError, string> = {
  "webgl2-unavailable":
    "这台设备不能建立 WebGL2 场景，已保留固定正视图与完整学习内容。",
  "context-lost": "3D 图形上下文已经中断，已安全返回固定正视图。你可以稍后重新尝试。",
  "scene-load-timeout": "3D 组件加载超时，已安全返回固定正视图。请检查网络后再试。",
  "model-load-failed":
    "精细 3D 模型没有成功加载，已安全返回固定正视图。你可以稍后重新尝试。",
  "scene-mount-failed": "3D 场景没有成功启动，已保留固定正视图与完整学习内容。",
};

const sceneLoadTimeoutMs = 12_000;
const courseModelId: CellModelId = "animal-cell";

function subscribeToSaveData(callback: () => void) {
  const connection = (navigator as NavigatorWithConnection).connection;
  connection?.addEventListener?.("change", callback);
  return () => connection?.removeEventListener?.("change", callback);
}

function getSaveDataSnapshot() {
  return Boolean((navigator as NavigatorWithConnection).connection?.saveData);
}

function subscribeToReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeToClientReady() {
  return () => {};
}

function getClientReadySnapshot() {
  return true;
}

function getServerClientReadySnapshot() {
  return false;
}

function getMountError(error: unknown): ExplorerError {
  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;
    if (
      code === "webgl2-unavailable" ||
      code === "model-load-failed" ||
      code === "scene-mount-failed"
    ) {
      return code;
    }
  }

  return "scene-mount-failed";
}

export function CellArchitectureExplorer({
  structures,
  scene,
  initialStructureId,
  localReferenceModelsEnabled,
}: CellArchitectureExplorerProps) {
  const [activeModelId, setActiveModelId] =
    useState<CellModelId>(courseModelId);
  const [failedModelId, setFailedModelId] = useState<CellModelId | null>(null);
  const [selectedId, setSelectedId] = useState<CellStructureId | null>(
    initialStructureId,
  );
  const [view, setView] = useState<ExplorerView>("2d");
  const [attempt, setAttempt] = useState(0);
  const [errorReason, setErrorReason] = useState<ExplorerError | null>(null);
  const [stats, setStats] = useState<CellSceneStats | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<CellSceneController | null>(null);
  const selectedIdRef = useRef<CellStructureId | null>(selectedId);

  const saveDataEnabled = useSyncExternalStore(
    subscribeToSaveData,
    getSaveDataSnapshot,
    () => false,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const clientReady = useSyncExternalStore(
    subscribeToClientReady,
    getClientReadySnapshot,
    getServerClientReadySnapshot,
  );

  const activeModel = CELL_MODEL_BY_ID[activeModelId];
  const failedModel = failedModelId ? CELL_MODEL_BY_ID[failedModelId] : null;
  const isCourseModel = activeModel.interaction === "course-structures";
  const isUsingLocalReferenceCandidate =
    localReferenceModelsEnabled &&
    activeModel.source.kind === "procedural" &&
    Boolean(activeModel.source.localReference);
  const isUsingLocalReferencePreview =
    localReferenceModelsEnabled && activeModelId === "plant-cell";
  const sceneBadge =
    stats?.source === "glb" && isUsingLocalReferenceCandidate
      ? "本地参考 GLB · 仅本机测试，未用于发布"
      : activeModel.sceneBadge;
  const selectedStructure = useMemo(
    () => structures.find((structure) => structure.id === selectedId) ?? null,
    [selectedId, structures],
  );

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (attempt === 0) return;

    const mountedModelId = activeModelId;
    let active = true;
    let ownedController: CellSceneController | null = null;
    const sceneAbortController = new AbortController();
    const canvas = canvasRef.current;

    if (!canvas) return;

    const sceneLoadTimer = window.setTimeout(() => {
      if (!active) return;

      active = false;
      sceneAbortController.abort();
      setFailedModelId(mountedModelId);
      setErrorReason("scene-load-timeout");
      setStats(null);
      setView("error");
      setAttempt(0);
    }, sceneLoadTimeoutMs);

    const startScene = async () => {
      try {
        const runtime = await import("./cell-three-runtime");
        if (!active) return;

        ownedController = await runtime.mountCellScene(
          canvas,
          scene,
          mountedModelId,
          {
            onSelect: (id) => {
              if (active && mountedModelId === courseModelId) {
                setSelectedId(id);
              }
            },
            onContextLost: () => {
              if (!active) return;
              active = false;
              sceneAbortController.abort();
              window.clearTimeout(sceneLoadTimer);
              setFailedModelId(mountedModelId);
              setErrorReason("context-lost");
              setView("error");
              setStats(null);
              setAttempt(0);
            },
          },
          sceneAbortController.signal,
          localReferenceModelsEnabled,
        );
        window.clearTimeout(sceneLoadTimer);

        if (!active) {
          ownedController.dispose();
          return;
        }

        controllerRef.current = ownedController;
        if (mountedModelId === courseModelId) {
          ownedController.select(selectedIdRef.current);
        }
        setStats(ownedController.getStats());
        setFailedModelId(null);
        setView("3d");
      } catch (error) {
        if (!active) return;
        window.clearTimeout(sceneLoadTimer);
        setFailedModelId(mountedModelId);
        setErrorReason(getMountError(error));
        setStats(null);
        setView("error");
        setAttempt(0);
      }
    };

    void startScene();

    return () => {
      active = false;
      sceneAbortController.abort();
      window.clearTimeout(sceneLoadTimer);
      if (controllerRef.current === ownedController) {
        controllerRef.current = null;
      }
      ownedController?.dispose();
    };
  }, [activeModelId, attempt, localReferenceModelsEnabled, scene]);

  useEffect(() => {
    if (!isCourseModel) return;

    const controller = controllerRef.current;
    if (!controller) return;

    controller.select(selectedId);
    setStats(controller.getStats());
  }, [isCourseModel, selectedId]);

  const start3d = (modelId: CellModelId = failedModelId ?? activeModelId) => {
    setActiveModelId(modelId);
    setFailedModelId(null);
    setErrorReason(null);
    setStats(null);
    setView("loading");
    setAttempt((currentAttempt) => currentAttempt + 1);
  };

  const selectModel = (modelId: CellModelId) => {
    if (activeModelId === modelId && view === "2d") return;

    setActiveModelId(modelId);
    setFailedModelId(null);
    setErrorReason(null);
    setView("2d");
    setStats(null);
    setAttempt(0);
  };

  const returnTo2d = () => {
    setFailedModelId(null);
    setErrorReason(null);
    setView("2d");
    setStats(null);
    setAttempt(0);
  };

  const returnToCourseModel = () => {
    setActiveModelId(courseModelId);
    setSelectedId(initialStructureId);
    setFailedModelId(null);
    setErrorReason(null);
    setView("2d");
    setStats(null);
    setAttempt(0);
  };

  const resetScene = () => {
    const resetStructureId = isCourseModel ? initialStructureId : null;
    if (isCourseModel) setSelectedId(initialStructureId);
    controllerRef.current?.reset(resetStructureId);
    setStats(controllerRef.current?.getStats() ?? null);
  };

  const modelShelfStatus =
    view === "loading"
      ? `正在加载${activeModel.name}`
      : view === "3d"
        ? `${activeModel.name}已加载`
      : view === "error"
          ? `${activeModel.name} 3D 未启动，已保留正视图`
          : isUsingLocalReferencePreview
            ? `${activeModel.name} 本机参考正视图已就绪`
          : `${activeModel.name} 静态正视图已就绪`;

  return (
    <div
      className={styles.explorer}
      data-model-id={activeModelId}
      data-view={view}
      data-local-reference-models={
        localReferenceModelsEnabled ? "enabled" : "disabled"
      }
    >
      <div className={styles.explorerTopline}>
        <div>
          <span className={styles.stepLabel}>{activeModel.eyebrow}</span>
          <h2 id="cell-explorer-title">{activeModel.heading}</h2>
        </div>
        <div className={styles.viewActions}>
          {view === "3d" || view === "loading" ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={returnTo2d}
            >
              返回{activeModel.name} 2D
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => start3d()}
            >
              {view === "error" && failedModel
                ? `重试${failedModel.name} 3D`
                : `启动${activeModel.name} 3D`}
            </button>
          )}
          {view === "3d" ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={resetScene}
            >
              复位视角
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.modelShelf}>
        <div className={styles.modelShelfMeta}>
          <span>细胞标本</span>
          <small>{modelShelfStatus}</small>
        </div>
        <div
          className={styles.modelButtons}
          role="group"
          aria-label="选择细胞标本"
        >
          {CELL_MODEL_CATALOG.map((model) => {
            const isActive = activeModelId === model.id;

            return (
              <button
                type="button"
                className={
                  isActive ? styles.modelButtonSelected : styles.modelButton
                }
                aria-label={model.name}
                aria-pressed={isActive}
                data-model-id={model.id}
                onClick={() => selectModel(model.id)}
                key={model.id}
              >
                <strong>{model.name}</strong>
                <small>{model.shortDescription}</small>
              </button>
            );
          })}
        </div>
      </div>

      {!clientReady ? (
        <p className={styles.noScriptNotice}>
          当前浏览器关闭了 JavaScript，因此不启动 3D；下方固定正视图和三条结构说明仍可完整学习。
        </p>
      ) : null}

      {saveDataEnabled ? (
        <p className={styles.connectionNotice} role="status">
          设备已开启“节省流量”。页面不会自动下载 3D；只有你主动点击时才加载。
        </p>
      ) : null}

      <div className={styles.explorerGrid}>
        <div
          className={styles.visualPanel}
          aria-labelledby="cell-explorer-title"
        >
          <div className={styles.visualStage}>
            {attempt === 0 ? (
              <CellDiagram
                modelId={activeModelId}
                selectedId={isCourseModel ? selectedId : null}
                localReferencePreviewEnabled={isUsingLocalReferencePreview}
              />
            ) : null}
            {attempt > 0 ? (
              <canvas
                className={styles.cellCanvas}
                ref={canvasRef}
                key={`${activeModelId}-${attempt}`}
                aria-hidden="true"
                data-testid="cell-3d-canvas"
              />
            ) : null}
            {view === "3d" ? (
              <div className={styles.sceneBadge}>
                <span>3D 视图</span>
                <strong>{sceneBadge}</strong>
              </div>
            ) : null}
            {view === "loading" ? (
              <div className={styles.loadingOverlay} role="status">
                <span className={styles.loadingDot} aria-hidden="true" />
                正在本地加载{activeModel.name}模型…
              </div>
            ) : null}
          </div>

          <div className={styles.visualCaption}>
            <span>
              {view === "3d"
                ? isCourseModel
                  ? "拖动旋转 · 双指或滚轮缩放 · 画布热点为近似位置，左侧按钮可精确选择"
                  : "拖动旋转 · 双指或滚轮缩放 · 比较标本不参与下方三结构题"
                : view === "loading"
                  ? `正在准备${activeModel.name}观察场景`
                  : isUsingLocalReferencePreview
                    ? `${activeModel.name}本机参考正视图 · 仅本地测试，不会发布`
                    : `${activeModel.name}静态正视图始终可用`}
            </span>
            {stats ? (
              <span
                className={styles.sceneStats}
                data-model-source={stats.source}
                data-testid="scene-stats"
              >
                {stats.drawCalls} draw calls ·{" "}
                {stats.triangles.toLocaleString("zh-CN")} triangles
              </span>
            ) : null}
            {reducedMotion ? <span>已尊重“减少动态效果”设置</span> : null}
          </div>
        </div>

        <div className={styles.structurePanel}>
          {isCourseModel ? (
            <>
              <p className={styles.controlInstruction}>
                用结构按钮选择；这也是键盘与 3D 失败时的完整等价路径。
              </p>

              <div
                className={styles.structureButtons}
                role="group"
                aria-label="选择动物细胞结构"
              >
                {structures.map((structure) => {
                  const isSelected = selectedId === structure.id;
                  const accentStyle = {
                    "--structure-accent": structure.color,
                  } as CSSProperties;
                  return (
                    <button
                      type="button"
                      className={
                        isSelected
                          ? styles.structureButtonSelected
                          : styles.structureButton
                      }
                      aria-pressed={isSelected}
                      data-structure-id={structure.id}
                      onClick={() => setSelectedId(structure.id)}
                      style={accentStyle}
                      key={structure.id}
                    >
                      <span
                        className={styles.structureDot}
                        aria-hidden="true"
                      />
                      <span>
                        <strong>{structure.name}</strong>
                        <small>{structure.englishName}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className={styles.controlInstruction}>
                沿三步路线观察整体形态；这个比较标本不提供课程结构热点。
              </p>
              <ol className={styles.comparisonSteps}>
                {activeModel.comparisonSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </>
          )}
        </div>

        <aside className={styles.detailPanel}>
          <div
            className={styles.selectedCard}
            aria-live="polite"
            data-selected-structure={
              isCourseModel ? (selectedId ?? "none") : "not-applicable"
            }
          >
            {isCourseModel && selectedStructure ? (
              <>
                <span className={styles.selectedCardLabel}>当前结构</span>
                <h3>{selectedStructure.name}</h3>
                <p>{selectedStructure.summary}</p>
                <dl>
                  <div>
                    <dt>观察提示</dt>
                    <dd>{selectedStructure.visualCue}</dd>
                  </div>
                  <div>
                    <dt>试着回答</dt>
                    <dd>{selectedStructure.observationQuestion}</dd>
                  </div>
                </dl>
              </>
            ) : isCourseModel ? (
              <p>当前没有选中结构。请选择上方任意一个结构继续观察。</p>
            ) : (
              <>
                <span className={styles.selectedCardLabel}>比较标本</span>
                <h3>{activeModel.name}</h3>
                <p>{activeModel.description}</p>
                <dl>
                  <div>
                    <dt>观察重点</dt>
                    <dd>{activeModel.subtitle}</dd>
                  </div>
                  <div>
                    <dt>课程关系</dt>
                    <dd>{activeModel.courseRelationship}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className={styles.comparisonReturnButton}
                  onClick={returnToCourseModel}
                >
                  返回动物细胞，继续课程
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      {errorReason ? (
        <div
          className={styles.fallbackMessage}
          role="alert"
          data-error-reason={errorReason}
        >
          <strong>
            {failedModel
              ? `${failedModel.name} 3D 已安全降级`
              : "3D 已安全降级"}
          </strong>
          <span>{errorMessages[errorReason]}</span>
        </div>
      ) : null}
    </div>
  );
}
