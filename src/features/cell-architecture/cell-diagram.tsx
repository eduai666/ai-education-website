"use client";

import { useEffect, useRef, useState } from "react";
import type { CellModelId } from "./cell-model-catalog";
import type { CellStructureId } from "./types";
import styles from "./cell-architecture.module.css";

type CellDiagramProps = {
  modelId: CellModelId;
  selectedId: CellStructureId | null;
  localReferencePreviewEnabled?: boolean;
};

const diagramCopy: Record<
  CellModelId,
  { title: string; description: string }
> = {
  "animal-cell": {
    title: "动物细胞 3D 模型固定正视图",
    description:
      "这是由动物细胞三维模型以固定机位预渲染的静态正视图。图上的引线和高亮帮助定位细胞膜、细胞核和线粒体；图片无法加载时会显示简化示意图。",
  },
  "plant-cell": {
    title: "植物细胞 3D 模型固定正视图",
    description:
      "这是由植物细胞三维模型以固定机位预渲染的静态正视图。观察时可辨认细胞壁、叶绿体、中央液泡和细胞核；图片无法加载时会显示简化示意图。",
  },
  "muscle-cell": {
    title: "骨骼肌细胞 3D 模型固定正视图",
    description:
      "这是由骨骼肌细胞三维模型以固定机位预渲染的静态正视图。可观察长条形肌纤维、横纹和靠近周边的细胞核；它不代表心肌或平滑肌。",
  },
  neuron: {
    title: "神经元 3D 模型固定正视图",
    description:
      "这是由神经元三维模型以固定机位预渲染的静态正视图。图中可观察细胞体、树突和轴突的整体形态，不表示真实比例。",
  },
  "bacteria-wall": {
    title: "细菌细胞壁 3D 模型固定正视图",
    description:
      "这是由革兰阳性菌细胞壁三维模型以固定机位预渲染的静态正视图。它是分层截面，不是一颗完整细菌。",
  },
};

const frontPreviewByModel: Record<CellModelId, string> = {
  "animal-cell": "/cell-architecture/front-previews/animal-cell-front-v1.png",
  "plant-cell": "/cell-architecture/front-previews/plant-cell-front-v1.png",
  "muscle-cell": "/cell-architecture/front-previews/muscle-cell-front-v1.png",
  neuron: "/cell-architecture/front-previews/neuron-front-v1.png",
  "bacteria-wall":
    "/cell-architecture/front-previews/bacteria-wall-front-v1.png",
};

function getFrontPreviewSource(
  modelId: CellModelId,
  localReferencePreviewEnabled: boolean,
) {
  if (modelId === "plant-cell" && localReferencePreviewEnabled) {
    return "/api/local-reference-cell-previews/plant-cell-reference-front-v1.png";
  }

  return frontPreviewByModel[modelId];
}

function selectedClass(
  id: CellStructureId,
  selectedId: CellStructureId | null,
) {
  return id === selectedId
    ? `${styles.diagramStructure} ${styles.diagramStructureSelected}`
    : styles.diagramStructure;
}

function frontPreviewStructureClass(
  id: CellStructureId,
  selectedId: CellStructureId | null,
) {
  return id === selectedId
    ? `${styles.frontPreviewStructure} ${styles.frontPreviewStructureSelected}`
    : styles.frontPreviewStructure;
}

function FrontPreviewImage({
  modelId,
  localReferencePreviewEnabled = false,
}: Pick<CellDiagramProps, "modelId" | "localReferencePreviewEnabled">) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const source = getFrontPreviewSource(modelId, localReferencePreviewEnabled);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const markFailed = () => setFailed(true);
    image.addEventListener("error", markFailed);

    // A fast 404 can occur before React attaches its delegated error handler.
    if (image.complete && image.naturalWidth === 0) markFailed();

    return () => image.removeEventListener("error", markFailed);
  }, [source]);

  if (failed) return null;

  return (
    // The fixed PNG is deliberately served from public/ without a runtime image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      className={styles.cellFrontPreview}
      src={source}
      alt=""
      aria-hidden="true"
      data-front-preview={modelId}
      data-preview-source={
        localReferencePreviewEnabled ? "local-reference" : "release"
      }
      onError={() => setFailed(true)}
    />
  );
}

