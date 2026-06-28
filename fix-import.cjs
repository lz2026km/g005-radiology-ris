// Fix the randFloat import in dentalImagingMock.ts
const fs = require('fs');
const path = 'src/data/dental/dentalImagingMock.ts';
let c = fs.readFileSync(path, 'utf8');
const oldImport = "import { randInt, pick, randFloat, seedRandom } from '../_generators';";
const newImport = "import { randInt, pick, seedRandom } from '../_generators';\n\nfunction randFloat(min, max, decimals) {\n  if (decimals === undefined) decimals = 2;\n  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));\n}";
if (c.includes(oldImport)) {
  c = c.replace(oldImport, newImport);
  fs.writeFileSync(path, c, 'utf8');
  console.log('Fixed import in', path);
} else {
  console.log('Pattern not found');
}
