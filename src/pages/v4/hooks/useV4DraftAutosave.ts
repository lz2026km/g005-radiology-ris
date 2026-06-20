import { useState, useEffect } from "react";

export function useV4DraftAutosave(isDirty: boolean, onSave: () => void) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("saved");

  useEffect(() => {
    if (!isDirty) {
      setStatus("saved");
      return;
    }
    setStatus("idle");
    const timer = setTimeout(() => {
      setStatus("saving");
      setTimeout(() => {
        onSave();
        setStatus("saved");
      }, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isDirty, onSave]);

  return status;
}