function AnimalCellDiagram({ selectedId }: Pick<CellDiagramProps, "selectedId">) {
  return (
    <>
      <defs>
        <radialGradient id="animal-cytoplasm" cx="44%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#e8fbf6" />
          <stop offset="100%" stopColor="#cceee8" />
        </radialGradient>
        <radialGradient id="animal-nucleus" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#d8cbff" />
          <stop offset="100%" stopColor="#8d70dc" />
        </radialGradient>
        <linearGradient id="animal-mito" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffc18f" />
          <stop offset="100%" stopColor="#f07c4f" />
        </linearGradient>
        <filter id="animal-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="12"
            floodColor="#163e47"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      <ellipse
        cx="260"
        cy="184"
        rx="218"
        ry="142"
        fill="url(#animal-cytoplasm)"
        filter="url(#animal-shadow)"
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
        <circle
          cx="212"
          cy="164"
          r="64"
          fill="url(#animal-nucleus)"
          stroke="#7656c5"
          strokeWidth="5"
        />
        <circle cx="193" cy="146" r="17" fill="#6c4ab2" opacity="0.72" />
        <path
          d="M179 188c18 11 48 11 67-2"
          fill="none"
          stroke="#e9e1ff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>

      <g className={selectedClass("mitochondrion", selectedId)}>
        <path
          d="M293 213c25-28 72-31 96-3 21 25 7 63-28 76-34 13-79-3-87-34-4-15 3-29 19-39Z"
          fill="url(#animal-mito)"
          stroke="#cf5c3d"
          strokeWidth="5"
        />
        <path
          d="M300 239c13-17 22 17 36-1s25 16 43-3"
          fill="none"
          stroke="#fff1df"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M302 261c15-15 24 12 37-3s24 10 36-1"
          fill="none"
          stroke="#a94131"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>

      <g className={styles.diagramLabels} aria-hidden="true">
        <path d="M63 94 26 66" />
        <text x="18" y="54">细胞膜</text>
        <path d="M203 103 184 61" />
        <text x="141" y="48">细胞核</text>
        <path d="M374 219 438 189" />
        <text x="431" y="176">线粒体</text>
      </g>
    </>
  );
}

function PlantCellDiagram() {
  const chloroplasts = [
    { cx: 116, cy: 96, rotate: -18 },
    { cx: 403, cy: 105, rotate: 16 },
    { cx: 414, cy: 235, rotate: -12 },
    { cx: 116, cy: 257, rotate: 14 },
  ];

  return (
    <>
      <defs>
        <linearGradient id="plant-cytoplasm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eff8d8" />
          <stop offset="100%" stopColor="#d8efc5" />
        </linearGradient>
        <radialGradient id="plant-vacuole" cx="42%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#e8fbfb" />
          <stop offset="100%" stopColor="#b7dedc" />
        </radialGradient>
        <filter id="plant-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="11"
            floodColor="#2c5939"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      <rect
        x="52"
        y="43"
        width="416"
        height="274"
        rx="58"
        fill="url(#plant-cytoplasm)"
        stroke="#6f9f63"
        strokeWidth="13"
        filter="url(#plant-shadow)"
        data-part="cell-wall"
      />
      <rect
        x="68"
        y="59"
        width="384"
        height="242"
        rx="48"
        fill="none"
        stroke="#43a786"
        strokeWidth="4"
        strokeDasharray="7 7"
        data-part="cell-membrane"
      />
      <rect
        x="157"
        y="83"
        width="230"
        height="205"
        rx="82"
        fill="url(#plant-vacuole)"
        stroke="#75b9b7"
        strokeWidth="4"
        data-part="central-vacuole"
      />
      <circle
        cx="124"
        cy="176"
        r="43"
        fill="#b39be2"
        stroke="#7658b1"
        strokeWidth="5"
        data-part="nucleus"
      />
      <circle cx="111" cy="163" r="12" fill="#7658b1" opacity="0.75" />

      {chloroplasts.map((chloroplast, index) => (
        <g
          key={`${chloroplast.cx}-${chloroplast.cy}`}
          transform={`rotate(${chloroplast.rotate} ${chloroplast.cx} ${chloroplast.cy})`}
          data-part="chloroplast"
        >
          <ellipse
            cx={chloroplast.cx}
            cy={chloroplast.cy}
            rx="29"
            ry="14"
            fill="#62ad62"
            stroke="#397c4c"
            strokeWidth="3"
          />
          <path
            d={`M${chloroplast.cx - 17} ${chloroplast.cy - 4}h34M${chloroplast.cx - 15} ${chloroplast.cy + 4}h30`}
            stroke="#d8f0a8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <title>叶绿体 {index + 1}</title>
        </g>
      ))}

      <g className={styles.diagramLabels} aria-hidden="true">
        <path d="M65 78 28 56" />
        <text x="18" y="44">细胞壁</text>
        <path d="M105 95 91 40" />
        <text x="62" y="29">叶绿体</text>
        <path d="M303 91 333 39" />
        <text x="305" y="28">中央液泡</text>
        <path d="M119 217 84 300" />
        <text x="45" y="320">细胞核</text>
      </g>
    </>
  );
}

