/**
 * G005 放射RIS系统 v3.0.6.8-23c - Notifications 统一组件 (A3)
 *
 * 与 Toast 视觉对齐:
 *  - borderRadius: 8px (与 message 一致)
 *  - fontSize: 14px
 *  - 图标尺寸: 18-20px
 *
 * 包装 antd notification,提供与 Toast 一致的视觉样式与业务 hooks。
 * 不再自建 Modal/Toast 浮层,统一走 <AntdApp> context。
 */

import { useCallback } from 'react';
import { App } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

const NOTIFY_BORDER_RADIUS = 8;
const NOTIFY_FONT_SIZE = 14;

export interface NotificationItemConfig {
  message: string;
  description?: ReactNode;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  icon?: ReactNode;
}

function playCriticalAlert(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const beep = (startAt: number, freq = 880) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + 0.25);
        osc.start(ctx.currentTime + startAt);
        osc.stop(ctx.currentTime + startAt + 0.3);
      };
      beep(0, 880);
      beep(0.35, 988);
    }
  } catch {
    // ignore
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate?.([200, 100, 200, 100, 400]);
    } catch {
      // ignore
    }
  }
}

/**
 * Notifications 业务封装
 * - 视觉与 Toast 对齐(borderRadius/fontSize/icon)
 * - criticalValue: 危急值(声音 + 震动 + 红色强提示)
 * - reportCompleted: 报告完成
 * - systemAnnouncement: 系统公告
 */
export function useNotifications() {
  const { notification } = App.useApp();

  const open = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', config: NotificationItemConfig) => {
      const defaultIcon = {
        success: <CheckCircleOutlined style={{ color: '#059669' }} />,
        error: <CloseCircleOutlined style={{ color: '#dc2626' }} />,
        warning: <ExclamationCircleOutlined style={{ color: '#d97706' }} />,
        info: <InfoCircleOutlined style={{ color: '#2563eb' }} />,
      }[type];

      notification[type]({
        message: config.message,
        description: config.description,
        placement: config.placement ?? 'topRight',
        duration: config.duration ?? (type === 'error' ? 6 : type === 'warning' ? 5 : 4),
        icon: config.icon ?? defaultIcon,
        style: { borderRadius: NOTIFY_BORDER_RADIUS, fontSize: NOTIFY_FONT_SIZE },
      });
    },
    [notification],
  );

  return {
    success: (title: string, description?: ReactNode) =>
      open('success', { message: title, description }),
    error: (title: string, description?: ReactNode) =>
      open('error', { message: title, description }),
    warning: (title: string, description?: ReactNode) =>
      open('warning', { message: title, description }),
    info: (title: string, description?: ReactNode) =>
      open('info', { message: title, description }),
    /** 业务:报告完成 */
    reportCompleted: (reportId: string, patientName: string) =>
      open('success', {
        message: '✅ 报告已完成',
        description: `报告 ${reportId} - ${patientName} 已通过审核并发布`,
        duration: 4,
      }),
    /** 业务:系统公告 */
    systemAnnouncement: (title: string, content: ReactNode) =>
      open('info', {
        message: `📢 ${title}`,
        description: content,
        duration: 8,
      }),
    /** 业务:危急值(声音 + 震动 + 红色强提示) */
    criticalValue: (patientName: string, finding: string) => {
      playCriticalAlert();
      notification.error({
        message: '🚨 危急值',
        description: `患者 ${patientName} - ${finding}`,
        placement: 'topRight',
        duration: 3,
        icon: <CloseCircleOutlined style={{ color: '#dc2626' }} />,
        style: { borderRadius: NOTIFY_BORDER_RADIUS, fontSize: NOTIFY_FONT_SIZE },
      });
    },
  };
}

export default useNotifications;