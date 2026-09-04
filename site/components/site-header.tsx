"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  ["/", "Now"],
  ["/roadmap", "Roadmap"],
  ["/daily", "Daily"],
  ["/notes", "Notes"],
  ["/blog", "Blog"],
  ["/projects", "Projects"],
  ["/about", "About"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Learning Lab 首页">
          <span className="brand-mark">F</span>
          <span className="brand-copy">
            <strong>Feng Nengyu</strong>
            <small>Learning Lab</small>
          </span>
        </Link>
        <nav aria-label="主导航">
          {navigation.map(([href, label]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link className={active ? "active" : ""} href={href} key={href}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
