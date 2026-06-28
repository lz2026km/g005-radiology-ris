import React, { useState, useEffect } from 'react';
import { Card, Space, Tag, Button, Table, Select, Input, Row, Col, Statistic, message, Tabs, Empty, Modal, Form, InputNumber, List, Alert, Badge, Timeline, Descriptions, Tooltip } from 'antd';
import { Activity, Plus, Edit3, Search, RefreshCw, CheckCircle2, XCircle, Calendar, Phone, Video, Globe, FileText, DollarSign, Upload } from 'lucide-react';
import { DentalPageLayout, DentalPageHeader, DentalTreatmentTable } from './DentalShared';
import type { DentalTreatment } from './DentalShared';

// ===== DentalImplantPlanPage (Replaces placeholder) =====
export const DentalImplantPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const load = async () => {
    try { const r=await fetch('/api/v1/dental/implant/plans'); const d=await r.json(); if(d.success) setPlans(d.data); } catch {}
  };
  useEffect(() => { load(); }, []);
  return (
    <DentalPageLayout header={{ title: '种植规划', tags: [<Tag key="b" color="blue">Straumann/Nobel 对标</Tag>] }}>
      <Row gutter={16}>
        <Col span={16}>
          <List dataSource={plans} renderItem={(t:any)=><List.Item><List.Item.Meta title={<span>{t.patientName} - FDI {t.toothNo} ({t.type})</span>} description={<span style={{fontSize:12,color:'#999'}}>{t.diagnosis} | {t.plan} | ¥{t.cost}</span>} /><Button size="small">导板设计</Button></List.Item>} />
        </Col>
        <Col span={8}>
          <Card size="small" title="种植体库">
            <div style={{marginBottom:8,padding:8,background:'#fafafa',borderRadius:4}}><b>Straumann BLT</b> 4.1×10mm RC</div>
            <div style={{marginBottom:8,padding:8,background:'#fafafa',borderRadius:4}}><b>Nobel Active</b> 4.3×10mm NP</div>
            <div style={{marginBottom:8,padding:8,background:'#fafafa',borderRadius:4}}><b>Nobel CC</b> 3.5×8mm</div>
          </Card>
        </Col>
      </Row>
    </DentalPageLayout>
  );
};

// ===== DentalOrthoPage (Replaces placeholder) =====
export const DentalOrthoPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => { fetch('/api/v1/dental/ortho/plans').then(r=>r.json()).then(d=>{if(d.success)setPlans(d.data)}).catch(()=>{}); }, []);
  return (
    <DentalPageLayout header={{ title: '正畸' }}>
      <Table dataSource={plans} rowKey="id" columns={[
        {title:'患者',dataIndex:'patientName'},{title:'诊断',dataIndex:'diagnosis'},{title:'计划',dataIndex:'plan'},
        {title:'费用',render:(_,t)=>'¥'+t.cost},{title:'状态',dataIndex:'status',render:(s)=><Tag>{s}</Tag>},
        {title:'',render:(_,t)=><Button size="small" onClick={()=>message.info('进度查询')}>进度</Button>},
      ]} pagination={false} />
    </DentalPageLayout>
  );
};

// ===== DentalEndoPage (Replaces generic) =====
export const DentalEndoPage: React.FC = () => {
  const [treats,setT]=useState<DentalTreatment[]>([]);
  useEffect(()=>{fetch('/api/v1/dental/treatments?type=Endodontic&pageSize=20').then(r=>r.json()).then(d=>{if(d.success)setT(d.data)}).catch(()=>{})},[]);
  return (
    <DentalPageLayout header={{ title: '根管治疗' }}>
      <DentalTreatmentTable data={treats} showActions />
    </DentalPageLayout>
  );
};

// ===== DentalPerioPage (Replaces generic) =====
export const DentalPerioPage: React.FC = () => {
  const [treats,setT]=useState<DentalTreatment[]>([]);
  useEffect(()=>{fetch('/api/v1/dental/treatments?type=Periodontal&pageSize=20').then(r=>r.json()).then(d=>{if(d.success)setT(d.data)}).catch(()=>{})},[]);
  return (
    <DentalPageLayout header={{ title: '牙周治疗' }}>
      <DentalTreatmentTable data={treats} />
    </DentalPageLayout>
  );
};

