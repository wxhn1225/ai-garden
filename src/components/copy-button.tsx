'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './icon';

export function CopyButton({ text, label = '复制链接' }: { text?: string; label?: string }) {
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text || window.location.href);
      setStatus('done');
    } catch {
      setStatus('error');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2400);
  }
  return (
    <>
      <button type="button" className="secondary-button" onClick={copy}>
        <Icon name={status === 'done' ? 'check' : 'copy'} size={16} />
        {status === 'done' ? '已复制' : label}
      </button>
      <span className="sr-only" role="status">
        {status === 'done' ? '复制成功' : status === 'error' ? '复制失败，请手动选中文字复制。' : ''}
      </span>
      {status === 'error' && <span className="copy-feedback">请手动选中文字复制</span>}
    </>
  );
}
