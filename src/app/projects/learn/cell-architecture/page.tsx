import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { DocumentationShell } from "@/components/layout/documentation-shell";
import { AiDecisionLab } from "@/features/cell-architecture/ai-decision-lab";
import { CellArchitectureExplorer } from "@/features/cell-architecture/cell-architecture-explorer";
import {
  cellAiFixture,
  cellDemo,
} from "@/features/cell-architecture/cell-content";
import styles from "@/features/cell-architecture/cell-architecture.module.css";

export const metadata: Metadata = {
  title: "细胞结构探索器｜AI 基础教育",
  description:
    "用完整的二维知识卡和按需加载的轻量三维模型，学习细胞膜、细胞核和线粒体，并练习核验 AI 建议。",
};

const activePath = "/projects/learn/cell-architecture";

const sections = [
  { id: "observe", label: "观察细胞" },
  { id: "facts", label: "核验事实" },
  { id: "ai-audit", label: "判断 AI 建议" },
  { id: "workflow", label: "学习流程" },
  { id: "sources", label: "来源与边界" },
];

const workflowSteps = [
  {
    id: "G1",
    title: "先写需求",
    description: "明确只学习三个结构，并写出可以检查的交互目标。",
  },
  {
    id: "G2",
    title: "核验事实",
    description: "把 AI 草稿与公开教材比较，AI 本身不能成为来源。",
  },
  {
    id: "G3",
    title: "判断建议",
    description: "给每条可执行建议编号，再选择采用、修改或拒绝。",
  },
  {
    id: "G4",
    title: "先完成 2D",
    description: "确保关闭 3D 和实时 AI 后，仍能完成全部观察问题。",
  },
  {
    id: "G5",
    title: "再增加 3D",
    description: "把 3D 当成可关闭的观察工具，不让特效替代知识内容。",
  },
  {
    id: "G6",
    title: "测试并修正",
    description: "在鼠标、键盘、触屏和失败场景中重复相同测试。",
  },
];

