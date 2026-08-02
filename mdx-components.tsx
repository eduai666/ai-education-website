import type { MDXComponents } from "mdx/types";
import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentPropsWithoutRef,
} from "react";

const markdownLinks: Record<string, string> = {
  "./10-政策与资料来源.md": "/about/sources",
  "./网站介绍/10-政策与资料来源.md": "/about/sources",
  "./07-教师学科应用案例.md": "/guides/subject-examples",
  "./01-从回答问题到完成任务.md": "/courses/agents/from-answers-to-tasks",
  "./02-智能体由什么组成.md": "/courses/agents/agent-components",
  "./03-智能体怎样一步步行动.md": "/courses/agents/agent-action-loop",
  "./04-跟着智能体完成一次任务.md": "/courses/agents/agent-task-walkthrough",
  "./05-智能体和固定工作流有什么不同.md": "/courses/agents/agents-vs-fixed-workflows",
  "./06-什么时候应该让智能体停下来.md": "/courses/agents/when-agents-should-stop",
  "./01-从规则到机器学习.md": "/courses/machine-learning/rules-to-machine-learning",
  "./02-数据特征标签与学习方式.md": "/courses/machine-learning/data-features-labels",
  "./03-神经网络如何计算.md": "/courses/machine-learning/neural-network-computation",
  "./04-模型如何从错误中学习.md": "/courses/machine-learning/learning-from-errors",
  "./05-深度与表示学习.md": "/courses/machine-learning/deep-representation-learning",
  "./06-典型神经网络架构.md": "/courses/machine-learning/neural-network-architectures",
  "./07-泛化偏差与可靠评估.md": "/courses/machine-learning/generalization-and-evaluation",
  "./08-动手实验与章节挑战.md": "/courses/machine-learning/hands-on-challenges",
  "./09-术语表与参考资料.md": "/courses/machine-learning/glossary-and-resources",
  "./01-什么是大模型.md": "/courses/large-models/what-are-large-models",
  "./02-文字怎样变成Token与向量.md": "/courses/large-models/tokens-and-vectors",
  "./03-注意力与Transformer.md": "/courses/large-models/attention-and-transformer",
  "./04-预测下一个Token.md": "/courses/large-models/next-token-prediction",
  "./05-从基础模型到AI助手.md": "/courses/large-models/from-base-model-to-assistant",
  "./06-图片视频与多模态生成.md": "/courses/large-models/multimodal-generation",
  "./07-Agent世界模型与具身智能.md": "/courses/large-models/agents-world-models-embodied-ai",
  "./08-幻觉偏差资源与安全边界.md": "/courses/large-models/hallucination-bias-and-safety",
  "./09-动手实验与章节挑战.md": "/courses/large-models/hands-on-challenges",
  "./10-术语表与参考资料.md": "/courses/large-models/glossary-and-resources",
};

function MarkdownLink({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  let decodedHref = href;

  try {
    decodedHref = decodeURI(href);
  } catch {
    // Keep the original URL when it is not a valid encoded URI.
  }

  const resolvedHref = markdownLinks[decodedHref] ?? href;
  const isExternal = resolvedHref.startsWith("http://") || resolvedHref.startsWith("https://");

  return (
    <a
      href={resolvedHref}
      {...props}
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

const alertLabels = {
  NOTE: "提示",
  TIP: "建议",
  IMPORTANT: "重要",
  WARNING: "注意",
  CAUTION: "警告",
  IMAGE: "图片需求",
} as const;

type AlertKind = keyof typeof alertLabels;

function MarkdownBlockquote({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"blockquote">) {
  const childNodes = Children.toArray(children);
  const firstParagraphIndex = childNodes.findIndex(
    (child) => isValidElement<ComponentPropsWithoutRef<"p">>(child) && child.type === "p",
  );
  const firstChild = childNodes[firstParagraphIndex];

  if (!isValidElement<ComponentPropsWithoutRef<"p">>(firstChild) || firstChild.type !== "p") {
    return <blockquote className={className} {...props}>{children}</blockquote>;
  }

  const paragraphNodes = Children.toArray(firstChild.props.children);
  const firstParagraphNode = paragraphNodes[0];

  if (typeof firstParagraphNode !== "string") {
    return <blockquote className={className} {...props}>{children}</blockquote>;
  }

  const marker = firstParagraphNode.match(
    /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|IMAGE)\][ \t]*(?:\r?\n)?/,
  );

  if (!marker) {
    return <blockquote className={className} {...props}>{children}</blockquote>;
  }

  const kind = marker[1] as AlertKind;
  const remainingText = firstParagraphNode.slice(marker[0].length);
  const remainingParagraphNodes = [
    ...(remainingText ? [remainingText] : []),
    ...paragraphNodes.slice(1),
  ];
  const alertClassName = [
    className,
    "markdown-alert",
    `markdown-alert-${kind.toLowerCase()}`,
  ].filter(Boolean).join(" ");

  return (
    <blockquote className={alertClassName} {...props}>
      <div className="markdown-alert-title">{alertLabels[kind]}</div>
      {childNodes.map((child, index) => (
        index === firstParagraphIndex
          ? cloneElement(firstChild, undefined, ...remainingParagraphNodes)
          : child
      ))}
    </blockquote>
  );
}

function MarkdownTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="markdown-table-scroll">
      <table {...props} />
    </div>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: MarkdownLink,
    blockquote: MarkdownBlockquote,
    table: MarkdownTable,
    ...components,
  };
}
