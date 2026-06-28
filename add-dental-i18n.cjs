const fs = require('fs');
const p = 'src/i18n/appI18n.ts';
let c = fs.readFileSync(p, 'utf8');
// Add Chinese nav items after "nav.eyeKpi"
const cnItems = `
    "nav.dentalSpecialty": "\u7259\u79d1\u4e13\u79d1",
    "nav.dentalWorkspace": "\u7259\u79d1\u5de5\u4f5c\u53f0",
    "nav.dentalPacs": "\u53e3\u8154\u5f71\u50cf (PACS)",
    "nav.dentalChart": "\u7259\u4f4d\u56fe",
    "nav.dentalAi": "AI \u8bca\u65ad",
    "nav.dentalTreatment": "\u6cbb\u7597\u7ba1\u7406",
    "nav.dentalImplant": "\u79cd\u690d\u89c4\u5212",
    "nav.dentalOrtho": "\u6b63\u7578",
    "nav.dentalTele": "\u8fdc\u7a0b\u53e3\u8155",
    "nav.dentalInventory": "\u6750\u6599\u5e93\u5b58",
    "nav.dentalDashboard": "\u7ecf\u8425\u4eea\u8868\u76d8",
`;
const enItems = `
    "nav.dentalSpecialty": "Dental",
    "nav.dentalWorkspace": "Workspace",
    "nav.dentalPacs": "Dental PACS",
    "nav.dentalChart": "Tooth Chart",
    "nav.dentalAi": "AI Diagnosis",
    "nav.dentalTreatment": "Treatment",
    "nav.dentalImplant": "Implant",
    "nav.dentalOrtho": "Orthodontic",
    "nav.dentalTele": "Tele-Dentistry",
    "nav.dentalInventory": "Inventory",
    "nav.dentalDashboard": "Dashboard",
`;

// Find the line after "nav.eyeKpi" in Chinese section
const cnIdx = c.indexOf('"nav.eyeKpi"'); // find first occurrence
const enIdx = c.indexOf('"nav.eyeKpi"', cnIdx + 50); // find second occurrence

if (cnIdx >= 0) {
  // Find end of line after nav.eyeKpi
  let cnLineEnd = c.indexOf('\n', cnIdx);
  c = c.slice(0, cnLineEnd + 1) + cnItems + c.slice(cnLineEnd + 1);
}

let enIdx2 = c.indexOf('"nav.eyeKpi"', cnIdx + 60);
if (enIdx2 >= 0) {
  let enLineEnd = c.indexOf('\n', enIdx2);
  c = c.slice(0, enLineEnd + 1) + enItems + c.slice(enLineEnd + 1);
}

fs.writeFileSync(p, c, 'utf8');
console.log('Dental nav i18n added');
