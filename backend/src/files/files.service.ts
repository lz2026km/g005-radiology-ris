/**
 * G005 放射RIS系统 v3.0.2 - 文件服务
 * 简化:本地 /uploads + 预签名 URL
 */
import { Injectable, BadRequestException } from '@nestjs/common'
import * as crypto from 'node:crypto'
import * as path from 'node:path'

@Injectable()
export class FilesService {
  /**
   * 生成预签名上传 URL(简化版:用 token + 过期时间)
   */
  getUploadUrl(filename: string, contentType: string): { uploadUrl: string; token: string; expiresAt: string } {
    if (!filename) throw new BadRequestException('filename required')
    const token = crypto.randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    const safeName = path.basename(filename)
    return {
      uploadUrl: `/api/files/upload/${token}?name=${encodeURIComponent(safeName)}&ct=${encodeURIComponent(contentType)}`,
      token,
      expiresAt,
    }
  }

  /**
   * 上传完成确认(返回永久 URL)
   */
  confirmUpload(token: string, metadata: { size: number; checksum: string; filename: string }): { id: string; url: string; size: number; checksum: string; uploadedAt: string } {
    if (!token || !metadata?.filename) throw new BadRequestException('invalid')
    const id = crypto.randomBytes(12).toString('hex')
    return {
      id,
      url: `/api/files/download/${id}/${encodeURIComponent(metadata.filename)}`,
      size: metadata.size,
      checksum: metadata.checksum,
      uploadedAt: new Date().toISOString(),
    }
  }
}
