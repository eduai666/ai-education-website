import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

const markdownLinks: Record<string, string> = {
  "./10-政策与资料来源.md": "/about/sources",
  "./网站介绍/10-政策与资料来源.md": "/about/sources",
  "./07-教师学科应用案例.md": "/guides/subject-examples",
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

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: MarkdownLink,
    ...components,
  };
}
