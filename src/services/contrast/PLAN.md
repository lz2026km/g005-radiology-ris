# Module 14: Contrast & Medication Management — Service Layer

## 14.1 Contrast Inventory Management (30 pts) — `inventoryService.ts`
- `ContrastInventoryItem` — agent type, batch/lot, volume (mL), expiry date, supplier
- `StockAdjustment` — receive / dispense / return / adjust
- `LowStockThreshold` — configurable per contrast type
- `ContrastInventoryService` (`IContrastInventoryService`)
  - `getInventory()` — full inventory list
  - `getItem(batchId)` — single item detail
  - `receiveStock(item)` — add new inventory
  - `dispense(batchId, volume)` — consume stock
  - `adjustStock(batchId, delta, reason)` — manual correction
  - `getLowStockAlerts()` — items below threshold
  - `getExpiringItems(days)` — items expiring within N days
  - `getInventoryLog(itemId?)` — audit trail

## 14.2 Contrast Injection Workstation (25 pts) — `injectionWorkstationService.ts`
- `InjectionProtocol` — contrastType, volume, rate, delay, phase
- `InjectionRecord` — per-exam injection details
- `InjectorDeviceStatus` — device connectivity & status
- `InjectionWorkstationService` (`IInjectionWorkstationService`)
  - `getProtocols(modality?)` — available injection protocols
  - `getProtocol(id)` — single protocol detail
  - `calculateParameters(contrastType, weight, eGFR)` — patient-specific dose
  - `startInjection(examId, protocolId, params)` — begin injection
  - `getInjectionHistory(examId?)` — past injections
  - `getDeviceStatus()` — injector status

## 14.3 Adverse Reaction Management (30 pts) — `adverseReactionService.ts`
- `AdverseReaction` — full reaction record
- `ReactionType` — 'allergic' | 'nephrotoxic' | 'extravasation' | 'vasovagal' | 'other'
- `ReactionSeverity` — 'mild' | 'moderate' | 'severe'
- `ReactionOutcome` — 'resolved' | 'improving' | 'ongoing' | 'fatal'
- `AdverseReactionService` (`IAdverseReactionService`)
  - `getReactions(filters?)` — list with filters
  - `getReaction(id)` — single record
  - `recordReaction(reaction)` — log new reaction
  - `updateReaction(id, updates)` — follow-up
  - `getReactionStats(startDate, endDate)` — aggregated statistics
  - `getPatientHistory(patientId)` — patient's reaction history

## 14.4 Renal Function Management (20 pts) — `renalFunctionService.ts`
- `RenalFunctionAssessment` — eGFR value, formula, risk level, date
- `EgfrFormula` — 'MDRD' | 'CKD-EPI' | 'Cockcroft-Gault'
- `CINRiskLevel` — 'low' | 'moderate' | 'high' | 'very_high'
- `RenalFunctionService` (`IRenalFunctionService`)
  - `calculateEgfr(creatinine, age, gender, race, formula)` — eGFR computation
  - `assessContrastRisk(egfrValue, contrastType)` — risk stratification
  - `getHydrationProtocol(riskLevel)` — standard hydration recommendations
  - `getPatientRenalHistory(patientId)` — trend data

## 14.6 Quality & Compliance (20 pts) — `qualityComplianceService.ts`
- `QualityMetric` — individual metric definition
- `ComplianceReport` — regulatory report structure
- `QualityComplianceService` (`IQualityComplianceService`)
  - `getQualityMetrics(startDate, endDate)` — KPI dashboard data
  - `getContrastUsageReport(startDate, endDate)` — usage statistics
  - `getAdverseEventRate(startDate, endDate)` — adverse reaction rate
  - `getProtocolAdherence()` — protocol compliance rate
  - `getRegulatoryCompliance()` — regulatory checks
  - `generateComplianceReport(reportType)` — full report export

## Barrel Export — `index.ts`
Re-export all types and service factory functions.
