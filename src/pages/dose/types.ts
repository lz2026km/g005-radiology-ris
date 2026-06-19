export interface PatientDoseRecord {
  id: string;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  modality: string;
  examItem: string;
  examDate: string;
  doseType: string;
  doseValue: number;
  doseUnit: string;
  alertLevel: "normal" | "warning" | "critical";
  threshold: number;
  device: string;
  examCount: number;
  cumulativeDLP: number;
  isPediatric?: boolean;
  pediatricAgeGroup?: string;
}

export interface DeviceDoseData {
  device: string;
  todayDLP: number;
  todayCTDI: number;
  todayDAP: number;
  alertCount: number;
  status: "normal" | "warning" | "critical";
  examCount: number;
  utilizationRate: number;
  avgCTDI: number;
  maxCTDI: number;
}

export interface DoseAlert {
  id: string;
  patientName: string;
  modality: string;
  examItem: string;
  doseValue: number;
  threshold: number;
  alertLevel: "critical" | "warning";
  device: string;
  time: string;
  status: "pending" | "acknowledged";
  notes?: string;
}

export interface CumulativeStats {
  totalPatientsToday: number;
  highDosePatients: number;
  totalDLPToday: number;
  doseAlertsToday: number;
  averageDLP: { CT: number; DR: number; DSA: number; MG: number };
  totalExamCount: number;
  criticalAlerts: number;
  warningAlerts: number;
  deviceOnlineCount: number;
  averageCTDIvol: number;
  doseReductionRate: number;
}
