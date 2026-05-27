/**
 * ErrorBoundary 组件 - 统一异常处理UI
 * G005 Radiology RIS System
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, FileQuestion } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)] p-6">
          <div className="max-w-md w-full bg-[var(--bg-card)] rounded-xl p-8 text-center">
            {/* 错误图标 */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--status-error)]/10 flex items-center justify-center">
              <AlertCircle size={32} className="text-[var(--status-error)]" />
            </div>

            {/* 错误标题 */}
            <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              抱歉，出现了一些问题
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              系统遇到了一个意外错误，请尝试刷新页面或返回首页
            </p>

            {/* 错误详情（可选） */}
            {this.props.showErrorDetails && this.state.error && (
              <div className="mb-6 p-4 bg-[var(--bg-deep)] rounded-lg text-left">
                <div className="text-xs font-mono text-[var(--status-error)] break-all">
                  {this.state.error.message}
                </div>
                {this.state.errorInfo && (
                  <div className="mt-2 text-xs font-mono text-gray-500 truncate">
                    {this.state.errorInfo.componentStack?.split('\n')[0]}
                  </div>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 w-full h-11 px-4 bg-[var(--blue-accent)] hover:bg-[var(--blue-dark)] text-white rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                刷新页面
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 w-full h-11 px-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-deep)] text-[var(--text-primary)] rounded-lg transition-colors"
              >
                <Home size={16} />
                返回首页
              </button>
            </div>

            {/* 帮助链接 */}
            <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
              <button className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--blue-accent)] transition-colors mx-auto">
                <FileQuestion size={14} />
                查看帮助文档
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;