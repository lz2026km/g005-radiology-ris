/**
 * G005 放射RIS系统 v3.0.5.1 - 结构化字段表单
 * R3.WRITING 组 A:RECIST 1.1 / BI-RADS / PI-RADS / Lung-RADS / TI-RADS / CAD-RADS
 * 50 升级点:7+ 字段类型 / 必填校验 / 联动 / 分组 / 拖拽 / 默认值 / 单位 / 公式 / 上传 / 签名 / 评分 / 完成度环
 */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Card, Tabs, Form, Input, InputNumber, Select, DatePicker, Switch, Slider, Button,
  Space, Tag, Tooltip, Progress, Row, Col, Statistic, Divider, Empty, Modal, message,
  Alert, Radio,
} from 'antd';
import {
  CheckCircle2, AlertTriangle, Upload, Lock, Calculator, Hash, Calendar,
  ChevronDown, ChevronUp, Image as ImageIcon, Edit3, Star, Info, Award,
  Activity, Heart, Brain, ListTree, FileText,
} from 'lucide-react';
import {
  RECIST_TEMPLATE, BIRADS_TEMPLATE, PIRADS_TEMPLATE, ALL_STRUCTURED_TEMPLATES,
  BIRADS_CATEGORY_MAP, RECIST_RESPONSE, PIRADS_ASSESSMENT,
} from '@data/reportWritingMock';
import {
  calcRecistResponse, calcPiradsOverall, getBiradsByCategory, evaluateFormula,
} from '@services/writing/writingService';
import type {
  StructuredTemplate, StructuredFieldDefinition, StructuredFieldGroup,
  BiradsAssessment, BiradsCategory, RecistResponse, PiradsScore,
} from '@types/R3/R3.WRITING';

const { TextArea } = Input;

interface Props {
  reportId: string;
  initialTemplateId?: StructuredTemplate['id'];
  initialValues?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  onSubmit?: (values: Record<string, unknown>) => void;
  readOnly?: boolean;
}

const TABS = [
  { id: 'recist', label: 'RECIST 1.1', icon: Activity, color: '#3b82f6' },
  { id: 'birads', label: 'BI-RADS', icon: Heart, color: '#ec4899' },
  { id: 'pirads', label: 'PI-RADS v2.1', icon: Brain, color: '#8b5cf6' },
  { id: 'lungRads', label: 'Lung-RADS 1.1', icon: Activity, color: '#10b981' },
  { id: 'tiRads', label: 'TI-RADS', icon: ListTree, color: '#f59e0b' },
  { id: 'cadRads', label: 'CAD-RADS', icon: FileText, color: '#0891b2' },
] as const;

