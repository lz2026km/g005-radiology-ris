export interface MobilePatient {
  id: string
  name: string
  gender: '男' | '女'
  age: number
  patientType: '门诊' | '住院' | '急诊' | '体检'
  phone?: string
}

export interface MobileExam {
  id: string
  patient: MobilePatient
  examItem: string
  modality: 'CT' | 'MR' | 'DR' | 'DSA' | 'US'
  bodyPart: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'routine' | 'urgent' | 'critical'
  accessionNumber: string
  createdAt: string
  updatedAt: string
}

export interface MobileReport {
  id: string
  examId: string
  patientId: string
  reportText: string
  findings: string
  conclusion: string
  radiologistId: string
  status: 'draft' | 'signed' | 'amended'
  createdAt: string
  signedAt?: string
}

export interface MobileNotification {
  id: string
  title: string
  body: string
  type: 'exam' | 'report' | 'critical' | 'system'
  read: boolean
  createdAt: string
  data?: Record<string, unknown>
}

export interface MobileUser {
  id: string
  name: string
  role: 'doctor' | 'tech' | 'nurse' | 'admin'
  avatar?: string
  title?: string
  department: string
}
