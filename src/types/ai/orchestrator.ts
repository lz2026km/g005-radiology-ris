/**
 * G005 放射RIS系统 v3.0.6.5 - AI 编排/市场/联邦/视觉/肿瘤 类型定义
 * A5-AI-ORCH / 20 点
 */

export type AIAlgorithmType =
  | 'detection'
  | 'segmentation'
  | 'classification'
  | 'quantification'
  | 'triage'
  | 'reporting'
  | 'quality'
  | 'temporal';

export type AIAlgorithmStatus = 'experimental' | 'beta' | 'stable' | 'deprecated';

export type AIAlgorithmLicense = 'mit' | 'apache-2.0' | 'proprietary' | 'research-only';

export type AIDeploymentMode = 'cloud' | 'on-premise' | 'edge' | 'hybrid';

export interface AIAlgorithm {
  id: string;
  name: string;
  vendor: string;
  type: AIAlgorithmType;
  modality: string[];
  bodyParts: string[];
  version: string;
  status: AIAlgorithmStatus;
  license: AIAlgorithmLicense;
  deployment: AIDeploymentMode;
  accuracy: number;
  sensitivity: number;
  specificity: number;
  f1Score: number;
  avgLatencyMs: number;
  pricing: { model: 'free' | 'per-call' | 'subscription'; costUsd: number };
  tags: string[];
  description: string;
  inputSchema: string[];
  outputSchema: string[];
  requiredTags: string[];
  contraindications: string[];
  installed: boolean;
  ratingAvg: number;
  ratingCount: number;
  installCount: number;
  publishedAt: string;
  updatedAt: string;
  regulatory: { fda: boolean; nmpa: boolean; ce: boolean; ceMarkClass?: string };
}

export interface AIRouteRequest {
  studyId: string;
  modality: string;
  bodyPart: string;
  clinicalHistory: string;
  priority: 'stat' | 'urgent' | 'routine';
  patient?: { age: number; gender: string; pregnancy?: boolean };
  tags?: string[];
}

export interface AIRouteDecision {
  studyId: string;
  primary: { algorithmId: string; confidence: number; reason: string };
  secondary: { algorithmId: string; confidence: number; reason: string }[];
  rejected: { algorithmId: string; reason: string }[];
  estimatedLatencyMs: number;
  policy: string;
  decidedAt: string;
}

export interface AIAlgorithmMatch {
  algorithm: AIAlgorithm;
  score: number;
  reasons: string[];
  warnings: string[];
}

export interface AIMarketplaceListing {
  algorithm: AIAlgorithm;
  rank: number;
  trending: boolean;
  featured: boolean;
  installTrend: number;
}

export interface AIMarketplaceFilter {
  type?: AIAlgorithmType;
  modality?: string;
  bodyPart?: string;
  status?: AIAlgorithmStatus;
  free?: boolean;
  minRating?: number;
  search?: string;
}

export interface AIMarketplaceInstall {
  id: string;
  algorithmId: string;
  userId: string;
  installedAt: string;
  config: Record<string, unknown>;
  status: 'active' | 'paused' | 'uninstalled';
}

export interface AIMarketplaceRating {
  id: string;
  algorithmId: string;
  userId: string;
  userName: string;
  score: number;
  comment: string;
  createdAt: string;
}

export interface AIFederatedRound {
  id: string;
  roundNumber: number;
  status: 'recruiting' | 'training' | 'aggregating' | 'completed' | 'failed';
  participants: number;
  targetParticipants: number;
  minParticipants: number;
  startedAt: string;
  completedAt?: string;
  modelVersion: string;
  globalAccuracy?: number;
  loss?: number;
  privacyBudget: number;
}

export interface AIFederatedUpdate {
  id: string;
  roundId: string;
  siteId: string;
  siteName: string;
  sampleCount: number;
  encryptedGradients: string;
  maskedNorm: number;
  uploadedAt: string;
  verified: boolean;
}

export interface AISecureAggregation {
  id: string;
  roundId: string;
  participants: number;
  threshold: number;
  status: 'collecting' | 'verifying' | 'aggregated' | 'failed';
  aggregatedAt?: string;
  noiseScale: number;
  privacyEpsilon: number;
}

