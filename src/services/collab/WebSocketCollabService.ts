/**
 * G005 RIS v3.0.7 - 协同 WebSocket 服务 (Phase T6-W7)
 *
 *  - 自动重连(指数退避)
 *  - 事件广播 / 订阅 / 离线队列
 *  - 心跳 (heartbeat)
 *  - 房间级隔离
 *  - 跨标签页同步 (BroadcastChannel)
 *
 * NOTE:
 *  生产环境应配置真实 WSS 后端。
 *  默认回退到「离线 + 事件总线」模式,所有事件进入内存缓冲,
 *  通过 `subscribe()` 可被 React 组件订阅,保证 Demo 可运行。
 */

import type {
  CollabRoomId,
  CollabWsEvent,
  CollabWsEventType,
  CollabConnectionState,
} from '../../types/collab';

type EventHandler = (event: CollabWsEvent) => void;

const RECONNECT_INITIAL_MS = 1000;
const RECONNECT_MAX_MS = 30_000;
const HEARTBEAT_INTERVAL_MS = 25_000;

interface RoomConnection {
  roomId: CollabRoomId;
  socket: WebSocket | null;
  state: CollabConnectionState;
  handlers: Map<CollabWsEventType | '*', Set<EventHandler>>;
  /** 离线事件缓冲(等待重连后 flush) */
  outboundBuffer: CollabWsEvent[];
  /** 客户端 ID (用于去重) */
  clientId: string;
  reconnectTimer: number | null;
  heartbeatTimer: number | null;
  broadcastChannel: BroadcastChannel | null;
  intentionallyClosed: boolean;
}

const connections = new Map<CollabRoomId, RoomConnection>();

const generateId = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? `c_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);

const isBrowser = typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined';
const isBroadcastChannelSupported = typeof BroadcastChannel !== 'undefined';

const backoff = (attempt: number): number => {
  const v = RECONNECT_INITIAL_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * v;
  return Math.min(RECONNECT_MAX_MS, v + jitter);
};

const updateState = (conn: RoomConnection, patch: Partial<CollabConnectionState>): void => {
  conn.state = { ...conn.state, ...patch };
};

const flushBuffer = (conn: RoomConnection): void => {
  if (!conn.socket || conn.socket.readyState !== WebSocket.OPEN) return;
  while (conn.outboundBuffer.length > 0) {
    const ev = conn.outboundBuffer.shift();
    if (!ev) break;
    try {
      conn.socket.send(JSON.stringify(ev));
    } catch {
      conn.outboundBuffer.unshift(ev);
      break;
    }
  }
};

const startHeartbeat = (conn: RoomConnection): void => {
  stopHeartbeat(conn);
  conn.heartbeatTimer = window.setInterval(() => {
    if (!conn.socket || conn.socket.readyState !== WebSocket.OPEN) return;
    try {
      conn.socket.send(JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }));
    } catch {
      /* swallow */
    }
  }, HEARTBEAT_INTERVAL_MS);
};

const stopHeartbeat = (conn: RoomConnection): void => {
  if (conn.heartbeatTimer !== null) {
    window.clearInterval(conn.heartbeatTimer);
    conn.heartbeatTimer = null;
  }
};

const scheduleReconnect = (conn: RoomConnection): void => {
  if (conn.intentionallyClosed) return;
  if (conn.reconnectTimer !== null) return;
  const delay = backoff(conn.state.reconnectAttempts);
  conn.reconnectTimer = window.setTimeout(() => {
    conn.reconnectTimer = null;
    connectInternal(conn);
  }, delay);
};

const dispatch = (conn: RoomConnection, event: CollabWsEvent): void => {
  const wild = conn.handlers.get('*');
  if (wild) wild.forEach((h) => safeInvoke(h, event));
  const set = conn.handlers.get(event.type);
  if (set) set.forEach((h) => safeInvoke(h, event));
  // 跨标签页广播
  if (conn.broadcastChannel) {
    try {
      conn.broadcastChannel.postMessage(event);
    } catch {
      /* swallow */
    }
  }
};

const safeInvoke = (handler: EventHandler, event: CollabWsEvent): void => {
  try {
    handler(event);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[WebSocketCollabService] handler error', err);
  }
};

const connectInternal = (conn: RoomConnection): void => {
  if (!isBrowser) {
    updateState(conn, { status: 'error', lastError: 'WebSocket unavailable in current runtime' });
    return;
  }
  if (conn.socket && (conn.socket.readyState === WebSocket.OPEN || conn.socket.readyState === WebSocket.CONNECTING)) {
    return;
  }
  updateState(conn, { status: 'connecting' });
  // 真实部署替换为: `wss://your-server/collab/${conn.roomId}`
  // 这里使用占位 URL,失败时自动降级到 offline + BroadcastChannel 模式
  const url = `wss://collab.example.invalid/${encodeURIComponent(conn.roomId)}`;
  let socket: WebSocket;
  try {
    socket = new WebSocket(url);
  } catch (err) {
    updateState(conn, { status: 'error', lastError: (err as Error).message });
    scheduleReconnect(conn);
    return;
  }
  conn.socket = socket;
  socket.onopen = () => {
    updateState(conn, {
      status: 'open',
      connectedAt: new Date().toISOString(),
      reconnectAttempts: 0,
      lastError: undefined,
    });
    flushBuffer(conn);
    startHeartbeat(conn);
  };
  socket.onmessage = (msgEvent) => {
    try {
      const parsed = JSON.parse(msgEvent.data as string) as CollabWsEvent;
      dispatch(conn, parsed);
    } catch (err) {
      updateState(conn, { lastError: `parse: ${(err as Error).message}` });
    }
  };
  socket.onerror = () => {
    updateState(conn, { status: 'error', lastError: 'WebSocket error' });
  };
  socket.onclose = () => {
    stopHeartbeat(conn);
    conn.socket = null;
    if (!conn.intentionallyClosed) {
      updateState(conn, { status: 'closed' });
      updateState(conn, { reconnectAttempts: conn.state.reconnectAttempts + 1 });
      scheduleReconnect(conn);
    } else {
      updateState(conn, { status: 'closed' });
    }
  };
};

