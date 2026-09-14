import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = path.resolve('out');
const { basePath } = JSON.parse(fs.readFileSync(path.join(root, 'site-config.json'), 'utf8'));
const entries = fs
  .readdirSync('content', { recursive: true })
  .map(String)
  .filter((file) => file.endsWith('.md'))
  .map((file) => ({
    slug: path.basename(file, '.md'),
    ...matter(fs.readFileSync(path.join('content', file), 'utf8')).data,
  }));
assert.equal(
  new Set(entries.map((entry) => entry.slug)).size,
  entries.length,
  'Content slugs must be unique',
);
assert.ok(fs.existsSync(path.join(root, '.nojekyll')));
assert.ok(fs.existsSync(path.join(root, 'pagefind/pagefind.js')));
const files = fs
  .readdirSync(root, { recursive: true })
  .map(String)
  .filter((file) => file.endsWith('.html'));
let localLinks = 0;
for (const entry of entries) {
  const file = path.join(root, 'library', entry.slug, 'index.html');
  assert.ok(fs.existsSync(file), `Missing detail page: ${entry.slug}`);
  const html = fs.readFileSync(file, 'utf8');
  assert.ok(html.includes('data-pagefind-body'), `Detail page is not indexed: ${entry.slug}`);
  assert.ok(html.includes('lang="zh-CN"'), 'Document language is missing');
}
for (const page of files) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.ok(!html.includes('NEXT_HTTP_ERROR_FALLBACK;500'), `Server error in ${page}`);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(decodeURIComponent(match[1])), `Broken heading anchor: ${page} -> ${match[1]}`);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const url = match[1].replaceAll('&amp;', '&');
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    const pathname = decodeURIComponent(url.split(/[?#]/)[0]);
    assert.ok(
      !basePath || pathname === basePath || pathname.startsWith(`${basePath}/`),
      `Missing basePath: ${page} -> ${pathname}`,
    );
    const relative = pathname.slice(basePath.length).replace(/^\/+/, '');
    const file = path.join(root, relative);
    assert.ok(fs.existsSync(file), `Broken local target: ${page} -> ${pathname}`);
    localLinks++;
  }
}
for (const route of ['', 'resources', 'skills', 'performance', 'prompts', 'notes'])
  assert.ok(fs.existsSync(path.join(root, route, 'index.html')), `Missing section: ${route}`);
console.log(
  `Verified ${entries.length} Markdown entries, ${files.length} exported pages, ${localLinks} local references, and Pagefind assets at ${basePath || '/'}.`,
);
