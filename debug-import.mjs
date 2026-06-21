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
  const aliasMatches = content.matchAll(/\bas\s+([A-Z][A-Za-z0-9_]*)\b/g);
  for (const m of aliasMatches) LUCIDE_EXPORTS.add(m[1]);
}

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

const JS_GLOBALS = new Set([
  'Infinity', 'NaN', 'undefined', 'Math', 'Date', 'RegExp', 'Error', 'Promise', 'Set', 'Map', 'Symbol',
  'Array', 'Object', 'String', 'Number', 'Boolean', 'Function',
  'Component', 'Fragment', 'Suspense', 'StrictMode', 'Profiler',
]);

const LOCALLY_AMBIGUOUS = new Set(['Icon', 'Code', 'Image', 'Workflow', 'File', 'Edit']);

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

  const jsxTagRe = /<([A-Z][A-Za-z0-9_]*)\b(?!\[)/g;
  let j;
  while ((j = jsxTagRe.exec(content)) !== null) {
    const name = j[1];
    if (HTML_TAGS.has(name)) continue;
    usedNames.add(name);
  }

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

  console.log('usedNames includes TrendingUp:', usedNames.has('TrendingUp'));

  for (const name of usedNames) {
    if (!LUCIDE_EXPORTS.has(name)) continue;
    if (originalNames.has(name) || localNames.has(name)) continue;
    if (allImports.has(name)) continue;
    if (JS_GLOBALS.has(name)) continue;
    if (LOCALLY_AMBIGUOUS.has(name)) continue;
    result.missing.push(name);
  }
  return result;
}

const r = analyzeFile('src/components/dicom/LesionTrackingViewer.tsx');
console.log('missing:', r.missing);