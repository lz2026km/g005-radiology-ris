import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import PredictiveForecast from '../../components/analytics/PredictiveForecast';
import { predictiveAnalytics } from '../../services/analytics/PredictiveAnalytics';
import { timeSeriesBuilder } from '../../services/analytics/TimeSeriesBuilder';
import type { ForecastResult, ForecastMethod } from '../../types/analytics';

export default function PredictivePage() {
  const [kpiId, setKpiId] = useState('kpi-001');
  const [method, setMethod] = useState<ForecastMethod>('linear');
  const [horizon, setHorizon] = useState(14);
  const [result, setResult] = useState<ForecastResult | null>(null);

  useEffect(() => {
    const range = {
      start: new Date(Date.now() - 90 * 86400000).toISOString().substring(0, 10),
      end: new Date().toISOString().substring(0, 10),
    };
    const ts = timeSeriesBuilder.buildSingle(kpiId, 'month', range);
    const forecast = predictiveAnalytics.forecast(ts, horizon, method);
    setResult(forecast);
  }, [kpiId, method, horizon]);

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="#dc2626" />
          <h1 style={{ fontSize: 20, color: '#1e293b', margin: 0 }}>预测分析</h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={kpiId} onChange={e => setKpiId(e.target.value)} style={selectStyle}>
          <option value="kpi-001">报告总数</option>
          <option value="kpi-010">平均签发时长</option>
          <option value="kpi-020">甲级报告率</option>
          <option value="kpi-040">设备利用率</option>
          <option value="kpi-030">危急值及时率</option>
        </select>
        <select value={method} onChange={e => setMethod(e.target.value as ForecastMethod)} style={selectStyle}>
          <option value="linear">线性回归</option>
          <option value="moving-avg">移动平均</option>
          <option value="exp-smoothing">指数平滑</option>
          <option value="seasonal-naive">季节朴素</option>
        </select>
        <select value={horizon} onChange={e => setHorizon(Number(e.target.value))} style={selectStyle}>
          <option value={7}>7 天</option>
          <option value={14}>14 天</option>
          <option value={30}>30 天</option>
          <option value={60}>60 天</option>
        </select>
      </div>

      {result && <PredictiveForecast forecast={result} />}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: 4,
  fontSize: 11, color: '#1e293b', background: '#fff', cursor: 'pointer',
};
