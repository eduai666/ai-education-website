import type { ComponentType } from "react";

import ProjectIntroduction from "../../../docs/markdown/网站介绍/00-项目介绍.md";
import WhyAiLiteracy from "../../../docs/markdown/网站介绍/01-为什么现在需要AI素养教育.md";
import LearningMap from "../../../docs/markdown/网站介绍/02-网站课程地图.md";
import ProjectVision from "../../../docs/markdown/网站介绍/09-学习成果与项目愿景.md";
import Sources from "../../../docs/markdown/网站介绍/10-政策与资料来源.md";
import AiLearningGuide from "../../../docs/markdown/用户指南/03-学生指南-AI赋能学习.md";
import AiCreatingGuide from "../../../docs/markdown/用户指南/04-学生指南-AI辅助创造.md";
import ParentGuide from "../../../docs/markdown/用户指南/05-家长指南.md";
import TeacherGuide from "../../../docs/markdown/用户指南/06-教师指南.md";
import SubjectExamples from "../../../docs/markdown/用户指南/07-教师学科应用案例.md";

export type SitePageSection = {
  id: string;
  label: string;
};

export type SitePageEntry = {
  collection: "about" | "guides";
  slug: string;
  path: string;
  navigationLabel: string;
  groupLabel: "网站介绍" | "用户指南";
  description: string;
  readingTime: string;
  sections: SitePageSection[];
  Content: ComponentType;
};

