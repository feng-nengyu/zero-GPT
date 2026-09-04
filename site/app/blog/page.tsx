import type { Metadata } from "next";
import { ContentIndex } from "@/components/content-index";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <ContentIndex
      eyebrow="Weekly Field Notes"
      title="阶段复盘与技术长文"
      description="周报从真实学习证据中生成：本周理解发生了什么变化、留下了哪些代码、下周解决什么。"
      documents={getAllContent("blog")}
    />
  );
}
