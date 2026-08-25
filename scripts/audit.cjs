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
    const grammarPattern = /^[a-z][a-z0-9-]{2,}$/;
    const allowedClaimStatuses = new Set(['confirmed', 'reported', 'inference', 'mixed']);
    const grammarCounts = new Map();
    const pageQuestions = new Map();

    if (!posters.length) issues.push('No .poster elements found.');
    posters.forEach((poster, index) => {
      const grammar = poster.dataset.pageGrammar || '';
      if (!grammarPattern.test(grammar)) issues.push(`Page ${index + 1}: data-page-grammar must be a descriptive kebab-case name.`);
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
      const posterRect = poster.getBoundingClientRect();
      const clipped = [...poster.querySelectorAll('*')].filter(element => {
        const hasDirectText = [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        return hasDirectText || element.matches('img, svg');
      }).filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.left < posterRect.left - 1 || rect.right > posterRect.right + 1 || rect.top < posterRect.top - 1 || rect.bottom > posterRect.bottom + 1);
      });
      clipped.slice(0, 5).forEach(element => {
        const descriptor = element.id ? `#${element.id}` : element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : element.tagName.toLowerCase();
        issues.push(`Page ${index + 1}: visible content ${descriptor} crosses the poster boundary and may be clipped.`);
      });
    });
    if (posters.length >= 5 && grammarCounts.size < 3) warnings.push(`Carousel uses ${grammarCounts.size} page grammars across ${posters.length} cards; verify that repetition creates deliberate rhythm rather than template sameness.`);
    for (const [grammar, count] of grammarCounts) if (count > 2) warnings.push(`Page grammar "${grammar}" is repeated ${count} times; verify that every repetition adds a new information relationship.`);

    const body = document.body;
    const subject = (body.dataset.topicSubject || '').trim();
    const assetPolicy = body.dataset.coverAsset || '';
    const titleEmphasis = body.dataset.titleEmphasis || '';
    const titleEmphasisMode = body.dataset.titleEmphasisMode || 'scale';
    if (!subject) issues.push('body[data-topic-subject] is required.');
    if (!['required', 'none'].includes(assetPolicy)) issues.push('body[data-cover-asset] must be "required" or "none".');
    if (!['recognition', 'support'].includes(titleEmphasis)) issues.push('body[data-title-emphasis] must be "recognition" or "support".');
    if (!['scale', 'composition'].includes(titleEmphasisMode)) issues.push('body[data-title-emphasis-mode] must be "scale" or "composition".');

    const cover = document.querySelector('#card-01') || posters[0];
    let coverFactCount = 0;
    let coverProofCount = 0;
    let coverNextQuestion = '';
    if (cover) {
      coverNextQuestion = (cover.dataset.coverNextQuestion || '').trim();
      if (coverNextQuestion.replace(/\s+/g, '').length < 6) issues.push('Cover requires a meaningful data-cover-next-question for the page-2 handoff.');
      if (posters[1] && coverNextQuestion && normalized(coverNextQuestion) !== normalized(posters[1].dataset.pageQuestion || '')) {
        warnings.push('Cover data-cover-next-question does not match page 2 data-page-question; verify that page 2 answers the promised handoff.');
      }
      const anchors = [...cover.querySelectorAll('[data-role="recognition-anchor"]')];
      const supports = [...cover.querySelectorAll('[data-role="support-title"]')];
      if (anchors.length !== 1) issues.push(`Cover requires exactly one recognition anchor; found ${anchors.length}.`);
      if (supports.length !== 1) issues.push(`Cover requires exactly one support title; found ${supports.length}.`);
      if (anchors.length === 1 && supports.length === 1) {
        const anchor = anchors[0];
        const support = supports[0];
        const anchorSize = parseFloat(getComputedStyle(anchor).fontSize);
        const supportSize = parseFloat(getComputedStyle(support).fontSize);
        const emphasizedSize = titleEmphasis === 'support' ? supportSize : anchorSize;
        const secondarySize = titleEmphasis === 'support' ? anchorSize : supportSize;
        const ratio = emphasizedSize / secondarySize;
        if (!normalized(anchor.textContent).includes(normalized(subject))) issues.push(`Recognition anchor "${anchor.textContent.trim()}" does not contain topic subject "${subject}".`);
        if (titleEmphasisMode === 'scale' && emphasizedSize < 96) issues.push(`Scale-led cover title is ${emphasizedSize}px; minimum is 96px at 1080px width.`);
        const hasCoverAsset = Boolean(cover.querySelector('[data-role="recognition-asset"]'));
        const secondaryMinimum = titleEmphasis === 'support' && hasCoverAsset ? 28 : 52;
        if (secondarySize < secondaryMinimum) issues.push(`Secondary cover title is ${secondarySize}px; minimum is ${secondaryMinimum}px for this cover system.`);
        if (titleEmphasisMode === 'scale' && ratio < 1.15) issues.push(`Declared ${titleEmphasis || 'cover'} scale emphasis is not visually distinct; size ratio is ${ratio.toFixed(2)} and must be at least 1.15.`);
        if (titleEmphasisMode === 'composition' && emphasizedSize < 72) issues.push(`Composition-led cover title is ${emphasizedSize}px; the leading role must remain at least 72px.`);
        if (anchor.closest('h1') === support.closest('h1')) {
          const anchorRect = anchor.getBoundingClientRect();
          const supportRect = support.getBoundingClientRect();
          const titleGap = supportRect.top - anchorRect.bottom;
          const titleStyle = getComputedStyle(anchor.closest('h1'));
          const verticallyStacked = (titleStyle.display === 'flex' && titleStyle.flexDirection === 'column') || titleStyle.display === 'grid';
          if (verticallyStacked && supportRect.top > anchorRect.top + 2 && titleGap < -1) issues.push(`Cover title roles overlap by ${Math.round(Math.abs(titleGap))}px.`);
          else if (verticallyStacked && supportRect.top >= anchorRect.bottom - 1 && titleGap < 8) warnings.push(`Cover title roles are separated by only ${Math.round(titleGap)}px; verify optical separation at thumbnail size.`);
        }
      }

      const recognitionAssets = [...cover.querySelectorAll('[data-role="recognition-asset"]')];
      if (assetPolicy === 'required' && recognitionAssets.length < 1) issues.push('Cover asset is required but none was found.');
      if (assetPolicy === 'none' && recognitionAssets.length) issues.push('Cover declares no asset but contains a recognition asset.');
      if (recognitionAssets.length > 2) warnings.push(`Cover uses ${recognitionAssets.length} assets; document why each performs a distinct editorial role.`);
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
        if (['icon', 'symbol', 'app-icon'].includes(kind) && Math.min(rect.width, rect.height) < 88) issues.push(`${label}: compact icon renders at ${Math.round(rect.width)}x${Math.round(rect.height)}; minimum short side is 88px.`);
        if (kind === 'wordmark' && rect.height < 72) issues.push(`${label}: compact wordmark renders only ${Math.round(rect.height)}px high; use a standalone icon or recompose.`);
      });
      const identityAssetCount = recognitionAssets.filter(asset => asset.dataset.assetRole === 'identity').length;
      if (identityAssetCount > 1) warnings.push('Cover uses multiple identity assets; verify that recognition is not redundant.');
      [...cover.querySelectorAll('img')].forEach(image => {
        if (image.dataset.role !== 'recognition-asset') issues.push('Cover contains an image without recognition-asset provenance metadata.');
      });

      const allowedEvidence = new Set(['capability', 'consequence', 'limit', 'use-case', 'why-it-matters']);
      [...cover.querySelectorAll('[data-role="content-preview"]')].forEach((preview, index) => {
        if (!allowedEvidence.has(preview.dataset.evidence || '')) issues.push(`Content preview ${index + 1}: invalid or missing data-evidence.`);
        if ((preview.textContent || '').replace(/\s+/g, '').length < 8) issues.push(`Content preview ${index + 1}: too little content to support the cover.`);
      });

      const evidenceSelector = '[data-role="content-preview"], [data-role="cover-proof"]';
      const evidenceModules = [...cover.querySelectorAll(evidenceSelector)].filter(module => !module.parentElement?.closest(evidenceSelector));
      const allowedProofPurposes = new Set(['comparison', 'evidence', 'capability', 'consequence', 'boundary']);
      const factPattern = /^[a-z0-9][a-z0-9-]*(?:\s+[a-z0-9][a-z0-9-]*)*$/;
      const factOwners = new Map();
      const coverProofs = evidenceModules.filter(module => module.dataset.role === 'cover-proof');
      coverProofCount = coverProofs.length;
      coverProofs.forEach((proof, index) => {
        if (!allowedProofPurposes.has(proof.dataset.proofPurpose || '')) issues.push(`Cover proof ${index + 1}: invalid or missing data-proof-purpose.`);
      });
      evidenceModules.forEach((module, index) => {
        const factList = (module.dataset.factIds || '').trim();
        const label = module.dataset.role === 'cover-proof' ? 'Cover proof' : 'Content preview';
        if (!factList) {
          issues.push(`${label} ${index + 1}: data-fact-ids is required.`);
          return;
        }
        if (!factPattern.test(factList)) {
          issues.push(`${label} ${index + 1}: data-fact-ids must be lowercase kebab-case tokens separated by spaces.`);
          return;
        }
        factList.split(/\s+/).forEach(factId => {
          if (factOwners.has(factId) && factOwners.get(factId) !== module) issues.push(`Cover fact "${factId}" is repeated across separate evidence modules.`);
          else factOwners.set(factId, module);
        });
      });
      coverFactCount = factOwners.size;
      if (coverProofCount > 1) warnings.push(`Cover uses ${coverProofCount} proof modules; verify that they form one dominant proof relationship rather than competing explanations.`);
      if (coverFactCount > 3) warnings.push(`Cover carries ${coverFactCount} distinct material facts; verify that it remains a hook rather than a compressed detail page.`);

      const numericEvidencePattern = /(?:[$¥€£]\s*\d|\d[\d.,]*\s*%|\d[\d.,]*\s*(?:→|->)|(?:→|->)\s*[$¥€£]?\d)/;
      [...cover.querySelectorAll('*')].filter(element => !element.children.length).forEach(element => {
        const text = (element.textContent || '').trim();
        if (!text || !numericEvidencePattern.test(text)) return;
        if (element.closest('.topline, .foot, [data-role="cover-metadata"], [data-role="recognition-anchor"], [data-role="support-title"], [data-role="content-preview"], [data-role="cover-proof"]')) return;
        issues.push(`Cover numeric evidence "${text}" is outside a semantic content-preview or cover-proof module.`);
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
      if (object && context) {
        const objectRect = object.getBoundingClientRect();
        const contextRect = context.getBoundingClientRect();
        const contextGap = contextRect.top - objectRect.bottom;
        if (contextRect.top >= objectRect.top && contextGap < -1) issues.push(`Metric ${index + 1}: object/unit overlaps its explanatory context by ${Math.round(Math.abs(contextGap))}px.`);
        else if (contextRect.top >= objectRect.bottom - 1 && contextGap < 8) warnings.push(`Metric ${index + 1}: object/unit and context are only ${Math.round(contextGap)}px apart; verify that size, color, and position still separate the groups.`);
      }
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

    [...document.querySelectorAll('[data-role="text-stack"]')].forEach((stack, index) => {
      const style = getComputedStyle(stack);
      if (!['flex', 'grid'].includes(style.display)) warnings.push(`Text stack ${index + 1}: explicit flex/grid structure may make its semantic grouping easier to maintain.`);
    });

    const densityExemptClasses = new Set(['poster', 'frame', 'circle', 'brand-tile', 'portrait-tile']);
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
      const descriptor = element.id ? `#${element.id}` : `.${[...element.classList].join('.')}`;
      if (occupiedHeight / rect.height < 0.18) {
        warnings.push(`Large rounded module ${descriptor} on page ${posters.indexOf(element.closest('.poster')) + 1} has only ${Math.round(occupiedHeight / rect.height * 100)}% vertical content occupancy; review internal density.`);
      }
      const contentBottom = Math.max(...intervals.map(([, bottom]) => bottom));
      const bottomReach = (contentBottom - rect.top) / rect.height;
      if (rect.height >= 480 && bottomReach < 0.52) warnings.push(`Tall module ${descriptor} on page ${posters.indexOf(element.closest('.poster')) + 1} is top-clustered: meaningful content ends at ${Math.round(bottomReach * 100)}% of its height. Contract the module or document what the remaining height communicates.`);
    });

    return { issues, warnings, summary: { posters: posters.length, grammars: grammarCounts.size, subject, assetPolicy, titleEmphasis, titleEmphasisMode, coverFacts: coverFactCount, coverProofs: coverProofCount, coverNextQuestion } };
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
  await page.setContent(`<body data-topic-subject="Claude Code" data-cover-asset="required" data-title-emphasis="recognition"><section class="poster" id="card-01" data-page-grammar="cover-grid" data-page-question="What changed for local sessions?" data-cover-next-question="What are the exact access conditions?" data-claim-status="reported" data-source-ids="primary-report" style="width:1080px;height:1440px;overflow:hidden"><div class="frame"><h1><span data-role="recognition-anchor" style="font-size:144px">Claude Code</span><span data-role="support-title" style="font-size:76px">手机可发起本地会话</span></h1><img data-role="recognition-asset" data-asset-role="evidence" data-asset-origin="primary-source" data-asset-kind="product-image" data-subject="Claude Code Remote Control" data-source-page="https://publisher.example/report" data-source-url="https://publisher.example/image.svg" data-rights-note="Primary-source editorial evidence" data-pixel-checked="true" src='${pixel}' alt="Claude Code Remote Control product image" style="width:120px;height:120px"></div></section></body>`);
  const good = await auditPage(page);
  await page.setContent(`<body data-topic-subject="OpenAI" data-cover-asset="required" data-title-emphasis="support"><section class="poster" id="card-01" data-page-grammar="quote-interruption" data-page-question="Why did the training pace change?" data-cover-next-question="What evidence supports the pause?" data-claim-status="mixed" data-source-ids="interview" style="width:1080px;height:1440px;overflow:hidden"><div class="frame"><span data-role="claim-label">Paraphrased quote</span><h1><span data-role="recognition-anchor" style="font-size:72px">OpenAI</span><span data-role="support-title" style="font-size:120px">先过安全线，再继续跑</span></h1><img data-role="recognition-asset" data-asset-role="identity" data-asset-origin="official" data-asset-kind="icon" data-subject="OpenAI" data-source-page="https://openai.com" data-source-url="https://openai.com/icon.svg" data-rights-note="Editorial identification" data-pixel-checked="true" src='${pixel}' alt="OpenAI icon" style="width:120px;height:120px"></div></section></body>`);
  const creative = await auditPage(page);
  await page.setContent('<body data-topic-subject="Claude Code" data-cover-asset="required"><section class="poster" id="card-01" style="width:1080px;height:1440px"><h1><span data-role="recognition-anchor" style="font-size:72px">手机变成遥控器</span><span data-role="support-title" style="font-size:60px">本地会话</span></h1><img alt="generic terminal"></section></body>');
  const bad = await auditPage(page);
  await page.setContent(`<body data-topic-subject="Etched" data-cover-asset="none" data-title-emphasis="recognition"><section class="poster" id="card-01" data-page-grammar="valuation-expansion" data-page-question="Why did the valuation double within one month?" data-cover-next-question="What changed between the two rounds?" data-claim-status="confirmed" data-source-ids="deal-report" style="width:1080px;height:1440px;overflow:hidden"><h1 style="display:flex;flex-direction:column;gap:18px"><span data-role="recognition-anchor" style="font-size:144px">Etched</span><span data-role="support-title" style="font-size:76px">一个月估值翻倍</span></h1><div data-role="cover-proof" data-proof-purpose="comparison" data-fact-ids="valuation-doubled"><div class="metric" data-role="metric" data-metric-purpose="comparison" style="width:420px;height:820px;border-radius:38px;padding:34px;display:flex;flex-direction:column;gap:18px;background:#315eea;color:white"><span class="metric-value" data-role="metric-value" style="font-size:150px">21</span><span class="metric-unit" data-role="metric-object" style="font-size:38px">亿美元估值</span><p class="metric-caption" data-role="metric-context" style="font-size:30px;margin:0">不到一个月翻倍</p></div></div></section></body>`);
  const compositionBad = await auditPage(page);
  await page.setContent(`<body data-topic-subject="GPT-5.6 Sol" data-cover-asset="none" data-title-emphasis="recognition"><section class="poster" id="card-01" data-page-grammar="price-summary" data-page-question="What changed in pricing?" data-cover-next-question="What are the three current rates?" data-claim-status="confirmed" data-source-ids="pricing" style="width:1080px;height:1440px;overflow:hidden"><h1><span data-role="recognition-anchor" style="font-size:144px">GPT-5.6 Sol</span><span data-role="support-title" style="font-size:76px">API 限时降价</span></h1><div data-role="content-preview" data-evidence="consequence" data-fact-ids="output-price-drop">输出约降 33%</div><div data-role="cover-proof" data-proof-purpose="comparison" data-fact-ids="output-price-drop">$30 → $20</div></section></body>`);
  const duplicateCover = await auditPage(page);
  await browser.close();
  if (good.issues.length) throw new Error(`Good fixture failed:\n${good.issues.join('\n')}`);
  if (creative.issues.length) throw new Error(`Creative fixture failed:\n${creative.issues.join('\n')}`);
  if (bad.issues.length < 5) throw new Error(`Bad fixture was not rejected strongly enough:\n${bad.issues.join('\n')}`);
  if (!compositionBad.warnings.some(warning => /top-clustered/.test(warning))) throw new Error(`Composition fixture did not trigger top-cluster detection:\n${compositionBad.warnings.join('\n')}`);
  if (!duplicateCover.issues.some(issue => /repeated across separate evidence modules/.test(issue))) throw new Error(`Duplicate cover facts were not rejected:\n${duplicateCover.issues.join('\n')}`);
  console.log(`Audit self-test passed: conventional=0 issues, creative=0 issues, bad=${bad.issues.length} issues, composition=${compositionBad.warnings.length} warnings, duplicate-cover rejected.`);
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