export default function CellArchitecturePage() {
  const sourceById = new Map(
    cellDemo.sources.map((source) => [source.id, source]),
  );

  return (
    <DocumentationShell
      activePath={activePath}
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "实践项目" },
        { label: "细胞结构探索器" },
      ]}
      sections={sections}
    >
      <article className={styles.projectPage}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroStatusRow}>
              <span className={styles.heroStatus}>可复现设计原型 · v0.1</span>
              <span className={styles.heroStatusMuted}>10—14 岁 · 三个结构</span>
            </div>
            <p className={styles.heroEyebrow}>AI × 生物学习实验</p>
            <h1>看见一颗细胞，也看见 AI 建议怎样被人检查</h1>
            <p className={styles.heroLead}>
              从完整的二维知识卡开始，再按需打开轻量 3D。你不仅要找到细胞膜、细胞核和线粒体，还要判断 AI 的建议是否值得采用。
            </p>
            <div className={styles.heroActions}>
              <a className={styles.heroPrimaryAction} href="#observe">
                开始观察
              </a>
              <a className={styles.heroSecondaryAction} href="#ai-audit">
                先看 AI 任务
              </a>
            </div>
          </div>

          <div className={styles.heroGraphic} aria-hidden="true">
            <div className={styles.heroCell}>
              <span className={styles.heroNucleus} />
              <span className={styles.heroMitochondrion} />
              <span className={styles.heroOrbit}>01</span>
              <span className={styles.heroOrbit}>02</span>
              <span className={styles.heroOrbit}>03</span>
            </div>
            <p>2D 是基础路径<br />3D 是增强工具</p>
          </div>
        </header>

        <div className={styles.projectPrinciples} aria-label="项目约束">
          <div>
            <strong>0</strong>
            <span>实时 AI 依赖</span>
          </div>
          <div>
            <strong>3</strong>
            <span>固定结构</span>
          </div>
          <div>
            <strong>1</strong>
            <span>按需 Canvas</span>
          </div>
          <div>
            <strong>本地</strong>
            <span>核心课程内容</span>
          </div>
        </div>

        <section className={styles.section} id="observe">
          <div className={styles.sectionHeading}>
            <span>01 · OBSERVE</span>
            <div>
              <h2>先用 2D 完成任务，再决定是否需要 3D</h2>
              <p>
                选择结构后，图形、稳定 ID 和知识卡会同步变化。3D 只在主动点击后加载，失败时不会丢失学习内容。
              </p>
            </div>
          </div>

          <CellArchitectureExplorer
            structures={cellDemo.structures}
            scene={cellDemo.scene}
            initialStructureId={cellDemo.initialStructureId}
          />
        </section>

        <section className={styles.section} id="facts">
          <div className={styles.sectionHeading}>
            <span>02 · VERIFY</span>
            <div>
              <h2>三张卡，都要能追到事实来源</h2>
              <p>
                下面的内容来自版本化事实文件。当前实现已对照公开教材，正式课堂发布前仍需由生物教师终审。
              </p>
            </div>
          </div>

          <div className={styles.factGrid}>
            {cellDemo.structures.map((structure, index) => {
              const source = sourceById.get(structure.sourceIds[0]);
              const accentStyle = {
                "--structure-accent": structure.color,
              } as CSSProperties;

              return (
                <article
                  className={styles.factCard}
                  style={accentStyle}
                  data-fact-id={structure.factId}
                  key={structure.id}
                >
                  <div className={styles.factCardHeader}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{structure.factId}</span>
                  </div>
                  <h3>{structure.name}</h3>
                  <p className={styles.factEnglishName}>{structure.englishName}</p>
                  <p>{structure.summary}</p>

                  <div className={styles.observationPrompt}>
                    <span>OBS-001</span>
                    <strong>{structure.observationQuestion}</strong>
                    <details>
                      <summary>核对答案</summary>
                      <p>{structure.observationAnswer}</p>
                    </details>
                  </div>

                  {source ? (
                    <p className={styles.factSource}>
                      来源：
                      <a href={source.url} rel="noreferrer">
                        {source.organization} · {source.section}
                      </a>
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>

          <aside className={styles.modelLimitations}>
            <div>
              <span>MODEL NOTE</span>
              <h3>这个模型故意没有“做得很真”</h3>
            </div>
            <ul>
              {cellDemo.modelLimitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section className={styles.section} id="ai-audit">
          <div className={styles.sectionHeading}>
            <span>03 · DECIDE</span>
            <div>
              <h2>AI 给的是候选方案，不是最终决定</h2>
              <p>
                先独立选择“采用、修改或拒绝”，再打开项目记录比较理由。这里使用本地合成 fixture，不发送任何学生信息，也不会实时调用模型。
              </p>
            </div>
          </div>

          <AiDecisionLab
            fixtureId={cellAiFixture.fixtureId}
            summary={cellAiFixture.parsed.summary}
            suggestions={cellAiFixture.parsed.suggestions}
          />
        </section>

        <section className={styles.section} id="workflow">
          <div className={styles.sectionHeading}>
            <span>04 · BUILD</span>
            <div>
              <h2>孩子真正练习的是一条可检查的 AI 协作链</h2>
              <p>
                每一步都有输入、产物和通过条件；页面只是其中一个结果，需求卡、事实表和测试证据同样重要。
              </p>
            </div>
          </div>

          <ol className={styles.workflowGrid}>
            {workflowSteps.map((step) => (
              <li key={step.id}>
                <span>{step.id}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>

          <div className={styles.studentEvidence}>
            <div>
              <span>完成后不要只交网页</span>
              <h3>还要留下五份能复查的学习证据</h3>
            </div>
            <ol>
              <li>观察与需求卡</li>
              <li>事实核验表与来源</li>
              <li>原型、AI 会话与决策日志</li>
              <li>测试和独立复现记录</li>
              <li>AI 使用说明与个人反思</li>
            </ol>
          </div>
        </section>

        <section className={styles.section} id="sources">
          <div className={styles.sectionHeading}>
            <span>05 · TRACE</span>
            <div>
              <h2>来源、版本和未完成事项都公开写明</h2>
              <p>
                透明不等于已经完美。这个版本可以演示核心路径，但真实触屏、低端设备和教师内容终审仍要留下后续证据。
              </p>
            </div>
          </div>

          <div className={styles.sourcePanel}>
            <div>
              <span>内容状态</span>
              <strong>已对照来源 · 待教师终审</strong>
            </div>
            <div>
              <span>运行时资源</span>
              <strong>程序化模型 · 无外部 GLB/纹理</strong>
            </div>
            <div>
              <span>AI 状态</span>
              <strong>本地合成 fixture · 无实时调用</strong>
            </div>
          </div>

          <ol className={styles.sourceList}>
            {cellDemo.sources.map((source) => (
              <li key={source.id}>
                <div>
                  <strong>{source.title}</strong>
                  <span>{source.organization}</span>
                </div>
                <p>
                  {source.edition} · {source.section} · 访问于 {source.accessedAt} · {source.license}
                </p>
                <a href={source.url} rel="noreferrer">
                  查看原始资料
                </a>
              </li>
            ))}
          </ol>

          <div className={styles.nextStep}>
            <div>
              <span>继续学习</span>
              <h3>回到 AI 创作指南，自己写一张需求卡</h3>
            </div>
            <Link href="/guides/ai-creating">打开创作指南 →</Link>
          </div>
        </section>
      </article>
    </DocumentationShell>
  );
}
