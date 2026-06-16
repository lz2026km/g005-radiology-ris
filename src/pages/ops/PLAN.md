# Module 10: Operations Command Center — Page Layer

## 10.1 Ops Dashboard (30 pts) — `OpsDashboardPage.tsx`
- KPI summary cards (today's exams, pending, utilization, TAT)
- Workload trend chart (recharts LineChart, 14/30 day toggle)
- Modality utilization bar chart (recharts BarChart)
- Operator productivity table with rankings
- Peak hour analysis bar chart
- Auto-refresh indicator

## 10.3 Device Ops Management (30 pts) — `DeviceOpsPage.tsx`
- Device registry table with status/type/location
- Device detail view with maintenance schedule
- Device utilization heatmap (recharts)
- Maintenance history log
- Device fault alert section
- Software/firmware version tracking

## 10.4 HR Operations (30 pts) — `HrOperationsPage.tsx`
- Staff roster with role/filter/search
- Shift scheduling grid (weekly view)
- Staff productivity comparison (recharts BarChart)
- Overtime/absence tracking
- Training certification tracker
- Staff satisfaction trend (recharts LineChart)

## Barrel Export — `index.ts`
Named exports: `OpsDashboardPage`, `DeviceOpsPage`, `HrOperationsPage`
