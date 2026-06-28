const { execSync } = require('child_process');
const fs = require('fs');
const dir = 'E:/opencode work/FS/G005-RISv-3.0.0';

// Restore clean files from v67 (last clean commit)
['src/main.tsx','index.html','package.json','src/i18n/appI18n.ts','src/routes/routeTable.tsx'].forEach(f => {
  const content = execSync(`git show 211be5d:${f}`, { cwd: dir });
  fs.writeFileSync(dir + '/' + f, content);
});

// Apply current route additions
let route = fs.readFileSync(dir + '/src/routes/routeTable.tsx', 'utf8');
route = route.replace(
  'const PatientPortalPageV2 = lazy(() => import("../pages/patient/PatientPortalPage"));',
  'const PatientPortalPageV2 = lazy(() => import("../pages/patient/PatientPortalPage"));' +
  '\nconst CommandCenterPage = lazy(() => import("../pages/operations/CommandCenterPage"));' +
  '\nconst DicomSharePage = lazy(() => import("../pages/imaging/DicomSharePage"));' +
  '\nconst SchedulingCenterPage = lazy(() => import("../pages/operations/SchedulingCenterPage"));'
);
route = route.replace(
  '  "/patient-unified": ["医生", "主任", "技师", "管理员"], // [v3.0.6.8-66]',
  '  "/patient-unified": ["医生", "主任", "技师", "管理员"], // [v3.0.6.8-66]\n' +
  '  "/command-center": ["主任", "管理员"], // [v3.0.6.8-67]\n' +
  '  "/dicom-share": ["医生", "主任", "技师", "管理员", "护士"], // [v3.0.6.8-68]\n' +
  '  "/scheduling-center": ["主任", "管理员", "技师"], // [v3.0.6.8-69]'
);
route = route.replace(
  '  wrapped("/patient-unified", React.createElement(PatientPortalPageV2)), // [v3.0.6.8-66]',
  '  wrapped("/patient-unified", React.createElement(PatientPortalPageV2)), // [v3.0.6.8-66]\n' +
  '  wrapped("/command-center", React.createElement(CommandCenterPage)), // [v3.0.6.8-67]\n' +
  '  wrapped("/dicom-share", React.createElement(DicomSharePage)), // [v3.0.6.8-68]\n' +
  '  wrapped("/scheduling-center", React.createElement(SchedulingCenterPage)), // [v3.0.6.8-69]'
);
fs.writeFileSync(dir + '/src/routes/routeTable.tsx', route);

// Bump versions
['src/main.tsx','index.html','package.json','src/i18n/appI18n.ts'].forEach(f => {
  let c = fs.readFileSync(dir + '/' + f, 'utf8');
  c = c.replace(/3\.0\.6\.8-67/g, '3.0.6.8-69');
  fs.writeFileSync(dir + '/' + f, c);
});

console.log('Restored clean v67 base -> bumped to v69 with new routes');
