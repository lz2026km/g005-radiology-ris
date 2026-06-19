/**
 * G005 放射RIS系统 v3.0.6.0 - 定时导出管理页面
 * Phase R7:任务列表 + 执行记录 + 调度控制
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Square, RefreshCw, History, List, Activity } from 'lucide-react';
import { getScheduler } from '../../services/export/schedule/Scheduler';
import { ScheduledExportConfig } from '../../components/export/ScheduledExportConfig';
import type { SchedulerEvent } from '../../services/export/schedule/Scheduler';

export default function ScheduledExportPage() {
  const scheduler = getScheduler();
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<SchedulerEvent[]>([]);

  useEffect(() => {
    const unsub = scheduler.subscribe((ev) => {
      setEvents(prev => [ev, ...prev].slice(0, 50));
    });
    return unsub;
  }, [scheduler]);

  const handleStart = useCallback(() => {
    scheduler.start();
    setRunning(true);
  }, [scheduler]);

  const handleStop = useCallback(() => {
    scheduler.stop();
    setRunning(false);
  }, [scheduler]);

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={20} color="#0891b2" /> 定时导出管理
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>管理自动导出任务和执行记录</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {running ? (
            <button onClick={handleStop} style={stopBtnStyle}><Square size={14} /> 停止调度</button>
          ) : (
            <button onClick={handleStart} style={startBtnStyle}><Play size={14} /> 启动调度</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div>
          <ScheduledExportConfig />
        </div>

        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Activity size={14} color="#0891b2" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>执行记录</span>
          </div>

          {events.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>暂无执行记录</div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {events.map((ev, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: ev.type.includes('complete') ? '#16a34a' : ev.type.includes('fail') ? '#dc2626' : '#3b82f6',
                      display: 'inline-block',
                    }} />
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{ev.jobName || ev.type}</span>
                  </div>
                  <div style={{ color: '#94a3b8', marginTop: 1 }}>{ev.type} · {new Date(ev.timestamp).toLocaleTimeString()}</div>
                  {ev.error && <div style={{ color: '#dc2626', marginTop: 1 }}>{ev.error}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const startBtnStyle: React.CSSProperties = {
  padding: '8px 16px', border: 'none', borderRadius: 6, background: '#16a34a', color: '#fff',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
};
const stopBtnStyle: React.CSSProperties = {
  padding: '8px 16px', border: 'none', borderRadius: 6, background: '#dc2626', color: '#fff',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
};
