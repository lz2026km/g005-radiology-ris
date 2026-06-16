# Module 13.1 — FHIR R4 Core API (35 pts) + 13.6 — FHIR Performance & Ops (20 pts)

## 13.1 FHIR R4 Core (35 pts)
### Resources implemented
- `Patient` – `/fhir/Patient`
- `Observation` – `/fhir/Observation`
- `DiagnosticReport` – `/fhir/DiagnosticReport`
- `ImagingStudy` – `/fhir/ImagingStudy`
- `ServiceRequest` – `/fhir/ServiceRequest`
- `Practitioner` – `/fhir/Practitioner`
- `Organization` – `/fhir/Organization`
- `Endpoint` – `/fhir/Endpoint`

### Standard operations per resource
- `GET /:id` – read by id
- `GET /` – search (supported params: `_id`, `identifier`, `patient`, `status`, `_lastUpdated`, `_count`, `_sort`)
- `POST /` – create
- `PUT /:id` – update
- `DELETE /:id` – delete

### FHIR meta
- `GET /metadata` – CapabilityStatement
- All responses use `application/fhir+json` content-type
- Proper `Resource.id`, `meta.versionId`, `meta.lastUpdated`

## 13.6 FHIR Performance & Ops (20 pts)
### Batch / Transaction
- `POST /` – batch (`$batch`) and transaction (`$transaction`) processing
- Returns `Bundle` with `type`: `batch-response` / `transaction-response`

### Caching
- ETag / If-None-Match support
- `Cache-Control` headers

### Search performance
- Paginated search with `_count`, `_offset`
- `_include` / `_revinclude` partial support

### CapabilityStatement
- `GET /metadata` – full server capability + security + operation definitions

## Files
- `index.ts` – Router entry, aggregates all resource routers
- `routes/` – one file per resource
- `middleware/` – FHIR-specific middleware (content-type, etag, bundle, caching)
- `utils/` – helpers for FHIR responses, search param parsing
