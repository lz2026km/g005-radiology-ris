/**
 * G005 放射RIS系统 v3.0.0 - CriticalValueState 组件 Story
 * Phase T2-W4: 危急值 5 节点状态
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CRITICAL_STATE_LABEL, type CriticalStateName } from '@/machines/criticalValueMachine';
import { Tag } from 'antd';

const meta: Meta = {
  title: 'CriticalValue/State',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '危急值 5 节点闭环:found → notified → acknowledged → resolving → resolved',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const STATES: CriticalStateName[] = ['found', 'notified', 'acknowledged', 'resolving', 'resolved', 'escalated', 'cancelled'];

const COLORS: Record<CriticalStateName, string> = {
  found: 'red',
  notified: 'orange',
  acknowledged: 'blue',
  resolving: 'cyan',
  resolved: 'green',
  escalated: 'magenta',
  cancelled: 'default',
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {STATES.map((state) => (
        <Tag key={state} color={COLORS[state]} style={{ fontSize: 14, padding: '4px 12px' }}>
          {CRITICAL_STATE_LABEL[state]} ({state})
        </Tag>
      ))}
    </div>
  ),
};

export const FiveNodeFlow: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Tag color="red" style={{ fontSize: 14 }}>1. 已发现</Tag>
      <span>→</span>
      <Tag color="orange" style={{ fontSize: 14 }}>2. 已通知</Tag>
      <span>→</span>
      <Tag color="blue" style={{ fontSize: 14 }}>3. 已确认</Tag>
      <span>→</span>
      <Tag color="cyan" style={{ fontSize: 14 }}>4. 处理中</Tag>
      <span>→</span>
      <Tag color="green" style={{ fontSize: 14 }}>5. 已闭环</Tag>
    </div>
  ),
};
