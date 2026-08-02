"use client";

import { useEffect } from "react";

/**
 * KaTeX renders accessible MathML and visual HTML side by side. Browsers can
 * otherwise copy both representations, producing duplicated, fragmented text.
 * The official copy-tex extension replaces that output with the original TeX.
 */
export function KatexCopySupport() {
  useEffect(() => {
    void import("katex/contrib/copy-tex");
  }, []);

  return null;
}
