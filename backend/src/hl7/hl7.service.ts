/**
 * G005 放射RIS系统 v3.0.2 - HL7 报告导出服务
 */
import { Injectable } from '@nestjs/common'

export interface ReportForHL7 {
  accessionNumber: string
  patientName: string
  patientId: string
  patientSex: 'M' | 'F' | 'O' | ''
  patientBirthDate?: string
  modality: string
  studyDate: string // YYYYMMDD
  studyTime: string // HHMMSS
  findings: string
  conclusion: string
  authorName: string
  authorId: string
  reviewerName?: string
  reviewedAt?: Date
  reportId: string
  radsCategory?: string
}

const HL7_DELIMS = {
  field: '|',
  component: '^',
  repetition: '~',
  escape: '\\',
  subcomponent: '&',
}

const nowHL7 = (): string => {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`
}

@Injectable()
export class Hl7Service {
  /**
   * 构造 HL7 ORU^R01 报告消息
   */
  buildORU(r: ReportForHL7): string {
    const ts = nowHL7()
    const ctrlId = `G005-${r.reportId}-${ts}`

    // MSH 头
    const msh = [
      'MSH',
      `^~\\&`,
      'G005_RIS',
      'G005_HOSPITAL',
      'HIS_RECEIVER',
      'HIS',
      ts,
      '',
      'ORU^R01',
      ctrlId,
      'P',
      '2.5.1',
    ].join(HL7_DELIMS.field)

    // PID 患者信息
    const pid = [
      'PID',
      '1',
      '',
      `${r.patientId}^^^G005^MR`,
      '',
      `${r.patientName}`,
      '',
      `${r.patientBirthDate ?? ''}`,
      `${r.patientSex === 'M' ? 'M' : r.patientSex === 'F' ? 'F' : 'O'}`,
    ].join(HL7_DELIMS.field)

    // PV1 就诊
    const pv1 = ['PV1', '1', 'O', '', '', '', '', '', '', '', '', '', `${r.accessionNumber}^^G005^ACC`].join(HL7_DELIMS.field)

    // OBR 检查申请
    const obr = [
      'OBR',
      '1',
      `${r.accessionNumber}^^G005^ACC`,
      '',
      `${r.modality}^${r.modality}^CPT`,
      '',
      `${r.studyDate}${r.studyTime}`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      `${r.authorId}^${r.authorName}^^G005^DOC`,
    ].join(HL7_DELIMS.field)

    // OBX 观察/结果
    const obxLines: string[] = []
    let obxSeq = 1
    obxLines.push(
      ['OBX', String(obxSeq++), 'TX', 'FINDINGS^Impression^L', '', this.escapeText(r.findings)].join(HL7_DELIMS.field)
    )
    obxLines.push(
      ['OBX', String(obxSeq++), 'TX', 'CONCLUSION^Conclusion^L', '', this.escapeText(r.conclusion)].join(HL7_DELIMS.field)
    )
    if (r.radsCategory) {
      obxLines.push(
        ['OBX', String(obxSeq++), 'CE', 'RADS^RADS Category^L', '', r.radsCategory].join(HL7_DELIMS.field)
      )
    }

    return [msh, pid, pv1, obr, ...obxLines].join('\r\n')
  }

  /** 转义 HL7 特殊字符 */
  private escapeText(s: string): string {
    return s
      .replace(/\\/g, '\\E\\')
      .replace(/\|/g, '\\F\\')
      .replace(/\^/g, '\\S\\')
      .replace(/~/g, '\\R\\')
      .replace(/\r?\n/g, '\\.br\\')
  }
}
