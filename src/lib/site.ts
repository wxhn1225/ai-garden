export const site = {
  name: '拾知',
  englishName: 'AI GARDEN',
  description: '把值得留下的 AI 学习资料，慢慢整理成自己的知识。',
  repository: 'https://github.com/wxhn1225/ai-garden',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export const sections = [
  {
    id: 'all',
    href: '/',
    label: '全部资料',
    english: 'LIBRARY',
    description: '好资料，值得留一页。',
    icon: 'library',
  },
  {
    id: 'web',
    href: '/resources/',
    label: '网页设计',
    english: 'WEB & DESIGN',
    description: '收集好设计，也理解它为什么好。',
    icon: 'layout',
  },
  {
    id: 'skills',
    href: '/skills/',
    label: 'Skills',
    english: 'AGENT SKILLS',
    description: '让方法可复用，让工具更顺手。',
    icon: 'sparkles',
  },
  {
    id: 'performance',
    href: '/performance/',
    label: '性能优化',
    english: 'PERFORMANCE',
    description: '从理解指标，到找到真正的瓶颈。',
    icon: 'gauge',
  },
  {
    id: 'prompts',
    href: '/prompts/',
    label: 'Prompt / 工作流',
    english: 'PROMPTS & FLOWS',
    description: '把一次好结果，整理成下一次的起点。',
    icon: 'terminal',
  },
  {
    id: 'notes',
    href: '/notes/',
    label: '学习笔记',
    english: 'FIELD NOTES',
    description: '给看过的资料，留下一点自己的理解。',
    icon: 'notebook',
  },
] as const;

export type SectionId = (typeof sections)[number]['id'];
export const kinds = ['全部', '灵感', '组件', '模板', 'UX', 'Skill', '指南', 'Prompt', '笔记'] as const;
export type Kind = (typeof kinds)[number];
