#!/usr/bin/env node
const path = require('path');
const { pathToFileURL } = require('url');

function loadPlaywright() {
  const candidates = ['playwright'];
  const nodePath = process.env.NODE_PATH || '';
  for (const root of nodePath.split(path.delimiter).filter(Boolean)) candidates.push(path.join(root, 'playwright'));
  for (const candidate of candidates) {
    try { return require(candidate); } catch (_) {}
  }
  throw new Error('Cannot resolve playwright. Set NODE_PATH to a directory containing playwright.');
}

async function auditPage(page) {
  return page.evaluate(() => {
    const issues = [];
    const warnings = [];
    const normalized = value => (value || '').replace(/\s+/g, '').toLowerCase();
    const posters = [...document.querySelectorAll('.poster')];
    const allowedGrammars = new Set(['cover-grid', 'type-field', 'circle-matrix', 'split-field', 'pill-stack', 'count-stack', 'contrast-pair', 'evidence-grid', 'closing-statement']);
    const allowedClaimStatuses = new Set(['confirmed', 'reported', 'inference', 'mixed']);
    const grammarCounts = new Map();
    const pageQuestions = new Map();

    if (!posters.length) issues.push('No .poster elements found.');
    posters.forEach((poster, index) => {
      const grammar = poster.dataset.pageGrammar || '';
      if (!allowedGrammars.has(grammar)) issues.push(`Page ${index + 1}: missing or invalid data-page-grammar.`);
      else grammarCounts.set(grammar, (grammarCounts.get(grammar) || 0) + 1);
      const question = (poster.dataset.pageQuestion || '').trim();
      if (question.replace(/\s+/g, '').length < 6) issues.push(`Page ${index + 1}: data-page-question is missing or too vague.`);
      else {
        const key = normalized(question);
        if (pageQuestions.has(key)) issues.push(`Page ${index + 1}: duplicates reader question from page ${pageQuestions.get(key)}.`);
        else pageQuestions.set(key, index + 1);
      }
      const claimStatus = poster.dataset.claimStatus || '';
      if (!allowedClaimStatuses.has(claimStatus)) issues.push(`Page ${index + 1}: missing or invalid data-claim-status.`);
      if (!(poster.dataset.sourceIds || '').trim()) issues.push(`Page ${index + 1}: data-source-ids is required.`);
      if (['inference', 'mixed'].includes(claimStatus) && !poster.querySelector('[data-role="claim-label"]')) issues.push(`Page ${index + 1}: ${claimStatus} claims require a visible data-role="claim-label".`);
      const size = { width: poster.offsetWidth, height: poster.offsetHeight };
      if (poster.scrollWidth > size.width || poster.scrollHeight > size.height) issues.push(`Page ${index + 1}: poster overflow ${poster.scrollWidth}x${poster.scrollHeight}.`);
    });
    if (posters.length >= 5 && grammarCounts.size < 4) issues.push(`Carousel uses ${grammarCounts.size} page grammars; at least 4 are required for ${posters.length} cards.`);
    for (const [grammar, count] of grammarCounts) if (count > 2) issues.push(`Page grammar "${grammar}" is repeated ${count} times; maximum is 2.`);

    const body = document.body;
    const subject = (body.dataset.topicSubject || '').trim();
    const assetPolicy = body.dataset.coverAsset || '';
    if (!subject) issues.push('body[data-topic-subject] is required.');
    if (!['required', 'none'].includes(assetPolicy)) issues.push('body[data-cover-asset] must be "required" or "none".');

    const cover = document.querySelector('#card-01') || posters[0];
    if (cover) {
      const anchors = [...cover.querySelectorAll('[data-role="recognition-anchor"]')];
      const supports = [...cover.querySelectorAll('[data-role="support-title"]')];
      if (anchors.length !== 1) issues.push(`Cover requires exactly one recognition anchor; found ${anchors.length}.`);
      if (supports.length !== 1) issues.push(`Cover requires exactly one support title; found ${supports.length}.`);
      if (anchors.length === 1 && supports.length === 1) {
        const anchor = anchors[0];
        const support = supports[0];
        const anchorSize = parseFloat(getComputedStyle(anchor).fontSize);
        const supportSize = parseFloat(getComputedStyle(support).fontSize);
        const ratio = anchorSize / supportSize;
        if (!normalized(anchor.textContent).includes(normalized(subject))) issues.push(`Recognition anchor "${anchor.textContent.trim()}" does not contain topic subject "${subject}".`);
        if (anchorSize < 96) issues.push(`Recognition anchor is ${anchorSize}px; minimum is 96px at 1080px width.`);
        if (supportSize < 48) issues.push(`Support title is ${supportSize}px; minimum is 48px at 1080px width.`);
        if (ratio < 1.35 || ratio > 2.1) issues.push(`Cover title ratio is ${ratio.toFixed(2)}; expected 1.35–2.1.`);
        if (anchor.closest('h1') !== support.closest('h1')) issues.push('Recognition anchor and support title must share the same h1 module.');
      }

      const recognitionAssets = [...cover.querySelectorAll('[data-role="recognition-asset"]')];
      if (assetPolicy === 'required' && recognitionAssets.length !== 1) issues.push(`Cover asset is required; found ${recognitionAssets.length} recognition assets.`);
      if (assetPolicy === 'none' && recognitionAssets.length) issues.push('Cover declares no asset but contains a recognition asset.');
      const allowedKinds = new Set(['icon', 'symbol', 'app-icon', 'wordmark', 'product-image', 'portrait']);
      const allowedOrigins = {
        identity: new Set(['official', 'primary-source', 'verified-third-party', 'user-provided']),
        evidence: new Set(['official', 'primary-source', 'licensed-editorial', 'user-provided']),
        context: new Set(['licensed-editorial', 'contextual', 'user-provided'])
      };
      recognitionAssets.forEach((asset, index) => {
        const label = `Recognition asset ${index + 1}`;
        if (asset.tagName !== 'IMG') issues.push(`${label}: must be an img element.`);
        const role = asset.dataset.assetRole || '';
        const origin = asset.dataset.assetOrigin || '';
        const sourcePage = asset.dataset.sourcePage || '';
        const sourceUrl = asset.dataset.sourceUrl || '';
        const rightsNote = (asset.dataset.rightsNote || '').trim();
        const assetSubject = asset.dataset.subject || '';
        const kind = asset.dataset.assetKind || '';
        if (!allowedOrigins[role]) issues.push(`${label}: invalid data-asset-role "${role}".`);
        else if (!allowedOrigins[role].has(origin)) issues.push(`${label}: origin "${origin}" is not allowed for role "${role}".`);
        const userProvided = origin === 'user-provided';
        if (userProvided) {
          if (sourcePage !== 'user-provided' || sourceUrl !== 'user-provided') issues.push(`${label}: user-provided assets must declare both source fields as "user-provided".`);
        } else {
          if (!sourcePage.startsWith('https://')) issues.push(`${label}: data-source-page must be an HTTPS source.`);
          if (!sourceUrl.startsWith('https://')) issues.push(`${label}: data-source-url must be an HTTPS source.`);
        }
        if (!rightsNote) issues.push(`${label}: data-rights-note is required.`);
        if (asset.dataset.pixelChecked !== 'true') issues.push(`${label}: data-pixel-checked must be "true" after visual inspection.`);
        if (role === 'identity' && normalized(assetSubject) !== normalized(subject)) issues.push(`${label}: identity subject "${assetSubject}" does not match "${subject}".`);
        if (role !== 'identity' && !assetSubject.trim()) issues.push(`${label}: data-subject is required.`);
        if (origin === 'verified-third-party' && !(asset.dataset.verificationUrl || '').startsWith('https://')) issues.push(`${label}: verified-third-party identity requires an HTTPS data-verification-url.`);
        if (role === 'context') {
          const disclosure = (asset.dataset.contextDisclaimer || '').trim();
          if (!disclosure) issues.push(`${label}: context assets require data-context-disclaimer.`);
          if (!disclosure || !normalized(cover.textContent).includes(normalized(disclosure))) issues.push(`${label}: context disclaimer must also be visible on the cover.`);
        }
        if (!allowedKinds.has(kind)) issues.push(`${label}: invalid data-asset-kind "${kind}".`);
        if (!asset.getAttribute('alt')) issues.push(`${label}: alt text is required.`);
        if (/(?:\bdocs?\b|\bblog\b|\blabs?\b|\bcommunity\b)/i.test(asset.getAttribute('alt') || '') && !/(?:docs?|blog|labs?|community)/i.test(subject)) issues.push(`${label}: alt text contains an unrelated adjacent-brand suffix.`);
        if (!asset.complete || !asset.naturalWidth || !asset.naturalHeight) issues.push(`${label}: image did not load.`);
        const rect = asset.getBoundingClientRect();
        if (['icon', 'symbol', 'app-icon'].includes(kind) && Math.min(rect.width, rect.height) < 96) issues.push(`${label}: compact icon renders at ${Math.round(rect.width)}x${Math.round(rect.height)}; minimum short side is 96px.`);
        if (kind === 'wordmark' && rect.height < 72) issues.push(`${label}: compact wordmark renders only ${Math.round(rect.height)}px high; use a standalone icon or recompose.`);
      });
      [...cover.querySelectorAll('img')].forEach(image => {
        if (image.dataset.role !== 'recognition-asset') issues.push('Cover contains an image without recognition-asset provenance metadata.');
      });

      const allowedEvidence = new Set(['capability', 'consequence', 'limit', 'use-case', 'why-it-matters']);
      [...cover.querySelectorAll('[data-role="content-preview"]')].forEach((preview, index) => {
        if (!allowedEvidence.has(preview.dataset.evidence || '')) issues.push(`Content preview ${index + 1}: invalid or missing data-evidence.`);
        if ((preview.textContent || '').replace(/\s+/g, '').length < 8) issues.push(`Content preview ${index + 1}: too little content to support the cover.`);
      });
    }

    const metricValues = new Set([...document.querySelectorAll('.metric-value, [data-role="metric-value"]')]);
    const allowedMetricPurposes = new Set(['current', 'comparison', 'calculation', 'boundary', 'sequence']);
    const metricOccurrences = new Map();
    metricValues.forEach((value, index) => {
      if (value.dataset.role !== 'metric-value') issues.push(`Metric ${index + 1}: .metric-value is missing data-role="metric-value".`);
      const metric = value.closest('[data-role="metric"], .metric');
      if (!metric) return issues.push(`Metric ${index + 1}: value is not inside a metric module.`);
      const purpose = metric.dataset.metricPurpose || '';
      if (!allowedMetricPurposes.has(purpose)) issues.push(`Metric ${index + 1}: missing or invalid data-metric-purpose.`);
      const object = metric.querySelector('[data-role="metric-object"], .metric-unit');
      const context = metric.querySelector('[data-role="metric-context"], .metric-caption, .metric-list');
      if (!object || !(object.textContent || '').trim()) issues.push(`Metric ${index + 1}: missing counted object or unit.`);
      if (!context || (context.textContent || '').replace(/\s+/g, '').length < 4) issues.push(`Metric ${index + 1}: missing useful context.`);
      const posterIndex = posters.indexOf(value.closest('.poster')) + 1;
      const metricKey = `${normalized(value.textContent)}|${purpose}`;
      if (metricOccurrences.has(metricKey) && metricOccurrences.get(metricKey) !== posterIndex) warnings.push(`Metric "${value.textContent.trim()}" repeats with purpose "${purpose}" on pages ${metricOccurrences.get(metricKey)} and ${posterIndex}; verify that the later page adds new information.`);
      else metricOccurrences.set(metricKey, posterIndex);
    });
    [...document.querySelectorAll('.poster *')].filter(element => !element.children.length).forEach(element => {
      const text = (element.textContent || '').trim();
      const size = parseFloat(getComputedStyle(element).fontSize);
      if (/^\d+(?:[.,]\d+)?$/.test(text) && size >= 112 && !['metric-value', 'sequence'].includes(element.dataset.role || '')) issues.push(`Oversized number "${text}" at ${size}px lacks metric or sequence semantics.`);
    });

    posters.slice(1).forEach((poster, index) => {
      if (poster.dataset.pageGrammar === 'closing-statement') return;
      const frame = poster.querySelector('.frame');
      if (!frame) return;
      const posterRect = poster.getBoundingClientRect();
      const content = [...frame.children].filter(element => !element.matches('.topline, .foot, .spacer'));
      if (!content.length) return;
      const end = Math.max(...content.map(element => element.getBoundingClientRect().bottom));
      const footprint = (end - posterRect.top) / posterRect.height;
      if (footprint < 0.5) warnings.push(`Page ${index + 2}: main content ends at ${Math.round(footprint * 100)}% of the canvas; review excessive empty space.`);
    });

    const minimums = [
      ['.circle span, .mini span', 26, 'Circle/mini label'],
      ['.pill', 28, 'Pill text'],
      ['[data-role="body-copy"]', 30, 'Body copy']
    ];
    minimums.forEach(([selector, minimum, label]) => {
      [...document.querySelectorAll(selector)].forEach((element, index) => {
        const size = parseFloat(getComputedStyle(element).fontSize);
        if (size < minimum) issues.push(`${label} ${index + 1} is ${size}px; minimum is ${minimum}px.`);
      });
    });

    const densityExemptClasses = new Set(['poster', 'frame', 'circle', 'metric', 'brand-tile', 'portrait-tile']);
    [...document.querySelectorAll('.poster [class]')].forEach(element => {
      if ([...densityExemptClasses].some(name => element.classList.contains(name))) return;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (rect.width < 280 || rect.height < 260 || rect.width * rect.height < 100000 || parseFloat(style.borderRadius) < 16) return;
      if (element.dataset.densityExempt === 'true') {
        if (!(element.dataset.densityReason || '').trim()) issues.push('A data-density-exempt module is missing data-density-reason.');
        return;
      }
      const leaves = [...element.querySelectorAll('*')].filter(child => {
        const hasMeaningfulChild = [...child.children].some(grandchild => !grandchild.matches('br'));
        return !hasMeaningfulChild && ((child.textContent || '').trim() || child.matches('img, svg'));
      });
      if (!leaves.length) return;
      const intervals = leaves.map(child => {
        const childRect = child.getBoundingClientRect();
        return [Math.max(rect.top, childRect.top), Math.min(rect.bottom, childRect.bottom)];
      }).filter(([top, bottom]) => bottom > top).sort((a, b) => a[0] - b[0]);
      const merged = [];
      intervals.forEach(interval => {
        const previous = merged[merged.length - 1];
        if (!previous || interval[0] > previous[1]) merged.push([...interval]);
        else previous[1] = Math.max(previous[1], interval[1]);
      });
      const occupiedHeight = merged.reduce((sum, [top, bottom]) => sum + bottom - top, 0);
      if (occupiedHeight / rect.height < 0.18) {
        const descriptor = element.id ? `#${element.id}` : `.${[...element.classList].join('.')}`;
        warnings.push(`Large rounded module ${descriptor} on page ${posters.indexOf(element.closest('.poster')) + 1} has only ${Math.round(occupiedHeight / rect.height * 100)}% vertical content occupancy; review internal density.`);
      }
    });

    return { issues, warnings, summary: { posters: posters.length, grammars: grammarCounts.size, subject, assetPolicy } };
  });
}

