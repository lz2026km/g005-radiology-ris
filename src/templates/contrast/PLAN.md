# Module 14.5: Informed Consent — Template Layer

## `informedConsentTemplate.ts` (15 pts)
- `InformedConsentData` — patient/exam/contrast info, risks, signature fields
- `generateInformedConsentHtml(data)` — renders consent as HTML string
- `generateInformedConsentText(data)` — plain text version
- Sections: patient info, procedure explanation, risks & benefits, alternatives, attestation

## Barrel Export — `index.ts`
Named export: `generateInformedConsentHtml`, `generateInformedConsentText`
Export type: `InformedConsentData`
