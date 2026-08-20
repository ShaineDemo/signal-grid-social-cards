#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

function loadPlaywright() {
  const candidates = ['playwright'];
  const nodePath = process.env.NODE_PATH || '';
  for (const root of nodePath.split(path.delimiter).filter(Boolean)) {
    candidates.push(path.join(root, 'playwright'));
  }
  for (const candidate of candidates) {
    try { return require(candidate); } catch (_) {}
  }
  throw new Error('Cannot resolve playwright. Set NODE_PATH to a directory containing playwright.');
}

async function main() {
  const input = process.argv[2];
  const outputDir = process.argv[3];
  if (!input || !outputDir) {
    throw new Error('Usage: render.cjs <index.html> <output-dir>');
  }
  fs.mkdirSync(outputDir, { recursive: true });
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2400, height: 1800 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const cards = page.locator('.poster');
  const count = await cards.count();
  if (!count) throw new Error('No .poster elements found.');

  const issues = [];
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const filename = await card.getAttribute('data-filename') || `${String(i + 1).padStart(2, '0')}.png`;
    const size = await card.evaluate(el => ({ width: el.offsetWidth, height: el.offsetHeight, scrollWidth: el.scrollWidth, scrollHeight: el.scrollHeight }));
    if (size.width !== 1080 || size.height !== 1440) issues.push(`${filename}: ${size.width}x${size.height}, expected 1080x1440`);
    if (size.scrollWidth > size.width || size.scrollHeight > size.height) issues.push(`${filename}: poster overflow ${size.scrollWidth}x${size.scrollHeight}`);
    await card.screenshot({ path: path.join(outputDir, filename) });
    process.stdout.write(`rendered ${filename}\n`);
  }
  await browser.close();
  if (issues.length) {
    process.stderr.write(`QA issues:\n${issues.map(x => `- ${x}`).join('\n')}\n`);
    process.exitCode = 2;
  }
}

main().catch(error => { console.error(error.stack || error); process.exit(1); });
