const fs = require('fs');
const c = fs.readFileSync('src/services/mockBackend/dentalHandlers.ts', 'utf8');
const fixed = c.replace(
  "import { applyQuery, list, get, create, update, remove } from './store';",
  "import { list, get, create, update, remove } from './store';\nimport { applyQuery } from './queryBuilder';"
);
if (c !== fixed) {
  fs.writeFileSync('src/services/mockBackend/dentalHandlers.ts', fixed, 'utf8');
  console.log('FIXED');
} else {
  console.log('NO CHANGE');
}
