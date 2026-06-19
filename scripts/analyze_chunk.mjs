import fs from 'fs';

const code = fs.readFileSync('dist/assets/ReportWritePage-BjeNoQJS.js', 'utf8');

// Find dependencies
const depMatches = code.match(/"assets\/[a-zA-Z0-9_-]+\.js"/g);
if (depMatches) {
  const deps = [...new Set(depMatches)];
  console.log('Dependencies:', deps.length);
  deps.forEach(d => console.log('  -', d));
}

// Find imports
const importMatches = code.match(/import\.[a-z]+\(["'][^"']+["']\)/g);
if (importMatches) {
  console.log('\nImports:', importMatches.length);
  [...new Set(importMatches)].slice(0, 20).forEach(i => console.log('  -', i));
}

// Find suspicious patterns
const errors = code.match(/TypeError|cannot read prop|undefined|null is not|is not a function/g);
if (errors) {
  console.log('\nSuspicious patterns:', errors.length);
}

// Look for function calls with object syntax
const componentCalls = code.match(/"[A-Z][a-zA-Z0-9]+"/g);
if (componentCalls) {
  console.log('\nComponent references:', [...new Set(componentCalls)].length);
}