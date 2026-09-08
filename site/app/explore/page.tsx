import type { Metadata } from "next";
import { getExplore } from "@/lib/content";
import { ExploreShelf } from "@/components/explore-shelf";
import { FragmentCard } from "@/components/fragment-card";
export const metadata: Metadata = { title: "随便看看" };
export default function ExplorePage() {
  const data = getExplore();
  return (
    <div className="shell page-shell">
      <header className="page-intro">
        <p className="eyebrow">THE CURIOSITY SHELF</p>
        <h1>没有任务，只有好奇。</h1>
        <p>论文、博客，和偶然点亮的一个想法。挑一小段看看就好。</p>
      </header>
      <div className="explore-intro">
        <FragmentCard fragments={data.fragments} />
        <aside className="shelf-note">
          <span>↗</span>
          <h2>给无聊留个好去处</h2>
          <p>
            这些是助手挑选的延伸阅读，和你的学习成果分开存放。阅读时长是建议的首轮浏览时间，不是全文用时。
          </p>
          <small>链接核对于 {data.checked} · 不计入每日待办</small>
        </aside>
      </div>
      <ExploreShelf readings={data.readings} />
    </div>
  );
}
