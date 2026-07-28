import Link from "next/link";
import { navigationGroups } from "@/config/routes";

type SiteNavigationProps = {
  activePath: string;
};

export function SiteNavigation({ activePath }: SiteNavigationProps) {
  return (
    <nav className="site-navigation" aria-label="全站导航">
      {navigationGroups.map((group) => (
        <section className="navigation-group" key={group.title}>
          <h2>{group.title}</h2>
          <ul>
            {group.items.map((item) => {
              const isCurrent = item.href === activePath;

              return (
                <li key={item.label}>
                  <Link
                    className={isCurrent ? "navigation-link is-current" : "navigation-link"}
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    {item.status ? <span className="navigation-status">待更新</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