function MuscleCellDiagram() {
  const striationX = [142, 184, 226, 268, 310, 352, 394];

  return (
    <>
      <defs>
        <linearGradient id="muscle-fiber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7c6bd" />
          <stop offset="55%" stopColor="#dc8988" />
          <stop offset="100%" stopColor="#c76d79" />
        </linearGradient>
        <filter id="muscle-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="11"
            floodColor="#653b48"
            floodOpacity="0.14"
          />
        </filter>
      </defs>

      <rect
        x="55"
        y="101"
        width="410"
        height="158"
        rx="79"
        fill="url(#muscle-fiber)"
        stroke="#a75066"
        strokeWidth="8"
        filter="url(#muscle-shadow)"
        data-part="sarcolemma"
      />
      <g data-part="myofibrils" opacity="0.9">
        {[139, 180, 221].map((y) => (
          <path
            key={y}
            d={`M105 ${y}H416`}
            fill="none"
            stroke={y === 180 ? "#8f435e" : "#f8ded1"}
            strokeWidth="12"
            strokeLinecap="round"
          />
        ))}
      </g>
      <g data-part="striations" opacity="0.62">
        {striationX.map((x) => (
          <path
            key={x}
            d={`M${x} 113V247`}
            stroke="#9f4f67"
            strokeWidth="7"
          />
        ))}
      </g>
      <g data-part="nuclei">
        <ellipse
          cx="132"
          cy="119"
          rx="24"
          ry="11"
          fill="#7658a8"
          transform="rotate(-10 132 119)"
        />
        <ellipse
          cx="374"
          cy="242"
          rx="24"
          ry="11"
          fill="#7658a8"
          transform="rotate(9 374 242)"
        />
      </g>
      <g data-part="mitochondria" fill="#f3a35f" stroke="#b86643" strokeWidth="2">
        <ellipse cx="298" cy="126" rx="16" ry="8" transform="rotate(-12 298 126)" />
        <ellipse cx="213" cy="235" rx="16" ry="8" transform="rotate(11 213 235)" />
      </g>

      <g className={styles.diagramLabels} aria-hidden="true">
        <path d="M77 127 31 81" />
        <text x="18" y="67">肌膜</text>
        <path d="M227 180 225 56" />
        <text x="185" y="42">肌原纤维</text>
        <path d="M352 116 405 62" />
        <text x="394" y="49">横纹</text>
        <path d="M374 242 430 296" />
        <text x="409" y="316">细胞核</text>
      </g>
    </>
  );
}

function NeuronDiagram() {
  return (
    <>
      <defs>
        <radialGradient id="neuron-soma" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#d9d1f3" />
          <stop offset="100%" stopColor="#8b83c5" />
        </radialGradient>
        <filter id="neuron-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="9"
            floodColor="#34355f"
            floodOpacity="0.14"
          />
        </filter>
      </defs>

      <g
        fill="none"
        stroke="#7778b6"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        data-part="dendrites"
      >
        <path d="M169 171C126 148 112 99 72 72L42 45" />
        <path d="M159 194C109 197 87 224 42 230L20 250" />
        <path d="M180 144C160 102 178 70 153 38L129 19" />
        <path d="M178 219C148 253 155 286 122 320" />
        <path d="M109 197 70 179 39 184" strokeWidth="7" />
        <path d="M109 122 83 102 54 106" strokeWidth="7" />
      </g>
      <path
        d="M260 184C323 177 355 188 401 170S459 130 499 148"
        fill="none"
        stroke="#636ca7"
        strokeWidth="15"
        strokeLinecap="round"
        data-part="axon"
      />
      <g
        fill="none"
        stroke="#636ca7"
        strokeWidth="7"
        strokeLinecap="round"
      >
        <path d="M463 151 486 109 510 95" />
        <path d="M468 149 494 181 513 185" />
      </g>
      <circle
        cx="210"
        cy="181"
        r="62"
        fill="url(#neuron-soma)"
        stroke="#6564a8"
        strokeWidth="6"
        filter="url(#neuron-shadow)"
        data-part="cell-body"
      />
      <circle
        cx="210"
        cy="181"
        r="27"
        fill="#7655ad"
        stroke="#e5dcfa"
        strokeWidth="4"
        data-part="nucleus"
      />

      <g className={styles.diagramLabels} aria-hidden="true">
        <path d="M165 146 116 82" />
        <text x="82" y="69">树突</text>
        <path d="M206 120 231 61" />
        <text x="198" y="48">细胞体</text>
        <path d="M250 181 350 123" />
        <text x="339" y="109">轴突</text>
      </g>
    </>
  );
}

