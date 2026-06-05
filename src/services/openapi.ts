// ============================================================
// G005 放射RIS系统 v2.1.0 - OpenAPI 3.0 规范
// Phase R13 W12: 完整 REST API 契约
// ============================================================

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'G005 Radiology RIS API',
    description: '放射信息系统 REST API - 报告/患者/影像/AI',
    version: '2.1.0',
    contact: { name: 'G005 Engineering', email: 'eng@g005.hospital' },
    license: { name: 'MIT' },
  },
  servers: [
    { url: 'https://api.g005.hospital/v2', description: '生产环境' },
    { url: 'https://staging-api.g005.hospital/v2', description: '预发布' },
    { url: 'http://localhost:5173/api', description: '本地 (MSW 模拟)' },
  ],
  tags: [
    { name: 'reports', description: '放射报告 CRUD' },
    { name: 'patients', description: '患者管理' },
    { name: 'imaging', description: 'DICOM 影像/锚定' },
    { name: 'ai', description: 'AI 助手' },
    { name: 'ca', description: 'CA 数字证书' },
    { name: 'audit', description: '审计链' },
    { name: 'collab', description: '协同' },
    { name: 'terms', description: '术语库' },
    { name: 'stats', description: '统计' },
  ],
  paths: {
    '/reports': {
      get: {
        tags: ['reports'], operationId: 'listReports', summary: '分页查询报告',
        parameters: [
          { name: 'text', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'pending', 'preliminary', 'final', 'amended', 'cancelled'] } },
          { name: 'modality', in: 'query', schema: { type: 'string', enum: ['CT', 'MR', 'DR', 'CR', 'US', 'MG', 'PT', 'XA', 'NM'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['routine', 'urgent', 'stat', 'critical'] } },
          { name: 'isCritical', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20, maximum: 200 } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'priority', 'qualityScore', 'patientName'] } },
          { name: 'sortDir', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PageResultReport' } } } } },
      },
      post: {
        tags: ['reports'], operationId: 'createReport', summary: '创建报告',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReportInput' } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Report' } } } } },
      },
    },
    '/reports/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['reports'], operationId: 'getReport', summary: '获取报告',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Report' } } } }, '404': { description: 'Not Found' } } },
      put: { tags: ['reports'], operationId: 'updateReport', summary: '更新报告',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReportUpdate' } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Report' } } } } } },
      delete: { tags: ['reports'], operationId: 'deleteReport', summary: '删除报告',
        responses: { '204': { description: 'No Content' } } },
    },
    '/reports/stats': {
      get: { tags: ['stats'], operationId: 'reportStats', summary: '报告统计',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ReportStats' } } } } } },
    },
    '/reports/{id}/sign': {
      post: { tags: ['reports', 'ca'], operationId: 'signReport', summary: 'CA 签名报告',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { action: { type: 'string', enum: ['created', 'updated', 'signed', 'finalized'] }, reason: { type: 'string' } } } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/SignedReport' } } } } } },
    },
    '/reports/{id}/sr': {
      get: { tags: ['reports', 'imaging'], operationId: 'exportSR', summary: '导出 DICOM-SR (TID 1500 + TID 2000)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK', content: { 'application/dicom': { schema: { type: 'string', format: 'binary' } }, 'application/json': { schema: { $ref: '#/components/schemas/DicomSR' } } } } } },
    },
    '/reports/{id}/anchors': {
      get: { tags: ['reports', 'imaging'], operationId: 'listAnchors', summary: '获取报告影像锚定',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ImageAnchor' } } } } } } },
      post: { tags: ['reports', 'imaging'], operationId: 'addAnchor', summary: '添加影像锚定',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ImageAnchor' } } } },
        responses: { '201': { description: 'Created' } } },
    },
    '/patients': {
      get: { tags: ['patients'], operationId: 'listPatients', summary: '患者列表',
        parameters: [{ name: 'mrn', in: 'query', schema: { type: 'string' } }, { name: 'name', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } } },
    },
    '/imaging/dicom': {
      get: { tags: ['imaging'], operationId: 'listDicom', summary: '列出 DICOM 样本',
        parameters: [{ name: 'modality', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } } },
    },
    '/imaging/dicom/{id}/wado': {
      get: { tags: ['imaging'], operationId: 'wadoRetrieve', summary: 'WADO-RS 取图',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK', content: { 'application/dicom': { schema: { type: 'string', format: 'binary' } } } } } },
    },
    '/ai/chat': {
      post: { tags: ['ai'], operationId: 'aiChat', summary: 'AI 聊天',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { task: { type: 'string', enum: ['generate', 'summarize', 'translate', 'quality', 'rads', 'expand', 'vision', 'differential'] }, context: { $ref: '#/components/schemas/RadiologyContext' }, text: { type: 'string' }, images: { type: 'array', items: { type: 'object' } } } } } } },
        responses: { '200': { description: 'OK (SSE)', content: { 'text/event-stream': { schema: { type: 'string' } } } } } },
    },
    '/ca/certificates': {
      get: { tags: ['ca'], operationId: 'listCertificates', summary: '列出证书',
        responses: { '200': { description: 'OK' } } },
      post: { tags: ['ca'], operationId: 'issueCertificate', summary: '签发证书',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificateRequest' } } } },
        responses: { '201': { description: 'Created' } } },
    },
    '/ca/certificates/{serial}/verify': {
      post: { tags: ['ca'], operationId: 'verifyCertificate', summary: '验证证书',
        parameters: [{ name: 'serial', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } } },
    },
    '/audit/entries': {
      get: { tags: ['audit'], operationId: 'listAudit', summary: '审计日志',
        parameters: [{ name: 'reportId', in: 'query', schema: { type: 'string' } }, { name: 'actor', in: 'query', schema: { type: 'string' } }, { name: 'action', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } } },
      post: { tags: ['audit'], operationId: 'appendAudit', summary: '追加审计条目',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuditEntryInput' } } } },
        responses: { '201': { description: 'Created' } } },
    },
    '/audit/verify': {
      post: { tags: ['audit'], operationId: 'verifyChain', summary: '验证审计链',
        responses: { '200': { description: 'OK' } } },
    },
    '/audit/merkle': {
      get: { tags: ['audit'], operationId: 'merkleRoot', summary: 'Merkle 根',
        responses: { '200': { description: 'OK' } } },
    },
    '/collab/rooms': {
      get: { tags: ['collab'], operationId: 'listRooms', summary: '活跃协同房间',
        responses: { '200': { description: 'OK' } } },
    },
    '/terms': {
      get: { tags: ['terms'], operationId: 'searchTerms', summary: '查询术语',
        parameters: [
          { name: 'text', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { '200': { description: 'OK' } } },
    },
    '/terms/autocomplete': {
      get: { tags: ['terms'], operationId: 'autocomplete', summary: '术语补全',
        parameters: [{ name: 'prefix', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } } },
    },
    '/terms/recommend': {
      post: { tags: ['terms'], operationId: 'recommendTerms', summary: '基于上下文推荐',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RadiologyContext' } } } },
        responses: { '200': { description: 'OK' } } },
    },
    '/stats/dashboard': {
      get: { tags: ['stats'], operationId: 'dashboard', summary: '仪表板统计',
        responses: { '200': { description: 'OK' } } },
    },
  },
  components: {
    schemas: {
      Report: {
        type: 'object',
        required: ['id', 'patientName', 'modality', 'bodyPart', 'status'],
        properties: {
          id: { type: 'string' },
          patientId: { type: 'string' },
          patientName: { type: 'string' },
          modality: { type: 'string', enum: ['CT', 'MR', 'DR', 'CR', 'US', 'MG', 'PT', 'XA', 'NM'] },
          bodyPart: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'pending', 'preliminary', 'final', 'amended', 'cancelled'] },
          priority: { type: 'string', enum: ['routine', 'urgent', 'stat', 'critical'] },
          doctorId: { type: 'string' },
          doctorName: { type: 'string' },
          clinicalHistory: { type: 'string' },
          findings: { type: 'string' },
          impression: { type: 'string' },
          recommendation: { type: 'string' },
          isCritical: { type: 'boolean' },
          isDraft: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          signedAt: { type: 'string', format: 'date-time' },
          qualityScore: { type: 'integer', minimum: 0, maximum: 100 },
        },
      },
      ReportInput: { allOf: [{ $ref: '#/components/schemas/Report' }] },
      ReportUpdate: { type: 'object', additionalProperties: true },
      PageResultReport: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Report' } },
          total: { type: 'integer' },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      ReportStats: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          criticalCount: { type: 'integer' },
          byStatus: { type: 'object', additionalProperties: { type: 'integer' } },
          byModality: { type: 'object', additionalProperties: { type: 'integer' } },
          byPriority: { type: 'object', additionalProperties: { type: 'integer' } },
          byDoctor: { type: 'object', additionalProperties: { type: 'integer' } },
          avgQuality: { type: 'integer' },
        },
      },
      SignedReport: {
        type: 'object',
        properties: {
          reportId: { type: 'string' },
          contentHash: { type: 'string' },
          timestamp: { type: 'string' },
          authorId: { type: 'string' },
          certSerial: { type: 'string' },
          signature: { type: 'string' },
          action: { type: 'string' },
        },
      },
      DicomSR: {
        type: 'object',
        properties: {
          sopClassUID: { type: 'string' },
          sopInstanceUID: { type: 'string' },
          studyInstanceUID: { type: 'string' },
          contentSequence: { type: 'array', items: { type: 'object' } },
        },
      },
      ImageAnchor: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          reportId: { type: 'string' },
          frame: { $ref: '#/components/schemas/ImageFrame' },
          category: { type: 'string' },
          label: { type: 'string' },
          measurement: { $ref: '#/components/schemas/Measurement' },
          isAIDetected: { type: 'boolean' },
          isCritical: { type: 'boolean' },
        },
      },
      ImageFrame: {
        type: 'object',
        properties: {
          seriesInstanceUID: { type: 'string' },
          sopInstanceUID: { type: 'string' },
          frameNumber: { type: 'integer' },
          plane: { type: 'string', enum: ['axial', 'coronal', 'sagittal', 'oblique'] },
        },
      },
      Measurement: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['length', 'angle', 'cobb', 'area', 'volume', 'ellipse', 'hu', 'circular', 'bidirectional'] },
          value: { type: 'number' },
          unit: { type: 'string' },
          points: { type: 'array', items: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } } } },
        },
      },
      RadiologyContext: {
        type: 'object',
        properties: {
          modality: { type: 'string' },
          bodyPart: { type: 'string' },
          clinicalHistory: { type: 'string' },
          indication: { type: 'string' },
          patientAge: { type: 'integer' },
          patientSex: { type: 'string', enum: ['M', 'F', 'O'] },
        },
      },
      CertificateRequest: {
        type: 'object',
        properties: {
          commonName: { type: 'string' },
          organization: { type: 'string' },
          userId: { type: 'string' },
          role: { type: 'string' },
          validityDays: { type: 'integer', default: 365 },
        },
      },
      AuditEntryInput: {
        type: 'object',
        properties: {
          reportId: { type: 'string' },
          actor: { type: 'string' },
          action: { type: 'string' },
          detail: { type: 'string' },
        },
      },
    },
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
} as const;

export default openApiSpec;
