# Module 13.2 — FHIR Extensions & Custom (25 pts)

## Purpose
Provide radiology-specific FHIR extensions that augment standard resources with domain knowledge needed by G005 RIS.

## Extensions defined
| Extension URL | Context | Description |
|---|---|---|
| `g005-radiology-report` | DiagnosticReport | Report body with structured sections |
| `g005-exam-protocol` | ServiceRequest | Protocol / procedure code extension |
| `g005-modality-settings` | Device | Modality-specific configuration |
| `g005-critical-finding` | Observation | Critical value flag + escalation |
| `g005-radiology-annotation` | ImagingStudy | Annotation / measurement storage |
| `g005-consent-imaging` | Patient | Imaging-specific consent flags |
| `g005-request-priority` | ServiceRequest | RIS-specific priority (stat, urgent, routine) |

## Endpoints
- `GET /fhir/StructureDefinition` – list all custom StructureDefinitions
- `GET /fhir/StructureDefinition/:id` – single extension definition

## Implementation
- `index.ts` – router entry
- `registry.ts` – in-memory extension registry, stores StructureDefinition resources
- `seed.ts` – seeds the registry with all radiology extensions on startup
