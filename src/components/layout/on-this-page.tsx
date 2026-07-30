"use client";

import { useEffect, useState } from "react";

export type PageSection = {
  id: string;
  label: string;
};

type OnThisPageProps = {
  sections: PageSection[];
};

export function OnThisPage({ sections }: OnThisPageProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const headings = sections
      .map((section) => document.getElementById(section.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (!headings.length) return;

    const updateActiveSection = () => {
      let currentId = headings[0].id;

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 240) currentId = heading.id;
        else break;
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12) {
        currentId = headings.at(-1)?.id ?? currentId;
      }

      setActiveId(currentId);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sections]);

  return (
    <nav aria-label="本页导航">
      <p className="on-page-title">本页导航</p>
      <ol>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              className={activeId === section.id ? "is-active" : undefined}
              href={`#${section.id}`}
              aria-current={activeId === section.id ? "location" : undefined}
              onClick={() => setActiveId(section.id)}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
