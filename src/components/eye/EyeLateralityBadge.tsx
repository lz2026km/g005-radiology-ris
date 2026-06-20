import React from 'react';
import { Tag } from 'antd';

interface Props {
  eyeSide: 'OD' | 'OS' | 'OU';
  size?: 'small' | 'default';
}

const BADGE_MAP: Record<string, { label: string; color: string }> = {
  OD: { label: '右眼', color: 'blue' },
  OS: { label: '左眼', color: 'purple' },
  OU: { label: '双眼', color: 'green' },
};

const EyeLateralityBadge: React.FC<Props> = ({ eyeSide, size = 'default' }) => {
  const badge = BADGE_MAP[eyeSide];
  if (!badge) return null;

  return (
    <Tag
      color={badge.color}
      style={{
        fontSize: size === 'small' ? 10 : 12,
        padding: size === 'small' ? '0 4px' : '2px 8px',
        margin: 0,
        fontWeight: 600,
        letterSpacing: 0.5,
      }}
    >
      {eyeSide} {badge.label}
    </Tag>
  );
};

export default EyeLateralityBadge;
