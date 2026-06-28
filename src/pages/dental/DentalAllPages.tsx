import React, { useState, useEffect } from 'react';
import { Card, Space, Tag, Button, Table, Select, Input, Row, Col, Statistic, message, Tabs, Empty, Modal, Form, DatePicker, InputNumber, List, Alert, Badge } from 'antd';
import { Activity, Plus, Edit3, Search } from 'lucide-react';

const { TextArea } = Input;

// ===== DentalWorkspacePage =====
export const DentalWorkspacePage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [recalls, setRecalls] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const sR = await fetch('/api/v1/dental/stats'); const sD = await sR.json(); if (sD.success) setStats(sD.data);
        const tR = await fetch('/api/v1/dental/treatments?pageSize=10'); const tD = await tR.json(); if (tD.success) setTreatments(tD.data);
        const rR = await fetch('/api/v1/dental/recalls'); const rD = await rR.json(); if (rD.success) setRecalls(rD.data);
      } catch {}
    })();
  }, []);
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }}>
        <Activity size={20} color="#1677ff" />
        <span style={{ fontSize: 18, fontWeight: 600 }}>口腔工作台</span>
        <Tag color="cyan">v3.0.6.8-53</Tag>
      </Space>
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}><Card size="small"><Statistic title="今日患者" value={stats.todayPatients} /></Card></Col>
          <Col span={4}><Card size="small"><Statistic title="本周" value={stats.thisWeek} /></Card></Col>
          <Col span={4}><Card size="small"><Statistic title="日均" value={stats.avgPerDay} /></Card></Col>
          <Col span={4}><Card size="small"><Statistic title="今日收入" value={stats.revenueToday} prefix="¥" /></Card></Col>
          <Col span={8}><Alert message={`补牙 ${stats.topTreatments.Restorative} / 根管 ${stats.topTreatments.Endodontic} / 拔牙 ${stats.topTreatments.Extraction} / 种植 ${stats.topTreatments.Implant}`} type="info" showIcon /></Col>
        </Row>
      )}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="今日治疗" size="small">
            <Table size="small" dataSource={treatments} rowKey="id" pagination={false}
              columns={[{ title: '患者', dataIndex: 'patientName' }, { title: '类型', dataIndex: 'type', render: (t) => <Tag color="blue">{t}</Tag> }, { title: '牙位', dataIndex: 'toothNo' }, { title: '诊断', dataIndex: 'diagnosis' }, { title: '状态', dataIndex: 'status', render: (s) => <Tag color={s === 'Completed' ? 'green' : s === 'InProgress' ? 'orange' : 'default'}>{s}</Tag> }]} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="复诊提醒" size="small">
            <List size="small" dataSource={recalls} renderItem={(r: any) => <List.Item>{r.patientName} - {(r.recallDate || '').slice(0, 10)} {r.sent ? <Tag color="green">已通知</Tag> : <Tag color="orange">待通知</Tag>}</List.Item>} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ===== DentalTreatmentPage =====
