import { getNavigationSection } from "@/config/routes";
import type { SiteSearchDocument } from "@/features/site-search/types";
import { courseLessons } from "@/server/content/courses";
import { sitePages } from "@/server/content/site-pages";

const courseSectionLabel = getNavigationSection("courses").label;

export const siteSearchDocuments: SiteSearchDocument[] = [
  ...courseLessons.map((lesson) => ({
    path: `/courses/${lesson.chapter}/${lesson.slug}`,
    title: lesson.title,
    description: lesson.description,
    sectionLabel: courseSectionLabel,
    sections: lesson.sections,
  })),
  ...sitePages.map((page) => ({
    path: page.path,
    title: page.navigationLabel,
    description: page.description,
    sectionLabel: getNavigationSection(page.sectionId).label,
    sections: page.sections,
  })),
  {
    path: "/projects/learn/cell-architecture",
    title: "细胞结构探索器",
    description:
      "观察动物细胞、植物细胞、骨骼肌细胞、神经元和细菌细胞壁，并核验 AI 提供的生物知识建议。",
    sectionLabel: getNavigationSection("projects").label,
    sections: [
      { id: "observe", label: "观察细胞" },
      { id: "facts", label: "核验事实" },
      { id: "challenge", label: "观察挑战" },
      { id: "ai-audit", label: "判断 AI 建议" },
      { id: "workflow", label: "学习流程" },
      { id: "sources", label: "来源与边界" },
    ],
  },
  {
    path: "/projects/learn/ai-knowledge-challenge",
    title: "AI 知识闯关小游戏",
    description:
      "通过 12 道均衡随机题复习认识人工智能、机器学习、大模型与智能体，并查看即时解析、单元报告和错题回顾。",
    sectionLabel: getNavigationSection("projects").label,
    sections: [{ id: "challenge", label: "开始知识闯关" }],
  },
  {
    path: "/projects/learn/ai-knowledge-challenge/tutorial",
    title: "用 Agent 制作 AI 知识闯关小游戏",
    description:
      "面向学生的 Agent 共创实践教程：拆解任务、编写提示词、逐步验收、测试修复并展示作品。",
    sectionLabel: getNavigationSection("projects").label,
    sections: [
      { id: "写提示词不是背提示词", label: "怎样写提示词" },
      { id: "第-1-阶段把想法变成项目任务卡", label: "制作任务卡" },
      { id: "第-3-阶段建立四单元准确题库", label: "建立准确题库" },
      { id: "第-11-阶段测试描述问题和要求局部修复", label: "测试与修复" },
      { id: "真实开发复盘第一版记录", label: "真实开发复盘" },
    ],
  },
];
