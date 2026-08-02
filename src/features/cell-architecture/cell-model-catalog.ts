export const CELL_MODEL_IDS = [
  "animal-cell",
  "plant-cell",
  "muscle-cell",
  "neuron",
  "bacteria-wall",
] as const;

export type CellModelId = (typeof CELL_MODEL_IDS)[number];

type CellModelTransform = {
  scale: number;
  rotation: readonly [number, number, number];
  position: readonly [number, number, number];
};

type CellModelGlbSource = {
  kind: "glb";
  assetUrl: string;
  assetBasePath: string;
  materialMode?: "studio" | "native";
  transform?: CellModelTransform;
};

type CellModelSource =
  | CellModelGlbSource
  | {
      kind: "procedural";
      builder: "plant-cell" | "muscle-cell";
      /*
       * This endpoint is deliberately gated by a server-only local flag and
       * reads from .local-assets/. It is never part of the default runtime.
       */
      localReference?: Omit<CellModelGlbSource, "kind">;
    };

export type CellModelDefinition = {
  id: CellModelId;
  name: string;
  subtitle: string;
  eyebrow: string;
  heading: string;
  shortDescription: string;
  description: string;
  courseRelationship: string;
  comparisonSteps: readonly [string, string, string];
  source: CellModelSource;
  interaction: "course-structures" | "whole-model";
  sceneBadge: string;
  transform: CellModelTransform;
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
      "先用固定正视图完成三个结构的课程观察；启动三维后，可用按钮和近似热点继续定位。",
    courseRelationship:
      "细胞膜、细胞核和线粒体的正式结构任务只在动物细胞课程模型中进行。",
    comparisonSteps: ["找到细胞膜", "定位细胞核", "比较线粒体的位置"],
    source: {
      kind: "glb",
      assetUrl: "/models/cell-architecture-studio/animal-cell-nih.glb",
      assetBasePath: "/models/cell-architecture-studio/",
    },
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
    id: "plant-cell",
    name: "植物细胞",
    subtitle: "真核细胞比较",
    eyebrow: "真核细胞 · 结构比较",
    heading: "植物细胞",
    shortDescription: "比较细胞壁、叶绿体与中央液泡",
    description:
      "这是典型绿色植物细胞的简化模型，用于比较细胞壁、叶绿体和中央液泡。并非所有植物细胞都有叶绿体，结构数量与比例也经过简化。",
    courseRelationship:
      "植物细胞与动物细胞都是真核细胞；这里先观察差异，不把新增结构混入下方动物细胞三结构题。",
    comparisonSteps: ["先找外层细胞壁", "辨认绿色叶绿体", "观察中央液泡占据的空间"],
    source: {
      kind: "procedural",
      builder: "plant-cell",
      localReference: {
        assetUrl:
          "/api/local-reference-cell-models/plant-cell-3d-model-tripo-v3.glb",
        assetBasePath: "/api/local-reference-cell-models/",
        materialMode: "native",
        transform: {
          scale: 2.58,
          rotation: [0.92, 0.18, -0.02],
          position: [0, 0, 0],
        },
      },
    },
    interaction: "whole-model",
    sceneBadge: "程序化模型 · 结构与比例均为示意",
    transform: {
      scale: 0.9,
      rotation: [0.1, -0.28, 0],
      position: [0, 0, 0],
    },
    palette: ["#83b86c", "#3c8f63", "#b7ded2", "#7b62b3", "#d69b58"],
    exposure: 1.08,
    performance: {
      bytes: 0,
      triangles: 14_100,
    },
  },
  {
    id: "muscle-cell",
    name: "肌肉细胞",
    subtitle: "骨骼肌纤维示例",
    eyebrow: "动物细胞 · 形态比较",
    heading: "骨骼肌细胞（肌纤维）",
    shortDescription: "观察长条形肌纤维、横纹与周边细胞核",
    description:
      "这里展示的是骨骼肌细胞，也常称肌纤维。它呈长条形，可见成束肌原纤维、横纹和位于周边的多个细胞核；不能代表心肌或平滑肌。",
    courseRelationship:
      "骨骼肌细胞也是动物细胞；这个形态比较标本帮助观察细胞特化，不参与下方三结构题。",
    comparisonSteps: ["沿长轴观察肌纤维", "寻找重复横纹", "留意靠近边缘的细胞核"],
    source: {
      kind: "procedural",
      builder: "muscle-cell",
      localReference: {
        assetUrl:
          "/api/local-reference-cell-models/muscle-cell-tripo-skeletal-fiber-textured-pbr.glb",
        assetBasePath: "/api/local-reference-cell-models/",
        materialMode: "native",
        transform: {
          scale: 4.12,
          rotation: [0.12, -0.34, -0.03],
          position: [0, 0, 0],
        },
      },
    },
    interaction: "whole-model",
    sceneBadge: "骨骼肌示意 · 不代表其他肌肉类型",
    transform: {
      scale: 1,
      rotation: [0.12, -0.22, -0.08],
      position: [0, 0, 0],
    },
    palette: ["#d47b7b", "#b85c69", "#f2b2a5", "#7f5a9d", "#e3a15e"],
    exposure: 1.1,
    performance: {
      bytes: 0,
      triangles: 3_864,
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
    courseRelationship:
      "神经元也是真核细胞；这个整体形态模型不承担细胞器定位，也不参与下方三结构题。",
    comparisonSteps: ["找到细胞体", "沿突起追踪方向", "转动模型观察分支"],
    source: {
      kind: "glb",
      assetUrl: "/models/cell-architecture-studio/neuron-nih.glb",
      assetBasePath: "/models/cell-architecture-studio/",
    },
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
    courseRelationship:
      "这是原核生物的外层结构比较标本。细菌没有细胞核和线粒体，不能套用动物细胞的三结构按钮。",
    comparisonSteps: ["看整体截面外形", "找连续的外层边界", "比较内外层的位置关系"],
    source: {
      kind: "glb",
      assetUrl: "/models/cell-architecture-studio/bacteria-wall-nih.glb",
      assetBasePath: "/models/cell-architecture-studio/",
    },
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
