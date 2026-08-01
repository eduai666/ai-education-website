import Link from "next/link";
import { ReadingTimeNote } from "@/components/content/reading-time-note";
import { DocumentationShell } from "@/components/layout/documentation-shell";
import { getNavigationSection } from "@/config/routes";
import { getSiblingPages, type SitePageEntry } from "@/server/content/site-pages";

type SiteContentPageProps = {
  page: SitePageEntry;
};

export function SiteContentPage({ page }: SiteContentPageProps) {
  const Content = page.Content;
  const { previous, next } = getSiblingPages(page);
  const section = getNavigationSection(page.sectionId);

  return (
    <DocumentationShell
      activePath={page.path}
      sectionId={page.sectionId}
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: section.label, href: section.href },
        { label: page.navigationLabel },
      ]}
      sections={page.sections}
    >
      <article className="article-content content-document-page">
        <ReadingTimeNote value={page.readingTime} />

        <div className="markdown-document">
          <Content />
        </div>

        <nav className="content-pagination" aria-label="同类内容前后导航">
          {previous ? (
            <Link href={previous.path} className="content-pagination-previous">
              <span>上一篇</span>
              <strong>{previous.navigationLabel}</strong>
            </Link>
          ) : <span className="content-pagination-spacer" />}
          {next ? (
            <Link href={next.path} className="content-pagination-next">
              <span>下一篇</span>
              <strong>{next.navigationLabel}</strong>
            </Link>
          ) : (
            <Link href="/courses/ai-basics/ai-around-us" className="content-pagination-next">
              <span>继续学习</span>
              <strong>认识人工智能</strong>
            </Link>
          )}
        </nav>
      </article>
    </DocumentationShell>
  );
}
