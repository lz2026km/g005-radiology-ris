# Module 12.4 - Native App Infrastructure (30 pts)

**Location:** `mobile/`

**Files:**
- `package.json` — Dependencies for native app shell (Capacitor/Cordova-ready)
- `tsconfig.json` — TypeScript configuration for mobile project
- `vite.config.ts` — Vite config for mobile build
- `index.html` — Entry HTML for mobile app
- `src/App.tsx` — Root React component with navigation
- `src/main.tsx` — Entry point
- `src/index.ts` — Barrel exports
- `src/navigation/AppNavigator.tsx` — Stack/tab navigator for mobile modules
- `src/store/mobileStore.ts` — Zustand store for mobile state
- `src/services/api.ts` — API client for mobile backend communication
- `src/types/index.ts` — Shared type definitions

**Points by feature:**
- Project scaffolding with Vite + TypeScript + React: 5
- Cross-platform navigation (stack + bottom tabs): 5
- State management with Zustand: 5
- API client with auth token handling: 5
- Offline-capable data sync queue: 5
- Error boundary and crash reporting stub: 5

**Total: 30 pts**