export const sitePages: SitePageEntry[] = [
  {
    collection: "about",
    slug: "project",
    path: "/",
    navigationLabel: "项目介绍",
    groupLabel: "网站介绍",
    description: "了解这个免费 AI 素养学习网站的目标、内容、服务人群与学习方式。",
    readingTime: "预计阅读 6 分钟",
    sections: [
      { id: "这是什么网站", label: "这是什么网站" },
      { id: "我们希望解决什么问题", label: "希望解决的问题" },
      { id: "网站将提供什么", label: "网站将提供什么" },
      { id: "网站面向谁", label: "网站面向谁" },
      { id: "我们相信的学习方式", label: "我们相信的学习方式" },
      { id: "我们的核心主张", label: "我们的核心主张" },
    ],
    Content: ProjectIntroduction,
  },
  {
    collection: "about",
    slug: "why-ai-literacy",
    path: "/about/why-ai-literacy",
    navigationLabel: "为什么需要 AI 素养教育",
    groupLabel: "网站介绍",
    description: "理解 AI 时代正在形成的新信息差，以及面向学生开展 AI 素养教育的长期价值。",
    readingTime: "预计阅读 7 分钟",
    sections: [
      { id: "一种新的信息差正在形成", label: "新的信息差" },
      { id: "ai-教育不是学习一个软件", label: "不只是学习软件" },
      { id: "人工智能已经不只是聊天软件", label: "不只是聊天软件" },
      { id: "教育方向正在从会使用走向有素养", label: "教育方向的变化" },
      { id: "家长和老师真正关心的长期价值", label: "长期价值" },
      { id: "为什么需要免费开放的学习资源", label: "为什么免费开放" },
    ],
    Content: WhyAiLiteracy,
  },
  {
    collection: "about",
    slug: "learning-map",
    path: "/about/learning-map",
    navigationLabel: "课程与学习路线",
    groupLabel: "网站介绍",
    description: "查看网站的课程设计原则、七个学习模块和三条推荐学习路径。",
    readingTime: "预计阅读 8 分钟",
    sections: [
      { id: "课程设计原则", label: "课程设计原则" },
      { id: "建议的七个学习模块", label: "七个学习模块" },
      { id: "一节课程的推荐结构", label: "课程结构" },
      { id: "三条学习路径", label: "三条学习路径" },
      { id: "网站内容的呈现形式", label: "内容呈现形式" },
      { id: "内容更新原则", label: "内容更新原则" },
    ],
    Content: LearningMap,
  },
  {
    collection: "about",
    slug: "vision",
    path: "/about/vision",
    navigationLabel: "学习成果与项目愿景",
    groupLabel: "网站介绍",
    description: "了解网站希望帮助学习者形成的能力、可以观察的成果和长期项目愿景。",
    readingTime: "预计阅读 6 分钟",
    sections: [
      { id: "我们希望孩子带走什么", label: "希望孩子带走什么" },
      { id: "可以观察到的学习成果", label: "可以观察的成果" },
      { id: "成果展示不只展示最好的一版", label: "怎样展示成果" },
      { id: "建议的成果记录格式", label: "成果记录格式" },
      { id: "我们不作出的承诺", label: "我们不作出的承诺" },
      { id: "一个免费入口也可以成为一次共同学习", label: "共同学习" },
    ],
    Content: ProjectVision,
  },
  {
    collection: "about",
    slug: "sources",
    path: "/about/sources",
    navigationLabel: "政策与资料来源",
    groupLabel: "网站介绍",
    description: "查看网站项目说明、课程设计和安全原则参考的政策及公开资料。",
    readingTime: "预计阅读 7 分钟",
    sections: [
      { id: "国家教育政策与指南", label: "国家教育政策" },
      { id: "北京市相关政策", label: "北京市相关政策" },
      { id: "人工智能基础与伦理参考", label: "基础与伦理参考" },
      { id: "内容使用说明", label: "内容使用说明" },
    ],
    Content: Sources,
  },
  {
    collection: "guides",
    slug: "ai-learning",
    path: "/guides/ai-learning",
    navigationLabel: "AI 学习指南",
    groupLabel: "用户指南",
    description: "学习怎样让 AI 提供解释、提示和反馈，同时保留独立思考与核验过程。",
    readingTime: "预计阅读 9 分钟",
    sections: [
      { id: "ai-可以怎样帮助学习", label: "AI 怎样帮助学习" },
      { id: "ai-学习六步闭环", label: "AI 学习六步闭环" },
      { id: "三种提问方式的区别", label: "三种提问方式" },
      { id: "怎样核验-ai-的回答", label: "怎样核验回答" },
      { id: "什么时候应该关闭-ai", label: "什么时候关闭 AI" },
      { id: "动手试一试", label: "动手试一试" },
    ],
    Content: AiLearningGuide,
  },
  {
    collection: "guides",
    slug: "ai-creating",
    path: "/guides/ai-creating",
    navigationLabel: "AI 创作指南",
    groupLabel: "用户指南",
    description: "从定义问题到测试迭代，学习用 AI 把想法逐步变成可以解释的作品。",
    readingTime: "预计阅读 9 分钟",
    sections: [
      { id: "vibe-coding-不等于一键完成", label: "不等于一键完成" },
      { id: "从想法到作品的六个步骤", label: "六个创作步骤" },
      { id: "可以从哪些小项目开始", label: "小项目建议" },
      { id: "传统编程仍然重要", label: "传统编程仍然重要" },
      { id: "作品复盘模板", label: "作品复盘模板" },
      { id: "课后挑战", label: "课后挑战" },
    ],
    Content: AiCreatingGuide,
  },
  {
    collection: "guides",
    slug: "parents",
    path: "/guides/parents",
    navigationLabel: "家长使用指南",
    groupLabel: "用户指南",
    description: "帮助家长理解怎样陪伴、怎样提问，以及怎样为孩子设置合理的 AI 使用边界。",
    readingTime: "预计阅读 9 分钟",
    sections: [
      { id: "家长可以从哪里开始", label: "家长从哪里开始" },
      { id: "家长不必追问用了多少次-ai", label: "关注真实变化" },
      { id: "家庭交流时可以怎样提问", label: "怎样和孩子交流" },
      { id: "建议共同遵守的家庭规则", label: "家庭共同规则" },
      { id: "面对两个极端态度", label: "避免两个极端" },
      { id: "不同年龄阶段的陪伴重点", label: "分年龄陪伴" },
      { id: "怎样判断学习是否真正发生", label: "判断学习是否发生" },
      { id: "家庭讨论任务", label: "家庭讨论任务" },
    ],
    Content: ParentGuide,
  },
  {
    collection: "guides",
    slug: "teachers",
    path: "/guides/teachers",
    navigationLabel: "教师使用指南",
    groupLabel: "用户指南",
    description: "把 AI 变成可以被提问、比较和纠错的学习对象，并用于真实课堂任务。",
    readingTime: "预计阅读 10 分钟",
    sections: [
      { id: "缩短教学变化与教研支持之间的时间差", label: "缩短教研时间差" },
      { id: "降低讲解-ai-知识的门槛", label: "降低讲解门槛" },
      { id: "面对学生已经开始使用-ai的现实", label: "面对使用现实" },
      { id: "可以直接采用的课堂任务", label: "课堂任务" },
      { id: "评价标准可以怎样变化", label: "评价标准" },
      { id: "教师使用-ai-时的边界", label: "教师使用边界" },
      { id: "网站希望为教师提供的不是另一套负担", label: "不是另一套负担" },
    ],
    Content: TeacherGuide,
  },
  {
    collection: "guides",
    slug: "subject-examples",
    path: "/guides/subject-examples",
    navigationLabel: "学科应用案例",
    groupLabel: "用户指南",
    description: "查看语文、数学、英语、物理等学科中可以直接改编的 AI 教学活动思路。",
    readingTime: "预计阅读 13 分钟",
    sections: [
      { id: "共同设计原则", label: "共同设计原则" },
      { id: "语文", label: "语文" },
      { id: "数学", label: "数学" },
      { id: "英语", label: "英语" },
      { id: "物理", label: "物理" },
      { id: "化学", label: "化学" },
      { id: "生物", label: "生物" },
      { id: "地理", label: "地理" },
      { id: "历史", label: "历史" },
      { id: "道德与法治", label: "道德与法治" },
      { id: "怎样把案例改成一节课", label: "改成一节课" },
    ],
    Content: SubjectExamples,
  },
];

export const projectIntroductionPage = sitePages[0];

export function getSitePage(collection: string, slug: string) {
  return sitePages.find((page) => page.collection === collection && page.slug === slug);
}

export function getSiblingPages(currentPage: SitePageEntry) {
  const siblings = sitePages.filter((page) => page.collection === currentPage.collection);
  const index = siblings.findIndex((page) => page.slug === currentPage.slug);

  return {
    previous: index > 0 ? siblings[index - 1] : undefined,
    next: index < siblings.length - 1 ? siblings[index + 1] : undefined,
  };
}
