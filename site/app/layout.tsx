import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark-dimmed.css";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "小鱼 · Learning Lab",
    template: "%s · 小鱼的 Lab",
  },
  description:
    "小鱼的学习空间：从 Karpathy 到 CS336，记录课程、代码实验与真实的理解。",
  metadataBase: new URL("https://feng-nengyu.github.io/zero-GPT/"),
  openGraph: {
    title: "小鱼 · Learning Lab",
    description:
      "A public learning lab for language models, systems and embodied AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="page-noise" />
        <a className="skip-link" href="#main-content">
          跳到正文
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
