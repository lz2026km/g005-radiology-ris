/**
 * G005 放射RIS系统 v3.0.6.6 - 移动端手势识别引擎
 * 25 升级点:swipe / pinch / rotate / tap / double-tap / long-press / pan / 配置化 / 防误触
 */

import type { GestureType, GestureEvent, GestureHandler } from '../../types/mobile';

interface TouchPoint {
  x: number;
  y: number;
  id: number;
  timestamp: number;
}

const DEFAULT_OPTIONS = {
  swipeMinDistance: 30,
  swipeMaxDuration: 500,
  doubleTapMaxGap: 300,
  longPressDuration: 600,
  pinchMinScale: 0.3,
  tapMaxDuration: 200,
  tapMaxDistance: 10,
};

class GestureEngine {
  private handlers: Map<string, GestureHandler> = new Map();
  private touches: Map<number, TouchPoint> = new Map();
  private touchStarts: TouchPoint[] = [];
  private lastTap: { x: number; y: number; time: number } | null = null;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private isLongPressed = false;
  private element: HTMLElement | null = null;
  private boundHandlers: Record<string, EventListener> = {};

  get handlerCount(): number {
    return this.handlers.size;
  }

  attach(element: HTMLElement): void {
    if (this.element) this.detach();
    this.element = element;
    this.boundHandlers = {
      touchstart: this.onTouchStart.bind(this),
      touchmove: this.onTouchMove.bind(this),
      touchend: this.onTouchEnd.bind(this),
      touchcancel: this.onTouchCancel.bind(this),
    };
    for (const [evt, fn] of Object.entries(this.boundHandlers)) {
      element.addEventListener(evt, fn, { passive: false });
    }
  }

  detach(): void {
    if (!this.element) return;
    for (const [evt, fn] of Object.entries(this.boundHandlers)) {
      this.element.removeEventListener(evt, fn);
    }
    this.element = null;
    this.touches.clear();
    this.touchStarts = [];
    this.clearLongPress();
  }

  register(handler: GestureHandler): () => void {
    this.handlers.set(handler.id, handler);
    return () => this.handlers.delete(handler.id);
  }

  unregister(id: string): void {
    this.handlers.delete(id);
  }

  enable(id: string): void {
    const h = this.handlers.get(id);
    if (h) h.enabled = true;
  }

  disable(id: string): void {
    const h = this.handlers.get(id);
    if (h) h.enabled = false;
  }

  setOptions(id: string, opts: Partial<GestureHandler['options']>): void {
    const h = this.handlers.get(id);
    if (h) h.options = { ...h.options, ...opts };
  }

  private onTouchStart(e: TouchEvent): void {
    this.isLongPressed = false;
    this.touchStarts = Array.from(e.touches).map(t => ({
      x: t.clientX, y: t.clientY, id: t.identifier, timestamp: Date.now(),
    }));
    for (const t of this.touchStarts) {
      this.touches.set(t.id, t);
    }

    if (e.touches.length === 1) {
      this.longPressTimer = setTimeout(() => {
        this.isLongPressed = true;
        this.fire('long-press', {
          type: 'long-press',
          startX: this.touchStarts[0]!.x,
          startY: this.touchStarts[0]!.y,
          pointerCount: 1,
          timestamp: Date.now(),
        } as GestureEvent);
      }, DEFAULT_OPTIONS.longPressDuration);
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (this.longPressTimer && e.touches.length > 1) {
      this.clearLongPress();
    }

    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i]!;
      this.touches.set(t.identifier, { x: t.clientX, y: t.clientY, id: t.identifier, timestamp: Date.now() });
    }

