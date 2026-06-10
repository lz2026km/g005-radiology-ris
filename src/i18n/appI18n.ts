/**
 * G005 放射RIS系统 v3.0.1 - 简单 i18n 翻译函数与 locale 切换
 * 对外导出:t(key, params) / getCurrentLocale() / onLocaleChange() / notifyLocaleChange()
 */
import type { ReactNode } from 'react'

export type Locale = 'zh-CN' | 'en-US' | 'ar' | 'he' | 'fa' | 'ur'

export type TranslationDict = Record<string, string>

export type Translations = Record<Locale, TranslationDict>

export const SUPPORTED_LOCALES: ReadonlyArray<Locale> = ['zh-CN', 'en-US']
export const DEFAULT_LOCALE: Locale = 'zh-CN'

export const translations: Translations = {
  'zh-CN': {
    'app.title': '005放射信息系统',
    'app.version': 'v3.0.2.2 · 前端+后端扩充版',
    'app.loading': '放射RIS系统加载中...',
    'app.hospital': '汉东省人民医院 · 放射科信息系统',
    'app.systemStatus': '系统正常',
    'app.collapse': '收起',
    'app.expand': '展开',
    'nav.workbench': '工作台',
    'nav.homeOverview': '首页概览',
    'nav.worklist': '检查工作列表',
    'nav.examRecords': '检查记录',
    'nav.patientManagement': '患者管理',
    'nav.patientManage': '患者管理',
    'nav.appointment': '检查预约',
    'nav.appointmentManage': '预约管理',
    'nav.queueCall': '排队叫号',
    'nav.followUp': '随访管理',
    'nav.reportManagement': '报告管理',
    'nav.reportList': '报告列表',
    'nav.writeReportV2': '报告书写 v2.0',
    'nav.writeReportV3': '报告书写 v3.0',
    'nav.criticalValue': '危急值管理',
    'nav.reportReview': '审核工作台',
    'nav.reportRevisions': '修订管理',
    'nav.collaboration': '多人协同',
    'nav.keywordCheck': '关键字扫描',
    'nav.scoreRule': '评分规则',
    'nav.defectLibrary': '缺陷字典',
    'nav.aiReportDraft': 'AI 初稿',
    'nav.cvRule': '危急值规则',
    'nav.cvStats': '危急值统计',
    'nav.specialAssessment': '特殊分类评估',
    'nav.reportExport': '报告导出',
    'nav.reportDelivery': '报告推送',
    'nav.patientPortal': '患者门户',
    'nav.caSignature': 'CA 签名',
    'nav.blockchainProof': '区块链存证',
    'nav.consultation': '会诊管理',
    'nav.imagingPrint': '影像与打印',
    'nav.dicomBrowser': 'DICOM浏览',
    'nav.filmPrint': '胶片打印',
    'nav.aiAssist': 'AI辅助诊断',
    'nav.aiIntelligence': 'AI智能',
    'nav.aiQc': 'AI影像质控',
    'nav.aiStructuredReport': 'AI结构化报告',
    'nav.aiMedicalDevice': 'AI医疗器械注册证',
    'nav.qualityControl': '质量控制',
    'nav.imageQc': '影像质控',
    'nav.equipmentEfficiency': '设备效率分析',
    'nav.typicalCases': '典型病例库',
    'nav.typicalFindings': '典型征象库',
    'nav.reportGlossary': '报告词库',
    'nav.templateManage': '模板管理',
    'nav.templateDesigner': '模板设计器',
    'nav.templateInheritance': '模板继承/克隆',
    'nav.templateCategory': '模板分类树',
    'nav.termSynonymGraph': '术语同义词图谱',
    'nav.phraseBank': '报告短语库',
    'nav.regionalCoordination': '区域协同',
    'nav.regionalImaging': '区域影像协同',
    'nav.regionalReport': '区域报告',
    'nav.departmentSchedule': '科室排班',
    'nav.departmentManage': '科室管理',
    'nav.patientService': '患者服务',
    'nav.cancerScreen': '早癌筛查',
    'nav.patientImageQuery': '患者影像查询',
    'nav.clinicalData': '临床数据中台',
    'nav.dataAnalysis': '数据分析',
    'nav.statistics': '统计分析',
    'nav.greenIt': '绿色IT统计',
    'nav.departmentDashboard': '科室看板',
    'nav.operationsCenter': '运营指挥中心',
    'nav.costAnalysis': '成本效益分析',
    'nav.dataStats': '数据统计',
    'nav.nuclearStats': '核医学统计',
    'nav.kpiDashboard': 'KPI 大盘',
    'nav.doctorWorkload': '医生工作量',
    'nav.diagnosisAccuracy': '诊断符合率',
    'nav.reportTimeliness': '报告及时率',
    'nav.reportSearch': '报告检索',
    'nav.dataReport': '数据上报',
    'nav.nationalReport': '国家数据上报',
    'nav.dataReportCenter': '数据上报中心',
    'nav.insuranceAudit': '医保审核',
    'nav.systemManage': '系统管理',
    'nav.authority': '权限管理',
    'nav.dataDictionary': '数据字典',
    'nav.operationLog': '操作日志',
    'nav.auditLog': '审计日志',
    'nav.notification': '通知中心',
    'nav.dicomPrint': 'DICOM打印',
    'nav.equipmentMaterials': '设备物资',
    'nav.equipmentLifecycle': '设备全生命周期',
    'nav.faultRegister': '故障登记',
    'nav.materialsManage': '耗材管理',
    'nav.radiologyMaterials': '放射物资管理',
    'nav.doseTrack': '剂量追踪',
    'time.justNow': '刚刚',
    'time.minutesAgo': '{{count}}分钟前',
    'time.hoursAgo': '{{count}}小时前',
    'time.daysAgo': '{{count}}天前',
    'date.format': 'YYYY年MM月DD日',
  },
  'en-US': {
    'app.title': '005 Radiology Information System',
    'app.version': 'v3.0.1 · Ten-PACS Parity Patch',
    'app.loading': 'Loading RIS...',
    'app.hospital': 'Handong Provincial Hospital · Radiology',
    'app.systemStatus': 'System Normal',
    'app.collapse': 'Collapse',
    'app.expand': 'Expand',
    'nav.workbench': 'Workbench',
    'nav.homeOverview': 'Home Overview',
    'nav.worklist': 'Worklist',
    'nav.examRecords': 'Exam Records',
    'nav.patientManagement': 'Patient Management',
    'nav.patientManage': 'Patient Management',
    'nav.appointment': 'Appointment',
    'nav.appointmentManage': 'Appointment Management',
    'nav.queueCall': 'Queue Call',
    'nav.followUp': 'Follow-up',
    'nav.reportManagement': 'Report Management',
    'nav.reportList': 'Report List',
    'nav.writeReportV2': 'Write Report v2.0',
    'nav.writeReportV3': 'Write Report v3.0',
    'nav.criticalValue': 'Critical Values',
    'nav.reportReview': 'Review Workbench',
    'nav.reportRevisions': 'Revisions',
    'nav.collaboration': 'Collaboration',
    'nav.keywordCheck': 'Keyword Check',
    'nav.scoreRule': 'Score Rule',
    'nav.defectLibrary': 'Defect Library',
    'nav.aiReportDraft': 'AI Draft',
    'nav.cvRule': 'CV Rules',
    'nav.cvStats': 'CV Stats',
    'nav.specialAssessment': 'Special Assessment',
    'nav.reportExport': 'Report Export',
    'nav.reportDelivery': 'Report Delivery',
    'nav.patientPortal': 'Patient Portal',
    'nav.caSignature': 'CA Signature',
    'nav.blockchainProof': 'Blockchain Proof',
    'nav.consultation': 'Consultation',
    'nav.imagingPrint': 'Imaging & Print',
    'nav.dicomBrowser': 'DICOM Browser',
    'nav.filmPrint': 'Film Print',
    'nav.aiAssist': 'AI Assisted Diagnosis',
    'nav.aiIntelligence': 'AI Intelligence',
    'nav.aiQc': 'AI Image QC',
    'nav.aiStructuredReport': 'AI Structured Report',
    'nav.aiMedicalDevice': 'AI Medical Device Registration',
    'nav.qualityControl': 'Quality Control',
    'nav.imageQc': 'Image QC',
    'nav.equipmentEfficiency': 'Equipment Efficiency',
    'nav.typicalCases': 'Typical Cases',
    'nav.typicalFindings': 'Typical Findings',
    'nav.reportGlossary': 'Report Glossary',
    'nav.templateManage': 'Template Management',
    'nav.templateDesigner': 'Template Designer',
    'nav.templateInheritance': 'Template Inheritance',
    'nav.templateCategory': 'Template Category',
    'nav.termSynonymGraph': 'Term Synonym Graph',
    'nav.phraseBank': 'Phrase Bank',
    'nav.regionalCoordination': 'Regional Coordination',
    'nav.regionalImaging': 'Regional Imaging',
    'nav.regionalReport': 'Regional Report',
    'nav.departmentSchedule': 'Department Schedule',
    'nav.departmentManage': 'Department Management',
    'nav.patientService': 'Patient Service',
    'nav.cancerScreen': 'Cancer Screening',
    'nav.patientImageQuery': 'Patient Image Query',
    'nav.clinicalData': 'Clinical Data Hub',
    'nav.dataAnalysis': 'Data Analysis',
    'nav.statistics': 'Statistics',
    'nav.greenIt': 'Green IT Statistics',
    'nav.departmentDashboard': 'Department Dashboard',
    'nav.operationsCenter': 'Operations Center',
    'nav.costAnalysis': 'Cost Analysis',
    'nav.dataStats': 'Data Statistics',
    'nav.nuclearStats': 'Nuclear Medicine Stats',
    'nav.kpiDashboard': 'KPI Dashboard',
    'nav.doctorWorkload': 'Doctor Workload',
    'nav.diagnosisAccuracy': 'Diagnosis Accuracy',
    'nav.reportTimeliness': 'Report Timeliness',
    'nav.reportSearch': 'Report Search',
    'nav.dataReport': 'Data Report',
    'nav.nationalReport': 'National Report',
    'nav.dataReportCenter': 'Data Report Center',
    'nav.insuranceAudit': 'Insurance Audit',
    'nav.systemManage': 'System Management',
    'nav.authority': 'Authority',
    'nav.dataDictionary': 'Data Dictionary',
    'nav.operationLog': 'Operation Log',
    'nav.auditLog': 'Audit Log',
    'nav.notification': 'Notification Center',
    'nav.dicomPrint': 'DICOM Print',
    'nav.equipmentMaterials': 'Equipment & Materials',
    'nav.equipmentLifecycle': 'Equipment Lifecycle',
    'nav.faultRegister': 'Fault Register',
    'nav.materialsManage': 'Materials Management',
    'nav.radiologyMaterials': 'Radiology Materials',
    'nav.doseTrack': 'Dose Tracking',
    'time.justNow': 'Just now',
    'time.minutesAgo': '{{count}} minutes ago',
    'time.hoursAgo': '{{count}} hours ago',
    'time.daysAgo': '{{count}} days ago',
    'date.format': 'MMMM D, YYYY',
  },
  ar: {},
  he: {},
  fa: {},
  ur: {},
}

let currentLocale: Locale = DEFAULT_LOCALE
const localeChangeHandlers: Array<(locale: Locale) => void> = []

export const getCurrentLocale = (): Locale => currentLocale

export const onLocaleChange = (handler: (locale: Locale) => void): (() => void) => {
  localeChangeHandlers.push(handler)
  return () => {
    const idx = localeChangeHandlers.indexOf(handler)
    if (idx > -1) localeChangeHandlers.splice(idx, 1)
  }
}

export const notifyLocaleChange = (locale: Locale): void => {
  currentLocale = locale
  localeChangeHandlers.forEach((h) => h(locale))
}

export const t = (key: string, params?: Record<string, unknown>): string => {
  const dict = translations[currentLocale] ?? translations[DEFAULT_LOCALE]
  let text = dict[key] ?? translations[DEFAULT_LOCALE][key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{{${k}}}`, String(v))
    }
  }
  return text
}

export const getDirection = (locale: Locale): 'ltr' | 'rtl' => {
  return locale === 'ar' || locale === 'he' || locale === 'fa' || locale === 'ur' ? 'rtl' : 'ltr'
}

export type IconRenderer = () => ReactNode
