import Link from "next/link";
import {
  navigationSections,
  type NavigationSectionId,
} from "@/config/routes";

type PrimaryNavigationProps = {
  activeSectionId: NavigationSectionId;
  variant?: "desktop" | "mobile";
};

export function PrimaryNavigation({
  activeSectionId,
  variant = "desktop",
}: PrimaryNavigationProps) {
  return (
    <nav
      className={`primary-navigation primary-navigation-${variant}`}
      aria-label="网站主要板块"
    >
      {navigationSections.map((section) => {
        const isCurrent = section.id === activeSectionId;

        return (
          <Link
            href={section.href}
            className={isCurrent ? "is-current" : undefined}
            aria-current={isCurrent ? "location" : undefined}
            key={section.id}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
