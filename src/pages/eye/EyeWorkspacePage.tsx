import React from 'react';
import { Card, Row, Col, Statistic, Tag } from 'antd';
import { Eye, Activity, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/common';

const EyeWorkspacePage: React.FC = () => {
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <PageContainer background="slate" maxWidth="full" testId="eye-workspace-page">
      <PageHeader
        title="眼科工作台"
        subtitle={today}
        icon={<Eye className="v4-icon" style={{ width: 28, height: 28, color: '#1677ff' }} />}
        variant="inline"
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="今日预约" value={18} prefix={<Calendar className="v4-icon" style={{ color: '#1677ff' }} />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="今日检查" value={42} prefix={<Activity className="v4-icon" style={{ color: '#10b981' }} />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="待写报告" value={7} prefix={<FileText className="v4-icon" style={{ color: '#f59e0b' }} />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="危急值" value={2} prefix={<AlertTriangle className="v4-icon" style={{ color: '#ef4444' }} />} /></Card></Col>
      </Row>

      <Row gutter={12}>
        <Col span={12}>
          <Card size="small" title="今日手术安排" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, lineHeight: 2 }}>
              {[
                { time: '08:30', patient: '陈丽', procedure: '右眼 Phaco+IOL', or: 'OR-3', status: '待术前' },
                { time: '10:00', patient: '王芳', procedure: '左眼 25G PPV+PRP', or: 'OR-3', status: '待术前' },
                { time: '14:00', patient: '赵刚', procedure: '右眼抗VEGF注射', or: '治疗室', status: '已开单' },
              ].map((s) => (
                <div key={s.time} style={{ display: 'flex', gap: 12, padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 600, minWidth: 50 }}>{s.time}</span>
                  <span style={{ minWidth: 60 }}>{s.patient}</span>
                  <span style={{ flex: 1 }}>{s.procedure}</span>
                  <span style={{ color: '#64748b', minWidth: 50 }}>{s.or}</span>
                  <Tag color="blue" style={{ fontSize: 12 }}>{s.status}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="待办事项">
            <div style={{ fontSize: 12, lineHeight: 2 }}>
              <div>📝 赵刚 - 右眼 OCT 报告未审核 <Tag color="warning" style={{ fontSize: 12 }}>紧急</Tag></div>
              <div>📝 王芳 - 左眼视野报告未完成</div>
              <div>📝 陈丽 - 白内障术前检查未审核</div>
              <div>🔬 李强 - IOL 计算结果未确认</div>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default EyeWorkspacePage;
