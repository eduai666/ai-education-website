"use client";

import { useEffect, useRef } from "react";

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function LanguageDisclosure() {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeFromOutside = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (!details?.open || !(event.target instanceof Node)) return;
      if (!details.contains(event.target)) details.open = false;
    };

    const closeFromKeyboard = (event: KeyboardEvent) => {
      const details = detailsRef.current;
      if (
        event.key !== "Escape" ||
        !details?.open ||
        !details.contains(document.activeElement)
      ) {
        return;
      }

      event.preventDefault();
      details.open = false;
      details.querySelector("summary")?.focus();
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromKeyboard);

    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromKeyboard);
    };
  }, []);

  return (
    <details
      className="language-menu"
      ref={detailsRef}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        ) {
          return;
        }

        event.currentTarget.open = false;
      }}
    >
      <summary aria-label="选择语言，当前为简体中文">
        <LanguageIcon />
        <span>简中</span>
      </summary>
      <div className="language-menu-panel">
        <span className="is-current" aria-current="true">简体中文</span>
        <span aria-disabled="true">English <small>建设中</small></span>
      </div>
    </details>
  );
}
