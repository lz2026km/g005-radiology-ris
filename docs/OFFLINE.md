# Offline Support Contract

This document describes what the G005 Radiology RIS PWA supports while
disconnected, and — equally important — what it does not. Misuse of offline
behaviour for clinical workflows can cause silent data loss, so this
contract is normative.

## Works Offline

- **Initial page load** — HTML / JS / CSS shell is precached at SW install time
- **Static assets** — fonts, images, icons (CacheFirst via Workbox)
- **App shell** — AntD layout, navigation chrome, blank route fallbacks
- **Navigation fallback to `/index.html`** — SPA deep-links still resolve
- **Previously fetched `GET /api/v1/*`** — served from runtime cache (within
  the active session, until the Service Worker is updated/replaced)
- **IndexedDB worklist + draft reports** (`src/services/pwa/offlineStorage.ts`)
  — `OfflineWorklistItem` / `OfflineReport` rows are readable offline

## Does NOT Work Offline

- **Mutations (`POST` / `PUT` / `DELETE`)** — there is no background-sync queue.
  Writes attempted offline will fail loudly; users are expected to retry when
  the network returns.
- **`/api/v1/auth/*`** — never cached. A full page reload while offline will
  force a re-login.
- **Real-time worklist updates** — no SSE / WebSocket fallback. The worklist
  is a snapshot of the last successful sync.
- **DICOM image data** — only study/series/instance IDs are cached. Pixel
  data is fetched on demand from PACS and is not available offline.
- **CA digital signatures** — require a live HSM round-trip; offline signing
  is rejected by design.

## Caching Strategy

| Resource class        | Strategy                                | Notes                                  |
| --------------------- | --------------------------------------- | -------------------------------------- |
| Static assets         | `CacheFirst` (Workbox)                  | Hashed filenames, long-lived          |
| App shell / HTML      | `NetworkFirst` with offline fallback    | Falls back to precached `/index.html`   |
| `GET /api/v1/*`       | `NetworkFirst` with 3s timeout          | Returns cached body when offline       |
| `/api/v1/auth/*`      | `NetworkOnly`                           | No cache, no fallback                  |
| `/api/v1/audit/*`     | `NetworkOnly`                           | Compliance: never persisted client-side |

## Operational Notes

- Service Worker activation drops stale runtime caches; the user will see
  fresh data on the next online request.
- The MSW handlers in `src/services/mockBackend/handlers.ts` always respond
  from memory; they do not exercise the SW cache in dev.
- IndexedDB quota: ~50 MB in Chromium before eviction. Large worklists
  should be pruned by `offlineStorage.clearAll()`.
