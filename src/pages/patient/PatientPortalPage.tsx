// [v3.0.6.8-66] 患者统一门户
import React, { useState } from 'react';
import { Card, Space, Tag, Button, Row, Col, Statistic, Tabs, List, Timeline, Descriptions, Badge, Table } from 'antd';
import { User, Calendar, FileText, Activity, Eye, Tooth, Brain, Clock, CheckCircle2 } from 'lucide-react';

export const PatientPortalPage: React.FC = () => {
  const [tab, setTab] = useState('overview');
  const patient = { id: 'P000001', name: '张伟', gender: '男', age: 45, phone: '13800000000', bloodType: 'A', allergies: '青霉素' };

  const timeline = [
    { date: '2026-06-28', event: '放射科 - CT 检查 (已完成)', type: 'radiology', color: 'green' },
    { date: '2026-06-25', event: '口腔科 - 根管治疗复诊 (已完成)', type: 'dental', color: 'blue' },
    { date: '2026-06-20', event: '口腔科 - 36 根管治疗 (已开始)', type: 'dental', color: 'orange' },
    { date: '2026-06-15', event: '放射科 - 全景片 (已完成)', type: 'radiology', color: 'green' },
    { date: '2026-06-10', event: '口腔科 - 初诊', type: 'dental', color: 'blue' },
  ];

  const nextAppts = [
    { date: '2026-07-05 09:00', dept: '口腔科', doctor: '王主任', type: '根管治疗' },
    { date: '2026-07-12 14:00', dept: '放射科', doctor: '李医生', type: 'CBCT 复查' },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }}>
        <User size={20} color="#1677ff" />
        <span style={{ fontSize: 18, fontWeight: 600 }}>患者门户</span>
        <Tag color="cyan">v3.0.6.8-66</Tag>
      </Space>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={4}><Statistic title="姓名" value={patient.name} prefix={<User size={14} />} /></Col>
          <Col span={3}><Statistic title="年龄" value={patient.age} suffix="岁" /></Col>
          <Col span={3}><Statistic title="性别" value={patient.gender} /></Col>
          <Col span={4}><Statistic title="血型" value={patient.bloodType} /></Col>
          <Col span={4}><Statistic title="过敏" value={patient.allergies} /></Col>
          <Col span={6}><Statistic title="电话" value={patient.phone} /></Col>
        </Row>
      </Card>
      <Tabs activeKey={tab} onChange={setTab} items={[
        { key:'overview', label:'概览', children:
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title={<Space><Calendar size={14}/>近期预约</Space>}>
                <Table dataSource={nextAppts} rowKey="date" pagination={false}
                  columns={[{title:'时间',dataIndex:'date'},{title:'科室',dataIndex:'dept'},{title:'医生',dataIndex:'doctor'},{title:'类型',dataIndex:'type'}]} />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title={<Space><Clock size={14}/>最近动态</Space>}>
                <Timeline items={timeline.slice(0,4).map(t=>({color:t.color,children:<div>{t.date}<br/>{t.event}</div>}))} />
              </Card>
            </Col>
          </Row>
        },
        { key:'timeline', label:'完整时间线', children:
          <Timeline mode="left" items={timeline.map(t=>({
            color:t.color,
            label: t.date,
            children: <div><Tag color={t.type==='radiology'?'blue':'green'}>{t.type==='radiology'?'放射科':'口腔科'}</Tag>{t.event}</div>,
          }))} />
        },
      ]} />
    </div>
  );
};
export default PatientPortalPage;
