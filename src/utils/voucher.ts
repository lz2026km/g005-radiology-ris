/**
 * 电子凭证（收据/付款凭证）工具模块
 * G005 放射科RIS系统
 * 电子凭证管理：生成、验证、查询、作废、打印
 * 
 * 颜色主题：蓝色 #3b82f6（无紫色）
 */

import { z } from 'zod';

// ========== 工具函数 ==========

/**
 * 生成唯一ID（替代uuid库）
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${randomPart2}`;
}

// ========== 常量定义 ==========

/** 凭证主题色 - 蓝色 #3b82f6 */
export const VOUCHER_COLORS = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  background: '#eff6ff',
  backgroundDark: '#1e3a5f',
  text: '#1e40af',
  textLight: '#60a5fa',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  border: '#93c5fd',
} as const;

/** 凭证状态枚举 */
export type VoucherStatus = '有效' | '已作废' | '已冲正' | '待支付';

/** 支付方式枚举 */
export type PaymentMethod = '现金' | '银行卡' | '医保卡' | '支付宝' | '微信' | '其他';

/** 凭证类型枚举 */
export type VoucherType = '检查费' | '药品费' | '材料费' | '治疗费' | '其他';

// ========== Zod 验证模式 ==========

/**
 * 电子凭证项目明细模式
 */
export const VoucherItemSchema = z.object({
  /** 项目编号 */
  itemId: z.string(),
  /** 项目名称 */
  itemName: z.string().min(1, '项目名称不能为空'),
  /** 项目类别 */
  itemType: z.enum(['检查费', '药品费', '材料费', '治疗费', '其他']),
  /** 单价 */
  unitPrice: z.number().positive('单价必须为正数'),
  /** 数量 */
  quantity: z.number().int().positive('数量必须为正整数'),
  /** 金额（小计） */
  subtotal: z.number().positive('小计必须为正数'),
  /** 规格/描述 */
  specification: z.string().optional(),
});

export type VoucherItem = z.infer<typeof VoucherItemSchema>;

/**
 * 电子凭证基础模式
 */
export const VoucherBaseSchema = z.object({
  /** 凭证ID */
  id: z.string(),
  /** 凭证编号（如：V2025012700001） */
  voucherNumber: z.string().min(1, '凭证编号不能为空'),
  /** 患者ID */
  patientId: z.string(),
  /** 患者姓名 */
  patientName: z.string().min(1, '患者姓名不能为空'),
  /** 患者类型 */
  patientType: z.enum(['门诊', '住院', '体检', '急诊']),
  /** 凭证状态 */
  status: z.enum(['有效', '已作废', '已冲正', '待支付']),
  /** 凭证类型 */
  type: z.enum(['检查费', '药品费', '材料费', '治疗费', '其他']),
  /** 凭证金额（总金额） */
  amount: z.number().positive('金额必须为正数'),
  /** 实收金额 */
  receivedAmount: z.number().min(0, '实收金额不能为负'),
  /** 找零金额 */
  changeAmount: z.number().min(0, '找零金额不能为负'),
  /** 支付方式 */
  paymentMethod: z.enum(['现金', '银行卡', '医保卡', '支付宝', '微信', '其他']),
  /** 收费员工ID */
  cashierId: z.string(),
  /** 收费员工姓名 */
  cashierName: z.string(),
  /** 收费时间 */
  paymentTime: z.string(),
  /** 部门/科室 */
  department: z.string(),
  /** 凭证项目明细 */
  items: z.array(VoucherItemSchema).min(1, '至少需要一个收费项目'),
  /** 备注 */
  remark: z.string().optional(),
});

export type VoucherBase = z.infer<typeof VoucherBaseSchema>;

/**
 * 完整电子凭证（含作废/冲正信息）
 */
