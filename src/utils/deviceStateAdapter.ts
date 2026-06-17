/**
 * G005 放射RIS系统 v3.0.3.31 - 设备状态机适配器
 * 把旧的字符串 status (online/offline/maintenance/...) 映射为 deviceMachine 状态,
 * 并用状态机做状态合法性校验。任何"裸赋值 status = ..." 都应通过此适配器。
 */
import { createActor, type Actor } from 'xstate'
import { deviceMachine, type DeviceStateName } from '../machines/deviceMachine'

/** 设备页面使用的字符串状态(展示层) */
export type DeviceDisplayStatus = 'online' | 'offline' | 'maintenance' | 'fault' | 'inUse'

/** 中文 / 旧版状态 → deviceMachine 状态 */
export const DISPLAY_TO_MACHINE: Record<DeviceDisplayStatus, DeviceStateName> = {
  online: 'idle',
  inUse: 'inUse',
  maintenance: 'maintenance',
  fault: 'broken',
  offline: 'offline',
}

/** 字符串 → deviceMachine 起始状态(用于 replay 校验) */
export const STATUS_TO_MACHINE: Record<string, DeviceStateName> = {
  '空闲': 'idle',
  '使用中': 'inUse',
  '维护中': 'maintenance',
  '故障': 'broken',
  '停用': 'offline',
  '离线': 'offline',
  '在线': 'idle',
  online: 'idle',
  offline: 'offline',
  maintenance: 'maintenance',
  fault: 'broken',
  inUse: 'inUse',
}

/** 启动一个临时 actor,只用于校验 status 字符串是否可由 idle 出发到达。 */
export function validateDeviceStatus(status: string): boolean {
  const target = STATUS_TO_MACHINE[status] ?? 'idle'
  const actor = createActor(deviceMachine, {
    input: { deviceId: 'validate', deviceCode: 'validate', modality: 'CT' },
  })
  actor.start()
  if (target === 'idle') { actor.stop(); return true }
  if (target === 'inUse') {
    actor.send({ type: 'START_USE', patientId: '', examId: '', by: 'system' })
  } else if (target === 'maintenance') {
    actor.send({ type: 'START_MAINTENANCE', notes: 'init', by: 'system' })
  } else if (target === 'broken') {
    actor.send({ type: 'REPORT_FAULT', reason: 'init', by: 'system' })
  } else if (target === 'offline') {
    actor.send({ type: 'GO_OFFLINE', reason: 'init', by: 'system' })
  }
  const ok = actor.getSnapshot().value === target
  actor.stop()
  return ok
}

/** 创建设备 actor 池 - 供页面级 useDeviceActors hook 使用 */
export function spawnDeviceActor(input: { deviceId: string; deviceCode: string; modality: 'CT' | 'MR' | 'DR' | 'DSA' | 'US' | 'MG' | 'PET' | 'SPECT' }): Actor<typeof deviceMachine> {
  const actor = createActor(deviceMachine, { input })
  actor.start()
  return actor
}

/** 通过临时 actor 执行一次状态转换(只用于运行时 status 字符串切换,
 *  副作用由调用方负责持久化) */
export function replayDeviceEvent(
  fromStatus: string,
  event:
    | { type: 'REPORT_FAULT'; reason: string; by: string }
    | { type: 'GO_OFFLINE'; reason: string; by: string }
    | { type: 'START_MAINTENANCE'; notes: string; by: string }
    | { type: 'COMPLETE_MAINTENANCE'; by: string }
    | { type: 'GO_ONLINE'; by: string }
    | { type: 'REPAIR_COMPLETE'; by: string }
    | { type: 'START_USE'; patientId: string; examId: string; by: string }
    | { type: 'COMPLETE_USE'; by: string }
): DeviceStateName {
  const from = STATUS_TO_MACHINE[fromStatus] ?? 'idle'
  const actor = createActor(deviceMachine, {
    input: { deviceId: 'replay', deviceCode: 'replay', modality: 'CT' },
  })
  actor.start()
  if (from === 'inUse') {
    actor.send({ type: 'START_USE', patientId: '', examId: '', by: 'system' })
  } else if (from === 'maintenance') {
    actor.send({ type: 'START_MAINTENANCE', notes: 'init', by: 'system' })
  } else if (from === 'broken') {
    actor.send({ type: 'REPORT_FAULT', reason: 'init', by: 'system' })
  } else if (from === 'offline') {
    actor.send({ type: 'GO_OFFLINE', reason: 'init', by: 'system' })
  }
  actor.send(event as never)
  const value = actor.getSnapshot().value as DeviceStateName
  actor.stop()
  return value
}
