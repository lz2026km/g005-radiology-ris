export interface PushNotificationPayload {
  title: string
  body: string
  data?: Record<string, unknown>
  tag?: string
}

export interface PushSubscriptionInfo {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export interface IPushService {
  readonly supported: boolean
  subscribe(): Promise<PushSubscriptionInfo | null>
  unsubscribe(): Promise<boolean>
  sendLocalNotification(payload: PushNotificationPayload): void
}

class MockPushService implements IPushService {
  readonly supported = 'Notification' in window && Notification.permission !== 'denied'

  async subscribe(): Promise<PushSubscriptionInfo | null> {
    if (!this.supported) return null
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return null
    return {
      endpoint: 'https://mock.push.service/g005',
      keys: { p256dh: 'mock-key', auth: 'mock-auth' },
    }
  }

  async unsubscribe(): Promise<boolean> {
    return true
  }

  sendLocalNotification(payload: PushNotificationPayload): void {
    if (!this.supported) return
    try {
      new Notification(payload.title, {
        body: payload.body,
        data: payload.data,
        tag: payload.tag ?? 'g005-default',
        icon: '/g005-radiology-ris/icons/icon-192x192.svg',
      })
    } catch {
      // Notification not supported
    }
  }
}

let _pushService: IPushService | null = null

export function getPushService(): IPushService {
  if (!_pushService) {
    _pushService = new MockPushService()
  }
  return _pushService
}

export function sendTestNotification(): void {
  const svc = getPushService()
  svc.sendLocalNotification({
    title: 'G005 RIS',
    body: '推送通知测试成功',
    tag: 'g005-test',
  })
}
