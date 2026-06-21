// smart-icon-fix-final.mjs
// FINAL: Smart lucide-react import fixer
// - Skips JS globals (Infinity, NaN, etc.)
// - Skips names imported from other modules
// - Skips locally defined names
// - Preserves existing aliases (e.g., "Image as ImageIcon")
// - Adds only what's actually used and missing

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, 'src');

const lucideIdx = path.resolve(__dirname, 'node_modules', 'lucide-react', 'dist', 'lucide-react.d.ts');
let LUCIDE_EXPORTS = new Set();
if (fs.existsSync(lucideIdx)) {
  const content = fs.readFileSync(lucideIdx, 'utf-8');
  // Primary exports: declare const X: ...
  const matches = content.matchAll(/^\s*(?:declare const|const)\s+([A-Z][A-Za-z0-9_]*)\s*:/gm);
  for (const m of matches) LUCIDE_EXPORTS.add(m[1]);
  // Aliases: ... as X
  const aliasMatches = content.matchAll(/\bas\s+([A-Z][A-Za-z0-9_]*)\b/g);
  for (const m of aliasMatches) LUCIDE_EXPORTS.add(m[1]);
}
console.log(`Lucide exports known (including aliases): ${LUCIDE_EXPORTS.size}`);

const HTML_TAGS = new Set([
  'a','abbr','address','area','article','aside','audio','b','base','bdi','bdo','big','blockquote','body','br','button',
  'canvas','caption','cite','code','col','colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl','dt',
  'em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','hr','html',
  'i','iframe','img','input','ins','kbd','keygen','label','legend','li','link','main','map','mark','marquee','menu','menuitem',
  'meta','meter','nav','noscript','object','ol','optgroup','option','output','p','param','picture','pre','progress','q',
  'rp','rt','ruby','s','samp','script','section','select','small','source','span','strong','style','sub','summary','sup',
  'table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','u','ul','var','video','wbr',
  'svg','g','path','circle','rect','line','polyline','polygon','text','tspan','defs','linearGradient','radialGradient','stop','mask','filter',
  'use','symbol','marker','pattern','clipPath','foreignObject','image',
  'Layout','Header','Content','Footer','Sider','Menu','Form','Input','Button','Select','Option','Card','Row','Col','Modal','Drawer','Table',
  'Tag','Tabs','TabPane','Checkbox','Radio','Switch','DatePicker','TimePicker','Slider','Progress','Badge','Avatar','Tooltip','Popover',
  'Popconfirm','Dropdown','MenuItem','SubMenu','Breadcrumb','Pagination','Steps','Step','Timeline','TimelineItem','Alert','Message','Notification',
  'Spin','Skeleton','Empty','Result','Statistic','Typography','Title','Paragraph','Text','Divider','List','ListItem','Tree','TreeNode',
  'Cascader','Transfer','TreeSelect','AutoComplete','InputNumber','Rate','Switch','Upload','Carousel','Collapse','Anchor','Affix','BackTop',
  'ConfigProvider','Space','Flex','Grid','Segmented','Descriptions','FormItem',
  'Fragment','Suspense','StrictMode','Profiler','Component','Children',
]);

// JavaScript globals / built-ins that are also lucide icon names
// NEVER import these as lucide icons - they would shadow the global
const JS_GLOBALS = new Set([
  'Infinity', 'NaN', 'undefined',
  // Common React/DOM globals
  'Math', 'Date', 'RegExp', 'Error', 'Promise', 'Set', 'Map', 'Symbol',
  'Array', 'Object', 'String', 'Number', 'Boolean', 'Function',
  // React/Redux etc
  'Component', 'Fragment', 'Suspense', 'StrictMode', 'Profiler',
]);

// Names that are real lucide exports BUT commonly used as local prop aliases
const LOCALLY_AMBIGUOUS = new Set(['Icon', 'Code', 'Image', 'Workflow', 'File', 'Edit']);

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name === 'node_modules' || f.name === '__tests__' || f.name === 'dist') continue;
      walk(p, files);
    } else if (f.isFile() && /\.(tsx|ts)$/.test(f.name)) {
      files.push(p);
    }
  }
  return files;
}

function stripComments(s) {
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  s = s.replace(/\/\/[^\n]*/g, '');
  return s;
}

