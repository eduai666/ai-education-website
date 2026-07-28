import Link from "next/link";
import type { ReactNode } from "react";
import { OnThisPage, type PageSection } from "./on-this-page";
import { SiteNavigation } from "./site-navigation";

type Breadcrumb = {
  label: string;
  href?: string;
};

type DocumentationShellProps = {
  activePath: string;
  breadcrumbs: Breadcrumb[];
  children: ReactNode;
  sections: PageSection[];
};

export function DocumentationShell({
  activePath,
  breadcrumbs,
  children,
  sections,
}: DocumentationShellProps) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="返回网站首页">
          <span className="brand-mark" aria-hidden="true">智</span>
          <span className="brand-name">AI 基础教育</span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-subtitle">公益学习平台</span>
        </Link>

        <div className="topbar-actions">
          <span className="stage-badge">持续共创中</span>
          <Link className="feedback-link" href="/#next-step">反馈建议</Link>
        </div>

        <details className="mobile-navigation">
          <summary>网站导航</summary>
          <div className="mobile-navigation-panel">
            <SiteNavigation activePath={activePath} />
          </div>
        </details>
      </header>

      <div className="documentation-layout">
        <aside className="left-sidebar">
          <div className="sidebar-heading">
            <span className="sidebar-kicker">课程与项目</span>
            <h1>网站导航</h1>
          </div>
          <SiteNavigation activePath={activePath} />
        </aside>

        <main className="content-column" id="main-content">
          <nav className="breadcrumb" aria-label="当前位置">
            {breadcrumbs.map((crumb, index) => (
              <span className="breadcrumb-item" key={`${crumb.label}-${index}`}>
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              </span>
            ))}
          </nav>
          {children}
        </main>

        <aside className="right-sidebar">
          <OnThisPage sections={sections} />
        </aside>
      </div>
    </div>
  );
}
