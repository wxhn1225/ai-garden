import fs from 'node:fs';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
fs.writeFileSync('out/.nojekyll', '');
fs.writeFileSync('out/site-config.json', JSON.stringify({ basePath }));
console.log(`Static export ready at ${basePath || '/'}`);
