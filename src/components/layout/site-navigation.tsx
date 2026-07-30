import Link from "next/link";
import {
  navigationGroups,
  type NavigationIconName,
  type NavigationItem,
} from "@/config/routes";

type SiteNavigationProps = {
  activePath: string;
};

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const paths = {
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" /></>,
    flask: <><path d="M9 3h6" /><path d="M10 3v6l-5 8.5A2.3 2.3 0 0 0 7 21h10a2.3 2.3 0 0 0 2-3.5L14 9V3" /><path d="M7.5 16h9" /></>,
    users: <><path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="8" r="3" /><path d="M17 11a3 3 0 0 0 0-6" /><path d="M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35" /></>,
  } satisfies Record<NavigationIconName, React.ReactNode>;

  return (
    <svg className="navigation-group-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function NavigationLeafIcon() {
  return (
    <svg className="navigation-leaf-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
    </svg>
  );
}

function NavigationLeaf({
  item,
  activePath,
  isNestedLesson,
}: {
  item: NavigationItem;
  activePath: string;
  isNestedLesson: boolean;
}) {
  const isCurrent = item.href === activePath;

  if (!item.href) return null;

  return (
    <Link
      className={isCurrent ? "navigation-link is-current" : "navigation-link"}
      href={item.href}
      aria-current={isCurrent ? "page" : undefined}
    >
      <span className="navigation-link-content">
        {isNestedLesson ? <NavigationLeafIcon /> : null}
        <span>{item.label}</span>
      </span>
      {item.status ? <span className="navigation-status">待更新</span> : null}
    </Link>
  );
}

function NavigationEntry({
  item,
  activePath,
  depth = 0,
}: {
  item: NavigationItem;
  activePath: string;
  depth?: number;
}) {
  if (!item.children?.length) {
    return (
      <li>
        <NavigationLeaf item={item} activePath={activePath} isNestedLesson={depth > 0} />
      </li>
    );
  }

  const containsCurrentPage = item.children.some((child) => child.href === activePath);

  return (
    <li className={`navigation-branch${containsCurrentPage ? " is-current-branch" : ""}`}>
      <details open={containsCurrentPage}>
        <summary>
          <span>{item.label}</span>
          <svg className="navigation-branch-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="m7 4 6 6-6 6" />
          </svg>
        </summary>
        <ul className="navigation-children">
          {item.children.map((child) => (
            <NavigationEntry
              item={child}
              activePath={activePath}
              depth={depth + 1}
              key={child.label}
            />
          ))}
        </ul>
      </details>
    </li>
  );
}

export function SiteNavigation({ activePath }: SiteNavigationProps) {
  return (
    <nav className="site-navigation" aria-label="全站导航">
      {navigationGroups.map((group) => (
        <section className="navigation-group" key={group.title}>
          <h2><NavigationIcon name={group.icon} />{group.title}</h2>
          <ul>
            {group.items.map((item) => (
              <NavigationEntry item={item} activePath={activePath} key={item.label} />
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
