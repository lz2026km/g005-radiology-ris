/**
 * G005 放射RIS系统 v3.0.6.1 - 扫描协议详情
 */
import React from 'react'
import { Card, Descriptions, Tag, Space } from 'antd'

export interface ScanProtocolConfig {
  id: string
  name: string
  modality: string
  bodyPart: string
  kv: number
  mas: number
  pitch: number
  dose: string
  contrast: boolean
}

export interface ScanProtocolProps {
  protocol: ScanProtocolConfig
}

export const ScanProtocol: React.FC<ScanProtocolProps> = ({ protocol }) => {
  return (
    <Card size="small" title={`协议详情:${protocol.name}`} data-testid={`scan-protocol-${protocol.id}`}>
      <Descriptions size="small" column={2} bordered>
        <Descriptions.Item label="ID">{protocol.id}</Descriptions.Item>
        <Descriptions.Item label="设备">{protocol.modality}</Descriptions.Item>
        <Descriptions.Item label="部位">{protocol.bodyPart}</Descriptions.Item>
        <Descriptions.Item label="增强">{protocol.contrast ? <Tag color="purple">是</Tag> : <Tag>否</Tag>}</Descriptions.Item>
        <Descriptions.Item label="管电压">{protocol.kv} kV</Descriptions.Item>
        <Descriptions.Item label="管电流">{protocol.mas} mAs</Descriptions.Item>
        <Descriptions.Item label="螺距">{protocol.pitch}</Descriptions.Item>
        <Descriptions.Item label="剂量等级">{protocol.dose}</Descriptions.Item>
      </Descriptions>
      <Space style={{ marginTop: 8 }}>
        <Tag color="blue">Syngo 兼容</Tag>
        <Tag color="cyan">DICOM RD SR</Tag>
      </Space>
    </Card>
  )
}

export default ScanProtocol