// ============================================================
// Public API
// ============================================================

export interface WebSocketCollabService {
  connect(roomId: CollabRoomId): RoomConnection;
  disconnect(roomId: CollabRoomId): void;
  broadcast(event: Omit<CollabWsEvent, 'id' | 'timestamp' | 'roomId'> & { roomId?: CollabRoomId }): boolean;
  subscribe(roomId: CollabRoomId, type: CollabWsEventType | '*', handler: EventHandler): () => void;
  /** 模拟发送(用于离线 / Demo 模式):不经过 WebSocket,直接分发给本地订阅者 */
  emitLocal(roomId: CollabRoomId, event: CollabWsEvent): void;
  getState(roomId: CollabRoomId): CollabConnectionState;
  listRooms(): CollabRoomId[];
}

const getOrCreateRoom = (roomId: CollabRoomId): RoomConnection => {
  const existing = connections.get(roomId);
  if (existing) return existing;
  const conn: RoomConnection = {
    roomId,
    socket: null,
    state: { status: 'idle', reconnectAttempts: 0 },
    handlers: new Map(),
    outboundBuffer: [],
    clientId: generateId(),
    reconnectTimer: null,
    heartbeatTimer: null,
    broadcastChannel: isBroadcastChannelSupported ? new BroadcastChannel(`g005-collab-${roomId}`) : null,
    intentionallyClosed: false,
  };
  connections.set(roomId, conn);
  // 跨标签页同步: 监听其他标签页的事件
  if (conn.broadcastChannel) {
    conn.broadcastChannel.onmessage = (e: MessageEvent) => {
      const data = e.data as CollabWsEvent;
      if (!data || data.roomId !== roomId) return;
      dispatch(conn, data);
    };
  }
  return conn;
};

export const webSocketCollabService: WebSocketCollabService = {
  connect(roomId) {
    const conn = getOrCreateRoom(roomId);
    conn.intentionallyClosed = false;
    if (conn.state.status === 'open' || conn.state.status === 'connecting') return conn;
    connectInternal(conn);
    return conn;
  },

  disconnect(roomId) {
    const conn = connections.get(roomId);
    if (!conn) return;
    conn.intentionallyClosed = true;
    if (conn.reconnectTimer !== null) {
      window.clearTimeout(conn.reconnectTimer);
      conn.reconnectTimer = null;
    }
    stopHeartbeat(conn);
    if (conn.socket) {
      try { conn.socket.close(); } catch { /* swallow */ }
      conn.socket = null;
    }
    updateState(conn, { status: 'closed' });
  },

  broadcast(event) {
    const targetRoomId = event.roomId ?? '';
    const conn = connections.get(targetRoomId);
    if (!conn) return false;
    const fullEvent: CollabWsEvent = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      clientId: conn.clientId,
      roomId: targetRoomId,
      ...event,
    };
    if (conn.socket && conn.socket.readyState === WebSocket.OPEN) {
      try {
        conn.socket.send(JSON.stringify(fullEvent));
        return true;
      } catch {
        conn.outboundBuffer.push(fullEvent);
        return false;
      }
    }
    conn.outboundBuffer.push(fullEvent);
    // 离线模式: 仍然本地分发给其他订阅者 (含跨标签页)
    dispatch(conn, fullEvent);
    return false;
  },

  subscribe(roomId, type, handler) {
    const conn = getOrCreateRoom(roomId);
    let set = conn.handlers.get(type);
    if (!set) {
      set = new Set();
      conn.handlers.set(type, set);
    }
    set.add(handler);
    return () => {
      set?.delete(handler);
    };
  },

  emitLocal(roomId, event) {
    const conn = connections.get(roomId);
    if (!conn) return;
    dispatch(conn, event);
  },

  getState(roomId) {
    return connections.get(roomId)?.state ?? { status: 'idle', reconnectAttempts: 0 };
  },

  listRooms() {
    return Array.from(connections.keys());
  },
};

export default webSocketCollabService;
