/**
 * G005 RIS v3.0.7 - 实时光标 (LiveCursor)
 *
 *  - 显示其他用户在编辑器内的光标位置
 *  - 自动衰减 (3s 后变淡)
 *  - 通过 PresenceService 订阅
 */

import React, { useEffect, useState } from 'react';
import { presenceService } from '../../services/collab/PresenceService';
import type { CollabUser } from '../../types/collab';

export interface LiveCursorProps {
  roomId?: string;
  reportId?: string;
  /** 当前用户 ID (自身不显示) */
  currentUserId: string;
  /** 显示模式: 'name-flag' | 'dot' */
  variant?: 'name-flag' | 'dot';
  /** 容器 className / style */
  containerStyle?: React.CSSProperties;
  testIdPrefix?: string;
}

interface CursorEntry {
  user: CollabUser;
  expiresAt: number;
}

export const LiveCursor: React.FC<LiveCursorProps> = ({
  roomId,
  reportId,
  currentUserId,
  variant = 'name-flag',
  containerStyle,
  testIdPrefix = 'live-cursor',
}) => {
  const [cursors, setCursors] = useState<CursorEntry[]>([]);

  useEffect(() => {
    const update = () => {
      const target = roomId ?? reportId ?? '';
      const users = presenceService.getActive({ roomId: target });
      const now = Date.now();
      setCursors(
        users
          .filter((u) => u.id !== currentUserId && (u.cursorIndex !== undefined))
          .map((u) => ({ user: u, expiresAt: now + 5000 })),
      );
    };
    update();
    const unsub = presenceService.subscribe(update);
    const timer = window.setInterval(update, 2000);
    return () => {
      unsub();
      window.clearInterval(timer);
    };
  }, [roomId, reportId, currentUserId]);

  if (cursors.length === 0) return null;

  return (
    <div
      data-testid={testIdPrefix}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...containerStyle }}
    >
      {cursors.map(({ user, expiresAt }) => {
        const idx = user.cursorIndex ?? 0;
        // 与 CollaborativeReportEditor 内的光标定位保持一致
        const top = 12 + Math.floor(idx / 80) * 22.4;
        const left = 12 + (idx % 80) * 8.4;
        const opacity = Math.max(0.3, Math.min(1, (expiresAt - Date.now()) / 5000));
        return (
          <div
            key={user.id}
            data-testid={`${testIdPrefix}-${user.id}`}
            style={{
              position: 'absolute',
              top,
              left,
              opacity,
              transition: 'opacity 0.5s',
            }}
          >
            <span
              style={{
                display: 'block',
                width: variant === 'dot' ? 8 : 2,
                height: variant === 'dot' ? 8 : 18,
                background: user.color,
                boxShadow: '0 0 0 1px white',
              }}
            />
            {variant === 'name-flag' && (
              <span
                style={{
                  position: 'absolute',
                  top: -18,
                  left: 0,
                  background: user.color,
                  color: 'white',
                  fontSize: 12,
                  padding: '1px 6px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
              >
                {user.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LiveCursor;
