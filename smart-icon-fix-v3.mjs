// smart-icon-fix-v3.mjs
// V3: Stricter local variable detection to avoid false-positive imports

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, 'src');

const lucideIdx = path.resolve(__dirname, 'node_modules', 'lucide-react', 'dist', 'lucide-react.d.ts');
let LUCIDE_EXPORTS = new Set();
if (fs.existsSync(lucideIdx)) {
  const content = fs.readFileSync(lucideIdx, 'utf-8');
  const matches = content.matchAll(/^\s*(?:declare const|const)\s+([A-Z][A-Za-z0-9_]*)\s*:/gm);
  for (const m of matches) LUCIDE_EXPORTS.add(m[1]);
}
console.log(`Lucide exports known: ${LUCIDE_EXPORTS.size}`);

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

// Names that are real lucide exports BUT commonly used as local var names
// We only skip the auto-import if the file uses them as locals
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

// Check if `name` is defined locally (not just imported) in the file
function isLocalDefinition(content, name) {
  // Const/let/var declarations: const Name = | const Name: | let Name | var Name
  // Function declarations: function Name(
  // Type aliases: type Name =
  // Interface: interface Name
  // Class: class Name
  // Destructured parameters: ({ Name } or { icon: Name, ... })
  // Object property with value: { Name, } or { Name: ... }
  // Arrow function arg: (Name) => ...
  // Parameter declaration in function body: function (Name: ...) =>
  // We exclude occurrences inside the import block itself (we'll match inside content but not as first declaration)
  const patterns = [
    new RegExp(`(?:^|[\\s,(\\{])const\\s+${name}\\s*[:=]`, 'm'),
    new RegExp(`(?:^|[\\s,(\\{])let\\s+${name}\\s*[:=]`, 'm'),
    new RegExp(`(?:^|[\\s,(\\{])var\\s+${name}\\s*[:=]`, 'm'),
    new RegExp(`(?:^|[\\s,(\\{])function\\s+${name}\\b`, 'm'),
    new RegExp(`(?:^|[\\s,(\\{])type\\s+${name}\\s*=`, 'm'),
    new RegExp(`(?:^|[\\s,(\\{])interface\\s+${name}\\b`, 'm'),
    new RegExp(`(?:^|[\\s,(\\{])class\\s+${name}\\b`, 'm'),
    // destructuring: { name, ... } or { ... name ... }
    new RegExp(`\\{\\s*(?:\\w+\\s*:\\s*)?${name}\\s*[,}]`, 'm'),
    new RegExp(`\\([^)]*\\b${name}\\s*[:)]`, 'm'),  // parameter: (Name: type) or (Name)
  ];
  for (const re of patterns) {
    if (re.test(content)) return true;
  }
  return false;
}

function analyzeFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const result = { file: filepath, currentImports: [], jsxUsages: [], missing: [] };

  // Extract lucide-react import block(s)
  const importRe = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]\s*;?/g;
  let m;
  while ((m = importRe.exec(content)) !== null) {
    const inside = m[1];
    inside.split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
      const asMatch = part.match(/^([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)$/);
      if (asMatch) {
        result.currentImports.push({ original: asMatch[1], local: asMatch[2], raw: part });
      } else {
        const ident = part.match(/^[A-Za-z0-9_]+/);
        if (ident) {
          result.currentImports.push({ original: ident[0], local: ident[0], raw: part });
        }
      }
    });
  }

  // Find JSX usages
  const jsxTagRe = /<([A-Z][A-Za-z0-9_]*)\b/g;
  const seen = new Set();
  let j;
  while ((j = jsxTagRe.exec(content)) !== null) {
    const name = j[1];
    if (HTML_TAGS.has(name)) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    result.jsxUsages.push(name);
  }

  const originalNames = new Set(result.currentImports.map(i => i.original));
  const localNames = new Set(result.currentImports.map(i => i.local));

  for (const name of result.jsxUsages) {
    if (!LUCIDE_EXPORTS.has(name)) continue;
    if (originalNames.has(name) || localNames.has(name)) continue;

    // If name is ambiguous and used locally, skip
    if (LOCALLY_AMBIGUOUS.has(name) && isLocalDefinition(content, name)) continue;

    result.missing.push(name);
  }

  return result;
}

function fixFile(info) {
  if (info.missing.length === 0) return false;
  const content = fs.readFileSync(info.file, 'utf-8');
  const importRe = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]\s*;?/;
  const m = content.match(importRe);
  if (!m) return false;

  const existingText = m[1];
  const existingParts = existingText.split(',').map(s => s.trim()).filter(Boolean);
  const newParts = [...existingParts];
  const sorted = [...info.missing].sort();
  for (const icon of sorted) newParts.push(icon);

  const lineStart = content.lastIndexOf('\n', m.index) + 1;
  const leadingWS = m[0].match(/^\s*/)[0];

  // Detect if existing is single-line or multi-line
  const isMultiLine = existingText.includes('\n');

  let newImport;
  if (isMultiLine) {
    newImport = `${leadingWS}import {\n${newParts.map(p => '  ' + p).join(',\n')}\n${leadingWS}} from 'lucide-react'`;
  } else {
    newImport = `${leadingWS}import { ${newParts.join(', ')} } from 'lucide-react'`;
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