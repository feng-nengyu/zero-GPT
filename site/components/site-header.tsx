"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LabIcon } from "./lab-icon";
const navigation = [
  ["/", "我的书桌", "home"],
  ["/daily", "每日待办", "daily"],
  ["/blog", "我的博客", "blog"],
  ["/notes", "知识笔记", "notes"],
  ["/explore", "随便看看", "explore"],
  ["/roadmap", "学习地图", "roadmap"],
  ["/projects", "项目实验", "projects"],
  ["/about", "关于我", "about"],
] as const;
export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Learning Lab 首页">
        <span className="brand-mark">
          <LabIcon name="leaf" size={25} />
        </span>
        <span className="brand-copy">
          <strong>小鱼的 Lab</strong>
          <small>A little, every day.</small>
        </span>
      </Link>
      <p className="nav-caption">我的学习空间</p>
      <nav aria-label="主导航">
        {navigation.map(([href, label, icon]) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              href={href}
              key={href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              <LabIcon name={icon} />
              <span>{label}</span>
              {active && <span className="nav-dot" />}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <Link href="/write" className="write-link">
          <LabIcon name="pen" size={17} /> 随手记一点 <span>↗</span>
        </Link>
        <div className="sidebar-note">
          <span className="tiny-sprout">✳</span>
          <p>
            慢慢学，认真玩。
            <br />
            让好奇心多待一会儿。
          </p>
        </div>
        <a
          href="https://github.com/feng-nengyu/zero-GPT"
          target="_blank"
          rel="noreferrer"
          className="github-link"
        >
          GitHub ↗ <span>小鱼</span>
        </a>
      </div>
    </header>
  );
}
