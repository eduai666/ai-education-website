export const CELL_MODEL_IDS = [
  "animal-cell",
  "neuron",
  "bacteria-wall",
] as const;

export type CellModelId = (typeof CELL_MODEL_IDS)[number];

export type CellModelDefinition = {
  id: CellModelId;
  name: string;
  subtitle: string;
  eyebrow: string;
  heading: string;
  shortDescription: string;
  description: string;
  comparisonSteps: readonly [string, string, string];
  assetUrl: string;
  assetBasePath: string;
  interaction: "course-structures" | "whole-model";
  sceneBadge: string;
  transform: {
    scale: number;
    rotation: readonly [number, number, number];
    position: readonly [number, number, number];
  };
  palette: readonly [string, string, string, string, string];
  exposure: number;
  performance: {
    bytes: number;
    triangles: number;
  };
};

/*
 * This module deliberately contains only serializable data. The explorer can
 * render the model shelf without pulling Three.js or GLTFLoader into the
 * initial client bundle; those libraries are still imported only after a
 * learner explicitly opens a 3D specimen.
 */
export const CELL_MODEL_CATALOG = [
  {
    id: "animal-cell",
    name: "动物细胞",
    subtitle: "课程模型",
    eyebrow: "真核细胞",
    heading: "动物细胞",
    shortDescription: "细胞膜、细胞核与线粒体",
    description:
      "先用二维图完成三个结构的课程观察；启动三维后，可用按钮和近似热点继续定位。",
    comparisonSteps: ["找到细胞膜", "定位细胞核", "比较线粒体的位置"],
    assetUrl: "/models/cell-architecture-studio/animal-cell-nih.glb",
    assetBasePath: "/models/cell-architecture-studio/",
    interaction: "course-structures",
    sceneBadge: "白色光环表示当前选择",
    transform: {
      scale: 0.044,
      rotation: [0.24, -0.08, 0.03],
      position: [0, -0.03, 0],
    },
    palette: ["#9db6dc", "#9b74b7", "#cf6f42", "#7a49b0", "#d49057"],
    exposure: 1.12,
    performance: {
      bytes: 1_526_232,
      triangles: 84_906,
    },
  },
  {
    id: "neuron",
    name: "神经元",
    subtitle: "形态比较",
    eyebrow: "真核细胞 · 形态比较",
    heading: "神经元",
    shortDescription: "观察细胞体与长而分支的突起",
    description:
      "神经元也是真核细胞；这个整体形态标本用于观察细胞体和突起，不承担细胞器定位，也不参与下方动物细胞三结构题。",
    comparisonSteps: ["找到细胞体", "沿突起追踪方向", "转动模型观察分支"],
    assetUrl: "/models/cell-architecture-studio/neuron-nih.glb",
    assetBasePath: "/models/cell-architecture-studio/",
    interaction: "whole-model",
    sceneBadge: "自由观察 · 暂无结构热点",
    transform: {
      scale: 3.15,
      rotation: [0.18, -0.24, -0.18],
      position: [0, 0.05, 0],
    },
    palette: ["#8c91d0", "#6578b5", "#aaa4dc", "#cb8fbd", "#7187c8"],
    exposure: 1.05,
    performance: {
      bytes: 2_885_524,
      triangles: 160_256,
    },
  },
  {
    id: "bacteria-wall",
    name: "细菌细胞壁",
    subtitle: "原核比较",
    eyebrow: "原核生物 · 外层结构",
    heading: "细菌细胞壁截面",
    shortDescription: "观察革兰阳性菌细胞壁的分层截面",
    description:
      "这是原核生物的外层结构比较标本，不是一颗完整细菌。细菌没有细胞核和线粒体，不能套用动物细胞的三结构按钮，也不参与下方三结构题。",
    comparisonSteps: ["看整体截面外形", "找连续的外层边界", "比较内外层的位置关系"],
    assetUrl: "/models/cell-architecture-studio/bacteria-wall-nih.glb",
    assetBasePath: "/models/cell-architecture-studio/",
    interaction: "whole-model",
    sceneBadge: "自由观察 · 暂无结构热点",
    transform: {
      scale: 0.00185,
      rotation: [0.08, -0.44, -0.08],
      position: [0, -0.1, 0],
    },
    palette: ["#65b8ae", "#48a77d", "#93c9a9", "#d3b06e", "#8d76b8"],
    exposure: 1.1,
    performance: {
      bytes: 482_424,
      triangles: 25_542,
    },
  },
] as const satisfies readonly CellModelDefinition[];

export const CELL_MODEL_BY_ID = Object.fromEntries(
  CELL_MODEL_CATALOG.map((model) => [model.id, model]),
) as Record<CellModelId, (typeof CELL_MODEL_CATALOG)[number]>;

export function getCellModelDefinition(modelId: CellModelId) {
  return CELL_MODEL_BY_ID[modelId];
}
