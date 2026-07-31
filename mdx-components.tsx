import type { MDXComponents } from "mdx/types";
import { CourseFigure } from "@/components/content/course-figure";
import { AnswerReveal } from "@/components/content/lesson-blocks";
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

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: MarkdownLink,
    blockquote: MarkdownBlockquote,
    AnswerReveal,
    CourseFigure,
    ...components,
  };
}
