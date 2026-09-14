'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { EntrySummary } from '@/lib/content';
import { type Kind, kinds, type SectionId, sections, site } from '@/lib/site';
import { rememberCatalog } from './back-link';
import { Icon } from './icon';

type Filters = {
  query: string;
  kind: Kind;
  tag: string;
  sort: 'curated' | 'newest' | 'az';
  view: 'grid' | 'list';
};
const defaults: Filters = { query: '', kind: '全部', tag: '', sort: 'curated', view: 'grid' };
type SearchIndex = {
  search: (query: string) => Promise<{ results: { data: () => Promise<{ url: string }> }[] }>;
};
let indexPromise: Promise<SearchIndex> | undefined;

function readFilters(): Filters {
  const params = new URLSearchParams(window.location.search);
  const kind = params.get('type');
  const sort = params.get('sort');
  const view = params.get('view');
  return {
    query: params.get('q') || '',
    kind: kinds.includes(kind as Kind) ? (kind as Kind) : '全部',
    tag: params.get('tag') || '',
    sort: sort === 'newest' || sort === 'az' ? sort : 'curated',
    view: view === 'list' ? 'list' : 'grid',
  };
}

export function Catalog({ entries, section = 'all' }: { entries: EntrySummary[]; section?: SectionId }) {
  const config = sections.find((item) => item.id === section) || sections[0];
  const [filters, setFilters] = useState<Filters>(defaults);
  const [indexedSlugs, setIndexedSlugs] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const { query, kind, tag, sort, view } = filters;

  useEffect(() => {
    const restore = () => setFilters(readFilters());
    restore();
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const editing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') ||
        (event.key === '/' && !editing)
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('popstate', restore);
    window.addEventListener('keydown', keyboard);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('keydown', keyboard);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIndexedSlugs(new Set());
    if (!query.trim() || process.env.NODE_ENV !== 'production') return;
    const timer = window.setTimeout(async () => {
      try {
        const indexUrl = `${site.basePath}/pagefind/pagefind.js`;
        indexPromise ||= import(
          /* webpackIgnore: true */ /* turbopackIgnore: true */ indexUrl
        ) as Promise<SearchIndex>;
        const index = await indexPromise;
        const result = await index.search(query);
        const pages = await Promise.all(result.results.map((item) => item.data()));
        if (!cancelled)
          setIndexedSlugs(new Set(pages.map((page) => page.url.split('/').filter(Boolean).at(-1) || '')));
      } catch {
        // The local text index remains available if Pagefind cannot load.
        indexPromise = undefined;
      }
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  function update(change: Partial<Filters>, replace = false) {
    const next = { ...filters, ...change };
    setFilters(next);
    const params = new URLSearchParams();
    if (next.query) params.set('q', next.query);
    if (next.kind !== '全部') params.set('type', next.kind);
    if (next.tag) params.set('tag', next.tag);
    if (next.sort !== 'curated') params.set('sort', next.sort);
    if (next.view !== 'grid') params.set('view', next.view);
    const suffix = params.size ? `?${params}` : '';
    window.history[replace ? 'replaceState' : 'pushState'](null, '', `${window.location.pathname}${suffix}`);
  }

  const inSection = useMemo(
    () => entries.filter((entry) => section === 'all' || entry.section === section),
    [entries, section],
  );
  const availableKinds = kinds.filter(
    (item) => item === '全部' || inSection.some((entry) => entry.kind === item),
  );
  const topTags = useMemo(() => {
    const totals = new Map<string, number>();
    for (const entry of inSection)
      for (const item of entry.tags) totals.set(item, (totals.get(item) || 0) + 1);
    return [...totals]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  }, [inSection]);
  const matches = useMemo(() => {
    const tokens = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    return inSection
      .filter(
        (entry) =>
          (kind === '全部' || entry.kind === kind) &&
          (!tag || entry.tags.includes(tag)) &&
          (tokens.every((token) => entry.searchText.includes(token)) || indexedSlugs.has(entry.slug)),
      )
      .sort((a, b) => {
        if (sort === 'az') return a.title.localeCompare(b.title, 'zh-CN');
        if (sort === 'curated' && a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
        return b.addedAt.localeCompare(a.addedAt) || a.title.localeCompare(b.title, 'zh-CN');
      });
  }, [inSection, query, kind, tag, sort, indexedSlugs]);
  const filtering = Boolean(query || kind !== '全部' || tag);

  return (
    <div className="catalog-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span />
            {config.english}
            <span className="edition">/ PERSONAL COLLECTION</span>
          </div>
          <h1>
            {section === 'all' ? '我的学习资料库' : config.label}
            <span className="heading-period">.</span>
          </h1>
          <p>{config.description}</p>
        </div>
        <div className="collection-number">
          <strong>{String(inSection.length).padStart(2, '0')}</strong>
          <span>份值得留下的资料</span>
        </div>
      </div>

      {section === 'all' && (
        <nav className="collection-paths" aria-label="快速进入板块">
          <Link href="/resources/" className="path-card path-blue">
            <span className="path-index">01 / FIND INSPIRATION</span>
            <div>
              <span>看见好设计</span>
              <Icon name="external" size={21} />
            </div>
            <p>网站、组件与交互灵感</p>
            <span className="path-icon" aria-hidden="true">
              <Icon name="layout" size={44} />
            </span>
          </Link>
          <Link href="/skills/" className="path-card path-peach">
            <span className="path-index">02 / BUILD YOUR TOOLKIT</span>
            <div>
              <span>让方法成为工具</span>
              <Icon name="external" size={21} />
            </div>
            <p>设计 Skills 与实践方法</p>
            <span className="path-icon" aria-hidden="true">
              <Icon name="sparkles" size={44} />
            </span>
          </Link>
          <Link href="/notes/" className="path-card path-neutral">
            <span className="path-index">03 / MAKE IT YOURS</span>
            <div>
              <span>留下一点思考</span>
              <Icon name="external" size={21} />
            </div>
            <p>笔记、复盘与自己的理解</p>
            <span className="path-icon" aria-hidden="true">
              <Icon name="notebook" size={44} />
            </span>
          </Link>
        </nav>
      )}

      <section className="catalog-workspace" aria-label="查找资料">
        <div className="search-row">
          <label className="search-box" htmlFor="resource-search">
            <Icon name="search" size={21} />
            <span className="sr-only">搜索资料的名称、标签或正文</span>
            <input
              id="resource-search"
              ref={searchRef}
              type="search"
              autoComplete="off"
              placeholder="找一份资料，或一个新灵感…"
              value={query}
              onChange={(event) => update({ query: event.target.value }, true)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  update({ query: '' }, true);
                  searchRef.current?.blur();
                }
              }}
            />
            <kbd>Ctrl K</kbd>
          </label>
          <Link href="/library/keeping-notes/" className="add-resource" aria-label="添加资料">
            <Icon name="plus" size={18} />
            <span>添加资料</span>
          </Link>
        </div>
        <div className="quick-tags">
          <span>试试这些</span>
          {topTags.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => update({ tag: tag === item ? '' : item })}
              aria-pressed={tag === item}
            >
              # {item}
            </button>
          ))}
        </div>
        <div className="catalog-toolbar">
          <fieldset className="type-tabs" aria-label="资料类型">
            {availableKinds.map((item) => (
              <button
                type="button"
                key={item}
                className={kind === item ? 'type-tab active' : 'type-tab'}
                aria-pressed={kind === item}
                onClick={() => update({ kind: item })}
              >
                {item}
                {item === '全部' && <span>{inSection.length}</span>}
              </button>
            ))}
          </fieldset>
          <div className="view-options">
            <label className="sort-select">
              <Icon name="sort" size={16} />
              <span className="sr-only">排列顺序</span>
              <select
                value={sort}
                onChange={(event) => update({ sort: event.target.value as Filters['sort'] })}
              >
                <option value="curated">推荐顺序</option>
                <option value="newest">最近收录</option>
                <option value="az">名称 A—Z</option>
              </select>
            </label>
            <fieldset className="view-toggle" aria-label="显示方式">
              <button
                type="button"
                aria-label="卡片视图"
                aria-pressed={view === 'grid'}
                onClick={() => update({ view: 'grid' })}
              >
                <Icon name="layout" size={17} />
              </button>
              <button
                type="button"
                aria-label="列表视图"
                aria-pressed={view === 'list'}
                onClick={() => update({ view: 'list' })}
              >
                <Icon name="list" size={18} />
              </button>
            </fieldset>
          </div>
        </div>
        <div className="result-caption">
          <p aria-live="polite" aria-atomic="true">
            {filtering ? '找到' : '全部收录'} <strong>{matches.length}</strong> 份资料
            {tag && (
              <button type="button" className="selected-tag" onClick={() => update({ tag: '' })}>
                {tag}
                <Icon name="x" size={12} />
              </button>
            )}
          </p>
          {filtering ? (
            <button
              className="text-button"
              type="button"
              onClick={() => update({ query: '', kind: '全部', tag: '' })}
            >
              清除筛选
              <Icon name="x" size={13} />
            </button>
          ) : (
            <span>为下一次用到时，提前收好。</span>
          )}
        </div>
        {matches.length ? (
          <div className={`resource-results ${view === 'list' ? 'list-view' : 'grid-view'}`}>
            {matches.map((entry) => (
              <ResourceCard key={entry.slug} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="search" size={30} />
            </span>
            <h2>{query ? `没有找到「${query}」` : '这个组合里还没有资料'}</h2>
            <p>换个关键词，或清除筛选后看看全部收录。</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                update({ query: '', kind: '全部', tag: '' });
                searchRef.current?.focus();
              }}
            >
              清除筛选
            </button>
          </div>
        )}
        <div className="catalog-end">
          <span />
          <p>收藏是起点，实践让知识留下来。</p>
          <span />
        </div>
      </section>
    </div>
  );
}

function ResourceCard({ entry }: { entry: EntrySummary }) {
  const domain = entry.url ? new URL(entry.url).hostname.replace(/^www\./, '') : '拾知 · 本站内容';
  return (
    <article className="resource-card">
      <div className="resource-heading">
        <span className={`resource-mark mark-${entry.color}`} aria-hidden="true">
          {entry.mark}
        </span>
        <div className="resource-title">
          <span className="resource-kind">{entry.kind}</span>
          <h2>
            <Link href={`/library/${entry.slug}/`} onClick={() => rememberCatalog(entry.slug)}>
              {entry.title}
            </Link>
          </h2>
        </div>
        <Link
          href={`/library/${entry.slug}/`}
          onClick={() => rememberCatalog(entry.slug)}
          className="card-arrow"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Icon name="arrowRight" size={18} />
        </Link>
      </div>
      <p className="resource-description">{entry.description}</p>
      <div className="resource-tags">
        {entry.tags.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="resource-footer">
        <span className="resource-domain" title={domain}>
          <span aria-hidden="true" className="source-dot" />
          {domain}
        </span>
        {entry.url ? (
          <a
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`访问 ${entry.title} 来源（新窗口）`}
            className="source-link"
          >
            访问
            <Icon name="external" size={15} />
          </a>
        ) : (
          <Link
            href={`/library/${entry.slug}/`}
            onClick={() => rememberCatalog(entry.slug)}
            className="source-link"
          >
            阅读
            <Icon name="arrowRight" size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}
