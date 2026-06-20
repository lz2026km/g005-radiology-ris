import { useState, useCallback } from "react";
import { SNIPPETS_DATA } from "../data/v4MockData";

export function useV4Snippets() {
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<
    "findings" | "impression" | "recommendation"
  >("findings");

  const snippets = SNIPPETS_DATA[section] || [];
  const filtered = search
    ? snippets.filter((s) => s.includes(search))
    : snippets;

  const insertSnippet = useCallback(
    (snippet: string, onInsert: (text: string) => void) => {
      const resolved = snippet.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const map: Record<string, string> = {
          size: "10mm",
          type: "结节",
          margin: "清晰",
        };
        return map[key] || key;
      });
      onInsert(resolved);
    },
    [],
  );

  return {
    search,
    setSearch,
    section,
    setSection,
    filtered,
    snippets,
    insertSnippet,
  };
}
