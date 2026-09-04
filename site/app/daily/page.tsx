import type { Metadata } from "next";
import { ContentIndex } from "@/components/content-index";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = { title: "Daily" };

export default function DailyPage() {
  return (
    <ContentIndex
      eyebrow="Daily Log"
      title="每天真实推进了什么"
      description="三个重点、实际进展、理解漏洞和下一步都会留在这里。未完成不是失败，只需要被顺延或拆小。"
      documents={getAllContent("daily")}
    />
  );
}
