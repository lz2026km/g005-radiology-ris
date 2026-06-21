/** 批量修复 Missing Imports: Empty(antd) + X(Bold/AlertCircle/MessageSquare)(lucide) */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
const root = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src';

// Icons that are always safe to add (super common)
const COMMON_LUCIDE = ['AlertCircle','Bold','X','MessageSquare','Send','Bell','ArrowRight','Search','Calendar','ChevronRight','Flag','Image','BarChart3','PieChart','Clock','Check','Edit','Plus','Trash2','Download','Upload','Airplay','AlignCenter','AlignJustify','AlignLeft','AlignRight','Bold','Italic','Underline','List','Minus','Move','Printer','Save','Settings','Sun','Tab','Type','Underline','Upload','ZoomIn'];

function addToLucideImport(content, icons) {
  const lines = content.split('\n');
  let idx = lines.findIndex(l => l.includes('lucide-react'));
  if (idx === -1) return null;
  // Go back to find import start  
  let start = idx;
  while (start > 0 && !lines[start].includes('import')) start--;
  const end = idx;
  // Get current icons in import
  const importBlock = lines.slice(start, end + 1).join('\n');
  const braceMatch = importBlock.match(/\{([\s\S]*?)\}/);
  if (!braceMatch) return null;
  const cur = braceMatch[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/g, '').replace(/\s+/g, '')).filter(Boolean);
  const missing = icons.filter(i => !cur.includes(i));
  if (missing.length === 0) return null;
  const all = [...cur, ...missing].sort((a, b) => a.localeCompare(b));
  const itemsPerLine = 8;
  const grouped = [];
  for (let i = 0; i < all.length; i += itemsPerLine) grouped.push(all.slice(i, i + itemsPerLine).join(', '));
  const newImport = `import {\n  ${grouped.join(',\n  ')},\n} from "lucide-react";`;
  const newLines = [...lines.slice(0, start), newImport, ...lines.slice(end + 1)];
  return newLines.join('\n');
}

/** Add Empty to antd import */
function addToAntdImport(content) {
  const lines = content.split('\n');
  let idx = lines.findIndex(l => l.includes("from 'antd'") || l.includes('from "antd"'));
  if (idx === -1) idx = lines.findIndex(l => l.includes('antd/es') || l.includes('antd/lib'));
  if (idx === -1) return null;
  // Find import start
  let start = idx;
  while (start > 0 && !lines[start].includes('import')) start--;
  const importBlock = lines.slice(start, idx + 1).join('\n');
  const braceMatch = importBlock.match(/\{([\s\S]*?)\}/);
  if (!braceMatch) return null;
  const cur = braceMatch[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/g, '').replace(/\s+/g, '')).filter(Boolean);
  if (cur.includes('Empty')) return null;
  const all = [...cur, 'Empty'].sort((a, b) => a.localeCompare(b));
  const itemsPerLine = 6;
  const grouped = [];
  for (let i = 0; i < all.length; i += itemsPerLine) grouped.push(all.slice(i, i + itemsPerLine).join(', '));
  const newImport = `import {\n  ${grouped.join(',\n  ')},\n} from "antd";`;
  const newLines = [...lines.slice(0, start), newImport, ...lines.slice(idx + 1)];
  return newLines.join('\n');
}

function walk(dir) {
  let lucideFixed = 0, antdFixed = 0;
  const files = [];
  try {
    for (const e of readdirSync(dir)) {
      const fp = join(dir, e);
      try {
        if (statSync(fp).isDirectory() && !e.startsWith('.') && !['node_modules','__tests__','dist','locales','stubs','stories','coverage','.git'].includes(e)) {
          walk(fp);
        } else if (extname(fp) === '.tsx') {
          let content = readFileSync(fp, 'utf-8');
          let changed = false;
          let missingIcons = [];
          // Check for Common Lucide Icons used but not imported
          if (content.includes('lucide-react')) {
            for (const icon of COMMON_LUCIDE) {
              const re = new RegExp(`[\\s(]${icon}[\\s/>]`);
              if (re.test(content) || content.includes(`<${icon} `) || content.includes(`: ${icon}\n`)) {
                missingIcons.push(icon);
              }
            }
            if (missingIcons.length > 0) {
              const r = addToLucideImport(content, missingIcons);
              if (r) { content = r; changed = true; lucideFixed++; }
            }
          }
          // Check for Empty as antd component
          if (content.includes('Empty') && !content.includes('Empty as') && !content.includes('Empty=') && !content.includes('Empty,')) {
            const r2 = addToAntdImport(content);
            if (r2) { content = r2; changed = true; antdFixed++; }
          }
          if (changed) {
            writeFileSync(fp, content, 'utf-8');
            files.push(fp.replace(root, ''));
          }
        }
      } catch (e2) { /* skip */ }
    }
  } catch (e) { }
  return { lucideFixed, antdFixed, files };
}

console.log('Fix: Adding missing Empty(antd) + common lucide icons...');
const r = walk(root);
console.log(`\nResult: ${r.files.length} files fixed`);
console.log(`  Lucide icons added to: ${r.lucideFixed} files`);
console.log(`  Antd Empty added to: ${r.antdFixed} files`);
r.files.forEach(f => console.log(`  ${f}`));
