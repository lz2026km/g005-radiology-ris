import type { BenchmarkStandard, BenchmarkGap, KpiSnapshot } from '../../../types/analytics';

export class Benchmarking {
  private standards: Map<string, BenchmarkStandard>;

  constructor() {
    this.standards = new Map();
  }

  addStandard(standard: BenchmarkStandard): void {
    this.standards.set(standard.id, standard);
  }

  getStandard(id: string): BenchmarkStandard | undefined {
    return this.standards.get(id);
  }

  getAllStandards(): BenchmarkStandard[] {
    return [...this.standards.values()];
  }

  compare(snapshot: KpiSnapshot, standardId: string): BenchmarkGap[] {
    const standard = this.standards.get(standardId);
    if (!standard) throw new Error(`Unknown benchmark standard: ${standardId}`);

    return standard.metrics.map(sm => {
      const ourVal = snapshot.values.find(v => v.kpiId === sm.code);
      const ours = ourVal?.value ?? 0;
      const delta = ours - sm.value;
      const deltaPercent = sm.value ? Math.round((delta / sm.value) * 1000) / 10 : 0;
      const status: BenchmarkGap['status'] =
        sm.direction === 'higher-better'
          ? delta > 0.1 * sm.value ? 'exceeds' : delta > -0.1 * sm.value ? 'meets' : delta > -0.25 * sm.value ? 'lags' : 'critical'
          : delta < -0.1 * sm.value ? 'exceeds' : delta < 0.1 * sm.value ? 'meets' : delta < 0.25 * sm.value ? 'lags' : 'critical';

      return {
        metricCode: sm.code,
        metricName: sm.name,
        ours: Math.round(ours * 10) / 10,
        benchmark: sm.value,
        delta: Math.round(delta * 10) / 10,
        deltaPercent,
        status,
      };
    });
  }

  registerDefaults(): void {
    this.addStandard({
      id: 'bench-national',
      name: '全国三级医院放射科基准',
      source: '国家放射质控中心 2025年报',
      metrics: [
        { code: 'kpi-001', name: '月均报告数', value: 1800, unit: '份', direction: 'higher-better' },
        { code: 'kpi-010', name: '平均签发时长', value: 35, unit: '分钟', direction: 'lower-better' },
        { code: 'kpi-012', name: '及时签发率', value: 85, unit: '%', direction: 'higher-better' },
        { code: 'kpi-020', name: '甲级报告率', value: 80, unit: '%', direction: 'higher-better' },
        { code: 'kpi-021', name: '平均质量分', value: 87, unit: '分', direction: 'higher-better' },
        { code: 'kpi-030', name: '危急值及时率', value: 98, unit: '%', direction: 'higher-better' },
        { code: 'kpi-040', name: '设备利用率', value: 82, unit: '%', direction: 'higher-better' },
        { code: 'kpi-050', name: 'AI辅助率', value: 55, unit: '%', direction: 'higher-better' },
        { code: 'kpi-070', name: '科室满意度', value: 90, unit: '分', direction: 'higher-better' },
      ],
    });
    this.addStandard({
      id: 'bench-province',
      name: '省基准',
      source: '省放射质控中心 2025年报',
      metrics: [
        { code: 'kpi-001', name: '月均报告数', value: 1500, unit: '份', direction: 'higher-better' },
        { code: 'kpi-010', name: '平均签发时长', value: 40, unit: '分钟', direction: 'lower-better' },
        { code: 'kpi-020', name: '甲级报告率', value: 75, unit: '%', direction: 'higher-better' },
        { code: 'kpi-040', name: '设备利用率', value: 78, unit: '%', direction: 'higher-better' },
      ],
    });
  }
}

export const benchmarking = new Benchmarking();
benchmarking.registerDefaults();
