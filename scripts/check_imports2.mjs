import fs from 'fs';
import path from 'path';

const targets = [
  'src/pages/ReportWritePage.tsx',
  'src/components/report/v3/R3.WRITING/AIDraftPanel.tsx',
  'src/components/report/v3/R3.WRITING/ImageAnchor.tsx',
  'src/components/report/v3/R3.WRITING/VoiceDictation.tsx',
  'src/components/report/v3/R3.WRITING/ReportRichEditor.tsx',
  'src/components/report/v3/R3.WRITING/StructuredFieldForm.tsx',
  'src/data/reportWritingMock.ts',
  'src/services/writing/writingService.ts',
  'src/types/R3/R3.WRITING.ts',
];

const visited = new Set();
const toVisit = [...targets];

while (toVisit.length > 0) {
  const file = toVisit.shift();
  if (visited.has(file)) continue;
  visited.add(file);

  if (!fs.existsSync(file)) {
    console.log(`MISSING FILE: ${file}`);
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/from\s+['"](\.\.?\/[^'"]+)['"]/);
    if (!match) continue;

    const importPath = match[1];
    const resolved = path.resolve(path.dirname(file), importPath);
    const candidates = [resolved, resolved + '.tsx', resolved + '.ts', path.join(resolved, 'index.tsx'), path.join(resolved, 'index.ts')];
    const found = candidates.find(c => fs.existsSync(c));

    if (found) {
      const rel = path.relative('.', found).replace(/\\/g, '/');
      if (!visited.has(rel)) toVisit.push(rel);
    } else {
      console.log(`${file}:${i+1} MISSING ${importPath}`);
    }
  }
}
console.log(`Checked ${visited.size} files.`);