export interface AIDetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AIDetectedFinding {
  id: string;
  type: 'nodule' | 'mass' | 'calcification' | 'hemorrhage' | 'infarct' | 'fracture' | 'consolidation' | 'effusion';
  label: string;
  location: string;
  bbox: AIDetectionBox;
  confidence: number;
  diameterMm?: number;
  sopInstanceUid?: string;
  seriesNumber?: number;
  instanceNumber?: number;
  srReference?: { srUid: string; conceptCode: string; codingScheme: string };
  measurements?: { type: 'length' | 'area' | 'volume' | 'density'; value: number; unit: string }[];
}

export interface AIStudyDetection {
  id: string;
  studyId: string;
  algorithmId: string;
  algorithmName: string;
  modality: string;
  bodyPart: string;
  findings: AIDetectedFinding[];
  totalFindings: number;
  reviewed: boolean;
  generatedAt: string;
  processingMs: number;
}

export interface AISegmentationMask {
  id: string;
  studyId: string;
  sopInstanceUid: string;
  algorithmId: string;
  algorithmName: string;
  prompt: string;
  classes: AISegmentationClass[];
  dimensions: { width: number; height: number; depth?: number };
  maskFormat: 'rle' | 'png' | 'nifti' | 'dicom-seg';
  diceScore: number;
  createdAt: string;
}

export interface AISegmentationClass {
  id: number;
  label: string;
  color: string;
  voxelCount: number;
  volumeMl?: number;
  boundingBox: AIDetectionBox;
}

export interface AIRecistLesion {
  id: string;
  patientId: string;
  lesionId: string;
  name: string;
  type: 'target' | 'non-target' | 'new';
  location: string;
  baseline: { studyId: string; date: string; diameterMm: number; sum: number };
  followUps: AIRecistMeasurement[];
  currentDiameter: number;
  currentSum: number;
  percentChange: number;
  responseCategory: 'CR' | 'PR' | 'SD' | 'PD' | 'NE';
  nadirDiameter: number;
}

export interface AIRecistMeasurement {
  studyId: string;
  date: string;
  diameterMm: number;
  sum: number;
  percentChangeFromBaseline: number;
  percentChangeFromNadir: number;
  reviewerId: string;
  reviewerName: string;
  confirmed: boolean;
}

export interface AIRecistComparison {
  studyAId: string;
  studyBId: string;
  newLesions: number;
  disappearedLesions: number;
  progressed: number;
  responded: number;
  stable: number;
  overallResponse: 'CR' | 'PR' | 'SD' | 'PD';
  sumChange: number;
  sumChangePercent: number;
  comparedAt: string;
}

export interface AIFeedbackEntry {
  id: string;
  algorithmId: string;
  algorithmName: string;
  studyId?: string;
  reportId?: string;
  userId: string;
  userName: string;
  verdict: 'accept' | 'reject' | 'modify';
  correction?: string;
  originalOutput?: string;
  rating: number;
  tags: string[];
  createdAt: string;
}

export interface AIFeedbackAggregate {
  algorithmId: string;
  total: number;
  acceptRate: number;
  rejectRate: number;
  modifyRate: number;
  avgRating: number;
  commonCorrections: { tag: string; count: number }[];
  byDay: { date: string; count: number; acceptRate: number }[];
}

export interface AIStreamEvent {
  id: string;
  taskId: string;
  type: 'start' | 'chunk' | 'progress' | 'complete' | 'error' | 'cancelled';
  timestamp: string;
  data?: string;
  progress?: number;
  error?: { code: string; message: string };
  usage?: { prompt: number; completion: number; total: number };
}

export interface AIStreamSubscription {
  taskId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'error';
  chunks: AIStreamEvent[];
  startedAt: string;
  completedAt?: string;
}

export interface AIModelVariant {
  id: string;
  algorithmId: string;
  name: string;
  version: string;
  trafficPercent: number;
  enabled: boolean;
  startedAt: string;
}

export interface AIModelMetrics {
  algorithmId: string;
  variantId: string;
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  driftScore: number;
  driftStatus: 'stable' | 'warning' | 'critical';
  dataDistribution: { timestamp: string; mean: number; std: number }[];
  accuracyTrend: { timestamp: string; accuracy: number }[];
  lastEvaluatedAt: string;
}

export interface AIModelABComparison {
  variantA: AIModelVariant;
  variantB: AIModelVariant;
  metricsA: AIModelMetrics;
  metricsB: AIModelMetrics;
  winner: 'A' | 'B' | 'tie';
  statisticalSignificance: number;
  recommendation: string;
  generatedAt: string;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  category: string;
  version: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  variables: { name: string; description: string; required: boolean; defaultValue?: string }[];
  exampleOutput?: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  avgRating: number;
  deprecated?: boolean;
}