export const StructuredFieldForm: React.FC<Props> = ({
  reportId, initialTemplateId = 'recist', initialValues, onChange, onSubmit, readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<StructuredTemplate['id']>(initialTemplateId);
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const template = useMemo(() => ALL_STRUCTURED_TEMPLATES.find((t) => t.id === activeTab), [activeTab]);
  const activeTabMeta = useMemo(() => TABS.find((t) => t.id === activeTab) ?? TABS[0]!, [activeTab]);

  // 公式自动计算
  useEffect(() => {
    if (!template) return;
    const formulaFields = template.fields.filter((f) => f.formula);
    const newValues: Record<string, unknown> = { ...values };
    let changed = false;
    formulaFields.forEach((f) => {
      if (!f.formula) return;
      const numericValues: Record<string, number> = {};
      template.fields.forEach((tf) => {
        if (typeof values[tf.key] === 'number') numericValues[tf.key] = values[tf.key] as number;
      });
      const result = evaluateFormula(f.formula, numericValues);
      if (result !== values[f.key]) {
        newValues[f.key] = Number(result.toFixed(2));
        changed = true;
      }
    });
    if (changed) {
      setValues(newValues);
      onChange?.(newValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, template]);

  const handleValueChange = useCallback((key: string, value: unknown) => {
    const next = { ...values, [key]: value };
    setValues(next);
    onChange?.(next);
  }, [values, onChange]);

  // 完成度计算
  const completion = useMemo(() => {
    if (!template) return { filled: 0, total: 0, percent: 0 };
    const required = template.fields.filter((f) => f.required);
    const filled = required.filter((f) => values[f.key] !== undefined && values[f.key] !== '' && values[f.key] !== null).length;
    return { filled, total: required.length, percent: Math.round((filled / required.length) * 100) };
  }, [template, values]);

  // 字段质量分计算
  const fieldScore = useMemo(() => {
    if (!template) return 0;
    const all = template.fields;
    const filled = all.filter((f) => values[f.key] !== undefined && values[f.key] !== '').length;
    return Math.round((filled / all.length) * 100);
  }, [template, values]);

  // 联动可见性
  const isFieldVisible = useCallback((f: StructuredFieldDefinition) => {
    if (!f.dependsOn) return true;
    return values[f.dependsOn.fieldKey] === f.dependsOn.equals;
  }, [values]);

  const toggleGroup = (gid: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid);
      else next.add(gid);
      return next;
    });
  };

  const renderField = (f: StructuredFieldDefinition) => {
    if (!isFieldVisible(f)) return null;
    const isLocked = f.locked || readOnly;
    const labelNode = (
      <span className="flex items-center gap-1">
        {f.label}
        {f.required && <span style={{ color: '#dc2626' }}>*</span>}
        {f.locked && <Lock className="w-3 h-3" style={{ color: '#94a3b8' }} />}
        {f.formula && <Calculator className="w-3 h-3" style={{ color: '#0891b2' }} />}
        {f.fillGuide && (
          <Tooltip title={f.fillGuide}>
            <Info className="w-3 h-3" style={{ color: '#94a3b8', cursor: 'help' }} />
          </Tooltip>
        )}
      </span>
    );

    const commonProps = {
      disabled: isLocked,
      placeholder: f.placeholder,
    };

    let control: React.ReactNode = null;
    switch (f.type) {
      case 'text':
        control = <Input {...commonProps} value={(values[f.key] as string) ?? ''} onChange={(e) => handleValueChange(f.key, e.target.value)} />;
        break;
      case 'number':
        control = (
          <InputNumber
            {...commonProps}
            value={values[f.key] as number | null}
            min={f.min}
            max={f.max}
            addonAfter={f.unitOptions ? (
              <Select size="small" defaultValue={f.unit ?? f.unitOptions[0]} style={{ width: 70 }} options={f.unitOptions.map((u) => ({ value: u, label: u }))} />
            ) : f.unit}
            onChange={(v) => handleValueChange(f.key, v)}
            style={{ width: '100%' }}
          />
        );
        break;
      case 'enum':
        control = (
          <Select
            {...commonProps}
            value={values[f.key] as string | undefined}
            onChange={(v) => handleValueChange(f.key, v)}
            options={(f.options ?? []).map((o) => ({ value: o.value, label: <span><Tag color={o.color}>{o.label}</Tag></span> }))}
            style={{ width: '100%' }}
          />
        );
        break;
      case 'multi-enum':
        control = (
          <Select
            {...commonProps}
            mode="multiple"
            value={(values[f.key] as string[]) ?? []}
            onChange={(v) => handleValueChange(f.key, v)}
            options={(f.options ?? []).map((o) => ({ value: o.value, label: o.label }))}
            style={{ width: '100%' }}
          />
        );
        break;
      case 'date':
        control = (
          <DatePicker
            {...commonProps}
            value={(values[f.key] as string) ? (values[f.key] as unknown as React.ComponentProps<typeof DatePicker>['value']) : null}
            onChange={(_d, ds) => handleValueChange(f.key, ds)}
            style={{ width: '100%' }}
          />
        );
        break;
      case 'scale':
        control = (
          <div className="flex items-center gap-3 w-full">
            <Slider
              {...commonProps}
              min={f.min ?? 0}
              max={f.max ?? 10}
              value={(values[f.key] as number) ?? f.defaultValue ?? 0}
              onChange={(v) => handleValueChange(f.key, v)}
              marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }}
              style={{ flex: 1 }}
            />
            <span className="font-semibold text-lg" style={{ color: activeTabMeta.color, minWidth: 30 }}>
              {values[f.key] as number ?? f.defaultValue ?? 0}
            </span>
          </div>
        );
        break;
      case 'boolean':
        control = (
          <Switch
            {...commonProps}
            checked={Boolean(values[f.key])}
            onChange={(v) => handleValueChange(f.key, v)}
            checkedChildren="是"
            unCheckedChildren="否"
          />
        );
        break;
      case 'image':
        control = (
          <Upload listType="picture-card" showUploadList={{ showPreviewIcon: true }} beforeUpload={() => false}>
            <Button icon={<ImageIcon className="w-4 h-4" />} type="text">上传</Button>
          </Upload>
        );
        break;
      case 'signature':
        control = (
          <Button icon={<Edit3 className="w-4 h-4" />} type="dashed" disabled={isLocked}>
            {values[f.key] ? '已签名' : '点击签名'}
          </Button>
        );
        break;
      case 'formula':
        control = (
          <Input {...commonProps} value={String(values[f.key] ?? '')} disabled prefix={<Calculator className="w-3 h-3" style={{ color: '#0891b2' }} />} suffix={f.unit} />
        );
        break;
    }

    return (
      <Form.Item key={f.id} label={labelNode} required={f.required} colon={false} className="mb-3">
        {control}
        {f.referenceRange && (
          <div className="text-xs text-slate-500 mt-1">
            参考范围: {f.referenceRange.min ?? '-'} ~ {f.referenceRange.max ?? '-'} {f.referenceRange.unit ?? ''}
            {f.referenceRange.note && ` (${f.referenceRange.note})`}
          </div>
        )}
        {f.example && (
          <div className="text-xs text-blue-500 mt-1">
            示例: {f.example}
          </div>
        )}
      </Form.Item>
    );
  };

  const renderTab = (template: StructuredTemplate) => (
    <div className="space-y-3">
      {template.groups.map((g) => {
        const fields = template.fields.filter((f) => f.group === g.id);
        const collapsed = collapsedGroups.has(g.id);
        const filled = fields.filter((f) => values[f.key] !== undefined && values[f.key] !== '').length;
        return (
          <Card
            key={g.id}
            size="small"
            title={
              <div className="flex items-center justify-between">
                <Space>
                  <span style={{ fontWeight: 600 }}>{g.label}</span>
                  <Tag color="blue">{filled}/{fields.length}</Tag>
                </Space>
                <Button type="text" size="small" icon={collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />} onClick={() => toggleGroup(g.id)} />
              </div>
            }
            className="shadow-sm"
          >
            {!collapsed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {fields.map(renderField)}
              </div>
            )}
          </Card>
        );
      })}

      {/* 摘要区:分类/评分/建议 */}
      <SummaryCard templateId={template.id} values={values} />
    </div>
  );

  return (
    <div className="space-y-3">
      {/* 完成度头部 */}
      <Card size="small" className="shadow-sm">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Statistic
              title="必填完成度"
              value={completion.percent}
              suffix="%"
              prefix={completion.percent === 100 ? <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} /> : <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: completion.percent === 100 ? '#10b981' : '#f59e0b', fontSize: 24 }}
            />
            <Progress percent={completion.percent} showInfo={false} strokeColor={completion.percent === 100 ? '#10b981' : '#f59e0b'} />
          </Col>
          <Col span={6}>
            <Statistic title="字段质量分" value={fieldScore} suffix="/100" prefix={<Award className="w-4 h-4" style={{ color: '#3b82f6' }} />} valueStyle={{ color: '#3b82f6', fontSize: 24 }} />
          </Col>
          <Col span={6}>
            <Statistic title="已填字段" value={completion.filled} suffix={`/ ${completion.total}`} prefix={<Hash className="w-4 h-4" style={{ color: '#8b5cf6' }} />} />
          </Col>
          <Col span={6}>
            <div className="flex items-center gap-2">
              <Button type="primary" icon={<CheckCircle2 className="w-4 h-4" />} onClick={() => onSubmit?.(values)} disabled={completion.percent < 100 || readOnly}>
                提交
              </Button>
              <Button onClick={() => { setValues({}); onChange?.({}); }}>清空</Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as StructuredTemplate['id'])}
        items={TABS.map((t) => ({
          key: t.id,
          label: (
            <Space>
              <t.icon className="w-4 h-4" style={{ color: t.color }} />
              {t.label}
            </Space>
          ),
          children: template ? renderTab(template) : <Empty />,
        }))}
      />
    </div>
  );
};

