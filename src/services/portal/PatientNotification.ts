import { v4 as uuid } from 'uuid';
import type {
  PatientNotification,
  PatientNotificationChannel,
  PatientNotificationTrigger,
  PatientNotificationStatus,
} from '../../types/portal';

const NOTIFICATION_STORE = new Map<string, PatientNotification>();

export class PatientNotificationService {
  async send(params: {
    patientId: string;
    patientName: string;
    patientContact: string;
    channel: PatientNotificationChannel;
    trigger: PatientNotificationTrigger;
    templateId: string;
    templateName: string;
    title: string;
    body: string;
    payload?: Record<string, string | number | boolean>;
    linkUrl?: string;
    scheduledAt?: string;
  }): Promise<PatientNotification> {
    const id = `notif-${uuid().slice(0, 8)}`;
    const notification: PatientNotification = {
      id,
      patientId: params.patientId,
      patientName: params.patientName,
      patientContact: params.patientContact,
      channel: params.channel,
      trigger: params.trigger,
      templateId: params.templateId,
      templateName: params.templateName,
      title: params.title,
      body: params.body,
      payload: params.payload,
      linkUrl: params.linkUrl,
      status: 'pending',
      scheduledAt: params.scheduledAt,
      retryCount: 0,
      maxRetries: 3,
      cost: 0,
      durationMs: 0,
      traceId: `trace-${uuid().slice(0, 12)}`,
    };
    NOTIFICATION_STORE.set(id, notification);
    return this.dispatch(notification);
  }

  private async dispatch(notification: PatientNotification): Promise<PatientNotification> {
    notification.status = 'sending';
    const start = Date.now();
    try {
      await this.sendToChannel(notification);
      notification.status = 'delivered';
      notification.sentAt = new Date().toISOString();
      notification.deliveredAt = new Date().toISOString();
    } catch {
      notification.status = 'failed';
      notification.errorMessage = 'Channel delivery failed';
    }
    notification.durationMs = Date.now() - start;
    NOTIFICATION_STORE.set(notification.id, notification);
    return notification;
  }

  private async sendToChannel(_notification: PatientNotification): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  async get(id: string): Promise<PatientNotification | undefined> {
    return NOTIFICATION_STORE.get(id);
  }

  async listByPatient(patientId: string): Promise<PatientNotification[]> {
    return [...NOTIFICATION_STORE.values()]
      .filter(n => n.patientId === patientId)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }

  async retry(id: string): Promise<PatientNotification> {
    const notification = NOTIFICATION_STORE.get(id);
    if (!notification) throw new Error(`Notification ${id} not found`);
    if (notification.retryCount >= notification.maxRetries) throw new Error('Max retries exceeded');
    notification.retryCount += 1;
    notification.status = 'pending';
    return this.dispatch(notification);
  }

  async markRead(id: string): Promise<PatientNotification> {
    const notification = NOTIFICATION_STORE.get(id);
    if (!notification) throw new Error(`Notification ${id} not found`);
    notification.status = 'read';
    notification.readAt = new Date().toISOString();
    NOTIFICATION_STORE.set(id, notification);
    return notification;
  }

  async listRecent(limit = 20): Promise<PatientNotification[]> {
    return [...NOTIFICATION_STORE.values()]
      .sort((a, b) => ((b.createdAt ?? '').localeCompare(a.createdAt ?? '')))
      .slice(0, limit);
  }
}

export const patientNotificationService = new PatientNotificationService();
