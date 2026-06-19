/**
 * G005 放射RIS系统 v3.0.6.5 - AI 置信度仪表
 * A5-AI-ORCH / 10 点
 */

import React from 'react';

export interface ConfidenceGaugeProps {
  value: number;
  label?: string;
  size?: number;
  showPercent?: boolean;
  thresholds?: { high: number; medium: number };
  color?: { high: string; medium: string; low: string };
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  value,
  label,
  size = 120,
  showPercent = true,
  thresholds = { high: 0.85, medium: 0.6 },
  color = { high: '#10b981', medium: '#f59e0b', low: '#ef4444' },
}) => {
  const v = Math.max(0, Math.min(1, value));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - v * circumference * 0.75;
  const c = v >= thresholds.high ? color.high : v >= thresholds.medium ? color.medium : color.low;
  const status = v >= thresholds.high ? '高' : v >= thresholds.medium ? '中' : '低';

  return (
    <div data-testid="confidence-gauge" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.85}`}>
        <path
          d={`M ${stroke / 2} ${size * 0.5} A ${radius} ${radius} 0 1 1 ${size - stroke / 2} ${size * 0.5}`}
          fill="none"
          stroke="#334155"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${size * 0.5} A ${radius} ${radius} 0 1 1 ${size - stroke / 2} ${size * 0.5}`}
          fill="none"
          stroke={c}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference * 0.75}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s' }}
        />
        <text
          x={size / 2}
          y={size * 0.45}
          textAnchor="middle"
          fill="#f1f5f9"
          fontSize={size * 0.22}
          fontWeight={700}
        >
          {showPercent ? `${Math.round(v * 100)}%` : v.toFixed(2)}
        </text>
        <text x={size / 2} y={size * 0.62} textAnchor="middle" fill={c} fontSize={size * 0.12} fontWeight={600}>
          {status}
        </text>
      </svg>
      {label && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{label}</div>}
    </div>
  );
};

export default ConfidenceGauge;
