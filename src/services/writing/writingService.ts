/**
 * G005 放射RIS系统 v3.0.5.1 - R3.WRITING 书写模块 Service
 * 结构化字段 / 富文本 / AI 草稿 / 语音 / 影像锚定 / 模板 / 短语库 / RadLex / 草稿
 */

import type {
  StructuredTemplate, StructuredFieldDefinition, RecistResponse, RecistTargetLesion,
  BiradsAssessment, BiradsFinding, PiradsAssessment, PiradsScore,
  RichEditorDocument, AiDraftRequest, AiDraftResult, AiDraftStage,
  VoiceDictationSession, VoiceDictationState,
  ImageAnchor,
  Phrase, RadLexTerm,
  PriorReport, SimilarCase,
  ReportDraft, DraftVersionStrategy,
  ReportTemplate, TemplateCategory,
  WritingMetrics, PreSubmitScore,
  MultiModalityPanel,
  KeywordHighlight,
  ReportWritingContext,
} from '@types/R3/R3.WRITING';
import {
  RECIST_TEMPLATE, BIRADS_TEMPLATE, PIRADS_TEMPLATE, ALL_STRUCTURED_TEMPLATES,
  RECIST_LESIONS, RECIST_RESPONSE, BIRADS_CATEGORY_MAP, BIRADS_FINDINGS, PIRADS_ASSESSMENT,
  RICH_DOCUMENT_MOCK, AI_DRAFT_REQUEST, AI_DRAFT_RESULT, VOICE_DICTATION_MOCK,
  IMAGE_ANCHORS_MOCK, PHRASES_MOCK, RADLEX_TERMS_MOCK,
  PRIOR_REPORTS_MOCK, SIMILAR_CASES_MOCK,
  REPORT_DRAFTS_MOCK, REPORT_TEMPLATES_MOCK, TEMPLATE_CATEGORIES_MOCK,
  WRITING_METRICS_MOCK, PRE_SUBMIT_SCORE_MOCK, MULTI_MODALITY_MOCK, KEYWORD_HIGHLIGHTS_MOCK,
  REPORT_WRITING_CONTEXT_MOCK,
} from '@data/reportWritingMock';

const SIM_LATENCY_MS = 100;

// ============================================================
// 1. 模板加载
// ============================================================
export async function getStructuredTemplate(id: StructuredTemplate['id']): Promise<StructuredTemplate | null> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return ALL_STRUCTURED_TEMPLATES.find((t) => t.id === id) ?? null;
}

export async function listStructuredTemplates(): Promise<StructuredTemplate[]> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return ALL_STRUCTURED_TEMPLATES;
}

export async function listTemplateCategories(): Promise<TemplateCategory[]> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return TEMPLATE_CATEGORIES_MOCK;
}

export async function listReportTemplates(category?: string): Promise<ReportTemplate[]> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return category ? REPORT_TEMPLATES_MOCK.filter((t) => t.category === category) : REPORT_TEMPLATES_MOCK;
}

export async function getReportTemplate(id: string): Promise<ReportTemplate | null> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return REPORT_TEMPLATES_MOCK.find((t) => t.id === id) ?? null;
}

export async function cloneTemplate(id: string, newName: string): Promise<ReportTemplate | null> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  const src = REPORT_TEMPLATES_MOCK.find((t) => t.id === id);
  if (!src) return null;
  return { ...src, id: `tpl-clone-${Date.now()}`, name: newName, version: '0.1.0', useCount: 0, rating: 0, approved: false };
}

export async function diffTemplates(idA: string, idB: string): Promise<{ red: string; green: string } | null> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return {
    red: '<p>右肺下叶基底段见一斑片状高密度影,边界模糊。</p>',
    green: '<p>右肺下叶基底段见一斑片状稍高密度影,边缘略模糊。</p>',
  };
}

// ============================================================
// 2. RECIST 1.1
// ============================================================
export async function getRecistLesions(reportId: string): Promise<RecistTargetLesion[]> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return RECIST_LESIONS;
}

export async function getRecistResponse(reportId: string): Promise<RecistResponse> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return RECIST_RESPONSE;
}

