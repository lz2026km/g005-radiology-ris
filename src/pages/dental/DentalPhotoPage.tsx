// [v3.0.6.8-98] Phase 5: 口内照片管理
import React, { useState, useEffect } from 'react';
import { Card, Space, Tag, Button, Select, Row, Col, Statistic, message, Tabs, InputNumber, Table, Empty, Modal, Alert, Badge, Tooltip, Divider, List, Slider } from 'antd';
import { Activity, Camera, Image as ImageIcon, Share2, Upload } from 'lucide-react';

export const DentalPhotoPage: React.FC = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [selected, setSelected] = useState('P100001');

  useEffect(() => {
    fetch('/api/v1/dental/patient/' + selected + '/photos').then(r=>r.json()).then(d=>{if(d.success)setPhotos(d.data||[]);}).catch(()=>{});
  }, [selected]);

  const intraoral = photos.filter(p => p.category === 'intraoral').length;
  const extraoral = photos.filter(p => p.category === 'extraoral').length;
  const catLabel: Record<string,string> = { intraoral:'Intraoral', extraoral:'Extraoral', radiograph:'X-Ray', model:'Model', other:'Other' };

  return (
    <div style={{padding:24,background:'#f5f5f5',minHeight:'100vh'}}>
      <Space style={{marginBottom:16}}>
        <Camera size={20} color="#1677ff" />
        <span style={{fontSize:18,fontWeight:600}}>Patient Photos & Communication</span>
        <Tag color="cyan">v3.0.6.8-98</Tag>
        <Tag color="purple">3Shape Unite</Tag>
        <Select value={selected} onChange={v=>setSelected(v)} style={{width:180}} options={[{value:'P100001',label:'Zhang Wei'},{value:'P100002',label:'Li Na'},{value:'P100003',label:'Wang Fang'}]} />
      </Space>
      <Row gutter={16} style={{marginBottom:16}}>
        <Col span={4}><Card size="small"><Statistic title="Total" value={photos.length} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="Intraoral" value={intraoral} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="Extraoral" value={extraoral} /></Card></Col>
      </Row>

      <Tabs items={[
        {key:'photos', label:'Photos', children:
          <Row gutter={[8,8]}>
            {photos.map(p => (
              <Col span={6} key={p.id}>
                <Card size="small" hoverable onClick={()=>setPreview(p)} style={{cursor:'pointer'}}
                  cover={<div style={{height:120,background:'#1a1a2e',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'4px 4px 0 0'}}><Camera size={32} /></div>}>
                  <Tag color={p.category==='intraoral'?'blue':'purple'}>{catLabel[p.category]||p.category}</Tag>
                  <div style={{fontSize:12,marginTop:2}}>{p.label}</div>
                  <div style={{fontSize:10,color:'#999'}}>{(p.takenAt||'').slice(0,10)}</div>
                </Card>
              </Col>
            ))}
          </Row>
        },
        {key:'compare', label:'Before/After', children:
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="Before">
                <div style={{height:200,background:'#1a1a2e',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#666',flexDirection:'column'}}>
                  <ImageIcon size={36} /><div>2026-01-15</div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="After (simulated)">
                <div style={{height:200,background:'#1a1a2e',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#666',flexDirection:'column'}}>
                  <ImageIcon size={36} /><div>2026-06-28</div>
                </div>
              </Card>
            </Col>
            <Col span={24} style={{marginTop:8}}><Slider /><Button icon={<Share2 size={14}/>} type="primary" block>Share with Patient</Button></Col>
          </Row>
        },
        {key:'share', label:'Cloud Share', children:
          <Card size="small" title="Share Case">
            <Alert message="Share link generated" description="https://share.dentalcloud.com/case/CASE-001" type="success" showIcon />
            <Space style={{marginTop:8}}><Tag>7 day expiry</Tag><Tag>Password: 8888</Tag></Space>
          </Card>
        },
      ]} />

      <Modal title={preview?.label} open={!!preview} onCancel={()=>setPreview(null)} footer={null} width={480}>
        <div style={{height:320,background:'#0a0a1a',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#666'}}><Camera size={48} /></div>
      </Modal>
    </div>
  );
};
export default DentalPhotoPage;
