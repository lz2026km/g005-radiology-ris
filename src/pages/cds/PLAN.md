# Module 8: Clinical Decision Support (CDS) — Page Layer

## 8.5 CDS System Management (25 pts) — `CdsManagementPage.tsx`
- Rule browser: list/search appropriateness rules, pathway templates, contrast protocols
- CRUD for each rule type with inline editors
- Activation toggles per rule/pathway
- Version history display
- Permission-gated admin operations

## 8.6 CDS Statistics & Analytics (25 pts) — `CdsStatisticsPage.tsx`
- Dashboard: override rate, suggestion acceptance rate, pathway completion rate
- Charts: top overridden rules, most-used pathways, contrast safety alerts
- Trend lines over 7/30/90 day windows
- Exportable reports (CSV)

## Barrel Export — `index.ts`
Named exports: `CdsManagementPage`, `CdsStatisticsPage`