export function calcRecistResponse(lesions: RecistTargetLesion[]): RecistResponse {
  const sumOfDiameters = lesions.reduce((acc, l) => acc + l.longDiameterMm, 0);
  const baselineSum = lesions.reduce((acc, l) => acc + (l.baselineMm ?? l.longDiameterMm), 0);
  const percentChange = ((sumOfDiameters - baselineSum) / baselineSum) * 100;
  let category: RecistResponse['category'] = 'SD';
  if (percentChange <= -30) category = 'PR';
  if (percentChange <= -100 && lesions.every((l) => l.longDiameterMm === 0)) category = 'CR';
  if (percentChange >= 20) category = 'PD';
  return {
    category,
    categoryLabel: ({ CR: '完全缓解', PR: '部分缓解', SD: '疾病稳定', PD: '疾病进展', NE: '无法评估' } as const)[category],
    categoryLabelEn: ({ CR: 'Complete Response', PR: 'Partial Response', SD: 'Stable Disease', PD: 'Progressive Disease', NE: 'Not Evaluable' } as const)[category],
    sumOfDiameters, baselineSum, percentChange,
    confirmedAt: new Date().toISOString(), confirmedBy: '陈医师', notes: '',
  };
}

// ============================================================
// 3. BI-RADS
// ============================================================
export async function getBiradsAssessment(reportId: string): Promise<{ assessment: BiradsAssessment; findings: BiradsFinding[] }> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return { assessment: BIRADS_CATEGORY_MAP['4B'], findings: BIRADS_FINDINGS };
}

export function getBiradsByCategory(c: BiradsAssessment['category']): BiradsAssessment {
  return BIRADS_CATEGORY_MAP[c];
}

// ============================================================
// 4. PI-RADS
// ============================================================
export async function getPiradsAssessment(reportId: string): Promise<PiradsAssessment> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return PIRADS_ASSESSMENT;
}

export function calcPiradsOverall(lesions: PiradsAssessment['findings']): PiradsScore {
  if (lesions.length === 0) return 1 as PiradsScore;
  return lesions.reduce((max, l) => Math.max(max, l.t2w, l.dwi), 1) as PiradsScore;
}

// ============================================================
// 5. 富文本编辑器
// ============================================================
export async function getRichDocument(reportId: string): Promise<RichEditorDocument> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return { ...RICH_DOCUMENT_MOCK, reportId };
}

export async function saveRichDocument(doc: RichEditorDocument): Promise<RichEditorDocument> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return { ...doc, lastEditedAt: new Date().toISOString(), autoSaveAt: new Date().toISOString() };
}

export async function autoSaveDocument(reportId: string, html: string, plainText: string): Promise<{ success: boolean; savedAt: string; version: number }> {
  await new Promise((r) => setTimeout(r, 30));
  return { success: true, savedAt: new Date().toISOString(), version: Math.floor(Math.random() * 100) };
}

export function countWords(text: string): number {
  return text.replace(/\s/g, '').length;
}

export function countParagraphs(text: string): number {
  return text.split(/\n+/).filter(Boolean).length;
}

export function readingTime(text: string, wordsPerMin = 300): number {
  return Math.ceil(countWords(text) / wordsPerMin);
}

// ============================================================
// 6. AI 草稿
// ============================================================
export async function generateAiDraft(req: AiDraftRequest): Promise<AiDraftResult> {
  await new Promise((r) => setTimeout(r, 1500));
  return {
    ...AI_DRAFT_RESULT,
    id: `aidraft-${req.reportId}-${Date.now()}`,
    reportId: req.reportId,
    generatedAt: new Date().toISOString(),
    style: req.style,
  };
}

export async function getAiDraftStatus(reportId: string): Promise<{ stage: AiDraftStage; progress: number }> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return { stage: 'ready', progress: 100 };
}

// ============================================================
// 7. 语音听写
// ============================================================
export async function startVoiceDictation(reportId: string, lang: 'zh-CN' | 'en-US' = 'zh-CN'): Promise<VoiceDictationSession> {
  await new Promise((r) => setTimeout(r, 200));
  return { ...VOICE_DICTATION_MOCK, reportId, lang, state: 'listening', startedAt: new Date().toISOString() };
}

export async function pauseVoiceDictation(id: string): Promise<{ state: VoiceDictationState }> {
  await new Promise((r) => setTimeout(r, 50));
  return { state: 'paused' };
}

export async function resumeVoiceDictation(id: string): Promise<{ state: VoiceDictationState }> {
  await new Promise((r) => setTimeout(r, 50));
  return { state: 'listening' };
}

export async function stopVoiceDictation(id: string): Promise<{ state: VoiceDictationState; durationSec: number; totalWords: number }> {
  await new Promise((r) => setTimeout(r, 100));
  return { state: 'idle', durationSec: 120, totalWords: 78 };
}

export async function getVoiceDictationHistory(reportId: string): Promise<VoiceDictationSession['history']> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return VOICE_DICTATION_MOCK.history;
}

// ============================================================
// 8. 影像锚定
// ============================================================
export async function getImageAnchors(reportId: string): Promise<ImageAnchor[]> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return IMAGE_ANCHORS_MOCK.filter((a) => a.reportId === reportId);
}

