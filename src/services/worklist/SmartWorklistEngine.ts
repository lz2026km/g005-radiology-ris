/**
 * G005 RIS v3.0.6.6 - Smart Worklist Engine
 * 100 点升级 - InteleRAD Clario 等价智能工作列表
 */

import type { RadiologyExam } from '../../types';
import type { PriorityScore } from '../../types/workflow';
import { AIPriorityScorer, aiPriorityScorer, type ScoringStudyInput } from './AIPriorityScorer';

export interface RankedStudy {
  exam: RadiologyExam;
  score: PriorityScore;
  rank: number;
}

export interface SmartWorklistOptions {
  weights?: {
    acuity?: number;
    sla?: number;
    wait?: number;
    workload?: number;
  };
  siteId?: string;
  modality?: string;
  limit?: number;
}

export class SmartWorklistEngine {
  private readonly scorer: AIPriorityScorer;
  private readonly weights: Required<NonNullable<SmartWorklistOptions['weights']>>;

  constructor(scorer: AIPriorityScorer = aiPriorityScorer) {
    this.scorer = scorer;
    this.weights = {
      acuity: 0.45,
      sla: 0.3,
      wait: 0.15,
      workload: 0.1,
    };
  }

  configureWeights(weights: NonNullable<SmartWorklistOptions['weights']>): void {
    this.weights.acuity = weights.acuity ?? this.weights.acuity;
    this.weights.sla = weights.sla ?? this.weights.sla;
    this.weights.wait = weights.wait ?? this.weights.wait;
    this.weights.workload = weights.workload ?? this.weights.workload;
  }

  toScoringInput(exam: RadiologyExam): ScoringStudyInput {
    const createdMs = Date.parse(exam.createdTime);
    const waitingMinutes = Number.isFinite(createdMs)
      ? Math.max(0, Math.floor((Date.now() - createdMs) / 60000))
      : 0;
    return {
      id: exam.id,
      modality: exam.modality,
      bodyPart: exam.bodyPart,
      priority: exam.priority,
      patientType: exam.patientType,
      age: exam.age,
      waitingMinutes,
      criticalFinding: exam.criticalFinding ?? false,
      historyCount: 0,
      workloadRatio: 0.55,
      slaRemainingMinutes: Math.max(0, 60 - waitingMinutes),
      isInpatient: exam.patientType === '住院',
      scheduledTime: exam.examTime,
    };
  }

  score(exam: RadiologyExam): PriorityScore {
    return this.scorer.score(this.toScoringInput(exam));
  }

  scoreMany(exams: RadiologyExam[]): PriorityScore[] {
    return exams.map((exam) => this.score(exam));
  }

  getRanked(exams: RadiologyExam[], options: SmartWorklistOptions = {}): RankedStudy[] {
    let working = exams;
    if (options.siteId) working = working.filter((e) => (e.roomId ?? '').startsWith(options.siteId!));
    if (options.modality) working = working.filter((e) => e.modality === options.modality);

    const ranked: RankedStudy[] = working.map((exam) => {
      const raw = this.score(exam);
      const adjustedScore =
        raw.features.acuityScore * this.weights.acuity +
        raw.features.slaScore * this.weights.sla +
        raw.features.waitScore * this.weights.wait +
        raw.features.workloadScore * this.weights.workload;
      const score: PriorityScore = { ...raw, score: Math.round(adjustedScore * 10) / 10 };
      return { exam, score, rank: 0 };
    });

    ranked.sort((a, b) => b.score.score - a.score.score);
    ranked.forEach((item, idx) => {
      item.rank = idx + 1;
    });
    if (options.limit && options.limit > 0) return ranked.slice(0, options.limit);
    return ranked;
  }
}

export const smartWorklistEngine = new SmartWorklistEngine();