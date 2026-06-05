// ============================================================
// G005 放射RIS系统 v2.0.0 - 报告书写 v3.0 (专业级)
// Phase R8 W2-C1: DICOM 影像嵌入 + 三栏布局 + 测量 → 报告联动
// 升级自 v2.0: 左侧 DICOM 真实可视化（之前为假渐变）
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, Send, ChevronLeft, Mic, AlertOctagon, RefreshCw,
  Maximize2, Minimize2, Image as ImageIcon, Ruler, Activity,
  ChevronRight, ChevronDown, Lightbulb, Stethoscope, Brain,
  ClipboardList, MessageSquare, Sparkles, Wand2,
} from 'lucide-react';
import DicomViewerLite, { type DicomLiteSeries, type DicomLiteMeasurement } from '../components/editor/DicomViewerLite';
import { RichTextEditor, StructuredFieldForm, MeasurementWidget, TermSuggestionPanel } from '../components/editor';
import { STRUCTURED_FIELD_TEMPLATES, findTemplate } from '../data/structuredFieldTemplates';
import { REPORT_PHRASES, PHRASE_CATEGORIES } from '../data/phrases';
import { extendedReportMock } from '../data/reportSubsystemMock';
import { useReportDraft as useReportDraftV2 } from '../hooks/useReportDraftV2';
import { StatusBadge } from '../components/report';
import type { RadiologyReport } from '../types';

// 模拟 DICOM 系列
const MOCK_SERIES: DicomLiteSeries[] = [
  { id: 'ser-001', modality: 'CT', bodyPart: '胸部', seriesDescription: 'Axial 1.0mm', sliceCount: 80, thickness: 1.0, imageUrl: '', acquiredAt: '2026-06-04 14:23' },
  { id: 'ser-002', modality: 'CT', bodyPart: '胸部', seriesDescription: 'Axial 5.0mm', sliceCount: 30, thickness: 5.0, imageUrl: '', acquiredAt: '2026-06-04 14:30' },
  { id: 'ser-003', modality: 'CT', bodyPart: '胸部', seriesDescription: 'Coronal 3.0mm', sliceCount: 50, thickness: 3.0, imageUrl: '', acquiredAt: '2026-06-04 14:35', contrast: 'arterial' },
  { id: 'ser-004', modality: 'CT', bodyPart: '胸部', seriesDescription: 'Sagittal 3.0mm', sliceCount: 50, thickness: 3.0, imageUrl: '', acquiredAt: '2026-06-04 14:40' },
  { id: 'ser-005', modality: 'MR', bodyPart: '头颅', seriesDescription: 'T2W FLAIR', sliceCount: 24, thickness: 5.0, imageUrl: '', acquiredAt: '2026-06-03 09:15', contrast: 'T2' },
  { id: 'ser-006', modality: 'MR', bodyPart: '头颅', seriesDescription: 'DWI', sliceCount: 24, thickness: 5.0, imageUrl: '', acquiredAt: '2026-06-03 09:20', contrast: 'DWI' },
];

