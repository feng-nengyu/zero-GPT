import type { Metadata } from "next";
import { ContentIndex } from "@/components/content-index";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <ContentIndex
      eyebrow="MY FIELD NOTES"
      title="有些想法，值得留久一点。"
      description="自己的理解、实验和阶段复盘。由真实学习和我们的对话慢慢整理，长短都可以。"
      documents={getAllContent("blog")}
    />
  );
}