export const DentalTreatmentPage: React.FC = () => {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [filter, setFilter] = useState({ type: '', keyword: '' });
  const [modal, setModal] = useState<{ type: string; data: any } | null>(null);
  const load = async () => {
    try { const r = await fetch(`/api/v1/dental/treatments?pageSize=50`); const d = await r.json(); if (d.success) setTreatments(d.data); } catch {}
  };
  useEffect(() => { load(); }, []);
  const filtered = treatments.filter((t: any) => {
    if (filter.type && t.type !== filter.type) return false;
    if (filter.keyword && !t.patientName?.includes(filter.keyword)) return false;
    return true;
  });
  return (
    <div style={{ padding: 24, background: '#f5f5f5' }}>
      <Space style={{ marginBottom: 16 }}><Activity size={20} color="#1677ff" /><span style={{ fontSize: 18, fontWeight: 600 }}>治疗管理</span><Tag color="cyan">v3.0.6.8-53</Tag></Space>
      <Card size="small" title={`治疗列表 (${filtered.length})`} extra={
        <Space>
          <Select size="small" value={filter.type || undefined} onChange={v => setFilter({...filter, type: v})} allowClear placeholder="类型" style={{ width: 120 }} options={['Restorative','Endodontic','Periodontal','Implant','Orthodontic','Extraction','Surgery','Pediatric'].map(t=>({value:t,label:t}))} />
          <Input.Search size="small" value={filter.keyword} onChange={e => setFilter({...filter, keyword: e.target.value})} placeholder="搜索" style={{ width: 150 }} />
          <Button type="primary" size="small" icon={<Plus size={12} />} onClick={() => setModal({type:'create', data:{}})}>新建</Button>
        </Space>
      }>
        <Table size="small" dataSource={filtered} rowKey="id" pagination={{ pageSize: 10 }}
          columns={[
            { title: '患者', dataIndex: 'patientName' },
            { title: '类型', dataIndex: 'type', render: (t) => <Tag color="blue">{t}</Tag> },
            { title: '牙位', dataIndex: 'toothNo' },
            { title: '诊断', dataIndex: 'diagnosis' },
            { title: '计划', dataIndex: 'plan' },
            { title: '状态', dataIndex: 'status', render: (s) => <Tag color={s === 'Completed' ? 'green' : s === 'InProgress' ? 'orange' : 'default'}>{s}</Tag> },
            { title: '费用', render: (_, t) => `¥${t.cost}` },
            { title: '操作', render: (_, t) => <Space><Button type="link" size="small" icon={<Plus size={12} />} onClick={() => fetch(`/api/v1/dental/treatments/${t.id}/start`, {method:'POST'}).then(()=>message.success('已开始')).then(load)}>开始</Button><Button type="link" onClick={() => fetch(`/api/v1/dental/treatments/${t.id}/complete`, {method:'POST'}).then(()=>message.success('已完成')).then(load)}>完成</Button></Space> },
          ]} />
      </Card>
    </div>
  );
};

// ===== DentalImplantPlanPage =====
export const DentalImplantPlanPage: React.FC = () => (
  <div style={{ padding: 24, background: '#f5f5f5' }}><Space><Activity size={20} color="#1677ff" /><span style={{ fontSize: 18, fontWeight: 600 }}>种植规划</span><Tag color="cyan">v3.0.6.8-53</Tag></Space>
    <Card title="种植计划" size="small" extra={<Button icon={<Plus size={12} />}>新建</Button>}>
      <List size="small" dataSource={['36 骨高度 12.5mm 神经管距8.2mm Straumann BLT 4.1','46 骨高度 10.2mm Nobel Replace 4.3','16 骨高度 8.5mm 需GBR Straumann TLX 3.3'].map((t,i)=>({id:`plan-${i}`,desc:t}))}
        renderItem={(p:any)=><List.Item>{p.desc}<Button type="link" size="small">导板设计</Button></List.Item>} />
    </Card>
  </div>
);

// ===== DentalOrthoPage =====
export const DentalOrthoPage: React.FC = () => (
  <div style={{ padding: 24, background: '#f5f5f5' }}><Space><Activity size={20} color="#1677ff" /><span style={{ fontSize: 18, fontWeight: 600 }}>正畸</span><Tag color="cyan">v3.0.6.8-53</Tag></Space>
    <Card title="隐形矫正计划" size="small"><Table size="small" columns={[
      {title:'ID',dataIndex:'id'},{title:'阶段',dataIndex:'stage'},{title:'进度',dataIndex:'progress',render:(p)=><Badge status={p === 1? 'processing' : 'success'} />}
    ]} dataSource={[{id:'ORTHO001',stage:'8/20',progress:0.4},{id:'ORTHO002',stage:'0/15',progress:1}]} rowKey="id" /></Card>
  </div>
);

