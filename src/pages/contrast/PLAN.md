# Module 14: Contrast & Medication Management — Page Layer

## 14.1 Contrast Inventory Management (30 pts) — `ContrastInventoryPage.tsx`
- Stock overview table: contrast type, batch/lot, volume, expiry, status
- Receive stock form (type, volume, batch, expiry, supplier)
- Dispense / adjust stock actions
- Low stock & expiry warning banners
- Inventory transaction log drawer

## 14.2 Contrast Injection Workstation (25 pts) — `ContrastInjectionWorkstationPage.tsx`
- Patient exam list for injection setup
- Protocol selection with parameter adjustment (weight/eGFR based)
- Injection start / monitoring panel
- Injection history per exam
- Device status indicator

## 14.3 Adverse Reaction Management (30 pts) — `AdverseReactionPage.tsx`
- Adverse event log table with filters (type, severity, date range)
- Record new reaction form (type, severity, description, action, outcome)
- Detail view with follow-up updates
- Statistics & trends (reaction rates, type distribution)
- Patient history sidebar

## 14.6 Quality & Compliance (20 pts) — `ContrastQualityCompliancePage.tsx`
- Quality metrics dashboard cards
- Contrast usage trend chart
- Adverse event rate chart
- Protocol adherence summary
- Regulatory compliance checklist
- Report export

## Barrel Export — `index.ts`
Named exports: `ContrastInventoryPage`, `ContrastInjectionWorkstationPage`, `AdverseReactionPage`, `ContrastQualityCompliancePage`
