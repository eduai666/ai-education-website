import { DocumentationShell } from "@/components/layout/documentation-shell";

const pageSections = [
  { id: "project-intro", label: "项目介绍" },
  { id: "learning-path", label: "学习路径" },
  { id: "page-layout", label: "页面结构" },
  { id: "content-guide", label: "内容添加方式" },
  { id: "next-step", label: "下一步计划" },
];

export default function Home() {
  return (
    <DocumentationShell
      activePath="/"
      breadcrumbs={[{ label: "首页" }, { label: "项目介绍" }]}
      sections={pageSections}
    >
      <article className="article-content">
        <header className="article-header">
          <span className="eyebrow">欢迎来到 AI 基础教育公益网站</span>
          <h1>从这里开始认识人工智能，并把想法变成真实成果</h1>
          <p className="article-lead">
            我们把人工智能知识整理成清晰、连续、适合自主学习的中文课程。
            第一章“认识人工智能”现已开放，可以从左侧课程导航开始学习。
          </p>
          <div className="article-meta" aria-label="页面信息">
            <span>适合学生、家长与教育工作者</span>
            <span>免费开放，持续共创</span>
          </div>
        </header>

        <section id="project-intro" className="content-section">
          <p className="section-number">01</p>
          <div>
            <h2>项目介绍</h2>
            <p>
              我们希望把人工智能知识整理成清晰、连续、适合自主学习的中文课程。
              网站不以聊天框为中心，而是通过课程、互动、实践项目和复盘，帮助学生真正理解并应用所学内容。
            </p>
            <div className="note-card">
              <strong>第一章已上线</strong>
              <p>“认识人工智能”包含生活案例、概念辨别、互动分类和课后自测，可以直接开始学习。</p>
            </div>
          </div>
        </section>

        <section id="learning-path" className="content-section">
          <p className="section-number">02</p>
          <div>
            <h2>学习路径</h2>
            <p>
              整个网站将围绕“基础课程、实践项目、成果展示”三部分展开。
              左侧导航负责展示完整学习结构，让学生在任何页面都能知道自己当前的位置和下一步方向。
            </p>
            <div className="path-grid">
              <article>
                <span>第一阶段</span>
                <h3>理解基础概念</h3>
                <p>从生活中的例子出发，认识人工智能、大语言模型和智能体。</p>
              </article>
              <article>
                <span>第二阶段</span>
                <h3>完成实践项目</h3>
                <p>在创作与学习实验室中完成任务，留下修改和思考过程。</p>
              </article>
              <article>
                <span>第三阶段</span>
                <h3>展示与复盘</h3>
                <p>整理学习成果，说明做了什么、为什么修改以及学到了什么。</p>
              </article>
            </div>
          </div>
        </section>

        <section id="page-layout" className="content-section">
          <p className="section-number">03</p>
          <div>
            <h2>页面结构</h2>
            <p>页面采用适合长篇课程阅读的三栏布局，并针对不同屏幕尺寸自动调整。</p>
            <ul className="feature-list">
              <li><strong>左侧：</strong>展示整个网站的课程、项目和安全信息导航。</li>
              <li><strong>中间：</strong>承载课程正文、互动练习和项目步骤。</li>
              <li><strong>右侧：</strong>展示当前页面的章节目录，阅读时自动提示当前位置。</li>
            </ul>
          </div>
        </section>

        <section id="content-guide" className="content-section">
          <p className="section-number">04</p>
          <div>
            <h2>内容添加方式</h2>
            <p>
              课程正文已经与页面代码分离。后续可以按章节持续加入，不需要重新设计整套页面。
              标题、正文、提示、练习和小结使用统一样式，让共创内容保持清晰一致。
            </p>
            <div className="content-template" aria-label="建议的课程内容结构">
              <span>学习目标</span>
              <span>生活场景</span>
              <span>核心概念</span>
              <span>动手练习</span>
              <span>检查理解</span>
              <span>课程小结</span>
            </div>
          </div>
        </section>

        <section id="next-step" className="content-section">
          <p className="section-number">05</p>
          <div>
            <h2>下一步计划</h2>
            <p>
              接下来可以沿用第一章的结构添加其余四章，并逐步补充实践项目、学生成果展示和家长安全指南。
              每一章都可以拥有自己的本页目录、互动练习和自测模块。
            </p>
            <a className="primary-action" href="/courses/ai-basics/what-is-ai">开始第一章</a>
          </div>
        </section>
      </article>
    </DocumentationShell>
  );
}
