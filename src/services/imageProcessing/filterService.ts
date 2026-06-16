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

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const samples: number[][] = [[], [], []]

      for (let ky = -Math.floor(k / 2); ky <= Math.floor(k / 2); ky++) {
        for (let kx = -Math.floor(k / 2); kx <= Math.floor(k / 2); kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx))
          const py = Math.min(height - 1, Math.max(0, y + ky))
          const sidx = (py * width + px) * 4
          samples[0].push(data[sidx])
          samples[1].push(data[sidx + 1])
          samples[2].push(data[sidx + 2])
        }
      }

      for (let c = 0; c < 3; c++) {
        if (options.kernel === 'median') {
          samples[c].sort((a, b) => a - b)
          output[idx + c] = samples[c][Math.floor(samples[c].length / 2)]
        } else {
          output[idx + c] = samples[c].reduce((a, b) => a + b, 0) / samples[c].length
        }
      }
      output[idx + 3] = data[idx + 3]
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
  const gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
  const gy = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let px = 0, py = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114
          px += gray * gx[ky + 1][kx + 1]
          py += gray * gy[ky + 1][kx + 1]
        }
      }
      const mag = Math.min(255, Math.sqrt(px * px + py * py))
      const idx = (y * width + x) * 4
      output[idx] = mag
      output[idx + 1] = mag
      output[idx + 2] = mag
      output[idx + 3] = 255
    }
  }
  return { data: output, width, height, processingTimeMs: performance.now() - start }
}
