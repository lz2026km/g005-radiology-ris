// ============================================================
// G005 放射科RIS系统 - 医保审核页面
// CT对比剂 / MRI对比剂 / DSA抗凝药物 医保限制审核
// ============================================================
import { useState, useMemo } from 'react'
import {
  ShieldCheck, Clock, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  FileText, Pill, Stethoscope, User, Calendar, MessageSquare,
  Check, X, Send, BookOpen, ClipboardList, Activity,
  Scan, Syringe, Heart, AlertOctagon, BarChart3, Settings,
  TrendingUp, CheckSquare, XSquare, Clock3
} from 'lucide-react'

// ---------- 类型定义 ----------
interface PendingAudit {
  id: string
  patientName: string
  patientId: string
  examType: string
  examItem: string
  drugName: string
  drugCategory: string
  drugSpec: string
  restriction: string
  reason: string
  submitTime: string
  submitDept: string
  urgency: '高' | '中' | '低'
}

interface AuditHistory {
  id: number
  patientName: string
  patientId: string
  examType: string
  examItem: string
  drugName: string
  drugCategory: string
  result: '通过' | '拒绝' | '补充资料'
  auditor: string
  auditTime: string
  reason?: string
}

interface RestrictedDrug {
  id: number
  name: string
  category: string
  restriction: string
  applicableExams: string
  notes: string
}

interface IndicationRule {
  id: number
  examType: string
  examName: string
  drugName: string
  drugCategory: string
  insuranceRequirement: string
  description: string
}

interface StatsData {
  passRate: number
  totalPending: number
  todayProcessed: number
  avgReviewTime: string
}

// ---------- 演示数据 ----------

