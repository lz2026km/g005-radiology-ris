/**
 * G005 放射RIS系统 v3.0.6.0 - FHIR Server 页面
 * 20 升级点:CapabilityStatement / 资源浏览器 / 文档参考 / SMART on FHIR
 */
import React from 'react';
import { Card, Space, Tag, Button, Row, Col, Alert } from 'antd';
import { FileJson, Server, BookOpen, ExternalLink, Braces, Key, Globe, Cpu } from 'lucide-react';
import { FhirResourceExplorer } from '@components/integration/FhirResourceExplorer';
import { useNavigate } from 'react-router-dom';

export const FhirServerPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-3">
      <Card size="small" className="shadow-sm">
        <div className="flex items-center justify-between">
          <Space>
            <FileJson className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-base font-semibold">FHIR Server</div>
              <div className="text-xs text-slate-500">HL7 FHIR R4/R5 Resource Server · 浏览器内 Mock</div>
            </div>
          </Space>
          <Space>
            <Tag color="orange">R4</Tag>
            <Tag color="blue">RESTful</Tag>
            <Tag color="purple">SMART</Tag>
            <Button size="small" icon={<BookOpen className="w-3 h-3" />} onClick={() => navigate('/integration/ihe')}>IHE Profiles</Button>
          </Space>
        </div>
      </Card>

      <Row gutter={8}>
        <Col span={17}>
          <FhirResourceExplorer />
        </Col>
        <Col span={7}>
          <Card size="small" className="shadow-sm mb-3" title={<Space><Server className="w-4 h-4" /><span>FHIR 服务</span></Space>}>
            <div className="text-xs space-y-2 text-slate-600">
              <div className="flex flex-wrap gap-1">
                <Tag color="orange">R4</Tag><Tag color="cyan">R4B</Tag><Tag color="blue">R5</Tag>
                <Tag color="green">JSON</Tag><Tag color="purple">XML</Tag>
              </div>
              <h4 className="text-sm font-semibold mt-1 flex items-center gap-1"><Braces className="w-3 h-3" /> 资源类型</h4>
              <div className="text-[11px]">
                Patient · Practitioner · Organization · Encounter · DiagnosticReport ·
                Observation · ImagingStudy · ServiceRequest · Procedure · Condition ·
                Media · DocumentReference · Bundle · Task · CarePlan · CareTeam · Goal
              </div>
              <h4 className="text-sm font-semibold mt-2 flex items-center gap-1"><Cpu className="w-3 h-3" /> 交互</h4>
              <ul className="list-disc list-inside space-y-0.5">
                <li>read / vread</li>
                <li>search-type (多参数)</li>
                <li>create / update / patch / delete</li>
                <li>history / capability</li>
                <li>transaction / batch</li>
              </ul>
            </div>
          </Card>

          <Card size="small" className="shadow-sm" title={<Space><Key className="w-4 h-4" /><span>SMART on FHIR</span></Space>}>
            <div className="text-xs space-y-1 text-slate-600">
              <div>授权端点: <code className="bg-slate-100 px-1 rounded text-[10px]">/oauth2/authorize</code></div>
              <div>Token 端点: <code className="bg-slate-100 px-1 rounded text-[10px]">/oauth2/token</code></div>
              <div>客户端 ID: <code className="bg-slate-100 px-1 rounded text-[10px]">g005-ris-client</code></div>
              <div>Scopes: <Tag color="cyan" className="mt-1">patient/*.read</Tag><Tag color="blue" className="mt-1">launch/patient</Tag><Tag color="purple" className="mt-1">offline_access</Tag></div>
              <Alert className="mt-2" type="info" message="OAuth 2.0 + OpenID Connect" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FhirServerPage;
