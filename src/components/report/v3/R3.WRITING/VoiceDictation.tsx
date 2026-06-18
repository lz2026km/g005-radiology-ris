/**
 * G005 放射RIS系统 v3.0.5.1 - 语音听写
 * R3.WRITING 组 C:语音听写 Pro(Web Speech API)
 * 20 升级点:实时识别 / 自动标点 / 分段 / 命令 / 历史 / 多语言
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, Space, Button, Tag, Statistic, Select, Switch, Tooltip, message, Progress, Row, Col, Alert, Empty, List, Modal, Input } from 'antd';
import {
  Mic, MicOff, Square, Volume2, Languages, Command, History, Play, Pause, Trash2,
  Activity, FileText, Clock, AlertCircle, Settings, ChevronRight, Type,
} from 'lucide-react';
import { VOICE_DICTATION_MOCK } from '@data/reportWritingMock';
import {
  startVoiceDictation, pauseVoiceDictation, resumeVoiceDictation, stopVoiceDictation,
  getVoiceDictationHistory,
} from '@services/writing/writingService';
import type { VoiceDictationSession, VoiceDictationState, VoiceDictationLang } from '@types/R3/R3.WRITING';

interface Props {
  reportId: string;
  onTextChange?: (text: string) => void;
  onInsert?: (text: string) => void;
  disabled?: boolean;
}

const LANG_OPTIONS = [
  { value: 'zh-CN', label: '普通话', color: '#dc2626' },
  { value: 'en-US', label: 'English', color: '#3b82f6' },
  { value: 'zh-EN', label: '中英混合', color: '#7c3aed' },
];

const VOICE_COMMANDS = [
  { command: '换行', action: '插入换行' },
  { command: '新段落', action: '新段落' },
  { command: '删除', action: '删除上一句' },
  { command: '清除', action: '清空所有' },
  { command: '句号', action: '插入句号' },
  { command: '逗号', action: '插入逗号' },
  { command: '冒号', action: '插入冒号' },
  { command: '左肺', action: '插入"左肺"' },
  { command: '右肺', action: '插入"右肺"' },
];

export const VoiceDictation: React.FC<Props> = ({ reportId, onTextChange, onInsert, disabled = false }) => {
  const [session, setSession] = useState<VoiceDictationSession | null>(null);
  const [lang, setLang] = useState<VoiceDictationLang>('zh-CN');
  const [autoPunct, setAutoPunct] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<VoiceDictationSession['history']>([]);
  const [interimDisplay, setInterimDisplay] = useState('');
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // 检查浏览器支持
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* noop */ }
      }
    };
  }, []);

  const start = useCallback(async () => {
    if (disabled) return;
    if (!isSupported) {
      message.warning('当前浏览器不支持 Web Speech API,已使用 mock 模式');
    }
    const newSession = await startVoiceDictation(reportId, lang);
    setSession(newSession);
    setInterimDisplay('');
    startTimeRef.current = Date.now();

    // 真实 Web Speech API
    if (isSupported) {
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = newSession.finalText;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += (autoPunct ? autoPunctuate(transcript) : transcript);
          } else {
            interim += transcript;
          }
        }
        setInterimDisplay(interim);
        setSession((s) => s ? { ...s, finalText: final, interimText: interim, segments: [...s.segments, { start: Date.now() - startTimeRef.current, end: Date.now() - startTimeRef.current, text: final, confidence: 0.9 }] } : s);
        onTextChange?.(final);
      };
      recognition.onerror = (e: any) => {
        message.error(`识别错误: ${e.error}`);
      };
      recognition.onend = () => {
        if (recognitionRef.current && session?.state === 'listening') {
          try { recognition.start(); } catch { /* noop */ }
        }
      };
      recognitionRef.current = recognition;
      try { recognition.start(); } catch (e) { message.error('启动语音识别失败'); }
    } else {
      // Mock 模式 - 模拟识别
      mockRecognitionLoop(newSession);
    }
  }, [reportId, lang, autoPunct, isSupported, disabled, session?.state, onTextChange]);

  const mockRecognitionLoop = (initialSession: VoiceDictationSession) => {
    const MOCK_PHRASES = [
      '胸部 CT 平扫 + 增强所见,',
      '双侧胸廓对称,',
      '双肺纹理清晰,走行自然。',
      '右肺上叶尖段见一不规则形软组织密度结节,',
      '大小约 18 毫米乘 15 毫米。',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= MOCK_PHRASES.length || !recognitionRef.current) {
        clearInterval(interval);
        return;
      }
      const phrase = MOCK_PHRASES[i] ?? '';
      setInterimDisplay(phrase);
      setSession((s) => s ? { ...s, finalText: s.finalText + phrase, interimText: phrase, segments: [...s.segments, { start: Date.now() - startTimeRef.current, end: Date.now() - startTimeRef.current, text: phrase, confidence: 0.85 + Math.random() * 0.1 }] } : s);
      onTextChange?.(initialSession.finalText + MOCK_PHRASES.slice(0, i + 1).join(''));
      i++;
    }, 1500);
    recognitionRef.current = { stop: () => { clearInterval(interval); } };
  };

  const pause = useCallback(async () => {
    if (!session) return;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* noop */ }
    }
    const r = await pauseVoiceDictation(session.id);
    setSession((s) => s ? { ...s, state: r.state } : s);
  }, [session]);

  const resume = useCallback(async () => {
    if (!session) return;
    const r = await resumeVoiceDictation(session.id);
    setSession((s) => s ? { ...s, state: r.state } : s);
    if (recognitionRef.current && isSupported) {
      try { recognitionRef.current.start(); } catch { /* noop */ }
    }
  }, [session, isSupported]);

  const stop = useCallback(async () => {
    if (!session) return;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* noop */ }
    }
    const r = await stopVoiceDictation(session.id);
    setSession((s) => s ? { ...s, state: r.state, endedAt: new Date().toISOString(), totalDurationSec: r.durationSec, totalWords: r.totalWords } : s);
    message.success(`已停止,共识别 ${r.totalWords} 词,耗时 ${r.durationSec} 秒`);
  }, [session]);

  const insert = useCallback(() => {
    if (!session) return;
    onInsert?.(session.finalText);
    message.success('已插入到编辑器');
  }, [session, onInsert]);

  const clearAll = useCallback(() => {
    setSession((s) => s ? { ...s, finalText: '', interimText: '', segments: [] } : s);
    setInterimDisplay('');
    message.success('已清空');
  }, []);

  const loadHistory = useCallback(async () => {
    const h = await getVoiceDictationHistory(reportId);
    setHistory(h);
    setShowHistory(true);
  }, [reportId]);

  if (!isSupported) {
    // 继续渲染,只是用 mock
  }

  const duration = session ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
  const state = session?.state ?? 'idle';

  return (
    <Card
      size="small"
      className="shadow-sm"
      title={
        <div className="flex items-center justify-between">
          <Space>
            <Volume2 className="w-4 h-4" style={{ color: state === 'listening' ? '#dc2626' : '#94a3b8' }} />
            <span className="font-semibold">语音听写</span>
            <Tag color={state === 'listening' ? 'red' : state === 'paused' ? 'orange' : 'default'}>
              {({ idle: '待机', listening: '聆听中', paused: '已暂停', processing: '处理中', error: '错误' } as const)[state as VoiceDictationState] ?? state}
            </Tag>
            {!isSupported && <Tag color="orange">mock 模式</Tag>}
          </Space>
          <Button size="small" icon={<History className="w-3 h-3" />} onClick={loadHistory}>历史</Button>
        </div>
      }
    >
      {!isSupported && (
        <Alert type="info" showIcon className="mb-3" message="当前浏览器不支持 Web Speech API,使用 Mock 模拟识别过程" />
      )}

      <div className="space-y-3">
        <Row gutter={8}>
          <Col span={10}>
            <Select
              size="small"
              value={lang}
              onChange={setLang}
              style={{ width: '100%' }}
              options={LANG_OPTIONS}
              disabled={state === 'listening'}
            />
          </Col>
          <Col span={14}>
            <Space>
              <span className="text-xs text-slate-500">自动标点</span>
              <Switch size="small" checked={autoPunct} onChange={setAutoPunct} disabled={state === 'listening'} />
            </Space>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={6}><Statistic title="时长" value={duration} suffix="s" prefix={<Clock className="w-3 h-3" />} valueStyle={{ fontSize: 14 }} /></Col>
          <Col span={6}><Statistic title="词数" value={session?.totalWords ?? 0} prefix={<Type className="w-3 h-3" />} valueStyle={{ fontSize: 14 }} /></Col>
          <Col span={6}><Statistic title="分段" value={session?.segments.length ?? 0} prefix={<FileText className="w-3 h-3" />} valueStyle={{ fontSize: 14 }} /></Col>
          <Col span={6}><Statistic title="重试" value={0} prefix={<Activity className="w-3 h-3" />} valueStyle={{ fontSize: 14 }} /></Col>
        </Row>

        {/* 识别文本显示 */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 min-h-[120px] max-h-48 overflow-y-auto">
          {session?.finalText ? (
            <div className="text-sm text-slate-800 whitespace-pre-wrap">{session.finalText}</div>
          ) : (
            <div className="text-sm text-slate-400 text-center py-8">点击"开始"按钮开始语音听写...</div>
          )}
          {interimDisplay && (
            <div className="text-sm text-slate-500 italic mt-2 border-t border-dashed border-slate-300 pt-2">
              {interimDisplay}
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-2">
          {state === 'idle' && (
            <Button type="primary" danger size="large" icon={<Mic className="w-5 h-5" />} onClick={start} disabled={disabled}>
              开始听写
            </Button>
          )}
          {state === 'listening' && (
            <>
              <Button type="primary" icon={<MicOff className="w-4 h-4" />} onClick={pause}>暂停</Button>
              <Button danger icon={<Square className="w-4 h-4" />} onClick={stop}>停止</Button>
            </>
          )}
          {state === 'paused' && (
            <>
              <Button type="primary" icon={<Mic className="w-4 h-4" />} onClick={resume}>继续</Button>
              <Button danger icon={<Square className="w-4 h-4" />} onClick={stop}>停止</Button>
            </>
          )}
        </div>

        {session && session.finalText && (
          <div className="flex items-center gap-2">
            <Button type="primary" icon={<ChevronRight className="w-4 h-4" />} onClick={insert}>插入到编辑器</Button>
            <Button icon={<Trash2 className="w-4 h-4" />} onClick={clearAll}>清空</Button>
          </div>
        )}

        {/* 语音命令 */}
        <div className="border-t border-slate-200 pt-3">
          <h5 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
            <Command className="w-3 h-3" />语音命令
          </h5>
          <div className="flex flex-wrap gap-1">
            {VOICE_COMMANDS.map((c) => (
              <Tag key={c.command} color="cyan" className="text-xs">
                "{c.command}" → {c.action}
              </Tag>
            ))}
          </div>
        </div>

        {/* 段落列表 */}
        {session && session.segments.length > 0 && (
          <div className="border-t border-slate-200 pt-3 max-h-32 overflow-y-auto">
            <h5 className="text-xs font-semibold text-slate-600 mb-2">识别段落 ({session.segments.length})</h5>
            <div className="space-y-1">
              {session.segments.slice(-5).map((seg, i) => (
                <div key={i} className="text-xs p-1 bg-white border border-slate-200 rounded">
                  <div className="text-slate-700">{seg.text}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    {(seg.start / 1000).toFixed(1)}s ~ {(seg.end / 1000).toFixed(1)}s · 置信度 {(seg.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal title="语音听写历史" open={showHistory} onCancel={() => setShowHistory(false)} footer={null} width={600}>
        {history.length > 0 ? (
          <List
            dataSource={history}
            renderItem={(item) => (
              <List.Item
                actions={[<Button key="insert" size="small" type="primary" onClick={() => { onInsert?.(item.text); setShowHistory(false); }}>插入</Button>]}
              >
                <List.Item.Meta
                  title={<div className="text-sm">{item.text}</div>}
                  description={<div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无历史" />
        )}
      </Modal>
    </Card>
  );
};

// 简易自动标点
function autoPunctuate(text: string): string {
  let t = text.trim();
  if (!t) return t;
  if (!/[.,;:。,;;!?,]$/.test(t)) {
    t += '。';
  }
  return t + ' ';
}

export default VoiceDictation;
