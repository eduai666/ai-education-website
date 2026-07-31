export type NavigationItem = {
  label: string;
  href?: string;
  status?: "即将推出";
  children?: NavigationItem[];
};

export type NavigationIconName = "info" | "compass" | "book" | "flask" | "users";

export type NavigationGroup = {
  title: string;
  icon: NavigationIconName;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    title: "网站介绍",
    icon: "info",
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
    icon: "compass",
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
    icon: "book",
    items: [
      {
        label: "第一单元 · 认识人工智能",
        children: [
          { label: "人工智能就在我们身边", href: "/courses/ai-basics/ai-around-us" },
          { label: "AI 系统怎样学习和给出结果", href: "/courses/ai-basics/how-ai-systems-learn" },
          { label: "大语言模型怎样生成回答", href: "/courses/ai-basics/how-language-models-generate" },
          { label: "上下文不是永久记忆", href: "/courses/ai-basics/context-and-memory" },
          { label: "模型怎样使用工具", href: "/courses/ai-basics/model-tool-use" },
          { label: "Agent 怎样完成多步任务", href: "/courses/ai-basics/agent-multi-step-tasks" },
          { label: "安全使用 AI 与人的责任", href: "/courses/ai-basics/responsible-ai-use" },
          { label: "怎样选择 AI 编程工具", href: "/courses/ai-basics/choosing-ai-coding-tools" },
          { label: "CLI 和桌面客户端有什么不同", href: "/courses/ai-basics/cli-vs-desktop-clients" },
          { label: "Claude Code 桌面版接入 API", href: "/courses/ai-basics/claude-code-desktop-api" },
          { label: "Codex 桌面版接入 API", href: "/courses/ai-basics/codex-desktop-api" },
        ],
      },
      { label: "第二单元 · 机器学习", href: "/about/learning-map", status: "即将推出" },
      { label: "第三单元 · 大语言模型", href: "/about/learning-map", status: "即将推出" },
      {
        label: "第四单元 · 什么是智能体",
        children: [
          { label: "单元导读", href: "/courses/agents/introduction" },
          { label: "从回答问题到完成任务", href: "/courses/agents/from-answers-to-tasks" },
          { label: "智能体由什么组成", href: "/courses/agents/agent-components" },
          { label: "智能体怎样一步步行动", href: "/courses/agents/agent-action-loop" },
          { label: "跟着智能体完成一次任务", href: "/courses/agents/agent-task-walkthrough" },
          { label: "智能体和固定工作流有什么不同", href: "/courses/agents/agents-vs-fixed-workflows" },
          { label: "什么时候应该让智能体停下来", href: "/courses/agents/when-agents-should-stop" },
        ],
      },
      { label: "第五单元 · 安全使用 AI", href: "/about/learning-map", status: "即将推出" },
    ],
  },
  {
    title: "实践项目",
    icon: "flask",
    items: [
      { label: "细胞结构探索器", href: "/projects/learn/cell-architecture" },
      { label: "AI 创作实验室", href: "/guides/ai-creating", status: "即将推出" },
      { label: "AI 学习实验室", href: "/guides/ai-learning", status: "即将推出" },
    ],
  },
  {
    title: "家长与教师专区",
    icon: "users",
    items: [
      { label: "家长专区", href: "/guides/parents", status: "即将推出" },
      { label: "教师专区", href: "/guides/teachers", status: "即将推出" },
    ],
  },
];