export async function pinImageAnchor(id: string, userId: string): Promise<ImageAnchor | null> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  const anchor = IMAGE_ANCHORS_MOCK.find((a) => a.id === id);
  if (!anchor) return null;
  return { ...anchor, pinnedBy: userId, pinnedAt: new Date().toISOString() };
}

export async function uploadImageToReport(reportId: string, file: { name: string; size: number; data: string }): Promise<{ id: string; url: string }> {
  await new Promise((r) => setTimeout(r, 500));
  return { id: `img-${Date.now()}`, url: `/uploads/${reportId}/${file.name}` };
}

// ============================================================
// 9. 短语库 / RadLex
// ============================================================
export async function searchPhrases(query: string, category?: string, modality?: string): Promise<Phrase[]> {
  await new Promise((r) => setTimeout(r, 50));
  const q = query.trim().toLowerCase();
  return PHRASES_MOCK.filter((p) => {
    const matchQ = !q || p.content.toLowerCase().includes(q) || p.contentEn.toLowerCase().includes(q) || (p.pinyin?.toLowerCase().includes(q) ?? false) || (p.pinyinInitials?.toLowerCase().includes(q) ?? false);
    const matchC = !category || p.category === category;
    const matchM = !modality || p.modality.includes(modality);
    return matchQ && matchC && matchM;
  });
}

export async function togglePhraseFavorite(id: string): Promise<{ favorite: boolean }> {
  await new Promise((r) => setTimeout(r, 50));
  const phrase = PHRASES_MOCK.find((p) => p.id === id);
  return { favorite: !phrase?.favorite };
}

export async function createPhrase(phrase: Omit<Phrase, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<Phrase> {
  await new Promise((r) => setTimeout(r, 100));
  return {
    ...phrase,
    id: `p-${Date.now()}`,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function searchRadLex(query: string): Promise<RadLexTerm[]> {
  await new Promise((r) => setTimeout(r, 50));
  const q = query.trim().toLowerCase();
  if (!q) return RADLEX_TERMS_MOCK.slice(0, 5);
  return RADLEX_TERMS_MOCK.filter((t) =>
    t.preferredName.toLowerCase().includes(q) ||
    t.preferredNameEn.toLowerCase().includes(q) ||
    t.synonyms.some((s) => s.toLowerCase().includes(q))
  );
}

// ============================================================
// 10. 历史报告 / 相似病例
// ============================================================
export async function getPriorReports(patientId: string): Promise<PriorReport[]> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return PRIOR_REPORTS_MOCK.filter((r) => r.patientId === patientId);
}

export async function getSimilarCases(reportId: string, topK = 5): Promise<SimilarCase[]> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return SIMILAR_CASES_MOCK.slice(0, topK);
}

export async function compareReports(reportIdA: string, reportIdB: string): Promise<{ added: string[]; removed: string[]; changed: { line: string; type: 'added' | 'removed' | 'modified' }[] }> {
  await new Promise((r) => setTimeout(r, 100));
  return {
    added: ['建议 3-6 个月后复查', 'PET-CT 检查'],
    removed: ['病灶较前缩小'],
    changed: [
      { line: '右肺上叶尖段见一不规则形软组织密度结节,大小约 18mm×15mm', type: 'modified' },
    ],
  };
}

// ============================================================
// 11. 草稿
// ============================================================
export async function listDrafts(reportId: string): Promise<ReportDraft[]> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return REPORT_DRAFTS_MOCK.filter((d) => d.reportId === reportId);
}

