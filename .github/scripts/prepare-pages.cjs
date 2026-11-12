'use strict';

const fs = require('node:fs');
const path = require('node:path');

const sourceDir = process.argv[2];

if (!sourceDir || !fs.existsSync(sourceDir)) {
  console.error('Usage: node .github/scripts/prepare-pages.cjs <pages-directory>');
  process.exit(1);
}

const skip = new Set(['index.html', '404.html']);
let prepared = 0;

for (const filename of fs.readdirSync(sourceDir)) {
  if (!filename.endsWith('.html') || skip.has(filename)) continue;

  const filePath = path.join(sourceDir, filename);
  const html = fs.readFileSync(filePath, 'utf8');

  if (/^---\r?\n/.test(html)) continue;

  const slug = filename.slice(0, -'.html'.length);
  const frontMatter = `---\nlayout: null\npermalink: /${slug}\n---\n`;

  fs.writeFileSync(filePath, frontMatter + html);
  prepared += 1;
}

console.log(`Prepared ${prepared} pages with extensionless permalinks.`);
