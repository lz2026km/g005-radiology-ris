import type { PatientDoseRecord } from "./types";

export const getAlertBadge = (level: string) => {
  if (level === "critical")
    return { bg: "#fef2f2", color: "#dc2626", label: "危", border: "#fecaca" };
  if (level === "warning")
    return { bg: "#fffbeb", color: "#d97706", label: "警", border: "#fde68a" };
  return { bg: "#f0fdf4", color: "#16a34a", label: "正", border: "#bbf7d0" };
};

export const exportDoseDataToCSV = (
  data: PatientDoseRecord[],
  filename: string = "dose_records.csv",
) => {
  const headers = [
    "记录ID", "患者ID", "患者姓名", "性别", "年龄", "设备类型", "检查项目",
    "检查日期", "剂量类型", "剂量值", "单位", "阈值", "预警级别", "使用设备",
    "累计检查次数", "累计DLP",
  ];
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      [
        row.id, row.patientId, row.patientName, row.gender, row.age,
        row.modality, row.examItem, row.examDate, row.doseType, row.doseValue,
        row.doseUnit, row.threshold, row.alertLevel, row.device, row.examCount,
        row.cumulativeDLP,
      ].join(","),
    ),
  ].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
