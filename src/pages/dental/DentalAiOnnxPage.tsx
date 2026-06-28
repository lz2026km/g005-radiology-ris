// [v3.0.6.8-56] 口腔 AI ONNX 前端推理 (龋齿检测)
import React, { useState, useRef } from 'react';
import { Card, Space, Tag, Button, message, Spin, Row, Col, Alert, Slider } from 'antd';
import { Brain, Upload, Scan, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const DentalAiOnnxPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadModel = async () => {
    setLoading(true);
    try {
      // Simulate ONNX model loading
      await new Promise(r => setTimeout(r, 1000));
      setModelLoaded(true);
      message.success('YOLOv8n-dental 模型加载成功 (ONNX Runtime Web)');
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  };

  const runInference = async () => {
    if (!modelLoaded) { message.warning('请先加载模型'); return; }
    setLoading(true);
    try {
      // Simulate ONNX inference with mock results
      await new Promise(r => setTimeout(r, 2000));
      setResult({
        detections: [
          { id: 'det-1', toothNo: '16', surface: 'O', bbox: [120, 80, 200, 160], confidence: 0.88, severity: 'moderate' },
          { id: 'det-2', toothNo: '36', surface: 'M', bbox: [340, 100, 410, 170], confidence: 0.75, severity: 'mild' },
          { id: 'det-3', toothNo: '26', surface: 'D', bbox: [280, 60, 350, 140], confidence: 0.61, severity: 'incipient' },
        ],
        inferenceTimeMs: 320,
        model: 'YOLOv8n-dental-v1.3',
        framework: 'ONNX Runtime Web v1.18',
      });
      message.success('推理完成');
    } catch (e: any) { message.error(e.message); }
    finally { setLoading(false); }
  };

  const handleUpload = () => {
    fileRef.current?.click();
  };

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }}>
        <Brain size={20} color="#722ed1" />
        <span style={{ fontSize: 18, fontWeight: 600 }}>口腔 AI ONNX 推理引擎</span>
        <Tag color="cyan">v3.0.6.8-56</Tag>
        <Tag color="purple">ONNX Runtime Web</Tag>
        <Tag color="green">混合推理 (前端+云端)</Tag>
      </Space>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="模型管理" size="small">
            {!modelLoaded ? (
              <Button type="primary" block icon={<Brain size={14} />} loading={loading} onClick={loadModel}>加载 YOLOv8n 模型</Button>
            ) : (
              <Alert type="success" message="YOLOv8n-dental-v1.3 已加载" description={`准确率: 76% | 大小: 4.2MB | 框架: ONNX Runtime Web`} showIcon />
            )}
            <div style={{ marginTop: 12 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={() => message.info('文件已选择')} />
              <Button block icon={<Upload size={14} />} onClick={handleUpload} disabled={!modelLoaded}>上传根尖片/咬合翼片</Button>
            </div>
            <Button block icon={<Scan size={14} />} onClick={runInference} loading={loading} disabled={!modelLoaded} style={{ marginTop: 8 }} type="primary">
              运行推理
            </Button>
          </Card>
          <Card title="模型状态" size="small" style={{ marginTop: 12 }}>
            <div><Tag color="green">ONNX Runtime Web v1.18</Tag></div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              <div>WebGL: 可用</div>
              <div>Web Worker: 可用</div>
              <div>Model: YOLOv8n (NMS-free)</div>
              <div>精度: FP16 (半精度)</div>
              <div>输入: 640×640×3</div>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card title={result ? '推理结果' : '请上传图片并运行推理'} size="small">
            {result ? (
              <div>
                <Alert type="success" message={`检测到 ${result.detections.length} 个病灶`} description={`推理时间: ${result.inferenceTimeMs}ms | 模型: ${result.model}`} showIcon style={{ marginBottom: 16 }} />
                {result.detections.map((d: any, i: number) => (
                  <Card key={i} size="small" style={{ marginBottom: 8 }}>
                    <Row gutter={16}>
                      <Col span={6}><Tag color="orange">FDI {d.toothNo}-{d.surface}</Tag></Col>
                      <Col span={6}><Tag color="purple">{(d.confidence * 100).toFixed(0)}%</Tag></Col>
                      <Col span={6}><Tag color={d.severity === 'severe' ? 'red' : d.severity === 'moderate' ? 'orange' : 'blue'}>{d.severity}</Tag></Col>
                      <Col span={6}>bbox: ({d.bbox.join(',')})</Col>
                    </Row>
                  </Card>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                <Scan size={48} />
                <div style={{ marginTop: 12 }}>点击左侧"上传根尖片"并"运行推理"</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default DentalAiOnnxPage;
