import type { Metadata, Viewport } from 'next';
import { Shell } from '@/components/shell';
import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '拾知 · AI 学习资料库', template: '%s · 拾知' },
  description: site.description,
  icons: { icon: `${site.basePath}/icon.svg` },
};
export const viewport: Viewport = { themeColor: '#f6f3ec', colorScheme: 'light' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
