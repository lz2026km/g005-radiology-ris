export type SettlementStatus = 'pending' | 'submitted' | 'approved' | 'partially_paid' | 'paid' | 'denied' | 'appealing'
export type PayerType = '医保(城镇职工)' | '医保(城乡居民)' | '商业保险' | '自费' | '公费/其他'

export interface InsuranceSettlementDto {
  id: string
  patientId: string
  patientName: string
  examItem: string
  examDate: string
  payer: PayerType
  totalAmount: number
  insuranceShare: number
  patientShare: number
  settlementDate?: string
  status: SettlementStatus
  claimBatchId?: string
  denialReason?: string
  notes?: string
}

export interface ClaimSubmissionDto {
  settlementIds: string[]
  batchNotes?: string
}

export interface ClaimBatchDto {
  id: string
  batchNo: string
  submittedDate: string
  totalAmount: number
  itemCount: number
  status: 'pending' | 'submitted' | 'processing' | 'completed' | 'rejected'
}

const MOCK_SETTLEMENTS: InsuranceSettlementDto[] = [
  { id: 'st-001', patientId: 'P2024001', patientName: '张伟', examItem: 'CT增强(胸部)', examDate: '2026-04-15', payer: '医保(城镇职工)', totalAmount: 850, insuranceShare: 595, patientShare: 255, settlementDate: '2026-04-20', status: 'paid' },
  { id: 'st-002', patientId: 'P2024002', patientName: '李娜', examItem: 'MRI平扫(头颅)', examDate: '2026-04-16', payer: '医保(城镇职工)', totalAmount: 780, insuranceShare: 546, patientShare: 234, settlementDate: '2026-04-21', status: 'paid' },
  { id: 'st-003', patientId: 'P2024003', patientName: '王磊', examItem: '冠脉CTA', examDate: '2026-04-17', payer: '商业保险', totalAmount: 1500, insuranceShare: 1200, patientShare: 300, settlementDate: '2026-04-22', status: 'approved' },
  { id: 'st-004', patientId: 'P2024004', patientName: '赵敏', examItem: 'DSA冠脉造影', examDate: '2026-04-18', payer: '医保(城乡居民)', totalAmount: 8500, insuranceShare: 5950, patientShare: 2550, status: 'submitted' },
  { id: 'st-005', patientId: 'P2024005', patientName: '周涛', examItem: 'MRI增强(腹部)', examDate: '2026-04-19', payer: '医保(城镇职工)', totalAmount: 1200, insuranceShare: 840, patientShare: 360, status: 'pending' },
  { id: 'st-006', patientId: 'P2024006', patientName: '吴静', examItem: 'CT平扫(头颅)', examDate: '2026-04-20', payer: '自费', totalAmount: 450, insuranceShare: 0, patientShare: 450, settlementDate: '2026-04-25', status: 'paid' },
  { id: 'st-007', patientId: 'P2024007', patientName: '郑强', examItem: 'DSA外周血管', examDate: '2026-04-21', payer: '商业保险', totalAmount: 6800, insuranceShare: 5440, patientShare: 1360, status: 'denied', denialReason: '检查项目不在保险覆盖范围' },
  { id: 'st-008', patientId: 'P2024008', patientName: '钱琳', examItem: '乳腺钼靶(双乳)', examDate: '2026-04-22', payer: '医保(城镇职工)', totalAmount: 280, insuranceShare: 196, patientShare: 84, settlementDate: '2026-04-26', status: 'paid' },
  { id: 'st-009', patientId: 'P2024009', patientName: '孙鹏', examItem: '冠脉CTA', examDate: '2026-04-23', payer: '商业保险', totalAmount: 1500, insuranceShare: 1200, patientShare: 300, status: 'appealing', denialReason: '需要补充诊断证明' },
  { id: 'st-010', patientId: 'P2024010', patientName: '马超', examItem: 'CT增强(腹部)', examDate: '2026-04-24', payer: '医保(城镇职工)', totalAmount: 850, insuranceShare: 595, patientShare: 255, status: 'submitted' },
  { id: 'st-011', patientId: 'P2024011', patientName: '胡霞', examItem: 'MRI平扫(头颅)', examDate: '2026-04-25', payer: '医保(城乡居民)', totalAmount: 780, insuranceShare: 468, patientShare: 312, status: 'pending' },
  { id: 'st-012', patientId: 'P2024012', patientName: '林峰', examItem: 'CT低剂量肺筛查', examDate: '2026-04-26', payer: '自费', totalAmount: 320, insuranceShare: 0, patientShare: 320, settlementDate: '2026-04-28', status: 'paid' },
]

const MOCK_BATCHES: ClaimBatchDto[] = [
  { id: 'batch-001', batchNo: 'CL-202604-001', submittedDate: '2026-04-25', totalAmount: 25830, itemCount: 12, status: 'completed' },
  { id: 'batch-002', batchNo: 'CL-202604-002', submittedDate: '2026-04-28', totalAmount: 19350, itemCount: 8, status: 'processing' },
]

export const insuranceSettlementService = {
  list: async (params?: { status?: SettlementStatus; payer?: string; search?: string }): Promise<InsuranceSettlementDto[]> => {
    let items = [...MOCK_SETTLEMENTS]
    if (params?.status) items = items.filter(i => i.status === params.status)
    if (params?.payer && params.payer !== 'all') items = items.filter(i => i.payer === params.payer)
    if (params?.search) {
      const q = params.search.toLowerCase()
      items = items.filter(i => i.patientName.toLowerCase().includes(q) || i.examItem.toLowerCase().includes(q))
    }
    return items
  },

  getById: async (id: string): Promise<InsuranceSettlementDto | undefined> =>
    MOCK_SETTLEMENTS.find(i => i.id === id),

  submitClaim: async (dto: ClaimSubmissionDto): Promise<ClaimBatchDto> => ({
    id: `batch-${Date.now()}`,
    batchNo: `CL-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(MOCK_BATCHES.length + 1).padStart(3, '0')}`,
    submittedDate: new Date().toISOString().slice(0, 10),
    totalAmount: dto.settlementIds.reduce((sum, id) => {
      const s = MOCK_SETTLEMENTS.find(i => i.id === id)
      return sum + (s?.totalAmount || 0)
    }, 0),
    itemCount: dto.settlementIds.length,
    status: 'submitted',
  }),

  getBatches: async (): Promise<ClaimBatchDto[]> =>
    [...MOCK_BATCHES],

  getBatchById: async (id: string): Promise<ClaimBatchDto | undefined> =>
    MOCK_BATCHES.find(b => b.id === id),

  reconcile: async (settlementId: string, paidAmount: number): Promise<InsuranceSettlementDto | undefined> => {
    const s = MOCK_SETTLEMENTS.find(i => i.id === settlementId)
    if (!s) return undefined
    s.status = paidAmount >= s.insuranceShare ? 'paid' : 'partially_paid'
    s.settlementDate = new Date().toISOString().slice(0, 10)
    return { ...s }
  },
}
