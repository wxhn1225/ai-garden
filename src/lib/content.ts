import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { kinds } from './site';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  section: z.enum(['web', 'skills', 'performance', 'prompts', 'notes']),
  kind: z.enum(kinds).refine((value) => value !== '全部'),
  url: z
    .url()
    .refine((value) => /^https?:\/\//.test(value))
    .optional(),
  tags: z.array(z.string().min(1)).min(1),
  addedAt: z.iso.date(),
  updatedAt: z.iso.date(),
  origin: z.enum(['original', 'research', 'editorial']),
  featured: z.boolean().default(false),
  mark: z.string().min(1).max(4),
  color: z.enum(['blue', 'violet', 'orange', 'teal', 'rose', 'slate']).default('blue'),
});

export type Entry = z.infer<typeof schema> & { slug: string; body: string; sourcePath: string };
export type EntrySummary = Omit<Entry, 'body' | 'sourcePath'> & { searchText: string };

let cache: Entry[] | undefined;

export function getEntries(): Entry[] {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  const root = path.join(process.cwd(), 'content');
  const files = fs
    .readdirSync(root, { recursive: true })
    .map(String)
    .filter((name) => name.endsWith('.md'));
  const seen = new Set<string>();
  const entries = files
    .map((file) => {
      const slug = path.basename(file, '.md');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || seen.has(slug))
        throw new Error(`Invalid or duplicate content slug: ${file}`);
      seen.add(slug);
      const { data, content } = matter(fs.readFileSync(path.join(root, file), 'utf8'));
      const parsed = schema.safeParse(data);
      if (!parsed.success) throw new Error(`Invalid frontmatter in ${file}: ${parsed.error.message}`);
      return { ...parsed.data, slug, body: content, sourcePath: `content/${file.replaceAll('\\', '/')}` };
    })
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.title.localeCompare(b.title, 'zh-CN'));
  cache = entries;
  return entries;
}

export function summarize(entry: Entry): EntrySummary {
  const { body, sourcePath: _, ...meta } = entry;
  return {
    ...meta,
    searchText:
      `${meta.title} ${meta.description} ${meta.tags.join(' ')} ${meta.url || ''} ${body}`.toLocaleLowerCase(),
  };
}

export function formatDate(value: string): string {
  return value.replaceAll('-', '.');
}
