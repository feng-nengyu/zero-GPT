import Link from "next/link";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>
          A little, every day. <span>✳</span>
        </strong>
        <p>从一次对话、一个实验、一点好奇开始。</p>
      </div>
      <div className="footer-right">
        <Link href="/about">小鱼 · Learning Lab</Link>
        <span>学过 ≠ 掌握 · 慢慢来，也会走很远</span>
      </div>
    </footer>
  );
}
