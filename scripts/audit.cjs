#!/usr/bin/env node
const fs = require('fs');
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
    const body = document.body;
    const posters = [...document.querySelectorAll('.poster')];
    const grammarPattern = /^[a-z][a-z0-9-]{2,}$/;
    const slugPattern = /^[a-z0-9][a-z0-9-]*$/;
    const allowedClaimStatuses = new Set(['confirmed', 'reported', 'inference', 'mixed']);
    const grammarCounts = new Map();
    const pageQuestions = new Map();
    const pageIndices = new Map();
    const pageNumberKeys = new Map();
    const filenames = new Map();

    const modes = { language: 'zh-CN', palette: 'signal-blue-orange', tone: 'light' };
    const allowedModes = {
      language: ['zh-CN', 'en'],
      palette: ['signal-blue-orange', 'violet-moss', 'petrol-raspberry'],
      tone: ['light', 'dark']
    };
    const legacyPalettes = allowedModes.palette.filter(palette => body.classList.contains(`palette-${palette}`));
    if (!body.hasAttribute('data-palette') && legacyPalettes.length === 1) modes.palette = legacyPalettes[0];
    for (const [name, values] of Object.entries(allowedModes)) {
      if (!body.hasAttribute(`data-${name}`)) warnings.push(`body[data-${name}] is missing; using legacy default "${modes[name]}". Declare the mode explicitly in new projects.`);
      else {
        const value = body.dataset[name];
        if (!values.includes(value)) issues.push(`body[data-${name}] must be ${values.map(item => `"${item}"`).join(' or ')}.`);
        else modes[name] = value;
      }
    }
    if (legacyPalettes.length > 1) issues.push(`body has conflicting legacy palette classes: ${legacyPalettes.map(palette => `"palette-${palette}"`).join(', ')}. Keep one palette selection.`);
    if (body.hasAttribute('data-palette') && allowedModes.palette.includes(body.dataset.palette)) {
      legacyPalettes.filter(palette => palette !== body.dataset.palette).forEach(palette => issues.push(`Legacy class "palette-${palette}" conflicts with body[data-palette] "${body.dataset.palette}"; remove the legacy class or make the selections match.`));
    }
    const documentLanguage = (document.documentElement.getAttribute('lang') || '').trim();
    if (!documentLanguage && !body.hasAttribute('data-language')) warnings.push('html[lang] is missing in this legacy project; declare "zh-CN" for the default edition.');
    else if (documentLanguage.toLowerCase() !== modes.language.toLowerCase()) issues.push(`html[lang] "${documentLanguage || 'missing'}" must match body[data-language] "${modes.language}".`);

    // Only judge rendered text on backgrounds whose pixels can be derived from
    // flat inherited fills. Images, effects and intersecting paint need visual QA.
    const meaningfulText = value => (value || '').replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, '');
    const describe = element => element.id ? `#${element.id}` : element.classList.length ? `.${[...element.classList].join('.')}` : element.tagName.toLowerCase();
    const rgba = value => {
      value = value.trim().toLowerCase();
      if (value === 'transparent') return [0, 0, 0, 0];
      if (/^#[\da-f]{3,4}$|^#[\da-f]{6}(?:[\da-f]{2})?$/.test(value)) {
        const hex = value.length < 6 ? [...value.slice(1)].map(character => character.repeat(2)).join('') : value.slice(1);
        return [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16)).concat(hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1);
      }
      const match = /^rgba?\(([^)]+)\)$/.exec(value);
      if (!match) return null;
      const parts = match[1].split(/[\s,/]+/).filter(Boolean);
      if (parts.length < 3 || parts.length > 4) return null;
      const color = parts.slice(0, 3).map(part => parseFloat(part) * (part.endsWith('%') ? 2.55 : 1));
      color.push(parts[3] === undefined ? 1 : parseFloat(parts[3]) / (parts[3].endsWith('%') ? 100 : 1));
      return color.every(Number.isFinite) ? color : null;
    };
    const over = (front, back) => {
      const alpha = front[3] + back[3] * (1 - front[3]);
      return alpha ? [0, 1, 2].map(i => (front[i] * front[3] + back[i] * back[3] * (1 - front[3])) / alpha).concat(alpha) : [0, 0, 0, 0];
    };
    const luminance = color => color.slice(0, 3).map(channel => {
      const s = channel / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
    const intersects = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
    const isHidden = element => {
      // Unlike display/opacity, visibility may be restored by a descendant.
      if (getComputedStyle(element).visibility !== 'visible') return true;
      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (style.display === 'none' || Number(style.opacity) === 0 || style.contentVisibility === 'hidden' || /^rect\(0px,? 0px,? 0px,? 0px\)$/.test(style.clip) || style.clipPath === 'inset(50%)') return true;
      }
      return false;
    };
    const textRects = (node, poster) => {
      const element = node.parentElement;
      if (!element || isHidden(element) || parseFloat(getComputedStyle(element).fontSize) <= 0) return [];
      const range = document.createRange();
      range.selectNodeContents(node);
      let rects = [...range.getClientRects()].filter(rect => rect.width > 0.5 && rect.height > 0.5).map(rect => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }));
      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        const clipX = current === poster || /hidden|clip|auto|scroll/.test(style.overflowX);
        const clipY = current === poster || /hidden|clip|auto|scroll/.test(style.overflowY);
        if (clipX || clipY) {
          const box = current.getBoundingClientRect();
          rects = rects.map(rect => ({ left: clipX ? Math.max(rect.left, box.left) : rect.left, right: clipX ? Math.min(rect.right, box.right) : rect.right, top: clipY ? Math.max(rect.top, box.top) : rect.top, bottom: clipY ? Math.min(rect.bottom, box.bottom) : rect.bottom })).filter(rect => rect.right - rect.left > 0.5 && rect.bottom - rect.top > 0.5);
        }
      }
      return rects;
    };
    const chineseException = element => /^zh(?:-cn)?$/i.test(element.closest('[lang]')?.getAttribute('lang') || '');
    const hanPattern = /\p{Script=Han}/u;
    const bodyStyle = getComputedStyle(body);
    const signalFills = modes.palette === 'signal-blue-orange' ? ['--blue', '--blue-mid', '--orange', '--orange-mid'].map(token => ({ token, color: rgba(bodyStyle.getPropertyValue(token)) })).filter(({ color }) => color && color[3] >= 0.999) : [];
    let contrastChecked = 0;
    let contrastManual = 0;
    let whiteOnColorChecked = 0;
    posters.forEach((poster, index) => {
      const manualReasons = new Set();
      let chineseExemptions = 0;
      const paints = [...poster.querySelectorAll('*')].filter(element => {
        if (isHidden(element)) return false;
        const style = getComputedStyle(element);
        const background = rgba(style.backgroundColor);
        return element.matches('img, svg, canvas, video, iframe') || style.backgroundImage !== 'none' || !background || background[3] > 0;
      });
      const walker = document.createTreeWalker(poster, NodeFilter.SHOW_TEXT);
      const checkedElements = new Set();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const element = node.parentElement;
        if (!meaningfulText(node.textContent) || element.closest('script, style, template')) continue;
        const rects = textRects(node, poster);
        if (!rects.length) continue;
        const style = getComputedStyle(element);
        const fill = rgba(style.webkitTextFillColor || style.color);
        const textClippedFill = style.backgroundClip === 'text' || style.webkitBackgroundClip === 'text';
        if (fill && fill[3] === 0 && style.textShadow === 'none' && parseFloat(style.webkitTextStrokeWidth || '0') === 0 && !textClippedFill) continue;
        if (modes.language === 'en' && hanPattern.test(node.textContent)) {
          if (chineseException(element)) chineseExemptions++;
          else issues.push(`Page ${index + 1}: English edition contains visible Chinese text in ${describe(element)}: "${node.textContent.trim().slice(0, 70)}". Translate it, or mark an authoritative name/quotation with lang="zh-CN".`);
        }
        if (checkedElements.has(element)) continue;
        checkedElements.add(element);
        const directRects = [...element.childNodes].filter(child => child.nodeType === Node.TEXT_NODE && meaningfulText(child.textContent)).flatMap(child => textRects(child, poster));
        let reason = !fill ? 'unsupported text color' : '';
        if (textClippedFill) reason = 'text-clipped background';
        if (style.textShadow !== 'none' || parseFloat(style.webkitTextStrokeWidth || '0') > 0) reason = 'text shadow or stroke';
        if (paints.some(paint => paint !== element && !paint.contains(element) && !element.contains(paint) && directRects.some(rect => intersects(rect, paint.getBoundingClientRect())))) reason = 'intersecting image or non-ancestor fill';
        let background = [0, 0, 0, 0];
        let foreground = fill || [0, 0, 0, 0];
        for (let current = element; current; current = current.parentElement) {
          const layer = getComputedStyle(current);
          const color = rgba(layer.backgroundColor);
          if (background[3] < 0.999 && layer.backgroundImage !== 'none') reason = 'image or gradient background';
          if (!color) reason = 'unsupported background color';
          if (layer.mixBlendMode !== 'normal' || layer.filter !== 'none' || layer.backdropFilter && layer.backdropFilter !== 'none' || layer.maskImage && layer.maskImage !== 'none') reason = 'blend, filter or mask';
          for (const pseudo of ['::before', '::after']) {
            const generated = getComputedStyle(current, pseudo);
            if (generated.content !== 'none' && generated.content !== 'normal' && generated.display !== 'none' && Number(generated.opacity) > 0) reason = 'generated pseudo-element paint';
          }
          background = over(background, color || [0, 0, 0, 0]);
          foreground = over(foreground, color || [0, 0, 0, 0]);
          background[3] *= Number(layer.opacity);
          foreground[3] *= Number(layer.opacity);
        }
        if (reason) {
          contrastManual++;
          manualReasons.add(reason);
          continue;
        }
        // The browser's default canvas is white where no author fill is painted.
        background = over(background, [255, 255, 255, 1]);
        foreground = over(foreground, [255, 255, 255, 1]);
        const lum = [luminance(background), luminance(foreground)].sort((a, b) => b - a);
        const ratio = (lum[0] + 0.05) / (lum[1] + 0.05);
        // Match the composed local background, so an inner soft/neutral panel
        // does not inherit the outer colored surface's white-text requirement.
        const signalFill = signalFills.find(({ color }) => color.slice(0, 3).every((channel, i) => Math.abs(channel - background[i]) <= 0.5));
        if (signalFill) {
          whiteOnColorChecked++;
          if (foreground.slice(0, 3).some(channel => channel < 230)) issues.push(`Page ${index + 1}: white-on-color rule in ${describe(element)} requires near-white text on Signal ${signalFill.token}; dark or faded text is not allowed even when its contrast ratio passes.`);
        }
        const minimum = signalFill || parseFloat(style.fontSize) < 24 ? 4.5 : 3;
        contrastChecked++;
        if (ratio + 0.005 < minimum) issues.push(`Page ${index + 1}: text contrast ${ratio.toFixed(2)}:1 in ${describe(element)} is below ${minimum}:1 (${style.fontSize}); adjust the text or its effective background.`);
      }
      if (modes.language === 'en') {
        [...poster.querySelectorAll('img[alt]')].forEach(img => {
          if (!hanPattern.test(img.alt)) return;
          if (chineseException(img)) chineseExemptions++;
          else issues.push(`Page ${index + 1}: English edition contains Chinese alt text in ${describe(img)}; translate it or explicitly mark an authoritative name/quotation with lang="zh-CN".`);
        });
        [...poster.querySelectorAll('*')].filter(element => !isHidden(element)).forEach(element => {
          for (const pseudo of ['::before', '::after']) {
            const style = getComputedStyle(element, pseudo);
            if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0 || parseFloat(style.fontSize) <= 0 || !hanPattern.test(style.content.replace(/url\([^)]*\)/gi, ''))) continue;
            if (chineseException(element)) chineseExemptions++;
            else issues.push(`Page ${index + 1}: English edition contains Chinese generated text in ${describe(element)}${pseudo}.`);
          }
        });
      }
      if (chineseExemptions) warnings.push(`Page ${index + 1}: ${chineseExemptions} Chinese text/alt segment(s) are explicitly language-marked; verify they are authoritative names or original quotations.`);
      if (manualReasons.size) warnings.push(`Page ${index + 1}: contrast needs visual review for ${[...manualReasons].join(', ')}; those text runs were not assigned a pass or failure.`);
    });

    const cardCountRaw = (body.dataset.cardCount || '').trim();
    const cardCount = /^\d+$/.test(cardCountRaw) ? Number(cardCountRaw) : NaN;
    if (!Number.isInteger(cardCount) || cardCount < 1) issues.push('body[data-card-count] must be a positive integer.');
    else if (posters.length !== cardCount) issues.push(`body[data-card-count] declares ${cardCount} cards but found ${posters.length} .poster elements.`);

    if (!posters.length) issues.push('No .poster elements found.');
    posters.forEach((poster, index) => {
      const humanPage = index + 1;
      const pageIndexRaw = (poster.dataset.pageIndex || '').trim();
      const pageIndex = /^\d+$/.test(pageIndexRaw) ? Number(pageIndexRaw) : NaN;
      if (!Number.isInteger(pageIndex) || pageIndex < 1) issues.push(`Page ${humanPage}: data-page-index must be a positive integer.`);
      else {
        if (pageIndices.has(pageIndex)) issues.push(`Page ${humanPage}: data-page-index ${pageIndex} duplicates page ${pageIndices.get(pageIndex)}.`);
        else pageIndices.set(pageIndex, humanPage);
        if (pageIndex !== humanPage) issues.push(`Page ${humanPage}: data-page-index is ${pageIndex}; it must match DOM order ${humanPage}.`);
      }
      const filename = (poster.dataset.filename || '').trim();
      if (!filename) issues.push(`Page ${humanPage}: data-filename is required.`);
      else if (filenames.has(filename)) issues.push(`Page ${humanPage}: data-filename "${filename}" duplicates page ${filenames.get(filename)}.`);
      else filenames.set(filename, humanPage);

      const pageHeaders = [...new Set([...poster.querySelectorAll('[data-role="page-header"], .topline')])];
      const pageFooters = [...new Set([...poster.querySelectorAll('[data-role="page-footer"], .foot')])];
      const pageNumbers = [...poster.querySelectorAll('[data-role="page-number"]')];
      const sourceFooters = [...poster.querySelectorAll('[data-role="source-footer"]')];
      if (pageHeaders.length !== 1) issues.push(`Page ${humanPage}: requires exactly one page header; found ${pageHeaders.length}.`);
      if (pageFooters.length !== 1) issues.push(`Page ${humanPage}: requires exactly one page footer; found ${pageFooters.length}.`);
      if (pageNumbers.length !== 1) issues.push(`Page ${humanPage}: requires exactly one page-number element; found ${pageNumbers.length}.`);
      if (sourceFooters.length !== 1) issues.push(`Page ${humanPage}: requires exactly one source-footer element; found ${sourceFooters.length}.`);
      if (pageNumbers.length === 1) {
        const number = pageNumbers[0];
        const currentRaw = (number.dataset.pageCurrent || '').trim();
        const totalRaw = (number.dataset.pageTotal || '').trim();
        const current = /^\d+$/.test(currentRaw) ? Number(currentRaw) : NaN;
        const total = /^\d+$/.test(totalRaw) ? Number(totalRaw) : NaN;
        if (!Number.isInteger(current) || !Number.isInteger(total)) issues.push(`Page ${humanPage}: page-number requires integer data-page-current and data-page-total.`);
        else {
          const key = `${current}/${total}`;
          if (pageNumberKeys.has(key)) issues.push(`Page ${humanPage}: visible page number ${key} duplicates page ${pageNumberKeys.get(key)}.`);
          else pageNumberKeys.set(key, humanPage);
          if (current !== pageIndex) issues.push(`Page ${humanPage}: page-number current ${current} does not match data-page-index ${pageIndexRaw || 'missing'}.`);
          if (Number.isInteger(cardCount) && total !== cardCount) issues.push(`Page ${humanPage}: page-number total ${total} does not match data-card-count ${cardCount}.`);
          const visibleNumber = (number.textContent || '').replace(/\s+/g, '');
          if (visibleNumber !== `${String(current).padStart(2, '0')}/${String(total).padStart(2, '0')}` && visibleNumber !== `${current}/${total}`) {
            issues.push(`Page ${humanPage}: visible page number "${number.textContent.trim()}" does not match ${current}/${total}.`);
          }
        }
        if (pageHeaders.length === 1 && !pageHeaders[0].contains(number)) issues.push(`Page ${humanPage}: page-number must sit inside the single page header.`);
      }
      if (sourceFooters.length === 1 && pageFooters.length === 1 && !pageFooters[0].contains(sourceFooters[0])) issues.push(`Page ${humanPage}: source-footer must sit inside the single page footer.`);

      const counterLeaves = [...poster.querySelectorAll('*')].filter(element => !element.children.length && /^\s*\d{1,2}\s*\/\s*\d{1,2}\s*$/.test(element.textContent || ''));
      if (counterLeaves.length > 1) issues.push(`Page ${humanPage}: contains ${counterLeaves.length} independent visible page counters; one poster may represent only one logical card.`);
      if (counterLeaves.length === 1 && pageNumbers.length === 1 && counterLeaves[0] !== pageNumbers[0]) issues.push(`Page ${humanPage}: contains an unmarked page counter outside data-role="page-number".`);

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

    const subject = (body.dataset.topicSubject || '').trim();
    const assetPolicy = body.dataset.coverAsset || '';
    const assetAvailability = (body.dataset.coverAssetAvailability || '').trim();
    const assetReason = (body.dataset.coverAssetReason || '').trim();
    const titleEmphasis = body.dataset.titleEmphasis || '';
    const titleEmphasisMode = body.dataset.titleEmphasisMode || 'scale';
    if (!subject) issues.push('body[data-topic-subject] is required.');
    if (!['required', 'none'].includes(assetPolicy)) issues.push('body[data-cover-asset] must be "required" or "none".');
    if (!['available', 'unavailable', 'not-needed'].includes(assetAvailability)) issues.push('body[data-cover-asset-availability] must be "available", "unavailable", or "not-needed".');
    if (assetPolicy === 'required' && assetAvailability !== 'available') issues.push('A required cover asset must declare data-cover-asset-availability="available".');
    if (assetPolicy === 'none' && assetReason.replace(/\s+/g, '').length < 12) issues.push('A text-led cover requires a specific data-cover-asset-reason of at least 12 non-space characters.');
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

    const productComparisons = [...document.querySelectorAll('[data-role="product-comparison"]')];
    productComparisons.forEach((comparison, index) => {
      const label = `Product comparison ${index + 1}`;
      const kind = (comparison.dataset.comparisonKind || '').trim();
      if (!['price', 'specification'].includes(kind)) issues.push(`${label}: data-comparison-kind must be "price" or "specification".`);
      const items = [...comparison.querySelectorAll('[data-role="comparison-item"]')].filter(item => item.closest('[data-role="product-comparison"]') === comparison);
      if (items.length < 2) issues.push(`${label}: requires at least two direct comparison-item modules.`);
      const priceTypes = new Set();
      const bases = new Set();
      items.forEach((item, itemIndex) => {
        const sku = (item.dataset.sku || '').trim();
        const priceType = (item.dataset.priceType || '').trim();
        const basis = (item.dataset.comparisonBasis || '').trim();
        if (!slugPattern.test(sku)) issues.push(`${label}, item ${itemIndex + 1}: data-sku must be a lowercase kebab-case identifier.`);
        if (!slugPattern.test(basis)) issues.push(`${label}, item ${itemIndex + 1}: data-comparison-basis must be a lowercase kebab-case identifier.`);
        if (kind === 'price') {
          if (!slugPattern.test(priceType)) issues.push(`${label}, item ${itemIndex + 1}: price comparisons require lowercase kebab-case data-price-type.`);
          else priceTypes.add(priceType);
          if (!/[$¥€£]\s*[\d,.]+|(?:rmb|usd|eur|gbp)\s*[\d,.]+/i.test(item.textContent || '')) issues.push(`${label}, item ${itemIndex + 1}: price comparison item has no visible currency value.`);
        }
        if (basis) bases.add(basis);
      });
      if (kind === 'price' && priceTypes.size > 1) issues.push(`${label}: mixes ${priceTypes.size} price types. Compare official starting, configured, education, or promotional prices in separate relationships.`);
      if (bases.size > 1) issues.push(`${label}: mixes ${bases.size} comparison bases. All items in one relationship must use the same market, tier, and time basis.`);
    });

    posters.forEach((poster, index) => {
      const text = poster.textContent || '';
      // Valuation and funding amounts are financial metrics, not product SKUs.
      // Exclude only explicitly typed metric modules; untyped prices still fail.
      const priceContent = poster.cloneNode(true);
      priceContent.querySelectorAll('[data-role="metric"][data-financial-kind="valuation"], [data-role="metric"][data-financial-kind="funding"]').forEach(metric => metric.remove());
      const currencyCount = ((priceContent.textContent || '').match(/[$¥€£]\s*[\d,.]+|(?:rmb|usd|eur|gbp)\s*[\d,.]+/gi) || []).length;
      const priceCue = /(?:→|->|\bvs\.?\b|对比|相比|涨|降|差额|比上一档)/i.test(text) || /price/.test(poster.dataset.pageGrammar || '');
      if (currencyCount >= 2 && priceCue && !poster.querySelector('[data-role="product-comparison"]')) issues.push(`Page ${index + 1}: contains a multi-price comparison but has no data-role="product-comparison" with SKU, price type, and comparison basis.`);

      const performanceCue = /(?:性能|速度|吞吐|延迟|实测|跑分|benchmark|performance|faster|throughput|latency)/i.test(text);
      const multiplierLeaves = [...poster.querySelectorAll('*')].filter(element => !element.children.length && /(?:\d+(?:\.\d+)?\s*[×xX]|提升\s*\d+(?:\.\d+)?\s*倍)/.test(element.textContent || ''));
      if (performanceCue && multiplierLeaves.length) {
        const claims = [...poster.querySelectorAll('[data-role="performance-claim"]')];
        if (!claims.length) issues.push(`Page ${index + 1}: contains performance multipliers but no data-role="performance-claim".`);
        multiplierLeaves.filter(element => !element.closest('[data-role="performance-claim"]')).forEach(element => issues.push(`Page ${index + 1}: performance multiplier "${element.textContent.trim()}" sits outside a performance-claim module.`));
      }
    });

    [...document.querySelectorAll('[data-role="performance-claim"]')].forEach((claim, index) => {
      const label = `Performance claim ${index + 1}`;
      const subjectValue = (claim.dataset.testSubject || '').trim();
      const baseline = (claim.dataset.testBaseline || '').trim();
      const metric = (claim.dataset.testMetric || '').trim();
      const context = (claim.dataset.testContext || '').trim();
      if (subjectValue.replace(/\s+/g, '').length < 3) issues.push(`${label}: data-test-subject is required.`);
      if (baseline.replace(/\s+/g, '').length < 3) issues.push(`${label}: data-test-baseline is required.`);
      if (normalized(subjectValue) && normalized(subjectValue) === normalized(baseline)) issues.push(`${label}: test subject and baseline must differ.`);
      if (metric.replace(/\s+/g, '').length < 4) issues.push(`${label}: data-test-metric must name the measured quantity.`);
      if (context.replace(/\s+/g, '').length < 12) issues.push(`${label}: data-test-context must state the workload, configuration, or test conditions.`);
      if (!/(?:\d+(?:\.\d+)?\s*[×xX]|提升\s*\d+(?:\.\d+)?\s*倍)/.test(claim.textContent || '')) issues.push(`${label}: no visible performance multiplier was found.`);
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
        if ((element.dataset.densityReason || '').replace(/\s+/g, '').length < 12) issues.push('A data-density-exempt module needs a specific data-density-reason of at least 12 non-space characters.');
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
        issues.push(`Large rounded module ${descriptor} on page ${posters.indexOf(element.closest('.poster')) + 1} has only ${Math.round(occupiedHeight / rect.height * 100)}% vertical content occupancy; contract it or document a valid density exemption.`);
      }
      const contentBottom = Math.max(...intervals.map(([, bottom]) => bottom));
      const bottomReach = (contentBottom - rect.top) / rect.height;
      if (rect.height >= 480 && bottomReach < 0.52) issues.push(`Tall module ${descriptor} on page ${posters.indexOf(element.closest('.poster')) + 1} is top-clustered: meaningful content ends at ${Math.round(bottomReach * 100)}% of its height. Contract the module or document what the remaining height communicates.`);
    });

    return { issues, warnings, summary: { ...modes, contrastChecked, contrastManual, whiteOnColorChecked, posters: posters.length, cardCount: Number.isInteger(cardCount) ? cardCount : null, grammars: grammarCounts.size, subject, assetPolicy, assetAvailability, assetReason, titleEmphasis, titleEmphasisMode, coverFacts: coverFactCount, coverProofs: coverProofCount, coverNextQuestion, productComparisons: productComparisons.length, performanceClaims: document.querySelectorAll('[data-role="performance-claim"]').length } };
  });
}

