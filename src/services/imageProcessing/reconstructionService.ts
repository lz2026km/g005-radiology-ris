export type ReconstructionMethod = 'mip' | 'minip' | 'avg' | 'vr'

export interface ReconstructionOptions {
  method: ReconstructionMethod
  slabThickness: number
  threshold?: number
  opacity?: number
}

export interface ReconstructionResult {
  imageData: ImageData
  method: ReconstructionMethod
  sliceIndex: number
  processingTimeMs: number
}

export function reconstructSlab(
  sourceData: Float32Array[],
  width: number,
  height: number,
  options: ReconstructionOptions
): ReconstructionResult {
  const start = performance.now()
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(width, height)
  const { data } = imageData

  const slices = sourceData.slice(0, options.slabThickness)

  for (let i = 0; i < width * height; i++) {
    const values = slices.map(s => s[i] ?? 0)
    let result = 0
    switch (options.method) {
      case 'mip':
        result = Math.max(...values)
        break
      case 'minip':
        result = Math.min(...values)
        break
      case 'avg':
        result = values.reduce((a, b) => a + b, 0) / values.length
        break
      case 'vr': {
        const above = values.filter(v => v > (options.threshold ?? 100))
        result = above.length > 0 ? above.reduce((a, b) => a + b, 0) / above.length : 0
        break
      }
    }
    const gray = Math.max(0, Math.min(255, result))
    const idx = i * 4
    data[idx] = gray
    data[idx + 1] = gray
    data[idx + 2] = gray
    data[idx + 3] = 255
  }

  return {
    imageData,
    method: options.method,
    sliceIndex: 0,
    processingTimeMs: performance.now() - start,
  }
}

export function createVolumeFromSlices(
  imageDataList: ImageData[]
): Float32Array[] {
  return imageDataList.map(img => {
    const float = new Float32Array(img.width * img.height)
    for (let i = 0; i < img.width * img.height; i++) {
      float[i] = img.data[i * 4]
    }
    return float
  })
}
