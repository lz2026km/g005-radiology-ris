export interface V4Report {
  id: string;
  patientId: string;
  patientName: string;
  modality: "CT" | "MR" | "DR" | "US" | "MG";
  bodyPart: string;
  status: "draft" | "pending" | "signed" | "submitted";
  content: V4ReportContent;
  structured: V4StructuredData;
  templateId: string;
  version: number;
  createdAt: number;
  updatedAt: number;
}

export interface V4ReportContent {
  findings: string;
  impression: string;
  recommendation: string;
  images: V4ImageRef[];
  wordCount: number;
  charCount: number;
  paragraphCount: number;
}

export interface V4ImageRef {
  id: string;
  thumbnailUrl: string;
  description: string;
  starred: boolean;
}

export interface V4FieldValue {
  value: string | number | boolean | string[];
  unit?: string;
}

export interface V4StructuredData {
  templateId: string;
  fields: Record<string, V4FieldValue>;
  score: number;
  checklist: { id: string; label: string; passed: boolean }[];
}

export interface V4Layout {
  leftWidth: number;
  centerWidth: number;
  rightWidth: number;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  rightDrawerOpen: boolean;
  activeDrawer: string;
  mode: "desktop" | "tablet" | "mobile";
  topBarCollapsed: boolean;
  bottomStripVisible: boolean;
}

export interface V4Draft {
  id: string;
  content: V4ReportContent;
  structured: V4StructuredData;
  timestamp: number;
  versionLabel: string;
  autoSaved: boolean;
}

export interface V4PriorReport {
  id: string;
  reportId: string;
  studyDate: string;
  findings: string;
  impression: string;
  comparisonDelta?: { summary: string };
}

export interface V4SimilarCase {
  id: string;
  reportId: string;
  impression: string;
  similarityScore: number;
}

export interface V4Collaborator {
  name: string;
  role: string;
  status: "online" | "offline" | "busy";
  lastActive: string;
}
