/**
 * G005 放射RIS系统 v3.0.0 - Button 组件 Story
 * Phase T2-W4: Storybook 启用
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from 'antd';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '通用按钮,基于 antd Button 封装。支持 primary / default / dashed / text / link 5 种类型。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['primary', 'default', 'dashed', 'text', 'link'],
      description: '按钮类型',
    },
    size: {
      control: { type: 'select' },
      options: ['large', 'middle', 'small'],
      description: '按钮尺寸',
    },
    danger: { control: 'boolean', description: '危险按钮' },
    loading: { control: 'boolean', description: '加载状态' },
    disabled: { control: 'boolean', description: '禁用' },
    block: { control: 'boolean', description: '块级按钮' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    type: 'primary',
    children: '主要按钮',
  },
};

export const Default: Story = {
  args: {
    children: '默认按钮',
  },
};

export const Dashed: Story = {
  args: {
    type: 'dashed',
    children: '虚线按钮',
  },
};

export const Text: Story = {
  args: {
    type: 'text',
    children: '文字按钮',
  },
};

export const Danger: Story = {
  args: {
    type: 'primary',
    danger: true,
    children: '危险操作',
  },
};

export const Loading: Story = {
  args: {
    type: 'primary',
    loading: true,
    children: '加载中',
  },
};

export const Disabled: Story = {
  args: {
    type: 'primary',
    disabled: true,
    children: '禁用',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button type="primary" size="large">大</Button>
      <Button type="primary" size="middle">中</Button>
      <Button type="primary" size="small">小</Button>
    </div>
  ),
};

export const BlockButton: Story = {
  args: {
    type: 'primary',
    block: true,
    children: '块级按钮(全宽)',
  },
};
