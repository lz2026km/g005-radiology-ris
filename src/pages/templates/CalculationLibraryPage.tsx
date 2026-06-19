/**
 * G005 RIS v3.0.6.5 - 临床计算库页面
 * 20 升级点 - 路由 / 12+ 计算器 / 引用记录
 */
import React, { useState } from 'react';
import { Card, Space, Tag, Button, Row, Col, Empty, message } from 'antd';
import { Calculator, ChevronLeft, History, Star, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CalculationPanel } from '@components/templates/CalculationPanel';
import { calculationEngine } from '@services/templates/calculations/CalculationEngine';
import type { ClinicalCalcId, ClinicalCalcOutput } from '@/types/templates/calculations';

export const CalculationLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<ClinicalCalcId>('bmi');
  const [favorites] = useState<Set<ClinicalCalcId>>(new Set(['bmi', 'egfr']));
  const [history, setHistory] = useState<Array<{ id: ClinicalCalcId; output: ClinicalCalcOutput; at: string }>>([]);

  const list = calculationEngine.list();

  const handleApply = (id: ClinicalCalcId, output: ClinicalCalcOutput) => {
    setHistory((prev) => [{ id, output, at: new Date().toISOString() }, ...prev].slice(0, 8));
    message.success('已应用');
  };

  return (
    <div className="p-4 space-y-3">
      <Card size="small" className="shadow-sm">
        <div className="flex items-center justify-between">
          <Space>
            <Button icon={<ChevronLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>返回</Button>
            <Calculator className="w-5 h-5 text-emerald-500" />
            <span className="text-lg font-semibold">临床计算库</span>
            <Tag color="green">12+ 计算</Tag>
          </Space>
          <Space>
            <Tag color="blue"><History className="w-3 h-3 inline" /> {history.length} 历史</Tag>
            <Tag color="gold"><Star className="w-3 h-3 inline" /> {favorites.size} 收藏</Tag>
          </Space>
        </div>
      </Card>

      <Row gutter={12}>
        <Col span={16}>
          <CalculationPanel initialCalc={active} onApply={handleApply} />
        </Col>
        <Col span={8}>
          <Card size="small" className="shadow-sm" title={<><BookOpen className="w-4 h-4 inline mr-1" />计算器目录</>}>
            <div className="space-y-1 max-h-96 overflow-auto">
              {list.map((c) => (
                <div
                  key={c.id}
                  className={`p-2 rounded cursor-pointer hover:bg-slate-50 flex items-center justify-between ${active === c.id ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'}`}
                  onClick={() => setActive(c.id)}
                >
                  <div>
                    <div className="text-sm font-medium">{c.label}</div>
                    <div className="text-xs text-slate-500">{c.labelEn}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag color={
                      c.category === 'cardiac' ? 'red' :
                      c.category === 'spine' ? 'purple' :
                      c.category === 'obstetric' ? 'magenta' :
                      c.category === 'renal' ? 'cyan' :
                      c.category === 'general' ? 'blue' :
                      c.category === 'vascular' ? 'volcano' :
                      'default'
                    }>{c.category}</Tag>
                    {favorites.has(c.id) && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {history.length > 0 && (
            <Card size="small" className="shadow-sm mt-2" title={<><History className="w-4 h-4 inline mr-1" />最近使用</>}>
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className="text-xs p-1 border rounded">
                    <Tag color="blue">{h.id}</Tag>
                    <span>值:{typeof h.output.value === 'number' ? h.output.value : JSON.stringify(h.output.value)} {h.output.meta.unit}</span>
                    <div className="text-slate-400 mt-0.5">{new Date(h.at).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CalculationLibraryPage;