async function runFile(input) {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2400, height: 1800 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const result = await auditPage(page);
  await browser.close();
  return result;
}

async function selfTest() {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
  const pixel = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect width="120" height="120" fill="%23d97757"/%3E%3C/svg%3E';
  await page.setContent(`<body data-topic-subject="Claude Code" data-cover-asset="required"><section class="poster" id="card-01" data-page-grammar="cover-grid" data-page-question="What changed for local sessions?" data-claim-status="reported" data-source-ids="primary-report" style="width:1080px;height:1440px;overflow:hidden"><div class="frame"><h1><span data-role="recognition-anchor" style="font-size:144px">Claude Code</span><span data-role="support-title" style="font-size:76px">手机可发起本地会话</span></h1><img data-role="recognition-asset" data-asset-role="evidence" data-asset-origin="primary-source" data-asset-kind="product-image" data-subject="Claude Code Remote Control" data-source-page="https://publisher.example/report" data-source-url="https://publisher.example/image.svg" data-rights-note="Primary-source editorial evidence" data-pixel-checked="true" src='${pixel}' alt="Claude Code Remote Control product image" style="width:120px;height:120px"></div></section></body>`);
  const good = await auditPage(page);
  await page.setContent('<body data-topic-subject="Claude Code" data-cover-asset="required"><section class="poster" id="card-01" style="width:1080px;height:1440px"><h1><span data-role="recognition-anchor" style="font-size:72px">手机变成遥控器</span><span data-role="support-title" style="font-size:60px">本地会话</span></h1><img alt="generic terminal"></section></body>');
  const bad = await auditPage(page);
  await browser.close();
  if (good.issues.length) throw new Error(`Good fixture failed:\n${good.issues.join('\n')}`);
  if (bad.issues.length < 5) throw new Error(`Bad fixture was not rejected strongly enough:\n${bad.issues.join('\n')}`);
  console.log(`Audit self-test passed: good=0 issues, bad=${bad.issues.length} issues.`);
}

async function main() {
  if (process.argv.includes('--self-test')) return selfTest();
  const input = process.argv[2];
  if (!input) throw new Error('Usage: audit.cjs <index.html> | --self-test');
  const result = await runFile(input);
  console.log(JSON.stringify(result, null, 2));
  if (result.issues.length) process.exitCode = 2;
}

module.exports = { auditPage, runFile };
if (require.main === module) main().catch(error => { console.error(error.stack || error); process.exit(1); });
