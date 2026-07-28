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
    title: "开始学习",
    items: [
      { label: "网站首页", href: "/" },
      { label: "学习路线", href: "/#learning-path" },
      { label: "课程目录", href: "/#content-guide" },
    ],
  },
  {
    title: "AI 基础课程",
    items: [
      { label: "认识人工智能", href: "/courses/ai-basics/what-is-ai" },
      { label: "机器学习与深度学习", href: "/#content-guide", status: "即将推出" },
      { label: "大语言模型如何工作", href: "/#content-guide", status: "即将推出" },
      { label: "什么是智能体", href: "/#content-guide", status: "即将推出" },
      { label: "安全使用人工智能", href: "/#content-guide", status: "即将推出" },
    ],
  },
  {
    title: "实践项目",
    items: [
      { label: "AI 创作实验室", href: "/#content-guide", status: "即将推出" },
      { label: "AI 学习实验室", href: "/#content-guide", status: "即将推出" },
    ],
  },
  {
    title: "学习成果",
    items: [
      { label: "学生成果", href: "/#content-guide", status: "即将推出" },
      { label: "学习复盘", href: "/#content-guide", status: "即将推出" },
    ],
  },
  {
    title: "家长与安全",
    items: [
      { label: "家长专区", href: "/#content-guide", status: "即将推出" },
      { label: "隐私保护", href: "/#content-guide", status: "即将推出" },
      { label: "未成年人保护", href: "/#content-guide", status: "即将推出" },
    ],
  },
];
