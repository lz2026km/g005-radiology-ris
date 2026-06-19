/**
 * G005 放射RIS系统 v3.0.6.5 - 语音字段导航 Hook
 * 20 升级点:语音跳转字段 / 触发词匹配 / 焦点管理
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { voiceCommandEngine } from '../../services/voice/commands/VoiceCommandEngine';
import type { VoiceFieldTarget, VoiceFieldNavigationEvent, VoiceCommandMatch } from '../../types/voice';

export interface UseVoiceFieldNavigationOptions {
  fields: VoiceFieldTarget[];
  onNavigate?: (event: VoiceFieldNavigationEvent) => void;
  initialIndex?: number;
  triggerPrefix?: string;        // 默认 '去'
}

export interface UseVoiceFieldNavigationResult {
  currentIndex: number;
  currentField: VoiceFieldTarget | null;
  fields: VoiceFieldTarget[];
  history: VoiceFieldNavigationEvent[];
  next: () => void;
  prev: () => void;
  goTo: (fieldKey: string) => void;
  clear: () => void;
  processCommand: (text: string) => { matched: VoiceCommandMatch | null; newIndex: number; mode: string };
}

const FIELD_NAME_MAP: Record<string, string> = {
  findings: '影像所见',
  impression: '诊断印象',
  diagnosis: '诊断',
  recommendation: '建议',
  full: '全篇',
  technique: '检查技术',
  history: '病史',
  comparison: '对比',
};

export function useVoiceFieldNavigation(options: UseVoiceFieldNavigationOptions): UseVoiceFieldNavigationResult {
  const { fields, onNavigate, initialIndex = 0, triggerPrefix = '去' } = options;
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, Math.min(initialIndex, fields.length - 1)));
  const [history, setHistory] = useState<VoiceFieldNavigationEvent[]>([]);
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;

  useEffect(() => {
    if (currentIndex >= fields.length && fields.length > 0) {
      setCurrentIndex(0);
    }
  }, [fields.length, currentIndex]);

  const record = useCallback((evt: VoiceFieldNavigationEvent) => {
    setHistory((prev) => [evt, ...prev].slice(0, 30));
    onNavigate?.(evt);
  }, [onNavigate]);

  const next = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIdx = (prev + 1) % fieldsRef.current.length;
      const f = fieldsRef.current[prev];
      const t = fieldsRef.current[nextIdx];
      if (f && t) record({ from: f.fieldKey, to: t.fieldKey, trigger: 'next', timestamp: Date.now(), mode: 'next' });
      return nextIdx;
    });
  }, [record]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIdx = (prev - 1 + fieldsRef.current.length) % fieldsRef.current.length;
      const f = fieldsRef.current[prev];
      const t = fieldsRef.current[nextIdx];
      if (f && t) record({ from: f.fieldKey, to: t.fieldKey, trigger: 'prev', timestamp: Date.now(), mode: 'prev' });
      return nextIdx;
    });
  }, [record]);

  const goTo = useCallback((fieldKey: string) => {
    const idx = fieldsRef.current.findIndex((f) => f.fieldKey === fieldKey);
    if (idx < 0) return;
    setCurrentIndex((prev) => {
      const f = fieldsRef.current[prev];
      const t = fieldsRef.current[idx];
      if (f && t) record({ from: f.fieldKey, to: t.fieldKey, trigger: 'goto', timestamp: Date.now(), mode: 'goto' });
      return idx;
    });
  }, [record]);

  const clear = useCallback(() => {
    setCurrentIndex((prev) => {
      const f = fieldsRef.current[prev];
      if (f) record({ from: f.fieldKey, to: f.fieldKey, trigger: 'clear', timestamp: Date.now(), mode: 'clear' });
      return prev;
    });
  }, [record]);

  const processCommand = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return { matched: null, newIndex: currentIndex, mode: 'noop' };

    // 1. "去 影像所见"
    if (trimmed.startsWith(triggerPrefix)) {
      const target = trimmed.slice(triggerPrefix.length).trim();
      for (const f of fieldsRef.current) {
        if (
          target === f.fieldLabel ||
          target === f.fieldLabelEn ||
          (f.triggerWords ?? []).includes(target) ||
          FIELD_NAME_MAP[f.fieldKey] === target
        ) {
          const idx = fieldsRef.current.indexOf(f);
          setCurrentIndex((prev) => {
            const from = fieldsRef.current[prev];
            if (from) record({ from: from.fieldKey, to: f.fieldKey, trigger: trimmed, timestamp: Date.now(), mode: 'goto' });
            return idx;
          });
          return { matched: { command: { id: 'nav', command: trimmed, english: trimmed, aliases: [], action: 'goto-field', category: 'field', description: '', descriptionEn: '', enabled: true, priority: 100 }, matchedPhrase: trimmed, confidence: 0.95, timestamp: Date.now() }, newIndex: idx, mode: 'goto' };
        }
      }
    }

    // 2. 通过 voiceCommandEngine 识别 next-field / prev-field
    const matches = voiceCommandEngine.recognize(trimmed);
    for (const m of matches) {
      if (m.command.action === 'next-field') { next(); return { matched: m, newIndex: (currentIndex + 1) % fieldsRef.current.length, mode: 'next' }; }
      if (m.command.action === 'prev-field') { prev(); return { matched: m, newIndex: (currentIndex - 1 + fieldsRef.current.length) % fieldsRef.current.length, mode: 'prev' }; }
      if (m.command.action === 'goto-field' && m.command.customPayload?.field) {
        const target = m.command.customPayload.field;
        const idx = fieldsRef.current.findIndex((f) => f.fieldKey === target);
        if (idx >= 0) {
          goTo(target);
          return { matched: m, newIndex: idx, mode: 'goto' };
        }
      }
      if (m.command.action === 'clear-field') { clear(); return { matched: m, newIndex: currentIndex, mode: 'clear' }; }
    }

    return { matched: null, newIndex: currentIndex, mode: 'noop' };
  }, [currentIndex, next, prev, goTo, clear, record, triggerPrefix]);

  return {
    currentIndex,
    currentField: useMemo(() => fields[currentIndex] ?? null, [fields, currentIndex]),
    fields,
    history,
    next,
    prev,
    goTo,
    clear,
    processCommand,
  };
}