function parseLucideImports(importBlock) {
  const cleaned = stripComments(importBlock);
  const result = [];
  cleaned.split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
    const typeAlias = part.match(/^type\s+([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$/);
    if (typeAlias) { result.push({ original: typeAlias[1], local: typeAlias[2], raw: part, isType: true }); return; }
    const typeOnly = part.match(/^type\s+([A-Za-z0-9_]+)$/);
    if (typeOnly) { result.push({ original: typeOnly[1], local: typeOnly[1], raw: part, isType: true }); return; }
    const asMatch = part.match(/^([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$/);
    if (asMatch) { result.push({ original: asMatch[1], local: asMatch[2], raw: part }); return; }
    const ident = part.match(/^[A-Za-z0-9_]+/);
    if (ident) result.push({ original: ident[0], local: ident[0], raw: part });
  });
  return result;
}

function isLocalDefinition(content, name) {
  const patterns = [
    new RegExp(`(?:^|[\\s,(\\[{;])const\\s+${name}\\s*[:=]`, 'm'),
    new RegExp(`(?:^|[\\s,(\\[{;])let\\s+${name}\\s*[:=]`, 'm'),
    new RegExp(`(?:^|[\\s,(\\[{;])var\\s+${name}\\s*[:=]`, 'm'),
    new RegExp(`(?:^|[\\s,(\\[{;])function\\s+${name}\\b`, 'm'),
    new RegExp(`(?:^|[\\s,(\\[{;])type\\s+${name}\\s*=`, 'm'),
    new RegExp(`(?:^|[\\s,(\\[{;])interface\\s+${name}\\b`, 'm'),
    new RegExp(`(?:^|[\\s,(\\[{;])class\\s+${name}\\b`, 'm'),
    new RegExp(`(?:\\w+\\s*:\\s*)?${name}\\s*[,}]`, 'm'),
    new RegExp(`\\(\\s*(?:[^)]*?\\b${name}\\b[^)]*?)[,)]`, 'm'),
  ];
  for (const re of patterns) {
    if (re.test(content)) return true;
  }
  return false;
}

function getAllImports(content) {
  const cleaned = stripComments(content);
  const result = new Set();
  const importRe = /import\s*(?:\{([^}]+)\}|(\w+))\s*from\s*['"][^'"]+['"]/g;
  let m;
  while ((m = importRe.exec(cleaned)) !== null) {
    if (m[1]) {
      m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
        const asMatch = part.match(/^type\s+([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$/);
        if (asMatch) { result.add(asMatch[1]); result.add(asMatch[2]); return; }
        const asAlias = part.match(/^([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$/);
        if (asAlias) { result.add(asAlias[1]); result.add(asAlias[2]); return; }
        const ident = part.match(/^type\s+([A-Za-z0-9_]+)$|^([A-Za-z0-9_]+)$/);
        if (ident) result.add(ident[1] || ident[2]);
      });
    }
    if (m[2]) result.add(m[2]);
  }
  return result;
}

function analyzeFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const cleaned = stripComments(content);
  const result = { file: filepath, currentImports: [], missing: [] };

  const lucideRe = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]\s*;?/g;
  let m;
  while ((m = lucideRe.exec(content)) !== null) {
    const parsed = parseLucideImports(m[1]);
    result.currentImports.push(...parsed);
  }

  const usedNames = new Set();

  // JSX usages: <Xxx ...>
  const jsxTagRe = /<([A-Z][A-Za-z0-9_]*)\b(?!\[)/g;
  let j;
  while ((j = jsxTagRe.exec(content)) !== null) {
    const name = j[1];
    if (HTML_TAGS.has(name)) continue;
    usedNames.add(name);
  }

  // Value-position identifiers
  const valuePatterns = [
    { re: /=\{\s*([A-Z][A-Za-z0-9_]*)\b/g, idx: 1 },
    { re: /(?<![a-zA-Z0-9_$])([a-z][a-zA-Z0-9_]*)\s*:\s*([A-Z][A-Za-z0-9_]*)\s*[,}\n]/g, idx: 2 },
    { re: /\[\s*([A-Z][A-Za-z0-9_]*)\b/g, idx: 1 },
    { re: /\?\s*([A-Z][A-Za-z0-9_]*)\s*:/g, idx: 1 },
    { re: /\?\s*[A-Z][A-Za-z0-9_]*\s*:\s*([A-Z][A-Za-z0-9_]*)\s*[,)]/g, idx: 1 },
    { re: /=\s*([A-Z][A-Za-z0-9_]*)\b/g, idx: 1 },
    { re: /\(\s*([A-Z][A-Za-z0-9_]*)\b/g, idx: 1 },
  ];
  for (const { re, idx } of valuePatterns) {
    let v;
    while ((v = re.exec(cleaned)) !== null) {
      const name = v[idx];
      if (HTML_TAGS.has(name)) continue;
      usedNames.add(name);
    }
  }

  const originalNames = new Set(result.currentImports.map(i => i.original));
  const localNames = new Set(result.currentImports.map(i => i.local));
  const allImports = getAllImports(content);

  for (const name of usedNames) {
    if (!LUCIDE_EXPORTS.has(name)) continue;
    if (originalNames.has(name) || localNames.has(name)) continue;
    if (allImports.has(name)) continue;
    // CRITICAL: Skip JS globals - they shadow dangerous globals
    if (JS_GLOBALS.has(name)) continue;
    // For ambiguous names, skip if locally defined
    if (LOCALLY_AMBIGUOUS.has(name) && isLocalDefinition(content, name)) continue;
    result.missing.push(name);
  }

  return result;
}

function fixFile(info) {
  if (info.missing.length === 0) return false;
  const content = fs.readFileSync(info.file, 'utf-8');
  const importRe = /import[^\S\n]*\{([^}]+)\}[^\S\n]*from[^\S\n]*['"]lucide-react['"][^\S\n]*;?[^\S\n]*/;
  const m = content.match(importRe);
  if (!m) return false;

  const existingText = m[1];
  const trailing = m[0].slice(m[0].length - (content.slice(m.index, m.index + m[0].length).length - m[1].length - 1));
  // Better: detect trailing semicolon from the match
  const fullMatch = m[0];
  const hadSemicolon = /;\s*$/.test(fullMatch);

  const existingParts = parseLucideImports(existingText);
  const existingSet = new Set(existingParts.map(p => p.local));

  const newParts = existingParts.map(p => p.raw);
  const sortedMissing = [...info.missing]
    .filter(n => !existingSet.has(n) && !existingParts.some(p => p.original === n))
    .sort();
  for (const icon of sortedMissing) newParts.push(icon);

  const lineStart = content.lastIndexOf('\n', m.index) + 1;
  const leadingWS = m[0].match(/^\s*/)[0];
  const isMultiLine = existingText.includes('\n');

  let newImport;
  if (isMultiLine) {
    newImport = `${leadingWS}import {\n${newParts.map(p => '  ' + p).join(',\n')}\n${leadingWS}} from 'lucide-react'${hadSemicolon ? ';' : ''}`;
  } else {
    newImport = `${leadingWS}import { ${newParts.join(', ')} } from 'lucide-react'${hadSemicolon ? ';' : ''}`;
  }

  const newContent = content.slice(0, lineStart) + newImport + content.slice(lineStart + m[0].length);
  fs.writeFileSync(info.file, newContent, 'utf-8');
  return true;
}

const files = [
  ...walk(path.join(SRC_DIR, 'pages')),
  ...walk(path.join(SRC_DIR, 'components')),
];

console.log(`\nScanning ${files.length} files...`);
const summary = [];
for (const f of files) {
  const info = analyzeFile(f);
  if (info.missing.length > 0) summary.push(info);
}

console.log(`\n=== Files with missing lucide-react icons: ${summary.length} ===\n`);
for (const info of summary) {
  console.log(`${path.relative(SRC_DIR, info.file)}`);
  console.log(`   missing: ${info.missing.sort().join(', ')}`);
}

console.log(`\n=== Applying fixes... ===\n`);
let fixed = 0;
for (const info of summary) {
  const ok = fixFile(info);
  if (ok) {
    fixed++;
    console.log(`✓ ${path.relative(SRC_DIR, info.file)}: added ${info.missing.sort().join(', ')}`);
  }
}
console.log(`\nTotal files fixed: ${fixed}`);