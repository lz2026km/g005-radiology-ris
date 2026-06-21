import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Button, Space, Input, Table, Badge } from "antd";
import { Image, Search, Eye } from "lucide-react";
import EyeLateralityBadge from "@/components/eye/EyeLateralityBadge";
import { MOCK_EYE_STUDIES } from "@/data/eyePacsMock";

const MODALITY_LABELS: Record<string, string> = {
  fundus_photo: "眼底彩照",
  oct: "OCT",
  ffa: "FFA",
  icga: "ICGA",
  visual_field: "视野",
  topography: "角膜地形图",
  pentacam: "Pentacam",
  iol_master: "IOL Master",
  ubm: "UBM",
  slit_lamp: "裂隙灯",
};

const PacsStudyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const studies = search
    ? MOCK_EYE_STUDIES.filter(
        (s) => s.patientName.includes(search) || s.patientId.includes(search),
      )
    : MOCK_EYE_STUDIES;

  const columns = [
    { title: "患者", dataIndex: "patientName", key: "patientName", width: 90 },
    { title: "ID", dataIndex: "patientId", key: "patientId", width: 80 },
    {
      title: "眼别",
      dataIndex: "eyeSide",
      key: "eyeSide",
      width: 80,
      render: (v: string) => (
        <EyeLateralityBadge eyeSide={v as any} size="small" />
      ),
    },
    {
      title: "检查类型",
      dataIndex: "modality",
      key: "modality",
      width: 100,
      render: (v: string) => (
        <Tag color="cyan" style={{ fontSize: 10 }}>
          {MODALITY_LABELS[v] || v}
        </Tag>
      ),
    },
    {
      title: "检查日期",
      dataIndex: "studyDate",
      key: "studyDate",
      width: 140,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: "设备",
      dataIndex: "device",
      key: "device",
      width: 160,
      ellipsis: true,
    },
    {
      title: "影像数",
      dataIndex: "images",
      key: "images",
      width: 70,
      render: (v: any[]) => <Tag>{v.length}</Tag>,
    },
    {
      title: "危急",
      dataIndex: "criticalFlag",
      key: "criticalFlag",
      width: 50,
      render: (v: boolean) => v && <Badge dot color="#ef4444" />,
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            type="primary"
            icon={<Eye className="v4-icon" />}
            onClick={() => navigate(`/eye/pacs/viewer?studyId=${record.id}`)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ];

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
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <Image
          className="v4-icon"
          style={{ width: 24, height: 24, color: "#1677ff" }}
        />
        <span style={{ fontSize: 18, fontWeight: 600 }}>
          眼科影像中心 (PACS)
        </span>
        <Tag color="blue">{studies.length} 个检查</Tag>
        <div style={{ flex: 1 }} />
        <Input
          prefix={<Search className="v4-icon" />}
          placeholder="搜索患者/ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
      </div>

      <Table
        dataSource={studies}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </div>
  );
};

export default PacsStudyListPage;
