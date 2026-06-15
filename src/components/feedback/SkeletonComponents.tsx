import type { CSSProperties } from 'react';

const shimmerKeyframes = `
@keyframes ant-skeleton-loading {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
`;

interface SkeletonBaseProps {
  width?: number | string;
  height?: number;
  style?: CSSProperties;
}

function ShimmerBlock({ width = '100%', height = 16, style }: SkeletonBaseProps) {
  return (
    <div
      className="ant-skeleton ant-skeleton-active"
      style={{
        width,
        height,
        borderRadius: 4,
        background: 'var(--color-gray-200, #e2e8f0)',
        backgroundImage: 'linear-gradient(90deg, var(--color-gray-200, #e2e8f0) 25%, var(--color-gray-100, #f1f5f9) 50%, var(--color-gray-200, #e2e8f0) 75%)',
        backgroundSize: '200px 100%',
        animation: 'ant-skeleton-loading 1.4s ease-in-out infinite',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

function ShimmerCircle({ size = 32 }: { size?: number }) {
  return (
    <div
      className="ant-skeleton ant-skeleton-active"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-gray-200, #e2e8f0)',
        backgroundImage: 'linear-gradient(90deg, var(--color-gray-200, #e2e8f0) 25%, var(--color-gray-100, #f1f5f9) 50%, var(--color-gray-200, #e2e8f0) 75%)',
        backgroundSize: '200px 100%',
        animation: 'ant-skeleton-loading 1.4s ease-in-out infinite',
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
}

export function ReportEditorSkeleton() {
  return (
    <div role="status" aria-label="Loading editor" style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
      <style>{shimmerKeyframes}</style>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 4, padding: 8, borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexWrap: 'wrap', alignItems: 'center' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ShimmerBlock key={`btn-${i}`} width={28} height={24} style={{ borderRadius: 4 }} />
        ))}
        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <ShimmerBlock key={`h-${i}`} width={28} height={24} style={{ borderRadius: 4 }} />
        ))}
        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <ShimmerBlock key={`align-${i}`} width={28} height={24} style={{ borderRadius: 4 }} />
        ))}
      </div>

      {/* Text area lines */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 300 }}>
        <ShimmerBlock width="75%" height={14} />
        <ShimmerBlock width="60%" height={14} />
        <ShimmerBlock width="85%" height={14} />
        <ShimmerBlock width="45%" height={14} />
        <ShimmerBlock width="70%" height={14} />
        <ShimmerBlock width="55%" height={14} />
        <ShimmerBlock width="90%" height={14} />
        <ShimmerBlock width="40%" height={14} />
        <ShimmerBlock width="65%" height={14} />
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <ShimmerBlock width={60} height={12} />
        <ShimmerBlock width={60} height={12} />
      </div>
    </div>
  );
}

export function ReportSidebarSkeleton() {
  const tabs = ['模板', '术语', '短语', 'AI', '质控', '历史'];
  return (
    <div role="status" aria-label="Loading sidebar" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{shimmerKeyframes}</style>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
        {tabs.map((_, i) => (
          <div key={i} style={{ flex: 1, padding: '10px 4px', display: 'flex', justifyContent: 'center' }}>
            <ShimmerBlock width={28} height={12} style={{ borderRadius: 2 }} />
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              background: '#f8fafc',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShimmerCircle size={28} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <ShimmerBlock width={`${60 + (i % 3) * 15}%`} height={12} />
              <ShimmerBlock width={`${40 + (i % 3) * 10}%`} height={10} />
            </div>
            <ShimmerBlock width={12} height={12} style={{ borderRadius: 2 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportTableSkeleton() {
  const headers = ['报告ID', 'Accession号', '患者姓名', '检查项目', '设备', '报告医生', '状态', '检查日期'];
  return (
    <div role="status" aria-label="Loading report table" style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <style>{shimmerKeyframes}</style>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
        <ShimmerBlock width={120} height={14} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <ShimmerBlock width={52} height={26} style={{ borderRadius: 5 }} />
          <ShimmerBlock width={52} height={26} style={{ borderRadius: 5 }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ width: 40, padding: '10px 8px' }}>
                <ShimmerBlock width={14} height={14} style={{ borderRadius: 2 }} />
              </th>
              {headers.map((_, i) => (
                <th key={i} style={{ padding: '10px 12px', textAlign: 'left' }}>
                  <ShimmerBlock width={`${50 + (i % 3) * 10}%`} height={12} style={{ borderRadius: 2 }} />
                </th>
              ))}
              <th style={{ width: 100, padding: '10px 12px' }}>
                <ShimmerBlock width="60%" height={12} style={{ borderRadius: 2 }} />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: rowIdx % 2 === 0 ? '#fff' : '#fafbfc',
                }}
              >
                <td style={{ padding: '9px 8px' }}>
                  <ShimmerBlock width={14} height={14} style={{ borderRadius: 2 }} />
                </td>
                {Array.from({ length: headers.length }).map((_, colIdx) => (
                  <td key={colIdx} style={{ padding: '9px 12px' }}>
                    <ShimmerBlock
                      width={`${50 + ((colIdx + rowIdx) % 4) * 12}%`}
                      height={12}
                      style={{ borderRadius: 2 }}
                    />
                  </td>
                ))}
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <ShimmerBlock width={36} height={20} style={{ borderRadius: 4 }} />
                    <ShimmerBlock width={36} height={20} style={{ borderRadius: 4 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: '10px 14px', borderTop: '1px solid #f1f5f9' }}>
        <ShimmerBlock width={24} height={24} style={{ borderRadius: 4 }} />
        <ShimmerBlock width={24} height={24} style={{ borderRadius: 4 }} />
        <ShimmerBlock width={60} height={14} />
        <ShimmerBlock width={24} height={24} style={{ borderRadius: 4 }} />
        <ShimmerBlock width={24} height={24} style={{ borderRadius: 4 }} />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading card"
      style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: 20,
      }}
    >
      <style>{shimmerKeyframes}</style>
      {/* Title */}
      <ShimmerBlock width="55%" height={18} style={{ marginBottom: 16 }} />
      {/* Content lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ShimmerBlock width="90%" height={12} />
        <ShimmerBlock width="75%" height={12} />
        <ShimmerBlock width="85%" height={12} />
        <ShimmerBlock width="40%" height={12} />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading stat card"
      style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flex: 1,
        minWidth: 160,
      }}
    >
      <style>{shimmerKeyframes}</style>
      {/* Icon circle placeholder */}
      <ShimmerCircle size={44} />

      {/* Text content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <ShimmerBlock width={60} height={26} style={{ borderRadius: 4 }} />
        <ShimmerBlock width="80%" height={12} style={{ borderRadius: 2 }} />
        <ShimmerBlock width="50%" height={10} style={{ borderRadius: 2 }} />
      </div>
    </div>
  );
}