// ===== DentalRestorativePage (Replaces generic) =====
export const DentalRestorativePage: React.FC = () => {
  const [treats,setT]=useState<DentalTreatment[]>([]);
  useEffect(()=>{fetch('/api/v1/dental/treatments?type=Restorative&pageSize=20').then(r=>r.json()).then(d=>{if(d.success)setT(d.data)}).catch(()=>{})},[]);
  return (
    <DentalPageLayout header={{ title: '修复 (CAD/CAM)' }}>
      <DentalTreatmentTable data={treats} showSurface />
    </DentalPageLayout>
  );
};

// ===== DentalSurgeryPage (Replaces generic) =====
export const DentalSurgeryPage: React.FC = () => {
  const [treats,setT]=useState<DentalTreatment[]>([]);
  useEffect(()=>{fetch('/api/v1/dental/treatments?type=Surgery&pageSize=20').then(r=>r.json()).then(d=>{if(d.success)setT(d.data)}).catch(()=>{})},[]);
  return (
    <DentalPageLayout header={{ title: '口腔外科' }}>
      <DentalTreatmentTable data={treats} />
    </DentalPageLayout>
  );
};

// ===== DentalPediatricPage (Replaces generic) =====
export const DentalPediatricPage: React.FC = () => {
  const [treats,setT]=useState<DentalTreatment[]>([]);
  useEffect(()=>{fetch('/api/v1/dental/treatments?type=Pediatric&pageSize=20').then(r=>r.json()).then(d=>{if(d.success)setT(d.data)}).catch(()=>{})},[]);
  return (
    <DentalPageLayout
      header={{ title: '儿童牙科' }}
      alert={{ message: '儿童牙科专用功能: 乳牙编号 (A-T), 窝沟封闭, 氟保护', type: 'info' }}
    >
      <DentalTreatmentTable data={treats} />
    </DentalPageLayout>
  );
};

// ===== DentalTelePage (Replaces placeholder) =====
export const DentalTelePage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const load = async () => { try { const r=await fetch('/api/v1/dental/tele/sessions'); const d=await r.json(); if(d.success) setSessions(d.data||[]); } catch {} };
  useEffect(() => { load(); }, []);
  const createSession = async () => {
    const r=await fetch('/api/v1/dental/tele/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"patientId":"P100000"}'});
    const d=await r.json(); if(d.success){message.success('会诊创建成功');load();}
  };
  return (
    <DentalPageLayout header={{ title: '远程口腔会诊', icon: <Video size={20} color="#1677ff"/> }}>
      <Row gutter={16}>
        <Col span={6}><Card size="small"><Button type="primary" block onClick={createSession} icon={<Plus size={14}/>}>新建会诊</Button></Card></Col>
        <Col span={6}><Card size="small"><Button block icon={<Upload size={14}/>} onClick={()=>message.info('选择口内照片')}>上传口内照片</Button></Card></Col>
        <Col span={6}><Card size="small"><Button block icon={<Globe size={14}/>} onClick={()=>message.info('AI 预筛')}>AI 预筛</Button></Card></Col>
        <Col span={6}><Select size="large" placeholder="选择专家" style={{width:'100%'}} options={[{value:'exp-1',label:'王专家 (种植)'},{value:'exp-2',label:'李专家 (正畸)'}]} /></Col>
      </Row>
      <Card title={`会诊记录 (${sessions.length})`} size="small" style={{marginTop:16}}>
        {sessions.length===0? <Empty description="暂无会诊记录" /> :
          <List dataSource={sessions} renderItem={(s:any)=><List.Item>{s.patientName||'-'} - {s.status||'active'}</List.Item>} />}
      </Card>
    </DentalPageLayout>
  );
};

