// ============================================================
// RADS 通用类型定义
// ============================================================

export type RadsSystem =
  | 'BI-RADS' | 'Lung-RADS' | 'PI-RADS' | 'TI-RADS' | 'LI-RADS'
  | 'O-RADS' | 'C-RADS' | 'CAD-RADS' | 'NI-RADS' | 'VI-RADS' | 'Bone-RADS';

export interface RadsDescriptor {
  term: string;
  definition: string;
  synonyms?: string[];
  category?: string;
}

export interface RadsCategory {
  code: string;
  name: string;
  description: string;
  riskPercent?: string;
  recommendation: string;
  isActionable: boolean;
}

export interface RadsScoringResult {
  category: string;
  categoryName: string;
  score: number;
  riskLevel: 'very-low' | 'low' | 'intermediate' | 'high' | 'very-high';
  recommendation: string;
  details: string;
  modifiers?: string[];
}

export interface RadsReportSnippet {
  category: string;
  findingTemplate: string;
  impressionTemplate: string;
  recommendationTemplate: string;
}
