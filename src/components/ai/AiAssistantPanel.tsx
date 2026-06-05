// ============================================================
// G005 放射RIS系统 v2.1.0 - AI 助手 UI
// Phase R11 W9: LLM 报告生成/摘要/翻译面板
// ============================================================

import React, { useState } from 'react';
import { useDeepSeek, type LLMTask } from '../../hooks/useDeepSeek';
import type { RadiologyContext } from '../../services/deepseekPrompts';

export interface AiAssistantPanelProps {
  context: RadiologyContext;
  currentReport?: string;
  onApply?: (text: string) => void;
  height?: number;
}

const TASK_LABELS: Record<LLMTask, string> = {
  generate: '生成报告',
  summarize: '报告摘要',
  translate: '中→英翻译',
  quality: '质控检查',
  rads: 'RADS 分级',
  expand: '短语扩写',
  vision: '影像分析',
  differential: '鉴别诊断',
  custom: '自定义',
};

export default function AiAssistantPanel({ context, currentReport = '', onApply, height = 480 }: AiAssistantPanelProps) {
  const llm = useDeepSeek();
  const [task, setTask] = useState<LLMTask>('generate');
  const [phrase, setPhrase] = useState('');

  const runTask = async () => {
    const opts: Parameters<typeof llm.runTask>[1] = { context };
    if (task === 'generate' || task === 'vision' || task === 'differential') {
      opts.context = context;
    }
    if (task === 'summarize' || task === 'translate' || task === 'quality' || task === 'rads' || task === 'differential') {
      opts.text = currentReport;
    }
    if (task === 'expand') {
      opts.text = phrase;
    }
    await llm.runTask(task, opts);
  };

  return (
    <div data-testid="ai-assistant-panel" style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 8, padding: 12, height, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>🤖 AI 助手</span>
        <span style={{ fontSize: 10, color: llm.ready ? '#10b981' : '#94a3b8' }}>{llm.ready ? 'DeepSeek 已就绪' : '未配置'}</span>
        <div style={{ flex: 1 }} />
        <button data-testid="ai-cancel-btn" onClick={llm.cancel} disabled={!llm.streaming} style={{ background: '#7f1d1d', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
          停止
        </button>
        <button data-testid="ai-reset-btn" onClick={llm.reset} style={{ background: '#334155', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
          清空
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {(Object.keys(TASK_LABELS) as LLMTask[]).map(t => (
          <button
            key={t}
            data-testid={`ai-task-${t}`}
            onClick={() => setTask(t)}
            style={{
              background: task === t ? '#3b82f6' : '#1e293b',
              color: task === t ? 'white' : '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: 14,
              padding: '3px 10px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {TASK_LABELS[t]}
          </button>
        ))}
      </div>

      {task === 'expand' && (
        <input
          data-testid="ai-phrase-input"
          value={phrase}
          onChange={e => setPhrase(e.target.value)}
          placeholder="输入短语，如'右肺下叶斑片状高密度影'"
          style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: 4, padding: 6, fontSize: 12, marginBottom: 8 }}
        />
      )}

      <button
        data-testid="ai-run-btn"
        onClick={runTask}
        disabled={llm.streaming}
        style={{
          background: llm.streaming ? '#64748b' : '#10b981',
          color: 'white', border: 'none', borderRadius: 4, padding: '8px 12px',
          fontSize: 12, cursor: llm.streaming ? 'not-allowed' : 'pointer', marginBottom: 10,
        }}
      >
        {llm.streaming ? '⏳ 生成中...' : `▶ ${TASK_LABELS[task]}`}
      </button>

      <div data-testid="ai-output" style={{ flex: 1, background: '#020617', border: '1px solid #1e293b', borderRadius: 4, padding: 10, fontSize: 12, whiteSpace: 'pre-wrap', overflow: 'auto', fontFamily: 'ui-monospace, monospace' }}>
        {llm.error ? <span style={{ color: '#fca5a5' }}>错误: {llm.error}</span> : (llm.output || <span style={{ color: '#64748b' }}>输出将显示在此...</span>)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontSize: 10, color: '#94a3b8' }}>
        {llm.usage && (
          <span data-testid="ai-usage">
            tokens: {llm.usage.total} (↑{llm.usage.prompt} ↓{llm.usage.completion})
          </span>
        )}
        {llm.streaming && <span data-testid="ai-streaming-badge" style={{ color: '#fbbf24' }}>● 流式中</span>}
        <div style={{ flex: 1 }} />
        {llm.output && onApply && (
          <button
            data-testid="ai-apply-btn"
            onClick={() => onApply(llm.output)}
            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
          >
            插入到报告
          </button>
        )}
      </div>

      {llm.history.length > 0 && (
        <details style={{ marginTop: 8, fontSize: 10, color: '#94a3b8' }}>
          <summary style={{ cursor: 'pointer' }}>历史 ({llm.history.length})</summary>
          <div style={{ maxHeight: 100, overflow: 'auto' }}>
            {llm.history.slice(-5).map((h, i) => (
              <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid #1e293b' }}>
                [{TASK_LABELS[h.task]}] {h.durationMs}ms · {h.output.length} 字符
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
