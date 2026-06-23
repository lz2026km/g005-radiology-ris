/**
 * G005 RIS v3.0.6.6 - AssignmentBoard 医生分配看板
 * 50 点升级 - 拖拽分配
 */

import React, { useState } from 'react';
import { Users, UserPlus, GripVertical } from 'lucide-react';
import type { RadiologyExam } from '../../types';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  load: number;
  capacity: number;
}

interface AssignmentBoardProps {
  exams: RadiologyExam[];
  doctors: Doctor[];
  onAssign?: (examId: string, doctorId: string) => void;
}

export const AssignmentBoard: React.FC<AssignmentBoardProps> = ({ exams, doctors, onAssign }) => {
  const [draggedExam, setDraggedExam] = useState<string | null>(null);

  const pendingExams = exams.filter((e) => ['已登记', '待检查', '待报告'].includes(e.status));

  const handleDragStart = (examId: string) => setDraggedExam(examId);
  const handleDrop = (doctorId: string) => {
    if (draggedExam) {
      onAssign?.(draggedExam, doctorId);
      setDraggedExam(null);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 12, height: '100%', padding: 12, background: '#f8fafc' }}>
      <aside style={{ background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #e2e8f0', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Users size={16} color="#1e3a5f" />
          <span style={{ fontWeight: 700, color: '#1e3a5f' }}>待分配 ({pendingExams.length})</span>
        </div>
        {pendingExams.map((exam) => (
          <div
            key={exam.id}
            draggable
            onDragStart={() => handleDragStart(exam.id)}
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: 8,
              marginBottom: 6,
              cursor: 'move',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <GripVertical size={12} color="#94a3b8" />
              <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: 12 }}>{exam.patientName}</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{exam.examItemName}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <span style={badge(exam.modality)}>{exam.modality}</span>
              <span style={badge(exam.priority, exam.priority === '危重' ? '#dc2626' : exam.priority === '紧急' ? '#d97706' : '#475569')}>{exam.priority}</span>
            </div>
          </div>
        ))}
      </aside>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, alignContent: 'start' }}>
        {doctors.map((doctor) => {
          const loadPct = Math.round((doctor.load / Math.max(1, doctor.capacity)) * 100);
          return (
            <div
              key={doctor.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(doctor.id)}
              style={{
                background: '#fff',
                borderRadius: 10,
                padding: 12,
                border: '1px solid #e2e8f0',
                minHeight: 160,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                  {doctor.name.slice(0, 1)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 13 }}>{doctor.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{doctor.specialty}</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
                <div>负荷 {doctor.load} / {doctor.capacity}</div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, loadPct)}%`, height: '100%', background: loadPct > 80 ? '#dc2626' : loadPct > 50 ? '#d97706' : '#10b981' }} />
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserPlus size={12} /> 拖拽病例到此分配
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

function badge(_text: string, color = '#475569'): React.CSSProperties {
  return {
    fontSize: 12,
    padding: '1px 6px',
    borderRadius: 4,
    background: '#f1f5f9',
    color,
    fontWeight: 600,
  };
}

export default AssignmentBoard;