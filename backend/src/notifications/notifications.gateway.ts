/**
 * G005 放射RIS系统 v3.0.2.2 - 通知 WebSocket Gateway(简化)
 * 真实实装需 @nestjs/websockets + socket.io
 * 此处用纯 Node EventEmitter 模拟推送,便于测试
 */
import { Injectable, Logger } from '@nestjs/common'
import { NotificationsService } from './notifications.service'

@Injectable()
export class NotificationsGateway {
  private readonly logger = new Logger(NotificationsGateway.name)
  private listeners = new Map<string, Array<(payload: any) => void>>()

  constructor(private readonly service: NotificationsService) {}

  /**
   * 订阅用户通知流
   */
  subscribe(userId: string, cb: (payload: any) => void) {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, [])
    }
    this.listeners.get(userId)!.push(cb)
    return () => {
      const arr = this.listeners.get(userId) ?? []
      this.listeners.set(
        userId,
        arr.filter((x) => x !== cb)
      )
    }
  }

  /**
   * 推送通知(由 service.create 触发)
   */
  push(userId: string, notification: any) {
    const subs = this.listeners.get(userId) ?? []
    subs.forEach((cb) => {
      try {
        cb(notification)
      } catch (e) {
        this.logger.error('push failed', e)
      }
    })
    this.logger.log(`pushed to userId=${userId} count=${subs.length}`)
  }

  /**
   * 广播
   */
  broadcastAll(userIds: string[], notification: any) {
    userIds.forEach((u) => this.push(u, notification))
  }
}
