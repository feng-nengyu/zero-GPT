import type { Metadata } from "next";
import { ContentIndex } from "@/components/content-index";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = { title: "Notes" };

export default function NotesPage() {
  return (
    <ContentIndex
      eyebrow="Knowledge Base"
      title="从记录，走到真正掌握"
      description="每篇笔记都会逐步补齐问题、概念图、最小实验、踩坑和掌握证据。旧笔记先接入，再随学习逐步升级。"
      documents={getAllContent("notes")}
    />
  );
}
