import type { ComponentType } from "react";
import AiAroundUs from "../../../docs/markdown/01-认识人工智能/01-人工智能就在我们身边.md";
import HowAiLearnsAndResponds from "../../../docs/markdown/01-认识人工智能/02-AI系统怎样学习和给出结果.md";
import HowLanguageModelsGenerate from "../../../docs/markdown/01-认识人工智能/03-大语言模型怎样生成回答.md";
import ContextIsNotPermanentMemory from "../../../docs/markdown/01-认识人工智能/04-上下文不是永久记忆.md";
import HowModelsUseTools from "../../../docs/markdown/01-认识人工智能/05-模型怎样使用工具.md";
import HowAgentsCompleteMultiStepTasks from "../../../docs/markdown/01-认识人工智能/06-Agent怎样完成多步任务.md";
import SafeAiUseAndHumanResponsibility from "../../../docs/markdown/01-认识人工智能/07-安全使用AI与人的责任.md";
import ChoosingAiCodingTools from "../../../docs/markdown/01-认识人工智能/08-怎样选择AI编程工具.md";
import CliVsDesktopClients from "../../../docs/markdown/01-认识人工智能/09-CLI和桌面客户端有什么不同.md";
import ClaudeCodeDesktopApi from "../../../docs/markdown/01-认识人工智能/10-Windows桌面版ClaudeCode接入API.md";
import CodexDesktopApi from "../../../docs/markdown/01-认识人工智能/11-Windows桌面版Codex接入API.md";
import AgentsUnitIntroduction from "../../../docs/markdown/04-什么是智能体/00-单元导读.md";
import FromAnswersToTasks from "../../../docs/markdown/04-什么是智能体/01-从回答问题到完成任务.md";
import AgentComponents from "../../../docs/markdown/04-什么是智能体/02-智能体由什么组成.md";
import HowAgentsActStepByStep from "../../../docs/markdown/04-什么是智能体/03-智能体怎样一步步行动.md";
import AgentTaskWalkthrough from "../../../docs/markdown/04-什么是智能体/04-跟着智能体完成一次任务.md";
import AgentsVsFixedWorkflows from "../../../docs/markdown/04-什么是智能体/05-智能体和固定工作流有什么不同.md";
import WhenAgentsShouldStop from "../../../docs/markdown/04-什么是智能体/06-什么时候应该让智能体停下来.md";
import type { LessonEntry } from "./course-types";
import { largeModelLessons } from "./large-model-lessons";
import { machineLearningLessons } from "./machine-learning-lessons";

export type LessonSection = {
  id: string;
  label: string;
};

