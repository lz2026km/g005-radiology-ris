export type Series = {
  id: string
  seriesNumber: number
  seriesDescription: string
  modality: string
  imageCount: number
  thumbnail: string
}

export type Tool = 'zoom' | 'pan' | 'wl' | 'rotate' | 'flipH' | 'flipV' | 'measure' | 'annotate' | 'play' | 'print'

export type MeasureSubMenu = 'length' | 'angle' | 'area' | 'ct' | 'ellipse' | 'rectangle' | 'circle' | 'ctvalue' | null

export type LayoutMode = '1x1' | '2x2' | '1x2' | '2x1'

export type ViewMode = 'MPR' | 'MIP' | 'VR'

export type RightTab = 'patient' | 'image' | 'measure' | 'report' | 'history' | 'external'

export type PseudoColorMode = 'none' | 'hotIron' | 'coolBlue' | 'grayscale' | 'pet' | 'softTissue'

export type AnnotationType = 'text' | 'arrow' | 'rect' | 'ellipse'

export type DicomImage = {
  id: string
  seriesId: string
  imageNumber: number
  sliceLocation: number
  windowWidth: number
  windowCenter: number
  pixelSpacing: number
  sliceThickness: number
  tr?: number
  te?: number
  matrix: string
  fov: number
}

export type CompareLayout = 'leftRight' | 'topBottom'

export type MipDirection = 'axial' | 'sagittal' | 'coronal'