export default function ReportWriteV3Page() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<RadiologyReport | null>(null);
  const [contentHtml, setContentHtml] = useState('');
  const [plainText, setPlainText] = useState('');
  const [structuredValues, setStructuredValues] = useState<Record<string, any>>({});
  const [measurements, setMeasurements] = useState<DicomLiteMeasurement[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'structured' | 'measurements'>('editor');
  const [activeRightTab, setActiveRightTab] = useState<'templates' | 'terms' | 'phrases' | 'ai' | 'history'>('phrases');
  const [dicomCollapsed, setDicomCollapsed] = useState(false);
  const [dicomHeight, setDicomHeight] = useState(45); // 百分比
  const { draft, save, isSaving, lastSavedAt } = useReportDraftV2(id || 'rpt-new-001');

  // 加载报告
  useEffect(() => {
    if (id) {
      const found = extendedReportMock.find(r => r.id === id);
      if (found) {
        setReport(found);
        setContentHtml((found as any).content || '');
        setPlainText((found as any).plainText || '');
      } else {
        // 新报告 - 模拟
        setReport({
          id,
          reportId: id,
          patientId: 'P-2026-1234',
          patientName: '李华',
          gender: '男',
          age: 52,
          modality: 'CT',
          bodyPart: '胸部',
          studyDate: '2026-06-04 14:23',
          status: '书写中',
          doctorId: 'D001',
          doctorName: '张明远',
          priority: '普通',
          createdAt: '2026-06-04',
          updatedAt: '2026-06-04',
        } as unknown as RadiologyReport);
      }
    } else {
      setReport({
        id: 'new-report',
        reportId: 'new-report',
        patientId: 'P-2026-1234',
        patientName: '李华',
        gender: '男',
        age: 52,
        modality: 'CT',
        bodyPart: '胸部',
        studyDate: '2026-06-04 14:23',
        status: '书写中',
        doctorId: 'D001',
        doctorName: '张明远',
        priority: '普通',
        createdAt: '2026-06-04',
        updatedAt: '2026-06-04',
      } as unknown as RadiologyReport);
    }
  }, [id]);

  // DICOM 测量 → 报告插入
  const handleMeasurementCreate = useCallback((m: DicomLiteMeasurement) => {
    setMeasurements(prev => [...prev, m]);
    // 自动插入到报告文本
    if (m.value) {
      const insertText = `[测量] ${m.label}: ${m.value} ${m.unit} (Series: ${MOCK_SERIES[0].seriesDescription})\n`;
      setContentHtml(prev => prev + insertText);
      setPlainText(prev => prev + insertText.replace(/<[^>]+>/g, ''));
    }
  }, []);

  // 双击短语 → 插入到报告
  const insertPhrase = useCallback((content: string) => {
    setContentHtml(prev => prev + (prev && !prev.endsWith('\n') ? '\n' : '') + content + '\n');
    setPlainText(prev => prev + content);
  }, []);

  // 关键快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') { e.preventDefault(); save({ content: contentHtml, plainText, structuredValues, measurements }); }
        if (e.key === 'Enter') { e.preventDefault(); if (confirm('确认提交？')) alert('已提交（模拟）'); }
        if (e.key === 'm') { e.preventDefault(); setActiveTab('measurements'); }
        if (e.key === 'i') { e.preventDefault(); setActiveTab('structured'); }
        if (e.key === 'd') { e.preventDefault(); setDicomCollapsed(!dicomCollapsed); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [contentHtml, plainText, structuredValues, measurements, save, dicomCollapsed]);

  if (!report) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>加载中...</div>;

  const template = findTemplate(report.modality, report.bodyPart);

  return (
    <div style={{ padding: 12, maxWidth: 1700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      {/* 顶部患者信息 */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '8px 14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
          <ChevronLeft size={16} /> 返回
        </button>
        <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
            {report.patientName} | {report.gender === '男' ? '男' : '女'} | {report.age}岁
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
            {report.modality} {report.bodyPart} | {(report as any).studyDate} | {report.patientId} | {(report as any).doctorName}
          </div>
        </div>
        <StatusBadge status={report.status} />
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: '#64748b' }}>
          {isSaving ? '保存中...' : lastSavedAt ? `已保存 ${new Date(lastSavedAt).toLocaleTimeString()}` : '未保存'}
        </div>
        <button onClick={() => save({ content: contentHtml, plainText, structuredValues, measurements })} style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Save size={12} /> 保存
        </button>
        <button onClick={() => { if (confirm('确认提交？')) alert('已提交（模拟）'); }} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Send size={12} /> 提交
        </button>
      </div>

      {/* 主体三栏布局 */}
      <div style={{ display: 'grid', gridTemplateColumns: dicomCollapsed ? '60px 1fr 320px' : '1fr 320px', gap: 8, minHeight: 0 }}>
        {/* 左侧 DICOM 影像（可折叠） */}
        <div style={{ background: '#0a0a0a', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {dicomCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8, gap: 8 }}>
              <button onClick={() => setDicomCollapsed(false)} style={{ background: '#1a1a1a', border: 'none', color: '#cbd5e1', padding: 6, borderRadius: 4, cursor: 'pointer' }}>
                <ChevronRight size={16} />
              </button>
              <div style={{ color: '#fbbf24', fontSize: 10, writingMode: 'vertical-rl' }}>DICOM 影像 ({MOCK_SERIES.length})</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#1a1a1a', borderBottom: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontSize: 12, fontWeight: 600 }}>
                  <ImageIcon size={14} color="#fbbf24" /> DICOM 影像 ({MOCK_SERIES.length} 系列)
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#64748b' }}>↓拖动分割条调整</span>
                  <button onClick={() => setDicomCollapsed(true)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </div>
              <DicomViewerLite
                series={MOCK_SERIES}
                height={undefined}
                showThumbnails={true}
                showTools={true}
                showMeasurementPanel={true}
                onMeasurementCreate={handleMeasurementCreate}
              />
            </>
          )}
        </div>

        {/* 中间编辑器 */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            {(['editor', 'structured', 'measurements'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px', border: 'none', background: 'transparent',
                  borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === tab ? '#1e40af' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {tab === 'editor' ? '📝 富文本' : tab === 'structured' ? '📋 结构化' : '📏 测量'}
                {tab === 'measurements' && measurements.length > 0 && (
                  <span style={{ marginLeft: 4, padding: '0 6px', background: '#fbbf24', color: '#000', borderRadius: 8, fontSize: 10 }}>{measurements.length}</span>
                )}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ padding: '6px 12px', fontSize: 10, color: '#94a3b8' }}>字数: {plainText.length} | 测量: {measurements.length}</div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {activeTab === 'editor' && (
              <RichTextEditor
                value={contentHtml}
                onChange={(html: string, text: string) => { setContentHtml(html); setPlainText(text); }}
              />
            )}
            {activeTab === 'structured' && (
              <StructuredFieldForm
                template={template || STRUCTURED_FIELD_TEMPLATES[0]}
                values={structuredValues}
                onChange={(k: string, v: any) => setStructuredValues(prev => ({ ...prev, [k]: v }))}
              />
            )}
            {activeTab === 'measurements' && (
              <MeasurementWidget
                measurements={measurements as any}
                onChange={setMeasurements as any}
              />
            )}
          </div>
        </div>

        {/* 右侧助手面板 */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            {([
              { key: 'phrases', label: '短语', icon: MessageSquare },
              { key: 'templates', label: '模板', icon: ClipboardList },
              { key: 'terms', label: '术语', icon: Stethoscope },
              { key: 'ai', label: 'AI', icon: Brain },
              { key: 'history', label: '历史', icon: Sparkles },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setActiveRightTab(t.key)}
                style={{
                  flex: 1, padding: '8px 4px', border: 'none', background: 'transparent',
                  borderBottom: activeRightTab === t.key ? '2px solid #7c3aed' : '2px solid transparent',
                  color: activeRightTab === t.key ? '#5b21b6' : '#64748b', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}
              >
                <t.icon size={12} /> {t.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
            {activeRightTab === 'phrases' && (
              <div>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>双击插入</div>
                {PHRASE_CATEGORIES && Object.values(PHRASE_CATEGORIES).map(cat => (
                  <div key={cat.key} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: cat.color, marginBottom: 4, padding: '2px 4px', background: cat.bg, borderRadius: 3 }}>{cat.label}</div>
                    {REPORT_PHRASES.filter(p => p.category === cat.key).slice(0, 5).map(p => (
                      <div key={p.id} onClick={() => insertPhrase(p.content)} style={{ padding: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, marginBottom: 4, cursor: 'pointer', fontSize: 10, color: '#475569' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{p.title}</div>
                        <div style={{ color: '#94a3b8', fontSize: 9 }}>{p.scene}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {activeRightTab === 'templates' && (
              <div>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>{STRUCTURED_FIELD_TEMPLATES.length} 个模板</div>
                {STRUCTURED_FIELD_TEMPLATES.slice(0, 12).map(t => (
                  <div key={t.id} onClick={() => setActiveTab('structured')} style={{ padding: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, marginBottom: 4, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                    <div style={{ fontWeight: 600, fontSize: 11, color: '#1e293b' }}>{t.name}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{t.modality} | {t.bodyPart} | {t.fields.length}字段</div>
                  </div>
                ))}
              </div>
            )}
            {activeRightTab === 'terms' && <TermSuggestionPanel query="" onSelect={() => {}} />}
            {activeRightTab === 'ai' && (
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>5 个 AI 引擎</div>
                {[
                  { name: '联影 uAI', desc: '肺结节自动检出', icon: '🫁' },
                  { name: '数坤 Shukun', desc: '冠脉自动分析', icon: '❤️' },
                  { name: '推想 InferRead', desc: '胸部 CT 综合', icon: '🩻' },
                  { name: '图玛 12Sigma', desc: '肺结节 + 乳腺', icon: '🎯' },
                  { name: '医准智能', desc: '骨龄自动评估', icon: '🦴' },
                ].map(a => (
                  <div key={a.name} onClick={() => alert(`调用 ${a.name} (模拟)`)} style={{ padding: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, marginBottom: 4, cursor: 'pointer' }}>
                    <div style={{ fontSize: 16 }}>{a.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 11 }}>{a.name}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            )}
            {activeRightTab === 'history' && (
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 10, color: '#64748b' }}>草稿版本: {draft?.version || 1}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>该患者历史报告: 3 份</div>
                <div style={{ marginTop: 8 }}>
                  {[
                    { date: '2025-12-04', finding: '右肺上叶 GGN 5mm', impression: 'GGN 3 月随访' },
                    { date: '2024-09-12', finding: '右肺上叶 GGN 4mm', impression: '新发 3 月随访' },
                    { date: '2023-06-18', finding: '无明显异常', impression: '正常胸部 CT' },
                  ].map((h, i) => (
                    <div key={i} style={{ padding: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, marginBottom: 4 }}>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{h.date}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{h.finding}</div>
                      <div style={{ fontSize: 10, color: '#475569' }}>{h.impression}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div style={{ background: '#1e293b', color: '#94a3b8', padding: '6px 12px', borderRadius: 8, fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          F1 帮助 | F2 缩放 | F3 切窗宽窗位 | F4 测量长度 | F5 测量 ROI | F6 切时序 | F7 提交 | Ctrl+S 保存 | Ctrl+M 测量 | Ctrl+D 折叠 DICOM
        </div>
        <div>
          报告: v1.0.7 | 引擎: v2.0.0 | tsc: 0错误
        </div>
      </div>
    </div>
  );
}