export const VoucherSchema = VoucherBaseSchema.extend({
  /** 作废时间 */
  voidTime: z.string().optional(),
  /** 作废操作员ID */
  voidOperatorId: z.string().optional(),
  /** 作废操作员姓名 */
  voidOperatorName: z.string().optional(),
  /** 作废原因 */
  voidReason: z.string().optional(),
  /** 冲正凭证ID（原凭证作废后生成的新凭证） */
  reversalVoucherId: z.string().optional(),
  /** 原凭证ID（冲正凭证关联的原凭证） */
  originalVoucherId: z.string().optional(),
  /** 打印次数 */
  printCount: z.number().int().min(0).default(0),
  /** 最后打印时间 */
  lastPrintTime: z.string().optional(),
  /** 创建时间 */
  createdTime: z.string(),
  /** 更新时间 */
  updatedTime: z.string(),
});

export type Voucher = z.infer<typeof VoucherSchema>;

/**
 * 生成新凭证输入模式
 */
export const GenerateVoucherInputSchema = z.object({
  patientId: z.string(),
  patientName: z.string().min(1, '患者姓名不能为空'),
  patientType: z.enum(['门诊', '住院', '体检', '急诊']),
  type: z.enum(['检查费', '药品费', '材料费', '治疗费', '其他']),
  items: z.array(VoucherItemSchema).min(1, '至少需要一个收费项目'),
  paymentMethod: z.enum(['现金', '银行卡', '医保卡', '支付宝', '微信', '其他']),
  cashierId: z.string(),
  cashierName: z.string(),
  department: z.string(),
  remark: z.string().optional(),
});

export type GenerateVoucherInput = z.infer<typeof GenerateVoucherInputSchema>;

/**
 * 作废凭证输入模式
 */
export const VoidVoucherInputSchema = z.object({
  voucherId: z.string(),
  operatorId: z.string(),
  operatorName: z.string(),
  reason: z.string().min(1, '作废原因不能为空'),
});

export type VoidVoucherInput = z.infer<typeof VoidVoucherInputSchema>;

// ========== 内存存储 ==========

/** 凭证存储（生产环境应替换为数据库） */
let voucherStore: Map<string, Voucher> = new Map();

/** 最后生成的凭证号（用于生成连续编号） */
let lastVoucherNumber = 'V202505270001';

/**
 * 生成下一个凭证编号
 */
function generateVoucherNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const baseNumber = `V${year}${month}${day}`;
  
  if (lastVoucherNumber.startsWith(baseNumber)) {
    const seq = parseInt(lastVoucherNumber.slice(-4)) + 1;
    lastVoucherNumber = baseNumber + String(seq).padStart(4, '0');
  } else {
    lastVoucherNumber = baseNumber + '0001';
  }
  
  return lastVoucherNumber;
}

/**
 * 计算金额总和
 */
