/** Fix all missing icon imports - targeted approach */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const root = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src';

function addToLucide(filepath, missing) {
  const content = readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  let idx = lines.findIndex(l => l.includes('lucide-react'));
  if (idx === -1) return false;
  // Find start of import block
  let start = idx;
  while (start > 0 && !lines[start].includes('import')) start--;
  const importBlock = lines.slice(start, idx + 1).join('\n');
  const bm = importBlock.match(/\{([\s\S]*?)\}/);
  if (!bm) return false;
  const cur = bm[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/g, '').replace(/\s+/g, '')).filter(Boolean);
  const needed = missing.filter(i => !cur.includes(i));
  if (needed.length === 0) return false;
  const all = [...cur, ...needed].sort((a, b) => a.localeCompare(b));
  const perLine = 8;
  const g = [];
  for (let i = 0; i < all.length; i += perLine) g.push(all.slice(i, i + perLine).join(', '));
  const newImport = `import {\n  ${g.join(',\n  ')},\n} from "lucide-react";`;
  const newLines = [...lines.slice(0, start), newImport, ...lines.slice(idx + 1)];
  writeFileSync(filepath, newLines.join('\n'), 'utf-8');
  return true;
}

function addAntdEmpty(filepath) {
  const content = readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  let idx = lines.findIndex(l => l.includes("from 'antd'") || l.includes('from "antd"'));
  if (idx === -1) return false;
  let start = idx;
  while (start > 0 && !lines[start].includes('import')) start--;
  const importBlock = lines.slice(start, idx + 1).join('\n');
  const bm = importBlock.match(/\{([\s\S]*?)\}/);
  if (!bm) return false;
  const cur = bm[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+/g, '').replace(/\s+/g, '')).filter(Boolean);
  if (cur.includes('Empty')) return false;
  const all = [...cur, 'Empty'].sort((a, b) => a.localeCompare(b));
  const perLine = 6;
  const g = [];
  for (let i = 0; i < all.length; i += perLine) g.push(all.slice(i, i + perLine).join(', '));
  const newImport = `import {\n  ${g.join(',\n  ')},\n} from "antd";`;
  const newLines = [...lines.slice(0, start), newImport, ...lines.slice(idx + 1)];
  writeFileSync(filepath, newLines.join('\n'), 'utf-8');
  return true;
}

// 1. Fix Bold - CommandPalette.tsx
console.log('1. Bold -> CommandPalette.tsx');
addToLucide(root + '/components/feedback/CommandPalette.tsx', ['Bold']);

// 2. Bell
addToLucide(root + '/components/report/v3/R3.DIST/MultiChannelSender.tsx', ['Bell']);
console.log('2. Bell -> MultiChannelSender');
addToLucide(root + '/components/report/v3/R3.QUALITY/CriticalValueAlerter.tsx', ['Bell']);
console.log('   Bell -> CriticalValueAlerter');
addToLucide(root + '/pages/ReportDeliveryPage.tsx', ['Bell']);
console.log('   Bell -> ReportDeliveryPage');

// 3. Send
addToLucide(root + '/components/report/v3/R3.DIST/DeliveryReceipt.tsx', ['Send']);
console.log('3. Send -> DeliveryReceipt');
addToLucide(root + '/components/report/v3/R3.QUALITY/CriticalValueEscalation.tsx', ['Send']);
console.log('   Send -> CriticalValueEscalation');
// ReportDeliveryPage already has Send in import (checked earlier)

// 4. MessageSquare
addToLucide(root + '/components/report/v3/R3.DIST/MultiChannelSender.tsx', ['MessageSquare']);
console.log('4. MessageSquare -> MultiChannelSender');
addToLucide(root + '/components/report/v3/R3.QUALITY/CriticalValueAlerter.tsx', ['MessageSquare']);
console.log('   MessageSquare -> CriticalValueAlerter');
addToLucide(root + '/components/report/v3/R3.QUALITY/CriticalValueEscalation.tsx', ['MessageSquare']);
console.log('   MessageSquare -> CriticalValueEscalation');
// ReportDeliveryPage already has MessageSquare in import

// 5. Empty (antd) - need to find files that use <Empty
console.log('\n5. Finding Empty (antd) usages...');
function findEmptyMissing() {
  const files = [];
  function walk(dir) {
    for (const e of readdirSync(dir)) {
      const fp = join(dir, e);
      try {
        const st = statSync(fp);
        if (st.isDirectory() && !['node_modules','dist','locales','stubs','__tests__','coverage','.git'].includes(e)) walk(fp);
        else if (extname(fp) === '.tsx') {
          const c = readFileSync(fp, 'utf-8');
          if ((c.includes('<Empty ') || c.includes('<Empty>') || c.includes('<Empty/>')) && c.includes('antd') && !c.includes('Empty,')) {
            // Check if Empty is in antd import
            const antdIdx = c.indexOf("from 'antd'");
            const antdIdx2 = c.indexOf('from "antd"');
            const pos = antdIdx > -1 ? antdIdx : antdIdx2;
            if (pos > -1) {
              const beforeAntd = c.substring(0, pos);
              const afterImport = c.substring(c.lastIndexOf('import', pos));
              // Check if 'Empty' appears in the import block
              const importBlock = afterImport.substring(0, afterImport.indexOf('antd') + 6);
              if (!importBlock.includes('Empty')) {
                files.push(fp.replace(root, ''));
              }
            }
          }
        }
      } catch(e2) {}
    }
  }
  walk(root);
  return files;
}
const emptyFiles = findEmptyMissing();
if (emptyFiles.length > 0) {
  emptyFiles.forEach(f => {
    console.log('  Empty -> ' + f);
    addAntdEmpty(root + f);
  });
} else {
  console.log('  (none missing)');
}

console.log('\nAll fixes applied!');