function auditArtDirectionText(text, result) {
  if (result.summary.assetPolicy !== 'none') return result;
  const availability = (text.match(/^\s*(?:[-*]\s*)?Cover asset availability:\s*(available|unavailable|not-needed)\s*$/im) || [])[1] || '';
  const decision = (text.match(/^\s*(?:[-*]\s*)?Cover asset decision:\s*(required|none)\s*$/im) || [])[1] || '';
  const reason = (text.match(/^\s*(?:[-*]\s*)?Cover asset reason:\s*(.+)\s*$/im) || [])[1] || '';
  if (!availability) result.issues.push('ART_DIRECTION.md must declare "Cover asset availability: available|unavailable|not-needed" for a text-led cover.');
  else if (availability !== result.summary.assetAvailability) result.issues.push(`ART_DIRECTION.md cover asset availability "${availability}" does not match HTML "${result.summary.assetAvailability}".`);
  if (decision !== 'none') result.issues.push('ART_DIRECTION.md must declare "Cover asset decision: none" for a text-led cover.');
  if (reason.replace(/\s+/g, '').length < 12) result.issues.push('ART_DIRECTION.md must give a specific "Cover asset reason" of at least 12 non-space characters.');
  return result;
}

function auditProjectFiles(input, result) {
  const artPath = path.join(path.dirname(path.resolve(input)), 'ART_DIRECTION.md');
  if (!fs.existsSync(artPath)) {
    result.issues.push('ART_DIRECTION.md is required beside index.html.');
    return result;
  }
  return auditArtDirectionText(fs.readFileSync(artPath, 'utf8'), result);
}

