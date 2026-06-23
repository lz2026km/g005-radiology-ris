/**
 * G005 放射RIS系统 v3.0.6.0 - 定时导出配置组件
 * Phase R7:创建/编辑定时导出任务
 */
import React, { useState } from 'react';
import { Clock, Plus, Play, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getScheduler } from '../../services/export/schedule/Scheduler';
import type { ScheduleJob, ScheduleFrequency, ExportFormatV2, ReportQuery } from '../../types/export';

interface ScheduledExportConfigProps {
  onJobChange?: () => void;
}

export const ScheduledExportConfig: React.FC<ScheduledExportConfigProps> = ({ onJobChange }) => {
  const scheduler = getScheduler();
  const [jobs, setJobs] = useState<ScheduleJob[]>(scheduler.listJobs);
  const [showNew, setShowNew] = useState(false);

  const refresh = () => {
    setJobs(scheduler.listJobs());
    onJobChange?.();
  };

  const handleToggle = (id: string, enabled: boolean) => {
    scheduler.toggleJob(id, enabled);
    refresh();
  };

  const handleRemove = (id: string) => {
    scheduler.removeJob(id);
    refresh();
  };

  const handleRunNow = (id: string) => {
    scheduler.runNow(id);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color="#0891b2" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>定时导出</span>
        </div>
        <button onClick={() => setShowNew(!showNew)} style={addBtnStyle}><Plus size={14} /> 新建任务</button>
      </div>

      {showNew && (
        <NewJobForm
          onCreated={() => { setShowNew(false); refresh(); }}
          onCancel={() => setShowNew(false)}
        />
      )}

      {jobs.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>暂无定时导出任务</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {jobs.map(job => (
            <div key={job.id} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{job.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {job.format.toUpperCase()} · {frequencyLabel(job.frequency)}
                    {job.lastRunAt && <> · 上次: {new Date(job.lastRunAt).toLocaleString()}</>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => handleRunNow(job.id)} style={iconBtnStyle} title="立即执行"><Play size={13} /></button>
                  <button onClick={() => handleToggle(job.id, !job.enabled)} style={iconBtnStyle} title={job.enabled ? '禁用' : '启用'}>
                    {job.enabled ? <ToggleRight size={14} color="#16a34a" /> : <ToggleLeft size={14} color="#94a3b8" />}
                  </button>
                  <button onClick={() => handleRemove(job.id)} style={{ ...iconBtnStyle, color: '#dc2626' }} title="删除"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function frequencyLabel(f: ScheduleFrequency): string {
  switch (f.kind) {
    case 'once': return `一次性 (${f.at ? new Date(f.at).toLocaleString() : '未设置'})`;
    case 'daily': return `每天 ${f.hour ?? 0}:${String(f.minute ?? 0).padStart(2, '0')}`;
    case 'weekly': return `每周${['日', '一', '二', '三', '四', '五', '六'][f.dayOfWeek ?? 0]} ${f.hour ?? 0}:${String(f.minute ?? 0).padStart(2, '0')}`;
    case 'monthly': return `每月${f.dayOfMonth ?? 1}日 ${f.hour ?? 0}:${String(f.minute ?? 0).padStart(2, '0')}`;
    case 'cron': return `Cron: ${f.cronExpr}`;
    default: return f.kind;
  }
}

const NewJobForm: React.FC<{ onCreated: () => void; onCancel: () => void }> = ({ onCreated, onCancel }) => {
  const [name, setName] = useState('定时导出');
  const [format, setFormat] = useState<ExportFormatV2>('pdf');
  const [freqKind, setFreqKind] = useState<ScheduleFrequency['kind']>('daily');
  const [hour, setHour] = useState(2);
  const [minute, setMinute] = useState(0);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const handleCreate = () => {
    const freq: ScheduleFrequency = { kind: freqKind, hour, minute, dayOfWeek, dayOfMonth };
    const job: ScheduleJob = {
      id: `sched-${Date.now()}`,
      name,
      templateId: 'tpl-001',
      reportQuery: {} as ReportQuery,
      format,
      frequency: freq,
      enabled: true,
      nextRunAt: Date.now() + 60_000,
      createdAt: Date.now(),
    };
    getScheduler().addJob(job);
    onCreated();
  };

  return (
    <div style={{ padding: 12, marginBottom: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', marginBottom: 8 }}>新建定时任务</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="任务名称" style={inputStyle} />
        <select value={format} onChange={e => setFormat(e.target.value as ExportFormatV2)} style={inputStyle}>
          <option value="pdf">PDF</option>
          <option value="word">Word</option>
          <option value="html">HTML</option>
          <option value="csv">CSV</option>
          <option value="pptx">PPTX</option>
        </select>
        <select value={freqKind} onChange={e => setFreqKind(e.target.value as ScheduleFrequency['kind'])} style={inputStyle}>
          <option value="daily">每天</option>
          <option value="weekly">每周</option>
          <option value="monthly">每月</option>
        </select>
        {freqKind === 'daily' && (
          <div style={{ display: 'flex', gap: 4 }}>
            <input type="number" value={hour} onChange={e => setHour(+e.target.value)} min={0} max={23} style={{ ...inputStyle, width: '50%' }} placeholder="时" />
            <input type="number" value={minute} onChange={e => setMinute(+e.target.value)} min={0} max={59} style={{ ...inputStyle, width: '50%' }} placeholder="分" />
          </div>
        )}
        {freqKind === 'weekly' && (
          <select value={dayOfWeek} onChange={e => setDayOfWeek(+e.target.value)} style={inputStyle}>
            <option value={0}>周日</option><option value={1}>周一</option><option value={2}>周二</option>
            <option value={3}>周三</option><option value={4}>周四</option><option value={5}>周五</option><option value={6}>周六</option>
          </select>
        )}
        {freqKind === 'monthly' && (
          <input type="number" value={dayOfMonth} onChange={e => setDayOfMonth(+e.target.value)} min={1} max={31} style={inputStyle} />
        )}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
        <button onClick={handleCreate} style={saveBtnStyle}><Plus size={13} /> 创建</button>
        <button onClick={onCancel} style={cancelBtnStyle}>取消</button>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, outline: 'none', width: '100%',
};
const addBtnStyle: React.CSSProperties = {
  padding: '5px 10px', border: '1px solid #0891b2', borderRadius: 4, background: '#ecfeff',
  color: '#0891b2', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
};
const saveBtnStyle: React.CSSProperties = {
  padding: '6px 12px', border: 'none', borderRadius: 4, background: '#0891b2', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: 4, background: '#fff', color: '#475569', fontSize: 12, cursor: 'pointer',
};
const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28, border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
};
