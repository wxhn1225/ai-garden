'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sections, site } from '@/lib/site';
import { Icon } from './icon';

export function rememberCatalog(slug: string) {
  try {
    window.sessionStorage.setItem('ai-garden:return', JSON.stringify({ slug, from: window.location.href }));
  } catch {
    /* Browsing works without session storage. */
  }
}

export function BackLink({ slug, fallback, label }: { slug: string; fallback: string; label: string }) {
  const [target, setTarget] = useState(fallback);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem('ai-garden:return') || 'null');
      if (saved?.slug !== slug || typeof saved.from !== 'string') return;
      const url = new URL(saved.from);
      if (url.origin !== window.location.origin) return;
      const path = url.pathname.slice(site.basePath.length);
      if (site.basePath && !url.pathname.startsWith(`${site.basePath}/`)) return;
      if (!sections.some((section) => section.href === path)) return;
      setTarget(`${path}${url.search}`);
      setRestored(true);
    } catch {
      /* Direct visits use the section link. */
    }
  }, [slug]);
  return (
    <Link href={target} className="back-link">
      <Icon name="arrowLeft" size={16} />
      {restored ? '返回刚才的资料列表' : `返回${label}`}
    </Link>
  );
}
