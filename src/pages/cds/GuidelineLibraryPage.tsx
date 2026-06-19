import { useState, useEffect, useCallback } from 'react'
import { getCdsEngine } from '../../services/cds/hooks/CdsEngine'
import GuidelineViewer from '../../components/cds/GuidelineViewer'
import type { ClinicalGuideline } from '../../types/cds'

export default function GuidelineLibraryPage() {
  const engine = getCdsEngine()
  const [guidelines, setGuidelines] = useState<ClinicalGuideline[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    const all = engine.getGuidelineEngine().getAll()
    setGuidelines(all)
    setLoading(false)
  }, [engine])

  useEffect(() => { refresh() }, [refresh])

  const handleSelect = (guideline: ClinicalGuideline) => {
    window.open(guideline.downloadUrl ?? guideline.doi ?? '', '_blank')
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#0d1117', color: '#8b949e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
      加载临床指南...
    </div>
  }

  return <GuidelineViewer guidelines={guidelines} onSelect={handleSelect} />
}
