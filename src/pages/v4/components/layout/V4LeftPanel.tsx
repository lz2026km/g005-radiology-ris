import React, { useState } from 'react';
import { Collapse, Tag, Badge, Button } from 'antd';
import { StickyNote, History, Brain, ChevronRight, FileText, Plus } from 'lucide-react';
import { StructuredFieldForm } from '@components/report/v3/R3.WRITING/StructuredFieldForm';
import V4HistoryCompare from '../compare/V4HistoryCompare';
import type { V4ReportCombined, V4ReportActions } from '../../hooks/useV4ReportState';

interface Props {
  reportState: V4ReportCombined & V4ReportActions;
  setTemplateDrawerOpen: (key: string) => void;
}

const V4LeftPanel: React.FC<Props> = ({ reportState, setTemplateDrawerOpen }) => {
  const { context } = reportState;
  const priorReports = context.priorReports || [];
  const similarCases = context.similarCases || [];
  const [historyOpen, setHistoryOpen] = useState(false);

  const items = [
    {
      key: 'clinical',
      label: (
        <div className="v4-collapse-header">
          <StickyNote className="v4-icon v4-icon--sm" />
          <span>临床信息</span>
        </div>
      ),
      children: (
        <div className="v4-clinical-grid">
          <div className="v4-clinical-item">
            <div className="v4-clinical-label">患者</div>
            <div className="v4-clinical-value">张三</div>
          </div>
          <div className="v4-clinical-item">
            <div className="v4-clinical-label">性别 / 年龄</div>
            <span>男 / 58 岁</span>
          </div>
          <div className="v4-clinical-item">
            <div className="v4-clinical-label">检查号</div>
            <span className="v4-clinical-code">{context.patientId}</span>
          </div>
          <div className="v4-clinical-item">
            <div className="v4-clinical-label">临床诊断</div>
            <span>右肺占位性病变</span>
          </div>
          <div className="v4-clinical-full">
            <b>主诉:</b> 体检发现右肺结节 1 周
            <br />
            <b>现病史:</b> 患者 1 周前体检发现右肺上叶结节
            <br />
            <b>既往史:</b> 无肿瘤病史
          </div>
        </div>
      ),
    },
    {
      key: 'structured',
      label: (
        <div className="v4-collapse-header">
          <FileText className="v4-icon v4-icon--sm v4-icon--blue" />
          <span>结构化字段</span>
          <Tag color="blue" className="v4-collapse-tag">{context.template?.name || 'RECIST 1.1'}</Tag>
          <Button type="text" size="small" icon={<Plus className="v4-icon v4-icon--xs" />} onClick={() => setTemplateDrawerOpen('templates')} />
        </div>
      ),
      children: (
        <div className="v4-structured-inline">
          <StructuredFieldForm
            reportId={context.reportId}
            initialValues={context.fields}
            onChange={(values) => (reportState as any).updateFields?.(values)}
          />
        </div>
      ),
    },
    {
      key: 'history',
      label: (
        <div className="v4-collapse-header">
          <History className="v4-icon v4-icon--sm" />
          <span>历史报告</span>
          <Badge count={context.priorReports?.length || 0} size="small" className="v4-collapse-badge" />
        </div>
      ),
      children: (
        <div className="v4-history-list">
          {(priorReports || []).length > 0 ? (
            (priorReports || []).map((p: any) => (
              <div key={p.id} className="v4-history-item" onClick={() => setHistoryOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setHistoryOpen(true); }}>
                <div className="v4-history-item-header">
                  <Tag color="cyan" className="v4-history-tag">{p.reportId}</Tag>
                  <span className="v4-history-date">{new Date(p.studyDate).toLocaleDateString()}</span>
                  <ChevronRight className="v4-icon v4-icon--xs v4-icon--right" />
                </div>
                <div className="v4-history-findings">{p.findings}</div>
                {p.comparisonDelta && (
                  <Tag color="orange" className="v4-history-delta">{p.comparisonDelta.summary}</Tag>
                )}
              </div>
            ))
          ) : (
            <div className="v4-history-empty">无历史报告</div>
          )}
        </div>
      ),
    },
    {
      key: 'similar',
      label: (
        <div className="v4-collapse-header">
          <Brain className="v4-icon v4-icon--sm" />
          <span>相似病例</span>
          <Badge count={context.similarCases?.length || 0} size="small" className="v4-collapse-badge" />
        </div>
      ),
      children: (
        <div className="v4-similar-list">
          {(similarCases || []).length > 0 ? (
            (similarCases || []).map((c: any) => (
              <div key={c.id} className="v4-similar-item">
                <div className="v4-similar-header">
                  <Tag color="purple">{c.reportId}</Tag>
                  <Tag color="blue">{(c.similarityScore * 100).toFixed(0)}%</Tag>
                </div>
                <div className="v4-similar-impression">{c.impression}</div>
              </div>
            ))
          ) : (
            <div className="v4-history-empty">无相似病例</div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="v4-left-panel">
        <Collapse
          defaultActiveKey={['clinical', 'structured']}
          ghost
          expandIconPosition="end"
          items={items.map((item) => ({ ...item, className: 'v4-collapse-item' }))}
        />
      </div>
      <V4HistoryCompare open={historyOpen} onClose={() => setHistoryOpen(false)} priorReports={priorReports} />
    </>
  );
};

export default V4LeftPanel;