export async function saveDraft(draft: Omit<ReportDraft, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<ReportDraft> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    ...draft,
    id: `draft-${Date.now()}`,
    version: (REPORT_DRAFTS_MOCK.find((d) => d.reportId === draft.reportId)?.version ?? 0) + 1,
    versionLabel: `v${(REPORT_DRAFTS_MOCK.find((d) => d.reportId === draft.reportId)?.version ?? 0) + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteDraft(id: string): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 100));
  return { success: true };
}

export async function resolveConflict(localDraftId: string, remoteDraftId: string, strategy: DraftVersionStrategy): Promise<{ success: boolean; mergedId?: string }> {
  await new Promise((r) => setTimeout(r, 200));
  return { success: true, mergedId: localDraftId };
}

// ============================================================
// 12. 书写度量 / 预评分
// ============================================================
export async function getWritingMetrics(reportId: string): Promise<WritingMetrics> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return { ...WRITING_METRICS_MOCK, reportId };
}

export async function getPreSubmitScore(reportId: string): Promise<PreSubmitScore> {
  await new Promise((r) => setTimeout(r, 300));
  return { ...PRE_SUBMIT_SCORE_MOCK, reportId, createdAt: new Date().toISOString() };
}

// ============================================================
// 13. 多模态 / 关键字高亮
// ============================================================
export async function getMultiModality(reportId: string): Promise<MultiModalityPanel | null> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return MULTI_MODALITY_MOCK;
}

export async function getKeywords(): Promise<KeywordHighlight[]> {
  await new Promise((r) => setTimeout(r, 50));
  return KEYWORD_HIGHLIGHTS_MOCK;
}

// ============================================================
// 14. 主聚合
// ============================================================
export async function getWritingContext(reportId: string): Promise<ReportWritingContext> {
  await new Promise((r) => setTimeout(r, SIM_LATENCY_MS));
  return { ...REPORT_WRITING_CONTEXT_MOCK, reportId };
}

export async function submitReport(reportId: string, payload: { finalScore: number; structured: Record<string, unknown>; html: string }): Promise<{ success: boolean; submittedAt: string; nextState: string }> {
  await new Promise((r) => setTimeout(r, 500));
  return { success: true, submittedAt: new Date().toISOString(), nextState: 'submitted' };
}

// ============================================================
// 15. 拼写/语法检查(基础 mock)
// ============================================================
export async function spellCheck(text: string, lang: 'zh-CN' | 'en-US'): Promise<{ start: number; end: number; suggestion: string; type: 'spelling' | 'grammar' | 'punctuation' }[]> {
  await new Promise((r) => setTimeout(r, 100));
  const issues: { start: number; end: number; suggestion: string; type: 'spelling' | 'grammar' | 'punctuation' }[] = [];
  const t = text;
  if (lang === 'en-US') {
    const m = /\b(teh|recieve|seperate|definately)\b/gi;
    let match: RegExpExecArray | null;
    while ((match = m.exec(t)) !== null) {
      issues.push({ start: match.index, end: match.index + match[0].length, suggestion: match[0].replace(/^./, (c) => c.toLowerCase()).replace('teh', 'the').replace('recieve', 'receive').replace('seperate', 'separate').replace('definately', 'definitely'), type: 'spelling' });
    }
  }
  return issues;
}

// ============================================================
// 16. 字段自动完成(RadLex 联想)
// ============================================================
export async function suggestFieldValues(fieldKey: string, query: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 50));
  return RADLEX_TERMS_MOCK
    .filter((t) => t.preferredName.toLowerCase().includes(query.toLowerCase()) || t.synonyms.some((s) => s.toLowerCase().includes(query.toLowerCase())))
    .map((t) => t.preferredName)
    .slice(0, 10);
}

// ============================================================
// 17. 公式计算
// ============================================================
export function evaluateFormula(formula: string, values: Record<string, number>): number {
  if (formula.startsWith('sum(')) {
    const keys = formula.replace(/^sum\((.*)\)$/, '$1').split('+').map((k) => k.trim());
    return keys.reduce((acc, k) => acc + (values[k] ?? 0), 0);
  }
  if (formula.includes('/') && formula.includes('*')) {
    return 0; // simplified mock
  }
  if (formula.includes('/')) {
    const [a, b] = formula.split('/').map((s) => s.trim());
    if (values[b] === 0) return 0;
    return (values[a] ?? 0) / (values[b] ?? 1);
  }
  return 0;
}

// ============================================================
// 18. 提交检查清单
// ============================================================
export const SUBMIT_CHECKLIST = [
  { id: 'cl-1', label: '患者信息完整', labelEn: 'Patient info complete', required: true },
  { id: 'cl-2', label: '检查技术描述', labelEn: 'Technique described', required: true },
  { id: 'cl-3', label: '影像所见完整', labelEn: 'Findings complete', required: true },
  { id: 'cl-4', label: '诊断意见明确', labelEn: 'Impression clear', required: true },
  { id: 'cl-5', label: '建议合理', labelEn: 'Recommendation reasonable', required: true },
  { id: 'cl-6', label: '关键图像标注', labelEn: 'Key image annotated', required: false },
  { id: 'cl-7', label: '危急值标注', labelEn: 'Critical annotated', required: false },
  { id: 'cl-8', label: '术语规范', labelEn: 'Terminology', required: true },
];

// ============================================================
// 19. 写作度量类型导出
// ============================================================
export type WritingServiceTypes = {
  Template: StructuredTemplate;
  Birads: BiradsAssessment;
  Pirads: PiradsAssessment;
  Recist: RecistResponse;
  Document: RichEditorDocument;
  AiDraft: AiDraftResult;
  Voice: VoiceDictationSession;
  Anchor: ImageAnchor;
  Phrase: Phrase;
  Draft: ReportDraft;
  TemplateType: ReportTemplate;
  Metrics: WritingMetrics;
  PreScore: PreSubmitScore;
};