function BacteriaWallDiagram() {
  return (
    <>
      <defs>
        <linearGradient id="bacteria-interior" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8f6ee" />
          <stop offset="100%" stopColor="#c9e7dc" />
        </linearGradient>
        <filter id="bacteria-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="10"
            floodColor="#3b504b"
            floodOpacity="0.13"
          />
        </filter>
      </defs>

      <path
        d="M78 78H386c48 0 86 39 86 86v32c0 48-38 86-86 86H78Z"
        fill="#d8c4e6"
        stroke="#8f70aa"
        strokeWidth="7"
        filter="url(#bacteria-shadow)"
        data-part="outer-layer"
      />
      <path
        d="M102 101H383c36 0 65 29 65 65v28c0 36-29 65-65 65H102Z"
        fill="#eccb82"
        stroke="#c18c45"
        strokeWidth="13"
        data-part="peptidoglycan"
      />
      <path
        d="M126 122H378c25 0 46 21 46 46v24c0 25-21 46-46 46H126Z"
        fill="url(#bacteria-interior)"
        stroke="#3f9c86"
        strokeWidth="8"
        data-part="cell-membrane"
      />
      <path d="M80 78V282" stroke="#fffdf8" strokeWidth="8" opacity="0.85" />
      <g fill="#6fae9d" opacity="0.65" data-part="interior">
        <circle cx="221" cy="166" r="8" />
        <circle cx="274" cy="202" r="7" />
        <circle cx="339" cy="157" r="9" />
        <circle cx="365" cy="212" r="6" />
      </g>

      <g className={styles.diagramLabels} aria-hidden="true">
        <path d="M118 91 76 43" />
        <text x="29" y="31">外侧</text>
        <path d="M199 104 220 46" />
        <text x="168" y="33">厚肽聚糖层</text>
        <path d="M420 129 471 85" />
        <text x="448" y="71">细胞膜</text>
        <path d="M340 207 400 300" />
        <text x="372" y="322">细胞内部</text>
      </g>
    </>
  );
}

function AnimalCellFrontPreview({
  selectedId,
}: Pick<CellDiagramProps, "selectedId">) {
  return (
    <>
      <g
        className={frontPreviewStructureClass("cell-membrane", selectedId)}
        data-preview-structure="cell-membrane"
        aria-hidden="true"
      >
        <ellipse
          cx="350"
          cy="259"
          rx="261"
          ry="244"
          fill="none"
          stroke="#14796f"
          strokeWidth="7"
          strokeDasharray="14 9"
        />
      </g>
      <g
        className={frontPreviewStructureClass("nucleus", selectedId)}
        data-preview-structure="nucleus"
        aria-hidden="true"
      >
        <ellipse
          cx="314"
          cy="302"
          rx="71"
          ry="71"
          fill="rgba(143, 103, 216, 0.12)"
          stroke="#6e52b4"
          strokeWidth="7"
        />
      </g>
      <g
        className={frontPreviewStructureClass("mitochondrion", selectedId)}
        data-preview-structure="mitochondrion"
        aria-hidden="true"
      >
        <ellipse
          cx="518"
          cy="176"
          rx="53"
          ry="95"
          fill="rgba(235, 117, 73, 0.12)"
          stroke="#c85e3b"
          strokeWidth="7"
          transform="rotate(-32 518 176)"
        />
      </g>
      <g className={styles.frontPreviewLabels} aria-hidden="true">
        <path d="M92 94 119 121" />
        <text x="33" y="82">细胞膜</text>
        <path d="M171 432 252 360" />
        <text x="34" y="455">细胞核</text>
        <path d="M587 67 552 105" />
        <text x="566" y="53">线粒体</text>
      </g>
    </>
  );
}

function PlantCellFrontPreview() {
  return (
    <g className={styles.frontPreviewLabels} aria-hidden="true">
      <path d="M93 83 112 109" />
      <text x="34" y="72">细胞壁</text>
      <path d="M96 255 133 218" />
      <text x="28" y="248">叶绿体</text>
      <path d="M290 455 318 354" />
      <text x="237" y="478">中央液泡</text>
      <path d="M539 79 485 148" />
      <text x="543" y="65">细胞核</text>
    </g>
  );
}

