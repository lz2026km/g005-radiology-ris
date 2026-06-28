// [v3.0.6.8-75] IHE集成引擎 (XDS.b/PIX/PDQ 跨机构互操作)
import React, { useState } from 'react';
import { Card, Space, Tag, Table, Button, Row, Col, Statistic, Badge, Modal, Form, Select, Input, message, Alert, Progress, Timeline, Collapse } from 'antd';
import { Server, Globe, Share2, Activity, CheckCircle2, XCircle, RefreshCw, ArrowLeftRight, Users, FileSearch } from 'lucide-react';

export const IheIntegrationPage: React.FC = () => {
  const [txTab, setTxTab] = useState('xds');
  const [transactions] = useState([
    { id:'IHE-001', profile:'XDS.b', action:'Register Document Set', status:'success', peer:'Hospital B', duration:'340ms', timestamp:'2026-06-28 10:15:23' },
    { id:'IHE-002', profile:'PIX', action:'Patient Identity Feed', status:'success', peer:'Clinic C', duration:'120ms', timestamp:'2026-06-28 10:12:00' },
    { id:'IHE-003', profile:'PDQ', action:'Patient Query', status:'success', peer:'Hospital B', duration:'85ms', timestamp:'2026-06-28 09:55:17' },
    { id:'IHE-004', profile:'XDS.b', action:'Retrieve Document Set', status:'error', peer:'Hospital B', duration:'5100ms', timestamp:'2026-06-28 09:30:00', error:'Timeout waiting for response' },
    { id:'IHE-005', profile:'XDS.b', action:'Provide and Register', status:'success', peer:'Hospital A', duration:'290ms', timestamp:'2026-06-28 09:15:44' },
  ]);
  const [endpoints] = useState([
    { id:'EP-01', name:'Hospital B - XDS Registry', type:'XDS Registry', url:'https://hosp-b/ihe/xds/registry', status:'online', lastCheck:'2026-06-28 10:00:00' },
    { id:'EP-02', name:'Hospital B - XDS Repository', type:'XDS Repository', url:'https://hosp-b/ihe/xds/repository', status:'online', lastCheck:'2026-06-28 10:00:00' },
    { id:'EP-03', name:'Clinic C - PIX Manager', type:'PIX Manager', url:'https://clinic-c/ihe/pix', status:'online', lastCheck:'2026-06-28 09:55:00' },
    { id:'EP-04', name:'Hospital A - PDQ Supplier', type:'PDQ Supplier', url:'https://hosp-a/ihe/pdq', status:'degraded', lastCheck:'2026-06-28 09:50:00' },
  ]);
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }}>
        <Globe size={20} color="#1677ff" />
        <span style={{ fontSize: 18, fontWeight: 600 }}>IHE Integration Engine</span>
        <Tag color="cyan">v3.0.6.8-75</Tag>
        <Tag color="blue">XDS.b</Tag>
        <Tag color="green">PIX</Tag>
        <Tag color="orange">PDQ</Tag>
      </Space>
      <Alert message="IHE profiles enable cross-enterprise document sharing and patient identity management" type="info" showIcon style={{marginBottom:16}} />
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Card size="small"><Statistic title="Transactions" value={transactions.length} prefix={<Activity size={14}/>} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="Success" value={transactions.filter(t=>t.status==='success').length} valueStyle={{color:'#52c41a'}} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="Errors" value={transactions.filter(t=>t.status==='error').length} valueStyle={{color:'#ff4d4f'}} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="Endpoints" value={endpoints.length} prefix={<Server size={14}/>} /></Card></Col>
      </Row>
      <Card size="small" title="Integration Endpoints" style={{marginBottom:16}} extra={<Button icon={<RefreshCw size={12}/>}>Check All</Button>}>
        <Table dataSource={endpoints} rowKey="id" pagination={false}
          columns={[
            {title:'Name',dataIndex:'name',width:240},{title:'Type',dataIndex:'type',render:(t:string)=><Tag color={t==='XDS Registry'?'blue':t==='XDS Repository'?'purple':t==='PIX Manager'?'green':'orange'}>{t}</Tag>},
            {title:'URL',dataIndex:'url',width:280,render:(u:string)=><span style={{fontSize:12,fontFamily:'monospace'}}>{u}</span>},
            {title:'Status',dataIndex:'status',render:(s:string)=><Badge status={s==='online'?'success':s==='degraded'?'warning':'error'} text={s} />},
            {title:'Last Check',dataIndex:'lastCheck'},
          ]} />
      </Card>
      <Card size="small" title={<Space><ArrowLeftRight size={14}/>Transaction Log</Space>}>
        <Table dataSource={transactions} rowKey="id" pagination={false}
          columns={[
            {title:'ID',dataIndex:'id'},{title:'Profile',dataIndex:'profile',render:(p:string)=><Tag color={p==='XDS.b'?'blue':p==='PIX'?'green':'orange'}>{p}</Tag>},
            {title:'Action',dataIndex:'action',width:200},{title:'Peer',dataIndex:'peer'},
            {title:'Duration',dataIndex:'duration',render:(d:string)=><><span style={{fontFamily:'monospace',fontSize:12}}>{d}</span></>},
            {title:'Time',dataIndex:'timestamp'},
            {title:'Status',dataIndex:'status',render:(s:string)=><Badge status={s==='success'?'success':'error'} text={s} />},
            {title:'Action',render:(_,r:any)=><Button size="small" disabled={r.status!=='error'}>Retry</Button>},
          ]} />
      </Card>
    </div>
  );
};
export default IheIntegrationPage;