function calculateTotal(items: VoucherItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

// ========== 模拟数据初始化 ==========

/**
 * 初始化模拟凭证数据（至少10条）
 */
function initializeMockVouchers(): void {
  const mockVouchers: Voucher[] = [
    {
      id: generateId(),
      voucherNumber: 'V202505270001',
      patientId: 'p-001',
      patientName: '张伟',
      patientType: '门诊',
      status: '有效',
      type: '检查费',
      amount: 350.00,
      receivedAmount: 350.00,
      changeAmount: 0,
      paymentMethod: '支付宝',
      cashierId: 'u-001',
      cashierName: '李娜',
      paymentTime: '2025-05-27T08:30:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-001', itemName: 'CT头部平扫', itemType: '检查费', unitPrice: 250.00, quantity: 1, subtotal: 250.00 },
        { itemId: 'mat-001', itemName: '造影剂', itemType: '材料费', unitPrice: 100.00, quantity: 1, subtotal: 100.00 },
      ],
      printCount: 2,
      lastPrintTime: '2025-05-27T08:35:00Z',
      createdTime: '2025-05-27T08:30:00Z',
      updatedTime: '2025-05-27T08:30:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505270002',
      patientId: 'p-002',
      patientName: '王芳',
      patientType: '住院',
      status: '有效',
      type: '检查费',
      amount: 580.00,
      receivedAmount: 600.00,
      changeAmount: 20.00,
      paymentMethod: '银行卡',
      cashierId: 'u-001',
      cashierName: '李娜',
      paymentTime: '2025-05-27T09:15:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-002', itemName: 'MR腰椎平扫', itemType: '检查费', unitPrice: 450.00, quantity: 1, subtotal: 450.00 },
        { itemId: 'mat-002', itemName: '核磁共振造影剂', itemType: '材料费', unitPrice: 130.00, quantity: 1, subtotal: 130.00 },
      ],
      printCount: 1,
      lastPrintTime: '2025-05-27T09:18:00Z',
      createdTime: '2025-05-27T09:15:00Z',
      updatedTime: '2025-05-27T09:15:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505270003',
      patientId: 'p-003',
      patientName: '李明',
      patientType: '门诊',
      status: '有效',
      type: '检查费',
      amount: 180.00,
      receivedAmount: 200.00,
      changeAmount: 20.00,
      paymentMethod: '微信',
      cashierId: 'u-002',
      cashierName: '赵红',
      paymentTime: '2025-05-27T10:00:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-003', itemName: 'DR胸部正侧位', itemType: '检查费', unitPrice: 140.00, quantity: 1, subtotal: 140.00 },
        { itemId: 'mat-003', itemName: 'X光胶片', itemType: '材料费', unitPrice: 40.00, quantity: 1, subtotal: 40.00 },
      ],
      printCount: 1,
      lastPrintTime: '2025-05-27T10:02:00Z',
      createdTime: '2025-05-27T10:00:00Z',
      updatedTime: '2025-05-27T10:00:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505260001',
      patientId: 'p-004',
      patientName: '刘洋',
      patientType: '体检',
      status: '有效',
      type: '检查费',
      amount: 450.00,
      receivedAmount: 450.00,
      changeAmount: 0,
      paymentMethod: '医保卡',
      cashierId: 'u-001',
      cashierName: '李娜',
      paymentTime: '2025-05-26T14:20:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-004', itemName: 'CT腹部平扫', itemType: '检查费', unitPrice: 350.00, quantity: 1, subtotal: 350.00 },
        { itemId: 'mat-004', itemName: '碘佛醇造影剂', itemType: '材料费', unitPrice: 100.00, quantity: 1, subtotal: 100.00 },
      ],
      printCount: 3,
      lastPrintTime: '2025-05-26T15:00:00Z',
      createdTime: '2025-05-26T14:20:00Z',
      updatedTime: '2025-05-26T14:20:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505260002',
      patientId: 'p-005',
      patientName: '陈静',
      patientType: '急诊',
      status: '已作废',
      type: '检查费',
      amount: 280.00,
      receivedAmount: 280.00,
      changeAmount: 0,
      paymentMethod: '现金',
      cashierId: 'u-002',
      cashierName: '赵红',
      paymentTime: '2025-05-26T16:30:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-005', itemName: 'CT胸部平扫', itemType: '检查费', unitPrice: 280.00, quantity: 1, subtotal: 280.00 },
      ],
      voidTime: '2025-05-26T17:00:00Z',
      voidOperatorId: 'u-003',
      voidOperatorName: '周明',
      voidReason: '患者重复缴费，已退款',
      printCount: 1,
      createdTime: '2025-05-26T16:30:00Z',
      updatedTime: '2025-05-26T17:00:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505250001',
      patientId: 'p-006',
      patientName: '赵强',
      patientType: '门诊',
      status: '有效',
      type: '检查费',
      amount: 620.00,
      receivedAmount: 620.00,
      changeAmount: 0,
      paymentMethod: '支付宝',
      cashierId: 'u-001',
      cashierName: '李娜',
      paymentTime: '2025-05-25T09:00:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-006', itemName: 'DSA脑血管造影', itemType: '检查费', unitPrice: 520.00, quantity: 1, subtotal: 520.00 },
        { itemId: 'mat-005', itemName: '介入耗材包', itemType: '材料费', unitPrice: 100.00, quantity: 1, subtotal: 100.00 },
      ],
      printCount: 2,
      lastPrintTime: '2025-05-25T09:10:00Z',
      createdTime: '2025-05-25T09:00:00Z',
      updatedTime: '2025-05-25T09:00:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505250002',
      patientId: 'p-007',
      patientName: '孙莉',
      patientType: '住院',
      status: '有效',
      type: '检查费',
      amount: 800.00,
      receivedAmount: 800.00,
      changeAmount: 0,
      paymentMethod: '银行卡',
      cashierId: 'u-002',
      cashierName: '赵红',
      paymentTime: '2025-05-25T11:30:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-007', itemName: 'PET-CT全身扫描', itemType: '检查费', unitPrice: 800.00, quantity: 1, subtotal: 800.00 },
      ],
      printCount: 1,
      lastPrintTime: '2025-05-25T11:35:00Z',
      createdTime: '2025-05-25T11:30:00Z',
      updatedTime: '2025-05-25T11:30:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505240001',
      patientId: 'p-008',
      patientName: '周涛',
      patientType: '门诊',
      status: '已冲正',
      type: '检查费',
      amount: 350.00,
      receivedAmount: 0,
      changeAmount: 0,
      paymentMethod: '现金',
      cashierId: 'u-001',
      cashierName: '李娜',
      paymentTime: '2025-05-24T08:00:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-008', itemName: 'CT头部增强', itemType: '检查费', unitPrice: 350.00, quantity: 1, subtotal: 350.00 },
      ],
      voidTime: '2025-05-24T10:00:00Z',
      voidOperatorId: 'u-001',
      voidOperatorName: '李娜',
      voidReason: '收费错误，已冲正',
      reversalVoucherId: 'v-reversal-001',
      printCount: 0,
      createdTime: '2025-05-24T08:00:00Z',
      updatedTime: '2025-05-24T10:00:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505240002',
      patientId: 'p-009',
      patientName: '吴婷',
      patientType: '体检',
      status: '有效',
      type: '检查费',
      amount: 280.00,
      receivedAmount: 280.00,
      changeAmount: 0,
      paymentMethod: '微信',
      cashierId: 'u-002',
      cashierName: '赵红',
      paymentTime: '2025-05-24T14:00:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-009', itemName: '乳腺钼靶检查', itemType: '检查费', unitPrice: 220.00, quantity: 1, subtotal: 220.00 },
        { itemId: 'mat-006', itemName: '乳腺专用胶片', itemType: '材料费', unitPrice: 60.00, quantity: 1, subtotal: 60.00 },
      ],
      printCount: 1,
      lastPrintTime: '2025-05-24T14:05:00Z',
      createdTime: '2025-05-24T14:00:00Z',
      updatedTime: '2025-05-24T14:00:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505230001',
      patientId: 'p-010',
      patientName: '郑伟',
      patientType: '住院',
      status: '有效',
      type: '检查费',
      amount: 1500.00,
      receivedAmount: 1500.00,
      changeAmount: 0,
      paymentMethod: '医保卡',
      cashierId: 'u-001',
      cashierName: '李娜',
      paymentTime: '2025-05-23T10:00:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-010', itemName: 'SPECT骨扫描', itemType: '检查费', unitPrice: 1200.00, quantity: 1, subtotal: 1200.00 },
        { itemId: 'mat-007', itemName: '放射性示踪剂', itemType: '材料费', unitPrice: 300.00, quantity: 1, subtotal: 300.00 },
      ],
      remark: '医保结算患者',
      printCount: 2,
      lastPrintTime: '2025-05-23T10:15:00Z',
      createdTime: '2025-05-23T10:00:00Z',
      updatedTime: '2025-05-23T10:00:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505230002',
      patientId: 'p-011',
      patientName: '黄丽',
      patientType: '门诊',
      status: '待支付',
      type: '检查费',
      amount: 420.00,
      receivedAmount: 0,
      changeAmount: 0,
      paymentMethod: '银行卡',
      cashierId: 'u-002',
      cashierName: '赵红',
      paymentTime: '2025-05-23T15:30:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-011', itemName: 'MR膝关节平扫', itemType: '检查费', unitPrice: 380.00, quantity: 1, subtotal: 380.00 },
        { itemId: 'mat-008', itemName: '磁共振线缆', itemType: '材料费', unitPrice: 40.00, quantity: 1, subtotal: 40.00 },
      ],
      printCount: 0,
      createdTime: '2025-05-23T15:30:00Z',
      updatedTime: '2025-05-23T15:30:00Z',
    },
    {
      id: generateId(),
      voucherNumber: 'V202505220001',
      patientId: 'p-012',
      patientName: '林峰',
      patientType: '急诊',
      status: '有效',
      type: '检查费',
      amount: 520.00,
      receivedAmount: 550.00,
      changeAmount: 30.00,
      paymentMethod: '现金',
      cashierId: 'u-001',
      cashierName: '李娜',
      paymentTime: '2025-05-22T22:00:00Z',
      department: '放射科',
      items: [
        { itemId: 'exam-012', itemName: 'CT腹部增强', itemType: '检查费', unitPrice: 420.00, quantity: 1, subtotal: 420.00 },
        { itemId: 'mat-009', itemName: '碘海醇造影剂', itemType: '材料费', unitPrice: 100.00, quantity: 1, subtotal: 100.00 },
      ],
      remark: '急诊患者绿色通道',
      printCount: 1,
      lastPrintTime: '2025-05-22T22:05:00Z',
      createdTime: '2025-05-22T22:00:00Z',
      updatedTime: '2025-05-22T22:00:00Z',
    },
  ];

  // 初始化存储
  mockVouchers.forEach(v => voucherStore.set(v.id, v));
  
  // 更新最后凭证编号
  lastVoucherNumber = 'V202505270003';
}

