// v3.0.6.8-42 升级
const fs = require('fs');
const files = [
  'E:/opencode work/FS/G005-RISv-3.0.0/src/main.tsx',
  'E:/opencode work/FS/G005-RISv-3.0.0/index.html',
  'E:/opencode work/FS/G005-RISv-3.0.0/package.json',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/3\.0\.6\.8-41/g, '3.0.6.8-42');
  c = c.replace(/3\.0\.6\.8-32/g, '3.0.6.8-42');
  fs.writeFileSync(f, c, 'utf8');
}
const i18n = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let i = fs.readFileSync(i18n, 'utf8');
i = i.replace(/3\.0\.6\.8-41/g, '3.0.6.8-42');
i = i.replace(/3\.0\.6\.8-32/g, '3.0.6.8-42');
i = i.replace(
  'v3.0.6.8-42 · 眼科 PR8: 远程眼科 (WebRTC + 5G 边缘 + 视光中心 OK 镜) — 对标 Topcon Harmony/Biotronics3D',
  'v3.0.6.8-42 · 眼科 PR9: 教学病例库 (DICOM 标注 + SR 导出 + 科研脱敏) — 对标 Heidelberg 病例库'
);
i = i.replace(
  'v3.0.6.8-42 · Eye PR8: Tele-ophthalmology (WebRTC + 5G edge + Optometry OK lens) — Topcon Harmony/Biotronics3D benchmark',
  'v3.0.6.8-42 · Eye PR9: Case Library (DICOM annotation + SR export + research de-id) — Heidelberg library benchmark'
);
fs.writeFileSync(i18n, i, 'utf8');
console.log('Done v42');
