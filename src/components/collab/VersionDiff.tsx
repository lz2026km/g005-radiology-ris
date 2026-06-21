import React, { useMemo, useState } from 'react';
import { Button, Select, Space, Tag, Tooltip, Typography } from 'antd';
import {
  GitCompare,
  ArrowLeft,
  ArrowRight,
  Code,
  Columns2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { versionCompare } from '../../services/collab/VersionCompare';
import { mergeConflictResolver } from '../../services/collab/MergeConflictResolver';
import type {
  CollabVersion,
  VersionDiffResult,
  VersionDiffHunk,
  MergeResult,
  MergeConflictBlock,
} from '../../types/collab';

export interface VersionDiffProps {
  versions: CollabVersion[];
  /** 当前选中的左侧版本 */
  defaultFromIndex?: number;
  /** 当前选中的右侧版本 */
  defaultToIndex?: number;
  /** 三路合并时作为 base 的版本 */
  mergeBaseVersion?: CollabVersion;
  /** 三路合并: mine */
  mergeMineVersion?: CollabVersion;
  /** 三路合并: theirs */
  mergeTheirsVersion?: CollabVersion;
  /** 显示模式: unified | split */
  viewMode?: 'unified' | 'split';
  /** 是否显示合并面板 */
  showMerge?: boolean;
  testIdPrefix?: string;
}

const HUNK_META: Record<string, { color: string; bg: string; prefix: string }> = {
  '+': { color: '#059669', bg: '#d1fae5', prefix: '+' },
  '-': { color: '#dc2626', bg: '#fee2e2', prefix: '-' },
  ' ': { color: '#64748b', bg: '#f8fafc', prefix: ' ' },
};

export const VersionDiff: React.FC<VersionDiffProps> = ({
  versions,
  defaultFromIndex = 0,
  defaultToIndex = Math.min(1, versions.length - 1),
  mergeBaseVersion,
  mergeMineVersion,
  mergeTheirsVersion,
  viewMode: initialViewMode = 'unified',
  showMerge = false,
  testIdPrefix = 'version-diff',
}) => {
  const [fromIdx, setFromIdx] = useState(defaultFromIndex);
  const [toIdx, setToIdx] = useState(defaultToIndex);
  const [viewMode, setViewMode] = useState<'unified' | 'split'>(initialViewMode);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<Record<string, string>>({});

  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => a.versionNumber - b.versionNumber);
  }, [versions]);

  const diffResult = useMemo((): VersionDiffResult | null => {
    if (fromIdx === toIdx || !sortedVersions[fromIdx] || !sortedVersions[toIdx]) return null;
    return versionCompare.diff(sortedVersions[fromIdx]!, sortedVersions[toIdx]!, {
      granularity: 'line',
      contextLines: 3,
    });
  }, [sortedVersions, fromIdx, toIdx]);

  const performMerge = () => {
    if (!mergeBaseVersion || !mergeMineVersion || !mergeTheirsVersion) return;
    const result = versionCompare.merge(mergeBaseVersion, mergeMineVersion, mergeTheirsVersion);
    setMergeResult(result);
  };

  const resolveConflict = (idx: number, resolution: string) => {
    setSelectedResolution((prev) => ({ ...prev, [String(idx)]: resolution }));
  };

  const renderHunk = (hunk: VersionDiffHunk, idx: number) => (
    <div
      key={`hunk-${idx}`}
      data-testid={`${testIdPrefix}-hunk-${idx}`}
      style={{ marginBottom: 8, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0' }}
    >
      <div style={{
        padding: '2px 8px', background: '#f1f5f9', fontSize: 10, fontFamily: 'monospace', color: '#475569',
        borderBottom: '1px solid #e2e8f0',
      }}>
        @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
        {hunk.conflict && <Tag color="red" style={{ marginLeft: 8 }}>冲突</Tag>}
      </div>
      {hunk.lines.map((line, li) => {
        const prefix = line.charAt(0);
        const meta = HUNK_META[prefix] ?? HUNK_META[' ']!;
        return (
          <div
            key={li}
            style={{
              padding: '1px 12px', fontSize: 12, fontFamily: 'monospace', background: meta.bg, color: meta.color,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}
          >
            <span style={{ display: 'inline-block', width: 20, userSelect: 'none', opacity: 0.4 }}>{meta.prefix}</span>
            {line.slice(1)}
          </div>
        );
      })}
    </div>
  );

  const renderSplitView = (diff: VersionDiffResult) => {
    const leftLines: string[] = [];
    const rightLines: string[] = [];
    for (const hunk of diff.hunks) {
      for (const line of hunk.lines) {
        const prefix = line.charAt(0);
        const content = line.slice(1);
        if (prefix === '-') { leftLines.push(line); rightLines.push(` ${content}`); }
        else if (prefix === '+') { leftLines.push(` ${content}`); rightLines.push(line); }
        else { leftLines.push(line); rightLines.push(line); }
      }
    }
    return (
      <div style={{ display: 'flex', gap: 0, border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ flex: 1, borderRight: '1px solid #e2e8f0' }}>
          <div style={{ padding: '4px 8px', background: '#f1f5f9', fontSize: 10, fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#dc2626' }}>
            旧版本 (v{diff.fromVersionId})
          </div>
          {leftLines.map((line, i) => {
            const prefix = line.charAt(0);
            const meta = HUNK_META[prefix] ?? HUNK_META[' ']!;
            return (
              <div key={i} style={{ padding: '1px 12px', fontSize: 12, fontFamily: 'monospace', background: meta.bg, color: meta.color }}>
                {line}
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ padding: '4px 8px', background: '#f1f5f9', fontSize: 10, fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#059669' }}>
            新版本 (v{diff.toVersionId})
          </div>
          {rightLines.map((line, i) => {
            const prefix = line.charAt(0);
            const meta = HUNK_META[prefix] ?? HUNK_META[' ']!;
            return (
              <div key={i} style={{ padding: '1px 12px', fontSize: 12, fontFamily: 'monospace', background: meta.bg, color: meta.color }}>
                {line}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div data-testid={testIdPrefix} role="region" aria-label="版本对比" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <GitCompare size={14} color="#3b82f6" />
        <strong style={{ fontSize: 13 }}>版本对比</strong>
        <Space size={4}>
          <span style={{ fontSize: 11, color: '#64748b' }}>从</span>
          <Select
            size="small"
            style={{ minWidth: 100 }}
            value={fromIdx}
            onChange={setFromIdx}
            options={sortedVersions.map((v, i) => ({ label: `v${v.versionNumber} ${v.description ?? ''}`, value: i }))}
          />
          <span style={{ fontSize: 11, color: '#64748b' }}>到</span>
          <Select
            size="small"
            style={{ minWidth: 100 }}
            value={toIdx}
            onChange={setToIdx}
            options={sortedVersions.map((v, i) => ({ label: `v${v.versionNumber} ${v.description ?? ''}`, value: i }))}
          />
        </Space>
        <div style={{ flex: 1 }} />
        <Tooltip title="统一视图">
          <Button
            size="small"
            type={viewMode === 'unified' ? 'primary' : 'default'}
            icon={<Code size={11} />}
            onClick={() => setViewMode('unified')}
          />
        </Tooltip>
        <Tooltip title="分栏视图">
          <Button
            size="small"
            type={viewMode === 'split' ? 'primary' : 'default'}
            icon={<Columns2 size={11} />}
            onClick={() => setViewMode('split')}
          />
        </Tooltip>
      </div>

      <div style={{ padding: 12, maxHeight: 400, overflowY: 'auto' }}>
        {diffResult ? (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <Tag color="green">+{diffResult.addedLines} 行</Tag>
              <Tag color="red">-{diffResult.removedLines} 行</Tag>
              <Tag color="blue">修改 {diffResult.changedLines} 行</Tag>
              <Tag color="default">相似度 {diffResult.similarity}%</Tag>
            </div>
            {viewMode === 'split' ? renderSplitView(diffResult) : (
              diffResult.hunks.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                  <CheckCircle2 size={20} style={{ opacity: 0.4 }} />
                  <div style={{ marginTop: 6 }}>两个版本完全一致</div>
                </div>
              ) : (
                diffResult.hunks.map((h, i) => renderHunk(h, i))
              )
            )}
          </>
        ) : (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
            <GitCompare size={20} style={{ opacity: 0.4 }} />
            <div style={{ marginTop: 6 }}>请选择两个不同的版本进行对比</div>
          </div>
        )}

        {showMerge && (
          <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={14} color="#f59e0b" />
              <strong style={{ fontSize: 13 }}>三路合并</strong>
              {mergeResult && (
                <Tag color={mergeResult.hasConflicts ? 'red' : 'green'}>
                  {mergeResult.hasConflicts ? `${mergeResult.conflicts.length} 个冲突` : '自动合并成功'}
                </Tag>
              )}
            </div>
            {mergeBaseVersion && mergeMineVersion && mergeTheirsVersion && (
              <Space style={{ marginBottom: 8 }}>
                <Button size="small" type="primary" onClick={performMerge} data-testid={`${testIdPrefix}-merge-btn`}>
                  执行合并
                </Button>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  基: v{mergeBaseVersion.versionNumber} | M: v{mergeMineVersion.versionNumber} | T: v{mergeTheirsVersion.versionNumber}
                </span>
              </Space>
            )}
            {mergeResult && mergeResult.conflicts.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {mergeResult.conflicts.map((c, idx) => (
                  <div key={idx} style={{ marginBottom: 8, padding: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>冲突 #{idx + 1}</div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, fontFamily: 'monospace' }}>
                      <div style={{ flex: 1, padding: 4, background: '#fee2e2', borderRadius: 4 }}>
                        <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: 2 }}>我的</div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{c.mineText}</pre>
                      </div>
                      <div style={{ flex: 1, padding: 4, background: '#d1fae5', borderRadius: 4 }}>
                        <div style={{ fontWeight: 600, color: '#059669', marginBottom: 2 }}>对方的</div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{c.theirsText}</pre>
                      </div>
                    </div>
                    <Space style={{ marginTop: 4 }}>
                      <Button size="small" type={selectedResolution[String(idx)] === 'mine' ? 'primary' : 'default'} onClick={() => resolveConflict(idx, 'mine')}>采用我的</Button>
                      <Button size="small" type={selectedResolution[String(idx)] === 'theirs' ? 'primary' : 'default'} onClick={() => resolveConflict(idx, 'theirs')}>采用对方的</Button>
                      <Button size="small" type={selectedResolution[String(idx)] === 'base' ? 'primary' : 'default'} onClick={() => resolveConflict(idx, 'base')}>采用基线</Button>
                    </Space>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 8 }}>
                  自动合并率: {(mergeResult.autoMergeRate * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionDiff;
