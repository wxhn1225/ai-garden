import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BackLink } from '@/components/back-link';
import { CopyButton } from '@/components/copy-button';
import { Icon } from '@/components/icon';
import { formatDate, getEntries } from '@/lib/content';
import { sections, site } from '@/lib/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return getEntries().map((entry) => ({ slug: entry.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntries().find((item) => item.slug === slug);
  return { title: entry?.title, description: entry?.description };
}
function headingId(value: string) {
  return value.trim().replace(/\s+/g, '-');
}

export default async function EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entries = getEntries();
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) notFound();
  const section = sections.find((item) => item.id === entry.section) || sections[0];
  const headings: string[] = [];
  let fence = '';
  for (const line of entry.body.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = '';
      continue;
    }
    if (!fence && line.startsWith('## ')) headings.push(line.slice(3).trim());
  }
  const related = entries
    .filter(
      (item) =>
        item.slug !== slug &&
        item.section === entry.section &&
        item.tags.some((tag) => entry.tags.includes(tag)),
    )
    .slice(0, 3);
  const prompt =
    entry.section === 'prompts' ? entry.body.match(/```[^\n]*\n([\s\S]*?)```/)?.[1]?.trim() : undefined;

  return (
    <div className="detail-page">
      <BackLink slug={slug} fallback={section.href} label={section.label} />
      <div className="detail-layout">
        <article className="detail-article" data-pagefind-body>
          <div className="detail-kicker">
            <span className={`resource-mark mark-${entry.color}`} aria-hidden="true">
              {entry.mark}
            </span>
            <span>
              {section.label} / {entry.kind}
            </span>
          </div>
          <h1 data-pagefind-meta="title">{entry.title}</h1>
          <p className="detail-description" data-pagefind-meta="description">
            {entry.description}
          </p>
          <div className="detail-actions" data-pagefind-ignore>
            {entry.url && (
              <a href={entry.url} target="_blank" rel="noreferrer" className="primary-button">
                访问原始来源
                <Icon name="external" size={18} />
              </a>
            )}
            {prompt && <CopyButton text={prompt} label="复制提示词" />}
            <CopyButton />
          </div>
          <div className="detail-meta">
            <span>
              收录于 <time dateTime={entry.addedAt}>{formatDate(entry.addedAt)}</time>
            </span>
            <span>
              更新于 <time dateTime={entry.updatedAt}>{formatDate(entry.updatedAt)}</time>
            </span>
            <span>
              {entry.origin === 'original'
                ? '来自原始收藏'
                : entry.origin === 'research'
                  ? '资源调研整理'
                  : '本站整理'}
            </span>
          </div>
          <div className="prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    {...(href?.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {entry.body}
            </ReactMarkdown>
          </div>
        </article>
        <aside className="detail-sidebar" aria-label="资料辅助信息">
          <div className="detail-aside-section">
            <span className="aside-label">ON THIS PAGE / 本页目录</span>
            {headings.map((title) => (
              <a key={title} href={`#${headingId(title)}`}>
                {title}
              </a>
            ))}
          </div>
          <div className="detail-aside-section">
            <span className="aside-label">TOPICS / 相关主题</span>
            <div className="resource-tags">
              {entry.tags.map((tag) => (
                <Link key={tag} href={`${section.href}?tag=${encodeURIComponent(tag)}`}>
                  <span>{tag}</span>
                </Link>
              ))}
            </div>
          </div>
          {related.length > 0 && (
            <div className="detail-aside-section">
              <span className="aside-label">KEEP EXPLORING / 接着看看</span>
              {related.map((item) => (
                <Link href={`/library/${item.slug}/`} key={item.slug}>
                  {item.title} ↗
                </Link>
              ))}
            </div>
          )}
          <div className="edit-note">
            有新的发现，就补一笔。
            <br />
            <a href={`${site.repository}/edit/main/${entry.sourcePath}`} target="_blank" rel="noreferrer">
              在 GitHub 编辑这份资料 ↗
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
