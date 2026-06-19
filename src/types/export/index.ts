/**
 * G005 放射RIS系统 v3.0.6.0 - Export 类型定义
 * Phase R7:导出/打印能力扩展(500 升级点)
 */

export type ExportFormatV2 =
  | 'pdf'
  | 'pdf-encrypted'
  | 'word'
  | 'html'
  | 'txt'
  | 'hl7'
  | 'dicom-sr'
  | 'csv'
  | 'pptx'
  | 'json'
  | 'xlsx';

export type ExportScope = 'single' | 'batch' | 'scheduled';

export type ExportStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ExportProgressInfo {
  jobId: string;
  status: ExportStatus;
  total: number;
  processed: number;
  failed: number;
  startedAt: number;
  finishedAt?: number;
  currentItem?: string;
  bytesProcessed: number;
  estimatedTotalBytes: number;
  errorMessage?: string;
  history: ExportProgressEvent[];
}

export interface ExportProgressEvent {
  ts: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  reportId?: string;
}

export interface ExportTemplateRef {
  id: string;
  name: string;
  format: ExportFormatV2;
  engine?: 'handlebars' | 'jinja' | 'mustache' | 'plain';
  estimatedSize?: number;
  description?: string;
}

export interface BrandingConfig {
  siteName: string;
  logoDataUrl?: string;
  footerText: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  showWatermark: boolean;
  showQrCode: boolean;
  showSignature: boolean;
  contactEmail?: string;
  contactPhone?: string;
}

export interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  imageDataUrl?: string;
  opacity: number;
  rotation: number;
  fontSize: number;
  color: string;
  position: 'center' | 'tile' | 'top-right' | 'bottom-left';
}

export interface QrStampOptions {
  content: string;
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  position: 'top-right' | 'bottom-right' | 'bottom-center' | 'inline';
  caption?: string;
}

export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
  isHtml?: boolean;
}

export interface EmailAttachment {
  filename: string;
  blob: Blob;
  cid?: string;
  contentType?: string;
}

export interface FtpUploadTarget {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  remotePath: string;
  protocol: 'sftp' | 'ftps';
  passive?: boolean;
  secure?: boolean;
}

export interface ScheduleFrequency {
  kind: 'once' | 'daily' | 'weekly' | 'monthly' | 'cron';
  at?: string;
  hour?: number;
  minute?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  cronExpr?: string;
  timezone?: string;
}

export interface ScheduleJob {
  id: string;
  name: string;
  templateId: string;
  reportQuery: ReportQuery;
  format: ExportFormatV2;
  frequency: ScheduleFrequency;
  enabled: boolean;
  lastRunAt?: number;
  nextRunAt?: number;
  createdAt: number;
  createdBy?: string;
  notifyEmail?: string;
  ftpTarget?: FtpUploadTarget;
}

export interface ReportQuery {
  modality?: string[];
  bodyPart?: string[];
  status?: string[];
  from?: string;
  to?: string;
  reportIds?: string[];
  authorId?: string;
  keyword?: string;
}

export interface DicomDeIdOptions {
  removePatientName: boolean;
  removePatientId: boolean;
  removePatientBirthDate: boolean;
  removePatientAddress: boolean;
  removeInstitutionName: boolean;
  removeReferringPhysician: boolean;
  removeStudyDate: boolean;
  dateShiftDays: number;
  hashPrivateTags: boolean;
  keepUIDs: boolean;
  retainTags?: string[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'image' | 'list';
  required: boolean;
  description?: string;
  defaultValue?: unknown;
}

export interface ExportTemplateDefinition {
  id: string;
  name: string;
  format: ExportFormatV2;
  description: string;
  category: 'radiology' | 'cardiology' | 'mammo' | 'emergency' | 'research' | 'insurance' | 'patient' | 'other';
  layout: 'single' | 'multi-page' | 'grid' | 'tabular';
  engine: 'handlebars' | 'jinja' | 'mustache' | 'plain';
  paperSize: 'A4' | 'A5' | 'B5' | 'Letter';
  orientation: 'portrait' | 'landscape';
  variables: TemplateVariable[];
  body: string;
  header?: string;
  footer?: string;
  css?: string;
  hasImages: boolean;
  hasSignature: boolean;
  hasQrCode: boolean;
  hasWatermark: boolean;
  tags: string[];
}

export interface BulkExportOptions {
  templateId: string;
  format: ExportFormatV2;
  reportIds: string[];
  archiveName?: string;
  branding?: BrandingConfig;
  watermark?: WatermarkOptions;
  qr?: QrStampOptions;
  notifyProgress?: (info: ExportProgressInfo) => void;
  stopOnError?: boolean;
  passwordProtect?: string;
}

export interface BulkExportResult {
  jobId: string;
  archiveBlob?: Blob;
  fileName: string;
  items: BulkExportItemResult[];
  successCount: number;
  failureCount: number;
  durationMs: number;
}

export interface BulkExportItemResult {
  reportId: string;
  success: boolean;
  blob?: Blob;
  fileName?: string;
  error?: string;
  durationMs: number;
}

export interface EncryptedPdfOptions {
  userPassword: string;
  ownerPassword?: string;
  permissions?: {
    printing?: boolean;
    copying?: boolean;
    modifying?: boolean;
    annotating?: boolean;
    fillingForms?: boolean;
    extracting?: boolean;
    assembling?: boolean;
    printingHighQuality?: boolean;
  };
  encryptionAlgorithm?: 'aes-128' | 'aes-256' | 'rc4-40' | 'rc4-128';
}

export interface PptxSlide {
  title: string;
  subtitle?: string;
  body?: string;
  imageDataUrl?: string;
  notes?: string;
  layout?: 'title' | 'content' | 'two-column' | 'image-full';
}

export interface PptxExportOptions {
  title: string;
  author?: string;
  subject?: string;
  company?: string;
  themeColor?: string;
  slides: PptxSlide[];
}

export interface PrintTemplate {
  id: string;
  name: string;
  paperSize: 'A4' | 'A5' | 'B5' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  marginsMm: { top: number; right: number; bottom: number; left: number };
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  columns: PrintColumn[];
  pageHeader?: string;
  pageFooter?: string;
  showPageNumber: boolean;
  showBranding: boolean;
  showWatermark: boolean;
}

export interface PrintColumn {
  key: string;
  label: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'date' | 'number' | 'image' | 'qr';
  bold?: boolean;
}