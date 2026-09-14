import Link from 'next/link';
import { Icon } from '@/components/icon';

export default function NotFound() {
  return (
    <div className="not-found">
      <span>404</span>
      <h1>这一页，还没被收进来。</h1>
      <p>链接可能已经变更。回到资料库，找找其他有用的内容。</p>
      <Link className="primary-button" href="/">
        <Icon name="arrowLeft" size={17} />
        返回资料库
      </Link>
    </div>
  );
}