function PlantCellLocalReferenceFrontPreview() {
  return (
    <g className={styles.frontPreviewLabels} aria-hidden="true">
      <path d="M134 98 196 156" />
      <text x="35" y="84">细胞壁</text>
      <path d="M562 158 495 212" />
      <text x="554" y="145">叶绿体</text>
      <path d="M394 445 396 335" />
      <text x="344" y="469">中央液泡</text>
      <path d="M151 143 282 188" />
      <text x="74" y="129">细胞核</text>
    </g>
  );
}

function MuscleCellFrontPreview() {
  return (
    <g className={styles.frontPreviewLabels} aria-hidden="true">
      <path d="M82 119 102 160" />
      <text x="28" y="105">肌膜</text>
      <path d="M299 84 339 214" />
      <text x="253" y="70">肌原纤维</text>
      <path d="M585 116 538 169" />
      <text x="584" y="103">横纹</text>
      <path d="M552 424 492 346" />
      <text x="538" y="448">周边细胞核</text>
    </g>
  );
}

function NeuronFrontPreview() {
  return (
    <g className={styles.frontPreviewLabels} aria-hidden="true">
      <path d="M167 85 291 148" />
      <text x="102" y="70">树突</text>
      <path d="M409 84 368 163" />
      <text x="387" y="69">细胞体</text>
      <path d="M548 304 442 277" />
      <text x="554" y="296">轴突</text>
    </g>
  );
}

function BacteriaWallFrontPreview() {
  return (
    <g className={styles.frontPreviewLabels} aria-hidden="true">
      <path d="M106 79 186 150" />
      <text x="38" y="66">细胞壁</text>
      <path d="M368 82 368 164" />
      <text x="326" y="67">肽聚糖层</text>
      <path d="M572 469 487 392" />
      <text x="569" y="489">细胞膜</text>
    </g>
  );
}

function FrontPreviewOverlay({
  modelId,
  selectedId,
  localReferencePreviewEnabled = false,
}: CellDiagramProps) {
  switch (modelId) {
    case "plant-cell":
      return localReferencePreviewEnabled ? (
        <PlantCellLocalReferenceFrontPreview />
      ) : (
        <PlantCellFrontPreview />
      );
    case "muscle-cell":
      return <MuscleCellFrontPreview />;
    case "neuron":
      return <NeuronFrontPreview />;
    case "bacteria-wall":
      return <BacteriaWallFrontPreview />;
    case "animal-cell":
      return <AnimalCellFrontPreview selectedId={selectedId} />;
  }
}

function DiagramContents({
  modelId,
  selectedId,
}: CellDiagramProps) {
  switch (modelId) {
    case "plant-cell":
      return <PlantCellDiagram />;
    case "muscle-cell":
      return <MuscleCellDiagram />;
    case "neuron":
      return <NeuronDiagram />;
    case "bacteria-wall":
      return <BacteriaWallDiagram />;
    case "animal-cell":
      return <AnimalCellDiagram selectedId={selectedId} />;
  }
}

export function CellDiagram({
  modelId,
  selectedId,
  localReferencePreviewEnabled = false,
}: CellDiagramProps) {
  const copy = diagramCopy[modelId];

  return (
    <div
      className={styles.cellDiagram}
      role="img"
      aria-label={`${copy.title}。${copy.description}`}
      data-diagram-model={modelId}
    >
      <svg
        className={styles.cellDiagramFallback}
        viewBox="0 0 704 521"
        aria-hidden="true"
      >
        <g
          className={styles.frontPreviewFallback}
          transform="translate(0 16.808) scale(1.353846)"
        >
          <DiagramContents modelId={modelId} selectedId={selectedId} />
        </g>
      </svg>
      <FrontPreviewImage
        key={`${modelId}-${localReferencePreviewEnabled ? "local" : "release"}`}
        modelId={modelId}
        localReferencePreviewEnabled={localReferencePreviewEnabled}
      />
      <svg
        className={styles.cellDiagramOverlay}
        viewBox="0 0 704 521"
        aria-hidden="true"
      >
        <FrontPreviewOverlay
          modelId={modelId}
          selectedId={selectedId}
          localReferencePreviewEnabled={localReferencePreviewEnabled}
        />
      </svg>
    </div>
  );
}
