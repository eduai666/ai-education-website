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

export type NavigationSectionId =
  | "learning"
  | "courses"
  | "projects"
  | "educators"
  | "about";

export type NavigationSection = {
  id: NavigationSectionId;
  label: string;
  href: string;
  groups: NavigationGroup[];
};

export const navigationSections: NavigationSection[] = [
  {
    id: "learning",
    label: "学习路线",
    href: "/about/learning-map",
    groups: [
      {
        title: "学习路线",
        icon: "compass",
        items: [
          { label: "课程与学习路线", href: "/about/learning-map" },
          { label: "AI 学习指南", href: "/guides/ai-learning" },
          { label: "AI 创作指南", href: "/guides/ai-creating" },
        ],
      },
    ],
  },
  {
    id: "courses",
    label: "AI 基础",
    href: "/courses/ai-basics/ai-around-us",
    groups: [
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
              { label: "从 MLP 到 Transformer", href: "/courses/machine-learning/neural-network-architectures" },
              { label: "泛化、偏差与可靠评估", href: "/courses/machine-learning/generalization-and-evaluation" },
              { label: "动手实验与章节挑战", href: "/courses/machine-learning/hands-on-challenges" },
              { label: "术语表与参考资料", href: "/courses/machine-learning/glossary-and-resources" },
            ],
          },
          {
            label: "第三单元 · 大模型是如何工作的",
            children: [
              { label: "章节导读", href: "/courses/large-models/introduction" },
              { label: "什么是大模型", href: "/courses/large-models/what-are-large-models" },
              { label: "文字怎样变成 Token 与向量", href: "/courses/large-models/tokens-and-vectors" },
              { label: "注意力与 Transformer", href: "/courses/large-models/attention-and-transformer" },
              { label: "预测下一个 Token", href: "/courses/large-models/next-token-prediction" },
              { label: "从基础模型到 AI 助手", href: "/courses/large-models/from-base-model-to-assistant" },
              { label: "图片、视频与多模态生成", href: "/courses/large-models/multimodal-generation" },
              { label: "Agent、世界模型与具身智能", href: "/courses/large-models/agents-world-models-embodied-ai" },
              { label: "幻觉、偏差、资源与安全边界", href: "/courses/large-models/hallucination-bias-and-safety" },
              { label: "动手实验与章节挑战", href: "/courses/large-models/hands-on-challenges" },
              { label: "术语表、发展脉络与参考资料", href: "/courses/large-models/glossary-and-resources" },
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
          {
            label: "第五单元 · 如何将大模型接入到智能体",
            children: [
              { label: "Claude Code 桌面版接入 API", href: "/courses/model-to-agent/claude-code-desktop-api" },
              { label: "Codex 桌面版接入 API", href: "/courses/model-to-agent/codex-desktop-api" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "projects",
    label: "实践项目",
    href: "/projects/learn/cell-architecture",
    groups: [
      {
        title: "实践项目",
        icon: "flask",
        items: [
          { label: "细胞结构探索器", href: "/projects/learn/cell-architecture" },
          { label: "AI 创作实验室", status: "即将推出" },
          { label: "AI 学习实验室", status: "即将推出" },
        ],
      },
    ],
  },
  {
    id: "educators",
    label: "家长与教师",
    href: "/guides/parents",
    groups: [
      {
        title: "家长与教师",
        icon: "users",
        items: [
          { label: "家长使用指南", href: "/guides/parents" },
          { label: "教师使用指南", href: "/guides/teachers" },
          { label: "学科应用案例", href: "/guides/subject-examples" },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "关于项目",
    href: "/",
    groups: [
      {
        title: "关于项目",
        icon: "info",
        items: [
          { label: "项目介绍", href: "/" },
          { label: "为什么需要 AI 素养教育", href: "/about/why-ai-literacy" },
          { label: "学习成果与项目愿景", href: "/about/vision" },
          { label: "政策与资料来源", href: "/about/sources" },
        ],
      },
    ],
  },
];

export function getNavigationSection(sectionId: NavigationSectionId) {
  return navigationSections.find((section) => section.id === sectionId) ?? navigationSections[0];
}
