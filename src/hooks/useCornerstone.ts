// ============================================================
// G005 放射RIS系统 v2.1.0 - Cornerstone3D Hooks
// Phase R10 W1: 初始化/工具组/视口管理
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';

// 全局状态：Cornerstone3D 初始化状态
let cornerstoneInitPromise: Promise<boolean> | null = null;

export async function initCornerstone3D(): Promise<boolean> {
  if (cornerstoneInitPromise) return cornerstoneInitPromise;
  cornerstoneInitPromise = (async () => {
    try {
      // 动态导入（vendor bundle 较大，按需加载）
      const csCore = await import('@cornerstonejs/core');
      const csTools = await import('@cornerstonejs/tools');
      const csDicom = await import('@cornerstonejs/dicom-image-loader');

      // 配置 web worker (Cornerstone 需要)
      const csDicomImageLoader: any = csDicom.default || csDicom;
      if (csDicomImageLoader?.init) {
        csDicomImageLoader.init();
      }

      // 配置缓存
      if ((csCore as any).cache?.setMaxCacheSize) {
        (csCore as any).cache.setMaxCacheSize(2 * 1024 * 1024 * 1024); // 2GB
      }

      // 初始化工具系统
      if ((csTools as any).init && (csDicomImageLoader as any)?.cornerstone) {
        (csTools as any).init();
      }
      return true;
    } catch (e) {
      console.error('[Cornerstone3D] init failed:', e);
      return false;
    }
  })();
  return cornerstoneInitPromise;
}

// Hook: Cornerstone3D 就绪
export function useCornerstone3D() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    initCornerstone3D().then(ok => {
      if (mounted) {
        setReady(ok);
        if (!ok) setError('Cornerstone3D 初始化失败（可能浏览器不支持 WebGL）');
      }
    });
    return () => { mounted = false; };
  }, []);
  return { ready, error };
}

// Hook: 单 viewport
export function useViewport(elementId: string, options: {
  imageIds: string[];
  modality?: string;
  preset?: string;
  onMount?: (viewport: any) => void;
}) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 挂载/卸载 viewport
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const ok = await initCornerstone3D();
      if (!ok || !mounted || !elementRef.current) return;
      try {
        const csCore = await import('@cornerstonejs/core');
        // 简易 viewport 模拟（实际使用 Cornerstone 时替换为真实 RenderingEngine）
        viewportRef.current = {
          element: elementRef.current,
          setImageIdIndex: (idx: number) => setCurrentIndex(idx),
          getCurrentIndex: () => currentIndex,
          resetCamera: () => {},
          setWindowLevel: (ww: number, wc: number) => {},
          setPreset: (preset: string) => {},
        };
        setIsLoading(false);
        options.onMount?.(viewportRef.current);
      } catch (e: any) {
        if (mounted) setError(e.message);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [elementId, options.imageIds.length]);

  // 滚动
  const scroll = useCallback((delta: number) => {
    if (options.imageIds.length === 0) return;
    const next = Math.max(0, Math.min(options.imageIds.length - 1, currentIndex + delta));
    setCurrentIndex(next);
    viewportRef.current?.setImageIdIndex?.(next);
  }, [currentIndex, options.imageIds.length]);

  // 跳转
  const jumpTo = useCallback((index: number) => {
    const idx = Math.max(0, Math.min(options.imageIds.length - 1, index));
    setCurrentIndex(idx);
    viewportRef.current?.setImageIdIndex?.(idx);
  }, [options.imageIds.length]);

  // 窗宽窗位
  const setWWWC = useCallback((ww: number, wc: number) => {
    if (viewportRef.current?.setWindowLevel) {
      viewportRef.current.setWindowLevel(ww, wc);
    }
  }, []);

  // 重置
  const reset = useCallback(() => {
    viewportRef.current?.resetCamera?.();
  }, []);

  return {
    elementRef,
    viewport: viewportRef.current,
    currentIndex,
    isLoading,
    error,
    scroll,
    jumpTo,
    setWWWC,
    reset,
  };
}

// Hook: DICOM stack 管理
export function useDicomStack(imageIds: string[]) {
  const [stack, setStack] = useState<{
    imageIds: string[];
    currentIndex: number;
    metadata: any[];
  }>({
    imageIds,
    currentIndex: 0,
    metadata: [],
  });

  useEffect(() => {
    setStack(prev => ({ ...prev, imageIds, currentIndex: 0 }));
  }, [imageIds.join('|')]);

  const setIndex = useCallback((idx: number) => {
    setStack(prev => ({ ...prev, currentIndex: idx }));
  }, []);

  return { stack, setIndex };
}

// Hook: DICOM 图像元数据加载
export function useDicomMetadata(imageId: string | undefined) {
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!imageId) { setMeta(null); return; }
    setLoading(true);
    // Mock: 实际从 imageLoader.imageIdToURI 加载
    const t = setTimeout(() => {
      setMeta({
        imageId,
        rows: 512,
        columns: 512,
        windowCenter: 40,
        windowWidth: 400,
        sliceThickness: 1.0,
        pixelSpacing: [0.5, 0.5],
        bitsAllocated: 16,
      });
      setLoading(false);
    }, 100);
    return () => clearTimeout(t);
  }, [imageId]);
  return { meta, loading };
}
