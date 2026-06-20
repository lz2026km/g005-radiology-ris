import { useState, useMemo } from "react";

interface ComplianceScore {
  overall: number;
  completeness: number;
  termConsistency: number;
  criticalValues: number;
  templateMatch: number;
}

const RULES = [
  { id: "patient", label: "患者信息完整性", weight: 15 },
  { id: "bodypart", label: "检查部位覆盖", weight: 15 },
  { id: "findings", label: "所见/诊断一致性", weight: 20 },
  { id: "terms", label: "术语标准化", weight: 15 },
  { id: "critical", label: "危急值标注", weight: 20 },
  { id: "measure", label: "测量数据完整性", weight: 15 },
];

export function useV4Compliance(
  checklist: { id: string; label: string; passed: boolean }[],
) {
  const [criticalAlert, setCriticalAlert] = useState(false);

  const score = useMemo<ComplianceScore>(() => {
    const totalWeight = RULES.reduce((s, r) => s + r.weight, 0);
    const passedWeight = RULES.reduce((s, r) => {
      const found = checklist.find((c) => c.id === r.id);
      return s + (found?.passed ? r.weight : 0);
    }, 0);
    const completeness = Math.round(
      (checklist.filter((c) => c.passed).length / checklist.length) * 100,
    );
    return {
      overall: Math.round((passedWeight / totalWeight) * 100),
      completeness,
      termConsistency: checklist.find((c) => c.id === "terms")?.passed
        ? 100
        : 60,
      criticalValues: checklist.find((c) => c.id === "critical")?.passed
        ? 100
        : 0,
      templateMatch: completeness > 70 ? 90 : 50,
    };
  }, [checklist]);

  return { score, criticalAlert, setCriticalAlert, RULES };
}
