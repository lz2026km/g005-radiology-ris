import { useEffect } from "react";
import { v4KeyMap } from "../utils/v4KeyboardMap";
import type { V4ReportState, V4ReportActions } from "./useV4ReportState";

export function useV4KeyboardShortcuts(state: V4ReportState & V4ReportActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;
      const key = `${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.altKey ? "Alt+" : ""}${e.key}`;
      const action = v4KeyMap[key];
      if (action && !isInput) {
        e.preventDefault();
        action(state);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state]);
}
