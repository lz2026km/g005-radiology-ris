/**
 * G005 放射RIS系统 v3.0.0 - SkipLink + LiveRegion Story
 * Phase T2-W4: a11y 组件
 */

import type { Meta, StoryObj } from '@storybook/react';
import { SkipLink, LiveRegion, useScreenReaderAnnouncer, useGlobalShortcuts } from '@/a11y/SkipLink';
import { useEffect } from 'react';
import { Button } from 'antd';

const meta: Meta = {
  title: 'A11y/SkipLink & LiveRegion',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '无障碍辅助组件:跳过链接 + 实时公告 + 屏幕阅读器通知。Lighthouse a11y ≥ 90 必备。',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const DemoContent = () => {
  const { announce, Announcement } = useScreenReaderAnnouncer();

  useGlobalShortcuts({
    'Ctrl+K': () => announce('命令面板已打开', 'assertive'),
    'Ctrl+S': () => announce('已保存', 'polite'),
  });

  useEffect(() => {
    announce('页面已加载,使用 Tab 键浏览');
  }, [announce]);

  return (
    <div style={{ padding: 24 }}>
      <SkipLink targetId="main-demo" />
      <h1>无障碍演示</h1>
      <p>按 <kbd>Tab</kbd> 键聚焦到跳过链接,按 <kbd>Enter</kbd> 跳到主内容。</p>
      <p>按 <kbd>Ctrl+K</kbd> 触发命令面板通知(aria-live)。</p>
      <p>按 <kbd>Ctrl+S</kbd> 触发保存通知。</p>
      <Button onClick={() => announce('操作已成功')}>触发通知</Button>
      <main id="main-demo" style={{ marginTop: 24, padding: 16, border: '1px solid #ccc' }}>
        <h2>主内容区</h2>
        <p>如果使用跳过链接,焦点会直接跳到这里。</p>
      </main>
      <Announcement />
    </div>
  );
};

export const Demo: Story = {
  render: () => <DemoContent />,
};

export const LiveRegionDemo: Story = {
  render: () => {
    const { announce, Announcement } = useScreenReaderAnnouncer();
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => announce('已保存', 'polite')}>polite(礼貌)</Button>
        <Button danger onClick={() => announce('错误!', 'assertive')}>assertive(强制)</Button>
        <Announcement />
        <p>用屏幕阅读器测试(如 NVDA / VoiceOver)可听到通知。</p>
      </div>
    );
  },
};
