# Module 5.5: Cardiovascular Structured Reports (25 pts)

## Files
- `coronaryCtaReport.ts` — CAD-RADS structured report template with segment involvement score, plaque burden, stenosis severity per segment, calcium score category, FFR-CT result, stent/bypass assessment
- `cardiacMrReport.ts` — Cardiac MR structured report template with ventricular volumes (EDV/ESV/SV/EF, indexed), wall motion scores, LGE scar quantification (% LV mass), parametric mapping values (T1/T2/ECV), flow measurements, perfusion reserve index
- `echoReport.ts` — Echocardiography structured report template with LVEF, WMSI, diastolic function grade, valve lesion grading, Doppler velocities, strain (GLS), chamber quantifications, estimated pressures
- `cathReport.ts` — Catheterization structured report template with coronary lesion map, hemodynamics (pressures, resistances, cardiac output), FFR/iFR values, PCI details, ventriculography findings, shunt calculations
- `index.ts` — Aggregator exporting all report generators with unified `generateCardiacReport` function
