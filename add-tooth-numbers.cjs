const fs = require('fs');
const p = 'src/data/dental/dentalImagingMock.ts';
let c = fs.readFileSync(p, 'utf8');
// Add toothNumbers to interface
const idxID = c.indexOf("export interface DentalStudyDto");
const closeBrace = c.indexOf('}', idxID);
c = c.slice(0, closeBrace) + '\n  toothNumbers?: number[];' + c.slice(closeBrace);

// Add toothNumbers to the mocked data
const idxTags = c.indexOf("tags: modality === 'CBCT' ? ['CBCT', '\u4e09\u7ef4'] : modality === 'Scan' ? ['\u53e3\u626b', '3D'] : [],");
if (idxTags >= 0) {
  const insertStr = 'toothNumbers: Math.random() > 0.5 ? [pick([11,16,21,26,31,36,41,46,13,23,33,43,17,27,37,47])] : [],\n      ';
  c = c.slice(0, idxTags) + insertStr + c.slice(idxTags);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Added toothNumbers');
} else {
  console.log('Tags pattern not found');
}
