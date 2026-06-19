import fs from 'fs';
import path from 'path';

const aliases = {
  '@data': 'src/data',
  '@services': 'src/services',
  '@components': 'src/components',
  '@pages': 'src/pages',
  '@hooks': 'src/hooks',
  '@utils': 'src/utils',
  '@types': 'src/types',
  '@i18n': 'src/i18n',
};

const targets = [
  'src/pages/ReportWritePage.tsx',
  'src/components/report/v3/R3.WRITING/AIDraftPanel.tsx',
  'src/components/report/v3/R3.WRITING/ImageAnchor.tsx',
  'src/components/report/v3/R3.WRITING/VoiceDictation.tsx',
  'src/components/report/v3/R3.WRITING/ReportRichEditor.tsx',
  'src/components/report/v3/R3.WRITING/StructuredFieldForm.tsx',
];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check alias imports
    const match = line.match(/from\s+['"](@[\w-]+)\/([^'"]+)['"]/);
    if (!match) continue;

    const alias = match[1];
    const rest = match[2];
    const basePath = aliases[alias];
    if (!basePath) continue;

    const resolved = path.join(basePath, rest);
    const candidates = [resolved, resolved + '.tsx', resolved + '.ts', path.join(resolved, 'index.tsx'), path.join(resolved, 'index.ts')];
    const found = candidates.find(c => fs.existsSync(c));

    if (!found) {
      console.log(`${file}:${i+1} MISSING @${alias}/${rest}`);
    }
  }
}
console.log('Done.');