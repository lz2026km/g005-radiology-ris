/**
 * G005 RIS v3.0.6.5 - RADS 计算器页面
 * 20 升级点 - 路由 / 标签页 / 上下文 / 模式切换
 */
import React, { useState } from 'react';
import { Card, Tabs, Space, Select, Tag, Button, Tooltip, message, Empty, Badge } from 'antd';
import { Calculator, Copy, FileText, Settings2, Download, Upload, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RadsSystem } from '@data/rads/radsCommon';
import { RadsCalculator } from '@components/templates/rads/RadsCalculator';
import { RADS_SCHEMAS } from '@services/templates/rads/RadsCalculatorEngine';
import type { RadsCalculatorResult } from '@/types/templates/calculations';
import { PageContainer, PageHeader } from '@/components/common';

const TAB_ICONS: Record<RadsSystem, { icon: React.ReactNode; color: string }> = {
  'BI-RADS': { icon: '🌸', color: '#ec4899' },
  'TI-RADS': { icon: '🦋', color: '#f59e0b' },
  'Lung-RADS': { icon: '🫁', color: '#10b981' },
  'LI-RADS': { icon: '🫀', color: '#7c3aed' },
  'CAD-RADS': { icon: '❤️', color: '#0891b2' },
  'PI-RADS': { icon: '🧠', color: '#8b5cf6' },
  'C-RADS': { icon: '🌀', color: '#14b8a6' },
  'NI-RADS': { icon: '🗣️', color: '#6366f1' },
  'O-RADS': { icon: '🌷', color: '#f43f5e' },
  'VI-RADS': { icon: '💧', color: '#0ea5e9' },
  'Bone-RADS': { icon: '🦴', color: '#a16207' },
};

export const RadsCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [system, setSystem] = useState<RadsSystem>('Lung-RADS');
  const [history, setHistory] = useState<RadsCalculatorResult[]>([]);

  const handleCommit = (result: RadsCalculatorResult) => {
    setHistory((prev) => [result, ...prev].slice(0, 10));
    message.success(`${result.radsType} ${result.category} 已应用`);
  };

  return (
    <PageContainer background="slate" maxWidth="full" padding={16} testId="rads-calculator-page">
      <PageHeader
        title="RADS 通用计算器"
        icon={<Calculator className="w-5 h-5 text-blue-500" />}
        variant="inline"
        actions={
          <>
            <Tag color="blue">11 大系统</Tag>
            <Tag color="green">v3.0.6.5</Tag>
            <Select
              value={system}
              onChange={setSystem}
              style={{ width: 180 }}
              options={Object.entries(RADS_SCHEMAS).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Tooltip title="导入 JSON 模板">
              <Button icon={<Upload className="w-4 h-4" />} />
            </Tooltip>
            <Tooltip title="导出计算历史">
              <Button icon={<Download className="w-4 h-4" />} disabled={history.length === 0} />
            </Tooltip>
            <Button icon={<ChevronLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>返回</Button>
          </>
        }
      />

      <Card size="small" className="shadow-sm">
        <Tabs
          activeKey={system}
          onChange={(k) => setSystem(k as RadsSystem)}
          tabBarExtraContent={
            <Badge
              count={history.length}
              title={`计算历史 ${history.length} 条`}
              style={{ backgroundColor: '#3b82f6' }}
            />
          }
          items={Object.entries(TAB_ICONS).map(([k, meta]) => ({
            key: k,
            label: (
              <Space>
                <span style={{ fontSize: 16 }}>{meta.icon}</span>
                <span style={{ color: meta.color, fontWeight: 500 }}>{RADS_SCHEMAS[k as RadsSystem].label}</span>
              </Space>
            ),
          }))}
        />
        <RadsCalculator initialSystem={system} onCommit={handleCommit} />
      </Card>

      {history.length > 0 && (
        <Card
          size="small"
          className="shadow-sm"
          title={<><FileText className="w-4 h-4 inline mr-1" />计算历史 (最近 {history.length})</>}
        >
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="border rounded p-2 flex items-center justify-between">
                <Space>
                  <Tag color="blue">{h.radsType}</Tag>
                  <Tag color={h.riskLevel === 'very-high' ? 'red' : h.riskLevel === 'high' ? 'volcano' : 'green'}>
                    {h.category}
                  </Tag>
                  <span className="text-sm">{h.categoryName}</span>
                </Space>
                <Space>
                  <span className="text-xs text-slate-400">{new Date(h.computedAt).toLocaleTimeString()}</span>
                  <Button
                    size="small"
                    icon={<Copy className="w-3 h-3" />}
                    onClick={() => {
                      navigator.clipboard?.writeText(`${h.radsType} ${h.category}: ${h.categoryName}`);
                      message.success('已复制');
                    }}
                  />
                </Space>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageContainer>
  );
};

export default RadsCalculatorPage;
