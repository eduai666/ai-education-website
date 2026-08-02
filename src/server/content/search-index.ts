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
];
