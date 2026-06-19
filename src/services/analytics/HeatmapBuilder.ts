import type { HeatmapData, HeatmapCell, KpiValue } from '../../types/analytics';
import { ANALYTICS_KPIS } from '../../data/analyticsKpis';

export class HeatmapBuilder {
  buildFromKpis(values: KpiValue[], rows?: string[], cols?: string[]): HeatmapData {
    const defs = ANALYTICS_KPIS;
    const categories = rows ?? [...new Set(defs.map(d => d.category))];
    const formats = cols ?? ['number', 'percent', 'minutes', 'score'];
    const cells: HeatmapCell[] = [];

    for (const row of categories) {
      const rowDefs = defs.filter(d => d.category === row);
      for (const col of formats) {
        const match = rowDefs.filter(d => d.format === col);
        const total = match.reduce((sum, m) => {
          const v = values.find(v => v.kpiId === m.id);
          return sum + (v?.value ?? 0);
        }, 0);
        const count = match.length || 1;
        const avg = total / count;
        cells.push({
          row,
          col,
          value: Math.round(avg * 10) / 10,
          intensity: Math.min(1, avg / 100),
        });
      }
    }

    const allValues = cells.map(c => c.value);
    return {
      rows: categories,
      cols: formats,
      cells,
      min: Math.min(...allValues),
      max: Math.max(...allValues),
      legend: { low: '#f0fdf4', mid: '#fef9c3', high: '#fecaca' },
    };
  }

  buildFromMatrix(rows: string[], cols: string[], matrix: number[][]): HeatmapData {
    const cells: HeatmapCell[] = [];
    const flatValues: number[] = [];
    for (let ri = 0; ri < rows.length; ri++) {
      for (let ci = 0; ci < cols.length; ci++) {
        const val = matrix[ri]?.[ci] ?? 0;
        flatValues.push(val);
        cells.push({ row: rows[ri]!, col: cols[ci]!, value: val, intensity: 0 });
      }
    }
    const min = Math.min(...flatValues);
    const max = Math.max(...flatValues);
    const range = max - min || 1;
    for (const cell of cells) {
      cell.intensity = (cell.value - min) / range;
    }
    return { rows, cols, cells, min, max, legend: { low: '#eff6ff', mid: '#93c5fd', high: '#1e40af' } };
  }

  buildHourlyDayOfWeek(data: Array<{ dayOfWeek: number; hour: number; value: number }>): HeatmapData {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const cells: HeatmapCell[] = [];
    const flatValues: number[] = [];
    for (const d of data) {
      const val = d.value;
      flatValues.push(val);
      cells.push({ row: days[d.dayOfWeek - 1] ?? `周${d.dayOfWeek}`, col: d.hour.toString(), value: val, intensity: 0 });
    }
    const min = Math.min(...flatValues);
    const max = Math.max(...flatValues);
    const range = max - min || 1;
    for (const cell of cells) {
      cell.intensity = (cell.value - min) / range;
    }
    return { rows: days, cols: hours, cells, min, max, legend: { low: '#f0fdf4', mid: '#fef9c3', high: '#dc2626' } };
  }
}

export const heatmapBuilder = new HeatmapBuilder();
