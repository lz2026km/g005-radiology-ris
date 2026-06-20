import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Table,
  Tabs,
  Steps,
  Badge,
  Button,
  Timeline,
  Empty,
} from "antd";
import {
  Activity,
  Calendar,
  Clock,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  Phone,
  Bell,
} from "lucide-react";
import CriticalValueAlert from "@/components/eye/CriticalValueAlert";
import {
  MOCK_APPOINTMENTS,
  MOCK_SURGERY_APPOINTMENTS,
  MOCK_FOLLOW_UPS,
  MOCK_REFERRALS,
} from "@/data/eyeRisMock";
import { MOCK_CRITICAL_VALUES } from "@/data/eyeCriticalValuesMock";

const EyeRisPage: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const todayApts = MOCK_APPOINTMENTS.filter((a) => a.scheduledDate === today);
  const upcomingApts = MOCK_APPOINTMENTS.filter(
    (a) => a.scheduledDate > today,
  ).slice(0, 5);
  const statusFlow = [
    "scheduled",
    "arrived",
    "in_progress",
    "completed",
  ] as const;
  const statusLabels: Record<string, string> = {
    scheduled: "已预约",
    arrived: "已到检",
    in_progress: "检查中",
    completed: "已完成",
    cancelled: "已取消",
    no_show: "未到检",
  };
  const statusColors: Record<string, string> = {
    scheduled: "blue",
    arrived: "processing",
    in_progress: "gold",
    completed: "green",
    cancelled: "default",
    no_show: "error",
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#f8fafc",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Activity size={24} color="#10b981" />
        <span style={{ fontSize: 18, fontWeight: 600 }}>RIS 工作流程</span>
        <Tag color="green">今日预约 {todayApts.length}</Tag>
        <Tag color="orange">
          危急值{" "}
          {MOCK_CRITICAL_VALUES.filter((c) => c.status === "open").length}
        </Tag>
        <Tag color="blue">
          待处理转诊{" "}
          {MOCK_REFERRALS.filter((r) => r.status === "pending").length}
        </Tag>
      </div>

      <CriticalValueAlert
        items={MOCK_CRITICAL_VALUES.filter((c) => c.status !== "resolved")}
      />

      <Row gutter={12}>
        <Col span={24} style={{ marginBottom: 12 }}>
          <Card
            size="small"
            title={
              <>
                <Calendar size={14} /> 今日检查流程 ({today})
              </>
            }
          >
            <Steps current={-1} size="small" style={{ marginBottom: 12 }}>
              <Steps.Step title="登记" />
              <Steps.Step title="候诊" />
              <Steps.Step title="检查" />
              <Steps.Step title="影像上传" />
              <Steps.Step title="AI 分析" />
              <Steps.Step title="报告" />
              <Steps.Step title="审核" />
            </Steps>
            <Table
              dataSource={todayApts}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: "时间",
                  dataIndex: "scheduledTime",
                  key: "scheduledTime",
                  width: 60,
                },
                {
                  title: "患者",
                  dataIndex: "patientName",
                  key: "patientName",
                  width: 70,
                },
                {
                  title: "检查",
                  dataIndex: "modality",
                  key: "modality",
                  width: 80,
                  render: (v: string) => (
                    <Tag style={{ fontSize: 10 }}>{v}</Tag>
                  ),
                },
                {
                  title: "眼别",
                  dataIndex: "eyeSide",
                  key: "eyeSide",
                  width: 40,
                },
                { title: "房间", dataIndex: "room", key: "room", width: 70 },
                {
                  title: "医生",
                  dataIndex: "doctorName",
                  key: "doctorName",
                  width: 60,
                },
                {
                  title: "状态",
                  dataIndex: "status",
                  key: "status",
                  width: 70,
                  render: (v: string) => (
                    <Tag color={statusColors[v]}>{statusLabels[v]}</Tag>
                  ),
                },
                {
                  title: "操作",
                  key: "action",
                  width: 120,
                  render: () => (
                    <Button.Group size="small">
                      <Button>到检</Button>
                      <Button>叫号</Button>
                    </Button.Group>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={8}>
          <Card
            size="small"
            title={
              <>
                <Clock size={14} /> 近期预约
              </>
            }
          >
            <Table
              dataSource={upcomingApts}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: "日期",
                  dataIndex: "scheduledDate",
                  key: "scheduledDate",
                  width: 80,
                  render: (v: string) => v.slice(5),
                },
                {
                  title: "患者",
                  dataIndex: "patientName",
                  key: "patientName",
                  width: 60,
                },
                {
                  title: "检查",
                  dataIndex: "modality",
                  key: "modality",
                  width: 60,
                },
                {
                  title: "优先级",
                  dataIndex: "priority",
                  key: "priority",
                  width: 60,
                  render: (v: string) => (
                    <Tag
                      color={
                        v === "urgent"
                          ? "red"
                          : v === "emergent"
                            ? "error"
                            : "default"
                      }
                    >
                      {v}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            size="small"
            title={
              <>
                <Bell size={14} /> 随访提醒
              </>
            }
          >
            <Table
              dataSource={MOCK_FOLLOW_UPS.slice(0, 4)}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: "患者",
                  dataIndex: "patientName",
                  key: "patientName",
                  width: 60,
                },
                {
                  title: "病种",
                  dataIndex: "condition",
                  key: "condition",
                  width: 80,
                  ellipsis: true,
                },
                {
                  title: "间隔",
                  dataIndex: "recommendedInterval",
                  key: "recommendedInterval",
                  width: 50,
                  render: (v: number) => `${v}d`,
                },
                {
                  title: "超期",
                  dataIndex: "overdue",
                  key: "overdue",
                  width: 40,
                  render: (v: boolean) => v && <Badge dot color="#ef4444" />,
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            size="small"
            title={
              <>
                <ArrowRight size={14} /> 转诊管理
              </>
            }
          >
            <Table
              dataSource={MOCK_REFERRALS.slice(0, 3)}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: "患者",
                  dataIndex: "patientName",
                  key: "patientName",
                  width: 60,
                },
                {
                  title: "转诊到",
                  dataIndex: "referredTo",
                  key: "referredTo",
                  width: 60,
                  ellipsis: true,
                },
                {
                  title: "状态",
                  dataIndex: "status",
                  key: "status",
                  width: 60,
                  render: (v: string) => <Tag>{v}</Tag>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={12} style={{ marginTop: 12 }}>
        <Col span={12}>
          <Card
            size="small"
            title={
              <>
                <UserCheck size={14} /> 今日手术
              </>
            }
          >
            <Table
              dataSource={MOCK_SURGERY_APPOINTMENTS}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: "时间",
                  dataIndex: "scheduledDate",
                  key: "scheduledDate",
                  width: 80,
                },
                {
                  title: "患者",
                  dataIndex: "patientName",
                  key: "patientName",
                  width: 60,
                },
                {
                  title: "手术",
                  dataIndex: "procedure",
                  key: "procedure",
                  width: 160,
                  ellipsis: true,
                },
                {
                  title: "医生",
                  dataIndex: "surgeonName",
                  key: "surgeonName",
                  width: 60,
                },
                {
                  title: "状态",
                  dataIndex: "status",
                  key: "status",
                  width: 60,
                  render: (v: string) => (
                    <Tag>{v === "pre_checked" ? "已术前" : v}</Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="危急值闭环流程">
            <Timeline
              items={[
                {
                  color: "red",
                  children: "AI 检测活动性 CNV(置信度95%) → 自动标记紧急",
                },
                { color: "orange", children: "通知王建国医生(已确认)" },
                { color: "blue", children: "启动抗 VEGF 治疗流程" },
                { color: "gray", children: "待填写处理记录" },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default EyeRisPage;
