/**
 * G005 RIS v3.0.6.6 - On-Call 值守表
 * 40 点升级 - 当前值守查询 + 按专业筛选
 */

import type { OnCallEntry, OnCallSpecialty } from '../../../types/workflow';

const now = () => new Date();
const HOUR = 60 * 60 * 1000;
const SHIFT_HOURS = 8;

function makeShift(start: Date, doctorId: string, doctorName: string, specialty: OnCallSpecialty, contact: string, priority: number, backupId?: string, backupName?: string): OnCallEntry {
  return {
    id: `oncall_${doctorId}_${start.getTime()}`,
    doctorId,
    doctorName,
    specialty,
    shiftStart: start.toISOString(),
    shiftEnd: new Date(start.getTime() + SHIFT_HOURS * HOUR).toISOString(),
    contact,
    backupId,
    backupName,
    priority,
  };
}

const SCHEDULE: OnCallEntry[] = (() => {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const seeds: Array<{ id: string; name: string; specialty: OnCallSpecialty; contact: string; backupId?: string; backupName?: string }> = [
    { id: 'D001', name: '张明远', specialty: 'CT', contact: '13800000001', backupId: 'D011', backupName: '张子涵' },
    { id: 'D002', name: '李慧敏', specialty: 'MR', contact: '13800000002', backupId: 'D012', backupName: '李宁' },
    { id: 'D003', name: '王建华', specialty: 'DR', contact: '13800000003', backupId: 'D013', backupName: '王欣' },
    { id: 'D004', name: '陈雪芳', specialty: 'DSA', contact: '13800000004', backupId: 'D014', backupName: '陈光' },
    { id: 'D005', name: '刘海洋', specialty: 'US', contact: '13800000005', backupId: 'D015', backupName: '刘佳' },
    { id: 'D006', name: '赵雪琴', specialty: 'CT', contact: '13800000006' },
    { id: 'D007', name: '钱永康', specialty: 'MR', contact: '13800000007' },
    { id: 'D008', name: '孙丽娜', specialty: 'MG', contact: '13800000008' },
    { id: 'D009', name: '吴芳', specialty: 'PET-CT', contact: '13800000009' },
    { id: 'D010', name: '郑伟', specialty: 'GENERAL', contact: '13800000010' },
  ];
  const out: OnCallEntry[] = [];
  for (let day = -1; day <= 2; day++) {
    for (let shift = 0; shift < 3; shift++) {
      seeds.forEach((s, idx) => {
        const start = new Date(base);
        start.setDate(start.getDate() + day);
        start.setHours(shift * SHIFT_HOURS);
        out.push(makeShift(start, s.id, s.name, s.specialty, s.contact, idx + 1, s.backupId, s.backupName));
      });
    }
  }
  return out;
})();

export class OnCallSchedule {
  private entries: OnCallEntry[] = SCHEDULE;

  setEntries(entries: OnCallEntry[]): void {
    this.entries = [...entries];
  }

  listAll(): OnCallEntry[] {
    return [...this.entries];
  }

  getBySpecialty(specialty: OnCallSpecialty, at: Date = now()): OnCallEntry[] {
    const t = at.getTime();
    return this.entries
      .filter((e) => e.specialty === specialty)
      .filter((e) => Date.parse(e.shiftStart) <= t && Date.parse(e.shiftEnd) > t)
      .sort((a, b) => a.priority - b.priority);
  }

  getCurrentOnCall(at: Date = now()): OnCallEntry[] {
    const t = at.getTime();
    return this.entries
      .filter((e) => Date.parse(e.shiftStart) <= t && Date.parse(e.shiftEnd) > t)
      .sort((a, b) => a.priority - b.priority);
  }

  getCurrentBySpecialty(specialty: OnCallSpecialty, at: Date = now()): OnCallEntry | undefined {
    return this.getBySpecialty(specialty, at)[0];
  }

  upcoming(specialty: OnCallSpecialty, count = 5, at: Date = now()): OnCallEntry[] {
    const t = at.getTime();
    return this.entries
      .filter((e) => e.specialty === specialty && Date.parse(e.shiftStart) > t)
      .sort((a, b) => Date.parse(a.shiftStart) - Date.parse(b.shiftStart))
      .slice(0, count);
  }
}

export const onCallSchedule = new OnCallSchedule();