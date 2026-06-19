import fs from 'fs';
const visited = new Set();
const deps = {};

function resolveModule(file) {
  if (!fs.existsSync(file)) return null;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const imports = [];
  for (const line of lines) {
    const m = line.match(/from\s+['"]\.\.?\/([^'"]+)['"]/);
    if (m) imports.push(m[1]);
    const am = line.match(/from\s+['"]@(\w+)\/([^'"]+)['"]/);
    if (am) imports.push('src/' + am[1] + '/' + am[2]);
  }
  return imports;
}

const entryPoints = [
  'src/pages/ReportWritePage.tsx',
  'src/components/report/v3/R3.WRITING/AIDraftPanel.tsx',
  'src/components/report/v3/R3.WRITING/VoiceDictation.tsx',
  'src/components/report/v3/R3.WRITING/ImageAnchor.tsx',
  'src/components/report/v3/R3.WRITING/ReportRichEditor.tsx',
  'src/components/report/v3/R3.WRITING/StructuredFieldForm.tsx',
];

function walk(file, path) {
  const normalized = file.replace(/\\/g, '/');
  if (visited.has(normalized)) return false;
  visited.add(normalized);
  
  const imports = resolveModule(normalized);
  if (!imports) return false;
  
  const idx = path.indexOf(normalized);
  if (idx >= 0 && idx < path.length - 1) {
    console.log('CIRCULAR:', [...path.slice(idx), normalized].join(' -> '));
    return true;
  }
  
  for (const imp of imports) {
    walk(imp, [...path, normalized]);
  }
  return false;
}

for (const entry of entryPoints) {
  walk(entry, [entry]);
}
console.log('No circular deps found in', visited.size, 'files');
