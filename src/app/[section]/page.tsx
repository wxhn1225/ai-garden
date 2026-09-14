import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Catalog } from '@/components/catalog';
import { getEntries, summarize } from '@/lib/content';
import { sections } from '@/lib/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return sections
    .filter((item) => item.id !== 'all')
    .map((item) => ({ section: item.href.replaceAll('/', '') }));
}
async function getSection(params: Promise<{ section: string }>) {
  const { section } = await params;
  return sections.find((item) => item.href === `/${section}/`);
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const section = await getSection(params);
  return { title: section?.label };
}
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const section = await getSection(params);
  if (!section) notFound();
  return <Catalog key={section.id} entries={getEntries().map(summarize)} section={section.id} />;
}
