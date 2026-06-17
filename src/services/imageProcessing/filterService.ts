export type FilterKernel = 'gaussian' | 'median' | 'sobel' | 'bilateral'

export interface FilterOptions {
  kernel: FilterKernel
  kernelSize: number
  sigma?: number
  sigmaSpace?: number
  sigmaColor?: number
}

export interface FilterResult {
  data: Uint8ClampedArray
  width: number
  height: number
  processingTimeMs: number
}

export function applyFilter(
  imageData: ImageData,
  options: FilterOptions
): FilterResult {
  const start = performance.now()
  const { data, width, height } = imageData
  const output = new Uint8ClampedArray(data.length)
  const k = options.kernelSize
  // Treat the Uint8ClampedArray as a flat number buffer for indexed access
  // (avoids the `number | undefined` narrowing that noUncheckedIndexedAccess
  // introduces on every pixel read; values are guaranteed by pixel math below).
  const px: number[] = data as unknown as number[]

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const sR: number[] = []
      const sG: number[] = []
      const sB: number[] = []
      const samples: number[][] = [sR, sG, sB]

      for (let ky = -Math.floor(k / 2); ky <= Math.floor(k / 2); ky++) {
        for (let kx = -Math.floor(k / 2); kx <= Math.floor(k / 2); kx++) {
          const pxx = Math.min(width - 1, Math.max(0, x + kx))
          const pyy = Math.min(height - 1, Math.max(0, y + ky))
          const sidx = (pyy * width + pxx) * 4
          sR.push(px[sidx]!)
          sG.push(px[sidx + 1]!)
          sB.push(px[sidx + 2]!)
        }
      }

      for (let c = 0; c < 3; c++) {
        const channel = samples[c]!
        if (options.kernel === 'median') {
          channel.sort((a, b) => a - b)
          output[idx + c] = channel[Math.floor(channel.length / 2)]!
        } else {
          output[idx + c] = channel.reduce((a, b) => a + b, 0) / channel.length
        }
      }
      output[idx + 3] = px[idx + 3]!
    }
  }

  return {
    data: output,
    width,
    height,
    processingTimeMs: performance.now() - start,
  }
}

export function createGaussianKernel(size: number, sigma: number): number[] {
  const kernel: number[] = []
  let sum = 0
  const half = Math.floor(size / 2)
  for (let y = -half; y <= half; y++) {
    for (let x = -half; x <= half; x++) {
      const v = Math.exp(-(x * x + y * y) / (2 * sigma * sigma)) / (2 * Math.PI * sigma * sigma)
      kernel.push(v)
      sum += v
    }
  }
  return kernel.map(v => v / sum)
}

export function sobelEdgeDetection(imageData: ImageData): FilterResult {
  const start = performance.now()
  const { data, width, height } = imageData
  const output = new Uint8ClampedArray(data.length)
  const px: number[] = data as unknown as number[]
  const gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
  const gy = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let pxx = 0, pyy = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const gray = px[idx]! * 0.299 + px[idx + 1]! * 0.587 + px[idx + 2]! * 0.114
          pxx += gray * gx[ky + 1]![kx + 1]!
          pyy += gray * gy[ky + 1]![kx + 1]!
        }
      }
      const mag = Math.min(255, Math.sqrt(pxx * pxx + pyy * pyy))
      const idx = (y * width + x) * 4
      output[idx] = mag
      output[idx + 1] = mag
      output[idx + 2] = mag
      output[idx + 3] = 255
    }
  }
  return { data: output, width, height, processingTimeMs: performance.now() - start }
}
