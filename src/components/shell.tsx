'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sections, site } from '@/lib/site';
import { Icon } from './icon';

export function Shell({ children, counts }: { children: React.ReactNode; counts: Record<string, number> }) {
  const pathname = usePathname();
  const current = sections.find(
    (section) =>
      section.href === pathname || (section.id !== 'all' && pathname === section.href.slice(0, -1)),
  );

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        跳到主要内容
      </a>
      <aside className="sidebar" aria-label="主要导航">
        <Link href="/" className="brand" aria-label="拾知，返回资料库">
          <span className="brand-symbol" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-text">
            拾知<small>AI GARDEN</small>
          </span>
        </Link>
        <div className="nav-caption">
          我的知识花园<span>01 — 05</span>
        </div>
        <nav className="primary-nav">
          {sections.map((section) => (
            <Link
              href={section.href}
              key={section.id}
              aria-current={current?.id === section.id ? 'page' : undefined}
              className={current?.id === section.id ? 'nav-link is-active' : 'nav-link'}
            >
              <Icon name={section.icon} size={19} />
              <span>{section.label}</span>
              <span className="nav-count">{counts[section.id] || 0}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="garden-note">
            <span className="tiny-spark" aria-hidden="true">
              ✳
            </span>
            <p>
              保持好奇，
              <br />
              慢慢积累。
            </p>
            <span className="note-line" />
          </div>
          <a href={site.repository} target="_blank" rel="noreferrer" className="repo-link">
            <Icon name="github" size={18} />在 GitHub 上查看
            <Icon name="external" size={15} />
          </a>
          <span className="sidebar-footnote">A little more, every day.</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="desktop-only">个人学习空间</span>
            <Icon name="chevron" size={14} className="desktop-only" />
            <span>{current?.label || '资料详情'}</span>
          </div>
          <div className="top-actions">
            <span className="living-label">
              <i />
              持续整理中
            </span>
            <Link href="/notes/" className="quiet-button">
              <Icon name="notebook" size={16} />
              <span>记录与整理</span>
            </Link>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <span>拾知 · 好奇心的存放处</span>
          <span>
            一点发现，一点积累。
            <a href={site.repository} target="_blank" rel="noreferrer" aria-label="查看 GitHub 源码">
              <Icon name="github" size={16} />
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}
