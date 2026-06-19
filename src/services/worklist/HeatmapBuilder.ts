/**
 * G005 RIS v3.0.6.6 - 工作负载热力图构建器
 * 40 点升级 - 24h × Site 工作负载数据
 */

import type { WorkloadHeatmapCell, WorkloadSite } from '../../types/workflow';

export interface HeatmapBuildInput {
  sites: WorkloadSite[];
  historyBySiteHour?: Record<string, Array<{ hour: number; load: number }>>;
}

export class HeatmapBuilder {
  build(input: HeatmapBuildInput): WorkloadHeatmapCell[] {
    const cells: WorkloadHeatmapCell[] = [];
    const baseHistory = input.historyBySiteHour ?? this.synthesizeHistory(input.sites);
    let maxLoad = 1;
    const allLoads: number[] = [];
    for (const site of input.sites) {
      const series = baseHistory[site.siteId] ?? [];
      for (const entry of series) {
        cells.push({
          siteId: site.siteId,
          hour: entry.hour,
          load: entry.load,
          intensity: 0,
        });
        allLoads.push(entry.load);
      }
    }
    maxLoad = Math.max(1, ...allLoads);
    for (const cell of cells) {
      cell.intensity = Math.min(1, cell.load / maxLoad);
    }
    return cells;
  }

  toMatrix(cells: WorkloadHeatmapCell[], sites: WorkloadSite[]): Array<Array<{ hour: number; intensity: number; load: number }>> {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map((hour) => sites.map((site) => {
      const cell = cells.find((c) => c.siteId === site.siteId && c.hour === hour);
      return {
        hour,
        intensity: cell?.intensity ?? 0,
        load: cell?.load ?? 0,
      };
    }));
  }

  private synthesizeHistory(sites: WorkloadSite[]): Record<string, Array<{ hour: number; load: number }>> {
    const out: Record<string, Array<{ hour: number; load: number }>> = {};
    for (const site of sites) {
      out[site.siteId] = Array.from({ length: 24 }, (_, h) => {
        const peak = Math.exp(-Math.pow((h - 10) / 4, 2)) + Math.exp(-Math.pow((h - 15) / 4, 2)) * 0.7;
        const load = Math.round((site.utilizationPct / 100) * 50 * peak);
        return { hour: h, load };
      });
    }
    return out;
  }
}

export const heatmapBuilder = new HeatmapBuilder();