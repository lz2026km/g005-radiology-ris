/** 批量修復: antd + lucide-react 缺失 import */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
const root = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src';

/** 在文件的 lucide-react import 中添加缺失图标 */
function addLucideIcons(content, requiredIcons) {
  const lines = content.split('\n');
  let idx = lines.findIndex(l => l.includes('lucide-react'));
  if (idx === -1) return null;
  let start = idx;
  while (start > 0 && !lines[start].includes('import')) start--;
  if (start === idx) return null;
  const importBlock = lines.slice(start, idx + 1).join('\n');
  const bm = importBlock.match(/\{([\s\S]*?)\}/);
  if (!bm) return null;
  const cur = bm[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/g, '').replace(/\s+/g, '')).filter(Boolean);
  const needed = requiredIcons.filter(i => !cur.includes(i));
  if (needed.length === 0) return null;
  const all = [...cur, ...needed];
  const unique = [...new Set(all)].sort((a, b) => a.localeCompare(b));
  const perLine = 8;
  const g = [];
  for (let i = 0; i < unique.length; i += perLine) g.push(unique.slice(i, i + perLine).join(', '));
  const newImport = `import {\n  ${g.join(',\n  ')},\n} from "lucide-react";`;
  const nl = [...lines.slice(0, start), newImport, ...lines.slice(idx + 1)];
  return nl.join('\n');
}

/** 在文件的 antd import 中添加 Empty */
function addAntdEmpty(content) {
  const lines = content.split('\n');
  let idx = lines.findIndex(l => l.includes("from 'antd'") || l.includes('from "antd"'));
  if (idx === -1) return null;
  let start = idx;
  while (start > 0 && !lines[start].includes('import')) start--;
  if (start === idx || start < 0) return null;
  const importBlock = lines.slice(start, idx + 1).join('\n');
  const bm = importBlock.match(/\{([\s\S]*?)\}/);
  if (!bm) return null;
  const cur = bm[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/g, '').replace(/\s+/g, '')).filter(Boolean);
  if (cur.includes('Empty')) return null;
  const all = [...cur, 'Empty'].sort((a, b) => a.localeCompare(b));
  const perLine = 6;
  const g = [];
  for (let i = 0; i < all.length; i += perLine) g.push(all.slice(i, i + perLine).join(', '));
  const newImport = `import {\n  ${g.join(',\n  ')},\n} from "antd";`;
  const nl = [...lines.slice(0, start), newImport, ...lines.slice(idx + 1)];
  return nl.join('\n');
}

function walk(dir, lucideIcons) {
  let l = 0, e = 0, files = [];
  try {
    for (const entry of readdirSync(dir)) {
      const fp = join(dir, entry);
      const st = statSync(fp);
      if (st.isDirectory() && !entry.startsWith('.') && !['node_modules','__tests__','dist','locales','stubs','stories','coverage','.git'].includes(entry)) {
        const sub = walk(fp, lucideIcons);
        l += sub.l; e += sub.e; files = files.concat(sub.files);
      } else if (extname(fp) === '.tsx') {
        let content = readFileSync(fp, 'utf-8');
        let changed = false;
        // Check lucide icons
        if (content.includes('lucide-react')) {
          // Find icons that are definitely used in JSX
          const used = lucideIcons.filter(icon => {
            const re = new RegExp(`[\\s(=]${icon}[\\s>/)]`);
            return re.test(content) && !content.includes(`typeof ${icon}`);
          });
          const r = addLucideIcons(content, used);
          if (r) { content = r; changed = true; l++; }
        }
        // Check antd Empty
        if (content.includes('<Empty') && !content.includes('Empty=')) {
          const r2 = addAntdEmpty(content);
          if (r2) { content = r2; changed = true; e++; }
        }
        if (changed) {
          writeFileSync(fp, content, 'utf-8');
          files.push(fp.replace(root, ''));
        }
      }
    }
  } catch (e) { }
  return { l, e, files };
}

const lucideIcons = ['AlertCircle','Bold','X','MessageSquare','Send','Bell'];
console.log('Fixing imports across all files...');
const r = walk(root, lucideIcons);
console.log(`\nResult: ${r.files.length} files modified`);
console.log(`  Lucide icons: ${r.l} files`);
console.log(`  Antd Empty: ${r.e} files`);
r.files.forEach(f => console.log(`  ${f}`));
