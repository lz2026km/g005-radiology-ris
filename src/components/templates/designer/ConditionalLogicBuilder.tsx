/**
 * G005 RIS v3.0.6.5 - 条件逻辑可视化构建器
 * 60 升级点 - 拖拽式 if-then 规则 / 多条件组合 / 动作列表 / 模板绑定
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  Card, Button, Space, Tag, Select, Input, Switch, Form, Row, Col, Tooltip,
  Modal, Empty, Divider, message, InputNumber,
} from 'antd';
import {
  Plus, Trash2, GitBranch, ChevronDown, ChevronRight, Zap, Code, Save,
  ArrowDown, Hash, Type, Calendar, ToggleLeft, ListChecks,
  AlertCircle,
} from 'lucide-react';

const { TextArea } = Input;

// ---------- 类型 ----------
type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'multi-enum';
type Operator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not-in' | 'contains' | 'is-empty' | 'is-not-empty';

export interface RuleCondition {
  id: string;
  fieldKey: string;
  fieldType: FieldType;
  operator: Operator;
  value: unknown;
}

export type RuleActionType =
  | 'show-field'
  | 'hide-field'
  | 'require-field'
  | 'default-value'
  | 'snippet-insert'
  | 'rads-recompute'
  | 'critical-alert'
  | 'tag-add'
  | 'color-flag';

export interface RuleAction {
  id: string;
  type: RuleActionType;
  target: string;
  value: unknown;
}

export interface ConditionalRule {
  id: string;
  name: string;
  enabled: boolean;
  combinator: 'AND' | 'OR';
  conditions: RuleCondition[];
  actions: RuleAction[];
  description: string;
}

// ---------- 元数据 ----------
const OPERATOR_LABELS: Record<Operator, { label: string; types: FieldType[] }> = {
  eq: { label: '=', types: ['string', 'number', 'boolean', 'enum', 'date'] },
  neq: { label: '≠', types: ['string', 'number', 'boolean', 'enum', 'date'] },
  gt: { label: '>', types: ['number', 'date'] },
  gte: { label: '≥', types: ['number', 'date'] },
  lt: { label: '<', types: ['number', 'date'] },
  lte: { label: '≤', types: ['number', 'date'] },
  in: { label: '在…中', types: ['enum', 'multi-enum'] },
  'not-in': { label: '不在…中', types: ['enum', 'multi-enum'] },
  contains: { label: '包含', types: ['string'] },
  'is-empty': { label: '为空', types: ['string', 'enum', 'multi-enum'] },
  'is-not-empty': { label: '非空', types: ['string', 'enum', 'multi-enum'] },
};

const ACTION_LABELS: Record<RuleActionType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'show-field': { label: '显示字段', color: 'blue', icon: ChevronRight },
  'hide-field': { label: '隐藏字段', color: 'default', icon: ChevronDown },
  'require-field': { label: '设为必填', color: 'red', icon: AlertCircle },
  'default-value': { label: '设置默认值', color: 'purple', icon: Type },
  'snippet-insert': { label: '插入短语', color: 'cyan', icon: Code },
  'rads-recompute': { label: '重算 RADS', color: 'volcano', icon: Hash },
  'critical-alert': { label: '标记危急', color: 'red', icon: AlertCircle },
  'tag-add': { label: '添加标签', color: 'green', icon: Tag },
  'color-flag': { label: '颜色标记', color: 'gold', icon: Zap },
};

const FIELD_TYPE_ICON: Record<FieldType, React.ComponentType<{ className?: string }>> = {
  string: Type, number: Hash, boolean: ToggleLeft, date: Calendar, enum: ListChecks, 'multi-enum': ListChecks,
};

// ---------- 组件 ----------
interface Props {
  rules?: ConditionalRule[];
  fields: Array<{ key: string; label: string; type: FieldType; options?: string[] }>;
  onChange?: (rules: ConditionalRule[]) => void;
}

export const ConditionalLogicBuilder: React.FC<Props> = ({ rules: initial = [], fields, onChange }) => {
  const [rules, setRules] = useState<ConditionalRule[]>(initial);
  const [editing, setEditing] = useState<ConditionalRule | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const update = useCallback((next: ConditionalRule[]) => {
    setRules(next);
    onChange?.(next);
  }, [onChange]);

  const handleNew = useCallback(() => {
    const rule: ConditionalRule = {
      id: `rule-${Date.now()}`,
      name: '新规则',
      enabled: true,
      combinator: 'AND',
      conditions: [{ id: `c-${Date.now()}`, fieldKey: fields[0]?.key ?? '', fieldType: fields[0]?.type ?? 'string', operator: 'eq', value: '' }],
      actions: [],
      description: '',
    };
    setEditing(rule);
    setModalOpen(true);
  }, [fields]);

  const handleEdit = useCallback((rule: ConditionalRule) => {
    setEditing({ ...rule, conditions: [...rule.conditions], actions: [...rule.actions] });
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    update(rules.filter((r) => r.id !== id));
  }, [rules, update]);

  const handleToggle = useCallback((id: string, enabled: boolean) => {
    update(rules.map((r) => r.id === id ? { ...r, enabled } : r));
  }, [rules, update]);

  const handleSave = useCallback(() => {
    if (!editing) return;
    const exists = rules.find((r) => r.id === editing.id);
    if (exists) {
      update(rules.map((r) => r.id === editing.id ? editing : r));
    } else {
      update([...rules, editing]);
    }
    setModalOpen(false);
    setEditing(null);
    message.success('规则已保存');
  }, [editing, rules, update]);

  return (
    <Card
      size="small"
      className="shadow-sm"
      title={
        <Space>
          <GitBranch className="w-4 h-4 text-cyan-500" />
          条件逻辑规则
          <Tag>{rules.length} 条</Tag>
        </Space>
      }
      extra={
        <Button type="primary" size="small" icon={<Plus className="w-4 h-4" />} onClick={handleNew}>
          新建规则
        </Button>
      }
    >
      {rules.length === 0 ? (
        <Empty description="暂无规则" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="space-y-2">
          {rules.map((r) => <RuleCard key={r.id} rule={r} onEdit={() => handleEdit(r)} onDelete={() => handleDelete(r.id)} onToggle={(e) => handleToggle(r.id, e)} />)}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? `编辑规则:${editing.name}` : '新建规则'}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        width={800}
        okText="保存"
      >
        {editing && <RuleEditor rule={editing} onChange={setEditing} fields={fields} />}
      </Modal>
    </Card>
  );
};

// ---------- 规则卡片 ----------
const RuleCard: React.FC<{
  rule: ConditionalRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}> = ({ rule, onEdit, onDelete, onToggle }) => (
  <div className={`border rounded p-2 ${rule.enabled ? 'bg-white' : 'bg-slate-50 opacity-60'}`}>
    <div className="flex items-center justify-between">
      <Space>
        <Switch size="small" checked={rule.enabled} onChange={onToggle} />
        <span className="font-medium">{rule.name}</span>
        <Tag color="blue">{rule.combinator}</Tag>
        <span className="text-xs text-slate-500">{rule.conditions.length} 条件 / {rule.actions.length} 动作</span>
      </Space>
      <Space>
        <Button size="small" type="link" onClick={onEdit}>编辑</Button>
        <Button size="small" type="link" danger icon={<Trash2 className="w-3 h-3" />} onClick={onDelete}>删除</Button>
      </Space>
    </div>
    {rule.description && <div className="text-xs text-slate-500 mt-1">{rule.description}</div>}
  </div>
);

// ---------- 规则编辑器 ----------
const RuleEditor: React.FC<{
  rule: ConditionalRule;
  onChange: (r: ConditionalRule) => void;
  fields: Array<{ key: string; label: string; type: FieldType; options?: string[] }>;
}> = ({ rule, onChange, fields }) => {
  const addCondition = () => {
    const c: RuleCondition = {
      id: `c-${Date.now()}`,
      fieldKey: fields[0]?.key ?? '',
      fieldType: fields[0]?.type ?? 'string',
      operator: 'eq',
      value: '',
    };
    onChange({ ...rule, conditions: [...rule.conditions, c] });
  };

  const updateCondition = (idx: number, patch: Partial<RuleCondition>) => {
    const next = rule.conditions.map((c, i) => i === idx ? { ...c, ...patch } : c);
    onChange({ ...rule, conditions: next });
  };

  const removeCondition = (idx: number) => {
    onChange({ ...rule, conditions: rule.conditions.filter((_, i) => i !== idx) });
  };

  const addAction = () => {
    const a: RuleAction = { id: `a-${Date.now()}`, type: 'show-field', target: fields[0]?.key ?? '', value: '' };
    onChange({ ...rule, actions: [...rule.actions, a] });
  };

  const updateAction = (idx: number, patch: Partial<RuleAction>) => {
    const next = rule.actions.map((a, i) => i === idx ? { ...a, ...patch } : a);
    onChange({ ...rule, actions: next });
  };

  const removeAction = (idx: number) => {
    onChange({ ...rule, actions: rule.actions.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <Form layout="vertical" size="small">
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="规则名称">
              <Input value={rule.name} onChange={(e) => onChange({ ...rule, name: e.target.value })} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="组合方式">
              <Select value={rule.combinator} onChange={(v) => onChange({ ...rule, combinator: v })}
                options={[{ value: 'AND', label: 'AND (全部满足)' }, { value: 'OR', label: 'OR (任一满足)' }]} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="启用">
              <Switch checked={rule.enabled} onChange={(e) => onChange({ ...rule, enabled: e })} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="描述">
          <TextArea rows={2} value={rule.description} onChange={(e) => onChange({ ...rule, description: e.target.value })} placeholder="规则用途说明" />
        </Form.Item>
      </Form>

      <Divider orientation="left" style={{ margin: '8px 0' }}>条件(IF)</Divider>
      <div className="space-y-1">
        {rule.conditions.map((c, i) => (
          <ConditionRow
            key={c.id} condition={c}
            fields={fields}
            onChange={(p) => updateCondition(i, p)}
            onRemove={() => removeCondition(i)}
          />
        ))}
      </div>
      <Button block size="small" icon={<Plus className="w-3 h-3" />} onClick={addCondition}>添加条件</Button>

      <Divider orientation="left" style={{ margin: '8px 0' }}>动作(THEN)</Divider>
      <div className="space-y-1">
        {rule.actions.map((a, i) => (
          <ActionRow
            key={a.id} action={a} fields={fields}
            onChange={(p) => updateAction(i, p)}
            onRemove={() => removeAction(i)}
          />
        ))}
      </div>
      <Button block size="small" icon={<Plus className="w-3 h-3" />} onClick={addAction}>添加动作</Button>
    </div>
  );
};

// ---------- 条件行 ----------
const ConditionRow: React.FC<{
  condition: RuleCondition;
  fields: Array<{ key: string; label: string; type: FieldType; options?: string[] }>;
  onChange: (p: Partial<RuleCondition>) => void;
  onRemove: () => void;
}> = ({ condition, fields, onChange, onRemove }) => {
  const field = fields.find((f) => f.key === condition.fieldKey);
  const availableOps = useMemo(
    () => Object.entries(OPERATOR_LABELS).filter(([, m]) => m.types.includes(condition.fieldType)),
    [condition.fieldType],
  );
  return (
    <div className="flex items-center gap-1 p-1 border rounded bg-slate-50">
      <Select
        size="small"
        value={condition.fieldKey}
        onChange={(v) => {
          const f = fields.find((x) => x.key === v);
          onChange({ fieldKey: v, fieldType: f?.type ?? 'string' });
        }}
        style={{ width: 180 }}
        options={fields.map((f) => ({ value: f.key, label: f.label }))}
      />
      <Select
        size="small"
        value={condition.operator}
        onChange={(v) => onChange({ operator: v as Operator })}
        style={{ width: 100 }}
        options={availableOps.map(([v, m]) => ({ value: v, label: m.label }))}
      />
      {!['is-empty', 'is-not-empty'].includes(condition.operator) && (
        field?.type === 'boolean' ? (
          <Select size="small" value={String(condition.value)} onChange={(v) => onChange({ value: v === 'true' })} style={{ width: 100 }}
            options={[{ value: 'true', label: '是' }, { value: 'false', label: '否' }]} />
        ) : field?.type === 'enum' || field?.type === 'multi-enum' ? (
          <Select size="small" value={String(condition.value)} onChange={(v) => onChange({ value: v })} style={{ width: 140 }}
            options={(field.options ?? []).map((o) => ({ value: o, label: o }))} />
        ) : field?.type === 'number' ? (
          <InputNumber size="small" value={Number(condition.value)} onChange={(v) => onChange({ value: v })} style={{ width: 120 }} />
        ) : (
          <Input size="small" value={String(condition.value ?? '')} onChange={(e) => onChange({ value: e.target.value })} style={{ width: 140 }} />
        )
      )}
      <Button size="small" type="text" danger icon={<Trash2 className="w-3 h-3" />} onClick={onRemove} />
    </div>
  );
};

// ---------- 动作行 ----------
const ActionRow: React.FC<{
  action: RuleAction;
  fields: Array<{ key: string; label: string; type: FieldType; options?: string[] }>;
  onChange: (p: Partial<RuleAction>) => void;
  onRemove: () => void;
}> = ({ action, fields, onChange, onRemove }) => {
  const Icon = ACTION_LABELS[action.type].icon;
  return (
    <div className="flex items-center gap-1 p-1 border rounded bg-slate-50">
      <ArrowDown className="w-3 h-3 text-cyan-500" />
      <Tag color={ACTION_LABELS[action.type].color}><Icon className="w-3 h-3 inline" /> {ACTION_LABELS[action.type].label}</Tag>
      <Select
        size="small"
        value={action.type}
        onChange={(v) => onChange({ type: v as RuleActionType })}
        style={{ width: 140 }}
        options={Object.entries(ACTION_LABELS).map(([v, m]) => ({ value: v, label: m.label }))}
      />
      <Select
        size="small"
        value={action.target}
        onChange={(v) => onChange({ target: v })}
        style={{ width: 180 }}
        placeholder="目标字段"
        options={fields.map((f) => ({ value: f.key, label: f.label }))}
      />
      {action.type === 'default-value' && (
        <Input size="small" value={String(action.value ?? '')} onChange={(e) => onChange({ value: e.target.value })} style={{ width: 140 }} placeholder="默认值" />
      )}
      <Button size="small" type="text" danger icon={<Trash2 className="w-3 h-3" />} onClick={onRemove} />
    </div>
  );
};

export default ConditionalLogicBuilder;
