import { DocumentationShell } from "@/components/layout/documentation-shell";
import { courseLessons, getLesson } from "@/server/content/courses";
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
            <span className="lesson-status"><i aria-hidden="true" />课程已上线</span>
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <div className="lesson-meta" aria-label="课程信息">
            <span><b aria-hidden="true">龄</b>{lesson.audience}</span>
            <span><b aria-hidden="true">时</b>{lesson.readingTime}</span>
            <span><b aria-hidden="true">练</b>包含互动与自测</span>
          </div>
        </header>

        <div className="lesson-prose">
          <LessonContent />
        </div>

        <nav className="lesson-pagination" aria-label="课程前后导航">
          <Link href="/" className="lesson-pagination-home">
            <span>返回</span>
            <strong>课程首页</strong>
          </Link>
          <span className="lesson-pagination-next is-disabled" aria-disabled="true">
            <span>下一课 · 即将推出</span>
            <strong>机器学习与深度学习</strong>
          </span>
        </nav>
      </article>
    </DocumentationShell>
  );
}
