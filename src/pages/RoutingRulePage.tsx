/**
 * G005 RIS v3.0.6.6 - 路由规则编辑页面
 * 30 点升级
 */
import React, { useMemo, useState } from 'react';
import { GitBranch, Play, Save, Eye } from 'lucide-react';
import RoutingRuleBuilder from '../components/workflow/RoutingRuleBuilder';
import type { RoutingRule } from '../types/workflow';
import { RoutingEngine } from '../services/workflow/rules/RoutingEngine';

const SAMPLE_RULES: RoutingRule[] = [
  {
    id: 'rr-001',
    name: '急诊 CT 优先主任',
    priority: 100,
    enabled: true,
    conditions: { all: [{ fact: 'priority', operator: 'equal', value: 'critical' }, { fact: 'modality', operator: 'equal', value: 'CT' }] },
    event: { type: 'escalate' },
    target: { doctorId: 'D006', siteId: 'SITE-MAIN' },
    explanation: '急诊 CT 自动升级至主任医师',
  },
  {
    id: 'rr-002',
    name: 'MR 等待超时转院区',
    priority: 50,
    enabled: true,
    conditions: { all: [{ fact: 'modality', operator: 'equal', value: 'MR' }, { fact: 'waitingMinutes', operator: 'greaterThan', value: 60 }] },
    event: { type: 'redirect_site' },
    target: { siteId: 'SITE-BRANCH' },
    explanation: 'MR 等待超过 60 分钟转分院',
  },
  {
    id: 'rr-003',
    name: '住院患者指定',
    priority: 30,
    enabled: true,
    conditions: { all: [{ fact: 'patientType', operator: 'equal', value: '住院' }] },
    event: { type: 'assign_doctor' },
    target: { doctorId: 'D002' },
    explanation: '住院患者优先指派李慧敏',
  },
];

const SAMPLE_FACTS = [
  { studyId: 'S-001', modality: 'CT', priority: 'critical', patientType: '急诊', age: 65, waitingMinutes: 5, criticalFinding: true },
  { studyId: 'S-002', modality: 'MR', priority: 'urgent', patientType: '门诊', age: 45, waitingMinutes: 75, criticalFinding: false },
  { studyId: 'S-003', modality: 'CT', priority: 'normal', patientType: '住院', age: 78, waitingMinutes: 30, criticalFinding: false },
];

export default function RoutingRulePage() {
  const [rules, setRules] = useState<RoutingRule[]>(SAMPLE_RULES);
  const engine = useMemo(() => {
    const e = new RoutingEngine();
    rules.forEach((r) => e.addRule(r));
    return e;
  }, [rules]);
  const [results, setResults] = useState<Array<{ studyId: string; matched: string[]; target?: string }>>([]);

  const runSimulation = async () => {
    const out: Array<{ studyId: string; matched: string[]; target?: string }> = [];
    for (const fact of SAMPLE_FACTS) {
      const decision = await engine.evaluate(fact);
      out.push({
        studyId: fact.studyId,
        matched: decision.matchedRules.map((m) => m.rule.name),
        target: decision.finalTarget?.doctorId ?? decision.finalTarget?.siteId,
      });
    }
    setResults(out);
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <header style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)', color: '#fff', padding: '14px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitBranch size={20} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>路由规则引擎</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>基于 json-rules-engine 的可视化条件编排</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button onClick={runSimulation} style={btnPrimary}>
              <Play size={12} /> 模拟执行
            </button>
            <button style={btnSecondary}><Save size={12} /> 保存</button>
          </div>
        </div>
      </header>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
        <div style={{ borderRight: '1px solid #e2e8f0' }}>
          <RoutingRuleBuilder rules={rules} onChange={setRules} />
        </div>
        <aside style={{ background: '#fff', padding: 12, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Eye size={14} color="#1e3a5f" />
            <span style={{ fontWeight: 700, color: '#1e3a5f' }}>模拟结果</span>
          </div>
          {results.length === 0 ? (
            <div style={{ fontSize: 12, color: '#94a3b8' }}>点击「模拟执行」查看规则命中情况</div>
          ) : (
            results.map((r) => (
              <div key={r.studyId} style={{ background: '#f1f5f9', padding: 8, borderRadius: 6, marginBottom: 6 }}>
                <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 12 }}>{r.studyId}</div>
                <div style={{ fontSize: 12, color: '#475569' }}>
                  命中: {r.matched.length === 0 ? '无' : r.matched.join(', ')}
                </div>
                {r.target && <div style={{ fontSize: 12, color: '#059669' }}>→ {r.target}</div>}
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = { background: '#fff', color: '#7c3aed', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 };
const btnSecondary: React.CSSProperties = { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 };