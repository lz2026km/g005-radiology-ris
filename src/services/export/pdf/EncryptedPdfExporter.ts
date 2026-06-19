/**
 * G005 放射RIS系统 v3.0.6.0 - 加密 PDF 导出
 * Phase R7:使用 Web Crypto API (AES-GCM) 进行 PDF 内容加密
 *
 * 设计说明:
 * 1. 生成标准 PDF(由 jsPDF 完成) → 2. 用 PBKDF2(SHA-256, 100k 轮)派生密钥
 * 3. 用 AES-GCM 加密 PDF 字节 → 4. 加上元数据头(MAGIC/版本/算法/salt/iv)
 * 形成 .epdf 文件(本系统扩展名),下载后在查看器中使用相同密码解密。
 */
import { jsPDF } from 'jspdf';
import type { EncryptedPdfOptions, ExportResult } from '../../../types/export';

const MAGIC = new Uint8Array([0x45, 0x50, 0x44, 0x46]); // 'EPDF'
const VERSION = 0x01;
const ALG_AES_GCM = 0x01;
const PBKDF2_ITERATIONS = 100_000;

export class EncryptedPdfExporter {
  async exportEncrypted(
    reportId: string,
    payload: {
      title: string;
      patientName: string;
      findings: string;
      impression: string;
      recommendation?: string;
      reportDate?: string;
    },
    options: EncryptedPdfOptions,
  ): Promise<ExportResult> {
    if (!options.userPassword) {
      return { success: false, error: 'userPassword is required' };
    }
    try {
      const pdfBlob = this.buildStandardPdf(reportId, payload);
      const encrypted = await this.encryptWithPassword(await pdfBlob.arrayBuffer(), options.userPassword);
      const fileName = `${reportId}.epdf`;
      return {
        success: true,
        blob: new Blob([encrypted], { type: 'application/x-epdf' }),
        fileName,
      };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  async decryptWithPassword(buffer: ArrayBuffer, password: string): Promise<Blob> {
    const decrypted = await this.decryptBuffer(buffer, password);
    return new Blob([decrypted], { type: 'application/pdf' });
  }

  private buildStandardPdf(
    reportId: string,
    p: {
      title: string;
      patientName: string;
      findings: string;
      impression: string;
      recommendation?: string;
      reportDate?: string;
    },
  ): Blob {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = margin;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(p.title || 'Radiology Report', pageWidth / 2, y, { align: 'center' });
    y += 30;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report ID: ${reportId}`, margin, y);
    y += 16;
    doc.text(`Patient: ${p.patientName}`, margin, y);
    y += 16;
    if (p.reportDate) {
      doc.text(`Date: ${p.reportDate}`, margin, y);
      y += 16;
    }

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Findings', margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    const findings = doc.splitTextToSize(p.findings || '-', pageWidth - margin * 2);
    doc.text(findings, margin, y);
    y += findings.length * 14 + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Impression', margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    const impression = doc.splitTextToSize(p.impression || '-', pageWidth - margin * 2);
    doc.text(impression, margin, y);
    y += impression.length * 14 + 10;

    if (p.recommendation) {
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendation', margin, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      const rec = doc.splitTextToSize(p.recommendation, pageWidth - margin * 2);
      doc.text(rec, margin, y);
    }

    const output = doc.output('arraybuffer');
    return new Blob([output], { type: 'application/pdf' });
  }

  private async encryptWithPassword(buffer: ArrayBuffer, password: string): Promise<Uint8Array> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buffer),
    );
    const tagLen = 16;
    const payloadLen = 4 + 1 + 1 + 16 + 12 + ciphertext.length;
    const out = new Uint8Array(payloadLen);
    let offset = 0;
    out.set(MAGIC, offset); offset += 4;
    out[offset++] = VERSION;
    out[offset++] = ALG_AES_GCM;
    out.set(salt, offset); offset += 16;
    out.set(iv, offset); offset += 12;
    out.set(ciphertext, offset);
    void tagLen;
    return out;
  }

  private async decryptBuffer(buffer: ArrayBuffer, password: string): Promise<Uint8Array> {
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 4 + 1 + 1 + 16 + 12 + 16) {
      throw new Error('Invalid encrypted PDF file');
    }
    for (let i = 0; i < MAGIC.length; i++) {
      if (bytes[i] !== MAGIC[i]) throw new Error('Invalid magic header');
    }
    const version = bytes[4];
    const alg = bytes[5];
    if (version !== VERSION) throw new Error(`Unsupported version: ${version}`);
    if (alg !== ALG_AES_GCM) throw new Error(`Unsupported algorithm: ${alg}`);
    const salt = bytes.slice(6, 22);
    const iv = bytes.slice(22, 34);
    const ciphertext = bytes.slice(34);
    const key = await this.deriveKey(password, salt);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new Uint8Array(plaintext);
  }

  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }
}

let singleton: EncryptedPdfExporter | null = null;
export function getEncryptedPdfExporter(): EncryptedPdfExporter {
  if (!singleton) singleton = new EncryptedPdfExporter();
  return singleton;
}