import { useState, useEffect, useRef } from "react";

export function useV4FloatingToolbar() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handler = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setVisible(false);
        setPosition(null);
        setSelectedText("");
        return;
      }
      const text = selection.toString().trim();
      if (text.length < 2) {
        setVisible(false);
        return;
      }
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 48,
        });
        setVisible(true);
      }, 300);
    };

    document.addEventListener("mouseup", handler);
    document.addEventListener("keyup", handler);
    return () => {
      document.removeEventListener("mouseup", handler);
      document.removeEventListener("keyup", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const hide = () => {
    setVisible(false);
    setPosition(null);
  };

  return { position, visible, selectedText, hide };
}
