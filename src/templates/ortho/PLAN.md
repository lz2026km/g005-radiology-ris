# Module 7.8: Orthopedic Structured Reports — PLAN

## File: `src/templates/ortho/index.ts`

### 9 Structured Report Templates
| ID | Type | Region | Modality |
|---|---|---|---|
| ortho-knee-oa | osteoarthritis | knee | MR |
| ortho-spine-degenerative | spine-degenerative | spine | MR |
| ortho-shoulder-sports | sports-injury | shoulder | MR |
| ortho-hip-bmd | bmd | hip | DXA |
| ortho-trauma-general | fracture | long-bone | DR |
| ortho-hip-oa | osteoarthritis | hip | MR |
| ortho-ankle-sports | sports-injury | ankle | MR |
| ortho-tumor-bone | tumor | long-bone | MR |
| ortho-spine-trauma | fracture | spine | CT |

### Key types
- `OrthoStructuredReportTemplate` — field definitions, anatomy mapping, measurement tool references
- `OrthoReportData` — input data for rendering
- `RenderedOrthoReport` — output with sections, impression, recommendation

### Functions
- `getOrthoTemplates()` — list all templates
- `getOrthoTemplatesByRegion(region)` — filter by body region
- `getOrthoTemplatesByType(type)` — filter by template type
- `getOrthoTemplateById(id)` — single template lookup
- `renderOrthoReport(templateId, data, locale)` — render structured report with bilingual support
- `validateOrthoReportData(templateId, data)` — validate required fields and numeric ranges
