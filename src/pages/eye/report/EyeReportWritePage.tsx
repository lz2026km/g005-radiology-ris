import React, { useState } from 'react';
import { Card, Row, Col, Tag, Select, Button, Input, Tabs, Space, Badge, Collapse, Timeline, message, Radio, Divider, Alert, Tooltip } from 'antd';
import { FileText, Save, Send, Printer, Mic, Brain, Stamp, History, AlarmClock, AlertTriangle, UserCheck, Eye, CheckCircle } from 'lucide-react';
import EyeLateralityBadge from '@/components/eye/EyeLateralityBadge';
import ReportTemplateSelector from '@/components/eye/ReportTemplateSelector';
import FindingLibraryPicker from '@/components/eye/FindingLibraryPicker';
import GradingScalePicker from '@/components/eye/GradingScalePicker';
import ReportDraftPanel from '@/components/eye/ReportDraftPanel';
import { MOCK_REPORT_TEMPLATES } from '@/data/eyeReportTemplatesMock';
import { MOCK_REPORTS, MOCK_REPORT_AUDIT, MOCK_PRINT_RECORDS, MOCK_REPORT_CONSULTATIONS } from '@/data/eyeImageQcMock';
import { MOCK_FINDINGS_LIBRARY } from '@/data/eyeFindingsLibraryMock';

const reportStatusColors: Record<string, string> = { draft: 'default', pending_review: 'orange', reviewing: 'processing', published: 'green', amended: 'blue', printed: 'purple', critical_value: 'red' };
const reportStatusLabels: Record<string, string> = { draft: '草稿', pending_review: '待审核', reviewing: '审核中', published: '已发布', amended: '已修改', printed: '已打印', critical_value: '危急值' };

