# Module 13.8 — Open Platform & 3rd Party (20 pts)

## Purpose
Provide an open platform with API management, developer portal, and webhook system enabling third-party integrations.

## Components

### API Key Management
- `POST /openapi/keys` – generate API key
- `GET /openapi/keys` – list keys
- `DELETE /openapi/keys/:id` – revoke key
- `GET /openapi/keys/:id` – key details

### Rate Limiting
- Per-key rate limits (configurable requests/min)
- `GET /openapi/limits` – get current limits
- `PUT /openapi/limits` – update limits (admin)

### Webhook Management
- `POST /openapi/webhooks` – register webhook
- `GET /openapi/webhooks` – list webhooks
- `PUT /openapi/webhooks/:id` – update webhook
- `DELETE /openapi/webhooks/:id` – delete webhook
- `POST /openapi/webhooks/:id/test` – test webhook delivery

### Webhook Delivery
- Event types: `exam.created`, `exam.updated`, `report.published`, `critical.alert`, `hl7.message`
- Retry with exponential backoff
- Delivery logs (`GET /openapi/webhooks/:id/deliveries`)

### OpenAPI Spec
- `GET /openapi/spec` – served from `openapi.yaml` or generated spec

### Developer Portal
- `GET /openapi/console` – stub developer portal page
- `GET /openapi/playground` – API playground endpoint

## Files
- `index.ts` – router entry
- `keys.ts` – API key management
- `rateLimiter.ts` – rate limiting middleware + config
- `webhooks.ts` – webhook registry + delivery engine
- `spec.ts` – OpenAPI spec generation
- `console.ts` – developer portal stubs
