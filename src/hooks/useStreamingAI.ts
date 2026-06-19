/**
 * G005 放射RIS系统 v3.0.6.5 - 流式 AI React Hook
 * A5-AI-ORCH / 20 点
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { streamingClient } from '../services/ai/streaming/StreamingClient';
import type { AIStreamEvent, AIStreamSubscription } from '../types/ai/orchestrator';

export interface UseStreamingAIOptions {
  autoStart?: boolean;
  mockContent?: string;
  onEvent?: (ev: AIStreamEvent) => void;
}

export interface UseStreamingAIResult {
  taskId: string | null;
  status: AIStreamSubscription['status'] | 'idle';
  text: string;
  chunks: AIStreamEvent[];
  progress: number;
  usage: { prompt: number; completion: number; total: number } | null;
  start: (content?: string) => string;
  cancel: () => void;
  reset: () => void;
}

export function useStreamingAI(opts: UseStreamingAIOptions = {}): UseStreamingAIResult {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<UseStreamingAIResult['status']>('idle');
  const [text, setText] = useState('');
  const [chunks, setChunks] = useState<AIStreamEvent[]>([]);
  const [progress, setProgress] = useState(0);
  const [usage, setUsage] = useState<UseStreamingAIResult['usage']>(null);
  const lastEventCount = useRef(0);

  const start = useCallback(
    (content?: string) => {
      const sub = streamingClient.subscribe(undefined, content ?? opts.mockContent);
      setTaskId(sub.taskId);
      setStatus('pending');
      setText('');
      setChunks([]);
      setProgress(0);
      setUsage(null);
      lastEventCount.current = 0;
      return sub.taskId;
    },
    [opts.mockContent],
  );

  const cancel = useCallback(() => {
    if (taskId) streamingClient.cancel(taskId);
  }, [taskId]);

  const reset = useCallback(() => {
    if (taskId) streamingClient.cancel(taskId);
    setTaskId(null);
    setStatus('idle');
    setText('');
    setChunks([]);
    setProgress(0);
    setUsage(null);
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return;
    const unsub = streamingClient.onChunk(taskId, (ev) => {
      setChunks((prev) => {
        if (prev.length >= lastEventCount.current) lastEventCount.current = prev.length;
        return [...prev, ev];
      });
      if (ev.type === 'chunk' && ev.data) {
        setText((prev) => prev + ev.data);
        if (ev.progress !== undefined) setProgress(ev.progress);
      }
      if (ev.type === 'complete') {
        setStatus('completed');
        setProgress(100);
        if (ev.usage) setUsage(ev.usage);
      }
      if (ev.type === 'error') setStatus('error');
      if (ev.type === 'cancelled') setStatus('cancelled');
      if (ev.type === 'start') setStatus('active');
      opts.onEvent?.(ev);
    });
    return unsub;
  }, [taskId, opts]);

  return { taskId, status, text, chunks, progress, usage, start, cancel, reset };
}
