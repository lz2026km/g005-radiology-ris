/**
<<<<<<< HEAD
 * i18n 内置实现 - G005 Radiology RIS System
 * 支持中文(zh_CN)和英文(en_US)国际化
 * 无外部依赖，使用内嵌语言包
 */

// 语言包
const zhCN = {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    search: '搜索',
    loading: '加载中...',
    confirm: '确认',
    success: '成功',
    error: '失败',
    warning: '警告',
  },
  nav: {
    home: '首页',
    worklist: '检查工作列表',
    report: '报告书写',
    patient: '患者管理',
    equipment: '设备管理',
    statistics: '统计报表',
    system: '系统管理',
  },
  status: {
    pending: '待处理',
    inProgress: '进行中',
    completed: '已完成',
    reported: '已报告',
    verified: '已审核',
    rejected: '已驳回',
  },
  role: {
    radiologist: '放射科医生',
    technician: '技师',
    admin: '管理员',
    nurse: '护士',
  },
  exam: {
    title: '检查列表',
    patientName: '患者姓名',
    examItem: '检查项目',
    modality: '检查类型',
    date: '检查日期',
    status: '状态',
    priority: '优先级',
    urgent: '危重',
    normal: '普通',
  },
  report: {
    title: '报告书写',
    finding: '所见描述',
    impression: '诊断意见',
    recommendation: '建议',
    saveDraft: '保存草稿',
    submit: '提交报告',
    audit: '审核报告',
  },
  patient: {
    title: '患者信息',
    name: '姓名',
    age: '年龄',
    gender: '性别',
    phone: '电话',
    idCard: '身份证',
  },
  time: {
    now: '刚刚',
    minutesAgo: '{count}分钟前',
    hoursAgo: '{count}小时前',
    daysAgo: '{count}天前',
  },
  messages: {
    saveSuccess: '保存成功',
    saveFailed: '保存失败',
    deleteConfirm: '确定要删除吗？',
    unsavedChanges: '您有未保存的更改',
    networkError: '网络错误，请稍后重试',
  },
}

const enUS = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    loading: 'Loading...',
    confirm: 'Confirm',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
  },
  nav: {
    home: 'Home',
    worklist: 'Exam Worklist',
    report: 'Report Writing',
    patient: 'Patient Management',
    equipment: 'Equipment Management',
    statistics: 'Statistics',
    system: 'System',
  },
  status: {
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    reported: 'Reported',
    verified: 'Verified',
    rejected: 'Rejected',
  },
  role: {
    radiologist: 'Radiologist',
    technician: 'Technician',
    admin: 'Admin',
    nurse: 'Nurse',
  },
  exam: {
    title: 'Exam List',
    patientName: 'Patient Name',
    examItem: 'Exam Item',
    modality: 'Modality',
    date: 'Exam Date',
    status: 'Status',
    priority: 'Priority',
    urgent: 'Urgent',
    normal: 'Normal',
  },
  report: {
    title: 'Report Writing',
    finding: 'Findings',
    impression: 'Impression',
    recommendation: 'Recommendation',
    saveDraft: 'Save Draft',
    submit: 'Submit Report',
    audit: 'Audit Report',
  },
  patient: {
    title: 'Patient Info',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    phone: 'Phone',
    idCard: 'ID Card',
  },
  time: {
    now: 'Just now',
    minutesAgo: '{count} minutes ago',
    hoursAgo: '{count} hours ago',
    daysAgo: '{count} days ago',
  },
  messages: {
    saveSuccess: 'Saved successfully',
    saveFailed: 'Save failed',
    deleteConfirm: 'Are you sure to delete?',
    unsavedChanges: 'You have unsaved changes',
    networkError: 'Network error, please retry',
  },
}

// i18next兼容接口
export const i18n = {
  t: function(key, params = {}) {
    const lang = this.language || 'zh-CN'
    const keys = key.split('.')
    let value = lang === 'en-US' ? enUS : zhCN
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // 返回key如果未找到
      }
    }
    
    // 参数替换
    if (typeof value === 'string' && params.count !== undefined) {
      value = value.replace('{count}', params.count)
    }
    
    return value
  },
  
  language: 'zh-CN',
  
  changeLanguage: function(lang) {
    this.language = lang
  },
  
  use: function() { return this },
  init: function() { return this },
}

export const initReactI18next = {
  type: '3rdParty',
  init: function() {}
}

// 兼容React组件
export function useTranslation() {
  return {
    t: (key, params) => i18n.t(key, params),
    i18n: i18n,
  }
}

export default i18n
=======
 * i18n stub - G005 Radiology RIS System
 * 这个文件不再使用i18next，App.tsx使用内置的简单翻译实现
 */

// 保留类型导出以防其他地方需要
export interface TranslationResources {
  [locale: string]: {
    [key: string]: string;
  };
}

// 空导出以避免import错误
export const resources: TranslationResources = {};
export default {};
>>>>>>> gh-pages