export type LessonMeta = {
  chapter: string;
  slug: string;
  contentKind?: "markdown";
  chapterLabel?: string;
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
    slug: "ai-around-us",
    contentKind: "markdown",
    title: "人工智能就在我们身边",
    description: "从生活中的推荐、识别与自动功能出发，辨别规则、触发与人工智能推断。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 8—10 分钟",
    sections: [
      { id: "先看整个单元", label: "先看整个单元" },
      { id: "会自动工作不一定用了-ai", label: "会自动工作，不一定用了 AI" },
      { id: "抓住三个词规则触发推断", label: "抓住三个词：规则、触发、推断" },
      { id: "判断一个功能时问得更具体", label: "判断一个功能时，问得更具体" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: AiAroundUs,
  },
  {
    chapter: "ai-basics",
    slug: "how-ai-systems-learn",
    contentKind: "markdown",
    title: "AI 系统怎样学习和给出结果",
    description: "用“输入—模型—输出—核验”理解人工智能的基本路线，以及训练、数据和使用的关系。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 8—10 分钟",
    sections: [
      { id: "最基本的路线输入模型输出核验", label: "最基本的路线：输入—模型—输出—核验" },
      { id: "训练模型和使用模型是两件事", label: "训练模型和使用模型，是两件事" },
      { id: "数据会影响模型学到什么", label: "数据会影响模型学到什么" },
      { id: "大语言模型只是-ai-的一种", label: "大语言模型只是 AI 的一种" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: HowAiLearnsAndResponds,
  },
  {
    chapter: "ai-basics",
    slug: "how-language-models-generate",
    contentKind: "markdown",
    title: "大语言模型怎样生成回答",
    description: "理解 Token 与下一个 Token 预测，认识回答为何变化，以及语言流畅为什么不等于事实正确。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 10—12 分钟",
    sections: [
      { id: "核心原理先压成一句话", label: "核心原理先压成一句话" },
      { id: "token模型处理内容的小单位", label: "Token：模型处理内容的小单位" },
      { id: "模型不是只看紧挨着的一个字", label: "模型不是只看紧挨着的一个字" },
      { id: "预测下一个-token", label: "预测下一个 Token" },
      { id: "只会预测为什么还能完成复杂任务", label: "只会预测，为什么还能完成复杂任务" },
      { id: "为什么同一个问题回答会变化", label: "为什么同一个问题，回答会变化" },
      { id: "说得顺不等于说得对", label: "说得顺，不等于说得对" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: HowLanguageModelsGenerate,
  },
  {
    chapter: "ai-basics",
    slug: "context-and-memory",
    contentKind: "markdown",
    title: "上下文不是永久记忆",
    description: "区分上下文、训练与记忆，理解消息作用、上下文窗口及其能力与安全边界。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 10—12 分钟",
    sections: [
      { id: "上下文像此刻摆在桌面上的资料", label: "上下文像此刻摆在桌面上的资料" },
      { id: "不同消息承担不同作用", label: "不同消息承担不同作用" },
      { id: "提示工程和上下文工程有什么不同", label: "提示工程和上下文工程有什么不同" },
      { id: "指令会影响回答但不是安全护墙", label: "指令会影响回答，但不是安全护墙" },
      { id: "上下文窗口有容量限制", label: "上下文窗口有容量限制" },
      { id: "训练上下文和记忆是三件事", label: "训练、上下文和记忆是三件事" },
      { id: "上下文也会出错", label: "上下文也会出错" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: ContextIsNotPermanentMemory,
  },
  {
    chapter: "ai-basics",
    slug: "model-tool-use",
    contentKind: "markdown",
    title: "模型怎样使用工具",
    description: "了解模型如何调用工具获取实时信息或执行操作，以及权限与失败检查为何重要。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 10—12 分钟",
    sections: [
      { id: "模型不会凭空看到实时世界", label: "模型不会凭空看到实时世界" },
      { id: "tool-use-和-function-calling-是什么", label: "Tool Use 和 Function Calling 是什么" },
      { id: "一次工具调用发生了什么", label: "一次工具调用发生了什么" },
      { id: "工具和行动不是一回事", label: "工具和行动不是一回事" },
      { id: "工具也会失败", label: "工具也会失败" },
      { id: "为什么一定要检查权限", label: "为什么一定要检查权限" },
      { id: "顺便认识-mcp", label: "顺便认识 MCP" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: HowModelsUseTools,
  },
  {
    chapter: "ai-basics",
    slug: "agent-multi-step-tasks",
    contentKind: "markdown",
    title: "Agent 怎样完成多步任务",
    description: "用多步任务理解 Agent 的组成、计划、行动循环、停止条件和固定工作流的区别。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 12—15 分钟",
    sections: [
      { id: "先看一个完整任务", label: "先看一个完整任务" },
      { id: "什么是-agent", label: "什么是 Agent" },
      { id: "先用三个问题看清-agent", label: "先用三个问题看清 Agent" },
      { id: "一个-agent-要组织哪些部分", label: "一个 Agent 要组织哪些部分" },
      { id: "复杂任务要先拆开但计划不能写死", label: "复杂任务要先拆开，但计划不能写死" },
      { id: "核心循环观察判断行动检查", label: "核心循环：观察—判断—行动—检查" },
      { id: "跟着科学馆任务走两轮", label: "跟着科学馆任务走两轮" },
      { id: "agent-必须知道什么时候停", label: "Agent 必须知道什么时候停" },
      { id: "agent-和固定工作流各有用处", label: "Agent 和固定工作流各有用处" },
      { id: "这些拓展词先认识", label: "这些拓展词先认识" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: HowAgentsCompleteMultiStepTasks,
  },
  {
    chapter: "ai-basics",
    slug: "responsible-ai-use",
    contentKind: "markdown",
    title: "安全使用 AI 与人的责任",
    description: "认识人工智能的能力边界与错误链，学习核验、隐私、权限、公平和责任原则。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 12—15 分钟",
    sections: [
      { id: "ai-擅长什么也不擅长什么", label: "AI 擅长什么，也不擅长什么" },
      { id: "错误可能从一条链上进入", label: "错误可能从一条链上进入" },
      { id: "把五条安全线留给自己", label: "把五条安全线留给自己" },
      { id: "透明不是公开模型的隐藏思维", label: "透明不是公开模型的隐藏思维" },
      { id: "有记录也不等于做对了", label: "有记录，也不等于做对了" },
      { id: "学生最容易执行的三步", label: "学生最容易执行的三步" },
      { id: "还要注意公平与作品来源", label: "还要注意公平与作品来源" },
      { id: "安全不是上线前检查一次就结束", label: "安全不是上线前检查一次就结束" },
      { id: "会说我不等于拥有人的意识", label: "会说“我”，不等于拥有人的意识" },
      { id: "回看整个单元", label: "回看整个单元" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: SafeAiUseAndHumanResponsibility,
  },
  ...machineLearningLessons,
  ...largeModelLessons,
  {
    chapter: "ai-basics",
    slug: "choosing-ai-coding-tools",
    contentKind: "markdown",
    title: "怎样选择 AI 编程工具",
    description: "从任务规模、操作入口、接口兼容、权限和成本出发，为不同的编程任务选择合适的 AI 工具。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 10—12 分钟",
    sections: [
      { id: "先看它要替你做多少事", label: "先看它要替你做多少事" },
      { id: "常见工具其实就这几类", label: "常见工具其实就这几类" },
      { id: "客户端模型和-api-不是一回事", label: "客户端、模型和 API 不是一回事" },
      { id: "codex-和-claude-code-选哪个", label: "Codex 和 Claude Code 选哪个" },
      { id: "为什么后面先讲桌面版", label: "为什么后面先讲桌面版" },
      { id: "接入前先问自己六个问题", label: "接入前，先问自己六个问题" },
      { id: "现在选一次", label: "现在选一次" },
      { id: "记住这条选择顺序", label: "记住这条选择顺序" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: ChoosingAiCodingTools,
  },
  {
    chapter: "ai-basics",
    slug: "cli-vs-desktop-clients",
    contentKind: "markdown",
    title: "CLI 和桌面客户端，到底有什么不同",
    description: "比较 CLI 与桌面客户端的操作方式、审查体验和适用场景，学会根据任务选择合适的入口。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 12—15 分钟",
    sections: [
      { id: "先把三个容易混的名字分开", label: "先把三个容易混的名字分开" },
      { id: "同一个任务两种入口怎样完成", label: "同一个任务，两种入口怎样完成" },
      { id: "真正的差别在这里", label: "真正的差别在这里" },
      { id: "同一个产品不代表所有地方完全一样", label: "同一个产品，不代表所有地方完全一样" },
      { id: "桌面端不等于更安全cli-也不等于更强", label: "桌面端不等于更安全，CLI 也不等于更强" },
      { id: "一分钟决定用哪个", label: "一分钟决定用哪个" },
      { id: "你会怎样选", label: "你会怎样选" },
      { id: "怎么选记住这一句就够了", label: "怎么选，记住这一句就够了" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: CliVsDesktopClients,
  },
  {
    chapter: "ai-basics",
    slug: "claude-code-desktop-api",
    contentKind: "markdown",
    title: "Windows Claude Desktop 接入 DeepSeek API",
    description: "在 Windows Claude Desktop 的第三方推理窗口中配置 DeepSeek 官方 Anthropic API，并完成测试、重启和安全验证。",
    audience: "适合家长、教师与有监护人陪同的学生",
    readingTime: "预计学习 30—35 分钟",
    sections: [
      { id: "开始前说明", label: "开始前说明" },
      { id: "这条连接到底连了什么", label: "这条连接到底连了什么" },
      { id: "阶段一安装并打开第三方推理配置", label: "阶段一：打开配置入口" },
      { id: "阶段二连接-deepseek-并完成鉴权", label: "阶段二：连接 DeepSeek" },
      { id: "阶段三配置模型并验证连接", label: "阶段三：配置并验证" },
      { id: "deepseek-接入后的能力边界", label: "DeepSeek 接入后的能力边界" },
      { id: "常见问题", label: "常见问题" },
      { id: "连上之后先别碰重要项目", label: "连上之后，先别碰重要项目" },
      { id: "检查理解", label: "检查理解" },
      { id: "最后记住这几件事", label: "最后记住这几件事" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: ClaudeCodeDesktopApi,
  },
  {
    chapter: "ai-basics",
    slug: "codex-desktop-api",
    contentKind: "markdown",
    title: "Windows 桌面版 Codex 怎样接入 API",
    description: "为 Windows 桌面版 Codex 配置 DeepSeek 或 Responses API 中转站，并重点排查连接超时和接口兼容问题。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 25—30 分钟",
    sections: [
      { id: "先看接口别急着填-key", label: "先看接口，别急着填 Key" },
      { id: "准备-key-和练习文件夹", label: "准备 Key 和练习文件夹" },
      { id: "第一步找到真正生效的配置文件", label: "第一步：找到真正生效的配置文件" },
      { id: "第二步用-windows-用户变量保存-key", label: "第二步：用 Windows 用户变量保存 Key" },
      { id: "第三步填写-deepseek-配置", label: "第三步：填写 DeepSeek 配置" },
      { id: "第四步完全重启并做只读验证", label: "第四步：完全重启并做只读验证" },
      { id: "连接其他中转站", label: "连接其他中转站" },
      { id: "重点排查为什么-codex-会连接超时", label: "重点排查：为什么 Codex 会连接超时" },
      { id: "最快的排查顺序", label: "最快的排查顺序" },
      { id: "权限和-api-连接是两回事", label: "权限和 API 连接是两回事" },
      { id: "检查理解", label: "检查理解" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: CodexDesktopApi,
  },
  {
    chapter: "agents",
    slug: "introduction",
    contentKind: "markdown",
    title: "什么是智能体：单元导读",
    description: "了解智能体单元的六个核心问题、学习顺序、能力目标和贯穿案例。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 8—10 分钟",
    sections: [
      { id: "这个单元回答六个问题", label: "这个单元回答六个问题" },
      { id: "为什么按这个顺序学", label: "为什么按这个顺序学" },
      { id: "学完这个单元你将能够", label: "学完这个单元，你将能够" },
      { id: "学习前先试一试", label: "学习前先试一试" },
      { id: "关于贯穿案例", label: "关于贯穿案例" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: AgentsUnitIntroduction,
  },
  {
    chapter: "agents",
    slug: "from-answers-to-tasks",
    contentKind: "markdown",
    title: "从回答问题到完成任务",
    description: "从一次回答与多步任务的区别出发，理解智能体如何围绕目标继续行动并适时停止。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 8—10 分钟",
    sections: [
      { id: "先看两种请求", label: "先看两种请求" },
      { id: "智能体是一套系统", label: "智能体是一套系统" },
      { id: "行动不一定是移动东西", label: "“行动”不一定是移动东西" },
      { id: "会判断不代表它有意识", label: "“会判断”不代表它有意识" },
      { id: "想一想", label: "想一想" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: FromAnswersToTasks,
  },
  {
    chapter: "agents",
    slug: "agent-components",
    contentKind: "markdown",
    title: "智能体由什么组成",
    description: "拆解智能体的环境、目标、限制、状态、模型、工具与负责把关的控制程序。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 15—18 分钟",
    sections: [
      { id: "先看完整结构", label: "先看完整结构" },
      { id: "工作环境接入方式和权限共同决定能力", label: "工作环境、接入方式和权限共同决定能力" },
      { id: "目标与限制说明方向", label: "目标与限制说明方向" },
      { id: "任务状态告诉系统进行到哪里", label: "任务状态告诉系统进行到哪里" },
      { id: "模型负责提出下一步", label: "模型负责提出下一步" },
      { id: "工具负责真正查询计算或操作", label: "工具负责真正查询、计算或操作" },
      { id: "控制程序负责连接和把关", label: "控制程序负责连接和把关" },
      { id: "跟着一次工具调用走", label: "跟着一次工具调用走" },
      { id: "想一想", label: "想一想" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: AgentComponents,
  },
  {
    chapter: "agents",
    slug: "agent-action-loop",
    contentKind: "markdown",
    title: "智能体怎样一步步行动",
    description: "理解“观察—判断—行动—检查”循环，以及任务拆分、局部重规划和停止条件。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 10—12 分钟",
    sections: [
      { id: "开始行动前先说清目标和限制", label: "开始行动前，先说清目标和限制" },
      { id: "把大任务拆成可以检查的小步骤", label: "把大任务拆成可以检查的小步骤" },
      { id: "一轮行动包含四个环节", label: "一轮行动包含四个环节" },
      { id: "重新规划时只改受影响的部分", label: "重新规划时，只改受影响的部分" },
      { id: "开始前就说明什么时候会停止", label: "开始前就说明什么时候会停止" },
      { id: "检查理解哪一步出了问题", label: "检查理解：哪一步出了问题" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: HowAgentsActStepByStep,
  },
  {
    chapter: "agents",
    slug: "agent-task-walkthrough",
    contentKind: "markdown",
    title: "跟着智能体完成一次任务",
    description: "跟随科学馆出行案例，观察智能体如何核对信息、调整计划、记录过程并按边界交接。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 15—18 分钟",
    sections: [
      { id: "先读懂任务", label: "先读懂任务" },
      { id: "第一轮核对开放与预约信息", label: "第一轮：核对开放与预约信息" },
      { id: "第二轮安排往返路线和时间", label: "第二轮：安排往返路线和时间" },
      { id: "第三轮天气变化后局部调整", label: "第三轮：天气变化后局部调整" },
      { id: "第四轮按任务边界完成并交接", label: "第四轮：按任务边界完成并交接" },
      { id: "看看任务记录怎样变化", label: "看看任务记录怎样变化" },
      { id: "最后交付什么", label: "最后交付什么" },
      { id: "迁移练习把返回时间提前", label: "迁移练习：把返回时间提前" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: AgentTaskWalkthrough,
  },
  {
    chapter: "agents",
    slug: "agents-vs-fixed-workflows",
    contentKind: "markdown",
    title: "智能体和固定工作流有什么不同",
    description: "比较聊天模型、工具调用、固定工作流与智能体，学会按任务选择合适的自动化程度。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 10—12 分钟",
    sections: [
      { id: "智能体不一定更好", label: "智能体不一定更好" },
      { id: "四个经常一起出现的概念", label: "四个经常一起出现的概念" },
      { id: "放在一起比较", label: "放在一起比较" },
      { id: "自主程度更像一条光谱", label: "自主程度更像一条光谱" },
      { id: "混合方式往往更合适", label: "混合方式往往更合适" },
      { id: "怎样选择", label: "怎样选择" },
      { id: "检查理解", label: "检查理解" },
      { id: "本课小结", label: "本课小结" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: AgentsVsFixedWorkflows,
  },
  {
    chapter: "agents",
    slug: "when-agents-should-stop",
    contentKind: "markdown",
    title: "什么时候应该让智能体停下来",
    description: "识别智能体应停止的情况，理解权限限制、网页指令风险、安全收尾和人工确认。",
    audience: "建议年龄 10—14 岁",
    readingTime: "预计学习 12—15 分钟",
    sections: [
      { id: "停下来也是正确的行动", label: "停下来也是正确的行动" },
      { id: "智能体为什么会跑偏", label: "智能体为什么会跑偏" },
      { id: "网页是资料不是新的命令", label: "网页是资料，不是新的命令" },
      { id: "先限制权限再谈记住规则", label: "先限制权限，再谈“记住规则”" },
      { id: "停止不只有一种结果", label: "停止不只有一种结果" },
      { id: "七种应该触发停止的情况", label: "七种应该触发停止的情况" },
      { id: "失败以后怎样安全收尾", label: "失败以后怎样安全收尾" },
      { id: "有现实后果的动作先确认", label: "有现实后果的动作先确认" },
      { id: "你应该看得见也能随时喊停", label: "你应该看得见，也能随时喊停" },
      { id: "单元综合练习查找机器人社团活动", label: "单元综合练习：查找机器人社团活动" },
      { id: "本课小结", label: "本课小结" },
      { id: "用四个问题检查一个智能体", label: "用四个问题检查一个智能体" },
      { id: "参考资料", label: "参考资料" },
    ],
    Content: WhenAgentsShouldStop,
  },
];

export function getLesson(chapter: string, slug: string) {
  return courseLessons.find((lesson) => lesson.chapter === chapter && lesson.slug === slug);
}

export function getAdjacentLessons(currentLesson: LessonEntry) {
  const index = courseLessons.findIndex((lesson) => lesson === currentLesson);

  return {
    previous: index > 0 ? courseLessons[index - 1] : undefined,
    next: index < courseLessons.length - 1 ? courseLessons[index + 1] : undefined,
  };
}
