/** Find all files missing specific icon imports */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const root = 'E:\\opencode work\\FS\\G005-RISv-3.0.0\\src';

function findMissing(icon) {
  const files = [];
  function walk(dir) {
    for (const e of readdirSync(dir)) {
      const fp = join(dir, e);
      try {
        const st = statSync(fp);
        if (st.isDirectory() && !['node_modules', 'dist', 'locales', 'stubs', '__tests__', 'coverage', '.git'].includes(e))
          walk(fp);
        else if (extname(fp) === '.tsx') {
          const c = readFileSync(fp, 'utf-8');
          // Check if icon is referenced in JSX or props
          const ref1 = c.includes('<' + icon + ' ');
          const ref2 = c.includes('<' + icon + '>');
          const ref3 = c.includes(': ' + icon + ',');
          const ref4 = c.includes(': ' + icon + '}');
          const ref5 = c.includes('={ ' + icon + ' }') || c.includes('={' + icon + '}');
          if (ref1 || ref2 || ref3 || ref4 || ref5) {
            const hasLucideImport = c.includes('lucide-react') && new RegExp('\\b' + icon + '\\b').test(c.split('lucide-react')[0]);
            if (!hasLucideImport) {
              files.push(fp.replace(root, ''));
            }
          }
        }
      } catch (e2) {}
    }
  }
  walk(root);
  return files;
}

['Bold', 'Bell', 'Send', 'MessageSquare'].forEach(icon => {
  const f = findMissing(icon);
  console.log(icon + ':');
  if (f.length > 0) f.forEach(x => console.log('  ' + x));
  else console.log('  (none)');
});
