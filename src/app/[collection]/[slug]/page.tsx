import { SiteContentPage } from "@/components/content/site-content-page";
import { getSitePage, sitePages } from "@/server/content/site-pages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ContentPageProps = {
  params: Promise<{ collection: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return sitePages
    .filter((page) => page.path !== "/")
    .map((page) => ({ collection: page.collection, slug: page.slug }));
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { collection, slug } = await params;
  const page = getSitePage(collection, slug);

  if (!page || page.path === "/") return {};

  return {
    title: `${page.navigationLabel}｜AI 基础教育`,
    description: page.description,
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { collection, slug } = await params;
  const page = getSitePage(collection, slug);

  if (!page || page.path === "/") notFound();

  return <SiteContentPage page={page} />;
}
