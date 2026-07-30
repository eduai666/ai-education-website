import { DocumentationShell } from "@/components/layout/documentation-shell";
import { courseLessons, getAdjacentLessons, getLesson } from "@/server/content/courses";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type LessonPageProps = {
  params: Promise<{ chapter: string; lesson: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return courseLessons.map((lesson) => ({
    chapter: lesson.chapter,
    lesson: lesson.slug,
  }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { chapter, lesson: slug } = await params;
  const lesson = getLesson(chapter, slug);

  if (!lesson) return {};

  return {
    title: `${lesson.title}｜AI 基础教育`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { chapter, lesson: slug } = await params;
  const lesson = getLesson(chapter, slug);

  if (!lesson) notFound();

  const LessonContent = lesson.Content;
  const activePath = `/courses/${lesson.chapter}/${lesson.slug}`;
  const { previous, next } = getAdjacentLessons(lesson);
  const isMarkdownLesson = lesson.contentKind === "markdown";

  return (
    <DocumentationShell
      activePath={activePath}
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "AI 基础课程", href: "/#content-guide" },
        { label: lesson.title },
      ]}
      sections={lesson.sections}
    >
      <article className="article-content lesson-article">
        <header className="lesson-header">
          <div className="lesson-label-row">
            <span className="lesson-label">{lesson.chapterLabel}</span>
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <div className="lesson-meta" aria-label="课程信息">
            <span>{lesson.audience}</span>
            <span>{lesson.readingTime}</span>
            <span>{isMarkdownLesson ? "图文课程" : "包含互动与自测"}</span>
          </div>
        </header>

        <div className={isMarkdownLesson ? "lesson-prose markdown-document course-markdown-document" : "lesson-prose"}>
          <LessonContent />
        </div>

        <nav className="lesson-pagination" aria-label="课程前后导航">
          {previous ? (
            <Link href={`/courses/${previous.chapter}/${previous.slug}`} className="lesson-pagination-home">
              <span>上一课</span>
              <strong>{previous.title}</strong>
            </Link>
          ) : (
            <Link href="/" className="lesson-pagination-home">
              <span>返回</span>
              <strong>课程首页</strong>
            </Link>
          )}
          {next ? (
            <Link href={`/courses/${next.chapter}/${next.slug}`} className="lesson-pagination-next">
              <span>下一课</span>
              <strong>{next.title}</strong>
            </Link>
          ) : (
            <span className="lesson-pagination-next is-disabled" aria-disabled="true">
              <span>本轮学习完成</span>
              <strong>回到课程首页继续探索</strong>
            </span>
          )}
        </nav>
      </article>
    </DocumentationShell>
  );
}