async function runFile(input) {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2400, height: 1800 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const result = auditProjectFiles(input, await auditPage(page));
  await browser.close();
  return result;
}

async function selfTest() {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
  const pixel = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect width="120" height="120" fill="%23d97757"/%3E%3C/svg%3E';
  const shell = ({ subject, asset = 'none', availability = 'unavailable', reason = '没有可验证的识别素材，采用信息主导封面。', emphasis = 'recognition', inner, question = 'What changed in this topic?', next = 'What evidence explains the change?', claim = 'confirmed', source = 'source-01' }) => `<body data-card-count="1" data-topic-subject="${subject}" data-cover-asset="${asset}" data-cover-asset-availability="${availability}" data-cover-asset-reason="${reason}" data-title-emphasis="${emphasis}" data-title-emphasis-mode="scale"><section class="poster" id="card-01" data-page-index="1" data-filename="01-cover.png" data-page-grammar="cover-grid" data-page-question="${question}" data-cover-next-question="${next}" data-claim-status="${claim}" data-source-ids="${source}" style="width:1080px;height:1440px;overflow:hidden"><div class="frame"><div class="topline" data-role="page-header"><span>BRIEFGRID</span><span data-role="page-number" data-page-current="1" data-page-total="1">01 / 01</span></div>${inner}<div class="foot" data-role="page-footer"><span data-role="source-footer">SOURCE / ${source}</span><span>END</span></div></div></section></body>`;

  await page.setContent(shell({
    subject: 'Claude Code', asset: 'required', availability: 'available', reason: '官方产品界面可用，封面采用产品证据图。', claim: 'reported', source: 'primary-report',
    question: 'What changed for local sessions?', next: 'What are the exact access conditions?',
    inner: `<h1><span data-role="recognition-anchor" style="font-size:144px">Claude Code</span><span data-role="support-title" style="font-size:76px">手机可发起本地会话</span></h1><img data-role="recognition-asset" data-asset-role="evidence" data-asset-origin="primary-source" data-asset-kind="product-image" data-subject="Claude Code Remote Control" data-source-page="https://publisher.example/report" data-source-url="https://publisher.example/image.svg" data-rights-note="Primary-source editorial evidence" data-pixel-checked="true" src='${pixel}' alt="Claude Code Remote Control product image" style="width:120px;height:120px">`
  }));
  const good = await auditPage(page);
  await page.setContent(shell({
    subject: 'OpenAI', asset: 'required', availability: 'available', reason: '官方品牌图标可用，封面采用紧凑识别图标。', emphasis: 'support', claim: 'mixed', source: 'interview',
    question: 'Why did the training pace change?', next: 'What evidence supports the pause?',
    inner: `<span data-role="claim-label">Paraphrased quote</span><h1><span data-role="recognition-anchor" style="font-size:72px">OpenAI</span><span data-role="support-title" style="font-size:120px">先过安全线，再继续跑</span></h1><img data-role="recognition-asset" data-asset-role="identity" data-asset-origin="official" data-asset-kind="icon" data-subject="OpenAI" data-source-page="https://openai.com" data-source-url="https://openai.com/icon.svg" data-rights-note="Editorial identification" data-pixel-checked="true" src='${pixel}' alt="OpenAI icon" style="width:120px;height:120px">`
  }));
  const creative = await auditPage(page);
  await page.setContent('<body data-topic-subject="Claude Code" data-cover-asset="required"><section class="poster" id="card-01" style="width:1080px;height:1440px"><h1><span data-role="recognition-anchor" style="font-size:72px">手机变成遥控器</span><span data-role="support-title" style="font-size:60px">本地会话</span></h1><img alt="generic terminal"></section></body>');
  const bad = await auditPage(page);
  await page.setContent(shell({ subject: 'Etched', question: 'Why did the valuation double within one month?', next: 'What changed between the two rounds?', source: 'deal-report', inner: `<h1 style="display:flex;flex-direction:column;gap:18px"><span data-role="recognition-anchor" style="font-size:144px">Etched</span><span data-role="support-title" style="font-size:76px">一个月估值翻倍</span></h1><div data-role="cover-proof" data-proof-purpose="comparison" data-fact-ids="valuation-doubled"><div class="metric" data-role="metric" data-metric-purpose="comparison" style="width:420px;height:820px;border-radius:38px;padding:34px;display:flex;flex-direction:column;gap:18px;background:#315eea;color:white"><span class="metric-value" data-role="metric-value" style="font-size:150px">21</span><span class="metric-unit" data-role="metric-object" style="font-size:38px">亿美元估值</span><p class="metric-caption" data-role="metric-context" style="font-size:30px;margin:0">不到一个月翻倍</p></div></div>` }));
  const compositionBad = await auditPage(page);
  await page.setContent(shell({ subject: 'GPT-5.6 Sol', question: 'What changed in pricing?', next: 'What are the three current rates?', source: 'pricing', inner: `<h1><span data-role="recognition-anchor" style="font-size:144px">GPT-5.6 Sol</span><span data-role="support-title" style="font-size:76px">API 限时降价</span></h1><div data-role="content-preview" data-evidence="consequence" data-fact-ids="output-price-drop">输出约降 33%</div><div data-role="cover-proof" data-proof-purpose="comparison" data-fact-ids="output-price-drop">$30 → $20</div>` }));
  const duplicateCover = await auditPage(page);

  await page.setContent(`<body data-card-count="3" data-topic-subject="Apple" data-cover-asset="none" data-cover-asset-availability="unavailable" data-cover-asset-reason="没有可验证素材，测试页码结构审计。" data-title-emphasis="recognition" data-title-emphasis-mode="scale"><main><section class="poster" id="card-01" data-page-index="1" data-filename="01.png" data-page-grammar="cover-grid" data-page-question="What changed in the lineup?" data-cover-next-question="How do the models compare?" data-claim-status="confirmed" data-source-ids="apple" style="width:1080px;height:1440px;overflow:hidden"><div data-role="page-header"><span data-role="page-number" data-page-current="1" data-page-total="2">01 / 02</span></div><h1><span data-role="recognition-anchor" style="font-size:144px">Apple</span><span data-role="support-title" style="font-size:76px">桌面产品更新</span></h1><div data-role="page-footer"><span data-role="source-footer">SOURCE / apple</span></div></section><section class="poster" data-page-index="2" data-filename="02.png" data-page-grammar="comparison-grid" data-page-question="How do the models compare?" data-claim-status="confirmed" data-source-ids="apple" style="width:1080px;height:1440px;overflow:hidden"><div data-role="page-header"><span data-role="page-number" data-page-current="1" data-page-total="2">01 / 02</span></div><div data-role="page-header"><span>SECOND HEADER</span></div><div data-role="page-footer"><span data-role="source-footer">SOURCE / apple</span></div><div data-role="page-footer"><span data-role="source-footer">SOURCE / duplicate</span></div></section></main></body>`);
  const structureBad = await auditPage(page);

  await page.setContent(shell({ subject: 'Mac mini', question: 'How did the prices change?', next: 'Which configuration is comparable?', source: 'apple-pricing', inner: `<h1><span data-role="recognition-anchor" style="font-size:144px">Mac mini</span><span data-role="support-title" style="font-size:76px">价格怎么比</span></h1><div data-role="cover-proof" data-proof-purpose="comparison" data-fact-ids="price-comparison"><div data-role="product-comparison" data-comparison-kind="price"><div data-role="comparison-item" data-sku="mac-mini-m6" data-price-type="official-starting" data-comparison-basis="cn-base-current">¥6999</div><div data-role="comparison-item" data-sku="mac-studio-m5-max" data-price-type="education" data-comparison-basis="cn-education-current">¥19999</div></div></div>` }));
  const comparisonBad = await auditPage(page);

  await page.setContent(shell({ subject: 'Mac mini', question: 'How much faster is the new model?', next: 'What workload produced the multiplier?', source: 'apple-performance', inner: `<h1><span data-role="recognition-anchor" style="font-size:144px">Mac mini</span><span data-role="support-title" style="font-size:76px">性能提升多少</span></h1><div data-role="cover-proof" data-proof-purpose="evidence" data-fact-ids="performance-multiplier"><div data-role="performance-claim" data-test-subject="Mac mini M6" data-test-baseline="Mac mini M4" data-test-metric="render speed" data-test-context="短"><strong>4.8×</strong><span>性能速度</span></div></div>` }));
  const performanceBad = await auditPage(page);

  const artMissing = auditArtDirectionText('Cover asset decision: none\n', { issues: [], warnings: [], summary: { assetPolicy: 'none', assetAvailability: 'available' } });
  const artGood = auditArtDirectionText('Cover asset availability: available\nCover asset decision: none\nCover asset reason: 官方产品素材可用，但截图已作为证据页使用；封面以型号选择问题建立更清晰的认知入口。\n', { issues: [], warnings: [], summary: { assetPolicy: 'none', assetAvailability: 'available' } });

  const modeFixture = ({ language = 'en', palette = 'signal-blue-orange', tone = 'light', htmlLang = language, extra = '', css = '', attributes = '' } = {}) => `<!doctype html><html lang="${htmlLang}"><head><style>body{margin:0;background:#fff;color:#111}h1 span{display:block} ${css}</style></head>${shell({ subject: 'BriefGrid', inner: `<h1><span data-role="recognition-anchor" style="font-size:120px">BriefGrid</span><span data-role="support-title" style="font-size:76px">One clear story</span></h1>${extra}` }).replace('<body ', `<body data-language="${language}" data-palette="${palette}" data-tone="${tone}" ${attributes} `)}</html>`;
  const runMode = async options => { await page.setContent(modeFixture(options)); return auditPage(page); };
  const validModes = [];
  for (const language of ['zh-CN', 'en']) for (const palette of ['signal-blue-orange', 'violet-moss', 'petrol-raspberry']) for (const tone of ['light', 'dark']) {
    validModes.push(await runMode({ language, palette, tone, css: tone === 'dark' ? '.poster{background:#111;color:#fff}' : '' }));
  }
  const invalidModes = await runMode({ language: 'english', palette: 'neon', tone: 'black' });
  const paletteConflict = await runMode({ palette: 'petrol-raspberry', attributes: 'class="palette-violet-moss"' });
  const matchingLegacyPalette = await runMode({ palette: 'violet-moss', attributes: 'class="palette-violet-moss"' });
  const multipleLegacyPalettes = await runMode({ attributes: 'class="palette-violet-moss palette-petrol-raspberry"' });
  const undeclaredLegacyPalettes = [];
  for (const palette of ['violet-moss', 'petrol-raspberry']) {
    await page.setContent(modeFixture({ attributes: `class="palette-${palette}"` }).replace(' data-palette="signal-blue-orange"', ''));
    undeclaredLegacyPalettes.push({ palette, result: await auditPage(page) });
  }
  const languageMismatch = await runMode({ htmlLang: 'zh-CN' });
  const languageMissing = await runMode({ htmlLang: '' });
  const chineseLeftover = await runMode({ extra: '<p>English edition with 残留中文.</p>' });
  const chineseAlt = await runMode({ extra: `<img alt="中文说明" src='${pixel}' style="width:1px;height:1px">` });
  const chineseMarked = await runMode({ extra: '<p>Official name: <span lang="zh-CN">中文名称</span>.</p><blockquote lang="zh">原文引述</blockquote>' });
  const hiddenText = await runMode({ extra: '<span hidden>隐藏</span><span style="visibility:hidden">隐藏</span><span style="opacity:0;color:#fff">隐藏</span><span style="font-size:0">隐藏</span><span style="color:transparent">隐藏</span><span style="display:block;width:0;height:0;overflow:hidden">隐藏</span><span style="color:#fff">\u200B</span>' });
  const restoredVisibility = await runMode({ extra: '<div style="visibility:hidden"><span style="visibility:visible">可见中文</span></div>' });
  const contrastBad = await runMode({ extra: '<p id="small" style="font-size:20px;color:#777">Normal text needs 4.5.</p><p id="large" style="font-size:24px;color:#999">Large text needs 3.</p>' });
  const contrastLargeGood = await runMode({ extra: '<p style="font-size:24px;color:#777">This large text exceeds three to one.</p>' });
  const signalCSS = 'body{--blue:#315eea;--blue-mid:rgb(73,105,209);--orange:#f24b24;--orange-mid:#bb4e33;--blue-soft:#d9e2fa}';
  const signalDarkText = await runMode({ css: signalCSS, extra: '<p id="signal-dark-text" style="font-size:60px;background:var(--orange);color:#111">Dark text has enough numeric contrast but violates the white-text rule.</p>' });
  const signalLowContrast = await runMode({ css: signalCSS, extra: '<p id="signal-low-contrast" style="font-size:60px;background:var(--orange);color:#fbfaf6">Large white text still needs four point five to one.</p>' });
  const signalWhiteFills = await runMode({ css: signalCSS + 'body{--orange:#ca3f1e}', extra: ['--blue', '--blue-mid', '--orange', '--orange-mid'].map(token => `<p style="font-size:30px;background:var(${token});color:#fbfaf6">White text on ${token}</p>`).join('') });
  const signalNestedSoft = await runMode({ css: signalCSS, extra: '<div style="background:var(--blue);color:#fbfaf6"><p style="font-size:30px">Outer solid fill uses white.</p><div style="background:var(--blue-soft);color:#171717"><p style="font-size:30px">The inner soft fill uses dark text.</p></div><div style="background:#fbfaf6;color:#171717"><p style="font-size:30px">The inner neutral fill also uses dark text.</p></div></div>' });
  const signalDarkFill = await runMode({ tone: 'dark', css: signalCSS + 'body{--blue:#243e8a}', extra: '<p style="font-size:30px;background:var(--blue);color:#edf1ff">The dark blue fill uses near-white text.</p>' });
  const signalFadedText = await runMode({ css: signalCSS, extra: '<div style="background:var(--blue)"><p id="signal-faded-text" style="font-size:60px;color:#fbfaf6;opacity:.4">Opacity reduces effective text contrast.</p></div>' });
  const nonSignalFills = await runMode({ palette: 'violet-moss', css: signalCSS, extra: '<p style="font-size:60px;background:var(--orange);color:#111">Other palettes retain their existing contrast rules.</p>' });
  const alphaContrast = await runMode({ extra: '<div style="background:#000"><div style="background:rgba(255,255,255,.5)"><p id="alpha-background" style="font-size:20px;color:#fff">Translucent background</p></div></div><p id="alpha-text" style="font-size:24px;color:rgba(0,0,0,.4)">Translucent text</p><div style="background:#000"><p id="group-opacity" style="font-size:24px;color:white;opacity:.3">Group opacity</p></div>' });
  const gradientContrast = await runMode({ extra: '<p style="font-size:20px;color:#aaa;background:linear-gradient(#fff,#ddd)">Gradient requires visual inspection.</p>' });
  const opaqueOverGradient = await runMode({ extra: '<div style="background:linear-gradient(#fff,#ddd)"><p style="font-size:20px;color:#fff;background:#000">Opaque local fill is measurable.</p></div>' });
  const overlappingImage = await runMode({ extra: `<div style="position:relative;height:110px"><img src='${pixel}' alt="test paint" style="position:absolute;inset:0;width:500px;height:80px"><p style="position:relative;font-size:20px;color:#ccc">Text over an image needs visual review.</p></div>` });
  const financialMetrics = '<div data-role="cover-proof" data-proof-purpose="comparison" data-fact-ids="valuation-change"><div data-role="metric" data-metric-purpose="comparison" data-financial-kind="valuation"><span data-role="metric-value">$10.3B</span><span data-role="metric-object">Earlier valuation</span><p data-role="metric-context">Previous reported financing round.</p></div><div data-role="metric" data-metric-purpose="comparison" data-financial-kind="valuation"><span data-role="metric-value">$21B</span><span data-role="metric-object">Latest valuation</span><p data-role="metric-context">Reported valuation vs the earlier round.</p></div></div>';
  const financialComparison = await runMode({ extra: financialMetrics });
  const financialWithUntypedPrices = await runMode({ extra: financialMetrics + '<div data-role="cover-proof" data-proof-purpose="comparison" data-fact-ids="product-prices">Device prices: $999 vs $1299</div>' });
  const expect = (condition, message, result) => { if (!condition) throw new Error(`${message}\n${JSON.stringify(result, null, 2)}`); };
  validModes.forEach(result => expect(result.issues.length === 0 && result.summary.contrastChecked >= 6, 'A valid language/palette/tone combination failed or escaped contrast auditing.', result));
  expect(good.summary.language === 'zh-CN' && good.summary.palette === 'signal-blue-orange' && good.summary.tone === 'light', 'Legacy defaults changed.', good);
  for (const name of ['language', 'palette', 'tone']) expect(invalidModes.issues.some(issue => issue.startsWith(`body[data-${name}]`)), `Invalid ${name} was accepted.`, invalidModes);
  expect(paletteConflict.issues.some(issue => /Legacy class .* conflicts with/.test(issue)), 'Conflicting legacy palette class overrode declared palette silently.', paletteConflict);
  expect(!matchingLegacyPalette.issues.length, 'A matching legacy palette class was rejected.', matchingLegacyPalette);
  expect(multipleLegacyPalettes.issues.some(issue => /conflicting legacy palette classes/.test(issue)), 'Multiple incompatible legacy palettes were accepted.', multipleLegacyPalettes);
  for (const { palette, result } of undeclaredLegacyPalettes) expect(!result.issues.length && result.summary.palette === palette && result.warnings.some(issue => issue.includes('body[data-palette] is missing')), 'A known legacy palette was not preserved when data-palette was absent.', result);
  for (const result of [languageMismatch, languageMissing]) expect(result.issues.some(issue => /html\[lang\]/.test(issue)), 'Missing or mismatched document language was accepted.', result);
  expect(chineseLeftover.issues.some(issue => /visible Chinese/.test(issue)), 'Chinese text leaked into an English edition.', chineseLeftover);
  expect(chineseAlt.issues.some(issue => /Chinese alt text/.test(issue)), 'Chinese alt text leaked into an English edition.', chineseAlt);
  expect(!chineseMarked.issues.length, 'Explicit Chinese name/quotation exception failed.', chineseMarked);
  expect(!hiddenText.issues.length, 'Hidden or zero-width text caused a false failure.', hiddenText);
  expect(restoredVisibility.issues.some(issue => /visible Chinese/.test(issue)), 'A visible child escaped the language audit because its parent had hidden visibility.', restoredVisibility);
  expect(contrastBad.issues.filter(issue => /text contrast/.test(issue)).length === 2, 'Normal and large-text contrast thresholds were not enforced.', contrastBad);
  expect(!contrastLargeGood.issues.length, 'Large text that clears 3:1 was rejected.', contrastLargeGood);
  expect(signalDarkText.summary.whiteOnColorChecked === 1 && signalDarkText.issues.some(issue => /white-on-color rule/.test(issue)) && !signalDarkText.issues.some(issue => /text contrast/.test(issue)), 'High-contrast dark text escaped the Signal solid-fill white-text rule.', signalDarkText);
  expect(signalLowContrast.issues.some(issue => /text contrast.*below 4\.5:1/.test(issue)) && !signalLowContrast.issues.some(issue => /white-on-color rule/.test(issue)), 'Large white text on a Signal fill escaped the 4.5:1 threshold.', signalLowContrast);
  expect(!signalWhiteFills.issues.length && signalWhiteFills.summary.whiteOnColorChecked === 4, 'Readable white text on one of the four Signal solid-fill tokens failed or escaped checking.', signalWhiteFills);
  expect(!signalNestedSoft.issues.length && signalNestedSoft.summary.whiteOnColorChecked === 1, 'Nested soft/neutral surfaces inherited an outer Signal fill white-text rule.', signalNestedSoft);
  expect(!signalDarkFill.issues.length && signalDarkFill.summary.whiteOnColorChecked === 1, 'Near-white text on a dark Signal fill was rejected.', signalDarkFill);
  expect(signalFadedText.summary.whiteOnColorChecked === 1 && signalFadedText.issues.some(issue => /#signal-faded-text/.test(issue) && /text contrast/.test(issue)), 'Opacity-reduced text on a Signal fill escaped contrast checking.', signalFadedText);
  expect(!nonSignalFills.issues.length && nonSignalFills.summary.whiteOnColorChecked === 0, 'Signal white-text rules leaked into another palette.', nonSignalFills);
  for (const id of ['alpha-background', 'alpha-text', 'group-opacity']) expect(alphaContrast.issues.some(issue => issue.includes(`#${id}`) && /text contrast/.test(issue)), `Transparent layer handling missed ${id}.`, alphaContrast);
  expect(gradientContrast.summary.contrastManual === 1 && !gradientContrast.issues.length, 'Gradient background received an unreliable contrast verdict.', gradientContrast);
  expect(opaqueOverGradient.summary.contrastManual === 0 && !opaqueOverGradient.issues.length, 'Opaque fill over a gradient was not measured.', opaqueOverGradient);
  expect(overlappingImage.summary.contrastManual === 1 && !overlappingImage.issues.some(issue => /text contrast/.test(issue)), 'Image backdrop received an unreliable contrast verdict.', overlappingImage);
  expect(!financialComparison.issues.length, 'Valuation metrics were treated as product prices.', financialComparison);
  expect(financialWithUntypedPrices.issues.some(issue => /multi-price comparison/.test(issue)), 'Financial metrics allowed unrelated product prices to bypass the contract.', financialWithUntypedPrices);
  await browser.close();
  if (good.issues.length) throw new Error(`Good fixture failed:\n${good.issues.join('\n')}`);
  if (creative.issues.length) throw new Error(`Creative fixture failed:\n${creative.issues.join('\n')}`);
  if (bad.issues.length < 5) throw new Error(`Bad fixture was not rejected strongly enough:\n${bad.issues.join('\n')}`);
  if (!compositionBad.issues.some(issue => /top-clustered|vertical content occupancy/.test(issue))) throw new Error(`Composition fixture did not trigger fatal low-density detection:\n${compositionBad.issues.join('\n')}`);
  if (!duplicateCover.issues.some(issue => /repeated across separate evidence modules/.test(issue))) throw new Error(`Duplicate cover facts were not rejected:\n${duplicateCover.issues.join('\n')}`);
  if (!structureBad.issues.some(issue => /duplicates page 1|duplicates page/.test(issue))) throw new Error(`Duplicate page number was not rejected:\n${structureBad.issues.join('\n')}`);
  if (!structureBad.issues.some(issue => /declares 3 cards but found 2/.test(issue))) throw new Error(`Card-count mismatch was not rejected:\n${structureBad.issues.join('\n')}`);
  if (!structureBad.issues.some(issue => /exactly one page header; found 2/.test(issue)) || !structureBad.issues.some(issue => /exactly one source-footer element; found 2/.test(issue))) throw new Error(`Split page shell was not rejected:\n${structureBad.issues.join('\n')}`);
  if (!comparisonBad.issues.some(issue => /mixes 2 price types/.test(issue)) || !comparisonBad.issues.some(issue => /mixes 2 comparison bases/.test(issue))) throw new Error(`Mixed comparison basis was not rejected:\n${comparisonBad.issues.join('\n')}`);
  if (!performanceBad.issues.some(issue => /data-test-context/.test(issue))) throw new Error(`Incomplete performance context was not rejected:\n${performanceBad.issues.join('\n')}`);
  if (artMissing.issues.length < 2 || artGood.issues.length) throw new Error(`ART_DIRECTION asset-decision audit failed. missing=${artMissing.issues.join(' | ')} good=${artGood.issues.join(' | ')}`);
  console.log(`Audit self-test passed: valid fixtures=2; malformed base=${bad.issues.length} issues; card-count mismatch, split page shell, duplicate page numbers, low density, duplicate facts, mixed price bases, incomplete performance context, and missing text-cover rationale all rejected.`);
  console.log('Mode regression passed: 12 language/palette/tone combinations; legacy defaults; invalid declarations; language mismatch; English text/alt; marked original language; hidden text; normal/large contrast; alpha layers; gradient/image manual review.');
  console.log('Signal contrast regression passed: four solid-fill tokens require near-white text and 4.5:1 at every size; nested soft/neutral surfaces, dark tone, faded text, and other palettes checked.');
}

async function main() {
  if (process.argv.includes('--self-test')) return selfTest();
  const input = process.argv[2];
  if (!input) throw new Error('Usage: audit.cjs <index.html> | --self-test');
  const result = await runFile(input);
  console.log(JSON.stringify(result, null, 2));
  if (result.issues.length) process.exitCode = 2;
}

module.exports = { auditPage, auditProjectFiles, auditArtDirectionText, runFile };
if (require.main === module) main().catch(error => { console.error(error.stack || error); process.exit(1); });
