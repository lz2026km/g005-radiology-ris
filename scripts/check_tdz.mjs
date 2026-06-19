import fs from 'fs';

const files = [
  'src/data/reportWritingMock.ts',
  'src/services/writing/writingService.ts',
  'src/components/report/v3/R3.WRITING/AIDraftPanel.tsx',
  'src/components/report/v3/R3.WRITING/VoiceDictation.tsx',
  'src/components/report/v3/R3.WRITING/ImageAnchor.tsx',
  'src/components/report/v3/R3.WRITING/ReportRichEditor.tsx',
  'src/components/report/v3/R3.WRITING/StructuredFieldForm.tsx',
  'src/pages/ReportWritePage.tsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  const topLevelVars = {};
  let inFunction = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    inFunction += (line.match(/{/g) || []).length;
    inFunction -= (line.match(/}/g) || []).length;
    if (inFunction < 0) inFunction = 0;
    
    const m = line.match(/^\s*(?:export\s+)?const\s+(\w+)\s*=(?!=)/);
    if (m && inFunction === 0) {
      topLevelVars[m[1]] = i + 1;
    }
  }
  
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (i < 5) continue;
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import')) continue;
    
    for (const [varName, varLine] of Object.entries(topLevelVars)) {
      if (varLine <= i + 1) continue;
      // Check if line references varName
      if (line.includes(varName)) {
        const declM = line.match(new RegExp(`const\\s+${varName}\\s*=`));
        if (!declM && !line.match(new RegExp(`typeof\\s+${varName}`))) {
          console.log(`${file}:${i+1}: Uses "${varName}" defined later at line ${varLine}: ${line.substring(0, 80).trim()}`);
          found = true;
        }
      }
    }
  }
  if (!found) console.log(`${file}: OK`);
}
console.log('Done');
