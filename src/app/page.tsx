const navigationGroups = [
  {
    title: "开始学习",
    items: ["网站首页", "学习路线", "课程目录"],
  },
  {
    title: "AI 基础课程",
    items: [
      "认识人工智能",
      "机器学习与深度学习",
      "大语言模型如何工作",
      "什么是智能体",
      "安全使用人工智能",
    ],
  },
  {
    title: "实践项目",
    items: ["AI 创作实验室", "AI 学习实验室"],
  },
  {
    title: "学习成果",
    items: ["学生成果", "学习复盘"],
  },
  {
    title: "家长与安全",
    items: ["家长专区", "隐私保护", "未成年人保护"],
  },
];

const pageSections = [
  { id: "project-intro", label: "项目介绍" },
  { id: "learning-path", label: "学习路径" },
  { id: "page-layout", label: "页面结构" },
  { id: "content-guide", label: "内容添加方式" },
  { id: "next-step", label: "下一步计划" },
];

function SiteNavigation() {
  return (
    <nav className="site-navigation" aria-label="全站导航">
      {navigationGroups.map((group, groupIndex) => (
        <section className="navigation-group" key={group.title}>
          <h2>{group.title}</h2>
          <ul>
            {group.items.map((item, itemIndex) => {
              const isCurrent = groupIndex === 0 && itemIndex === 0;

              return (
                <li key={item}>
                  <a
                    className={isCurrent ? "navigation-link is-current" : "navigation-link"}
                    href={isCurrent ? "#project-intro" : "#content-guide"}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {item}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}

export default function Home() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#project-intro" aria-label="返回网站首页">
          <span className="brand-mark" aria-hidden="true">智</span>
          <span className="brand-name">AI 基础教育</span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-subtitle">公益学习平台</span>
        </a>

        <div className="topbar-actions">
          <span className="stage-badge">网站框架版</span>
          <a className="feedback-link" href="#next-step">反馈建议</a>
        </div>

        <details className="mobile-navigation">
          <summary>网站导航</summary>
          <div className="mobile-navigation-panel">
            <SiteNavigation />
          </div>
        </details>
      </header>

      <div className="documentation-layout">
        <aside className="left-sidebar">
          <div className="sidebar-heading">
            <span className="sidebar-kicker">课程与项目</span>
            <h1>网站导航</h1>
          </div>
          <SiteNavigation />
        </aside>

        <main className="content-column" id="main-content">
          <nav className="breadcrumb" aria-label="当前位置">
            <a href="#project-intro">首页</a>
            <span aria-hidden="true">/</span>
            <span>项目介绍</span>
          </nav>

          <article className="article-content">
            <header className="article-header">
              <span className="eyebrow">欢迎来到 AI 基础教育公益网站</span>
              <h1>从这里开始认识人工智能，并把想法变成真实成果</h1>
              <p className="article-lead">
                这是网站的第一版页面骨架。课程内容、互动实验和学生作品将在后续逐步加入，
                当前版本用于确认整体导航、阅读布局和中文视觉规范。
              </p>
              <div className="article-meta" aria-label="页面信息">
                <span>适合学生、家长与教育工作者</span>
                <span>预计阅读 5 分钟</span>
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
                  <strong>当前阶段</strong>
                  <p>先完成稳定、易扩展的网站框架，后续再逐步添加正式课程和功能。</p>
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
                <p>当前页面采用适合长篇课程阅读的三栏布局，并针对不同屏幕尺寸自动调整。</p>
                <ul className="feature-list">
                  <li><strong>左侧：</strong>展示整个网站的课程、项目和安全信息导航。</li>
                  <li><strong>中间：</strong>承载课程正文、互动练习和项目步骤。</li>
                  <li><strong>右侧：</strong>展示当前页面的章节目录，便于快速跳转。</li>
                </ul>
              </div>
            </section>

            <section id="content-guide" className="content-section">
              <p className="section-number">04</p>
              <div>
                <h2>内容添加方式</h2>
                <p>
                  后续课程内容可以按章节持续加入，不需要重新设计整套页面。
                  标题、正文、提示、练习和小结将使用统一样式，保证不同作者添加的内容仍然保持一致。
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
                  页面骨架确认后，可以优先添加一篇完整的示范课程，再根据真实内容调整导航层级、
                  正文宽度和课程组件。这样能让后续开发围绕实际学习体验持续演进。
                </p>
                <a className="primary-action" href="#project-intro">返回页面顶部</a>
              </div>
            </section>
          </article>
        </main>

        <aside className="right-sidebar">
          <nav aria-label="本页导航">
            <p className="on-page-title">
              <span aria-hidden="true">≡</span>
              本页导航
            </p>
            <ol>
              {pageSections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>
    </div>
  );
}
