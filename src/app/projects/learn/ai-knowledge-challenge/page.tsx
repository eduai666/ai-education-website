import type { Metadata } from "next";
import { DocumentationShell } from "@/components/layout/documentation-shell";
import { AiKnowledgeChallenge } from "@/features/ai-knowledge-challenge/ai-knowledge-challenge";

export const metadata: Metadata = {
  title: "AI 知识闯关｜AI 基础教育",
  description:
    "面向小学高年级和初中生的 AI 基础知识闯关游戏，均衡复习认识人工智能、机器学习、大模型与智能体四个单元。",
};

const activePath = "/projects/learn/ai-knowledge-challenge";

export default function AiKnowledgeChallengePage() {
  return (
    <DocumentationShell
      activePath={activePath}
      sectionId="projects"
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "实践项目" },
        { label: "AI 知识闯关" },
      ]}
      sections={[{ id: "challenge", label: "AI 知识闯关" }]}
      variant="workspace"
    >
      <AiKnowledgeChallenge />
    </DocumentationShell>
  );
}
