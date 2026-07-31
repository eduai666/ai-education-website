import Image from "next/image";
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
  variant?: "reading" | "workspace";
};

export function DocumentationShell({
  activePath,
  breadcrumbs,
  children,
  sections,
  variant = "reading",
}: DocumentationShellProps) {
  return (
    <div className={variant === "workspace" ? "page-shell workspace-shell" : "page-shell"}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="返回网站首页">
          <Image
            className="brand-logo"
            src="/brand/logo.png"
            alt=""
            width={407}
            height={477}
          />
          <span className="brand-name">AI 基础教育</span>
          <span className="brand-subtitle">公益学习平台</span>
        </Link>

        <div className="topbar-actions">
          <Link className="feedback-link" href="/about/vision">项目愿景</Link>
        </div>

        <details className="mobile-navigation">
          <summary>
            <span className="mobile-navigation-label-tablet">本页目录</span>
            <span className="mobile-navigation-label-phone">目录与导航</span>
          </summary>
          <div className="mobile-navigation-panel">
            {sections.length ? (
              <div className="mobile-on-this-page">
                <OnThisPage sections={sections} />
              </div>
            ) : null}
            <SiteNavigation activePath={activePath} />
          </div>
        </details>
      </header>

      <div className="documentation-layout">
        <aside className="left-sidebar">
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
          <div className="right-sidebar-brand" aria-hidden="true">
            <Image
              src="/brand/logo.png"
              alt=""
              width={407}
              height={477}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
