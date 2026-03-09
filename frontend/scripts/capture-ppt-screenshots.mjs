import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseUrl = 'http://127.0.0.1:5173';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(scriptDir, '../../docs/screenshots/ppt');
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  { route: '/home', file: '01-home.png' },
  { route: '/spots', file: '02-spots.png' },
  { route: '/recommend', file: '03-recommend.png' },
  { route: '/route', file: '04-route.png' },
  { route: '/result', file: '05-result.png' },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
const page = await context.newPage();

for (const item of pages) {
  await page.goto(`${baseUrl}${item.route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, item.file), fullPage: true });
}

await browser.close();
console.log(`Saved screenshots to ${outDir}`);
