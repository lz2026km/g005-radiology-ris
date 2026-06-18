/**
 * G005 放射RIS系统 v3.0.6.1 - 射血分数分析 (LVEF)
 */
import React from 'react'
import { Card, Row, Col, Progress, Tag, Descriptions } from 'antd'
import type { CardiacAnalysisData } from './CardiacAnalysis'

export interface EjectionFractionProps {
  data: CardiacAnalysisData
}

export const EjectionFraction: React.FC<EjectionFractionProps> = ({ data }) => {
  const normal = data.lv_ef >= 55
  const mildlyReduced = data.lv_ef >= 40 && data.lv_ef < 55
  const tagColor = normal ? 'green' : mildlyReduced ? 'orange' : 'red'
  const tagLabel = normal ? '正常' : mildlyReduced ? '轻度减低' : '减低'

  return (
    <div data-testid="ejection-fraction">
      <Row gutter={12}>
        <Col span={12}>
          <Card size="small" title="LVEF">
            <Progress
              type="dashboard"
              percent={data.lv_ef}
              strokeColor={tagColor === 'green' ? '#16a34a' : tagColor === 'orange' ? '#f59e0b' : '#dc2626'}
              format={(v) => `${v}%`}
            />
            <Tag color={tagColor} style={{ marginTop: 8 }}>{tagLabel}</Tag>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="心室容积">
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="EDV (舒张末)">{data.lv_edv_ml} mL</Descriptions.Item>
              <Descriptions.Item label="ESV (收缩末)">{data.lv_esv_ml} mL</Descriptions.Item>
              <Descriptions.Item label="SV (每搏量)">{data.sv_ml} mL</Descriptions.Item>
              <Descriptions.Item label="CO (心输出量)">{data.co_lpm} L/min</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default EjectionFraction