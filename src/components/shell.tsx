import Link from 'next/link';
import { site } from '@/lib/site';
import { Icon } from './icon';

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <a href="#main-content" className="skip-link">
        跳到主要内容
      </a>
      <header className="toolbar">
        <Link href="/" className="brand" aria-label="拾知，返回资料库">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="brand-word">拾知</span>
          <span className="brand-caption">A PERSONAL LEARNING STUDIO</span>
        </Link>
        <div className="toolbar-right">
          <span className="status-note">持续整理中</span>
          <Link href="/library/keeping-notes/" className="quiet-button">
            <Icon name="plus" size={17} />
            添加资料
          </Link>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <span>一个安放灵感、方法和学习笔记的小地方。</span>
        <a href={site.repository} target="_blank" rel="noreferrer">
          在 GitHub 上一起整理
          <Icon name="external" size={16} />
        </a>
      </footer>
    </div>
  );
}
