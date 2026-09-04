import type { Metadata } from "next";
import { ContentIndex } from "@/components/content-index";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <ContentIndex
      eyebrow="Proof of Work"
      title="能运行、能解释、能验证的成果"
      description="课程代码会逐步长成项目；项目必须说明问题、个人贡献、实验结果与下一步。"
      documents={getAllContent("projects")}
    />
  );
}
