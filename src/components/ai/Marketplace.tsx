/**
 * G005 放射RIS系统 v3.0.6.5 - AI 算法市场 UI
 * A5-AI-ORCH / 30 点
 */

import React, { useEffect, useState } from 'react';
import { Card, Input, Select, Row, Col, Tag, Button, Space, message, Avatar, Divider, Empty } from 'antd';
import { Search, Star, Download, Zap, Award, TrendingUp, ShieldCheck } from 'lucide-react';
import { marketplaceService } from '../../services/ai/marketplace/MarketplaceService';
import type { AIMarketplaceListing, AIMarketplaceFilter, AIAlgorithmType } from '../../types/ai/orchestrator';

const { Search: AntSearch } = Input;

const TYPE_LABELS: Record<AIAlgorithmType, string> = {
  detection: '病灶检测',
  segmentation: '分割',
  classification: '分类/分级',
  quantification: '量化分析',
  triage: '急诊分诊',
  reporting: '报告生成',
  quality: '质控',
  temporal: '时序分析',
};

const TYPE_COLORS: Record<AIAlgorithmType, string> = {
  detection: '#3b82f6',
  segmentation: '#06b6d4',
  classification: '#8b5cf6',
  quantification: '#f59e0b',
  triage: '#ef4444',
  reporting: '#10b981',
  quality: '#ec4899',
  temporal: '#f97316',
};

export interface MarketplaceProps {
  onInstall?: (id: string) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onInstall }) => {
  const [listings, setListings] = useState<AIMarketplaceListing[]>([]);
  const [featured, setFeatured] = useState<AIMarketplaceListing[]>([]);
  const [trending, setTrending] = useState<AIMarketplaceListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AIMarketplaceFilter>({});

  useEffect(() => {
    void refresh();
  }, [filters]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [list, f, t] = await Promise.all([
        marketplaceService.listAlgorithms(filters),
        marketplaceService.getFeatured(),
        marketplaceService.getTrending(),
      ]);
      setListings(list);
      setFeatured(f);
      setTrending(t);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (id: string) => {
    try {
      await marketplaceService.install(id);
      message.success('安装成功');
      onInstall?.(id);
      await refresh();
    } catch (e) {
      message.error('安装失败: ' + (e as Error).message);
    }
  };

  const renderCard = (l: AIMarketplaceListing) => {
    const a = l.algorithm;
    return (
      <Card
        key={a.id}
        hoverable
        size="small"
        style={{ background: '#1e293b', borderColor: a.installed ? '#10b981' : '#334155' }}
        bodyStyle={{ padding: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
          <Avatar
            shape="square"
            size={40}
            style={{ background: TYPE_COLORS[a.type], color: 'white', fontSize: 16 }}
          >
            {a.name.slice(0, 1)}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{a.name}</span>
              {l.featured && <Award size={12} color="#fbbf24" />}
              {l.trending && <TrendingUp size={12} color="#10b981" />}
              {a.installed && <Tag color="green" style={{ marginLeft: 4 }}>已安装</Tag>}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.vendor} · v{a.version}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Tag color="blue" style={{ fontSize: 10 }}>{TYPE_LABELS[a.type]}</Tag>
              {a.modality.slice(0, 3).map((m) => <Tag key={m} style={{ fontSize: 10 }}>{m}</Tag>)}
              {a.regulatory.nmpa && <Tag color="green" style={{ fontSize: 10 }}><ShieldCheck size={10} /> NMPA</Tag>}
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 6, height: 32, overflow: 'hidden' }}>{a.description}</div>
            <Divider style={{ margin: '8px 0', borderColor: '#334155' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                <Star size={11} fill="#fbbf24" color="#fbbf24" /> {a.ratingAvg} ({a.ratingCount}) · Acc {(a.accuracy * 100).toFixed(0)}% · {a.avgLatencyMs}ms
              </div>
              {a.installed ? (
                <Tag color="green" style={{ fontSize: 10 }}>已安装</Tag>
              ) : (
                <Button size="small" type="primary" icon={<Download size={11} />} onClick={() => handleInstall(a.id)}>
                  {a.pricing.model === 'free' ? '免费' : `$${a.pricing.costUsd}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div data-testid="ai-marketplace" style={{ padding: 16, background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Zap size={24} color="#f59e0b" />
        <h2 style={{ margin: 0, color: '#f1f5f9' }}>AI 算法市场</h2>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{listings.length} 个算法</span>
      </div>

      <div style={{ background: '#1e293b', padding: 12, borderRadius: 6, marginBottom: 16 }}>
        <Space wrap>
          <AntSearch placeholder="搜索算法/厂商/标签" value={filters.search ?? ''} onChange={(e) => setFilters({ ...filters, search: e.target.value })} style={{ width: 220 }} allowClear />
          <Select
            placeholder="类型"
            value={filters.type}
            onChange={(v) => setFilters({ ...filters, type: v })}
            style={{ width: 140 }}
            allowClear
            options={(Object.keys(TYPE_LABELS) as AIAlgorithmType[]).map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
          />
          <Select
            placeholder="模态"
            value={filters.modality}
            onChange={(v) => setFilters({ ...filters, modality: v })}
            style={{ width: 100 }}
            allowClear
            options={['CT', 'MR', 'CR', 'DX', 'MG', 'US', 'DBT'].map((v) => ({ value: v, label: v }))}
          />
          <Select
            placeholder="评分"
            value={filters.minRating}
            onChange={(v) => setFilters({ ...filters, minRating: v })}
            style={{ width: 100 }}
            allowClear
            options={[3, 3.5, 4, 4.5].map((v) => ({ value: v, label: `≥ ${v}★` }))}
          />
          <Select
            placeholder="价格"
            value={filters.free}
            onChange={(v) => setFilters({ ...filters, free: v ?? undefined })}
            style={{ width: 100 }}
            allowClear
            options={[
              { value: true, label: '免费' },
              { value: false, label: '付费' },
            ]}
          />
        </Space>
      </div>

      {featured.length > 0 && (
        <>
          <h3 style={{ color: '#fbbf24', fontSize: 14, marginBottom: 8 }}>★ 编辑推荐</h3>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {featured.map(renderCard).map((c, i) => <Col key={i} xs={24} sm={12} md={8} lg={6}>{c}</Col>)}
          </Row>
        </>
      )}

      <h3 style={{ color: '#10b981', fontSize: 14, marginBottom: 8 }}>🔥 热门趋势</h3>
      {trending.length > 0 ? (
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {trending.map(renderCard).map((c, i) => <Col key={i} xs={24} sm={12} md={8} lg={6}>{c}</Col>)}
        </Row>
      ) : (
        <Empty description="暂无热门" />
      )}

      <h3 style={{ color: '#3b82f6', fontSize: 14, marginBottom: 8 }}>全部算法</h3>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>加载中...</div>
      ) : listings.length === 0 ? (
        <Empty description="未找到匹配算法" />
      ) : (
        <Row gutter={[12, 12]}>
          {listings.map(renderCard).map((c, i) => <Col key={i} xs={24} sm={12} md={8} lg={6}>{c}</Col>)}
        </Row>
      )}
    </div>
  );
};

export default Marketplace;
