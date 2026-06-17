import { useState, useCallback } from 'react';
import { exportReport, downloadExport, type ExportFormat, type ExportResult } from '../services/exportService';

export function useExport() {
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  const handleExport = useCallback(async (reportId: string, format: ExportFormat) => {
    setExporting(true);
    try {
      const result = await exportReport({ format, reportId });
      setExportResult(result);
      if (result.success) {
        await downloadExport(result);
      }
      return result;
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, exportResult, handleExport };
}