const EyeReportWritePage: React.FC = () => {
  const [selectedReportId, setSelectedReportId] = useState(MOCK_REPORTS[0].id);
  const report = MOCK_REPORTS.find(r => r.id === selectedReportId)!;
  const [templateId, setTemplateId] = useState(report.templateId);
  const [findings, setFindings] = useState<string[]>(report.findings);
  const [impression, setImpression] = useState(report.impression);
  const [recommendations, setRecommendations] = useState(report.recommendations);
  const [status, setStatus] = useState(report.status);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [printModal, setPrintModal] = useState(false);
  const [signModal, setSignModal] = useState(false);
  const [currentContent, setCurrentContent] = useState(report.sections.map(s => s.content).join('\n\n'));
  const [editing, setEditing] = useState('');

  const template = MOCK_REPORT_TEMPLATES.find(t => t.id === templateId);
  const findingsData = MOCK_FINDINGS_LIBRARY.filter(f => findings.includes(f.id));
  const audits = MOCK_REPORT_AUDIT.filter(a => a.reportId === selectedReportId);

  const selectReport = (id: string) => {
    const r = MOCK_REPORTS.find(x => x.id === id)!;
    setSelectedReportId(id);
    setTemplateId(r.templateId);
    setFindings(r.findings);
    setImpression(r.impression);
    setRecommendations(r.recommendations);
    setStatus(r.status);
    setCurrentContent(r.sections.map(s => s.content).join('\n\n'));
  };

  return (
    <div style={{ padding: 16, background: '#f8fafc', minHeight: 'calc(100vh - 56px)' }}>
      {/* 顶栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <FileText size={24} color="#1677ff" /><span style={{ fontSize: 18, fontWeight: 600 }}>眼科报告书写</span>
        <Select value={selectedReportId} onChange={selectReport} style={{ width: 200 }}
          options={MOCK_REPORTS.map(r => ({ value: r.id, label: `${r.patientName} — ${r.modality}` }))} />
        <Tag color={reportStatusColors[status]}>{reportStatusLabels[status]}</Tag>
        <Tag color="blue">v{report.version}</Tag>
        <EyeLateralityBadge eyeSide={report.eyeSide as any} size="small" />
        <div style={{ flex: 1 }} />
        <Button size="small" icon={<Mic size={14} />} onClick={() => setShowVoiceDialog(!showVoiceDialog)} type={showVoiceDialog ? 'primary' : 'default'}>语音</Button>
        <Button size="small" icon={<Brain size={14} />} onClick={() => setShowAiDialog(!showAiDialog)} type={showAiDialog ? 'primary' : 'default'}>AI 续写</Button>
        <Button size="small" icon={<Save size={14} />}>保存草稿</Button>
        <Button size="small" type="primary" icon={<Send size={14} />}>提交审核</Button>
        <Button size="small" icon={<Stamp size={14} />} onClick={() => setSignModal(!signModal)}>数字签名</Button>
        <Button size="small" icon={<Printer size={14} />} onClick={() => setPrintModal(!printModal)}>打印</Button>
      </div>

      {/* 语音弹窗 */}
      {showVoiceDialog && <Alert message="🎙 语音输入 (Demo) 请说出您要录入的所见内容..." type="info" showIcon closable style={{ marginBottom: 8, fontSize: 12 }} onClose={() => setShowVoiceDialog(false)} />}
      {showAiDialog && <Alert message={<span><Brain size={14} /> AI 辅助所见 (Demo) 基于当前影像数据,建议: <Tag color="blue">采纳</Tag><Tag>忽略</Tag><Tag color="orange">修改</Tag></span>} type="warning" showIcon closable style={{ marginBottom: 8, fontSize: 12 }} onClose={() => setShowAiDialog(false)} />}
      {signModal && <Alert message={<span><Stamp size={14} /> 数字签名 (Demo) 张明远 主任医师 | 签名方式: <Tag color="green">CA 数字证书</Tag><Tag color="blue">手写板</Tag> | 签名时间: 2026-06-20 16:50</span>} type="success" showIcon closable style={{ marginBottom: 8, fontSize: 12 }} onClose={() => setSignModal(false)} />}
      {printModal && <Alert message={<span><Printer size={14} /> 打印 (Demo) 打印机: DryView 8700 | 胶片: 4 张 | 报告: 2 份 | <Tag color="blue">打印</Tag><Tag>预览</Tag><Tag color="orange">取消</Tag></span>} type="info" showIcon closable style={{ marginBottom: 8, fontSize: 12 }} onClose={() => setPrintModal(false)} />}

      <Row gutter={12}>
        {/* 主编辑区 */}
        <Col span={16}>
          {/* 模板选择 */}
          <Card size="small" style={{ marginBottom: 8 }}>
            <ReportTemplateSelector value={templateId} onChange={setTemplateId} />
            {template && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{template.sections.length} 段 · {template.sections.filter(s => s.required).length} 必填 · 版本 {template.version}</div>}
          </Card>

          {/* 6 段所见编辑 */}
          <Collapse defaultActiveKey={template?.sections.map(s => s.key) || []} size="small" items={(template?.sections || []).map(s => ({
            key: s.key,
            label: <Space size={4}>{s.required && <Badge status="error" />}<span style={{ fontSize: 13, fontWeight: s.required ? 600 : 400 }}>{s.title}</span><Tag style={{ fontSize: 9 }}>{s.type}</Tag></Space>,
            children: <div>
              {s.type === 'text' && <Input.TextArea rows={3} value={editing || report.sections.find(rs => rs.key === s.key)?.content || ''} onChange={e => setEditing(e.target.value)} placeholder={`输入${s.title}...`} />}
              {s.type === 'findings_multi' && <FindingLibraryPicker value={findings} onChange={setFindings} />}
              {s.type === 'grading_scale' && <Space wrap>
                {['gs-001','gs-002','gs-003','gs-004','gs-005'].map(g => <GradingScalePicker key={g} scaleId={g} />)}
              </Space>}
              {s.type === 'images' && <div style={{ display: 'flex', gap: 8 }}>
                {['ei-001','ei-004','ei-008'].map(img => <div key={img} style={{ width: 120, height: 80, background: '#0f172a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 9 }}>{img}</div>)}
              </div>}
              {s.type === 'diagnosis' && <Input.TextArea rows={3} value={`${impression}\n${recommendations}`} onChange={e => { const lines = e.target.value.split('\n'); setImpression(lines[0] || ''); setRecommendations(lines.slice(1).join('\n') || ''); }} />}
            </div>,
          })) || []} />

          {/* 报告主文 */}
          <Card size="small" title={<Space><FileText size={14} />报告全文</Space>} style={{ marginTop: 8 }}>
            <Input.TextArea rows={6} value={currentContent} onChange={e => setCurrentContent(e.target.value)} placeholder="编写报告正文..." />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
              <span>字数: {currentContent.length} | 征象: {findings.length} | 版本: {report.version}</span>
              <Space><Button size="small" icon={<Save size={12} />}>自动保存</Button><Button size="small" type="primary" icon={<Send size={12} />}>提交</Button></Space>
            </div>
          </Card>

          {/* 危急值触发 */}
          {status === 'critical_value' && <Alert message={<span><AlertTriangle size={14} /> 危急值触发: {report.criticalValue}</span>} type="error" showIcon style={{ marginTop: 8, fontSize: 12 }} />}
        </Col>

        {/* 右侧栏 */}
        <Col span={8}>
          {/* 患者+报告信息 */}
          <Card size="small" title="报告信息">
            <div style={{ fontSize: 12, lineHeight: 2 }}>患者: <strong>{report.patientName}</strong><br />检查: <Tag>{report.modality}</Tag><br />眼别: <EyeLateralityBadge eyeSide={report.eyeSide as any} size="small" /><br />创建: {report.createdBy} {new Date(report.createdAt).toLocaleString()}<br />审核: {report.reviewedBy && `${report.reviewedBy} ${report.reviewedAt ? new Date(report.reviewedAt).toLocaleString() : ''}`}<br />发布: {report.publishedBy && `${report.publishedBy} ${report.publishedAt ? new Date(report.publishedAt).toLocaleString() : ''}`}<br />签名: {report.signedBy} ({report.signMethod})</div>
          </Card>

          {/* 已选征象 */}
          <Card size="small" title={`征象 (${findings.length})`} style={{ marginTop: 8 }}>
            {findingsData.map(f => <Tag key={f.id} color={f.severity === 'severe' ? 'red' : f.severity === 'abnormal' ? 'orange' : 'green'} style={{ margin: 2 }}>{f.name}</Tag>)}
          </Card>

          {/* 状态切换 */}
          <Card size="small" title="报告状态" style={{ marginTop: 8 }}>
            <Radio.Group value={status} onChange={e => setStatus(e.target.value)} size="small">
              {Object.entries(reportStatusLabels).map(([k, v]) => <Radio.Button key={k} value={k} style={{ fontSize: 11 }}>{v}</Radio.Button>)}
            </Radio.Group>
          </Card>

          {/* 印象+建议 */}
          <Card size="small" title="印象/诊断" style={{ marginTop: 8 }}>
            <Input.TextArea rows={2} value={impression} onChange={e => setImpression(e.target.value)} size="small" placeholder="诊断印象..." />
          </Card>
          <Card size="small" title="治疗建议" style={{ marginTop: 4 }}>
            <Input.TextArea rows={2} value={recommendations} onChange={e => setRecommendations(e.target.value)} size="small" placeholder="建议..." />
          </Card>

          {/* 报告历史 */}
          <div style={{ marginTop: 8 }}><ReportDraftPanel reportId={selectedReportId} /></div>
        </Col>
      </Row>
    </div>
  );
};
export default EyeReportWritePage;
