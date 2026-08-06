import type { Metadata } from "next";
import Link from "next/link";
import { ReadingTimeNote } from "@/components/content/reading-time-note";
import { DocumentationShell } from "@/components/layout/documentation-shell";
import TutorialContent from "../../../../../../docs/markdown/知识闯关小游戏实践项目/AI知识闯关小游戏-Agent共创实践教程.md";

export const metadata: Metadata = {
  title: "用 Agent 制作 AI 知识闯关小游戏｜AI 基础教育",
  description:
    "面向小学高年级和初中生的 Agent 共创实践教程，学习拆解任务、编写提示词、验收功能并完成 AI 知识闯关小游戏。",
};

const activePath = "/projects/learn/ai-knowledge-challenge/tutorial";

const sections = [
  { id: "最终作品是什么样", label: "认识最终作品" },
  { id: "写提示词不是背提示词", label: "怎样写提示词" },
  { id: "第-0-阶段建立安全的练习环境", label: "0. 建立练习环境" },
  { id: "第-1-阶段把想法变成项目任务卡", label: "1. 制作任务卡" },
  { id: "第-2-阶段建立能跑通的最小版本", label: "2. 跑通最小版本" },
  { id: "第-3-阶段建立四单元准确题库", label: "3. 建立准确题库" },
  { id: "第-4-阶段完成单题作答与即时反馈", label: "4. 作答与反馈" },
  { id: "第-5-阶段完成计分和前后题流程", label: "5. 计分与流程" },
  { id: "第-6-阶段制作最终结果和分单元表现", label: "6. 结果与报告" },
  { id: "第-7-阶段加入错题回顾", label: "7. 错题回顾" },
  { id: "第-8-阶段加入均衡随机与重新挑战", label: "8. 随机与重玩" },
  { id: "第-9-阶段让页面在电脑和手机上都好用", label: "9. 响应式排版" },
  { id: "第-10-阶段完成键盘和无障碍检查", label: "10. 无障碍检查" },
  { id: "第-11-阶段测试描述问题和要求局部修复", label: "11. 测试与修复" },
  { id: "第-12-阶段让-agent-解释项目而不是替你理解", label: "12. 理解项目" },
  { id: "第-13-阶段自己提出一次小升级", label: "13. 自主升级" },
  { id: "第-14-阶段展示作品与完成反思", label: "14. 展示与反思" },
  { id: "真实开发复盘第一版记录", label: "真实开发复盘" },
];

export default function AiKnowledgeChallengeTutorialPage() {
  return (
    <DocumentationShell
      activePath={activePath}
      sectionId="projects"
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "实践项目", href: "/projects/learn/ai-knowledge-challenge" },
        { label: "Agent 共创教程" },
      ]}
      sections={sections}
    >
      <article className="article-content content-document-page">
        <ReadingTimeNote value="建议分 5—8 课时完成" />

        <div className="markdown-document">
          <TutorialContent />
        </div>

        <nav className="content-pagination" aria-label="实践项目导航">
          <span className="content-pagination-spacer" />
          <Link
            href="/projects/learn/ai-knowledge-challenge"
            className="content-pagination-next"
          >
            <span>打开示例作品</span>
            <strong>开始 AI 知识闯关</strong>
          </Link>
        </nav>
      </article>
    </DocumentationShell>
  );
}
