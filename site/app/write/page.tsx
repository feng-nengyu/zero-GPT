import type { Metadata } from "next";
import { DraftEditor } from "@/components/draft-editor";
export const metadata: Metadata = {
  title: "随手记",
  robots: { index: false, follow: true },
};
export default function WritePage() {
  return (
    <div className="shell page-shell write-shell">
      <header className="page-intro">
        <p className="eyebrow">A PLACE FOR UNFINISHED IDEAS</p>
        <h1>先记下来，再慢慢想。</h1>
        <p>
          一段代码、一个疑问，或者今天终于理解的事。也可以直接在对话里发给我，我来整理成笔记和博客。
        </p>
      </header>
      <DraftEditor />
    </div>
  );
}
