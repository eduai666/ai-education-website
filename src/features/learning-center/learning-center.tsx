"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { SiteSearchDocument } from "@/features/site-search/types";
import {
  clearLearningState,
  LEARNING_STORAGE_EVENT,
  LEARNING_STORAGE_KEY,
  parseLearningState,
  recordRecentLearning,
} from "./learning-storage";

const EMPTY_SNAPSHOT = "";

function subscribeToLearningState(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LEARNING_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LEARNING_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LEARNING_STORAGE_EVENT, onStoreChange);
  };
}

function getLearningSnapshot() {
  try {
    return window.localStorage.getItem(LEARNING_STORAGE_KEY) ?? EMPTY_SNAPSHOT;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function getServerLearningSnapshot() {
  return EMPTY_SNAPSHOT;
}

export function LearningHistoryTracker({
  activePath,
  knownPaths,
}: {
  activePath: string;
  knownPaths: string[];
}) {
  useEffect(() => {
    if (!activePath.startsWith("/courses/") && !activePath.startsWith("/projects/")) return;
    recordRecentLearning(activePath, new Set(knownPaths));
  }, [activePath, knownPaths]);

  return null;
}

export function LearningCenterPanel({ documents }: { documents: SiteSearchDocument[] }) {
  const [announcement, setAnnouncement] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rawSnapshot = useSyncExternalStore(
    subscribeToLearningState,
    getLearningSnapshot,
    getServerLearningSnapshot,
  );
  const documentsByPath = useMemo(
    () => new Map(documents.map((document) => [document.path, document])),
    [documents],
  );
  const knownPaths = useMemo(() => new Set(documentsByPath.keys()), [documentsByPath]);
  const state = useMemo(
    () => parseLearningState(rawSnapshot || null, knownPaths),
    [knownPaths, rawSnapshot],
  );

  function clearHistory() {
    clearLearningState();
    setAnnouncement("本机学习记录已清除");
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  return (
    <section className="learning-center-panel" aria-labelledby="recent-learning-title">
      <div className="learning-center-heading">
        <div>
          <p>仅保存在当前浏览器</p>
          <h2 id="recent-learning-title" ref={headingRef} tabIndex={-1}>最近学习</h2>
        </div>
        {state.recent.length ? (
          <button type="button" onClick={clearHistory}>清除本机记录</button>
        ) : null}
      </div>

      <p className="learning-center-status" role="status" aria-live="polite">
        {announcement}
      </p>

      {state.recent.length ? (
        <ol className="learning-history-list">
          {state.recent.map((item) => {
            const document = documentsByPath.get(item.path);
            if (!document) return null;

            return (
              <li key={item.path}>
                <div>
                  <span>{document.sectionLabel}</span>
                  <strong>{document.title}</strong>
                  <time dateTime={item.visitedAt}>
                    {new Intl.DateTimeFormat("zh-CN", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(item.visitedAt))}
                  </time>
                </div>
                <Link href={item.path}>继续学习</Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="learning-center-empty">
          <strong>还没有本机学习记录</strong>
          <p>打开一节课程或一个实践项目后，这里会显示最近访问的内容。</p>
          <Link href="/courses/ai-basics/ai-around-us">从第一节课开始</Link>
        </div>
      )}

      <div className="learning-center-privacy" id="learning-record-privacy">
        <h2>关于这份记录</h2>
        <p>
          当前版本不创建账号，也不上传姓名、学习内容或浏览记录。更换浏览器、清除站点数据，
          或点击“清除本机记录”后，这些记录都会消失。
        </p>
      </div>
    </section>
  );
}
