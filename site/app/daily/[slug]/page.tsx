import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentLayout } from "@/components/document-layout";
import { getAllContent, getContentBySlug } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllContent("daily").map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const document = getContentBySlug("daily", slug);
  return document ? { title: document.title, description: document.summary } : {};
}

export default async function DailyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = getContentBySlug("daily", slug);
  if (!document) notFound();
  return <DocumentLayout document={document} />;
}