const pendingAudits: PendingAudit[] = [
  { id: 'AUD001', patientName: '张伟', patientId: 'P202400001', examType: 'CT增强', examItem: '头颅CT增强', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', drugSpec: '50ml:15g', restriction: '限CT增强检查使用', reason: '申请使用碘海醇注射液行头颅CT增强检查', submitTime: '2026-05-02 08:30', submitDept: '神经内科', urgency: '高' },
  { id: 'AUD002', patientName: '李娜', patientId: 'P202400002', examType: 'MRI增强', examItem: '头颅MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:7.5mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆喷酸葡胺注射液行头颅MRI增强检查', submitTime: '2026-05-02 09:15', submitDept: '肿瘤科', urgency: '中' },
  { id: 'AUD003', patientName: '王磊', patientId: 'P202400003', examType: 'DSA手术', examItem: '脑血管DSA', drugName: '比伐卢定注射液', drugCategory: '抗凝药物', drugSpec: '0.6ml:5000IU', restriction: '限DSA手术使用', reason: '申请使用比伐卢定注射液行脑血管DSA检查', submitTime: '2026-05-02 10:20', submitDept: '血管外科', urgency: '低' },
  { id: 'AUD004', patientName: '赵敏', patientId: 'P202400004', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:32g', restriction: '限CT增强检查使用', reason: '申请使用碘克沙醇注射液行腹部CT增强检查', submitTime: '2026-05-02 11:45', submitDept: '消化内科', urgency: '高' },
  { id: 'AUD005', patientName: '周涛', patientId: 'P202400005', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆布醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:2.5mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆布醇注射液行前列腺MRI增强检查', submitTime: '2026-05-02 13:00', submitDept: '泌尿外科', urgency: '中' },
  { id: 'AUD006', patientName: '吴静', patientId: 'P202400006', examType: 'DSA手术', examItem: '心脏DSA', drugName: '肝素钠注射液', drugCategory: '抗凝药物', drugSpec: '12500U/支', restriction: '限DSA手术使用', reason: '申请使用肝素钠注射液行心脏DSA检查', submitTime: '2026-05-02 14:30', submitDept: '心内科', urgency: '低' },
  { id: 'AUD007', patientName: '郑强', patientId: 'P202400007', examType: 'CT增强', examItem: '肺动脉CTA', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:61.2g', restriction: '限CT增强检查使用', reason: '申请使用碘普罗胺注射液行肺动脉CTA检查', submitTime: '2026-05-02 15:45', submitDept: '呼吸内科', urgency: '高' },
  { id: 'AUD008', patientName: '钱琳', patientId: 'P202400008', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆贝葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g', restriction: '限MRI增强检查使用', reason: '申请使用钆贝葡胺注射液行乳腺MRI增强检查', submitTime: '2026-05-02 16:00', submitDept: '乳腺外科', urgency: '中' },
  { id: 'AUD009', patientName: '孙鹏', patientId: 'P202400009', examType: 'DSA手术', examItem: '肾动脉DSA', drugName: '磺达肝癸钠注射液', drugCategory: '抗凝药物', drugSpec: '2.5mg/支', restriction: '限DSA手术使用', reason: '申请使用磺达肝癸钠注射液行肾动脉DSA检查', submitTime: '2026-05-02 17:15', submitDept: '肾内科', urgency: '低' },
  { id: 'AUD010', patientName: '马超', patientId: 'P202400010', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘佛醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:35g', restriction: '限CT增强检查使用', reason: '申请使用碘佛醇注射液行冠脉CTA检查', submitTime: '2026-05-03 08:00', submitDept: '心内科', urgency: '高' },
  { id: 'AUD011', patientName: '胡霞', patientId: 'P202400011', examType: 'MRI增强', examItem: '腹部MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g', restriction: '限MRI增强检查使用', reason: '申请使用钆双胺注射液行腹部MRI增强检查', submitTime: '2026-05-03 09:30', submitDept: '消化内科', urgency: '中' },
  { id: 'AUD012', patientName: '林峰', patientId: 'P202400012', examType: 'DSA手术', examItem: '外周血管DSA', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', drugSpec: '20mg/支', restriction: '限DSA手术使用', reason: '申请使用阿加曲班注射液行外周血管DSA检查', submitTime: '2026-05-03 10:45', submitDept: '血管外科', urgency: '低' },
  { id: 'AUD013', patientName: '董洁', patientId: 'P202400013', examType: 'CT增强', examItem: '头颅CT增强', drugName: '碘帕醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:37g', restriction: '限CT增强检查使用', reason: '申请使用碘帕醇注射液行头颅CT增强检查', submitTime: '2026-05-03 11:30', submitDept: '神经内科', urgency: '高' },
  { id: 'AUD014', patientName: '杨帆', patientId: 'P202400014', examType: 'MRI增强', examItem: '头颅MRI增强', drugName: '钆特醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:3.0mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆特醇注射液行头颅MRI增强检查', submitTime: '2026-05-03 13:00', submitDept: '神经外科', urgency: '中' },
  { id: 'AUD015', patientName: '蒋伟', patientId: 'P202400015', examType: 'DSA手术', examItem: '脑血管DSA', drugName: '利伐沙班片', drugCategory: '抗凝药物', drugSpec: '20mg/片', restriction: '限DSA手术使用', reason: '申请使用利伐沙班片行脑血管DSA检查', submitTime: '2026-05-03 14:15', submitDept: '神经内科', urgency: '低' },
  { id: 'AUD016', patientName: '刘洋', patientId: 'P202400016', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', drugSpec: '50ml:15g', restriction: '限CT增强检查使用', reason: '申请使用碘海醇注射液行腹部CT增强检查', submitTime: '2026-05-03 15:30', submitDept: '肿瘤科', urgency: '高' },
  { id: 'AUD017', patientName: '陈静', patientId: 'P202400017', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:7.5mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆喷酸葡胺注射液行前列腺MRI增强检查', submitTime: '2026-05-03 16:45', submitDept: '泌尿外科', urgency: '中' },
  { id: 'AUD018', patientName: '黄志明', patientId: 'P202400018', examType: 'DSA手术', examItem: '心脏DSA', drugName: '比伐卢定注射液', drugCategory: '抗凝药物', drugSpec: '0.6ml:5000IU', restriction: '限DSA手术使用', reason: '申请使用比伐卢定注射液行心脏DSA检查', submitTime: '2026-05-03 17:00', submitDept: '心内科', urgency: '低' },
  { id: 'AUD019', patientName: '徐敏', patientId: 'P202400019', examType: 'CT增强', examItem: '肺动脉CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:32g', restriction: '限CT增强检查使用', reason: '申请使用碘克沙醇注射液行肺动脉CTA检查', submitTime: '2026-05-04 08:15', submitDept: '呼吸内科', urgency: '高' },
  { id: 'AUD020', patientName: '高建', patientId: 'P202400020', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆布醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:2.5mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆布醇注射液行乳腺MRI增强检查', submitTime: '2026-05-04 09:30', submitDept: '乳腺外科', urgency: '中' },
  { id: 'AUD021', patientName: '何婷', patientId: 'P202400021', examType: 'DSA手术', examItem: '肾动脉DSA', drugName: '肝素钠注射液', drugCategory: '抗凝药物', drugSpec: '12500U/支', restriction: '限DSA手术使用', reason: '申请使用肝素钠注射液行肾动脉DSA检查', submitTime: '2026-05-04 10:45', submitDept: '肾内科', urgency: '低' },
  { id: 'AUD022', patientName: '许刚', patientId: 'P202400022', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:61.2g', restriction: '限CT增强检查使用', reason: '申请使用碘普罗胺注射液行冠脉CTA检查', submitTime: '2026-05-04 11:00', submitDept: '心内科', urgency: '高' },
  { id: 'AUD023', patientName: '曹娟', patientId: 'P202400023', examType: 'MRI增强', examItem: '腹部MRI增强', drugName: '钆贝葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g', restriction: '限MRI增强检查使用', reason: '申请使用钆贝葡胺注射液行腹部MRI增强检查', submitTime: '2026-05-04 12:15', submitDept: '消化内科', urgency: '中' },
  { id: 'AUD024', patientName: '冯强', patientId: 'P202400024', examType: 'DSA手术', examItem: '外周血管DSA', drugName: '磺达肝癸钠注射液', drugCategory: '抗凝药物', drugSpec: '2.5mg/支', restriction: '限DSA手术使用', reason: '申请使用磺达肝癸钠注射液行外周血管DSA检查', submitTime: '2026-05-04 13:30', submitDept: '血管外科', urgency: '低' },
  { id: 'AUD025', patientName: '贺磊', patientId: 'P202400025', examType: 'CT增强', examItem: '头颅CT增强', drugName: '碘佛醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:35g', restriction: '限CT增强检查使用', reason: '申请使用碘佛醇注射液行头颅CT增强检查', submitTime: '2026-05-04 14:45', submitDept: '神经内科', urgency: '高' },
  { id: 'AUD026', patientName: '贺娟', patientId: 'P202400026', examType: 'MRI增强', examItem: '头颅MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g', restriction: '限MRI增强检查使用', reason: '申请使用钆双胺注射液行头颅MRI增强检查', submitTime: '2026-05-04 15:00', submitDept: '神经外科', urgency: '中' },
  { id: 'AUD027', patientName: '贺志强', patientId: 'P202400027', examType: 'DSA手术', examItem: '脑血管DSA', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', drugSpec: '20mg/支', restriction: '限DSA手术使用', reason: '申请使用阿加曲班注射液行脑血管DSA检查', submitTime: '2026-05-04 16:15', submitDept: '神经内科', urgency: '低' },
  { id: 'AUD028', patientName: '贺梅', patientId: 'P202400028', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘帕醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:37g', restriction: '限CT增强检查使用', reason: '申请使用碘帕醇注射液行腹部CT增强检查', submitTime: '2026-05-04 17:30', submitDept: '肿瘤科', urgency: '高' },
  { id: 'AUD029', patientName: '贺勇', patientId: 'P202400029', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆特醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:3.0mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆特醇注射液行前列腺MRI增强检查', submitTime: '2026-05-05 08:00', submitDept: '泌尿外科', urgency: '中' },
  { id: 'AUD030', patientName: '贺丽', patientId: 'P202400030', examType: 'DSA手术', examItem: '心脏DSA', drugName: '利伐沙班片', drugCategory: '抗凝药物', drugSpec: '20mg/片', restriction: '限DSA手术使用', reason: '申请使用利伐沙班片行心脏DSA检查', submitTime: '2026-05-05 09:15', submitDept: '心内科', urgency: '低' },
  { id: 'AUD031', patientName: '贺鹏', patientId: 'P202400031', examType: 'CT增强', examItem: '肺动脉CTA', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', drugSpec: '50ml:15g', restriction: '限CT增强检查使用', reason: '申请使用碘海醇注射液行肺动脉CTA检查', submitTime: '2026-05-05 10:30', submitDept: '呼吸内科', urgency: '高' },
  { id: 'AUD032', patientName: '贺洁', patientId: 'P202400032', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:7.5mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆喷酸葡胺注射液行乳腺MRI增强检查', submitTime: '2026-05-05 11:45', submitDept: '乳腺外科', urgency: '中' },
  { id: 'AUD033', patientName: '贺刚', patientId: 'P202400033', examType: 'DSA手术', examItem: '肾动脉DSA', drugName: '比伐卢定注射液', drugCategory: '抗凝药物', drugSpec: '0.6ml:5000IU', restriction: '限DSA手术使用', reason: '申请使用比伐卢定注射液行肾动脉DSA检查', submitTime: '2026-05-05 13:00', submitDept: '肾内科', urgency: '低' },
  { id: 'AUD034', patientName: '贺霞', patientId: 'P202400034', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:32g', restriction: '限CT增强检查使用', reason: '申请使用碘克沙醇注射液行冠脉CTA检查', submitTime: '2026-05-05 14:15', submitDept: '心内科', urgency: '高' },
  { id: 'AUD035', patientName: '贺峰', patientId: 'P202400035', examType: 'MRI增强', examItem: '腹部MRI增强', drugName: '钆布醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:2.5mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆布醇注射液行腹部MRI增强检查', submitTime: '2026-05-05 15:30', submitDept: '消化内科', urgency: '中' },
  { id: 'AUD036', patientName: '贺敏', patientId: 'P202400036', examType: 'DSA手术', examItem: '外周血管DSA', drugName: '肝素钠注射液', drugCategory: '抗凝药物', drugSpec: '12500U/支', restriction: '限DSA手术使用', reason: '申请使用肝素钠注射液行外周血管DSA检查', submitTime: '2026-05-05 16:45', submitDept: '血管外科', urgency: '低' },
  { id: 'AUD037', patientName: '贺伟', patientId: 'P202400037', examType: 'CT增强', examItem: '头颅CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:61.2g', restriction: '限CT增强检查使用', reason: '申请使用碘普罗胺注射液行头颅CT增强检查', submitTime: '2026-05-05 17:00', submitDept: '神经内科', urgency: '高' },
  { id: 'AUD038', patientName: '贺娜', patientId: 'P202400038', examType: 'MRI增强', examItem: '头颅MRI增强', drugName: '钆贝葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g', restriction: '限MRI增强检查使用', reason: '申请使用钆贝葡胺注射液行头颅MRI增强检查', submitTime: '2026-05-06 08:15', submitDept: '神经外科', urgency: '中' },
  { id: 'AUD039', patientName: '贺磊', patientId: 'P202400039', examType: 'DSA手术', examItem: '脑血管DSA', drugName: '磺达肝癸钠注射液', drugCategory: '抗凝药物', drugSpec: '2.5mg/支', restriction: '限DSA手术使用', reason: '申请使用磺达肝癸钠注射液行脑血管DSA检查', submitTime: '2026-05-06 09:30', submitDept: '神经内科', urgency: '低' },
  { id: 'AUD040', patientName: '贺娟', patientId: 'P202400040', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘佛醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:35g', restriction: '限CT增强检查使用', reason: '申请使用碘佛醇注射液行腹部CT增强检查', submitTime: '2026-05-06 10:45', submitDept: '肿瘤科', urgency: '高' },
  { id: 'AUD041', patientName: '贺强', patientId: 'P202400041', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:4.305g', restriction: '限MRI增强检查使用', reason: '申请使用钆双胺注射液行前列腺MRI增强检查', submitTime: '2026-05-06 11:00', submitDept: '泌尿外科', urgency: '中' },
  { id: 'AUD042', patientName: '贺静', patientId: 'P202400042', examType: 'DSA手术', examItem: '心脏DSA', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', drugSpec: '20mg/支', restriction: '限DSA手术使用', reason: '申请使用阿加曲班注射液行心脏DSA检查', submitTime: '2026-05-06 12:15', submitDept: '心内科', urgency: '低' },
  { id: 'AUD043', patientName: '贺明', patientId: 'P202400043', examType: 'CT增强', examItem: '肺动脉CTA', drugName: '碘帕醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:37g', restriction: '限CT增强检查使用', reason: '申请使用碘帕醇注射液行肺动脉CTA检查', submitTime: '2026-05-06 13:30', submitDept: '呼吸内科', urgency: '高' },
  { id: 'AUD044', patientName: '贺玲', patientId: 'P202400044', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆特醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:3.0mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆特醇注射液行乳腺MRI增强检查', submitTime: '2026-05-06 14:45', submitDept: '乳腺外科', urgency: '中' },
  { id: 'AUD045', patientName: '贺浩', patientId: 'P202400045', examType: 'DSA手术', examItem: '肾动脉DSA', drugName: '利伐沙班片', drugCategory: '抗凝药物', drugSpec: '20mg/片', restriction: '限DSA手术使用', reason: '申请使用利伐沙班片行肾动脉DSA检查', submitTime: '2026-05-06 15:00', submitDept: '肾内科', urgency: '低' },
  { id: 'AUD046', patientName: '贺燕', patientId: 'P202400046', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', drugSpec: '50ml:15g', restriction: '限CT增强检查使用', reason: '申请使用碘海醇注射液行冠脉CTA检查', submitTime: '2026-05-06 16:15', submitDept: '心内科', urgency: '高' },
  { id: 'AUD047', patientName: '贺超', patientId: 'P202400047', examType: 'MRI增强', examItem: '腹部MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', drugSpec: '15ml:7.5mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆喷酸葡胺注射液行腹部MRI增强检查', submitTime: '2026-05-06 17:30', submitDept: '消化内科', urgency: '中' },
  { id: 'AUD048', patientName: '贺涛', patientId: 'P202400048', examType: 'DSA手术', examItem: '外周血管DSA', drugName: '比伐卢定注射液', drugCategory: '抗凝药物', drugSpec: '0.6ml:5000IU', restriction: '限DSA手术使用', reason: '申请使用比伐卢定注射液行外周血管DSA检查', submitTime: '2026-05-07 08:00', submitDept: '血管外科', urgency: '低' },
  { id: 'AUD049', patientName: '贺蓉', patientId: 'P202400049', examType: 'CT增强', examItem: '头颅CT增强', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', drugSpec: '100ml:32g', restriction: '限CT增强检查使用', reason: '申请使用碘克沙醇注射液行头颅CT增强检查', submitTime: '2026-05-07 09:15', submitDept: '神经内科', urgency: '高' },
  { id: 'AUD050', patientName: '贺龙', patientId: 'P202400050', examType: 'MRI增强', examItem: '头颅MRI增强', drugName: '钆布醇注射液', drugCategory: 'MRI对比剂', drugSpec: '10ml:2.5mmol', restriction: '限MRI增强检查使用', reason: '申请使用钆布醇注射液行头颅MRI增强检查', submitTime: '2026-05-07 10:30', submitDept: '神经外科', urgency: '中' },
]

// 审核历史 - 100条
const auditHistory: AuditHistory[] = [
  { id: 1, patientName: '张三', patientId: 'P30001', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '李审核', auditTime: '2026-05-01 09:00' },
  { id: 2, patientName: '李四', patientId: 'P30002', examType: 'MRI增强', examItem: '颅脑MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '王审核', auditTime: '2026-05-01 09:15' },
  { id: 3, patientName: '王五', patientId: 'P30003', examType: 'DSA', examItem: '冠状动脉造影', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '拒绝', auditor: '李审核', auditTime: '2026-05-01 09:30', reason: '凝血功能异常，ACT目标值设定过高' },
  { id: 4, patientName: '赵六', patientId: 'P30004', examType: 'CT增强', examItem: '胸部CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-05-01 09:45' },
  { id: 5, patientName: '钱七', patientId: 'P30005', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '拒绝', auditor: '李审核', auditTime: '2026-05-01 10:00', reason: '乳腺癌诊断依据不足，需病理确认' },
  { id: 6, patientName: '孙八', patientId: 'P30006', examType: 'CT增强', examItem: '头颈CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '补充资料', auditor: '王审核', auditTime: '2026-05-01 10:15', reason: '需提供甲状腺功能检测报告' },
  { id: 7, patientName: '周九', patientId: 'P30007', examType: 'DSA', examItem: '脑血管取栓术', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', result: '拒绝', auditor: '张审核', auditTime: '2026-05-01 10:30', reason: '脑梗死发病超过24小时，不在医保适应证时间窗内' },
  { id: 8, patientName: '吴十', patientId: 'P30008', examType: 'MRI增强', examItem: '肝脏MRI增强', drugName: '钆塞酸二钠注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-05-01 10:45' },
  { id: 9, patientName: '郑一', patientId: 'P30009', examType: 'CT增强', examItem: '主动脉CTA', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-05-01 11:00' },
  { id: 10, patientName: '冯二', patientId: 'P30010', examType: 'DSA', examItem: '外周血管支架术', drugName: '低分子肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-05-01 11:15' },
  { id: 11, patientName: '陈三', patientId: 'P30011', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '拒绝', auditor: '李审核', auditTime: '2026-05-01 11:30', reason: 'eGFR=28ml/min/1.73m²，低于安全阈值' },
  { id: 12, patientName: '褚四', patientId: 'P30012', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '补充资料', auditor: '王审核', auditTime: '2026-05-01 11:45', reason: '需提供甲状腺功能及肾功能报告' },
  { id: 13, patientName: '卫五', patientId: 'P30013', examType: 'CT增强', examItem: '肺结节CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-05-01 12:00' },
  { id: 14, patientName: '蒋六', patientId: 'P30014', examType: 'DSA', examItem: '肿瘤栓塞术', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '李审核', auditTime: '2026-05-01 12:15' },
  { id: 15, patientName: '沈七', patientId: 'P30015', examType: 'MRI增强', examItem: '骨关节MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '王审核', auditTime: '2026-05-01 12:30' },
  { id: 16, patientName: '韩八', patientId: 'P30016', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-05-01 14:00' },
  { id: 17, patientName: '杨九', patientId: 'P30017', examType: 'MRI增强', examItem: '颅脑MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-05-01 14:15' },
  { id: 18, patientName: '朱十', patientId: 'P30018', examType: 'DSA', examItem: '冠状动脉造影', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '拒绝', auditor: '王审核', auditTime: '2026-05-01 14:30', reason: '既往有肝素诱导血小板减少症(HIT)病史' },
  { id: 19, patientName: '秦一', patientId: 'P30019', examType: 'CT增强', examItem: '胸部CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-05-01 14:45' },
  { id: 20, patientName: '尤二', patientId: 'P30020', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '拒绝', auditor: '李审核', auditTime: '2026-05-01 15:00', reason: 'MRI适应证不明确' },
  { id: 21, patientName: '许三', patientId: 'P30021', examType: 'CT增强', examItem: '头颈CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-05-01 15:15' },
  { id: 22, patientName: '何四', patientId: 'P30022', examType: 'DSA', examItem: '脑血管取栓术', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', result: '拒绝', auditor: '张审核', auditTime: '2026-05-01 15:30', reason: '不在医保限定的时间窗内(发病6小时内)' },
  { id: 23, patientName: '吕五', patientId: 'P30023', examType: 'MRI增强', examItem: '肝脏MRI增强', drugName: '钆塞酸二钠注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-05-01 15:45' },
  { id: 24, patientName: '施六', patientId: 'P30024', examType: 'CT增强', examItem: '主动脉CTA', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-05-01 16:00' },
  { id: 25, patientName: '张七', patientId: 'P30025', examType: 'DSA', examItem: '外周血管支架术', drugName: '低分子肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-05-01 16:15' },
  { id: 26, patientName: '孔八', patientId: 'P30026', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '补充资料', auditor: '李审核', auditTime: '2026-05-01 16:30', reason: '需提供肾功能(eGFR)检测结果' },
  { id: 27, patientName: '曹九', patientId: 'P30027', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-05-01 16:45' },
  { id: 28, patientName: '严十', patientId: 'P30028', examType: 'CT增强', examItem: '肺结节CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-05-01 17:00' },
  { id: 29, patientName: '华一', patientId: 'P30029', examType: 'DSA', examItem: '肿瘤栓塞术', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '李审核', auditTime: '2026-05-01 17:15' },
  { id: 30, patientName: '金二', patientId: 'P30030', examType: 'MRI增强', examItem: '骨关节MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '王审核', auditTime: '2026-05-01 17:30' },
  { id: 31, patientName: '魏三', patientId: 'P30031', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-30 09:00' },
  { id: 32, patientName: '陶四', patientId: 'P30032', examType: 'MRI增强', examItem: '颅脑MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-30 09:15' },
  { id: 33, patientName: '姜五', patientId: 'P30033', examType: 'DSA', examItem: '冠状动脉造影', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '拒绝', auditor: '王审核', auditTime: '2026-04-30 09:30', reason: '术前凝血功能严重异常' },
  { id: 34, patientName: '戚六', patientId: 'P30034', examType: 'CT增强', examItem: '胸部CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-30 09:45' },
  { id: 35, patientName: '谢七', patientId: 'P30035', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '拒绝', auditor: '李审核', auditTime: '2026-04-30 10:00', reason: '不符合乳腺癌MRI适应证指南' },
  { id: 36, patientName: '邹八', patientId: 'P30036', examType: 'CT增强', examItem: '头颈CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-30 10:15' },
  { id: 37, patientName: '柏九', patientId: 'P30037', examType: 'DSA', examItem: '脑血管取栓术', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', result: '拒绝', auditor: '张审核', auditTime: '2026-04-30 10:30', reason: '医保适应证仅限急性缺血性脑卒中' },
  { id: 38, patientName: '水十', patientId: 'P30038', examType: 'MRI增强', examItem: '肝脏MRI增强', drugName: '钆塞酸二钠注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-30 10:45' },
  { id: 39, patientName: '窦一', patientId: 'P30039', examType: 'CT增强', examItem: '主动脉CTA', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-30 11:00' },
  { id: 40, patientName: '章二', patientId: 'P30040', examType: 'DSA', examItem: '外周血管支架术', drugName: '低分子肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-04-30 11:15' },
  { id: 41, patientName: '石三', patientId: 'P30041', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-30 11:30' },
  { id: 42, patientName: '韦四', patientId: 'P30042', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '补充资料', auditor: '王审核', auditTime: '2026-04-30 11:45', reason: '需提供心电图及心功能评估' },
  { id: 43, patientName: '程五', patientId: 'P30043', examType: 'CT增强', examItem: '肺结节CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-30 12:00' },
  { id: 44, patientName: '陆六', patientId: 'P30044', examType: 'DSA', examItem: '肿瘤栓塞术', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '李审核', auditTime: '2026-04-30 14:00' },
  { id: 45, patientName: '柳七', patientId: 'P30045', examType: 'MRI增强', examItem: '骨关节MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-30 14:15' },
  { id: 46, patientName: '杜八', patientId: 'P30046', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-30 14:30' },
  { id: 47, patientName: '阮九', patientId: 'P30047', examType: 'MRI增强', examItem: '颅脑MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-30 14:45' },
  { id: 48, patientName: '蓝十', patientId: 'P30048', examType: 'DSA', examItem: '冠状动脉造影', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '拒绝', auditor: '王审核', auditTime: '2026-04-30 15:00', reason: '患者有活动性出血病史' },
  { id: 49, patientName: '梅五', patientId: 'P30049', examType: 'CT增强', examItem: '胸部CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-30 15:15' },
  { id: 50, patientName: '林六', patientId: 'P30050', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-30 15:30' },
  { id: 51, patientName: '万六', patientId: 'P30051', examType: 'CT增强', examItem: '头颈CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-30 15:45' },
  { id: 52, patientName: '代七', patientId: 'P30052', examType: 'DSA', examItem: '脑血管取栓术', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-04-30 16:00' },
  { id: 53, patientName: '伍八', patientId: 'P30053', examType: 'MRI增强', examItem: '肝脏MRI增强', drugName: '钆塞酸二钠注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-30 16:15' },
  { id: 54, patientName: '余九', patientId: 'P30054', examType: 'CT增强', examItem: '主动脉CTA', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '补充资料', auditor: '王审核', auditTime: '2026-04-30 16:30', reason: '需提供血压及心率监测记录' },
  { id: 55, patientName: '元十', patientId: 'P30055', examType: 'DSA', examItem: '外周血管支架术', drugName: '低分子肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-04-30 16:45' },
  { id: 56, patientName: '卜一', patientId: 'P30056', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-30 17:00' },
  { id: 57, patientName: '顾二', patientId: 'P30057', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-30 17:15' },
  { id: 58, patientName: '孟三', patientId: 'P30058', examType: 'CT增强', examItem: '肺结节CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-29 09:00' },
  { id: 59, patientName: '平四', patientId: 'P30059', examType: 'DSA', examItem: '肿瘤栓塞术', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '李审核', auditTime: '2026-04-29 09:15' },
  { id: 60, patientName: '黄五', patientId: 'P30060', examType: 'MRI增强', examItem: '骨关节MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '拒绝', auditor: '王审核', auditTime: '2026-04-29 09:30', reason: '类风湿关节炎诊断依据不充分' },
  { id: 61, patientName: '萧六', patientId: 'P30061', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-29 09:45' },
  { id: 62, patientName: '尹七', patientId: 'P30062', examType: 'MRI增强', examItem: '颅脑MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-29 10:00' },
  { id: 63, patientName: '姚八', patientId: 'P30063', examType: 'DSA', examItem: '冠状动脉造影', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '王审核', auditTime: '2026-04-29 10:15' },
  { id: 64, patientName: '邵九', patientId: 'P30064', examType: 'CT增强', examItem: '胸部CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-29 10:30' },
  { id: 65, patientName: '汪十', patientId: 'P30065', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-29 10:45' },
  { id: 66, patientName: '毛一', patientId: 'P30066', examType: 'CT增强', examItem: '头颈CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '拒绝', auditor: '王审核', auditTime: '2026-04-29 11:00', reason: '碘过敏试验阳性' },
  { id: 67, patientName: '狄二', patientId: 'P30067', examType: 'DSA', examItem: '脑血管取栓术', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-04-29 11:15' },
  { id: 68, patientName: '米三', patientId: 'P30068', examType: 'MRI增强', examItem: '肝脏MRI增强', drugName: '钆塞酸二钠注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-29 11:30' },
  { id: 69, patientName: '贝四', patientId: 'P30069', examType: 'CT增强', examItem: '主动脉CTA', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-29 11:45' },
  { id: 70, patientName: '明五', patientId: 'P30070', examType: 'DSA', examItem: '外周血管支架术', drugName: '低分子肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-04-29 12:00' },
  { id: 71, patientName: '臧六', patientId: 'P30071', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '补充资料', auditor: '李审核', auditTime: '2026-04-29 14:00', reason: '需提供PSA检测报告' },
  { id: 72, patientName: '计七', patientId: 'P30072', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-29 14:15' },
  { id: 73, patientName: '伏八', patientId: 'P30073', examType: 'CT增强', examItem: '肺结节CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-29 14:30' },
  { id: 74, patientName: '成九', patientId: 'P30074', examType: 'DSA', examItem: '肿瘤栓塞术', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '李审核', auditTime: '2026-04-29 14:45' },
  { id: 75, patientName: '戴十', patientId: 'P30075', examType: 'MRI增强', examItem: '骨关节MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-29 15:00' },
  { id: 76, patientName: '谈一', patientId: 'P30076', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-29 15:15' },
  { id: 77, patientName: '宋二', patientId: 'P30077', examType: 'MRI增强', examItem: '颅脑MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-29 15:30' },
  { id: 78, patientName: '茅三', patientId: 'P30078', examType: 'DSA', examItem: '冠状动脉造影', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '拒绝', auditor: '王审核', auditTime: '2026-04-29 15:45', reason: 'INR值超过2.5' },
  { id: 79, patientName: '庞四', patientId: 'P30079', examType: 'CT增强', examItem: '胸部CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-29 16:00' },
  { id: 80, patientName: '熊五', patientId: 'P30080', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-29 16:15' },
  { id: 81, patientName: '纪六', patientId: 'P30081', examType: 'CT增强', examItem: '头颈CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-29 16:30' },
  { id: 82, patientName: '舒七', patientId: 'P30082', examType: 'DSA', examItem: '脑血管取栓术', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', result: '拒绝', auditor: '张审核', auditTime: '2026-04-29 16:45', reason: '颅内出血急性期' },
  { id: 83, patientName: '屈八', patientId: 'P30083', examType: 'MRI增强', examItem: '肝脏MRI增强', drugName: '钆塞酸二钠注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-29 17:00' },
  { id: 84, patientName: '项九', patientId: 'P30084', examType: 'CT增强', examItem: '主动脉CTA', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-29 17:15' },
  { id: 85, patientName: '祝十', patientId: 'P30085', examType: 'DSA', examItem: '外周血管支架术', drugName: '低分子肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-04-29 17:30' },
  { id: 86, patientName: '董一', patientId: 'P30086', examType: 'MRI增强', examItem: '前列腺MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-28 09:00' },
  { id: 87, patientName: '梁二', patientId: 'P30087', examType: 'CT增强', examItem: '冠脉CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-28 09:15' },
  { id: 88, patientName: '杜三', patientId: 'P30088', examType: 'CT增强', examItem: '肺结节CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-28 09:30' },
  { id: 89, patientName: '骆四', patientId: 'P30089', examType: 'DSA', examItem: '肿瘤栓塞术', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '补充资料', auditor: '李审核', auditTime: '2026-04-28 09:45', reason: '需提供凝血功能详细报告' },
  { id: 90, patientName: '马五', patientId: 'P30090', examType: 'MRI增强', examItem: '骨关节MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-28 10:00' },
  { id: 91, patientName: '苗六', patientId: 'P30091', examType: 'CT增强', examItem: '腹部CT增强', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-28 10:15' },
  { id: 92, patientName: '凤七', patientId: 'P30092', examType: 'MRI增强', examItem: '颅脑MRI增强', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-28 10:30' },
  { id: 93, patientName: '花八', patientId: 'P30093', examType: 'DSA', examItem: '冠状动脉造影', drugName: '普通肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '王审核', auditTime: '2026-04-28 10:45' },
  { id: 94, patientName: '方九', patientId: 'P30094', examType: 'CT增强', examItem: '胸部CT增强', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '张审核', auditTime: '2026-04-28 11:00' },
  { id: 95, patientName: '俞十', patientId: 'P30095', examType: 'MRI增强', examItem: '乳腺MRI增强', drugName: '钆喷酸葡胺注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-28 11:15' },
  { id: 96, patientName: '任一', patientId: 'P30096', examType: 'CT增强', examItem: '头颈CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-28 11:30' },
  { id: 97, patientName: '袁二', patientId: 'P30097', examType: 'DSA', examItem: '脑血管取栓术', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-04-28 11:45' },
  { id: 98, patientName: '柳三', patientId: 'P30098', examType: 'MRI增强', examItem: '肝脏MRI增强', drugName: '钆塞酸二钠注射液', drugCategory: 'MRI对比剂', result: '通过', auditor: '李审核', auditTime: '2026-04-28 12:00' },
  { id: 99, patientName: '酆四', patientId: 'P30099', examType: 'CT增强', examItem: '主动脉CTA', drugName: '碘海醇注射液', drugCategory: 'CT对比剂', result: '通过', auditor: '王审核', auditTime: '2026-04-28 14:00' },
  { id: 100, patientName: '鲍五', patientId: 'P30100', examType: 'DSA', examItem: '外周血管支架术', drugName: '低分子肝素钠注射液', drugCategory: '抗凝药物', result: '通过', auditor: '张审核', auditTime: '2026-04-28 14:15' },
]

// 限制药品库
const restrictedDrugs: RestrictedDrug[] = [
  { id: 1, name: '碘海醇注射液', category: 'CT对比剂', restriction: '限二级以上医疗机构，限CT增强扫描使用', applicableExams: '全身CT增强(头颈/胸部/腹部/盆腔/四肢)', notes: '需询问碘过敏史，肾功能不全者慎用' },
  { id: 2, name: '碘普罗胺注射液', category: 'CT对比剂', restriction: '限CT增强扫描，肾功能不全(eGFR<30)及甲亢患者慎用', applicableExams: 'CT血管造影(CTA)/CT增强扫描', notes: '非离子型碘对比剂，过敏反应发生率低' },
  { id: 3, name: '碘克沙醇注射液', category: 'CT对比剂', restriction: '限CT增强，甲状腺功能亢进患者禁用', applicableExams: '冠脉CTA/头颈CTA/主动脉CTA', notes: '等渗非离子型对比剂，肾脏安全性较高' },
  { id: 4, name: '碘佛醇注射液', category: 'CT对比剂', restriction: '限CT增强使用，限二级以上医疗机构', applicableExams: 'CT增强扫描/CTA', notes: '需皮试，有严重心肺疾病者慎用' },
  { id: 5, name: '钆双胺注射液', category: 'MRI对比剂', restriction: '限二级以上医疗机构，eGFR<30ml/min/1.73m²禁用', applicableExams: '颅脑MRI增强/脊髓MRI增强/全身MRI增强', notes: '线性钆对比剂，NSF风险需评估' },
  { id: 6, name: '钆喷酸葡胺注射液', category: 'MRI对比剂', restriction: '限MRI增强扫描，类风湿关节炎患者优先使用', applicableExams: '关节MRI增强/软组织MRI增强/乳腺MRI增强', notes: '需监测肾功能，急性肾损伤患者慎用' },
  { id: 7, name: '钆塞酸二钠注射液', category: 'MRI对比剂', restriction: '限肝脏MRI平扫+增强，肝功能Child-Pugh C级禁用', applicableExams: '肝脏MRI增强/胆道MRI成像', notes: '肝胆特异性对比剂，用于FNH/ HCC鉴别' },
  { id: 8, name: '钆布醇注射液', category: 'MRI对比剂', restriction: '限MRI增强扫描，限二级以上医疗机构使用', applicableExams: '颅脑MRI增强/肿瘤MRI分期/心血管MRI', notes: '大环状钆对比剂，稳定性高，NSF风险低' },
  { id: 9, name: '普通肝素钠注射液', category: '抗凝药物', restriction: '限介入手术抗凝，禁用于有出血倾向、肝素诱导血小板减少症(HIT)患者', applicableExams: 'DSA/血管介入/肿瘤栓塞/取栓术', notes: '需监测ACT，目标值250-300秒' },
  { id: 10, name: '低分子肝素钠注射液', category: '抗凝药物', restriction: '限介入手术抗凝及术后预防性抗凝，限二级以上医疗机构', applicableExams: '外周血管介入/支架术后/深静脉血栓预防', notes: '皮下注射，无需监测ACT，使用方便' },
  { id: 11, name: '阿加曲班注射液', category: '抗凝药物', restriction: '限急性缺血性脑卒中抗凝，发病48小时内使用，医保适应证严格限定', applicableExams: '急性脑梗死取栓术/动脉内溶栓', notes: '直接凝血酶抑制剂，需监测APTT' },
  { id: 12, name: '磺达肝癸钠注射液', category: '抗凝药物', restriction: '限DSA手术抗凝，限二级以上医疗机构使用', applicableExams: 'DSA/血管介入手术', notes: '选择性Xa因子抑制剂，肾脏清除' },
  { id: 13, name: '比伐卢定注射液', category: '抗凝药物', restriction: '限PCI术中抗凝，限二级以上医疗机构使用', applicableExams: '冠脉介入/PCI术/急性心梗介入治疗', notes: '直接凝血酶抑制剂，作用可逆' },
  { id: 14, name: '利伐沙班片', category: '抗凝药物', restriction: '限深静脉血栓(DVT)和肺栓塞(PE)治疗及预防复发', applicableExams: '骨科DVT预防/血管外科术后抗凝', notes: '口服Xa因子抑制剂，胃肠道吸收好' },
]

// 适应证规则
const indicationRules: IndicationRule[] = [
  { id: 1, examType: 'CT增强', examName: 'CT肺动脉造影(CTPA)', drugName: '碘普罗胺注射液', drugCategory: 'CT对比剂', insuranceRequirement: '限二级以上医疗机构，限CT增强扫描；肺栓塞疑似患者可使用，需提供D-二聚体或Wells评分支持', description: 'CTPA用于肺栓塞诊断，需评估对比剂肾病风险及碘过敏史' },
  { id: 2, examType: 'MRI增强', examName: '颅脑MRI增强扫描', drugName: '钆双胺注射液', drugCategory: 'MRI对比剂', insuranceRequirement: '限二级以上医疗机构；eGFR<30ml/min/1.73m²禁用；脑肿瘤/脑转移瘤/炎症性病变可使用', description: '钆对比剂用于脑肿瘤术后复发评估及炎症性病变诊断，需签署知情同意书' },
  { id: 3, examType: 'DSA', examName: '急性脑梗死取栓术', drugName: '阿加曲班注射液', drugCategory: '抗凝药物', insuranceRequirement: '限急性缺血性脑卒中(发病48小时内)使用；医保严格限定适应证，需神经科会诊记录', description: '阿加曲班用于急性脑梗死动脉内介入治疗后的抗凝，需监测APTT' },
  { id: 4, examType: 'MRI增强', examName: '肝脏MRI动态增强', drugName: '钆塞酸二钠注射液', drugCategory: 'MRI对比剂', insuranceRequirement: '限肝脏MRI平扫+增强扫描；肝功能Child-Pugh C级禁用；用于肝硬化结节定性及HCC筛查', description: '钆塞酸二钠为肝胆特异性对比剂，用于肝脏局灶性病变的鉴别诊断' },
  { id: 5, examType: 'CT增强', examName: '冠状动脉CTA', drugName: '碘克沙醇注射液', drugCategory: 'CT对比剂', insuranceRequirement: '限CT增强扫描；甲状腺功能亢进患者禁用；需提供心率及心功能评估', description: '碘克沙醇为等渗对比剂，用于冠心病筛查及冠脉支架术后评估' },
  { id: 6, examType: 'DSA', examName: '外周血管支架置入术', drugName: '低分子肝素钠注射液', drugCategory: '抗凝药物', insuranceRequirement: '限介入手术抗凝及术后预防性抗凝；限二级以上医疗机构；需评估出血风险', description: '低分子肝素用于外周血管介入术中及术后抗凝，预防支架内血栓形成' },
]

// 统计数据
const statsData: StatsData = {
  passRate: 78.5,
  totalPending: 50,
  todayProcessed: 12,
  avgReviewTime: '18分钟',
}

// ---------- 样式定义 ----------
const styles: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  kpiIcon: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  kpiValue: {
    fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2,
  },
  kpiLabel: {
    fontSize: 13, color: '#64748b', marginTop: 2,
  },
  tabs: {
    display: 'flex',
    gap: 0,
    borderBottom: '2px solid #e2e8f0',
    marginBottom: 20,
  },
  tab: {
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#64748b',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  toolbar: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    background: '#fff',
    padding: '14px 18px',
    borderRadius: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 14px',
    flex: 1,
    minWidth: 200,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 14,
    color: '#334155',
    width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 14,
    color: '#334155',
    background: '#f8fafc',
    outline: 'none',
    cursor: 'pointer',
  },
  cardList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 14,
  },
  card: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardPatient: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a3a5c',
  },
  cardPatientId: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardTag: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    fontSize: 13,
    color: '#475569',
  },
  cardDrug: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 10,
  },
  cardDrugName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#166534',
  },
  cardDrugSpec: {
    fontSize: 12,
    color: '#16a34a',
    marginTop: 2,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 4,
    background: '#eff6ff',
    color: '#2563eb',
    marginTop: 4,
    display: 'inline-block',
  },
  cardRestriction: {
    fontSize: 12,
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '6px 10px',
    marginBottom: 10,
  },
  cardActions: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
  },
  tableWrapper: {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 14,
  },
  th: {
    background: '#f8fafc',
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  badgeSuccess: {
    background: '#dcfce7',
    color: '#166534',
  },
  badgeDanger: {
    background: '#fee2e2',
    color: '#dc2626',
  },
  badgeWarning: {
    background: '#fef3c7',
    color: '#d97706',
  },
  btnGroup: {
    display: 'flex',
    gap: 8,
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  },
  btnPrimary: {
    background: '#1e40af',
    color: '#fff',
  },
  btnSuccess: {
    background: '#16a34a',
    color: '#fff',
  },
  btnDanger: {
    background: '#dc2626',
    color: '#fff',
  },
  btnOutline: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#475569',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: '#fff',
    borderRadius: 10,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  statTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a3a5c',
  },
  chartCard: {
    background: '#fff',
    borderRadius: 10,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: 16,
  },
  ruleCard: {
    background: '#fff',
    borderRadius: 10,
    padding: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 12,
    borderLeft: '4px solid #1e40af',
  },
  ruleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  drugTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  drugTh: {
    background: '#f8fafc',
    padding: '10px 12px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
    fontSize: 13,
  },
  drugTd: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    fontSize: 13,
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
  },
  pageInfo: {
    fontSize: 14,
    color: '#64748b',
  },
  pageButtons: {
    display: 'flex',
    gap: 8,
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}

// ---------- 组件 ----------
type TabKey = 'pending' | 'history' | 'stats' | 'rules'

const TAB_LABELS: Record<TabKey, string> = {
  pending: '待审核',
  history: '审核历史',
  stats: '统计分析',
  rules: '规则管理',
}

const TAB_ICONS: Record<TabKey, React.ReactNode> = {
  pending: <ClipboardList size={18} />,
  history: <Clock size={18} />,
  stats: <BarChart3 size={18} />,
  rules: <Settings size={18} />,
}

// 紧急度颜色
const urgencyColor: Record<string, string> = {
  '高': '#dc2626',
  '中': '#d97706',
  '低': '#16a34a',
}

// 结果颜色
const resultColors: Record<string, { bg: string; text: string }> = {
  '通过': { bg: '#dcfce7', text: '#166534' },
  '拒绝': { bg: '#fee2e2', text: '#dc2626' },
  '补充资料': { bg: '#fef3c7', text: '#d97706' },
}

// 结果图标
const ResultIcon: React.FC<{ result: string }> = ({ result }) => {
  if (result === '通过') return <CheckCircle size={14} />
  if (result === '拒绝') return <XCircle size={14} />
  return <AlertTriangle size={14} />
}

// 待审核卡片
const PendingAuditCard: React.FC<{
  audit: PendingAudit
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onRequestInfo: (id: string) => void
}> = ({ audit, onApprove, onReject, onRequestInfo }) => (
  <div style={styles.card}>
    <div style={styles.cardHeader}>
      <div>
        <div style={styles.cardPatient}>{audit.patientName}</div>
        <div style={styles.cardPatientId}>{audit.patientId}</div>
      </div>
      <span style={{
        ...styles.cardTag,
        background: `${urgencyColor[audit.urgency]}15`,
        color: urgencyColor[audit.urgency],
      }}>
        {audit.urgency === '高' ? <AlertOctagon size={12} /> :
         audit.urgency === '中' ? <Clock size={12} /> : <Clock3 size={12} />}
        {audit.urgency}紧急
      </span>
    </div>

    <div style={styles.cardRow}>
      <FileText size={14} />
      <span>{audit.examItem}</span>
      <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>{audit.submitDept}</span>
    </div>

    <div style={styles.cardRow}>
      <Calendar size={14} />
      <span>{audit.submitTime}</span>
    </div>

    <div style={styles.cardDrug}>
      <div style={styles.cardDrugName}>
        <Pill size={14} style={{ marginRight: 6 }} />
        {audit.drugName}
      </div>
      <div style={styles.cardDrugSpec}>{audit.drugSpec}</div>
      <span style={styles.cardCategory}>{audit.drugCategory}</span>
    </div>

    <div style={styles.cardRestriction}>
      <AlertTriangle size={12} style={{ marginRight: 6 }} />
      {audit.restriction}
    </div>

    <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
      <Stethoscope size={12} style={{ marginRight: 6 }} />
      {audit.reason}
    </div>

    <div style={styles.cardActions}>
      <button
        style={{ ...styles.btn, ...styles.btnSuccess }}
        onClick={() => onApprove(audit.id)}
      >
        <Check size={16} /> 通过
      </button>
      <button
        style={{ ...styles.btn, ...styles.btnDanger }}
        onClick={() => onReject(audit.id)}
      >
        <X size={16} /> 拒绝
      </button>
      <button
        style={{ ...styles.btn, ...styles.btnOutline }}
        onClick={() => onRequestInfo(audit.id)}
      >
        <MessageSquare size={16} /> 补充资料
      </button>
    </div>
  </div>
)

// 审核历史表格行
const HistoryRow: React.FC<{ record: AuditHistory }> = ({ record }) => {
  const colors = resultColors[record.result]
  return (
    <tr>
      <td style={styles.td}>{record.auditTime}</td>
      <td style={styles.td}>{record.patientName}</td>
      <td style={styles.td}>{record.patientId}</td>
      <td style={styles.td}>{record.examItem}</td>
      <td style={styles.td}>{record.drugName}</td>
      <td style={styles.td}>
        <span style={{
          ...styles.badge,
          background: colors.bg,
          color: colors.text,
        }}>
          <ResultIcon result={record.result} />
          {record.result}
        </span>
      </td>
      <td style={styles.td}>{record.auditor}</td>
      <td style={styles.td}>{record.reason || '-'}</td>
    </tr>
  )
}

// 主组件
export default function InsuranceAuditPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('全部')
  const [filterResult, setFilterResult] = useState('全部')
  const [historyPage, setHistoryPage] = useState(1)
  const [selectedAudit, setSelectedAudit] = useState<string | null>(null)

  const pageSize = 10

  // 过滤后的待审核数据
  const filteredPending = useMemo(() => {
    return pendingAudits.filter(a => {
      const matchSearch = searchTerm === '' ||
        a.patientName.includes(searchTerm) ||
        a.patientId.includes(searchTerm) ||
        a.drugName.includes(searchTerm)
      const matchType = filterType === '全部' || a.examType === filterType
      return matchSearch && matchType
    })
  }, [searchTerm, filterType])

  // 过滤后的历史数据
  const filteredHistory = useMemo(() => {
    return auditHistory.filter(h => {
      const matchSearch = searchTerm === '' ||
        h.patientName.includes(searchTerm) ||
        h.patientId.includes(searchTerm) ||
        h.drugName.includes(searchTerm)
      const matchResult = filterResult === '全部' || h.result === filterResult
      return matchSearch && matchResult
    })
  }, [searchTerm, filterResult])

  const totalPages = Math.ceil(filteredHistory.length / pageSize)
  const paginatedHistory = filteredHistory.slice(
    (historyPage - 1) * pageSize,
    historyPage * pageSize
  )

  const handleApprove = (id: string) => {
    setSelectedAudit(id)
    alert(`已通过审核: ${id}`)
  }

  const handleReject = (id: string) => {
    setSelectedAudit(id)
    alert(`已拒绝审核: ${id}`)
  }

  const handleRequestInfo = (id: string) => {
    setSelectedAudit(id)
    alert(`已发送补充资料请求: ${id}`)
  }

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <ShieldCheck size={22} style={{ marginRight: 10, verticalAlign: 'middle', color: '#1e40af' }} />
          医保审核管理
        </h2>
      </div>

      {/* KPI 卡片 */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#dbeafe' }}>
            <ClipboardList size={22} color="#1e40af" />
          </div>
          <div>
            <div style={styles.kpiValue}>{statsData.totalPending}</div>
            <div style={styles.kpiLabel}>待审核</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#dcfce7' }}>
            <CheckCircle size={22} color="#16a34a" />
          </div>
          <div>
            <div style={styles.kpiValue}>{statsData.passRate}%</div>
            <div style={styles.kpiLabel}>通过率</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#fef3c7' }}>
            <Activity size={22} color="#d97706" />
          </div>
          <div>
            <div style={styles.kpiValue}>{statsData.todayProcessed}</div>
            <div style={styles.kpiLabel}>今日处理</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: '#f3e8ff' }}>
            <Clock size={22} color="#9333ea" />
          </div>
          <div>
            <div style={styles.kpiValue}>{statsData.avgReviewTime}</div>
            <div style={styles.kpiLabel}>平均审核时间</div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div style={styles.tabs}>
        {(Object.keys(TAB_LABELS) as TabKey[]).map(key => (
          <button
            key={key}
            style={{
              ...styles.tab,
              ...(activeTab === key ? styles.tabActive : {}),
              ...(activeTab === key ? { color: '#1e40af', borderBottomColor: '#1e40af' } : {}),
            }}
            onClick={() => setActiveTab(key)}
          >
            {TAB_ICONS[key]}
            {TAB_LABELS[key]}
            {key === 'pending' && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 10,
                marginLeft: 4,
              }}>
                {pendingAudits.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 待审核 */}
      {activeTab === 'pending' && (
        <>
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={styles.searchInput}
                placeholder="搜索患者姓名/ID/药品..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              style={styles.select}
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="全部">全部类型</option>
              <option value="CT增强">CT增强</option>
              <option value="MRI增强">MRI增强</option>
              <option value="DSA手术">DSA手术</option>
            </select>
            <button style={{ ...styles.btn, ...styles.btnOutline }}>
              <RefreshCw size={16} />
              刷新
            </button>
          </div>

          {filteredPending.length === 0 ? (
            <div style={styles.emptyState}>
              <ClipboardList size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div>暂无待审核记录</div>
            </div>
          ) : (
            <div style={styles.cardList}>
              {filteredPending.map(audit => (
                <PendingAuditCard
                  key={audit.id}
                  audit={audit}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRequestInfo={handleRequestInfo}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 审核历史 */}
      {activeTab === 'history' && (
        <>
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={styles.searchInput}
                placeholder="搜索患者姓名/ID/药品..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              style={styles.select}
              value={filterResult}
              onChange={e => setFilterResult(e.target.value)}
            >
              <option value="全部">全部结果</option>
              <option value="通过">通过</option>
              <option value="拒绝">拒绝</option>
              <option value="补充资料">补充资料</option>
            </select>
            <button style={{ ...styles.btn, ...styles.btnOutline }}>
              <Filter size={16} />
              导出
            </button>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>审核时间</th>
                  <th style={styles.th}>患者姓名</th>
                  <th style={styles.th}>患者ID</th>
                  <th style={styles.th}>检查项目</th>
                  <th style={styles.th}>药品名称</th>
                  <th style={styles.th}>审核结果</th>
                  <th style={styles.th}>审核人</th>
                  <th style={styles.th}>备注</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map(record => (
                  <HistoryRow key={record.id} record={record} />
                ))}
              </tbody>
            </table>

            <div style={styles.pagination}>
              <div style={styles.pageInfo}>
                共 {filteredHistory.length} 条记录，第 {historyPage}/{totalPages} 页
              </div>
              <div style={styles.pageButtons}>
                <button
                  style={styles.pageBtn}
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      style={{
                        ...styles.pageBtn,
                        ...(historyPage === page ? { background: '#1e40af', color: '#fff', borderColor: '#1e40af' } : {}),
                      }}
                      onClick={() => setHistoryPage(page)}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  style={styles.pageBtn}
                  disabled={historyPage === totalPages}
                  onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 统计分析 */}
      {activeTab === 'stats' && (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statTitle}>本月审核总量</div>
              <div style={styles.statValue}>326</div>
              <TrendingUp size={16} color="#16a34a" style={{ marginTop: 8 }} />
              <span style={{ fontSize: 12, color: '#16a34a', marginLeft: 4 }}>+12%</span>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statTitle}>CT增强审核</div>
              <div style={styles.statValue}>158</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>占比 48.5%</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statTitle}>MRI增强审核</div>
              <div style={styles.statValue}>98</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>占比 30.1%</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statTitle}>DSA抗凝审核</div>
              <div style={styles.statValue}>70</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>占比 21.5%</div>
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>
              <BarChart3 size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              审核结果分布
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>通过率</div>
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 24, overflow: 'hidden' }}>
                  <div style={{ background: '#16a34a', height: '100%', width: '78.5%', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>78.5%</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>拒绝率</div>
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 24, overflow: 'hidden' }}>
                  <div style={{ background: '#dc2626', height: '100%', width: '12.3%', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>12.3%</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>补充资料率</div>
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 24, overflow: 'hidden' }}>
                  <div style={{ background: '#d97706', height: '100%', width: '9.2%', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>9.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>
              <Activity size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              药品使用排行 (Top 5)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: '碘海醇注射液', count: 68, pct: 21 },
                { name: '钆双胺注射液', count: 52, pct: 16 },
                { name: '碘克沙醇注射液', count: 45, pct: 14 },
                { name: '普通肝素钠注射液', count: 38, pct: 12 },
                { name: '钆喷酸葡胺注射液', count: 31, pct: 10 },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, fontSize: 13, color: '#64748b' }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 13, color: '#334155' }}>{item.name}</div>
                  <div style={{ width: 100, background: '#f1f5f9', borderRadius: 6, height: 20, overflow: 'hidden' }}>
                    <div style={{ background: '#1e40af', height: '100%', width: `${item.pct * 4}%` }} />
                  </div>
                  <div style={{ width: 50, fontSize: 13, color: '#334155', textAlign: 'right' }}>{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 规则管理 */}
      {activeTab === 'rules' && (
        <>
          <div style={styles.toolbar}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c', margin: '0 0 12px 0' }}>
                <BookOpen size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                医保适应证规则
              </h3>
            </div>
            <button style={{ ...styles.btn, ...styles.btnPrimary }}>
              <Settings size={16} />
              添加规则
            </button>
          </div>

          {indicationRules.map(rule => (
            <div key={rule.id} style={styles.ruleCard}>
              <div style={styles.ruleHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c' }}>{rule.examName}</span>
                  <span style={{
                    ...styles.cardCategory,
                    background: '#eff6ff',
                    color: '#1e40af',
                  }}>{rule.drugCategory}</span>
                </div>
                <div style={styles.btnGroup}>
                  <button style={{ ...styles.btn, ...styles.btnOutline }}>
                    <FileText size={14} />
                  </button>
                  <button style={{ ...styles.btn, ...styles.btnOutline }}>
                    <Settings size={14} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
                <Pill size={12} style={{ marginRight: 6 }} />
                <strong>药品:</strong> {rule.drugName}
              </div>
              <div style={{
                fontSize: 12,
                padding: '8px 12px',
                background: '#fef3c7',
                borderRadius: 6,
                color: '#92400e',
                marginBottom: 8,
              }}>
                <ShieldCheck size={12} style={{ marginRight: 6 }} />
                {rule.insuranceRequirement}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {rule.description}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c', marginBottom: 12 }}>
              <Filter size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              限制药品库
            </h3>
            <div style={styles.tableWrapper}>
              <table style={styles.drugTable}>
                <thead>
                  <tr>
                    <th style={styles.drugTh}>药品名称</th>
                    <th style={styles.drugTh}>类别</th>
                    <th style={styles.drugTh}>医保限制</th>
                    <th style={styles.drugTh}>适用检查</th>
                    <th style={styles.drugTh}>注意事项</th>
                  </tr>
                </thead>
                <tbody>
                  {restrictedDrugs.map(drug => (
                    <tr key={drug.id}>
                      <td style={{ ...styles.drugTd, fontWeight: 600, color: '#1a3a5c' }}>{drug.name}</td>
                      <td style={styles.drugTd}>
                        <span style={{
                          ...styles.cardCategory,
                          background: drug.category === 'CT对比剂' ? '#dbeafe' :
                                     drug.category === 'MRI对比剂' ? '#f3e8ff' : '#fce7f3',
                          color: drug.category === 'CT对比剂' ? '#1e40af' :
                                 drug.category === 'MRI对比剂' ? '#7c3aed' : '#be185d',
                        }}>{drug.category}</span>
                      </td>
                      <td style={{ ...styles.drugTd, color: '#dc2626', fontSize: 12 }}>{drug.restriction}</td>
                      <td style={{ ...styles.drugTd, fontSize: 12 }}>{drug.applicableExams}</td>
                      <td style={{ ...styles.drugTd, fontSize: 12, color: '#64748b' }}>{drug.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
