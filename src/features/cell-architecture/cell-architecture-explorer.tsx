"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { CellDiagram } from "./cell-diagram";
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
};

const errorMessages: Record<ExplorerError, string> = {
  "webgl2-unavailable":
    "这台设备不能建立 WebGL2 场景，已保留完整的 2D 学习内容。",
  "context-lost":
    "3D 图形上下文已经中断，已安全返回 2D。你可以稍后重新尝试。",
  "scene-load-timeout":
    "3D 组件加载超时，已安全返回 2D。请检查网络后再试。",
  "scene-mount-failed":
    "3D 场景没有成功启动，已保留完整的 2D 学习内容。",
};

const sceneLoadTimeoutMs = 12_000;

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
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "webgl2-unavailable"
  ) {
    return "webgl2-unavailable";
  }

  return "scene-mount-failed";
}

export function CellArchitectureExplorer({
  structures,
  scene,
  initialStructureId,
}: CellArchitectureExplorerProps) {
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

  const selectedStructure = useMemo(
    () => structures.find((structure) => structure.id === selectedId) ?? null,
    [selectedId, structures],
  );

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (attempt === 0) return;

    let active = true;
    let ownedController: CellSceneController | null = null;
    const canvas = canvasRef.current;

    if (!canvas) return;

    const sceneLoadTimer = window.setTimeout(() => {
      if (!active) return;

      active = false;
      setErrorReason("scene-load-timeout");
      setStats(null);
      setView("error");
      setAttempt(0);
    }, sceneLoadTimeoutMs);

    const startScene = async () => {
      try {
        const runtime = await import("./cell-three-runtime");
        if (!active) return;
        window.clearTimeout(sceneLoadTimer);

        ownedController = runtime.mountCellScene(canvas, scene, {
          onSelect: (id) => {
            if (active) setSelectedId(id);
          },
          onContextLost: () => {
            if (!active) return;
            setErrorReason("context-lost");
            setView("error");
            setStats(null);
            setAttempt(0);
          },
        });

        if (!active) {
          ownedController.dispose();
          return;
        }

        controllerRef.current = ownedController;
        ownedController.select(selectedIdRef.current);
        setStats(ownedController.getStats());
        setView("3d");
      } catch (error) {
        if (!active) return;
        setErrorReason(getMountError(error));
        setStats(null);
        setView("error");
        setAttempt(0);
      }
    };

    void startScene();

    return () => {
      active = false;
      window.clearTimeout(sceneLoadTimer);
      if (controllerRef.current === ownedController) {
        controllerRef.current = null;
      }
      ownedController?.dispose();
    };
  }, [attempt, scene]);

  useEffect(() => {
    controllerRef.current?.select(selectedId);
  }, [selectedId]);

  const start3d = () => {
    setErrorReason(null);
    setStats(null);
    setView("loading");
    setAttempt(1);
  };

  const returnTo2d = () => {
    setView("2d");
    setStats(null);
    setAttempt(0);
  };

  const resetScene = () => {
    setSelectedId(initialStructureId);
    controllerRef.current?.reset(initialStructureId);
    setStats(controllerRef.current?.getStats() ?? null);
  };

  return (
    <div className={styles.explorer} data-view={view}>
      <div className={styles.explorerTopline}>
        <div>
          <span className={styles.stepLabel}>观察台 · 01</span>
          <h2 id="cell-explorer-title">先看结构，再读证据</h2>
        </div>
        <div className={styles.viewActions}>
          {view === "3d" || view === "loading" ? (
            <button type="button" className={styles.secondaryButton} onClick={returnTo2d}>
              返回 2D
            </button>
          ) : (
            <button type="button" className={styles.primaryButton} onClick={start3d}>
              {view === "error" ? "重新尝试 3D" : "启动 3D"}
            </button>
          )}
          {view === "3d" ? (
            <button type="button" className={styles.secondaryButton} onClick={resetScene}>
              复位视角
            </button>
          ) : null}
        </div>
      </div>

      {!clientReady ? (
        <p className={styles.noScriptNotice}>
          当前浏览器关闭了 JavaScript，因此不启动 3D；下方 2D 图和三张知识卡仍可完整学习。
        </p>
      ) : null}

      {saveDataEnabled ? (
        <p className={styles.connectionNotice} role="status">
          设备已开启“节省流量”。页面不会自动下载 3D；只有你主动点击时才加载。
        </p>
      ) : null}

      <div className={styles.explorerGrid}>
        <div className={styles.visualPanel} aria-labelledby="cell-explorer-title">
          <div className={styles.visualStage}>
            {attempt === 0 ? <CellDiagram selectedId={selectedId} /> : null}
            {attempt > 0 ? (
              <canvas
                className={styles.cellCanvas}
                ref={canvasRef}
                aria-hidden="true"
                data-testid="cell-3d-canvas"
              />
            ) : null}
            {view === "loading" ? (
              <div className={styles.loadingOverlay} role="status">
                <span className={styles.loadingDot} aria-hidden="true" />
                正在本地加载 3D 组件…
              </div>
            ) : null}
          </div>

          <div className={styles.visualCaption}>
            <span>{view === "3d" ? "拖动旋转 · 双指或滚轮缩放" : "二维基础路径始终可用"}</span>
            {stats ? (
              <span data-testid="scene-stats">
                {stats.drawCalls} draw calls · {stats.triangles.toLocaleString("zh-CN")} triangles
              </span>
            ) : null}
            {reducedMotion ? <span>已尊重“减少动态效果”设置</span> : null}
          </div>
        </div>

        <div className={styles.controlPanel}>
          <p className={styles.controlInstruction}>
            用结构按钮选择；这也是键盘与 3D 失败时的完整等价路径。
          </p>

          <div
            className={styles.structureButtons}
            role="group"
            aria-label="选择细胞结构"
          >
            {structures.map((structure, index) => {
              const isSelected = selectedId === structure.id;
              return (
                <button
                  type="button"
                  className={isSelected ? styles.structureButtonSelected : styles.structureButton}
                  aria-pressed={isSelected}
                  data-structure-id={structure.id}
                  onClick={() => setSelectedId(structure.id)}
                  key={structure.id}
                >
                  <span className={styles.structureNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>{structure.name}</strong>
                    <small>{structure.englishName}</small>
                  </span>
                  <span className={styles.selectedMarker} aria-hidden="true">
                    {isSelected ? "✓" : "→"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.selectedCard} aria-live="polite" data-selected-structure={selectedId ?? "none"}>
            {selectedStructure ? (
              <>
                <span className={styles.selectedCardLabel}>当前选择 · {selectedStructure.factId}</span>
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
            ) : (
              <p>当前没有选中结构。请选择上方任意一个结构继续观察。</p>
            )}
          </div>
        </div>
      </div>

      {errorReason ? (
        <div className={styles.fallbackMessage} role="alert" data-error-reason={errorReason}>
          <strong>3D 已安全降级</strong>
          <span>{errorMessages[errorReason]}</span>
        </div>
      ) : null}
    </div>
  );
}
