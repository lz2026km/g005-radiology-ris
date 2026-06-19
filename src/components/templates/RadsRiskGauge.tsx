/**
 * G005 RIS v3.0.6.5 - RADS 风险仪表
 * 50 升级点 - 0-100 评分可视化 / 风险带 / 阈值
 */
import React, { useMemo } from 'react';
import { Tag, Tooltip } from 'antd';
import { Info, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Shield } from 'lucide-react';
import type { RadsRiskGaugeData, RiskBand } from '@/types/templates/calculations';

interface Props {
  data: RadsRiskGaugeData;
  size?: 'small' | 'medium' | 'large';
  showLegend?: boolean;
}

const BAND_COLORS: Record<RiskBand, { color: string; bg: string; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
  'very-low': { color: '#10b981', bg: '#d1fae5', label: '极低', icon: ShieldCheck },
  'low':      { color: '#34d399', bg: '#d1fae5', label: '低',  icon: ShieldCheck },
  'intermediate': { color: '#f59e0b', bg: '#fef3c7', label: '中', icon: Shield },
  'high':     { color: '#ea580c', bg: '#ffedd5', label: '高',  icon: AlertTriangle },
  'very-high':{ color: '#dc2626', bg: '#fee2e2', label: '极高', icon: AlertTriangle },
};

const SIZE_MAP = {
  small:  { width: 140, height: 90, stroke: 10, font: 20, sub: 11 },
  medium: { width: 200, height: 130, stroke: 14, font: 30, sub: 13 },
  large:  { width: 260, height: 170, stroke: 18, font: 40, sub: 14 },
};

export const RadsRiskGauge: React.FC<Props> = ({ data, size = 'medium', showLegend = true }) => {
  const dims = SIZE_MAP[size];
  const band = BAND_COLORS[data.band];
  const Icon = band.icon;

  // 弧度计算
  const { path, needle, percent, radius } = useMemo(() => {
    const cx = dims.width / 2;
    const cy = dims.height - 18;
    const radiusLocal = (dims.width - 20) / 2;
    const startAngle = Math.PI; // 180°
    const endAngle = 0;          // 0°
    const valueAngle = startAngle + (data.score / 100) * (endAngle - startAngle);

    const x1 = cx + radiusLocal * Math.cos(startAngle);
    const y1 = cy + radiusLocal * Math.sin(startAngle);
    const x2 = cx + radiusLocal * Math.cos(endAngle);
    const y2 = cy + radiusLocal * Math.sin(endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;

    const pathLocal = `M ${x1} ${y1} A ${radiusLocal} ${radiusLocal} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    const nx = cx + (radiusLocal - 18) * Math.cos(valueAngle);
    const ny = cy + (radiusLocal - 18) * Math.sin(valueAngle);
    return { path: pathLocal, needle: { x: nx, y: ny }, percent: data.score / 100, radius: radiusLocal };
  }, [data.score, dims]);

  return (
    <div className="flex flex-col items-center" data-testid="rads-risk-gauge">
      <svg width={dims.width} height={dims.height + 10} aria-label={`${data.radsType} ${data.category} 风险`}>
        <defs>
          <linearGradient id={`grad-${data.band}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="65%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        {/* 背景弧 */}
        <path d={path} fill="none" stroke="#e5e7eb" strokeWidth={dims.stroke} strokeLinecap="round" />
        {/* 分数弧 */}
        <path
          d={path}
          fill="none"
          stroke={`url(#grad-${data.band})`}
          strokeWidth={dims.stroke}
          strokeLinecap="round"
          strokeDasharray={`${percent * 314} 314`}
        />
        {/* 刻度 */}
        {[0, 25, 50, 75, 100].map((v) => {
          const angle = Math.PI + (v / 100) * (-Math.PI);
          const tx = dims.width / 2 + (radius + 6) * Math.cos(angle);
          const ty = (dims.height - 18) + (radius + 6) * Math.sin(angle);
          return (
            <text key={v} x={tx} y={ty} textAnchor="middle" fontSize={dims.sub - 1} fill="#6b7280">
              {v}
            </text>
          );
        })}
        {/* 指针 */}
        <circle cx={needle.x} cy={needle.y} r={6} fill={band.color} stroke="#fff" strokeWidth={2} />
        {/* 中心数字 */}
        <text
          x={dims.width / 2}
          y={(dims.height - 18) - 8}
          textAnchor="middle"
          fontSize={dims.font}
          fontWeight="700"
          fill={band.color}
        >
          {data.score}
        </text>
        <text
          x={dims.width / 2}
          y={(dims.height - 18) - 8 + dims.sub + 4}
          textAnchor="middle"
          fontSize={dims.sub}
          fill="#6b7280"
        >
          {data.radsType} {data.category}
        </text>
      </svg>

      <div className="flex items-center gap-1 mt-1">
        <Tag color={band.color} style={{ background: band.bg, borderColor: band.color, color: band.color }}>
          <Icon className="w-3 h-3 inline mr-1" />
          风险:{band.label}
        </Tag>
        <Tooltip title={data.recommendation}>
          <Info className="w-3 h-3 text-slate-400 cursor-help" />
        </Tooltip>
      </div>

      {data.deltas && data.deltas.length > 0 && showLegend && (
        <div className="grid grid-cols-2 gap-1 mt-2 w-full">
          {data.deltas.map((d, idx) => {
            const b = BAND_COLORS[d.band];
            return (
              <div
                key={idx}
                className="flex items-center justify-between text-xs px-2 py-1 rounded"
                style={{ background: b.bg, color: b.color }}
              >
                <span>{d.label}</span>
                <span className="font-semibold flex items-center gap-1">
                  {d.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {d.value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RadsRiskGauge;