// 初始化模拟数据
initializeMockVouchers();

// ========== 导出函数实现 ==========

/**
 * 生成电子凭证
 * @param input 凭证生成输入参数
 * @returns 生成成功的凭证对象
 * @throws 验证失败时抛出错误
 */
export function generateVoucher(input: GenerateVoucherInput): Voucher {
  // 验证输入
  const validationResult = GenerateVoucherInputSchema.safeParse(input);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    throw new Error(`凭证生成验证失败: ${errors.join(', ')}`);
  }

  // 计算每个项目的金额
  const itemsWithSubtotal = input.items.map(item => ({
    ...item,
    subtotal: item.unitPrice * item.quantity,
  }));

  // 计算总金额
  const totalAmount = calculateTotal(itemsWithSubtotal);

  // 生成凭证
  const now = new Date().toISOString();
  const voucher: Voucher = {
    id: generateId(),
    voucherNumber: generateVoucherNumber(),
    patientId: input.patientId,
    patientName: input.patientName,
    patientType: input.patientType,
    status: '有效',
    type: input.type,
    amount: totalAmount,
    receivedAmount: 0,
    changeAmount: 0,
    paymentMethod: input.paymentMethod,
    cashierId: input.cashierId,
    cashierName: input.cashierName,
    paymentTime: now,
    department: input.department,
    items: itemsWithSubtotal,
    remark: input.remark,
    printCount: 0,
    createdTime: now,
    updatedTime: now,
  };

  // 存储凭证
  voucherStore.set(voucher.id, voucher);

  return voucher;
}

