import { DocumentationShell } from "@/components/layout/documentation-shell";
import { ReadingTimeNote } from "@/components/content/reading-time-note";
import { courseLessons, getAdjacentLessons, getLesson } from "@/server/content/courses";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type LessonPageProps = {
  params: Promise<{ chapter: string; lesson: string }>;
};

function PaginationChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="lesson-pagination-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

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
      sectionId="courses"
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "AI 基础课程", href: "/about/learning-map" },
        { label: lesson.title },
      ]}
      sections={lesson.sections}
    >
      <article className="article-content lesson-article">
        <ReadingTimeNote value={lesson.readingTime} />

        <header className="lesson-header">
          {lesson.chapterLabel ? (
            <div className="lesson-label-row">
              <span className="lesson-label">{lesson.chapterLabel}</span>
            </div>
          ) : null}
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <div className="lesson-meta" aria-label="课程信息">
            <span>{lesson.audience}</span>
            <span>{isMarkdownLesson ? "图文课程" : "包含互动与自测"}</span>
          </div>
        </header>

        <div className={isMarkdownLesson ? "lesson-prose markdown-document course-markdown-document" : "lesson-prose"}>
          <LessonContent />
        </div>

        <nav className="lesson-pagination" aria-label="课程前后导航">
          {previous ? (
            <Link
              href={`/courses/${previous.chapter}/${previous.slug}`}
              className="lesson-pagination-home"
              rel="prev"
            >
              <span className="lesson-pagination-kicker">
                <PaginationChevron direction="left" />
                <span>上一课</span>
              </span>
              <strong>{previous.title}</strong>
            </Link>
          ) : (
            <Link href="/" className="lesson-pagination-home">
              <span className="lesson-pagination-kicker">
                <PaginationChevron direction="left" />
                <span>返回</span>
              </span>
              <strong>课程首页</strong>
            </Link>
          )}
          {next ? (
            <Link
              href={`/courses/${next.chapter}/${next.slug}`}
              className="lesson-pagination-next"
              rel="next"
            >
              <span className="lesson-pagination-kicker">
                <PaginationChevron direction="right" />
                <span>下一课</span>
              </span>
              <strong>{next.title}</strong>
            </Link>
          ) : (
            <Link href="/about/learning-map" className="lesson-pagination-next">
              <span className="lesson-pagination-kicker">
                <PaginationChevron direction="right" />
                <span>本轮学习完成</span>
              </span>
              <strong>回到课程首页继续探索</strong>
            </Link>
          )}
        </nav>
      </article>
    </DocumentationShell>
  );
}
