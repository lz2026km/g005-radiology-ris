// [v3.0.6.8-68] DICOM 影像跨科室共享
import React, { useState } from 'react';
import { Card, Space, Tag, Button, Table, Select, Input, Row, Col, Statistic, message, Modal, Form, List, Alert, Badge, Tooltip, Progress } from 'antd';
import { Share2, Send, Download, Clock, CheckCircle2, XCircle, Globe, User } from 'lucide-react';

export const DicomSharePage: React.FC = () => {
  const [tab, setTab] = useState('share');
  const [shareModal, setShareModal] = useState(false);
  const [shares] = useState([
    { id: 'SHR-001', studyId: 'CBCT-20260625-01', patient: '张伟', from: '放射科', to: '口腔科', status: 'sent', sentAt: '2026-06-25 14:30', size: '145MB' },
    { id: 'SHR-002', studyId: 'CT-20260624-03', patient: '李娜', from: '放射科', to: '口腔外科', status: 'received', sentAt: '2026-06-24 10:15', size: '210MB' },
    { id: 'SHR-003', studyId: 'OCT-20260623-07', patient: '王芳', from: '放射科', to: '眼科', status: 'pending', sentAt: '2026-06-23 16:00', size: '85MB' },
  ]);

  const statusColor: Record<string, string> = { sent: 'blue', received: 'green', pending: 'orange', failed: 'red' };

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }}>
        <Share2 size={20} color="#1677ff" />
        <span style={{ fontSize: 18, fontWeight: 600 }}>DICOM 跨科室影像共享</span>
        <Tag color="cyan">v3.0.6.8-68</Tag>
        <Tag color="purple">DICOM TLS 传输</Tag>
      </Space>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Card><Statistic title="今日共享" value="12" /></Card></Col>
        <Col span={4}><Card><Statistic title="待接收" value={shares.filter(s=>s.status==='pending').length} valueStyle={{color:'#faad14'}} /></Col>
        <Col span={4}><Card><Statistic title="已完成" value={shares.filter(s=>s.status==='received').length} valueStyle={{color:'#52c41a'}} /></Col>
        <Col span={4}><Card><Statistic title="总传输量" value="1.2" suffix="GB" /></Col>
      </Row>
      <Card extra={<Button type="primary" icon={<Send size={12}/>} onClick={()=>setShareModal(true)}>分享影像</Button>} size="small" title="传输记录">
        <Table dataSource={shares} rowKey="id" pagination={false}
          columns={[
            {title:'ID',dataIndex:'id'},{title:'Study',dataIndex:'studyId'},{title:'患者',dataIndex:'patient'},
            {title:'来源',dataIndex:'from',render:(f)=><Tag color="blue">{f}</Tag>},
            {title:'目标',dataIndex:'to',render:(t)=><Tag color="purple">{t}</Tag>},
            {title:'大小',dataIndex:'size'},
            {title:'状态',dataIndex:'status',render:(s)=><Tag color={statusColor[s]}>{s}</Tag>},
            {title:'时间',dataIndex:'sentAt'},
            {title:'操作',render:(_,r)=><Space>{r.status==='pending' && <Button size="small" type="primary">接收</Button>}<Button size="small" icon={<Download size={10}/>}>下载</Button></Space>},
          ]} />
      </Card>
      <Modal title="分享 DICOM 影像" open={shareModal} onCancel={()=>setShareModal(false)} onOk={()=>{message.success('影像已发送');setShareModal(false)}} width={500}>
        <Form layout="vertical" size="small">
          <Form.Item label="选择 Study"><Select placeholder="选择要分享的影像" options={[{value:'CBCT-001',label:'张伟-36 CBCT'},{value:'CT-002',label:'李娜-头颅 CT'},{value:'OCT-003',label:'王芳-OCT'}]} /></Form.Item>
          <Form.Item label="目标科室"><Select mode="multiple" placeholder="选择接收科室" options={['口腔科','口腔外科','正畸科','眼科','耳鼻喉科'].map(d=>({value:d,label:d}))} /></Form.Item>
          <Form.Item label="传输协议"><Select options={[{value:'dicom-tls',label:'DICOM TLS (加密)'},{value:'wado',label:'WADO (HTTP)'}]} /></Form.Item>
          <Form.Item label="备注"><Input.TextArea rows={2} placeholder="备注信息" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default DicomSharePage;
