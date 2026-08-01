"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SiteSearchDocument } from "./types";

type SiteSearchProps = {
  documents: SiteSearchDocument[];
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
}

function rankDocument(document: SiteSearchDocument, query: string) {
  const title = normalize(document.title);
  const description = normalize(document.description);
  const sectionLabel = normalize(document.sectionLabel);
  const matchingSection = document.sections.find((section) =>
    normalize(section.label).includes(query),
  );

  let score = 0;
  if (title === query) score += 12;
  else if (title.startsWith(query)) score += 9;
  else if (title.includes(query)) score += 7;
  if (sectionLabel.includes(query)) score += 4;
  if (matchingSection) score += 5;
  if (description.includes(query)) score += 2;

  return {
    document,
    href: matchingSection ? `${document.path}#${matchingSection.id}` : document.path,
    matchingSection: matchingSection?.label,
    score,
  };
}

function focusSamePageSection(href: string) {
  const destination = new URL(href, window.location.href);
  if (
    destination.pathname !== window.location.pathname ||
    destination.search !== window.location.search ||
    !destination.hash
  ) {
    return;
  }

  let targetId: string;
  try {
    targetId = decodeURIComponent(destination.hash.slice(1));
  } catch {
    return;
  }

  window.requestAnimationFrame(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const hadTabIndex = target.hasAttribute("tabindex");
    if (!hadTabIndex) target.tabIndex = -1;
    target.focus({ preventScroll: true });

    if (!hadTabIndex) {
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
        once: true,
      });
    }
  });
}

function restoreElementFocus(opener: HTMLElement | null, fallback: HTMLElement | null) {
  const target =
    opener?.isConnected && opener !== document.body && opener !== document.documentElement
      ? opener
      : fallback;
  if (!target) return;

  const isNativelyFocusable = target.matches(
    "a[href], button, input, select, textarea, summary, [contenteditable='true'], [tabindex]",
  );
  const addedTabIndex = !isNativelyFocusable;
  if (addedTabIndex) target.tabIndex = -1;

  target.focus();

  if (addedTabIndex) {
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
      once: true,
    });
  }
}

export function SiteSearch({ documents }: SiteSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const results = useMemo(() => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return documents.slice(0, 8).map((document) => ({
        document,
        href: document.path,
        matchingSection: undefined,
        score: 0,
      }));
    }

    return documents
      .map((document) => rankDocument(document, normalizedQuery))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title, "zh-CN"))
      .slice(0, 10);
  }, [documents, query]);

  const openSearch = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : triggerRef.current;
    setIsOpen(true);
    setQuery("");
    dialog.showModal();
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  function closeSearch({ restoreFocus = true } = {}) {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setIsOpen(false);
    if (restoreFocus) {
      const opener = openerRef.current;
      window.requestAnimationFrame(() => {
        restoreElementFocus(opener, triggerRef.current);
      });
    }
    openerRef.current = null;
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  return (
    <>
      <button
        ref={triggerRef}
        className="header-search-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-keyshortcuts="Control+K Meta+K"
        onClick={openSearch}
      >
        <SearchIcon />
        <span>搜索</span>
        <kbd aria-hidden="true">Ctrl K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        className="site-search-dialog"
        aria-labelledby="site-search-title"
        onCancel={(event) => {
          event.preventDefault();
          closeSearch();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeSearch();
        }}
        onClose={() => setIsOpen(false)}
      >
        <div className="site-search-panel">
          <div className="site-search-heading">
            <div>
              <p className="site-search-kicker">全站搜索</p>
              <h2 id="site-search-title">查找课程、指南和项目</h2>
            </div>
            <button
              className="site-search-close"
              type="button"
              aria-label="关闭搜索"
              onClick={() => closeSearch()}
            >
              <CloseIcon />
            </button>
          </div>

          <label className="site-search-field">
            <SearchIcon />
            <input
              ref={inputRef}
              type="search"
              aria-label="搜索关键词"
              value={query}
              placeholder="输入课程、概念或项目名称"
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <p className="site-search-status" aria-live="polite">
            {query.trim() ? `找到 ${results.length} 个结果` : "常用学习入口"}
          </p>

          {results.length ? (
            <ul className="site-search-results">
              {results.map((result) => (
                <li key={`${result.document.path}-${result.href}`}>
                  <Link
                    href={result.href}
                    onClick={() => {
                      closeSearch({ restoreFocus: false });
                      focusSamePageSection(result.href);
                    }}
                  >
                    <span className="site-search-result-section">{result.document.sectionLabel}</span>
                    <strong>{result.document.title}</strong>
                    <span>
                      {result.matchingSection
                        ? `相关小节：${result.matchingSection}`
                        : result.document.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="site-search-empty">
              <strong>暂时没有找到对应内容</strong>
              <p>可以换一个更短的关键词，例如“上下文”“智能体”或“细胞”。</p>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
