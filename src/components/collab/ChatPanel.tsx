import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Space, Tag, Tooltip } from 'antd';
import { MessageSquare, Send, Smile, Reply, Trash2, Edit3, X, AtSign, Pin, BellOff, Users } from 'lucide-react';
import { chatService } from '../../services/collab/ChatService';
import type { ChatMessage, ChatRoom, ChatMessageType } from '../../types/collab';

export interface ChatPanelProps {
  roomId: string;
  currentUser: { id: string; name: string; color: string };
  maxHeight?: number;
  compact?: boolean;
  testIdPrefix?: string;
}

const EMOJI_OPTIONS = ['👍', '✅', '👌', '🤔', '🎉', '🙏', '❤️', '😄'];

const timeAgo = (iso: string): string => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  roomId,
  currentUser,
  maxHeight = 400,
  compact = false,
  testIdPrefix = 'chat-panel',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [unread, setUnread] = useState(0);

  const reload = () => {
    setMessages(chatService.list(roomId, { limit: 50 }));
    const rooms = chatService.rooms();
    const r = rooms.find((x) => x.id === roomId);
    if (r) setRoom(r);
    setUnread(chatService.unreadCount(roomId, currentUser.id));
  };

  useEffect(() => {
    reload();
    const unsub = chatService.subscribe(() => reload());
    const timer = window.setInterval(reload, 5000);
    return () => { unsub(); window.clearInterval(timer); };
  }, [roomId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const send = () => {
    const content = inputValue.trim();
    if (!content) return;
    chatService.send({
      roomId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorColor: currentUser.color,
      content,
      type: content.startsWith('@') ? 'mention' : 'text',
      mentions: content.match(/@(\S+)/g)?.map((m) => m.slice(1)) ?? [],
      replyToId: replyTo?.id,
    });
    setInputValue('');
    setReplyTo(null);
    chatService.markRead(roomId, currentUser.id);
  };

  const recall = (msg: ChatMessage) => {
    if (msg.authorId !== currentUser.id) return;
    chatService.recall(msg.id);
  };

  const startEdit = (msg: ChatMessage) => {
    if (msg.authorId !== currentUser.id) return;
    setEditingId(msg.id);
    setEditValue(msg.content);
  };

  const saveEdit = (msgId: string) => {
    chatService.edit(msgId, editValue);
    setEditingId(null);
    setEditValue('');
  };

  const addReaction = (msgId: string, emoji: string) => {
    chatService.react(msgId, emoji, currentUser.id, 'add');
    setShowEmoji(false);
  };

  const addMention = () => {
    setInputValue((p) => `${p} @`);
  };

  const groupedByDate = useMemo(() => {
    const groups: { date: string; msgs: ChatMessage[] }[] = [];
    let currentDate = '';
    for (const m of messages) {
      const d = new Date(m.createdAt).toLocaleDateString('zh-CN');
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: d, msgs: [] });
      }
      groups[groups.length - 1]!.msgs.push(m);
    }
    return groups;
  }, [messages]);

  const getRepliedContent = (replyToId?: string): string | null => {
    if (!replyToId) return null;
    const m = messages.find((x) => x.id === replyToId);
    return m ? `${m.authorName}: ${m.content.slice(0, 40)}` : null;
  };

  return (
    <div
      data-testid={testIdPrefix}
      role="region"
      aria-label="聊天"
      style={{
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <MessageSquare size={14} color="#3b82f6" />
        <strong style={{ fontSize: 13, flex: 1 }}>{room?.name ?? '聊天'}</strong>
        <Space size={4}>
          {room?.pinned && <Pin size={12} color="#f59e0b" />}
          {room?.muted && <BellOff size={12} color="#94a3b8" />}
          {unread > 0 && (
            <Tag color="red" style={{ fontSize: 10, margin: 0 }}>{unread}</Tag>
          )}
          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            <Users size={11} /> {room?.participants.length ?? 0}
          </span>
        </Space>
      </div>

      <div
        ref={listRef}
        data-testid={`${testIdPrefix}-list`}
        style={{ flex: 1, overflowY: 'auto', padding: 8, maxHeight }}
      >
        {messages.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
            <MessageSquare size={20} style={{ opacity: 0.4 }} />
            <div style={{ marginTop: 6 }}>暂无消息</div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.authorId === currentUser.id;
            const replied = getRepliedContent(msg.replyToId);
            return (
              <div
                key={msg.id}
                data-testid={`${testIdPrefix}-msg-${msg.id}`}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 6,
                  padding: compact ? 4 : 6,
                  background: msg.type === 'system' ? '#f8fafc' : 'transparent',
                  borderRadius: 6,
                  opacity: msg.recalled ? 0.5 : 1,
                }}
              >
                {msg.type !== 'system' && (
                  <div
                    style={{
                      width: 24, height: 24, borderRadius: '50%', background: msg.authorColor, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2,
                    }}
                  >
                    {msg.authorName.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {msg.type !== 'system' && (
                    <Space size={4}>
                      <strong style={{ fontSize: 11, color: '#0f172a' }}>{msg.authorName}</strong>
                      <span style={{ fontSize: 9, color: '#94a3b8' }}>{timeAgo(msg.createdAt)}</span>
                      {isMine && <Tag color="cyan" style={{ fontSize: 9, margin: 0 }}>我</Tag>}
                      {msg.editedAt && <Tag style={{ fontSize: 9, margin: 0 }}>已编辑</Tag>}
                    </Space>
                  )}
                  {msg.recalled ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>[消息已撤回]</div>
                  ) : editingId === msg.id ? (
                    <div style={{ marginTop: 4 }}>
                      <Input.TextArea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={1}
                        size="small"
                      />
                      <Space size={4} style={{ marginTop: 4 }}>
                        <Button size="small" type="primary" onClick={() => saveEdit(msg.id)}>保存</Button>
                        <Button size="small" onClick={() => setEditingId(null)}>取消</Button>
                      </Space>
                    </div>
                  ) : (
                    <>
                      {replied && (
                        <div style={{ fontSize: 10, color: '#64748b', borderLeft: '2px solid #cbd5e1', paddingLeft: 6, marginTop: 2 }}>
                          {replied}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 2 }}>
                        {msg.type === 'system' ? (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>{msg.content}</span>
                        ) : (
                          msg.content.split(/(@\S+)/g).map((part, i) => {
                            if (part.startsWith('@')) return <Tag key={i} color="blue" style={{ fontSize: 10 }}>{part}</Tag>;
                            return <span key={i}>{part}</span>;
                          })
                        )}
                      </div>
                      {msg.reactions.length > 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {msg.reactions.map((r) => (
                            <span
                              key={r.emoji}
                              data-testid={`${testIdPrefix}-reaction-${msg.id}-${r.emoji}`}
                              onClick={() => chatService.react(msg.id, r.emoji, currentUser.id, 'remove')}
                              style={{ padding: '1px 6px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 10, cursor: 'pointer' }}
                            >
                              {r.emoji} {r.userIds.length}
                            </span>
                          ))}
                        </div>
                      )}
                      {msg.type !== 'system' && !compact && (
                        <Space size={2} style={{ marginTop: 2 }}>
                          <Tooltip title="回复">
                            <button
                              type="button"
                              onClick={() => setReplyTo(msg)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                            >
                              <Reply size={10} />
                            </button>
                          </Tooltip>
                          <Tooltip title="反应">
                            <button
                              type="button"
                              onClick={() => { setShowEmoji(!showEmoji); }}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                            >
                              <Smile size={10} />
                            </button>
                          </Tooltip>
                          {isMine && (
                            <>
                              <Tooltip title="编辑">
                                <button
                                  type="button"
                                  onClick={() => startEdit(msg)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                                >
                                  <Edit3 size={10} />
                                </button>
                              </Tooltip>
                              <Tooltip title="撤回">
                                <button
                                  type="button"
                                  onClick={() => recall(msg)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </Tooltip>
                            </>
                          )}
                        </Space>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {replyTo && (
        <div style={{ padding: '4px 8px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
          <Reply size={10} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            回复 {replyTo.authorName}: {replyTo.content.slice(0, 30)}
          </span>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div style={{ padding: 8, borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Tooltip title="@ 提及">
            <Button size="small" icon={<AtSign size={11} />} onClick={addMention} />
          </Tooltip>
          <Tooltip title="表情">
            <Button size="small" icon={<Smile size={11} />} onClick={() => setShowEmoji(!showEmoji)} />
          </Tooltip>
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="发送消息..."
            rows={compact ? 1 : 2}
            style={{ flex: 1, fontSize: 12 }}
            data-testid={`${testIdPrefix}-input`}
          />
          <Button
            type="primary"
            icon={<Send size={12} />}
            onClick={send}
            disabled={!inputValue.trim()}
            data-testid={`${testIdPrefix}-send`}
          />
        </div>
        {showEmoji && (
          <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setInputValue((p) => `${p}${e}`);
                  setShowEmoji(false);
                }}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 16 }}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
