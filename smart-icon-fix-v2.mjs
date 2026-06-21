// smart-icon-fix-v2.mjs
// Scans src/pages and src/components for missing lucide-react imports
// and adds them to the import list. V2: smarter about prop aliases.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, 'src');

// Build list of all valid lucide-react exports dynamically
const lucideIdx = path.resolve(__dirname, 'node_modules', 'lucide-react', 'dist', 'lucide-react.d.ts');
let LUCIDE_EXPORTS = new Set();
if (fs.existsSync(lucideIdx)) {
  const content = fs.readFileSync(lucideIdx, 'utf-8');
  const matches = content.matchAll(/^\s*(?:declare const|const)\s+([A-Z][A-Za-z0-9_]*)\s*:/gm);
  for (const m of matches) LUCIDE_EXPORTS.add(m[1]);
}
console.log(`Lucide exports known: ${LUCIDE_EXPORTS.size}`);

// HTML / JSX built-in tags to exclude (lowercase)
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
  // Antd components that may not be PascalCase-but-already-imported
  'Layout','Header','Content','Footer','Sider','Menu','Form','Input','Button','Select','Option','Card','Row','Col','Modal','Drawer','Table',
  'Tag','Tabs','TabPane','Checkbox','Radio','Switch','DatePicker','TimePicker','Slider','Progress','Badge','Avatar','Tooltip','Popover',
  'Popconfirm','Dropdown','MenuItem','SubMenu','Breadcrumb','Pagination','Steps','Step','Timeline','TimelineItem','Alert','Message','Notification',
  'Spin','Skeleton','Empty','Result','Statistic','Typography','Title','Paragraph','Text','Divider','List','ListItem','Tree','TreeNode',
  'Cascader','Transfer','TreeSelect','AutoComplete','InputNumber','Rate','Switch','Upload','Carousel','Collapse','Anchor','Affix','BackTop',
  'ConfigProvider','Space','Flex','Grid','Segmented','Descriptions','FormItem',
  // React common
  'Fragment','Suspense','StrictMode','Profiler','Component','Children','createContext','useState','useEffect','useMemo','useCallback','useRef',
  'useContext','useReducer','useImperativeHandle','forwardRef','lazy','memo','createElement',
]);

// Generic names that may be local prop aliases (NOT always missing imports)
// We only treat them as missing if they are referenced WITHOUT being a destructured local alias.
const GENERIC_NAMES = new Set(['Icon', 'Code', 'Image', 'Workflow', 'File', 'Edit']);

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

function isLocalAlias(content, name) {
  // Detect if `name` is a destructured/aliased parameter or const declaration
  // Patterns:
  //  ({ icon: Name, ... }) or ({ Name, ... }) or const { Name } = ...
  // const Name = ...
  // const Name: ...
  // Look for destructuring with `name` as alias
  const patterns = [
    new RegExp(`\\{\\s*(?:icon|img|image)\\s*:\\s*${name}\\s*[,}]`, 'g'),  // ({ icon: Name, ... })
    new RegExp(`\\{\\s*${name}\\s*[,}]`, 'g'),  // ({ Name, ... })
    new RegExp(`=\\s*${name}\\s*[,;)\\n]`, 'g'),  // catch-all prop binding (loose)
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

    // If the name is in our "generic" list, check if it's used as a local alias
    // If yes, skip (don't add to import)
    if (GENERIC_NAMES.has(name)) {
      if (isLocalAlias(content, name)) continue;
    }

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
  const newImport = `${leadingWS}import {\n${newParts.map(p => '  ' + p).join(',\n')}\n${leadingWS}} from 'lucide-react'`;

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