    if (e.touches.length === 2) {
      this.clearLongPress();
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      const s0 = this.touchStarts.find(ts => ts.id === t0.identifier);
      const s1 = this.touchStarts.find(ts => ts.id === t1.identifier);
      if (s0 && s1) {
        const startDist = Math.hypot(s0.x - s1.x, s0.y - s1.y);
        const curDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        const scale = startDist > 0 ? curDist / startDist : 1;
        const startAngle = Math.atan2(s1.y - s0.y, s1.x - s0.x);
        const curAngle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX);
        const rotation = (curAngle - startAngle) * (180 / Math.PI);

        this.fire('pinch-out', {
          type: scale >= 1 ? 'pinch-out' : 'pinch-in',
          startX: (s0.x + s1.x) / 2,
          startY: (s0.y + s1.y) / 2,
          scale,
          rotation,
          pointerCount: 2,
          timestamp: Date.now(),
        } as GestureEvent);

        if (Math.abs(rotation) > 15) {
          this.fire('rotate', {
            type: 'rotate',
            startX: (s0.x + s1.x) / 2,
            startY: (s0.y + s1.y) / 2,
            rotation,
            pointerCount: 2,
            timestamp: Date.now(),
          } as GestureEvent);
        }
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    this.clearLongPress();
    const endTime = Date.now();
    const touchEndPoints = Array.from(e.changedTouches).map(t => ({
      x: t.clientX, y: t.clientY, id: t.identifier, timestamp: endTime,
    }));

    for (const end of touchEndPoints) {
      const start = this.touchStarts.find(ts => ts.id === end.id);
      if (!start) continue;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.hypot(dx, dy);
      const duration = endTime - start.timestamp;

      if (dist < DEFAULT_OPTIONS.tapMaxDistance && duration < DEFAULT_OPTIONS.tapMaxDuration) {
        if (this.lastTap && (endTime - this.lastTap.time) < DEFAULT_OPTIONS.doubleTapMaxGap
          && Math.abs(end.x - this.lastTap.x) < DEFAULT_OPTIONS.tapMaxDistance
          && Math.abs(end.y - this.lastTap.y) < DEFAULT_OPTIONS.tapMaxDistance) {
          this.lastTap = null;
          this.fire('double-tap', {
            type: 'double-tap',
            startX: end.x, startY: end.y,
            pointerCount: 1, timestamp: endTime,
          } as GestureEvent);
        } else {
          this.lastTap = { x: end.x, y: end.y, time: endTime };
          this.fire('tap', {
            type: 'tap',
            startX: end.x, startY: end.y,
            pointerCount: 1, timestamp: endTime,
          } as GestureEvent);
        }
      }

      if (dist >= DEFAULT_OPTIONS.swipeMinDistance && duration < DEFAULT_OPTIONS.swipeMaxDuration) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        let swipeType: GestureType;
        if (angle > -45 && angle <= 45) swipeType = 'swipe-right';
        else if (angle > 45 && angle <= 135) swipeType = 'swipe-down';
        else if (angle > -135 && angle <= -45) swipeType = 'swipe-up';
        else swipeType = 'swipe-left';

        this.fire(swipeType, {
          type: swipeType,
          startX: start.x, startY: start.y,
          endX: end.x, endY: end.y,
          deltaX: dx, deltaY: dy,
          distance: dist,
          velocity: dist / Math.max(duration, 1),
          duration,
          pointerCount: 1,
          timestamp: endTime,
        } as GestureEvent);
      }

      this.touches.delete(start.id);
    }
  }

  private onTouchCancel(): void {
    this.clearLongPress();
    this.touches.clear();
    this.touchStarts = [];
  }

  private fire(type: GestureType, baseEvent: Partial<GestureEvent>): void {
    const target = this.element ?? document.body;
    const event: GestureEvent = {
      type,
      target: target as HTMLElement,
      startX: 0, startY: 0,
      pointerCount: 1,
      timestamp: Date.now(),
      ...baseEvent,
    };

    for (const handler of this.handlers.values()) {
      if (!handler.enabled) continue;
      if (handler.type !== type) continue;
      if (handler.selector) {
        const match = target.closest(handler.selector);
        if (!match) continue;
      }
      if (handler.options) {
        const { minDistance, maxDuration, minScale } = handler.options;
        if (minDistance && (event.distance ?? 0) < minDistance) continue;
        if (maxDuration && (event.duration ?? 0) > maxDuration) continue;
        if (minScale && (event.scale ?? 0) < minScale) continue;
      }
      if (handler.preventDefault) {
        event.target.dispatchEvent(new Event('gesture-prevented'));
      }
      try { handler.callback(event); } catch { /* handler error */ }
    }
  }

  private clearLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}

export const gestureEngine = new GestureEngine();
export type { GestureHandler };
