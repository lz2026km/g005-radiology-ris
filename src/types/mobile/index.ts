/**
 * G005 放射RIS系统 v3.0.6.6 - 移动端类型定义
 * 10 升级点:离线同步 / 推送 / 生物识别 / 手势 / 触觉 / 相机 / 语音 / 冲突 / 缓存
 */

export type MobileDevicePlatform = 'ios' | 'android' | 'web' | 'unknown';

export type BiometricType = 'none' | 'touch-id' | 'face-id' | 'fingerprint' | 'iris' | 'voice';

export type NetworkConnectivity = 'online' | 'offline' | 'weak' | 'unstable';

export type SyncDirection = 'push' | 'pull' | 'bidirectional';

export type CacheStrategy = 'lru' | 'fifo' | 'priority' | 'manual';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' | 'none';

export type GestureType = 'tap' | 'double-tap' | 'long-press' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'pinch-in' | 'pinch-out' | 'rotate' | 'pan';

export type PushChannel = 'web-push' | 'apns' | 'fcm' | 'huawei-push' | 'mi-push';

export type ConflictResolutionStrategy = 'local-wins' | 'server-wins' | 'manual' | 'timestamp-newest' | 'merge' | 'field-level';

export type CameraMode = 'photo' | 'video' | 'document' | 'barcode' | 'portrait';

export type VoiceActivationState = 'idle' | 'listening' | 'processing' | 'activated' | 'error' | 'denied';

export interface MobileDeviceInfo {
  platform: MobileDevicePlatform;
  osVersion: string;
  appVersion: string;
  model: string;
  deviceId: string;
  pushToken?: string;
  biometricAvailable: BiometricType[];
  hasCamera: boolean;
  hasHaptics: boolean;
  hasGps: boolean;
  totalStorageBytes: number;
  freeStorageBytes: number;
  language: string;
  timezone: string;
}

export interface BiometricCredentials {
  type: BiometricType;
  challenge: string;
  signature?: string;
  publicKey?: string;
  credentialId: string;
  createdAt: string;
  lastUsedAt?: string;
  fallbackPin?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  type: BiometricType;
  errorCode?: 'user-cancel' | 'lockout' | 'no-enrollment' | 'hardware-error' | 'not-allowed' | 'unknown';
  errorMessage?: string;
  attemptsRemaining?: number;
  timestamp: string;
}

export interface OfflineEditPayload<T = Record<string, unknown>> {
  entityType: 'patient' | 'exam' | 'report' | 'study' | 'medication' | 'image' | 'note';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: T;
  priority: 'critical' | 'high' | 'normal' | 'low';
  capturedAt: string;
  deviceId: string;
  userId: string;
  baseVersion?: number;
  checksum?: string;
}

export interface SyncBatchResult {
  totalItems: number;
  successCount: number;
  failureCount: number;
  conflictCount: number;
  skippedCount: number;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  items: SyncItemResult[];
}

export interface SyncItemResult {
  itemId: string;
  entityType: OfflineEditPayload['entityType'];
  entityId: string;
  status: 'synced' | 'failed' | 'conflict' | 'skipped';
  serverVersion?: number;
  conflictId?: string;
  errorMessage?: string;
  attempts: number;
}

export interface MobileConflict {
  id: string;
  entityType: OfflineEditPayload['entityType'];
  entityId: string;
  field: string;
  localValue: unknown;
  serverValue: unknown;
  localTimestamp: string;
  serverTimestamp: string;
  localUserId: string;
  serverUserId?: string;
  resolution?: ConflictResolutionStrategy;
  resolvedAt?: string;
  resolvedBy?: string;
  mergedValue?: unknown;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
  deviceId: string;
  channel: PushChannel;
  createdAt: string;
  expiresAt?: string;
  topics: string[];
  silent: boolean;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: PushAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  ttl?: number;
  channel?: PushChannel;
  topic?: string;
}

export interface PushAction {
  action: string;
  title: string;
  icon?: string;
}

export interface GestureEvent {
  type: GestureType;
  target: HTMLElement;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  deltaX?: number;
  deltaY?: number;
  distance?: number;
  velocity?: number;
  duration?: number;
  scale?: number;
  rotation?: number;
  centerX?: number;
  centerY?: number;
  pointerCount: number;
  timestamp: number;
}

export interface GestureHandler {
  id: string;
  type: GestureType;
  selector?: string;
  enabled: boolean;
  preventDefault: boolean;
  callback: (event: GestureEvent) => void;
  options?: {
    minDistance?: number;
    maxDuration?: number;
    minScale?: number;
    threshold?: number;
  };
}

export interface CameraCaptureOptions {
  mode: CameraMode;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  facingMode: 'user' | 'environment';
  flash: boolean;
  withLocation: boolean;
  withTimestamp: boolean;
  format: 'jpeg' | 'png' | 'webp';
  purpose: 'documentation' | 'id-scan' | 'lesion' | 'barcode';
}

export interface CameraCaptureResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
  capturedAt: string;
  location?: { lat: number; lng: number; accuracy: number };
  deviceInfo: { model: string; facing: 'front' | 'rear' };
  metadata?: Record<string, unknown>;
}

export interface VoiceActivationConfig {
  wakeWord: string;
  language: 'zh-CN' | 'en-US';
  sensitivity: number;
  continuousMode: boolean;
  feedbackEnabled: boolean;
  customCommands: VoiceActivationCommand[];
  noiseFloor: number;
  minConfidence: number;
}

export interface VoiceActivationCommand {
  phrase: string;
  intent: string;
  parameters?: Record<string, string>;
  examples: string[];
  confidence: number;
}

export interface VoiceActivationResult {
  state: VoiceActivationState;
  transcript?: string;
  intent?: string;
  confidence: number;
  matchedCommand?: VoiceActivationCommand;
  alternatives: { transcript: string; confidence: number }[];
  audioLevel: number;
  timestamp: string;
}

export interface MobileCacheEntry<T = unknown> {
  id: string;
  key: string;
  category: 'patient' | 'report' | 'image' | 'template' | 'worklist' | 'protocol' | 'reference';
  data: T;
  metadata: {
    version: number;
    cachedAt: string;
    expiresAt: string;
    lastAccessedAt: string;
    accessCount: number;
    sizeBytes: number;
    priority: number;
  };
  syncStatus: 'clean' | 'dirty' | 'conflict' | 'stale';
}

export interface MobileCacheStats {
  totalEntries: number;
  totalSizeBytes: number;
  hitCount: number;
  missCount: number;
  evictionCount: number;
  hitRatio: number;
  lastEvictionAt?: string;
  quotaBytes: number;
  usedRatio: number;
}

export interface MobileNetworkState {
  connectivity: NetworkConnectivity;
  effectiveType: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown';
  downlinkMbps?: number;
  rttMs?: number;
  saveData: boolean;
  isMetered: boolean;
  lastChanged: string;
  serverReachable: boolean;
}

export interface MobileSettings {
  userId: string;
  biometricEnabled: boolean;
  biometricType: BiometricType;
  pinEnabled: boolean;
  pinHash?: string;
  pushEnabled: boolean;
  pushCategories: string[];
  quietHours: { enabled: boolean; start: string; end: string };
  offlineMode: boolean;
  autoSync: boolean;
  syncOnWifiOnly: boolean;
  hapticsEnabled: boolean;
  voiceActivation: boolean;
  voiceWakeWord: string;
  cameraQuality: 'low' | 'medium' | 'high';
  imageCacheLimitMB: number;
  language: 'zh-CN' | 'en-US';
  theme: 'light' | 'dark' | 'auto';
  updatedAt: string;
}