/**
 * 验证凭证有效性
 * @param voucherId 凭证ID
 * @returns 验证结果，包含凭证是否有效及详细信息
 */
export function validateVoucher(voucherId: string): { valid: boolean; voucher?: Voucher; error?: string } {
  // 查找凭证
  const voucher = voucherStore.get(voucherId);
  
  if (!voucher) {
    return { valid: false, error: '凭证不存在' };
  }

  // 检查凭证状态
  if (voucher.status === '已作废') {
    return { valid: false, voucher, error: '凭证已作废' };
  }

  if (voucher.status === '已冲正') {
    return { valid: false, voucher, error: '凭证已冲正' };
  }

  // 验证金额一致性
  const calculatedAmount = calculateTotal(voucher.items);
  if (Math.abs(voucher.amount - calculatedAmount) > 0.01) {
    return { valid: false, voucher, error: '凭证金额与项目明细不一致' };
  }

  // 验证打印次数合理性
  if (voucher.printCount > 10) {
    return { valid: false, voucher, error: '打印次数异常，可能存在重复打印' };
  }

  return { valid: true, voucher };
}

/**
 * 根据ID获取凭证
 * @param voucherId 凭证ID
 * @returns 凭证对象，若不存在则返回undefined
 */
export function getVoucherById(voucherId: string): Voucher | undefined {
  return voucherStore.get(voucherId);
}

