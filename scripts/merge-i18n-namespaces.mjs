import fs from 'fs';
import path from 'path';

const LOCALES = ['zh-CN', 'en-US'];
const FLAT = { 'zh-CN': 'zh_CN.json', 'en-US': 'en_US.json' };
const NS_FILES = ['v3ge', 'v3siemens', 'v3philips', 'v3canon', 'v3061ai', 'v3061perf', 'v3061security', 'v3061workflow'];

const base = 'src/i18n/locales';
let totalMerged = 0;

for (const locale of LOCALES) {
  const flatPath = path.join(base, FLAT[locale]);
  const nsDir = path.join(base, locale);
  const flat = JSON.parse(fs.readFileSync(flatPath, 'utf8'));

  for (const ns of NS_FILES) {
    const nsPath = path.join(nsDir, `${ns}.json`);
    if (!fs.existsSync(nsPath)) {
      console.log(`SKIP: ${nsPath} not found`);
      continue;
    }
    const nsData = JSON.parse(fs.readFileSync(nsPath, 'utf8'));
    // Prefix keys with ns. if not already
    const merged = {};
    for (const [k, v] of Object.entries(nsData)) {
      const finalKey = k.startsWith(`${ns}.`) ? k : `${ns}.${k}`;
      merged[finalKey] = v;
    }
    // Replace the namespace in flat JSON
    flat[ns] = merged;
    totalMerged++;
    console.log(`MERGED: ${ns} (${Object.keys(merged).length} keys) -> ${FLAT[locale]}`);
  }
  fs.writeFileSync(flatPath, JSON.stringify(flat, null, 2));
  console.log(`WROTE: ${flatPath}`);
}
console.log(`\nDone. Total namespaces merged: ${totalMerged}`);