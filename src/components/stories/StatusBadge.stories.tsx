/**
 * G005 放射RIS系统 v3.0.0 - StatusBadge 组件 Story
 * Phase T2-W4: 报告状态徽章
 */

import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from '../report/StatusBadge';
import { REPORT_STATE_GROUPS, type ReportStateName } from '@/machines/reportMachine';

const meta: Meta<typeof StatusBadge> = {
  title: 'Report/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '报告状态徽章,根据 XState 状态机显示对应颜色和文案。',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

// 所有 14 态展示
const ALL_STATES: ReportStateName[] = [
  ...REPORT_STATE_GROUPS.draft,
  ...REPORT_STATE_GROUPS.review,
  ...REPORT_STATE_GROUPS.sign,
  ...REPORT_STATE_GROUPS.published,
  ...REPORT_STATE_GROUPS.special,
];

export const DraftStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {REPORT_STATE_GROUPS.draft.map((state) => (
        <div key={state}>
          <StatusBadge status={state} />
          <span style={{ marginLeft: 12, color: '#666' }}>{state}</span>
        </div>
      ))}
    </div>
  ),
};

export const ReviewStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {REPORT_STATE_GROUPS.review.map((state) => (
        <div key={state}>
          <StatusBadge status={state} />
          <span style={{ marginLeft: 12, color: '#666' }}>{state}</span>
        </div>
      ))}
    </div>
  ),
};

export const SignStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {REPORT_STATE_GROUPS.sign.map((state) => (
        <div key={state}>
          <StatusBadge status={state} />
          <span style={{ marginLeft: 12, color: '#666' }}>{state}</span>
        </div>
      ))}
    </div>
  ),
};

export const SpecialStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {REPORT_STATE_GROUPS.special.map((state) => (
        <div key={state}>
          <StatusBadge status={state} />
          <span style={{ marginLeft: 12, color: '#666' }}>{state}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {ALL_STATES.map((state) => (
        <StatusBadge key={state} status={state} />
      ))}
    </div>
  ),
};
