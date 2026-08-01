import type { Metadata } from "next";
import { DocumentationShell } from "@/components/layout/documentation-shell";
import { LearningCenterPanel } from "@/features/learning-center/learning-center";
import { siteSearchDocuments } from "@/server/content/search-index";

export const metadata: Metadata = {
  title: "个人学习中心｜AI 基础教育",
  description: "查看只保存在当前浏览器中的最近课程与实践项目记录。",
};

const sections = [
  { id: "recent-learning-title", label: "最近学习" },
  { id: "learning-record-privacy", label: "记录与隐私" },
];

export default function LearningCenterPage() {
  return (
    <DocumentationShell
      activePath="/learning-center"
      sectionId="learning"
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "个人学习中心" },
      ]}
      sections={sections}
    >
      <article className="article-content learning-center-page">
        <header className="learning-center-hero">
          <p>个人中心</p>
          <h1>你的本机学习记录</h1>
          <span>无需注册，不上传个人信息，只帮助你从上次停下的地方继续。</span>
        </header>
        <LearningCenterPanel documents={siteSearchDocuments} />
      </article>
    </DocumentationShell>
  );
}
