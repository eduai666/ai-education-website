import type { ComponentType } from "react";
import WhatIsAiLesson from "../../../content/courses/01-ai-basics/01-what-is-ai.mdx";

export type LessonSection = {
  id: string;
  label: string;
};

export type LessonMeta = {
  chapter: string;
  slug: string;
  chapterLabel: string;
  title: string;
  description: string;
  audience: string;
  readingTime: string;
  sections: LessonSection[];
};

export type LessonEntry = LessonMeta & {
  Content: ComponentType;
};

export const courseLessons: LessonEntry[] = [
  {
    chapter: "ai-basics",
    slug: "what-is-ai",
    chapterLabel: "AI 基础课程 · 第一章",
    title: "认识人工智能",
    description: "从熟悉的生活场景出发，认识人工智能的基本特点，学会区分人工智能、自动化和普通程序。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 15 分钟",
    sections: [
      { id: "learning-goals", label: "本课目标" },
      { id: "observe-ai", label: "从身边观察人工智能" },
      { id: "what-is-ai", label: "人工智能是什么" },
      { id: "ai-or-automation", label: "AI、自动化与普通程序" },
      { id: "how-ai-works", label: "人工智能怎样完成任务" },
      { id: "classification-lab", label: "动手试一试" },
      { id: "limits-and-safety", label: "能力、限制与安全" },
      { id: "check-understanding", label: "检查理解" },
      { id: "lesson-summary", label: "本课小结" },
      { id: "sources", label: "参考资料" },
    ],
    Content: WhatIsAiLesson,
  },
];

export function getLesson(chapter: string, slug: string) {
  return courseLessons.find((lesson) => lesson.chapter === chapter && lesson.slug === slug);
}
