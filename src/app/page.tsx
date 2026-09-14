import { Catalog } from '@/components/catalog';
import { getEntries, summarize } from '@/lib/content';

export default function Home() {
  return <Catalog entries={getEntries().map(summarize)} />;
}
