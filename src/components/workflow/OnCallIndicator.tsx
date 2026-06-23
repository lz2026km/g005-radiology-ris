/**
 * G005 RIS v3.0.6.6 - OnCallIndicator 值守指示器
 * 20 点升级 - 当前值守医生展示
 */

import React from 'react';
import { Phone, Shield } from 'lucide-react';
import type { OnCallEntry, OnCallSpecialty } from '../../types/workflow';

interface OnCallIndicatorProps {
  entries: OnCallEntry[];
  specialty?: OnCallSpecialty;
  compact?: boolean;
}

export const OnCallIndicator: React.FC<OnCallIndicatorProps> = ({ entries, specialty, compact = false }) => {
  const filtered = specialty ? entries.filter((e) => e.specialty === specialty) : entries;
  if (filtered.length === 0) {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 8, borderRadius: 6, fontSize: 12 }}>
        当前没有 {specialty ?? ''} 值守医生
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {filtered.slice(0, compact ? 1 : 4).map((entry) => (
        <div key={entry.id} style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', padding: '4px 10px', borderRadius: 6, fontSize: 12, color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={12} color="#10b981" />
          <span style={{ fontWeight: 700 }}>{entry.doctorName}</span>
          <span style={{ background: '#fff', border: '1px solid #6ee7b7', color: '#047857', borderRadius: 4, padding: '0 6px', fontSize: 12 }}>
            {entry.specialty}
          </span>
          <a href={`tel:${entry.contact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#047857' }}>
            <Phone size={10} /> {entry.contact}
          </a>
        </div>
      ))}
    </div>
  );
};

export default OnCallIndicator;