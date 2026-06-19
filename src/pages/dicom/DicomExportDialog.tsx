import { t } from '../../i18n/appI18n'
import { Camera, Download } from 'lucide-react'

const s = {
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
}

interface DicomExportDialogProps {
  onExportPNG: () => void
  onExportDicom: () => void
}

export default function DicomExportDialog({ onExportPNG, onExportDicom }: DicomExportDialogProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
      <button
        style={{ ...s.reportBtn, background: '#1e3a5f', color: '#fff' }}
        onClick={onExportPNG}
      >
        <Camera size={14} />{t('dcmexp.exportPng')}</button>
      <button
        style={{ ...s.reportBtn, background: '#f0f4f8', color: '#1e3a5f' }}
        onClick={onExportDicom}
      >
        <Download size={14} />{t('dcmexp.exportDicom')}</button>
    </div>
  )
}
