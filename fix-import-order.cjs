const fs = require('fs');
const p = 'src/services/mockBackend/dentalHandlers.ts';
let c = fs.readFileSync(p, 'utf8');
// Remove the mid-file import line
c = c.replace(
  "// ============= Day 2: \u7259\u4f4d\u56fe + AI (20 \u7aef\u70b9) =============",
  "// ============= Day 2: \u7259\u4f4d\u56fe + AI (20 \u7aef\u70b9) ============="
);
// Actually just remove the line with the import and the comment
const marker = "// ============= Day 2";
const idx = c.indexOf(marker);
if (idx >= 0) {
  // Find the end of the import line after the marker
  let slice = c.slice(idx);
  const importEnd = slice.indexOf('\n', slice.indexOf('\n') + 1); // 2 lines
  const before = c.slice(0, idx);
  const after = c.slice(idx + importEnd + 1);
  c = before + after;
  
  // Now add the import at the top of the file
  const importLine = "import { getDentalChart } from '../../data/dental/dentalChartMock';\n";
  const insert = c.indexOf("import { MOCK_DENTAL_STUDIES");
  c = c.slice(0, insert) + importLine + c.slice(insert);
  
  fs.writeFileSync(p, c, 'utf8');
  console.log('Fixed');
} else {
  console.log('Marker not found');
}
