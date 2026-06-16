# Module 8: Clinical Decision Support (CDS) — Service Layer

## 8.1 Exam Appropriateness (30 pts) — `appropriateness.ts`
- `AppropriatenessRule` — rules linking clinical indication → recommended exams
- `AppropriatenessLevel` — 'appropriate' | 'maybe_appropriate' | 'inappropriate'
- `ExamAppropriatenessService` (`IExamAppropriatenessService`)
  - `getRecommendations(indication, patientData)` — returns ranked exam list with appropriateness + rationale
  - `getGuidelineSource(ruleId)` — ACR/ESR guideline metadata
  - `overrideRule(ruleId, override)` — admin override with audit

## 8.2 Report Decision Support (30 pts) — `reportDecisionSupport.ts`
- `ReportSuggestion` — differential diagnosis / follow-up / terminology suggestions
- `SuggestionType` — 'differential_diagnosis' | 'follow_up' | 'terminology' | 'template' | 'guideline'
- `ReportDecisionSupportService` (`IReportDecisionSupportService`)
  - `getSuggestions(reportDraft)` — AI-driven inline suggestions
  - `checkCompleteness(reportDraft)` — missing section/field detection
  - `validateTerminology(text)` — RadLex/SNOMED compliance check

## 8.3 Clinical Pathways (25 pts) — `clinicalPathways.ts`
- `ClinicalPathway` — ordered steps for condition-specific workup
- `PathwayStep` — single step: exam / consult / lab / follow-up
- `PathwayService` (`IPathwayService`)
  - `getPathways(condition, modality?)` — applicable pathways
  - `activatePathway(patientId, pathwayId)` — start tracking
  - `getPatientPathway(patientId)` — current progress
  - `advanceStep(pathwayInstanceId, stepId)` — mark step complete

## 8.4 Drug & Contrast CDS (25 pts) — `drugContrastCds.ts`
- `ContrastCheck` / `DrugInteractionCheck` — safety checks
- `ContraindicationSeverity` — 'contraindicated' | 'caution' | 'safe'
- `DrugContrastCdsService` (`IDrugContrastCdsService`)
  - `checkContrastSafety(contrastName, patientData)` — eGFR/allergy check
  - `checkDrugInteraction(drugIds, patientId)` — DDI check
  - `getContrastProtocol(contrastName, weight, eGFR)` — dose protocol
  - `recordAdverseEvent(event)` — log & report

## Barrel Export — `index.ts`
Re-export all types and service factory functions.
