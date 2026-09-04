import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell not-found">
      <p className="eyebrow">404 · Lost note</p>
      <h1>这页还没有写进学习轨迹。</h1>
      <p>可能是内容正在整理，也可能是链接已经移动。</p>
      <Link className="button button-primary" href="/">
        回到正在学习的地方
      </Link>
    </div>
  );
}
