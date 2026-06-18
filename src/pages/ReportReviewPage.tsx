// ============================================================
// G005 放射科RIS系统 v1.0.3 - 报告审核工作台
// Phase R3：双审流程（初+终）+ 审核时效 KPI + 驳回 + 审核历史
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActor } from 'xstate';
import { reportMachine } from '../machines/reportMachine';
import {
  ClipboardCheck, Clock, XCircle,
  FileText, Search, BarChart3, TrendingUp,
  AlertTriangle, History, Eye, Edit2, Send,
  Award, ShieldCheck,
  ArrowRight, ThumbsUp, ThumbsDown,
  ListChecks,
} from 'lucide-react';
import {
  REVIEW_TASKS,
  REVIEW_KPI,
  type ReviewTask,
  type ReviewStage,
  type ReviewStatus,
} from '../data/reviewRevisionCollabMock';

// ============================================================
// 阶段配置
// ============================================================
const STAGE_CONFIG: Record<ReviewStage, { label: string; color: string; bg: string; icon: any; description: string }> = {
  initial: { label: '初审', color: '#f59e0b', bg: '#fef3c7', icon: Eye,         description: '高年资主治/副主任审核' },
  final:   { label: '终审', color: '#7c2d12', bg: '#fed7aa', icon: ShieldCheck, description: '副主任以上终审' },
  sign:    { label: '签发', color: '#be185d', bg: '#fce7f3', icon: Award,        description: '医生 CA 签发' },
};

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bg: string; border: string }> = {
  'pending':     { label: '待审核', color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d' },
  'in-progress': { label: '审核中', color: '#0891b2', bg: '#cffafe', border: '#67e8f9' },
  'completed':   { label: '已完成', color: '#10b981', bg: '#d1fae5', border: '#6ee7b7' },
  'rejected':    { label: '已驳回', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  'overdue':     { label: '已超时', color: '#7f1d1d', bg: '#fecaca', border: '#f87171' },
};

// ============================================================
// 时间格式化
// ============================================================
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

function deadlineInfo(_deadline: string, isOverdue: boolean, hoursToDeadline: number): { label: string; color: string } {
  if (isOverdue) {
    return { label: `超时 ${Math.abs(hoursToDeadline)}h`, color: '#dc2626' };
  }
  if (hoursToDeadline < 2) return { label: `${hoursToDeadline}h 内`, color: '#f59e0b' };
  return { label: `${hoursToDeadline}h 后`, color: '#64748b' };
}

// ============================================================
// 主组件
// ============================================================
export default function ReportReviewPage() {
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [stage, setStage] = useState<ReviewStage | 'all'>('all');
  const [status, setStatus] = useState<ReviewStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('rv-001');
  const [auditSuggestion, setAuditSuggestion] = useState('');
  const [auditScore, setAuditScore] = useState(90);
  const [auditDecision, setAuditDecision] = useState<'approve' | 'reject' | null>(null);
  // 避免 TypeScript 警告
  void navigate;

  // 过滤
  const filteredTasks = useMemo(() => {
    return REVIEW_TASKS.filter(t => {
      if (stage !== 'all' && t.stage !== stage) return false;
      if (status !== 'all' && t.status !== status) return false;
      if (search && !t.patientName.includes(search) && !t.reportId.includes(search)) return false;
      return true;
    });
  }, [stage, status, search]);

  // 选中任务
  const selectedTask = REVIEW_TASKS.find(t => t.id === selectedTaskId);

  // 当前用户（模拟）
  const currentUser = {
    id: 'D005', name: '刘文博', title: '副主任医师',
  };

  if (loading) return <div role="status" data-testid="review-loading" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>加载中...</div>;
  if (error) return <div role="alert" data-testid="review-error" style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</div>;
  if (REVIEW_TASKS.length === 0) {
    return (
      <div data-testid="review-empty" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 14, marginBottom: 12 }}>暂无审核任务</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>所有报告均已审核完毕,辛苦了 ☕</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', background: '#f1f5f9' }}>
      {/* 顶部 KPI */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
        color: '#fff', padding: '12px 20px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardCheck size={20} />
              报告审核工作台
              <span style={{
                fontSize: 10, padding: '2px 6px',
                background: '#10b981', color: '#fff',
                borderRadius: 3, fontWeight: 700,
              }}>R3</span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>
              双审流程（初+终）+ 审核时效 KPI + 驳回闭环
            </div>
          </div>
          <div style={{ fontSize: 11, opacity: 0.9 }}>
            当前审核员：<strong>{currentUser.name}（{currentUser.title}）</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          <KpiMini icon={ListChecks} label="今日审核" value={REVIEW_KPI.totalToday} color="#bfdbfe" />
          <KpiMini icon={Clock} label="待初审" value={REVIEW_KPI.pendingInitial} color="#fde68a" />
          <KpiMini icon={ShieldCheck} label="待终审" value={REVIEW_KPI.pendingFinal} color="#fed7aa" />
          <KpiMini icon={Award} label="待签发" value={REVIEW_KPI.pendingSign} color="#fbcfe8" />
          <KpiMini icon={AlertTriangle} label="已超时" value={REVIEW_KPI.overdue} color="#fca5a5" alert />
          <KpiMini icon={XCircle} label="已驳回" value={REVIEW_KPI.rejected} color="#fca5a5" />
          <KpiMini icon={TrendingUp} label="按时率" value={`${REVIEW_KPI.onTimeRate}%`} color="#bbf7d0" good />
        </div>
      </div>

      {/* 阶段 Tab */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '0 20px', display: 'flex', alignItems: 'center', flexShrink: 0,
      }}>
        {[
          { key: 'all', label: '全部', icon: BarChart3 },
          { key: 'initial', label: '初审', icon: Eye },
          { key: 'final', label: '终审', icon: ShieldCheck },
          { key: 'sign', label: '签发', icon: Award },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setStage(t.key as any)}
              style={{
                padding: '10px 16px', border: 'none', background: 'transparent',
                color: stage === t.key ? '#1e40af' : '#64748b',
                fontWeight: stage === t.key ? 700 : 500,
                fontSize: 13, cursor: 'pointer',
                borderBottom: `2px solid ${stage === t.key ? '#3b82f6' : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 8, top: 8, color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索患者/报告 ID..."
              style={{
                padding: '5px 8px 5px 26px', border: '1px solid #cbd5e1', borderRadius: 4,
                fontSize: 11, outline: 'none', width: 180,
              }}
            />
          </div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            style={{ padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 11 }}
          >
            <option value="all">全部状态</option>
            <option value="pending">待审核</option>
            <option value="in-progress">审核中</option>
            <option value="rejected">已驳回</option>
            <option value="overdue">已超时</option>
          </select>
        </div>
      </div>

      {/* 主体 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左：任务列表 */}
        <div style={{
          width: 460, background: '#fff', borderRight: '1px solid #e2e8f0',
          overflowY: 'auto', flexShrink: 0,
        }}>
          <div style={{
            padding: '8px 12px', borderBottom: '1px solid #e2e8f0',
            fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span><strong style={{ color: '#1e40af' }}>{filteredTasks.length}</strong> 个任务</span>
            <span>共 {REVIEW_TASKS.length} 条记录</span>
          </div>
          {filteredTasks.map(task => {
            const stageConf = STAGE_CONFIG[task.stage];
            const statusConf = STATUS_CONFIG[task.status];
            const StageIcon = stageConf.icon;
            const isSelected = task.id === selectedTaskId;
            const deadline = deadlineInfo(task.deadline, task.isOverdue, task.hoursToDeadline);

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                style={{
                  padding: 12, borderBottom: '1px solid #f1f5f9',
                  background: isSelected ? '#eff6ff' : task.isOverdue ? '#fef2f2' : 'transparent',
                  borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      padding: '1px 6px', borderRadius: 3,
                      background: stageConf.bg, color: stageConf.color,
                      fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2,
                    }}>
                      <StageIcon size={9} /> {stageConf.label}
                    </span>
                    <span style={{
                      padding: '1px 6px', borderRadius: 3,
                      background: statusConf.bg, color: statusConf.color, border: `1px solid ${statusConf.border}`,
                      fontSize: 10, fontWeight: 600,
                    }}>{statusConf.label}</span>
                    {task.criticalFinding && (
                      <span style={{
                        fontSize: 9, padding: '1px 4px',
                        background: '#dc2626', color: '#fff', borderRadius: 2,
                        fontWeight: 700,
                      }}>危急值</span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: deadline.color, fontWeight: 600 }}>
                    ⏱ {deadline.label}
                  </span>
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                  {task.patientName} · {task.modality} {task.bodyPart}
                </div>
                <div style={{ fontSize: 10, color: '#64748b', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span>报告：<strong>{task.reportDoctorTitle} {task.reportDoctorName}</strong></span>
                  <span>·</span>
                  <span>质量 {task.qualityScore}</span>
                  <span>·</span>
                  <span>{timeAgo(task.submittedAt)}</span>
                </div>

                {/* 阶段进度指示 */}
                <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                  {['initial', 'final', 'sign'].map(s => {
                    const isPast = ['initial', 'final', 'sign'].indexOf(s) < ['initial', 'final', 'sign'].indexOf(task.stage);
                    const isCurrent = s === task.stage;
                    return (
                      <div
                        key={s}
                        style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: isPast ? '#10b981' : isCurrent ? '#3b82f6' : '#e2e8f0',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filteredTasks.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>
              无匹配任务
            </div>
          )}
        </div>

        {/* 右：任务详情 + 审核操作 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {selectedTask ? (
            <ReviewTaskDetail
              task={selectedTask}
              currentUser={currentUser}
              auditSuggestion={auditSuggestion}
              setAuditSuggestion={setAuditSuggestion}
              auditScore={auditScore}
              setAuditScore={setAuditScore}
              auditDecision={auditDecision}
              setAuditDecision={setAuditDecision}
            />
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>请从左侧选择审核任务</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KPI 卡片
// ============================================================
const KpiMini: React.FC<{ icon: any; label: string; value: number | string; color: string; alert?: boolean; good?: boolean }> = ({ icon: Icon, label, value, color, alert, good }) => {
  void color; return (
  <div style={{
    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
    borderRadius: 6, padding: '6px 10px',
    border: alert ? '1px solid rgba(220,38,38,0.5)' : good ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.2)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon size={12} style={{ color: alert ? '#fca5a5' : good ? '#bbf7d0' : '#bfdbfe' }} />
      <span style={{ fontSize: 10, opacity: 0.85 }}>{label}</span>
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{value}</div>
  </div>
  );
};


// ============================================================
// 任务详情 + 审核操作
// ============================================================
const ReviewTaskDetail: React.FC<{
  task: ReviewTask;
  currentUser: any;
  auditSuggestion: string;
  setAuditSuggestion: (v: string) => void;
  auditScore: number;
  setAuditScore: (v: number) => void;
  auditDecision: 'approve' | 'reject' | null;
  setAuditDecision: (v: any) => void;
}> = ({ task, currentUser, auditSuggestion, setAuditSuggestion, auditScore, setAuditScore, auditDecision, setAuditDecision }) => {
  const stageConf = STAGE_CONFIG[task.stage];
  const statusConf = STATUS_CONFIG[task.status];
  const StageIcon = stageConf.icon;
  const deadline = deadlineInfo(task.deadline, task.isOverdue, task.hoursToDeadline);

  const actor = useMemo(() => createActor(reportMachine, {
    input: { reportId: task.reportId, patientId: '', radiologistId: currentUser.id }
  }), [task.reportId, currentUser.id]);

  useEffect(() => { actor.start(); return () => { actor.stop(); }; }, [actor]);

  return (
    <div>
      {/* 头部 */}
      <div style={{
        background: '#fff', borderRadius: 8, padding: 16, marginBottom: 12,
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              {task.patientName}
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>· {task.modality} {task.bodyPart}</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>报告 ID：{task.reportId}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{
              padding: '3px 10px', borderRadius: 4,
              background: stageConf.bg, color: stageConf.color, fontWeight: 700, fontSize: 11,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <StageIcon size={11} /> {stageConf.label}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 4,
              background: statusConf.bg, color: statusConf.color, border: `1px solid ${statusConf.border}`,
              fontSize: 11, fontWeight: 600,
            }}>{statusConf.label}</span>
            <span style={{ fontSize: 11, color: deadline.color, fontWeight: 700, padding: '3px 10px', background: '#f8fafc', borderRadius: 4 }}>
              ⏱ {deadline.label}
            </span>
          </div>
        </div>

        {/* 三栏信息 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, fontSize: 11 }}>
          <InfoCell label="报告医生" value={`${task.reportDoctorTitle} ${task.reportDoctorName}`} />
          <InfoCell label="提交时间" value={task.submittedAt} />
          <InfoCell label="截止时间" value={task.deadline} alert={task.isOverdue} />
          <InfoCell label="质量评分" value={`${task.qualityScore}/100`} />
        </div>

        {/* 阶段进度 */}
        <div style={{ marginTop: 12, padding: 10, background: '#f8fafc', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 6 }}>三阶段审核流程</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {['initial', 'final', 'sign'].map((s, i) => {
              const sConf = STAGE_CONFIG[s as ReviewStage];
              const SIcon = sConf.icon;
              const isPast = ['initial', 'final', 'sign'].indexOf(s) < ['initial', 'final', 'sign'].indexOf(task.stage);
              const isCurrent = s === task.stage;
              return (
                <React.Fragment key={s}>
                  <div style={{
                    flex: 1, padding: 8, background: '#fff', border: `1px solid ${isCurrent ? sConf.color : '#e2e8f0'}`,
                    borderRadius: 4, textAlign: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, color: isPast ? '#10b981' : isCurrent ? sConf.color : '#94a3b8' }}>
                      <SIcon size={11} />
                      <strong>{sConf.label}</strong>
                    </div>
                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
                      {s === 'initial' && (task.initialAuditCompletedAt ? '✓ 已完成' : task.initialAuditStartAt ? '⏳ 进行中' : '○ 待开始')}
                      {s === 'final' && (task.finalAuditCompletedAt ? '✓ 已完成' : task.finalAuditStartAt ? '⏳ 进行中' : '○ 待开始')}
                      {s === 'sign' && (task.status === 'rejected' ? '✗ 已驳回' : '○ 待开始')}
                    </div>
                  </div>
                  {i < 2 && <ArrowRight size={12} color="#cbd5e1" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 报告内容（只读） */}
      <div style={{
        background: '#fff', borderRadius: 8, padding: 16, marginBottom: 12,
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} /> 报告内容
          </div>
          <button
            style={{
              padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 4,
              background: '#fff', color: '#475569', fontSize: 11, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Eye size={11} /> 全屏预览
          </button>
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.8, color: '#1e293b' }}>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: '#1e40af' }}>【检查所见】</strong>
            <div style={{ marginTop: 4, padding: 8, background: '#f8fafc', borderRadius: 4 }}>
              {task.modality}平扫+增强示{task.bodyPart}区正常结构存在。
              {task.criticalFinding && <span style={{ color: '#dc2626', fontWeight: 600 }}> 病灶内见异常信号/密度影。</span>}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: '#1e40af' }}>【诊断意见】</strong>
            <div style={{ marginTop: 4, padding: 8, background: '#f8fafc', borderRadius: 4 }}>
              {task.criticalFinding ? '考虑恶性可能，建议进一步检查。' : '考虑良性可能，建议随访。'}
            </div>
          </div>
          <div>
            <strong style={{ color: '#1e40af' }}>【建议】</strong>
            <div style={{ marginTop: 4, padding: 8, background: '#f8fafc', borderRadius: 4 }}>
              3 个月后复查。
            </div>
          </div>
        </div>
      </div>

      {/* 初审/终审历史 */}
      {(task.initialAuditCompletedAt || task.finalAuditCompletedAt) && (
        <div style={{
          background: '#fff', borderRadius: 8, padding: 16, marginBottom: 12,
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <History size={14} /> 审核历史
          </div>
          {task.initialAuditCompletedAt && (
            <div style={{ padding: 10, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong style={{ color: '#0369a1', fontSize: 12 }}>✓ 初审完成</strong>
                <span style={{ fontSize: 10, color: '#64748b' }}>{task.initialAuditCompletedAt}</span>
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>
                {task.initialAuditTitle} {task.initialAuditDoctorName} · 评分 {task.initialAuditScore}/100
              </div>
              {task.initialAuditSuggestion && (
                <div style={{ fontSize: 11, color: '#0c4a6e', padding: 6, background: '#fff', borderRadius: 4 }}>
                  💬 {task.initialAuditSuggestion}
                </div>
              )}
            </div>
          )}
          {task.finalAuditCompletedAt && (
            <div style={{ padding: 10, background: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong style={{ color: '#86198f', fontSize: 12 }}>✓ 终审完成</strong>
                <span style={{ fontSize: 10, color: '#64748b' }}>{task.finalAuditCompletedAt}</span>
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>
                {task.finalAuditTitle} {task.finalAuditDoctorName} · 评分 {task.finalAuditScore}/100
              </div>
              {task.finalAuditSuggestion && (
                <div style={{ fontSize: 11, color: '#86198f', padding: 6, background: '#fff', borderRadius: 4 }}>
                  💬 {task.finalAuditSuggestion}
                </div>
              )}
            </div>
          )}
          {task.rejectedReason && (
            <div style={{ padding: 10, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <XCircle size={12} /> 已驳回
              </div>
              <div style={{ fontSize: 11, color: '#7f1d1d' }}>{task.rejectedReason}</div>
            </div>
          )}
        </div>
      )}

      {/* 审核操作面板 */}
      {(task.status === 'pending' || task.status === 'in-progress' || task.status === 'overdue') && (
        <div style={{
          background: '#fff', borderRadius: 8, padding: 16,
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit2 size={14} /> {stageConf.label}操作
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 4 }}>审核评分（0-100）</div>
              <input
                type="range" min={0} max={100} value={auditScore}
                onChange={e => setAuditScore(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: auditScore >= 90 ? '#10b981' : auditScore >= 75 ? '#f59e0b' : '#dc2626' }}>
                {auditScore} 分
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 4 }}>快捷评分</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[60, 75, 85, 90, 95].map(s => (
                  <button
                    key={s}
                    onClick={() => setAuditScore(s)}
                    style={{
                      flex: 1, padding: '6px 4px',
                      background: auditScore === s ? '#dbeafe' : '#f8fafc',
                      border: `1px solid ${auditScore === s ? '#3b82f6' : '#cbd5e1'}`,
                      borderRadius: 4, fontSize: 11, fontWeight: 600,
                      color: auditScore === s ? '#1e40af' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 4 }}>审核意见</div>
            <textarea
              value={auditSuggestion}
              onChange={e => setAuditSuggestion(e.target.value)}
              rows={3}
              placeholder="请输入审核意见（驳回必填，通过建议填写）"
              style={{
                width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 4,
                fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* 决策按钮 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setAuditDecision('approve')}
              style={{
                flex: 1, padding: 10, border: 'none', borderRadius: 6,
                background: auditDecision === 'approve' ? '#10b981' : '#d1fae5',
                color: auditDecision === 'approve' ? '#fff' : '#047857',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                borderBottom: auditDecision === 'approve' ? 'none' : '2px solid #10b981',
              }}
            >
              <ThumbsUp size={14} /> 通过（{stageConf.label}）
            </button>
            <button
              onClick={() => setAuditDecision('reject')}
              style={{
                flex: 1, padding: 10, border: 'none', borderRadius: 6,
                background: auditDecision === 'reject' ? '#dc2626' : '#fee2e2',
                color: auditDecision === 'reject' ? '#fff' : '#b91c1c',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                borderBottom: auditDecision === 'reject' ? 'none' : '2px solid #dc2626',
              }}
            >
              <ThumbsDown size={14} /> 驳回
            </button>
          </div>

          <button
            onClick={() => {
              if (auditDecision === 'approve') {
                switch (task.stage) {
                  case 'initial': actor.send({ type: 'APPROVE_INITIAL' }); break;
                  case 'final': actor.send({ type: 'APPROVE_FINAL' }); break;
                  case 'sign': {
                    actor.send({ type: 'START_SIGN' });
                    actor.send({ type: 'COMPLETE_SIGN' });
                    actor.send({ type: 'PUBLISH', qualityScore: auditScore });
                    break;
                  }
                }
              } else if (auditDecision === 'reject') {
                actor.send({ type: 'REJECT', reason: auditSuggestion });
              }
            }}
            disabled={!auditDecision || (auditDecision === 'reject' && !auditSuggestion)}
            style={{
              width: '100%', marginTop: 8, padding: 12, border: 'none', borderRadius: 6,
              background: (!auditDecision || (auditDecision === 'reject' && !auditSuggestion)) ? '#cbd5e1' : '#1e40af',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: (!auditDecision || (auditDecision === 'reject' && !auditSuggestion)) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Send size={14} /> 提交{stageConf.label}（{currentUser.name}）
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 信息单元
// ============================================================
const InfoCell: React.FC<{ label: string; value: string; alert?: boolean }> = ({ label, value, alert }) => (
  <div>
    <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
    <div style={{ fontSize: 12, color: alert ? '#dc2626' : '#1e293b', fontWeight: 600, marginTop: 1 }}>{value}</div>
  </div>
);
