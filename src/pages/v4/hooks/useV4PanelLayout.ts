import { useState, useCallback, useEffect } from "react";
import type { V4Layout } from "../types";
import { v4Storage } from "../utils/v4Storage";

const LAYOUT_KEY = "v4_layout";

const DEFAULT_LAYOUT: V4Layout = {
  leftWidth: 25,
  centerWidth: 50,
  rightWidth: 25,
  leftCollapsed: false,
  rightCollapsed: false,
  rightDrawerOpen: false,
  activeDrawer: "ai",
  mode: "desktop",
  topBarCollapsed: false,
  bottomStripVisible: true,
};

export function useV4PanelLayout() {
  const [layout, setLayout] = useState<V4Layout>(() => {
    return v4Storage.getItem<V4Layout>(LAYOUT_KEY) || DEFAULT_LAYOUT;
  });

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      let mode: V4Layout["mode"] = "desktop";
      if (w < 768) mode = "mobile";
      else if (w < 1024) mode = "tablet";
      if (mode !== layout.mode) {
        setLayout((l) => ({ ...l, mode }));
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [layout.mode]);

  const save = useCallback((l: V4Layout) => {
    v4Storage.setItem(LAYOUT_KEY, l);
  }, []);

  const setLeftWidth = useCallback(
    (w: number) => {
      setLayout((l) => {
        const next = { ...l, leftWidth: w };
        save(next);
        return next;
      });
    },
    [save],
  );

  const setCenterWidth = useCallback(
    (w: number) => {
      setLayout((l) => {
        const next = { ...l, centerWidth: w };
        save(next);
        return next;
      });
    },
    [save],
  );

  const setRightWidth = useCallback(
    (w: number) => {
      setLayout((l) => {
        const next = { ...l, rightWidth: w };
        save(next);
        return next;
      });
    },
    [save],
  );

  const setLeftCollapsed = useCallback(
    (v: boolean) => {
      setLayout((l) => {
        const next = { ...l, leftCollapsed: v };
        save(next);
        return next;
      });
    },
    [save],
  );

  const setRightCollapsed = useCallback(
    (v: boolean) => {
      setLayout((l) => {
        const next = { ...l, rightCollapsed: v };
        save(next);
        return next;
      });
    },
    [save],
  );

  const toggleDrawer = useCallback(
    (key: string) => {
      setLayout((l) => {
        const open = l.activeDrawer === key ? !l.rightDrawerOpen : true;
        const next = { ...l, rightDrawerOpen: open, activeDrawer: key };
        save(next);
        return next;
      });
    },
    [save],
  );

  const closeDrawer = useCallback(() => {
    setLayout((l) => {
      const next = { ...l, rightDrawerOpen: false };
      save(next);
      return next;
    });
  }, [save]);

  const setTopBarCollapsed = useCallback(
    (v: boolean) => {
      setLayout((l) => {
        const next = { ...l, topBarCollapsed: v };
        save(next);
        return next;
      });
    },
    [save],
  );

  const setBottomStripVisible = useCallback(
    (v: boolean) => {
      setLayout((l) => {
        const next = { ...l, bottomStripVisible: v };
        save(next);
        return next;
      });
    },
    [save],
  );

  return {
    ...layout,
    setLeftWidth,
    setCenterWidth,
    setRightWidth,
    setLeftCollapsed,
    setRightCollapsed,
    toggleDrawer,
    closeDrawer,
    setTopBarCollapsed,
    setBottomStripVisible,
  };
}
