// ============================================================
// G005 放射RIS系统 v2.0.0 - DB 种子数据
// Phase R8 W6-D: 把现有 mock 数据导入 IndexedDB
// ============================================================

import { db, reportsRepo, patientsRepo, phrasesRepo, templatesRepo } from './schema';
import { extendedReportMock } from '../data/reportSubsystemMock';
import { REPORT_PHRASES } from '../data/phrases';
import { STRUCTURED_FIELD_TEMPLATES } from '../data/structuredFieldTemplates';
import { auditRepo } from './schema';

export async function seedIfEmpty(): Promise<{ inserted: boolean; counts: { reports: number; phrases: number; templates: number; patients: number } }> {
  const [reportCount, phraseCount, templateCount, patientCount] = await Promise.all([
    db.reports.count(),
    db.phrases.count(),
    db.templates.count(),
    db.patients.count(),
  ]);

  const counts = { reports: reportCount, phrases: phraseCount, templates: templateCount, patients: patientCount };
  if (reportCount > 0 || phraseCount > 0 || templateCount > 0) {
    return { inserted: false, counts };
  }

  // 导入报告
  const reports = extendedReportMock.map((r: any) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: r.patientName,
    modality: r.modality,
    bodyPart: r.bodyPart,
    status: r.status,
    doctorId: r.doctorId,
    doctorName: r.doctorName,
    priority: r.priority,
    content: r.content || '',
    plainText: r.plainText || '',
    structuredValues: r.structuredValues || {},
    measurements: r.measurements || [],
    isCritical: r.isCritical || false,
    isDraft: r.isDraft || false,
    createdAt: r.createdAt || new Date().toISOString(),
    updatedAt: r.updatedAt || new Date().toISOString(),
    signedAt: r.signedAt,
    signedBy: r.signedBy,
    reviewedBy: r.reviewedBy,
    qualityScore: r.qualityScore,
    qualityGrade: r.qualityGrade,
  }));
  if (reports.length > 0) await db.reports.bulkPut(reports);

  // 导入短语
  const phrases = REPORT_PHRASES.map(p => ({
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category,
    modality: p.modality?.[0],
    bodyPart: p.bodyPart?.[0],
    usageCount: p.usageCount || 0,
    rating: p.rating || 0,
    tags: p.tags,
    author: p.author,
    createdAt: p.createdAt,
  }));
  if (phrases.length > 0) await db.phrases.bulkPut(phrases);

  // 导入模板
  const templates = STRUCTURED_FIELD_TEMPLATES.map(t => ({
    id: t.id,
    name: t.name,
    modality: t.modality,
    bodyPart: t.bodyPart,
    fields: t.fields,
    isShared: true,
    authorId: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  if (templates.length > 0) await db.templates.bulkPut(templates);

  // 审计日志：种子数据初始化
  await auditRepo.append({
    ts: new Date().toISOString(),
    userId: 'system',
    userName: '系统',
    action: 'seed',
    entityType: 'database',
    entityId: 'initial',
    details: { reports: reports.length, phrases: phrases.length, templates: templates.length },
  });

  return {
    inserted: true,
    counts: {
      reports: reports.length,
      phrases: phrases.length,
      templates: templates.length,
      patients: patientCount,
    },
  };
}
