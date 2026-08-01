import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageDisclosure } from "./language-disclosure";
import { PrimaryNavigation } from "./primary-navigation";
import { OnThisPage, type PageSection } from "./on-this-page";
import { SiteNavigation } from "./site-navigation";
import type { NavigationSectionId } from "@/config/routes";
import { LearningHistoryTracker } from "@/features/learning-center/learning-center";
import { SiteSearch } from "@/features/site-search/site-search";
import { siteSearchDocuments } from "@/server/content/search-index";

type Breadcrumb = {
  label: string;
  href?: string;
};

type DocumentationShellProps = {
  activePath: string;
  breadcrumbs: Breadcrumb[];
  children: ReactNode;
  sectionId: NavigationSectionId;
  sections: PageSection[];
  variant?: "reading" | "workspace";
};

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.4A5.8 5.8 0 0 0 19.3 3 5.4 5.4 0 0 0 19.1 0S17.9-.4 15 1.5a14 14 0 0 0-6 0C6.1-.4 4.9 0 4.9 0a5.4 5.4 0 0 0-.2 3A5.8 5.8 0 0 0 3.2 7.1c0 5.8 3.5 7 6.8 7.4A4.8 4.8 0 0 0 9 18v4" />
      <path d="M9 19c-3 .9-3-1.5-4.2-2" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function GitHubLink({ mobile = false }: { mobile?: boolean }) {
  return (
    <a
      className={mobile ? "mobile-utility-link" : "header-tool-link header-github-link"}
      href="https://github.com/eduai666/ai-education-website"
      target="_blank"
      rel="noreferrer"
      aria-label="GitHub 源码（在新窗口打开）"
    >
      <GitHubIcon />
      <span>{mobile ? "GitHub 源码" : "GitHub"}</span>
    </a>
  );
}

export function DocumentationShell({
  activePath,
  breadcrumbs,
  children,
  sectionId,
  sections,
  variant = "reading",
}: DocumentationShellProps) {
  const knownPaths = siteSearchDocuments.map((document) => document.path);

  return (
    <div className={variant === "workspace" ? "page-shell workspace-shell" : "page-shell"}>
      <LearningHistoryTracker activePath={activePath} knownPaths={knownPaths} />

      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-leading">
            <Link className="brand" href="/" aria-label="返回网站首页">
              <Image
                className="brand-logo"
                src="/brand/logo.png"
                alt=""
                width={407}
                height={477}
                priority
              />
              <span className="brand-name">AI 基础教育</span>
              <span className="brand-subtitle">公益学习平台</span>
            </Link>
            <PrimaryNavigation activeSectionId={sectionId} />
          </div>

          <nav className="topbar-actions" aria-label="网站工具">
            <SiteSearch documents={siteSearchDocuments} />
            <GitHubLink />

            <LanguageDisclosure />

            <Link className="header-tool-link header-profile-link" href="/learning-center">
              <UserIcon />
              <span>个人中心</span>
            </Link>
          </nav>

          <details className="mobile-navigation">
            <summary aria-label="打开目录与导航">
              <MenuIcon />
              <span className="mobile-navigation-label-tablet">本页目录</span>
              <span className="mobile-navigation-label-phone">导航</span>
            </summary>
            <div className="mobile-navigation-panel">
              <div className="mobile-primary-navigation">
                <p className="mobile-navigation-heading">学习板块</p>
                <PrimaryNavigation activeSectionId={sectionId} variant="mobile" />
              </div>

              <div className="mobile-section-navigation">
                <SiteNavigation activePath={activePath} sectionId={sectionId} />
              </div>

              {sections.length ? (
                <div className="mobile-on-this-page">
                  <OnThisPage sections={sections} />
                </div>
              ) : null}

              <div className="mobile-utility-links">
                <GitHubLink mobile />
                <div className="mobile-language-status">
                  <LanguageIcon />
                  <span>简体中文</span>
                  <small>English 建设中</small>
                </div>
              </div>
            </div>
          </details>
        </div>
      </header>

      <div className="documentation-layout">
        <aside className="left-sidebar">
          <SiteNavigation activePath={activePath} sectionId={sectionId} />
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
            <picture>
              <source
                media="(prefers-reduced-motion: reduce)"
                srcSet="/brand/right-sidebar-agent-still.png"
                type="image/png"
              />
              <Image
                src="/brand/right-sidebar-agent.gif"
                alt=""
                width={627}
                height={627}
                unoptimized
              />
            </picture>
          </div>
        </aside>
      </div>
    </div>
  );
}
