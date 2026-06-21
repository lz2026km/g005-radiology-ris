/** Fix remaining import errors in pages */
import { readFileSync, writeFileSync } from 'fs';

const fixes = {
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\ReviewCenterPage.tsx': ['Send', 'Smartphone', 'Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\QualityControlPage.tsx': ['Send', 'Smartphone', 'Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\ReportDeliveryPage.tsx': ['X', 'Italic', 'Smartphone'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\DicomViewerPage.tsx': ['Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\ExamPage.tsx': ['Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\SchedulePage.tsx': ['Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\QueueCallPage.tsx': ['Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\StatisticsPage.tsx': ['Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\OperationLogPage.tsx': ['Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\TermLibraryPage.tsx': ['Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\NotificationCenter.tsx': ['Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\ClinicalDataPage.tsx': ['Italic'],
  'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src\\pages\\CriticalValuePage.tsx': ['Italic'],
};

let n = 0;
for (const [fp, add] of Object.entries(fixes)) {
  const c = readFileSync(fp, 'utf-8');
  const lines = c.split('\n');
  const idx = lines.findIndex(l => l.includes('lucide-react'));
  if (idx === -1) { console.error('SKIP ' + fp); continue; }
  let s = idx;
  while (s > 0 && !lines[s].includes('import')) s--;
  const block = lines.slice(s, idx + 1).join('\n');
  const m = block.match(/\{([\s\S]*?)\}/);
  if (!m) { console.error('NO BRACE ' + fp); continue; }
  const cur = m[1].split(',').map(x => x.trim().replace(/\s+as\s+\w+/g, '').trim()).filter(Boolean);
  const needed = add.filter(i => !cur.includes(i));
  if (needed.length === 0) { console.log('OK ' + fp); continue; }
  const all = [...cur, ...needed].sort((a, b) => a.localeCompare(b));
  const g = [];
  for (let i = 0; i < all.length; i += 8) g.push(all.slice(i, i + 8).join(', '));
  const newImport = 'import {\n  ' + g.join(',\n  ') + ',\n} from "lucide-react";';
  const newLines = [...lines.slice(0, s), newImport, ...lines.slice(idx + 1)];
  writeFileSync(fp, newLines.join('\n'), 'utf-8');
  console.log('FIXED ' + fp.replace(/.*src\\/,'') + ': +' + needed.join(','));
  n++;
}
console.log('\nFixed ' + n + ' files');
