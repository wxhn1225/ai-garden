import type { Metadata, Viewport } from 'next';
import { Shell } from '@/components/shell';
import { getEntries } from '@/lib/content';
import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '拾知 · AI 学习资料库', template: '%s · 拾知' },
  description: site.description,
  icons: { icon: `${site.basePath}/icon.svg` },
};
export const viewport: Viewport = { themeColor: '#f7f8fa', colorScheme: 'light' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const entries = getEntries();
  const counts: Record<string, number> = { all: entries.length };
  for (const entry of entries) counts[entry.section] = (counts[entry.section] || 0) + 1;
  return (
    <html lang="zh-CN">
      <body>
        <Shell counts={counts}>{children}</Shell>
      </body>
    </html>
  );
}
