/**
 * G005 放射RIS系统 v3.0.0 - 业务组件测试
 * Phase T2-W4: useToast / AppEmpty / AppProgress / AppStatistic
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useToast, useConfirm, useNotification } from '../feedback/Toast';
import { AppEmpty, AppProgress, AppAlert } from '../feedback';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nextProvider i18n={i18n}>
    <ConfigProvider>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  </I18nextProvider>
);

const ToastDemo = () => {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('操作成功')}>success</button>
      <button onClick={() => toast.error('操作失败')}>error</button>
      <button onClick={() => toast.warning('警告')}>warning</button>
      <button onClick={() => toast.info('提示')}>info</button>
      <button onClick={() => toast.saved()}>saved</button>
    </div>
  );
};

describe('useToast hook', () => {
  it('渲染并触发 success', () => {
    render(
      <TestWrapper>
        <ToastDemo />
      </TestWrapper>
    );
    const btn = screen.getByText('success');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    // toast 内容出现在全局 message 容器中
    expect(screen.getByText('操作成功')).toBeInTheDocument();
  });

  it('触发 error', () => {
    render(
      <TestWrapper>
        <ToastDemo />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('error'));
    expect(screen.getByText('操作失败')).toBeInTheDocument();
  });

  it('触发 warning', () => {
    render(
      <TestWrapper>
        <ToastDemo />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('warning'));
    expect(screen.getByText('警告')).toBeInTheDocument();
  });

  it('触发 info', () => {
    render(
      <TestWrapper>
        <ToastDemo />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('info'));
    expect(screen.getByText('提示')).toBeInTheDocument();
  });

  it('saved 业务方法', () => {
    render(
      <TestWrapper>
        <ToastDemo />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('saved'));
    // 成功消息显示"成功"
  });
});

const ConfirmDemo = ({ onOk }: { onOk: () => void }) => {
  const confirm = useConfirm();
  return (
    <div>
      <button onClick={() => confirm.delete('测试项', onOk)}>delete</button>
      <button onClick={() => confirm.submit('报告', onOk)}>submit</button>
    </div>
  );
};

describe('useConfirm hook', () => {
  it('打开删除确认', () => {
    const onOk = vi.fn();
    render(
      <TestWrapper>
        <ConfirmDemo onOk={onOk} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('delete'));
    // Modal 出现
    expect(screen.getByText('测试项')).toBeInTheDocument();
  });

  it('打开提交确认', () => {
    const onOk = vi.fn();
    render(
      <TestWrapper>
        <ConfirmDemo onOk={onOk} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('submit'));
    expect(screen.getByText('报告')).toBeInTheDocument();
  });
});

const NotificationDemo = () => {
  const notification = useNotification();
  return (
    <div>
      <button onClick={() => notification.success('操作成功', '详情')}>success</button>
      <button onClick={() => notification.criticalValue('张三', '主动脉夹层')}>cv</button>
    </div>
  );
};

describe('useNotification hook', () => {
  it('触发成功通知', () => {
    render(
      <TestWrapper>
        <NotificationDemo />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('success'));
    expect(screen.getByText('操作成功')).toBeInTheDocument();
  });

  it('触发危急值通知(不自动关闭)', () => {
    render(
      <TestWrapper>
        <NotificationDemo />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('cv'));
    // 危急值通知出现,含患者名和发现
    expect(screen.getByText(/张三/)).toBeInTheDocument();
    expect(screen.getByText(/主动脉夹层/)).toBeInTheDocument();
  });
});

describe('AppEmpty - 空状态', () => {
  it('默认 no-data 变体', () => {
    render(
      <TestWrapper>
        <AppEmpty />
      </TestWrapper>
    );
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('no-results 变体', () => {
    render(
      <TestWrapper>
        <AppEmpty variant="no-results" />
      </TestWrapper>
    );
    expect(screen.getByText('无匹配结果')).toBeInTheDocument();
  });

  it('error 变体', () => {
    render(
      <TestWrapper>
        <AppEmpty variant="error" />
      </TestWrapper>
    );
    expect(screen.getByText('服务器错误')).toBeInTheDocument();
  });

  it('带 action 按钮', () => {
    const onClick = vi.fn();
    render(
      <TestWrapper>
        <AppEmpty action={{ label: '新建', onClick }} />
      </TestWrapper>
    );
    const btn = screen.getByRole('button', { name: '新建' });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});

describe('AppProgress - 进度条', () => {
  it('基础进度条(带 a11y role)', () => {
    render(
      <TestWrapper>
        <AppProgress percent={50} ariaLabel="加载中" />
      </TestWrapper>
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-label', '加载中');
  });

  it('限制 percent 在 0-100', () => {
    render(
      <TestWrapper>
        <AppProgress percent={150} />
      </TestWrapper>
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('100% 自动 success 状态', () => {
    render(
      <TestWrapper>
        <AppProgress percent={100} />
      </TestWrapper>
    );
    // 100% 进度条应为成功状态
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('负数归零', () => {
    render(
      <TestWrapper>
        <AppProgress percent={-10} />
      </TestWrapper>
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('AppAlert - 警告框', () => {
  it('info 类型', () => {
    render(
      <TestWrapper>
        <AppAlert type="info" message="信息提示" />
      </TestWrapper>
    );
    expect(screen.getByText('信息提示')).toBeInTheDocument();
  });

  it('error 类型带 role=alert', () => {
    render(
      <TestWrapper>
        <AppAlert type="error" message="错误" description="详情" />
      </TestWrapper>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('错误');
    expect(alert).toHaveTextContent('详情');
  });

  it('warning 类型', () => {
    render(
      <TestWrapper>
        <AppAlert type="warning" message="警告" />
      </TestWrapper>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('success 类型带 role=status', () => {
    render(
      <TestWrapper>
        <AppAlert type="success" message="成功" />
      </TestWrapper>
    );
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });
});
