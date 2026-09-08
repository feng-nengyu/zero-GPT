import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark-dimmed.css";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Feng Nengyu · Learning Lab",
    template: "%s · Learning Lab",
  },
  description:
    "从神经网络基础出发，持续构建 LLM、RAG、VLA 与 AI systems 能力。",
  metadataBase: new URL("https://feng-nengyu.github.io/zero-GPT/"),
  openGraph: {
    title: "Feng Nengyu · Learning Lab",
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
