// smart-icon-fix.mjs
// Scans src/pages and src/components for missing lucide-react imports
// and adds them to the import list.

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
  // Match "declare const X: ..." or "X: LucideIcon" patterns
  const matches = content.matchAll(/^\s*(?:declare const|const)\s+([A-Z][A-Za-z0-9_]*)\s*:/gm);
  for (const m of matches) LUCIDE_EXPORTS.add(m[1]);
}
console.log(`Lucide exports known: ${LUCIDE_EXPORTS.size}`);

// HTML / JSX built-in tags to exclude
const HTML_TAGS = new Set([
  // standard html elements (lowercase)
  'a','abbr','address','area','article','aside','audio','b','base','bdi','bdo','big','blockquote','body','br','button',
  'canvas','caption','cite','code','col','colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl','dt',
  'em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','hr','html',
  'i','iframe','img','input','ins','kbd','keygen','label','legend','li','link','main','map','mark','marquee','menu','menuitem',
  'meta','meter','nav','noscript','object','ol','optgroup','option','output','p','param','picture','pre','progress','q',
  'rp','rt','ruby','s','samp','script','section','select','small','source','span','strong','style','sub','summary','sup',
  'table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','u','ul','var','video','wbr',
  // SVG (lowercase)
  'svg','g','path','circle','rect','line','polyline','polygon','text','tspan','defs','linearGradient','radialGradient','stop','mask','filter',
  'use','symbol','marker','pattern','clipPath','foreignObject','image',
  // antd components (we won't touch these even though they may not be imported)
  'Layout','Header','Content','Footer','Sider','Menu','Form','Input','Button','Select','Option','Card','Row','Col','Modal','Drawer','Table',
  'Tag','Tabs','TabPane','Checkbox','Radio','Switch','DatePicker','TimePicker','Slider','Progress','Badge','Avatar','Tooltip','Popover',
  'Popconfirm','Dropdown','MenuItem','SubMenu','Breadcrumb','Pagination','Steps','Step','Timeline','TimelineItem','Alert','Message','Notification',
  'Spin','Skeleton','Empty','Result','Statistic','Typography','Title','Paragraph','Text','Divider','List','ListItem','Tree','TreeNode',
  'Cascader','Transfer','TreeSelect','AutoComplete','InputNumber','Rate','Switch','Upload','Carousel','Collapse','Anchor','Affix','BackTop',
  'ConfigProvider','Space','Flex','Grid',
]);

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

function analyzeFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const result = { file: filepath, currentImports: [], jsxUsages: [], referencedNames: new Set(), missing: [] };

  // Extract lucide-react import block(s)
  const importRe = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]\s*;?/g;
  let m;
  while ((m = importRe.exec(content)) !== null) {
    const inside = m[1];
    inside.split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
      // Handle "X as Y"
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

  // Find JSX usages: <TagName ...>
  // Use a simple regex: <([A-Z][A-Za-z0-9_]*)
  // Exclude HTML tags, current imports, and look up in lucide exports
  // First pass: get all <Xxxx> tokens
  const jsxTagRe = /<([A-Z][A-Za-z0-9_]*(?:\.[A-Z][A-Za-z0-9_]*)?)\b/g;
  const seen = new Set();
  let j;
  while ((j = jsxTagRe.exec(content)) !== null) {
    let name = j[1];
    // Handle member expressions like Foo.Bar - skip
    if (name.includes('.')) continue;
    if (HTML_TAGS.has(name)) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    result.jsxUsages.push(name);
  }

  // Also find PascalCase uses as React component <Xxxx ...> at runtime
  // Also capture function-component-style: e.g. {Icon && <Icon />}, {Icon ? <Icon/> : null}
  // We look for .Create pattern: <Xxx.Icon />, <Xxx.Other/>
  // Already handled by member expression skip above.

  // For non-JSX explicit identifier uses (e.g. IconRender), we skip these for safety
  // because they could be local components/aliases.

  // Determine what's likely a lucide icon:
  // - Has a JSX usage <Name>
  // - Name is in the lucide-react exports list OR looks like an icon (PascalCase, length >= 3)
  // - Not already imported
  const localNames = new Set(result.currentImports.map(i => i.local));
  const originalNames = new Set(result.currentImports.map(i => i.original));

  for (const name of result.jsxUsages) {
    result.referencedNames.add(name);
    if (LUCIDE_EXPORTS.has(name)) {
      // Missing if neither original nor local alias matches
      const isImported = originalNames.has(name) || localNames.has(name);
      if (!isImported) {
        result.missing.push(name);
      }
    }
  }

  return result;
}

function fixFile(info) {
  if (info.missing.length === 0) return false;
  const content = fs.readFileSync(info.file, 'utf-8');

  // Find the lucide-react import block
  const importRe = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]\s*;?/;
  const m = content.match(importRe);
  if (!m) {
    // No existing import - skip (user said don't add new things, only fix)
    console.log(`  ! ${path.relative(SRC_DIR, info.file)}: missing icons but no lucide-react import`);
    return false;
  }

  // Build new import list: existing + missing icons (alphabetical)
  const existingText = m[1];
  // Get the existing part list (already split)
  const existingParts = existingText.split(',').map(s => s.trim()).filter(Boolean);
  // Now check if any missing is already aliased inside the existing list (e.g. "BarChart as ChartBar")
  // If an icon is aliased, the local alias is in use, not the missing name.
  const stillMissing = info.missing.filter(name => {
    // Check if it's used directly (not as alias). The alias form is e.g. "BarChart as ChartBar".
    // In our JSX, we use <ChartBar /> or <BarChart />.
    // We look up by `name` in originalNames set: it's already an "original" name.
    // So if name is in originalNames, it's already imported.
    return !info.currentImports.some(ci => ci.original === name || ci.local === name);
  });

  if (stillMissing.length === 0) return false;

  // Preserve original import formatting: get existing "as-is" parts and append
  const newParts = [...existingParts];
  // Sort missing icons alphabetically
  stillMissing.sort();
  for (const icon of stillMissing) {
    newParts.push(icon);
  }

  // Detect indentation from existing line
  const lineStart = content.lastIndexOf('\n', m.index) + 1;
  const leadingWS = m[0].match(/^\s*/)[0];

  // Reconstruct import: multi-line if existing is multi-line
  const newImport = `${leadingWS}import {\n${newParts.map(p => '  ' + p).join(',\n')}\n${leadingWS}} from 'lucide-react'`;

  const newContent = content.slice(0, lineStart) + newImport + content.slice(lineStart + m[0].length);
  fs.writeFileSync(info.file, newContent, 'utf-8');
  return true;
}

// === MAIN ===
const files = [
  ...walk(path.join(SRC_DIR, 'pages')),
  ...walk(path.join(SRC_DIR, 'components')),
];

console.log(`\nScanning ${files.length} files...`);
const summary = [];
for (const f of files) {
  const info = analyzeFile(f);
  if (info.missing.length > 0) {
    summary.push(info);
  }
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