import fs from 'fs';
import path from 'path';

const dir = 'src/components/report/v3/R3.WRITING';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const fullPath = path.join(dir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Find relative imports
    const match = line.match(/from\s+['"](\.\.?\/[^'"]+)['"]/);
    if (!match) continue;

    const importPath = match[1];
    // Resolve relative path
    const resolved = path.resolve(path.dirname(fullPath), importPath);

    // Try .tsx, .ts extensions
    const candidates = [resolved, resolved + '.tsx', resolved + '.ts', path.join(resolved, 'index.tsx'), path.join(resolved, 'index.ts')];
    const found = candidates.some(c => fs.existsSync(c));

    if (!found) {
      console.log(`${file}:${i+1} MISSING ${importPath}`);
      console.log(`  -> ${resolved}`);
    }
  }
}
console.log('Done.');