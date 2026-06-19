import fs from 'fs';

const file = 'src/data/reportWritingMock.ts';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find ALL module-level const vars with their line numbers
const constNames = {};
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Skip if inside export default or a function
  if (line.trim().startsWith('import') || line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
  
  // Match export const NAME or const NAME
  const m = line.match(/^\s*(?:export\s+)?const\s+(\w+)\s*=\s*/);
  if (m) constNames[m[1]] = i + 1;
}

// For each line, check which const vars it references (excluding its own declaration)
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('import')) continue;
  
  for (const [name, lineNo] of Object.entries(constNames)) {
    if (lineNo <= i + 1) continue; // defined after this line
    
    // Check exact word boundary match (not substring match like BODY_PARTS in BODY_PARTS_MOCK)
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedName}\\b`);
    if (regex.test(line)) {
      // Make sure it's not its own declaration
      const ownDecl = new RegExp(`const\\s+${escapedName}\\s*=\\s*`);
      if (!ownDecl.test(line)) {
        console.log(`Line ${i+1}: references "${name}" (line ${lineNo}): ${line.substring(0, 100).trim()}`);
      }
    }
  }
}
console.log('Done');
