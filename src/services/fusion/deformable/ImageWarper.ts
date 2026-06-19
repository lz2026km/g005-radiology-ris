// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 形变场图像 warp
// 使用三次 B 样条将源图像重采样到目标网格
// ============================================================

import type { DeformableField, WarpedImage } from '../../../types/fusion'
import { warpPoint } from '../registration/DeformableB spline'

/** 双线性采样 (源图像 + 形变后坐标) */
function bilinearSample(src: Float32Array, width: number, height: number, x: number, y: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = x0 + 1
  const y1 = y0 + 1
  if (x0 < 0 || y0 < 0 || x1 >= width || y1 >= height) return 0
  const dx = x - x0
  const dy = y - y0
  const v00 = src[y0 * width + x0]!
  const v01 = src[y0 * width + x1]!
  const v10 = src[y1 * width + x0]!
  const v11 = src[y1 * width + x1]!
  return v00 * (1 - dx) * (1 - dy) + v01 * dx * (1 - dy) + v10 * (1 - dx) * dy + v11 * dx * dy
}

/**
 * 将源图像按形变场 warp 到目标尺寸
 * - 形变场 φ 定义在归一化坐标 [-spacing*half, +spacing*half]
 * - 输出尺寸可独立于源尺寸
 */
export function warpImage(
  src: Float32Array | Uint8Array,
  srcWidth: number,
  srcHeight: number,
  field: DeformableField,
  outWidth: number = srcWidth,
  outHeight: number = srcHeight,
): WarpedImage {
  const out = new Float32Array(outWidth * outHeight)
  const floatSrc = src instanceof Float32Array ? src : Float32Array.from(src as Uint8Array)
  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      // 归一化到形变场中心坐标
      const px = (x / outWidth - 0.5) * 2 * (field.gridSize.cols - 1) * field.spacing * 0.1
      const py = (y / outHeight - 0.5) * 2 * (field.gridSize.rows - 1) * field.spacing * 0.1
      const pz = 0
      // 求解反形变 (简化: 直接使用形变场)
      const warped = warpPoint(field, { x: px, y: py, z: pz })
      // 映射回源图像像素坐标
      const sx = (warped.x / (field.gridSize.cols * field.spacing * 0.1) + 1) * 0.5 * srcWidth
      const sy = (warped.y / (field.gridSize.rows * field.spacing * 0.1) + 1) * 0.5 * srcHeight
      out[y * outWidth + x] = bilinearSample(floatSrc, srcWidth, srcHeight, sx, sy)
    }
  }
  return {
    imageId: 'warped',
    width: outWidth,
    height: outHeight,
    pixels: out,
    field,
  }
}

/** 形变场 Jacobian 行列式对 warp 后图像的影响 (用于质量评估) */
export function warpResidualStats(original: Float32Array, warped: Float32Array): { mse: number; psnr: number; ssim: number } {
  if (original.length !== warped.length) {
    return { mse: Infinity, psnr: 0, ssim: 0 }
  }
  let sumSq = 0
  let oSum = 0
  let wSum = 0
  let oSq = 0
  let wSq = 0
  let ow = 0
  for (let i = 0; i < original.length; i++) {
    const o = original[i]!
    const w = warped[i]!
    const d = o - w
    sumSq += d * d
    oSum += o
    wSum += w
    oSq += o * o
    wSq += w * w
    ow += o * w
  }
  const n = original.length
  const mse = sumSq / n
  const psnr = mse === 0 ? 100 : 20 * Math.log10(255 / Math.sqrt(mse))
  // 简化的 SSIM (仅亮度+结构项)
  const oMu = oSum / n
  const wMu = wSum / n
  const oVar = oSq / n - oMu * oMu
  const wVar = wSq / n - wMu * wMu
  const oWCov = ow / n - oMu * wMu
  const ssim = ((2 * oMu * wMu + 0.0001) * (2 * oWCov + 0.0009)) / ((oMu * oMu + wMu * wMu + 0.0001) * (oVar + wVar + 0.0009))
  return {
    mse: Number(mse.toFixed(3)),
    psnr: Number(psnr.toFixed(2)),
    ssim: Number(ssim.toFixed(3)),
  }
}

export const ImageWarper = {
  warp: warpImage,
  residual: warpResidualStats,
  bilinear: bilinearSample,
}

export default ImageWarper
