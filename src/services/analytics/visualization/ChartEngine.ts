import type { ChartPayload, ChartKind, ChartSeries, KpiSnapshot, TimeSeries, CohortComparisonRow, BenchmarkGap, HeatmapData } from '../../../types/analytics';

export class ChartEngine {
  kpiSnapshotToBar(snapshot: KpiSnapshot, category: string, limit?: number): ChartPayload {
    const filtered = snapshot.values.filter(v => { const d = this.findDef(v.kpiId); return d?.category === category; });
    const top = (limit ? filtered.slice(0, limit) : filtered);
    return {
      kind: 'bar',
      title: `${category} 指标`,
      xAxis: { label: '指标', type: 'category' },
      yAxis: { label: '值' },
      series: [{
        name: '当前值',
        data: top.map(v => ({ x: v.kpiId, y: v.value })),
      }],
    };
  }

  kpiSnapshotToRadar(snapshot: KpiSnapshot): ChartPayload {
    const categories = [...new Set(snapshot.values.map(v => { const d = this.findDef(v.kpiId); return d?.category ?? ''; }))].filter(Boolean);
    const categoryAvg = categories.map(cat => {
      const vals = snapshot.values.filter(v => { const d = this.findDef(v.kpiId); return d?.category === cat; });
      const avg = vals.reduce((s, v) => s + v.value, 0) / (vals.length || 1);
      return { x: cat, y: Math.round(avg * 10) / 10 };
    });
    return {
      kind: 'radar',
      title: '类别对比',
      series: [{ name: '平均值', data: categoryAvg }],
    };
  }

  timeSeriesToLine(ts: TimeSeries): ChartPayload {
    return {
      kind: 'line',
      title: ts.name,
      xAxis: { label: '时间', type: 'time' },
      yAxis: { label: ts.unit ?? '值' },
      series: [{
        name: ts.name,
        data: ts.points.map(p => ({ x: p.t, y: p.v, meta: p.meta })),
      }],
    };
  }

  cohortToBar(rows: CohortComparisonRow[]): ChartPayload {
    const metrics = [...new Set(rows.flatMap(r => Object.keys(r.metrics)))];
    const series: ChartSeries[] = metrics.map(m => ({
      name: m,
      data: rows.map(r => ({ x: r.cohortName, y: r.metrics[m] ?? 0 })),
    }));
    return {
      kind: 'bar',
      title: '队列对比',
      xAxis: { label: '队列', type: 'category' },
      yAxis: { label: '值' },
      series,
    };
  }

  benchmarkToGauge(gaps: BenchmarkGap[]): ChartPayload {
    const exceeds = gaps.filter(g => g.status === 'exceeds').length;
    const meets = gaps.filter(g => g.status === 'meets').length;
    const lags = gaps.filter(g => g.status === 'lags').length;
    const critical = gaps.filter(g => g.status === 'critical').length;
    return {
      kind: 'gauge',
      title: '基准对标总览',
      series: [{
        name: '状态分布',
        data: [
          { x: '超出', y: exceeds },
          { x: '达标', y: meets },
          { x: '落后', y: lags },
          { x: '严重', y: critical },
        ],
      }],
    };
  }

  heatmapToChart(hm: HeatmapData): ChartPayload {
    return {
      kind: 'heatmap',
      title: '热力图',
      xAxis: { label: '列', type: 'category' },
      yAxis: { label: '行', type: 'category' },
      series: [{
        name: '',
        data: hm.cells.map(c => ({ x: c.col, y: c.value, meta: { row: c.row, intensity: c.intensity } })),
      }],
    };
  }

  funnel(stages: Array<{ label: string; value: number }>): ChartPayload {
    return {
      kind: 'funnel',
      title: '漏斗图',
      series: [{
        name: '转化',
        data: stages.map(s => ({ x: s.label, y: s.value })),
      }],
    };
  }

  sankey(links: Array<{ source: string; target: string; value: number }>): ChartPayload {
    const nodes = [...new Set(links.flatMap(l => [l.source, l.target]))];
    return {
      kind: 'sankey',
      title: '桑基图',
      series: [{
        name: '流量',
        data: links.map(l => ({ x: l.source, y: l.value, meta: { target: l.target } })),
      }],
      meta: { nodes },
    };
  }

  private findDef(kpiId: string) {
    const { ANALYTICS_KPIS } = require('../../../data/analyticsKpis');
    return ANALYTICS_KPIS.find((d: { id: string }) => d.id === kpiId);
  }
}

export const chartEngine = new ChartEngine();