// ===== DentalEndoPage / DentalPerioPage / DentalRestorativePage / DentalSurgeryPage / DentalPediatricPage =====
const genericPages = [
  { name: '根管治疗', path: 'DentalEndoPage', key: 'endo' },
  { name: '牙周治疗', path: 'DentalPerioPage', key: 'perio' },
  { name: '修复 (CAD/CAM)', path: 'DentalRestorativePage', key: 'restorative' },
  { name: '口腔外科', path: 'DentalSurgeryPage', key: 'surgery' },
  { name: '儿童牙科', path: 'DentalPediatricPage', key: 'pediatric' },
];

function makeGenericPage(title: string, treatmentsKey: string): React.FC {
  return () => {
    const [treatments, setTreatments] = useState<any[]>([]);
    useEffect(() => {
      fetch(`/api/v1/dental/treatments?type=${treatmentsKey}&pageSize=20`).then(r=>r.json()).then(d=>{ if(d.success) setTreatments(d.data); }).catch(()=>{});
    }, []);
    return (
      <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
        <Space style={{ marginBottom: 16 }}><Activity size={20} color="#1677ff" /><span style={{ fontSize: 18, fontWeight: 600 }}>{title}</span><Tag color="cyan">v3.0.6.8-53</Tag></Space>
        <List dataSource={treatments} renderItem={(t: any) => <List.Item>{t.patientName} - {t.diagnosis} - {t.plan} <Tag color="blue">{t.status}</Tag></List.Item>} />
      </div>
    );
  };
}

export const DentalEndoPage = makeGenericPage('根管治疗', 'Endodontic');
export const DentalPerioPage = makeGenericPage('牙周治疗', 'Periodontal');
export const DentalRestorativePage = makeGenericPage('修复 (CAD/CAM)', 'Restorative');
export const DentalSurgeryPage = makeGenericPage('口腔外科', 'Surgery');
export const DentalPediatricPage = makeGenericPage('儿童牙科', 'Pediatric');

// ===== DentalTelePage =====
export const DentalTelePage: React.FC = () => (
  <div style={{ padding: 24, background: '#f5f5f5' }}><Space><Activity size={20} color="#1677ff" /><span style={{ fontSize: 18, fontWeight: 600 }}>远程口腔会诊</span><Tag color="cyan">v3.0.6.8-53</Tag></Space>
    <Card title="创建会诊" size="small"><Space><Button onClick={()=>{fetch('/api/v1/dental/tele/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>r.json()).then(d=>{if(d.success)message.success('会诊创建成功')});}}>新建会诊</Button><Button onClick={()=>message.info('上传功能')}>上传口内照片</Button><Button onClick={()=>message.info('AI 预筛')}>AI 预筛</Button></Space></Card>
  </div>
);

// ===== DentalInventoryPage =====
export const DentalInventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { fetch('/api/v1/dental/inventory').then(r=>r.json()).then(d=>{if(d.success) setItems(d.data)}).catch(()=>{}); }, []);
  return (
    <div style={{ padding: 24, background: '#f5f5f5' }}>
      <Space style={{ marginBottom: 16 }}><Activity size={20} color="#1677ff" /><span style={{ fontSize: 18, fontWeight: 600 }}>牙科库存</span><Tag color="cyan">v3.0.6.8-53</Tag></Space>
      <Table size="small" dataSource={items} rowKey="id" columns={[
        {title:'名称',dataIndex:'name'},{title:'类别',dataIndex:'category'},{title:'库存',dataIndex:'stock',render:(s,r)=> <Tag color={s <= r.minStock ? 'red' : 'green'}>{s}</Tag>},{title:'单位',dataIndex:'unit'},{title:'最低',dataIndex:'minStock'},
      ]} />
    </div>
  );
};

// ===== DentalDashboardPage =====
export const DentalDashboardPage: React.FC = () => (
  <div style={{ padding: 24, background: '#f5f5f5' }}>
    <Space style={{ marginBottom: 16 }}><Activity size={20} color="#1677ff" /><span style={{ fontSize: 18, fontWeight: 600 }}>口腔运营仪表盘</span><Tag color="cyan">v3.0.6.8-53</Tag></Space>
    <Alert message="口腔诊所运营数据 - 建设中" type="info" showIcon />
  </div>
);