// ===== DentalDashboardPage (Replaces placeholder) =====
export const DentalDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch('/api/v1/dental/stats').then(r=>r.json()).then(d=>{if(d.success) setStats(d.data)}).catch(()=>{}); }, []);
  return (
    <DentalPageLayout header={{ title: '口腔运营仪表盘' }}>
      {stats && <Row gutter={16} style={{marginBottom:16}}>
        <Col span={4}><Card><Statistic title="今日患者" value={stats.todayPatients} prefix={<Calendar size={14}/>} /></Card></Col>
        <Col span={4}><Card><Statistic title="本周" value={stats.thisWeek} /></Card></Col>
        <Col span={4}><Card><Statistic title="日均" value={stats.avgPerDay} /></Card></Col>
        <Col span={4}><Card><Statistic title="今日收入" prefix="¥" value={stats.revenueToday} /></Card></Col>
        <Col span={8}><Card><Statistic title="top 治疗" value={`补${stats.topTreatments.Restorative || 0} 根${stats.topTreatments.Endodontic || 0} 种${stats.topTreatments.Implant || 0}`} /></Card></Col>
      </Row>}
      <Alert message={stats ? '数据已更新' : '加载中'} type={stats ? 'success' : 'info'} showIcon />
    </DentalPageLayout>
  );
};

// ===== [v3.0.6.8-81] DentalWorkspacePage (新增 - 修复路由黑屏) =====
export const DentalWorkspacePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <DentalPageLayout header={{ title: '口腔工作台' }}>
      <Row gutter={16}>
        <Col span={6}><Card hoverable><Statistic title="今日检查" value={12} prefix={<Calendar size={14}/>} /></Card></Col>
        <Col span={6}><Card hoverable><Statistic title="待报告" value={3} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card hoverable><Statistic title="待治疗" value={5} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={6}><Card hoverable><Statistic title="已完成" value={8} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>
      {!loading && <Alert style={{ marginTop: 16 }} message="工作台已就绪" type="success" showIcon />}
    </DentalPageLayout>
  );
};

// ===== [v3.0.6.8-81] DentalTreatmentPage (新增 - 修复路由黑屏) =====
export const DentalTreatmentPage: React.FC = () => {
  const [items, setItems] = useState<DentalTreatment[]>([]);
  useEffect(() => {
    fetch('/api/v1/dental/treatments')
      .then(r => r.json())
      .then(d => { if (d.success) setItems(d.data); })
      .catch(() => setItems([]));
  }, []);
  return (
    <DentalPageLayout header={{ title: '口腔治疗中心' }}>
      <DentalTreatmentTable data={items} />
    </DentalPageLayout>
  );
};

// ===== [v3.0.6.8-81] DentalInventoryPage (新增 - 修复路由黑屏) =====
export const DentalInventoryPage: React.FC = () => {
  const [items] = useState<any[]>([
    { id: 'INV-001', name: '种植体 Straumann BLT', category: 'Implant', stock: 24, unit: 'pcs', minStock: 10 },
    { id: 'INV-002', name: '复合树脂 Z350', category: 'Restorative', stock: 8, unit: 'tube', minStock: 12 },
    { id: 'INV-003', name: '根管锉 ProTaper', category: 'Endo', stock: 50, unit: 'pcs', minStock: 20 },
    { id: 'INV-004', name: '正畸托槽 Damon Q', category: 'Ortho', stock: 12, unit: 'set', minStock: 5 },
    { id: 'INV-005', name: '局麻药 阿替卡因', category: 'Anesthesia', stock: 3, unit: 'box', minStock: 8 },
  ]);
  const lowCount = items.filter(i => i.stock < i.minStock).length;
  return (
    <DentalPageLayout header={{ title: '口腔库存管理', tags: [<Tag key="lo" color="orange">低库存 {lowCount}</Tag>] }}>
      <Table dataSource={items} rowKey="id" size="small" columns={[
        { title: 'ID', dataIndex: 'id', width: 100 },
        { title: '名称', dataIndex: 'name' },
        { title: '类别', dataIndex: 'category', render: (c: string) => <Tag>{c}</Tag> },
        { title: '库存', dataIndex: 'stock', render: (n: number) => <b>{n}</b> },
        { title: '单位', dataIndex: 'unit' },
        { title: '最低', dataIndex: 'minStock' },
        { title: '状态', render: (_, r: any) => r.stock < r.minStock ? <Tag color="red">低库存</Tag> : r.stock < r.minStock * 1.5 ? <Tag color="orange">预警</Tag> : <Tag color="green">充足</Tag> },
      ]} />
    </DentalPageLayout>
  );
};
