# Module 5: Cardiovascular Imaging — Services

## 5.1 Coronary CTA Analysis (35 pts)
- `coronaryCtaService.ts` — Coronary segmentation (LM/LAD/LCX/RCA), stenosis grading (mild/mod/severe), plaque characterization (calcified/non-calcified/mixed), CAD-RADS scoring, Agatston calcium scoring, vessel tracking, curved MPR reformatting, coronary dominance classification, myocardial bridging detection, stent evaluation, bypass graft assessment, FFR-CT estimation, pericoronary fat attenuation, SUV correction per segment

## 5.2 Cardiac MR Analysis (30 pts)
- `cardiacMrService.ts` — Ventricular segmentation (LV/RV), wall motion analysis (16-segment), T1 mapping (native/post-contrast ECV), T2 mapping, T2* mapping, LGE quantification (gray-zone/scar), perfusion (stress/rest myocardial perfusion reserve), strain analysis (GLS/GCS/GRS), flow quantification (valvular, shunt Qp/Qs), 4D flow visualization, atrial volumetry, parametric mapping overlay

## 5.3 Echocardiography Integration (25 pts)
- `echoService.ts` — LVEF (Simpson's biplane), wall motion score index, diastolic function grading, valvular stenosis/regurgitation grading, DTI/TDI tissue Doppler, speckle tracking (GLS), 3D echo volumetry, contrast echo assessment, stress echo (wall motion / perfusion), prosthetic valve evaluation, TEE measurements, pericardial assessment, RV/RA pressures (PASP, CVP), LA strain (reservoir/conduit/booster), atrial volumetry

## 5.4 Cardiac Catheterization Data (25 pts)
- `cathService.ts` — Coronary angiography (TIMI flow grading, lesion location), left heart hemodynamics (LVEDP, aortic gradient), right heart hemodynamics (RAP, PAP, PCWP, CI, PVR, SVR), FFR/iFR measurement, IVUS (lumen/plaque area, MLA), OCT (stent apposition/neointimal coverage), PCI data (stent type/size/pressure/balloon), coronary pressure wire pullback, ventriculography (LVEF, wall motion), shunt run (Qp/Qs, oximetry), valvuloplasty/TAVR/TAVI data

## 5.7 Peripheral Vascular & Aorta (20 pts)
- `vascularService.ts` — Aorta analysis (aneurysm/dissection/penetrating ulcer/intramural hematoma), carotid Doppler (PSV/EDV/ICA/CCA ratio, stenosis grading), peripheral arterial (ABI, run-off score, stenosis), venous system (DVT scoring, reflux grading), renal artery Doppler (RAR/RRI, fibromuscular dysplasia), mesenteric ischemia, AV fistula mapping, TAVR access planning (iliofemoral calcium score, minimal lumen diameter, tortuosity index), endoleak classification