// ============================================================
// 摘要子组件
// ============================================================
const SummaryCard: React.FC<{ templateId: StructuredTemplate['id']; values: Record<string, unknown> }> = ({ templateId, values }) => {
  if (templateId === 'recist') {
    const lesions = [1, 2, 3, 4, 5].map((i) => ({
      id: `l${i}`,
      site: String(values[`lesion${i}Site`] ?? ''),
      longDiameterMm: Number(values[`lesion${i}Long`] ?? 0),
      shortDiameterMm: Number(values[`lesion${i}Short`] ?? 0),
      baselineMm: Number(values[`lesion${i}Baseline`] ?? 0),
    })).filter((l) => l.longDiameterMm > 0);
    const response: RecistResponse = lesions.length > 0
      ? calcRecistResponse(lesions)
      : RECIST_RESPONSE;
    return (
      <Card size="small" title="RECIST 1.1 评估" className="shadow-sm">
        <Row gutter={16}>
          <Col span={6}><Statistic title="长径总和" value={response.sumOfDiameters} suffix="mm" /></Col>
          <Col span={6}><Statistic title="基线总和" value={response.baselineSum} suffix="mm" /></Col>
          <Col span={6}><Statistic title="变化" value={response.percentChange} suffix="%" precision={1} valueStyle={{ color: response.percentChange < 0 ? '#10b981' : '#dc2626' }} /></Col>
          <Col span={6}>
            <Tag color={{ CR: 'green', PR: 'blue', SD: 'orange', PD: 'red', NE: 'default' }[response.category]} style={{ fontSize: 16, padding: '4px 12px' }}>
              {response.categoryLabel} ({response.category})
            </Tag>
          </Col>
        </Row>
      </Card>
    );
  }
  if (templateId === 'birads') {
    const cat = (values['biradsCategory'] as BiradsCategory) ?? '2';
    const a = getBiradsByCategory(cat);
    return (
      <Card size="small" title="BI-RADS 评估" className="shadow-sm">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Tag color={a.color} style={{ fontSize: 18, padding: '6px 16px' }}>BI-RADS {a.category}</Tag>
          </Col>
          <Col span={6}><div className="font-semibold text-lg">{a.label}</div><div className="text-xs text-slate-500">{a.labelEn}</div></Col>
          <Col span={6}><Statistic title="恶性风险" value={a.malignancyRisk} suffix="%" /></Col>
          <Col span={6}><div className="text-sm">{a.recommendation}</div></Col>
        </Row>
      </Card>
    );
  }
  if (templateId === 'pirads') {
    const overall = Number(values['overallScore'] ?? PIRADS_ASSESSMENT.overallScore) as PiradsScore;
    const psad = Number(values['psad'] ?? PIRADS_ASSESSMENT.psad);
    return (
      <Card size="small" title="PI-RADS v2.1 评估" className="shadow-sm">
        <Row gutter={16}>
          <Col span={6}>
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: overall >= 4 ? '#dc2626' : overall >= 3 ? '#f59e0b' : '#10b981' }}>{overall}</div>
              <div className="text-xs text-slate-500">Overall Score</div>
            </div>
          </Col>
          <Col span={6}><Statistic title="PSA" value={Number(values['psa'] ?? 0)} suffix="ng/mL" /></Col>
          <Col span={6}><Statistic title="前列腺体积" value={Number(values['prostateVolume'] ?? 0)} suffix="cc" /></Col>
          <Col span={6}><Statistic title="PSAD" value={psad} suffix="ng/mL/cc" precision={3} /></Col>
        </Row>
      </Card>
    );
  }
  return null;
};

export default StructuredFieldForm;
