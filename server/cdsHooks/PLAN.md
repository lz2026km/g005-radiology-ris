# Module 13.3 — CDS Hooks Integration (20 pts)

## Purpose
Provide CDS Hooks service endpoints so that external SMART-on-FHIR apps can request clinical decision support within the RIS workflow.

## Endpoints
- `GET /cds-services` – Service discovery (list of CDS services)
- `POST /cds-services/contrast-check` – Checks contrast allergy / renal function before contrast exam
- `POST /cds-services/dose-check` – Radiation dose checking based on patient age/BMI
- `POST /cds-services/duplicate-order` – Detects duplicate/redundant imaging orders
- `POST /cds-services/protocol-recommendation` – Recommends imaging protocol based on diagnosis
- `POST /cds-services/critical-alert` – Alerts when report contains critical finding

## CDS Hook conventions
- All services accept `{ hook, context, prefetch, fhirAuthorization }`
- Return `{ cards: [] }` with `summary`, `indicator`, `detail`, `source`, `suggestions`, `links`
- Supports `patient-view`, `order-select`, `order-sign`, `encounter-start` hooks

## Files
- `index.ts` – router and service discovery endpoint
- `services/` – one file per CDS service
- `utils.ts` – shared card builders
