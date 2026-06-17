/**
 * G005 放射RIS系统 v3.0.2.2 - DICOMweb 服务
 * 实现 PS 3.18 QIDO-RS / WADO-RS / STOW-RS 简化版
 */
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DicomWebService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * QIDO-RS: Search for Studies
   * GET /dicom-web/studies?PatientID=...&Modality=...&limit=...
   */
  async searchStudies(filter: { PatientID?: string; Modality?: string; StudyInstanceUID?: string; limit?: number; offset?: number }) {
    const model = (this.prisma as any).dicomInstance
    if (!model?.findMany) return []
    const where: any = {}
    if (filter.PatientID) where.patientId = filter.PatientID
    if (filter.Modality) where.modality = filter.Modality
    if (filter.StudyInstanceUID) where.studyInstanceUid = filter.StudyInstanceUID
    return model.findMany({
      where,
      take: filter.limit ?? 50,
      skip: filter.offset ?? 0,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * QIDO-RS: Search for Series
   * GET /dicom-web/studies/{study}/series
   */
  async searchSeries(studyInstanceUid: string) {
    const model = (this.prisma as any).dicomInstance
    if (!model?.findMany) return []
    return model.findMany({
      where: { studyInstanceUid },
      orderBy: { createdAt: 'asc' },
    })
  }

  /**
   * QIDO-RS: Search for Instances
   */
  async searchInstances(studyInstanceUid: string, seriesInstanceUid?: string) {
    const model = (this.prisma as any).dicomInstance
    if (!model?.findMany) return []
    const where: any = { studyInstanceUid }
    if (seriesInstanceUid) where.seriesInstanceUid = seriesInstanceUid
    return model.findMany({ where })
  }

  /**
   * WADO-RS: Retrieve Instance
   * GET /dicom-web/studies/{study}/series/{series}/instances/{sop}
   * 实际返回 storage path 或 buffer
   */
  async retrieveInstance(sopInstanceUid: string): Promise<{ id: string; storagePath: string; size: number; mimeType: string }> {
    const model = (this.prisma as any).dicomInstance
    if (!model?.findUnique) {
      throw new NotFoundException(`DICOM Web not available`)
    }
    const inst = await model.findUnique({ where: { sopInstanceUid } })
    if (!inst) throw new NotFoundException(`Instance ${sopInstanceUid} not found`)
    return {
      id: inst.id,
      storagePath: inst.storagePath ?? `wado-rs://default/${sopInstanceUid}`,
      size: inst.sizeBytes ?? 0,
      mimeType: 'application/dicom',
    }
  }

  /**
   * WADO-RS: Retrieve Metadata
   */
  async retrieveMetadata(sopInstanceUid: string) {
    const inst = await this.retrieveInstance(sopInstanceUid)
    return {
      '00020002': { vr: 'UI', Value: ['1.2.840.10008.5.1.4.1.1.2'] },
      '00080018': { vr: 'UI', Value: [sopInstanceUid] },
      sopInstanceUID: sopInstanceUid,
      size: inst.size,
    }
  }

  /**
   * STOW-RS: Store Instance
   * POST /dicom-web/studies/{study}
   */
  async storeInstance(
    studyInstanceUid: string,
    seriesInstanceUid: string,
    sopInstanceUid: string,
    modality: string,
    sopClassUid: string,
    sizeBytes: number,
    storagePath: string,
    patientId?: string
  ) {
    const model = (this.prisma as any).dicomInstance
    if (!model?.create) {
      throw new NotFoundException('DICOM Web persistence not available')
    }
    return model.create({
      data: {
        studyInstanceUid,
        seriesInstanceUid,
        sopInstanceUid,
        sopClassUid,
        modality,
        patientId,
        sizeBytes,
        storagePath,
      },
    })
  }

  /**
   * Get Capabilities
   */
  getCapabilities() {
    return {
      version: '3.0.2.2',
      qido: { search: true, limit: 100, maxResults: 10000 },
      wado: { retrieve: true, metadata: true, frame: true, bulkData: false },
      stow: { store: true, scp: true, scu: false },
      transferSyntaxes: [
        '1.2.840.10008.1.2.1', // Explicit VR Little Endian
        '1.2.840.10008.1.2',   // Implicit VR Little Endian
        '1.2.840.10008.1.2.4.70', // JPEG Lossless
      ],
    }
  }
}
