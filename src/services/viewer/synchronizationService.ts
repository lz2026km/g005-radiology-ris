export type SyncLevel = 'frame' | 'stack' | 'study' | 'annotation'

export interface ViewportSyncState {
  viewportIds: string[]
  syncLevel: SyncLevel
  active: boolean
  masterViewportId: string | null
}

export interface SyncEvent {
  type: 'scroll' | 'ww-wc' | 'pan' | 'zoom' | 'annotation' | 'tool'
  viewportId: string
  timestamp: number
  data: Record<string, unknown>
}

export type SyncCallback = (event: SyncEvent) => void

const syncGroups = new Map<string, ViewportSyncState>()
const listeners = new Map<string, Set<SyncCallback>>()

export function createSyncGroup(
  groupId: string,
  viewportIds: string[],
  syncLevel: SyncLevel = 'frame'
): ViewportSyncState {
  const group: ViewportSyncState = {
    viewportIds,
    syncLevel,
    active: true,
    masterViewportId: viewportIds[0] ?? null,
  }
  syncGroups.set(groupId, group)
  return group
}

export function destroySyncGroup(groupId: string): void {
  syncGroups.delete(groupId)
  listeners.delete(groupId)
}

export function getSyncGroup(groupId: string): ViewportSyncState | undefined {
  return syncGroups.get(groupId)
}

export function listSyncGroups(): Map<string, ViewportSyncState> {
  return syncGroups
}

export function addToSyncGroup(groupId: string, viewportId: string): void {
  const group = syncGroups.get(groupId)
  if (group && !group.viewportIds.includes(viewportId)) {
    group.viewportIds.push(viewportId)
  }
}

export function removeFromSyncGroup(groupId: string, viewportId: string): void {
  const group = syncGroups.get(groupId)
  if (group) {
    group.viewportIds = group.viewportIds.filter(id => id !== viewportId)
    if (group.masterViewportId === viewportId) {
      group.masterViewportId = group.viewportIds[0] ?? null
    }
  }
}

export function setMasterViewport(groupId: string, viewportId: string): void {
  const group = syncGroups.get(groupId)
  if (group && group.viewportIds.includes(viewportId)) {
    group.masterViewportId = viewportId
  }
}

export function toggleSyncGroup(groupId: string): void {
  const group = syncGroups.get(groupId)
  if (group) group.active = !group.active
}

export function dispatchSyncEvent(groupId: string, event: SyncEvent): void {
  const group = syncGroups.get(groupId)
  if (!group || !group.active) return
  if (group.masterViewportId && event.viewportId !== group.masterViewportId) return

  const groupListeners = listeners.get(groupId)
  if (groupListeners) {
    for (const cb of groupListeners) {
      cb({ ...event, timestamp: Date.now() })
    }
  }
}

export function subscribeToSyncGroup(groupId: string, callback: SyncCallback): () => void {
  if (!listeners.has(groupId)) {
    listeners.set(groupId, new Set())
  }
  listeners.get(groupId)!.add(callback)
  return () => {
    listeners.get(groupId)?.delete(callback)
  }
}

export function createLinkedViewports(
  viewportIds: string[],
  syncLevel: SyncLevel = 'frame'
): { groupId: string; state: ViewportSyncState } {
  const groupId = `sync-${Date.now().toString(36)}`
  const state = createSyncGroup(groupId, viewportIds, syncLevel)
  return { groupId, state }
}
