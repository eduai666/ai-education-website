import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { DocumentationShell } from "@/components/layout/documentation-shell";
import { AiDecisionLab } from "@/features/cell-architecture/ai-decision-lab";
import { CellArchitectureExplorer } from "@/features/cell-architecture/cell-architecture-explorer";
import { CellObservationChallenge } from "@/features/cell-architecture/cell-observation-challenge";
import {
  cellAiFixture,
  cellDemo,
} from "@/features/cell-architecture/cell-content";
import styles from "@/features/cell-architecture/cell-architecture.module.css";

export const metadata: Metadata = {
  title: "细胞结构探索器｜AI 基础教育",
  description:
    "先用动物细胞学习细胞膜、细胞核和线粒体，再按需切换神经元与细菌细胞壁三维标本进行形态比较。",
};

const activePath = "/projects/learn/cell-architecture";

const sections = [
  { id: "observe", label: "观察细胞" },
  { id: "facts", label: "核验事实" },
  { id: "challenge", label: "观察挑战" },
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
      variant="workspace"
    >
      <article className={styles.projectPage}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>生物观察工作台</p>
            <h1>看见一颗细胞</h1>
            <p className={styles.heroLead}>
              先用动物细胞完成细胞膜、细胞核与线粒体任务，再切换神经元和细菌细胞壁作形态比较。
            </p>
          </div>

          <dl className={styles.workbenchSummary}>
            <div>
              <dt>模型</dt>
              <dd>3 个标本</dd>
            </div>
            <div>
              <dt>任务</dt>
              <dd>结构与功能</dd>
            </div>
            <div>
              <dt>视图</dt>
              <dd>2D / 3D</dd>
            </div>
            <div>
              <dt>课程</dt>
              <dd>10—14 岁</dd>
            </div>
          </dl>

          <div
            className={styles.structureStrip}
            aria-label="动物细胞课程观察结构"
          >
            <span className={styles.structureStripLabel}>动物细胞课程结构</span>
            {cellDemo.structures.map((structure) => (
              <span key={structure.id}>
                <i
                  style={
                    { "--structure-color": structure.color } as CSSProperties
                  }
                />
                {structure.name}
                <small>{structure.englishName}</small>
              </span>
            ))}
            <strong>v0.2 · 本地运行</strong>
          </div>
        </header>

        <section
          className={`${styles.section} ${styles.observeSection}`}
          id="observe"
        >
          <CellArchitectureExplorer
            structures={cellDemo.structures}
            scene={cellDemo.scene}
            initialStructureId={cellDemo.initialStructureId}
          />
        </section>

        <section className={styles.section} id="facts">
          <div className={styles.sectionHeading}>
            <span>结构笔记</span>
            <div>
              <h2>动物细胞的三个结构，一张观察表</h2>
              <p>每条说明都能追到公开教材；先看主要功能，需要时再展开答案。</p>
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
                  <p className={styles.factEnglishName}>
                    {structure.englishName}
                  </p>
                  <p className={styles.factSummary}>{structure.summary}</p>

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

          <details className={styles.modelLimitations}>
            <summary>模型与真实细胞有哪些差异？</summary>
            <ul>
              {cellDemo.modelLimitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </details>
        </section>

        <div className={styles.lessonColumns}>
          <section className={styles.section} id="challenge">
            <div className={styles.sectionHeading}>
              <span>观察练习</span>
              <div>
                <h2>把动物细胞的结构和功能对应起来</h2>
                <p>独立完成三道题，再根据反馈订正到 3/3。</p>
              </div>
            </div>

            <CellObservationChallenge structures={cellDemo.structures} />
          </section>

          <section className={styles.section} id="ai-audit">
            <div className={styles.sectionHeading}>
              <span>建议核验</span>
              <div>
                <h2>AI 建议由人来判断</h2>
                <p>选择采用、修改或拒绝，再比较项目记录中的理由。</p>
              </div>
            </div>

            <AiDecisionLab
              fixtureId={cellAiFixture.fixtureId}
              summary={cellAiFixture.parsed.summary}
              suggestions={cellAiFixture.parsed.suggestions}
            />
          </section>
        </div>

        <section className={styles.section} id="workflow">
          <div className={styles.sectionHeading}>
            <span>学习记录</span>
            <div>
              <h2>一条可以回头检查的学习路径</h2>
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
            <span>方法与来源</span>
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
              <strong>3 个本地 GLB · 只加载当前标本</strong>
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
                  {source.edition} · {source.section} · 访问于{" "}
                  {source.accessedAt} · {source.license}
                </p>
                <a href={source.url} rel="noreferrer">
                  查看原始资料
                </a>
              </li>
            ))}
            <li>
              <div>
                <strong>Cell Architecture Studio / NIH 3D</strong>
                <span>三个精细三维标本</span>
              </div>
              <p>
                固定提交 1cab982 · 动物细胞 84,906、神经元 160,256、细菌细胞壁
                25,542 个三角形 · 本地按选择逐个加载
              </p>
              <a
                href="https://github.com/cclank/cell-architecture-studio/tree/1cab982e7a0f96af854a696430c0724707764358/public/models"
                rel="noreferrer"
              >
                查看固定模型目录
              </a>
            </li>
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
