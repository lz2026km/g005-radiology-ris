// ============================================================
// G005 放射RIS系统 v2.1.0 - useImageAnchor Hook
// Phase R10 W3: 报告 ↔ 影像锚定管理
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ImageAnchor, ImageFrameRef, ImageMeasurement, ReportAnchors } from '../types/imageAnchor';

const STORAGE_KEY = 'g005.imageAnchors.v1';
const KEYFRAME_KEY = 'g005.imageAnchors.keyframes.v1';

type AnchorMap = Record<string, ReportAnchors>;

function loadFromStorage(): AnchorMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AnchorMap;
  } catch {
    return {};
  }
}

function persist(map: AnchorMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota exceeded - silently drop
  }
}

function genId(): string {
  return 'anc-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
}

export interface UseImageAnchorResult {
  // 状态
  anchors: ImageAnchor[];
  reportId: string | null;
  // 查询
  getAnchorsForReport: (reportId: string) => ImageAnchor[];
  getAnchorsForSeries: (seriesUID: string) => ImageAnchor[];
  getAnchorsAt: (reportId: string, offset: number) => ImageAnchor[];
  // 写
  addAnchor: (input: Omit<ImageAnchor, 'id' | 'createdAt'>) => ImageAnchor;
  updateAnchor: (id: string, patch: Partial<ImageAnchor>) => void;
  removeAnchor: (id: string) => void;
  removeAnchorsForReport: (reportId: string) => void;
  // 工具
  setMeasurement: (id: string, m: ImageMeasurement) => void;
  linkAnnotation: (anchorId: string, annotationId: string) => void;
  // 统计
  count: number;
  criticalCount: number;
}

export function useImageAnchor(reportId?: string): UseImageAnchorResult {
  const [map, setMap] = useState<AnchorMap>(() => loadFromStorage());

  useEffect(() => {
    persist(map);
  }, [map]);

  const setMapSafe = useCallback((updater: (m: AnchorMap) => AnchorMap) => {
    setMap(prev => updater(prev));
  }, []);

  const getAnchorsForReport = useCallback((rid: string) => {
    return map[rid]?.anchors ?? [];
  }, [map]);

  const getAnchorsForSeries = useCallback((seriesUID: string) => {
    const out: ImageAnchor[] = [];
    Object.values(map).forEach(r => r.anchors.forEach(a => {
      if (a.frame.seriesInstanceUID === seriesUID) out.push(a);
    }));
    return out;
  }, [map]);

  const getAnchorsAt = useCallback((rid: string, offset: number) => {
    const list = map[rid]?.anchors ?? [];
    return list.filter(a => a.textRange && offset >= a.textRange.start && offset <= a.textRange.end);
  }, [map]);

  const addAnchor = useCallback((input: Omit<ImageAnchor, 'id' | 'createdAt'>) => {
    const anchor: ImageAnchor = {
      ...input,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    setMapSafe(m => ({
      ...m,
      [input.reportId]: {
        reportId: input.reportId,
        anchors: [...(m[input.reportId]?.anchors ?? []), anchor],
        keyframes: m[input.reportId]?.keyframes ?? [],
      },
    }));
    return anchor;
  }, [setMapSafe]);

  const updateAnchor = useCallback((id: string, patch: Partial<ImageAnchor>) => {
    setMapSafe(m => {
      const next: AnchorMap = {};
      Object.entries(m).forEach(([rid, rep]) => {
        next[rid] = {
          ...rep,
          anchors: rep.anchors.map(a => a.id === id ? { ...a, ...patch, id: a.id, createdAt: a.createdAt } : a),
        };
      });
      return next;
    });
  }, [setMapSafe]);

  const removeAnchor = useCallback((id: string) => {
    setMapSafe(m => {
      const next: AnchorMap = {};
      Object.entries(m).forEach(([rid, rep]) => {
        next[rid] = { ...rep, anchors: rep.anchors.filter(a => a.id !== id) };
      });
      return next;
    });
  }, [setMapSafe]);

  const removeAnchorsForReport = useCallback((rid: string) => {
    setMapSafe(m => {
      const { [rid]: _drop, ...rest } = m;
      void _drop;
      return rest;
    });
  }, [setMapSafe]);

  const setMeasurement = useCallback((id: string, measurement: ImageMeasurement) => {
    updateAnchor(id, { measurement });
  }, [updateAnchor]);

  const linkAnnotation = useCallback((anchorId: string, annotationId: string) => {
    updateAnchor(anchorId, { annotationId });
  }, [updateAnchor]);

  const active = reportId ? (map[reportId]?.anchors ?? []) : [];
  const count = active.length;
  const criticalCount = useMemo(() => active.filter(a => a.isCritical).length, [active]);

  return {
    anchors: active,
    reportId: reportId ?? null,
    getAnchorsForReport,
    getAnchorsForSeries,
    getAnchorsAt,
    addAnchor,
    updateAnchor,
    removeAnchor,
    removeAnchorsForReport,
    setMeasurement,
    linkAnnotation,
    count,
    criticalCount,
  };
}

// 工具：从 DICOM viewer 选择产生锚定
export function buildAnchorFromPick(opts: {
  reportId: string;
  frame: ImageFrameRef;
  point: { x: number; y: number };
  category?: ImageAnchor['category'];
  label?: string;
  userId: string;
}): Omit<ImageAnchor, 'id' | 'createdAt'> {
  return {
    reportId: opts.reportId,
    frame: opts.frame,
    label: opts.label,
    category: opts.category ?? 'finding',
    createdBy: opts.userId,
  };
}
