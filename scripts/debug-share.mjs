import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { ROOT } from './lib/env.mjs';

const require = createRequire(import.meta.url);
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8123';

const globalRoot = execSync('npm root -g').toString().trim();
const playwright = require(path.join(globalRoot, 'playwright'));

const base = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'ms-playwright');
let executablePath;
for (const entry of fs.readdirSync(base)) {
  if (!/^chromium/i.test(entry)) continue;
  for (const rel of [['chrome-headless-shell-win64', 'chrome-headless-shell.exe'], ['chrome-win64', 'chrome.exe']]) {
    const f = path.join(base, entry, rel[0], rel[1]);
    if (fs.existsSync(f)) { executablePath = f; break; }
  }
  if (executablePath) break;
}

const browser = await playwright.chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write']
});
const page = await context.newPage();
page.on('console', (m) => console.log('  [console:' + m.type() + ']', m.text()));
page.on('pageerror', (e) => console.log('  [pageerror]', e.message));

await page.goto(BASE + '/article.html?id=98', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const info = await page.evaluate(() => ({
  hasShare: typeof navigator.share,
  hasClipboard: !!(navigator.clipboard && navigator.clipboard.writeText),
  perm: navigator.permissions ? 'yes' : 'no'
}));
console.log('INFO', JSON.stringify(info));

const shareUrl = await page.evaluate(() => window.NISupabase.articleShareUrl(98));
console.log('SHARE URL', shareUrl);

await page.click('#article-share');
await page.waitForTimeout(1500);

const after = await page.evaluate(() => ({
  toast: document.querySelector('.ni-toast') ? document.querySelector('.ni-toast').textContent : null,
  html: document.body.innerHTML.includes('ni-toast')
}));
console.log('AFTER', JSON.stringify(after));

const clip = await page.evaluate(async () => {
  try { return await navigator.clipboard.readText(); } catch (e) { return 'ERR ' + e.message; }
});
console.log('CLIP', JSON.stringify(clip));

const manual = await page.evaluate(async () => {
  try { await navigator.clipboard.writeText('https://www.ypinurulilmi.or.id/article.html?id=98'); return 'ok'; }
  catch (e) { return 'ERR ' + e.message; }
});
console.log('MANUAL WRITE', manual);

await browser.close();
