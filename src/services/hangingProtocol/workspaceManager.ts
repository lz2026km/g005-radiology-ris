export interface ViewportLayout {
  id: string
  row: number
  col: number
  rowSpan: number
  colSpan: number
}

export interface MonitorConfig {
  id: string
  name: string
  resolution: { width: number; height: number }
  physicalSizeInches: number
  dpi: number
}

export interface WorkspacePreset {
  id: string
  name: string
  layouts: ViewportLayout[]
  description?: string
  isBuiltin?: boolean
}

export interface WorkspaceState {
  activePresetId: string
  presets: WorkspacePreset[]
  monitors: MonitorConfig[]
  maximizedViewportId: string | null
  viewportOrder: string[]
}

const WORKSPACE_STORAGE_KEY = 'g005_workspace_presets'

const BUILTIN_PRESETS: WorkspacePreset[] = [
  {
    id: 'single-1x1',
    name: '单屏 1×1',
    isBuiltin: true,
    description: '单视口全屏显示',
    layouts: [{ id: 'vp-1', row: 0, col: 0, rowSpan: 1, colSpan: 1 }],
  },
  {
    id: 'dual-1x2',
    name: '双屏 1×2',
    isBuiltin: true,
    description: '左右对照',
    layouts: [
      { id: 'vp-1', row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { id: 'vp-2', row: 0, col: 1, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: 'quad-2x2',
    name: '四屏 2×2',
    isBuiltin: true,
    description: '四视口网格',
    layouts: [
      { id: 'vp-1', row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { id: 'vp-2', row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'vp-3', row: 1, col: 0, rowSpan: 1, colSpan: 1 },
      { id: 'vp-4', row: 1, col: 1, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: 'mpr-3x1',
    name: 'MPR 三平面',
    isBuiltin: true,
    description: '轴位/冠状/矢状 三平面',
    layouts: [
      { id: 'vp-axial', row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { id: 'vp-coronal', row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'vp-sagittal', row: 0, col: 2, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: 'fusion-2x1',
    name: '融合 2×1',
    isBuiltin: true,
    description: '融合/叠加/对照',
    layouts: [
      { id: 'vp-fusion', row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { id: 'vp-reference', row: 0, col: 1, rowSpan: 1, colSpan: 1 },
    ],
  },
]

function loadPresets(): WorkspacePreset[] {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function savePresets(presets: WorkspacePreset[]): void {
  try {
    const custom = presets.filter(p => !p.isBuiltin)
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(custom))
  } catch { /* ignore */ }
}

export function getWorkspacePresets(): WorkspacePreset[] {
  return [...BUILTIN_PRESETS, ...loadPresets()]
}

export function addWorkspacePreset(preset: WorkspacePreset): void {
  const custom = loadPresets()
  custom.push({ ...preset, isBuiltin: false })
  savePresets(custom)
}

export function removeWorkspacePreset(id: string): void {
  const custom = loadPresets().filter(p => p.id !== id)
  savePresets(custom)
}

export function getGridDimensions(layouts: ViewportLayout[]): { rows: number; cols: number } {
  let rows = 0, cols = 0
  for (const l of layouts) {
    rows = Math.max(rows, l.row + l.rowSpan)
    cols = Math.max(cols, l.col + l.colSpan)
  }
  return { rows, cols }
}

export function createDefaultWorkspaceState(): WorkspaceState {
  return {
    activePresetId: 'single-1x1',
    presets: getWorkspacePresets(),
    monitors: [],
    maximizedViewportId: null,
    viewportOrder: [],
  }
}
