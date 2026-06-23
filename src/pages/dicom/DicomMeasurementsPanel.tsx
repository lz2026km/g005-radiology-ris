import { t } from '../../i18n/appI18n'
import { Activity, Ruler, Trash2, FileText, Circle, Triangle, EyeOff, CheckCircle } from 'lucide-react'
import type { MeasureSubMenu } from './types'

const PRIMARY = '#1e3a5f'

const s = {
  infoSection: {
    marginBottom: 16,
  },
  infoSectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: PRIMARY,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 6,
    borderBottom: `1px solid #e2e8f0`,
  },
  measureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    background: '#f8fafc',
    borderRadius: 8,
    marginBottom: 6,
    border: '1px solid #e2e8f0',
  },
  measureItemColor: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  measureItemInfo: {
    flex: 1,
    minWidth: 0,
  },
  measureItemValue: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e293b',
  },
  measureItemType: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'capitalize' as const,
  },
  measureItemActions: {
    display: 'flex',
    gap: 4,
  },
  reportBtn: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  measureListItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    background: '#f8fafc',
    borderRadius: 6,
    marginBottom: 4,
    border: '1px solid #e2e8f0',
  },
  measureListItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  measureListItemDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  compareControlBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
  },
  compareControlBadgeOn: {
    background: PRIMARY,
    color: '#fff',
  },
  compareControlBadgeOff: {
    background: '#e2e8f0',
    color: '#64748b',
  },
}

interface Measurement {
  id: string
  type: 'line' | 'angle' | 'ellipse' | 'rectangle' | 'circle' | 'ctvalue'
  value: number
  unit: string
  label: string
  color?: string
}

interface DicomMeasurementsPanelProps {
  measureSubMenu: MeasureSubMenu
  onSetMeasureSubMenu: (type: MeasureSubMenu) => void
  interactiveMeasures: Measurement[]
  onDeleteMeasure: (id: string) => void
  onClearAll: () => void
  showOverlay: boolean
  onToggleOverlay: () => void
  onExportReport: () => void
}

export default function DicomMeasurementsPanel({
  measureSubMenu, onSetMeasureSubMenu,
  interactiveMeasures, onDeleteMeasure, onClearAll,
  showOverlay, onToggleOverlay, onExportReport,
}: DicomMeasurementsPanelProps) {
  const measureTypes: { type: NonNullable<MeasureSubMenu>; icon: React.ReactNode; label: string }[] = [
    { type: 'line', icon: <Ruler size={14} />, label: '📏长度' },
    { type: 'angle', icon: <Triangle size={14} />, label: '📐角度' },
    { type: 'ellipse', icon: <Circle size={14} />, label: '⭕椭圆' },
    { type: 'rectangle', icon: <Circle size={14} />, label: '▢矩形' },
    { type: 'circle', icon: <Circle size={14} />, label: '🔘圆形' },
    { type: 'ctvalue', icon: <Activity size={14} />, label: '💉CT' },
  ]

  return (
    <>
      <div style={s.infoSection}>
        <div style={s.infoSectionTitle}>
          <Ruler size={12} />ROI测量工具
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
          {measureTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              style={{
                flex: 1,
                minWidth: 60,
                padding: '6px 4px',
                borderRadius: 6,
                border: `1px solid ${measureSubMenu === type ? PRIMARY : '#e2e8f0'}`,
                background: measureSubMenu === type ? PRIMARY : '#fff',
                color: measureSubMenu === type ? '#fff' : '#475569',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: 2,
              }}
              onClick={() => onSetMeasureSubMenu(type)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
          {measureSubMenu === 'line' && '📏 点击图像两点测量长度（mm）'}
          {measureSubMenu === 'angle' && '📐 点击图像三点测量角度（°）'}
          {measureSubMenu === 'ellipse' && '⭕ 点击拖动绘制椭圆ROI（cm²）'}
          {measureSubMenu === 'rectangle' && '▢ 点击拖动绘制矩形ROI（cm²）'}
          {measureSubMenu === 'circle' && '🔘 点击拖动绘制圆形ROI（cm²）'}
          {measureSubMenu === 'ctvalue' && '💉 点击图像测量CT值（HU）'}
        </div>
      </div>

      <div style={s.infoSection}>
        <div style={{ ...s.infoSectionTitle, justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Activity size={12} />测量结果 ({interactiveMeasures.length})
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              style={{
                ...s.compareControlBadge,
                padding: '2px 8px',
                ...(showOverlay ? s.compareControlBadgeOn : s.compareControlBadgeOff),
              }}
              onClick={onToggleOverlay}
            >
              {showOverlay ? <Ruler size={10} /> : <EyeOff size={10} />}
              {showOverlay ? '显示' : '隐藏'}
            </button>
          </div>
        </div>
        {interactiveMeasures.length === 0 ? (
          <div style={{ fontSize: 12, color: '#94a3b8', padding: '12px 0', textAlign: 'center' }}>
            <Ruler size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>{t('dcmmeas.noData')}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>选择ROI工具后点击图像开始测量</div>
          </div>
        ) : (
          interactiveMeasures.map(measure => (
            <div key={measure.id} style={s.measureItem}>
              <div style={{ ...s.measureItemColor, background: measure.color || '#22c55e' }} />
              <div style={s.measureItemInfo}>
                <div style={s.measureItemValue}>
                  {measure.label || `${measure.value} ${measure.unit}`}
                </div>
                <div style={s.measureItemType}>
                  {measure.type}
                </div>
              </div>
              <div style={s.measureItemActions}>
                <button
                  style={{
                    width: 24, height: 24, borderRadius: 4, border: 'none',
                    background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onClick={() => onDeleteMeasure(measure.id)}
                  title="删除"
                >
                  <Trash2 size={12} color="#ef4444" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <button
          style={{ ...s.reportBtn, background: '#f0f4f8', color: '#475569', flex: 1 }}
          onClick={onClearAll}
        >
          <Trash2 size={14} />清除全部
        </button>
        <button
          style={{ ...s.reportBtn, background: '#22c55e', color: '#fff', flex: 1 }}
          onClick={onExportReport}
        >
          <FileText size={14} />{t('dcmmeas.exportReport')}</button>
      </div>
    </>
  )
}
