// smart-icon-fix-v7.mjs
// V7: Detect missing lucide-react icons used as JSX tags AND as values (object props, etc.)

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
  // Aliases from the export list: "... as AliasName"
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
    // Handle: type X, type X as Y, X as Y, X
    const typeAlias = part.match(/^type\s+([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$/);
    if (typeAlias) {
      result.push({ original: typeAlias[1], local: typeAlias[2], raw: part, isType: true });
      return;
    }
    const typeOnly = part.match(/^type\s+([A-Za-z0-9_]+)$/);
    if (typeOnly) {
      result.push({ original: typeOnly[1], local: typeOnly[1], raw: part, isType: true });
      return;
    }
    const asMatch = part.match(/^([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$/);
    if (asMatch) {
      result.push({ original: asMatch[1], local: asMatch[2], raw: part });
      return;
    }
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
  const result = { file: filepath, currentImports: [], jsxUsages: [], valueUsages: [], missing: [] };

  // Extract lucide-react import block(s)
  const lucideRe = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]\s*;?/g;
  let m;
  while ((m = lucideRe.exec(content)) !== null) {
    const parsed = parseLucideImports(m[1]);
    result.currentImports.push(...parsed);
  }

  // Find JSX usages
  const jsxTagRe = /<([A-Z][A-Za-z0-9_]*)\b(?!\[)/g;
  const seenJsx = new Set();
  let j;
  while ((j = jsxTagRe.exec(content)) !== null) {
    const name = j[1];
    if (HTML_TAGS.has(name)) continue;
    if (seenJsx.has(name)) continue;
    seenJsx.add(name);
    result.jsxUsages.push(name);
  }

  // Find VALUE-position PascalCase identifiers
  // Pattern: identifier as a value, not as a type or property name
  // Common value positions:
  //   - JSX prop value: = {Xxx} or = {Xxx}
  //   - Object property value: { key: Xxx, }
  //   - Array element: [Xxx, ...]
  //   - Variable assignment: const/let/var X = Y; (Y is the value)
  //   - Ternary: cond ? Xxx : Yyy
  //   - Function arg: f(Xxx, ...)
  // We look for identifiers preceded by one of: ` = `, `, `, `? `, `: ` (with leading `,` or `{`), `(`, `[`
  // We exclude:
  //   - Type positions: `key: Xxx` in object literals where Xxx is the type
  //     (hard to distinguish; we'll check by context: if preceded by `{ key:` or `:` after a prop name, skip)
  //   - Property names in object types: `interface { key: Type }` - this is type position
  // For safety, we use specific patterns:
  //   - JSX prop value: `={Xxx}` or `={ Xxx }`
  //   - Object literal value: `key:\s*Xxx,` or `key:\s*Xxx\n`
  //   - Array literal: `[Xxx,`
  //   - After `=`: `= Xxx,` or `= Xxx;` or `= Xxx\n`
  //   - After `,` in array/object: `, Xxx,` or `, Xxx\n`
  //   - After `(` in call: `(Xxx,` or `(Xxx)`
  //   - After `? ` in ternary: `? Xxx :`
  //   - After `: ` in ternary: `: Xxx,` or `: Xxx)`
  const valuePatterns = [
    // JSX attribute value: ={Xxx} or ={ Xxx }
    { re: /=\{\s*([A-Z][A-Za-z0-9_]*)\b/g, idx: 1 },
    // Object literal value: key: Xxx, or key: Xxx\n (group 1 = key, group 2 = value)
    { re: /(?<![a-zA-Z0-9_$])([a-z][a-zA-Z0-9_]*)\s*:\s*([A-Z][A-Za-z0-9_]*)\s*[,}\n]/g, idx: 2 },
    // Array literal: [Xxx, Xxx]
    { re: /\[\s*([A-Z][A-Za-z0-9_]*)\b/g, idx: 1 },
    // Ternary: ? Xxx : Yyy (after ?)
    { re: /\?\s*([A-Z][A-Za-z0-9_]*)\s*:/g, idx: 1 },
    // Ternary: : Yyy after ? Xxx
    { re: /\?\s*[A-Z][A-Za-z0-9_]*\s*:\s*([A-Z][A-Za-z0-9_]*)\s*[,)]/g, idx: 1 },
    // Assignment: = Xxx (after =)
    { re: /=\s*([A-Z][A-Za-z0-9_]*)\b/g, idx: 1 },
    // Function call argument: (Xxx, ...) or (Xxx)
    { re: /\(\s*([A-Z][A-Za-z0-9_]*)\b/g, idx: 1 },
  ];
  const seenValue = new Set();
  for (const { re, idx } of valuePatterns) {
    let v;
    while ((v = re.exec(cleaned)) !== null) {
      const name = v[idx];
      if (HTML_TAGS.has(name)) continue;
      if (seenValue.has(name)) continue;
      seenValue.add(name);
      result.valueUsages.push(name);
    }
  }

  const originalNames = new Set(result.currentImports.map(i => i.original));
  const localNames = new Set(result.currentImports.map(i => i.local));
  const allImports = getAllImports(content);

  for (const name of result.jsxUsages) {
    if (!LUCIDE_EXPORTS.has(name)) continue;
    if (originalNames.has(name) || localNames.has(name)) continue;
    if (allImports.has(name)) continue;
    if (LOCALLY_AMBIGUOUS.has(name) && isLocalDefinition(content, name)) continue;
    result.missing.push(name);
  }
  for (const name of result.valueUsages) {
    if (!LUCIDE_EXPORTS.has(name)) continue;
    if (originalNames.has(name) || localNames.has(name)) continue;
    if (allImports.has(name)) continue;
    if (LOCALLY_AMBIGUOUS.has(name) && isLocalDefinition(content, name)) continue;
    // avoid duplicate
    if (!result.missing.includes(name)) result.missing.push(name);
  }

  return result;
}

function fixFile(info) {
  if (info.missing.length === 0) return false;
  const content = fs.readFileSync(info.file, 'utf-8');
  const importRe = /import[^\S\n]*\{([^}]+)\}[^\S\n]*from[^\S\n]*['"]lucide-react['"]([^\S\n]*;?[^\S\n]*)?/;
  const m = content.match(importRe);
  if (!m) return false;

  const existingText = m[1];
  const trailing = m[2] || '';
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
  const hadSemicolon = /;\s*$/.test(trailing);

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