/**
 * 获取凭证编号对应的凭证
 * @param voucherNumber 凭证编号
 * @returns 凭证对象，若不存在则返回undefined
 */
export function getVoucherByNumber(voucherNumber: string): Voucher | undefined {
  const vouchers = Array.from(voucherStore.values());
  for (const voucher of vouchers) {
    if (voucher.voucherNumber === voucherNumber) {
      return voucher;
    }
  }
  return undefined;
}

/**
 * 列出所有凭证（支持分页和过滤）
 * @param options 查询选项
 * @returns 符合条件的凭证列表和总数
 */
export function listVouchers(options?: {
  patientId?: string;
  patientName?: string;
  status?: VoucherStatus;
  type?: VoucherType;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): { vouchers: Voucher[]; total: number; page: number; pageSize: number; totalPages: number } {
  const {
    patientId,
    patientName,
    status,
    type,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
  } = options || {};

  // 过滤凭证
  let filtered = Array.from(voucherStore.values());

  if (patientId) {
    filtered = filtered.filter(v => v.patientId === patientId);
  }

  if (patientName) {
    filtered = filtered.filter(v => v.patientName.includes(patientName));
  }

  if (status) {
    filtered = filtered.filter(v => v.status === status);
  }

  if (type) {
    filtered = filtered.filter(v => v.type === type);
  }

  if (startDate) {
    filtered = filtered.filter(v => v.paymentTime >= startDate);
  }

  if (endDate) {
    filtered = filtered.filter(v => v.paymentTime <= endDate);
  }

  // 按时间倒序排序
  filtered.sort((a, b) => new Date(b.paymentTime).getTime() - new Date(a.paymentTime).getTime());

  // 计算分页
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const vouchers = filtered.slice(startIndex, startIndex + pageSize);

  return { vouchers, total, page, pageSize, totalPages };
}

/**
 * 作废凭证
 * @param input 作废输入参数
 * @returns 作废后的凭证对象
 * @throws 验证失败或凭证已作废时抛出错误
 */
export function voidVoucher(input: VoidVoucherInput): Voucher {
  // 验证输入
  const validationResult = VoidVoucherInputSchema.safeParse(input);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    throw new Error(`作废凭证验证失败: ${errors.join(', ')}`);
  }

  // 查找凭证
  const voucher = voucherStore.get(input.voucherId);
  
  if (!voucher) {
    throw new Error('凭证不存在');
  }

  // 检查凭证状态
  if (voucher.status === '已作废') {
    throw new Error('凭证已作废，无法重复作废');
  }

  if (voucher.status === '已冲正') {
    throw new Error('凭证已冲正，无法作废');
  }

  // 更新凭证状态
  const now = new Date().toISOString();
  const updatedVoucher: Voucher = {
    ...voucher,
    status: '已作废',
    voidTime: now,
    voidOperatorId: input.operatorId,
    voidOperatorName: input.operatorName,
    voidReason: input.reason,
    updatedTime: now,
  };

  // 保存更新
  voucherStore.set(voucher.id, updatedVoucher);

  return updatedVoucher;
}

