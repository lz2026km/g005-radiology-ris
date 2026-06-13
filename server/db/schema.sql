/* G005 RIS - DB Schema v3.0.2.8
   患者 / 检查 / 报告 / 设备 / 危急值 / 打印 / 送达 完整持久化 */
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT '男',
  age INTEGER,
  birth_date TEXT,
  phone TEXT,
  id_card TEXT,
  address TEXT,
  patient_type TEXT DEFAULT '门诊',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  accession_number TEXT,
  patient_id TEXT NOT NULL,
  patient_name TEXT,
  gender TEXT,
  age INTEGER,
  modality TEXT NOT NULL,
  body_part TEXT,
  exam_item_name TEXT,
  status TEXT NOT NULL DEFAULT '已登记',
  priority TEXT DEFAULT '普通',
  patient_type TEXT DEFAULT '门诊',
  scheduled_at TEXT,
  exam_date TEXT,
  device_id TEXT,
  room_id TEXT,
  doctor_id TEXT,
  technologist_id TEXT,
  clinical_diagnosis TEXT,
  images_acquired INTEGER DEFAULT 0,
  study_instance_uid TEXT,
  findings TEXT,
  impression TEXT,
  is_urgent INTEGER DEFAULT 0,
  critical_finding INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  exam_id TEXT,
  patient_id TEXT NOT NULL,
  patient_name TEXT,
  modality TEXT,
  body_part TEXT,
  status TEXT NOT NULL DEFAULT '待分配',
  findings TEXT,
  diagnosis TEXT,
  impression TEXT,
  clinical_history TEXT,
  technique TEXT,
  comparison TEXT,
  conclusion TEXT,
  recommendation TEXT,
  created_time TEXT,
  updated_time TEXT,
  doctor_id TEXT,
  doctor_name TEXT,
  initial_audit_doctor_id TEXT,
  initial_audit_doctor_name TEXT,
  initial_audit_time TEXT,
  initial_audit_suggestion TEXT,
  initial_audit_score REAL,
  final_audit_doctor_id TEXT,
  final_audit_doctor_name TEXT,
  final_audit_time TEXT,
  final_audit_suggestion TEXT,
  final_audit_score REAL,
  quality_score REAL,
  signed_time TEXT,
  published_time TEXT,
  published_by TEXT,
  report_verification_code TEXT,
  addendum_chain_ids TEXT DEFAULT '[]',
  template_id TEXT,
  report_source TEXT DEFAULT 'manual',
  is_positive INTEGER DEFAULT 0,
  is_critical INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  modality TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  status TEXT NOT NULL DEFAULT '空闲',
  room_id TEXT,
  acquisition_year INTEGER,
  utilization REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS critical_values (
  id TEXT PRIMARY KEY,
  exam_id TEXT,
  patient_name TEXT,
  finding TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'high',
  status TEXT NOT NULL DEFAULT 'pending',
  triggered_at TEXT,
  notified_at TEXT,
  acknowledged_at TEXT,
  resolved_at TEXT,
  doctor_id TEXT,
  notified_by TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id)
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  modality TEXT,
  body_part TEXT,
  scheduled_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  doctor_id TEXT,
  room_id TEXT,
  priority TEXT DEFAULT 'normal',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS print_jobs (
  id TEXT PRIMARY KEY,
  report_id TEXT,
  printer_id TEXT,
  film_size TEXT,
  copies INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (report_id) REFERENCES reports(id)
);

CREATE TABLE IF NOT EXISTS delivery_records (
  id TEXT PRIMARY KEY,
  report_id TEXT,
  channel TEXT NOT NULL,
  recipient TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  delivered_at TEXT,
  read_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (report_id) REFERENCES reports(id)
);

CREATE TABLE IF NOT EXISTS queue_calls (
  id TEXT PRIMARY KEY,
  exam_id TEXT,
  patient_name TEXT,
  room_id TEXT,
  room_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  queue_number TEXT,
  called_at TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id)
);
