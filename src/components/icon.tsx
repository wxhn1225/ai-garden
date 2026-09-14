import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  FileText,
  FolderOpen,
  Gauge,
  GitFork,
  LayoutGrid,
  Library,
  List,
  Menu,
  NotebookPen,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';

const icons = {
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  external: ArrowUpRight,
  check: Check,
  chevron: ChevronRight,
  copy: Copy,
  file: FileText,
  folder: FolderOpen,
  gauge: Gauge,
  github: GitFork,
  layout: LayoutGrid,
  library: Library,
  list: List,
  menu: Menu,
  notebook: NotebookPen,
  plus: Plus,
  search: Search,
  sliders: SlidersHorizontal,
  sort: ArrowDownUp,
  sparkles: Sparkles,
  terminal: Terminal,
  x: X,
};

export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={1.7} aria-hidden="true" className={className} />;
}
