import fs from 'fs';
import path from 'path';

const PAGES_DIR = 'src/pages';
const CHINESE_RE = /[\u4e00-\u9fff\u3400-\u4dbf]/;

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else if (entry.name.endsWith('.tsx')) results.push(full);
  }
  return results;
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const hardcodedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
    if (trimmed.includes("t('") || trimmed.includes('t("')) continue;
    if (CHINESE_RE.test(line)) {
      hardcodedLines.push({ line: i + 1, text: trimmed.substring(0, 80) });
    }
  }
  return hardcodedLines;
}

const files = walk(PAGES_DIR);
let totalHardcoded = 0;
const results = [];

for (const file of files) {
  const hits = scanFile(file);
  if (hits.length > 0) {
    totalHardcoded += hits.length;
    results.push({ file, count: hits.length, samples: hits.slice(0, 5) });
  }
}

results.sort((a, b) => b.count - a.count);
console.log('=== i18n hardcoded Chinese scan ===');
console.log(`Files with hardcoded Chinese: ${results.length}`);
console.log(`Total hardcoded lines: ${totalHardcoded}`);

const high = results.filter(r => r.count >= 100).length;
const med = results.filter(r => r.count >= 50 && r.count < 100).length;
const low = results.filter(r => r.count < 50).length;
console.log(`\nSeverity: HIGH(>=100): ${high}  MED(50-99): ${med}  LOW(<50): ${low}`);

console.log('\nTop 20 files:');
results.slice(0, 20).forEach((r, i) => {
  console.log(`${i + 1}. [${r.count}] ${path.relative(process.cwd(), r.file)}`);
});

console.log('\nGroup by severity:');
if (high > 0) {
  console.log('\n--- HIGH (>=100 hardcoded lines) ---');
  results.filter(r => r.count >= 100).forEach(r => {
    console.log(`  [${r.count}] ${path.relative(process.cwd(), r.file)}`);
  });
}
if (med > 0) {
  console.log('\n--- MED (50-99 hardcoded lines) ---');
  results.filter(r => r.count >= 50 && r.count < 100).forEach(r => {
    console.log(`  [${r.count}] ${path.relative(process.cwd(), r.file)}`);
  });
}
if (low > 0) {
  console.log('\n--- LOW (<50 hardcoded lines) ---');
  results.filter(r => r.count < 50).forEach(r => {
    console.log(`  [${r.count}] ${path.relative(process.cwd(), r.file)}`);
  });
}

if (results.length > 0) {
  console.log('\n--- Sample lines ---');
  results.slice(0, 5).forEach(r => {
    console.log(`\n${path.relative(process.cwd(), r.file)} (${r.count} hardcoded):`);
    r.samples.forEach(s => console.log(`  L${s.line}: ${s.text}`));
  });
}
