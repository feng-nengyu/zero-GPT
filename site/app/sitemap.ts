import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content";

const siteUrl = "https://feng-nengyu.github.io/zero-GPT";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/roadmap", "/daily", "/notes", "/blog", "/projects", "/about"];
  const dynamicRoutes = (["daily", "notes", "blog", "projects"] as const).flatMap((kind) =>
    getAllContent(kind).map((document) => `/${kind}/${document.slug}`),
  );

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-09-04"),
    changeFrequency: route === "" || route === "/daily" ? "daily" : "weekly",
  }));
}
