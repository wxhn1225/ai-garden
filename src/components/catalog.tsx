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
const deskOrder = ['refero', 'ui-ux-pro-max', '21st-dev', 'design-spells', 'learn-performance', 'react-bits'];
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
  const [showFilters, setShowFilters] = useState(false);
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
        if (sort === 'curated') {
          const aPosition = deskOrder.indexOf(a.slug);
          const bPosition = deskOrder.indexOf(b.slug);
          const priority =
            (aPosition < 0 ? deskOrder.length : aPosition) - (bPosition < 0 ? deskOrder.length : bPosition);
          if (priority) return priority;
          if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
        }
        return b.addedAt.localeCompare(a.addedAt) || a.title.localeCompare(b.title, 'zh-CN');
      });
  }, [inSection, query, kind, tag, sort, indexedSlugs]);
  const filtering = Boolean(query || kind !== '全部' || tag);

  return (
    <div className="catalog-page">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <div className="eyebrow">
            {section === 'all' ? 'IDEAS, REFERENCES & SMALL DISCOVERIES' : config.english}
          </div>
          <h1 id="page-title">
            {section === 'all' ? (
              <>
                <span className="title-greeting">今天，</span>
                <span className="title-question">
                  想研究<span className="hand">点什么？</span>
                </span>
              </>
            ) : (
              config.label
            )}
          </h1>
          <p className="intro">
            {section === 'all' ? (
              <>
                把散落的灵感收在一起，
                <br />
                给下一次动手，留一点线索。
              </>
            ) : (
              config.description
            )}
          </p>
        </div>
        <aside className="desk-note" aria-label="写给自己的便笺">
          <small>a little note to self</small>
          <p>
            先收下一个好想法，
            <br />
            再慢慢长出自己的理解。
          </p>
          <hr />
          <span className="note-end">保持好奇，留白也没关系。</span>
        </aside>
      </section>

      <section className="catalog-workspace" aria-label="查找资料">
        <div className="search-box">
          <Icon name="search" size={23} />
          <label className="sr-only" htmlFor="resource-search">
            搜索资料的名称、标签或正文
          </label>
          <input
            id="resource-search"
            ref={searchRef}
            type="search"
            autoComplete="off"
            placeholder="搜一个关键词，让思路开始……"
            value={query}
            onChange={(event) => update({ query: event.target.value }, true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                update({ query: '' }, true);
                searchRef.current?.blur();
              }
            }}
          />
          {query && (
            <button
              type="button"
              className="clear-search"
              onClick={() => {
                update({ query: '' }, true);
                searchRef.current?.focus();
              }}
            >
              清空
            </button>
          )}
          <kbd aria-label="按斜杠或 Ctrl K 搜索">/</kbd>
        </div>
        <div className="desk-heading">
          <h2>
            摊开资料，慢慢看 <span className="desk-count">{inSection.length} pieces on the desk</span>
          </h2>
          <span className="sort-note">灵感、工具与方法，都有自己的位置。</span>
        </div>

        <nav className="folder-nav" aria-label="资料板块">
          {sections.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="folder-tab"
              data-section={item.id}
              aria-current={section === item.id ? 'page' : undefined}
            >
              {item.id === 'prompts' ? 'Prompt' : item.id === 'notes' ? '笔记' : item.label}
              <span className="count">
                {item.id === 'all'
                  ? entries.length
                  : entries.filter((entry) => entry.section === item.id).length}
              </span>
            </Link>
          ))}
        </nav>
        <div className="folder-body" data-section={section}>
          <div className="folder-top">
            <p className="folder-label">
              {config.label} / {section === 'all' ? 'ALL MY FINDS' : config.english}
            </p>
            <div className="view-options">
              <button
                type="button"
                className="filter-toggle"
                aria-expanded={showFilters}
                aria-controls="catalog-filters"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Icon name="sliders" size={16} />
                筛选{kind !== '全部' || tag ? ' ·' : ''}
              </button>
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
          <div id="catalog-filters" className="catalog-filters" hidden={!showFilters}>
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
                </button>
              ))}
            </fieldset>
          </div>
          <div className="result-caption">
            <p aria-live="polite" aria-atomic="true">
              {filtering ? '找到' : '收好'} <strong>{matches.length}</strong> 份资料
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
              <span>阅读便笺，或沿着链接继续探索 ↗</span>
            )}
          </div>
          {matches.length ? (
            <div className={`resource-results papers ${view === 'list' ? 'list-view' : 'grid-view'}`}>
              {matches.map((entry) => (
                <ResourceCard key={entry.slug} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                …
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
        </div>
      </section>
    </div>
  );
}

function ResourceCard({ entry }: { entry: EntrySummary }) {
  const domain = entry.url ? new URL(entry.url).hostname.replace(/^www\./, '') : '拾知 · 本站内容';
  const section = sections.find((item) => item.id === entry.section);
  const tint =
    entry.section === 'skills'
      ? 'mint'
      : entry.section === 'performance'
        ? 'yellow'
        : entry.section === 'prompts' || entry.slug === 'design-spells'
          ? 'pink'
          : '';
  const featured = entry.slug === 'refero';
  return (
    <article
      className={`paper ${tint} ${featured ? 'featured' : ''} ${/[\u4e00-\u9fff]/.test(entry.title) ? 'paper-title-cn' : ''}`}
    >
      <div className="paper-kicker">
        <span className="section-label">{section?.label}</span>
        <span className="kind">{entry.kind}</span>
      </div>
      <h2 className="paper-title">
        <Link href={`/library/${entry.slug}/`} onClick={() => rememberCatalog(entry.slug)}>
          {entry.title}
        </Link>
      </h2>
      <p className="resource-description">{entry.description}</p>
      <div className="resource-tags">
        {entry.tags.map((item) => (
          <span key={item}># {item}</span>
        ))}
      </div>
      <div className="resource-footer">
        {entry.url ? (
          <a
            className="domain"
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            title={domain}
            aria-label={`访问 ${entry.title} 来源（新窗口）`}
          >
            <span>{domain}</span>
            <Icon name="external" size={13} />
          </a>
        ) : (
          <span className="domain">{domain}</span>
        )}
        <Link
          href={`/library/${entry.slug}/`}
          onClick={() => rememberCatalog(entry.slug)}
          className="source-link"
          aria-label={`阅读 ${entry.title} 便笺`}
        >
          {entry.section === 'prompts' ? '看提示词' : '读便笺'}
          <Icon name="arrowRight" size={15} />
        </Link>
      </div>
      {featured && (
        <span className="paper-monogram" aria-hidden="true">
          {entry.mark.slice(0, 1)}
        </span>
      )}
    </article>
  );
}
