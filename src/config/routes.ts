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
      { label: "15 分钟互动入门", href: "/courses/ai-basics/what-is-ai" },
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
        ],
      },
      {
        label: "第二单元 · 机器学习与深度学习",
        children: [
          { label: "章节导读", href: "/courses/machine-learning/introduction" },
          { label: "从规则到机器学习", href: "/courses/machine-learning/rules-to-machine-learning" },
          { label: "数据、特征、标签与学习方式", href: "/courses/machine-learning/data-features-labels" },
          { label: "神经网络如何计算", href: "/courses/machine-learning/neural-network-computation" },
          { label: "模型如何从错误中学习", href: "/courses/machine-learning/learning-from-errors" },
          { label: "深度与表示学习", href: "/courses/machine-learning/deep-representation-learning" },
          { label: "典型神经网络架构", href: "/courses/machine-learning/neural-network-architectures" },
          { label: "泛化、偏差与可靠评估", href: "/courses/machine-learning/generalization-and-evaluation" },
          { label: "动手实验与章节挑战", href: "/courses/machine-learning/hands-on-challenges" },
          { label: "术语表与参考资料", href: "/courses/machine-learning/glossary-and-resources" },
        ],
      },
      {
        label: "第三单元 · 大模型如何工作",
        children: [
          { label: "章节导读", href: "/courses/large-models/introduction" },
          { label: "什么是大模型", href: "/courses/large-models/what-are-large-models" },
          { label: "文字怎样变成 Token 与向量", href: "/courses/large-models/tokens-and-vectors" },
          { label: "注意力与 Transformer", href: "/courses/large-models/attention-and-transformer" },
          { label: "预测下一个 Token", href: "/courses/large-models/next-token-prediction" },
          { label: "从基础模型到 AI 助手", href: "/courses/large-models/from-base-model-to-assistant" },
          { label: "图片、视频与多模态生成", href: "/courses/large-models/multimodal-generation" },
          { label: "Agent、世界模型与具身智能", href: "/courses/large-models/agents-world-models-embodied-ai" },
          { label: "幻觉、偏差、资源与安全", href: "/courses/large-models/hallucination-bias-and-safety" },
          { label: "动手实验与章节挑战", href: "/courses/large-models/hands-on-challenges" },
          { label: "术语表与参考资料", href: "/courses/large-models/glossary-and-resources" },
        ],
      },
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
      { label: "第五单元 · 安全使用 AI", href: "/#course-plan", status: "即将推出" },
    ],
  },
  {
    title: "实践项目",
    icon: "flask",
    items: [
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
