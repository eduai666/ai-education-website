export type NavigationItem = {
  label: string;
  href: string;
  status?: "即将推出";
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    title: "网站介绍",
    items: [
      { label: "项目介绍", href: "/" },
      { label: "为什么需要 AI 素养教育", href: "/about/why-ai-literacy" },
      { label: "课程与学习路线", href: "/about/learning-map" },
      { label: "学习成果与项目愿景", href: "/about/vision" },
      { label: "政策与资料来源", href: "/about/sources" },
    ],
  },
  {
    title: "用户指南",
    items: [
      { label: "AI 学习指南", href: "/guides/ai-learning" },
      { label: "AI 创作指南", href: "/guides/ai-creating" },
      { label: "家长使用指南", href: "/guides/parents" },
      { label: "教师使用指南", href: "/guides/teachers" },
      { label: "学科应用案例", href: "/guides/subject-examples" },
    ],
  },
  {
    title: "AI 基础课程",
    items: [
      { label: "认识人工智能", href: "/courses/ai-basics/what-is-ai" },
      { label: "机器学习与深度学习", href: "/#course-plan", status: "即将推出" },
      { label: "大语言模型如何工作", href: "/#course-plan", status: "即将推出" },
      { label: "什么是智能体", href: "/#course-plan", status: "即将推出" },
      { label: "安全使用人工智能", href: "/#course-plan", status: "即将推出" },
    ],
  },
  {
    title: "实践项目",
    items: [
      { label: "AI 创作实验室", href: "/guides/ai-creating", status: "即将推出" },
      { label: "AI 学习实验室", href: "/guides/ai-learning", status: "即将推出" },
    ],
  },
  {
    title: "家长与教师专区",
    items: [
      { label: "家长专区", href: "/guides/parents", status: "即将推出" },
      { label: "教师专区", href: "/guides/teachers", status: "即将推出" },
    ],
  },
];
