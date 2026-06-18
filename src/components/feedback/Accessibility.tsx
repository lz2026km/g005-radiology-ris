import React, { useEffect, useRef, useState } from "react";

export function SkipLink({ mainId = "main-content" }: { mainId?: string }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <a
      href={`#${mainId}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        position: "absolute",
        top: isFocused ? 0 : "-100%",
        left: 0,
        zIndex: 9999,
        padding: "8px 16px",
        background: "#1e40af",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        borderRadius: "0 0 4px 0",
        outline: "none",
      }}
    >
      跳过导航，进入主要内容
    </a>
  );
}

export function LiveRegion({
  message,
  children,
}: {
  message?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {message || children}
    </div>
  );
}

export function FocusTrap({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const container = containerRef.current;
    if (!container) return;

    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(selector));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const focusable = getFocusable();
    if (focusable[0]) focusable[0].focus();

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return <div ref={containerRef}>{children}</div>;
}
