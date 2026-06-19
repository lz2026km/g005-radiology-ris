/**
 * G005 RIS v3.0.6.6 - 排班/值班 Mock
 */

export type OnCallRole = 'attending' | 'associateChief' | 'chief' | 'director' | 'medicalAffairs';

export interface OnCallDoctor {
  userId: string;
  name: string;
  title: string;
  department: string;
  phone: string;
  wechat?: string;
  email?: string;
  roles: OnCallRole[];
  priority: number;             // 同级多医生时排序
}

export interface OnCallShift {
  id: string;
  role: OnCallRole;
  roleLabel: string;
  department: string;
  start: string;                // ISO
  end: string;                  // ISO
  doctors: OnCallDoctor[];
  primary: string;              // 主班 userId
  backup: string;               // 备班 userId
  notes?: string;
}

/** 当前值班快照(用于 OnCallResolver 返回) */
export interface OnCallSnapshot {
  queryTime: string;
  shifts: OnCallShift[];
  /** 同 role 多医生时,按 priority 选出的首个 */
  primaryByRole: Partial<Record<OnCallRole, OnCallDoctor>>;
}

const now = Date.now();
const iso = (offsetMin: number) => new Date(now + offsetMin * 60_000).toISOString();

const doctors = {
  liTian: { userId: 'D-LI', name: '李天宇', title: '主治医师', department: '放射科 CT', phone: '13900001001', email: 'li.tian@hospital.cn', roles: ['attending'] as OnCallRole[], priority: 1 },
  wangQin: { userId: 'D-WANG', name: '王琴', title: '副主任医师', department: '放射科 CT', phone: '13900001002', email: 'wang.qin@hospital.cn', roles: ['associateChief'] as OnCallRole[], priority: 2 },
  zhangMing: { userId: 'D-ZHANG', name: '张明', title: '主任医师', department: '放射科', phone: '13900001003', email: 'zhang.ming@hospital.cn', roles: ['chief'] as OnCallRole[], priority: 1 },
  chenWei: { userId: 'D-CHEN', name: '陈伟', title: '医务处主任', department: '医务处', phone: '13900001004', email: 'chen.wei@hospital.cn', roles: ['director', 'medicalAffairs'] as OnCallRole[], priority: 1 },
  linHua: { userId: 'D-LIN', name: '林华', title: '住院医师', department: '放射科 MR', phone: '13900001005', email: 'lin.hua@hospital.cn', roles: ['attending'] as OnCallRole[], priority: 2 },
  zhouYi: { userId: 'D-ZHOU', name: '周怡', title: '主治医师', department: '放射科 MR', phone: '13900001006', email: 'zhou.yi@hospital.cn', roles: ['associateChief'] as OnCallRole[], priority: 1 },
};

/** 8 小时轮班:今天 08:00 → 16:00,16:00 → 24:00,24:00 → 次日 08:00 */
function makeShift(role: OnCallRole, roleLabel: string, department: string, startMin: number, endMin: number, primary: OnCallDoctor, backup: OnCallDoctor): OnCallShift {
  return {
    id: `shift-${role}-${startMin}`,
    role,
    roleLabel,
    department,
    start: iso(startMin),
    end: iso(endMin),
    doctors: [primary, backup],
    primary: primary.userId,
    backup: backup.userId,
  };
}

export const ONCALL_TODAY: OnCallShift[] = [
  makeShift('attending', '首诊医师(白班)', '放射科 CT', -180, 240, doctors.liTian, doctors.linHua),
  makeShift('associateChief', '主诊(白班)', '放射科', -180, 240, doctors.wangQin, doctors.zhouYi),
  makeShift('chief', '科主任', '放射科', -720, 720, doctors.zhangMing, doctors.wangQin),
  makeShift('director', '医务处主任', '医务处', -720, 720, doctors.chenWei, doctors.chenWei),
];

/** 一周排班表(简化) */
export const ONCALL_WEEKLY: OnCallShift[] = (() => {
  const list: OnCallShift[] = [];
  for (let d = 0; d < 7; d++) {
    const start = -180 + d * 1440;
    list.push(
      makeShift('attending', `首诊医师(D+${d})`, '放射科 CT', start, start + 480, doctors.liTian, doctors.linHua),
      makeShift('attending', `首诊医师(D+${d}夜)`, '放射科 CT', start + 480, start + 1440, doctors.linHua, doctors.liTian),
      makeShift('associateChief', `主诊(D+${d})`, '放射科', start, start + 720, doctors.wangQin, doctors.zhouYi),
      makeShift('associateChief', `主诊(D+${d}夜)`, '放射科', start + 720, start + 1440, doctors.zhouYi, doctors.wangQin),
    );
  }
  return list;
})();