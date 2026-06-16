# Module 4: Revenue Cycle Management (RCM) — Services

## 4.1 Charge Item Management
- **File:** `src/services/rcm/chargeItemService.ts`
- `ChargeItemDto` — id, code, name, modality, price, category, isActive
- CRUD: list, getById, create, update, toggleActive, bulkUpdatePrice

## 4.2 Insurance Settlement (35 pts)
- **File:** `src/services/rcm/insuranceSettlementService.ts`
- `InsuranceSettlementDto` — id, patientId, payer, totalAmount, insuranceShare, patientShare, settlementDate, status
- `ClaimSubmissionDto` — claim batch submission
- Operations: list settlements, submit claim, query status, reconcile

## 4.4 Revenue Analysis
- **File:** `src/services/rcm/revenueService.ts`
- `RevenueSummaryDto` — period totals by modality/payer/doctor
- `RevenueTrendDto` — monthly trend data points
- Operations: getSummary, getTrend, getPayerBreakdown, getModalityBreakdown

## 4.5 Cost Accounting
- **File:** `src/services/rcm/costAccountingService.ts`
- `CostSummaryDto` — cost breakdown by category
- `CostPerExamDto` — per-modality unit cost
- Operations: getCostSummary, getCostPerExam, getBudgetVariance

## 4.8 Financial Compliance & Audit (20 pts)
- **File:** `src/services/rcm/financialComplianceService.ts`
- `ComplianceCheckDto` — audit trail for financial transactions
- `AuditRecordDto` — financial audit log entry
- Operations: runComplianceCheck, getAuditLog, exportAuditTrail