/**
 * 打印凭证
 * @param voucherId 凭证ID
 * @returns 更新后的凭证对象，包含打印信息
 * @throws 凭证不存在或已作废时抛出错误
 */
export function printVoucher(voucherId: string): Voucher {
  const voucher = voucherStore.get(voucherId);
  
  if (!voucher) {
    throw new Error('凭证不存在');
  }

  if (voucher.status === '已作废') {
    throw new Error('已作废的凭证无法打印');
  }

  if (voucher.status === '已冲正') {
    throw new Error('已冲正的凭证无法打印');
  }

  // 更新打印信息
  const now = new Date().toISOString();
  const updatedVoucher: Voucher = {
    ...voucher,
    printCount: voucher.printCount + 1,
    lastPrintTime: now,
    updatedTime: now,
  };

  voucherStore.set(voucher.id, updatedVoucher);

  return updatedVoucher;
}

/**
 * 生成凭证打印格式数据
 * @param voucherId 凭证ID
 * @returns 用于打印的凭证数据格式
 */
export function getVoucherPrintData(voucherId: string): {
  voucher: Voucher;
  printTime: string;
  hospitalName: string;
  template: 'standard' | 'reprint';
} {
  const voucher = voucherStore.get(voucherId);
  
  if (!voucher) {
    throw new Error('凭证不存在');
  }

  return {
    voucher,
    printTime: new Date().toISOString(),
    hospitalName: '某医院放射科',
    template: voucher.printCount > 0 ? 'reprint' : 'standard',
  };
}

/**
 * 根据患者ID获取凭证列表
 * @param patientId 患者ID
 * @returns 该患者的所有有效凭证
 */
export function getVouchersByPatientId(patientId: string): Voucher[] {
  return Array.from(voucherStore.values())
    .filter(v => v.patientId === patientId && v.status === '有效')
    .sort((a, b) => new Date(b.paymentTime).getTime() - new Date(a.paymentTime).getTime());
}

/**
 * 获取今日凭证统计
 * @returns 今日凭证统计信息
 */
export function getTodayVoucherStats(): {
  totalCount: number;
  totalAmount: number;
  byStatus: Record<VoucherStatus, number>;
  byPaymentMethod: Record<PaymentMethod, number>;
} {
  const today = new Date().toISOString().split('T')[0];
  
  const todayVouchers = Array.from(voucherStore.values())
    .filter(v => v.paymentTime.startsWith(today));

  const stats = {
    totalCount: todayVouchers.length,
    totalAmount: todayVouchers.reduce((sum, v) => sum + v.amount, 0),
    byStatus: {
      '有效': 0,
      '已作废': 0,
      '已冲正': 0,
      '待支付': 0,
    } as Record<VoucherStatus, number>,
    byPaymentMethod: {
      '现金': 0,
      '银行卡': 0,
      '医保卡': 0,
      '支付宝': 0,
      '微信': 0,
      '其他': 0,
    } as Record<PaymentMethod, number>,
  };

  todayVouchers.forEach(v => {
    stats.byStatus[v.status]++;
    stats.byPaymentMethod[v.paymentMethod]++;
  });

  return stats;
}

// ========== 重新导出类型 ==========
// 类型已在 Zod Schema 定义时同步导出（如：export type Voucher = z.infer<typeof VoucherSchema>）
// 此处无需重复导出