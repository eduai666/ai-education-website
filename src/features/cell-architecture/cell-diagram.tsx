import type { CellStructureId } from "./types";
import styles from "./cell-architecture.module.css";

type CellDiagramProps = {
  selectedId: CellStructureId | null;
};

function selectedClass(
  id: CellStructureId,
  selectedId: CellStructureId | null,
) {
  return id === selectedId
    ? `${styles.diagramStructure} ${styles.diagramStructureSelected}`
    : styles.diagramStructure;
}

export function CellDiagram({ selectedId }: CellDiagramProps) {
  return (
    <svg
      className={styles.cellDiagram}
      viewBox="0 0 520 360"
      role="img"
      aria-labelledby="cell-diagram-title cell-diagram-description"
    >
      <title id="cell-diagram-title">简化动物细胞二维图</title>
      <desc id="cell-diagram-description">
        图中展示细胞膜、细胞核和线粒体。颜色、位置和比例均经过简化。
      </desc>

      <defs>
        <radialGradient id="cell-cytoplasm" cx="44%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#e8fbf6" />
          <stop offset="100%" stopColor="#cceee8" />
        </radialGradient>
        <radialGradient id="cell-nucleus" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#d8cbff" />
          <stop offset="100%" stopColor="#8d70dc" />
        </radialGradient>
        <linearGradient id="cell-mito" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffc18f" />
          <stop offset="100%" stopColor="#f07c4f" />
        </linearGradient>
        <filter id="cell-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#163e47" floodOpacity="0.12" />
        </filter>
      </defs>

      <ellipse
        cx="260"
        cy="184"
        rx="218"
        ry="142"
        fill="url(#cell-cytoplasm)"
        filter="url(#cell-soft-shadow)"
      />

      <g className={selectedClass("cell-membrane", selectedId)}>
        <ellipse
          cx="260"
          cy="184"
          rx="218"
          ry="142"
          fill="none"
          stroke="#37a998"
          strokeWidth="11"
        />
        <ellipse
          cx="260"
          cy="184"
          rx="205"
          ry="130"
          fill="none"
          stroke="#8be0d2"
          strokeWidth="3"
          strokeDasharray="5 8"
        />
      </g>

      <g className={selectedClass("nucleus", selectedId)}>
        <circle cx="212" cy="164" r="64" fill="url(#cell-nucleus)" stroke="#7656c5" strokeWidth="5" />
        <circle cx="193" cy="146" r="17" fill="#6c4ab2" opacity="0.72" />
        <path d="M179 188c18 11 48 11 67-2" fill="none" stroke="#e9e1ff" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
      </g>

      <g className={selectedClass("mitochondrion", selectedId)}>
        <path
          d="M293 213c25-28 72-31 96-3 21 25 7 63-28 76-34 13-79-3-87-34-4-15 3-29 19-39Z"
          fill="url(#cell-mito)"
          stroke="#cf5c3d"
          strokeWidth="5"
        />
        <path d="M300 239c13-17 22 17 36-1s25 16 43-3" fill="none" stroke="#fff1df" strokeWidth="6" strokeLinecap="round" />
        <path d="M302 261c15-15 24 12 37-3s24 10 36-1" fill="none" stroke="#a94131" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
      </g>

      <g className={styles.diagramLabels} aria-hidden="true">
        <path d="M63 94 26 66" />
        <text x="18" y="54">细胞膜</text>
        <path d="M203 103 184 61" />
        <text x="141" y="48">细胞核</text>
        <path d="M374 219 438 189" />
        <text x="431" y="176">线粒体</text>
      </g>
    </svg>
  );
}
