# Module 10: Operations Command Center — Service Layer

## 10.2 Smart Ops Analytics (35 pts) — `OpsAnalyticsService.ts`
- `OpsAnalyticsService` (`IOpsAnalyticsService`)
  - `getWorkloadTrend(days)` — exam volume trend with day-over-day comparison
  - `getModalityUtilization()` — utilization rates per modality (CT, MRI, X-ray, Mammo, US)
  - `getTurnaroundTimeStats(period)` — 25th/50th/75th/95th percentile TAT
  - `getPeakHourAnalysis()` — hourly distribution of exams, peak hour identification
  - `getOperatorProductivity(period)` — exams per technologist, comparison
- Mock data with realistic hospital operations patterns

## 10.5 Dashboard Configuration (25 pts) — `DashboardConfigService.ts`
- `DashboardConfigService` (`IDashboardConfigService`)
  - `getConfig(userId)` — retrieve user dashboard layout/widget config
  - `saveConfig(userId, config)` — persist configuration
  - `getAvailableWidgets()` — list of all available dashboard widgets
  - `resetToDefaults(userId)` — reset to system defaults
- `DashboardWidget` — id, title, type, size (sm/md/lg), position, settings
- Mock storage with per-user configuration

## Barrel Export — `index.ts`
Re-export all types and service factory functions.
