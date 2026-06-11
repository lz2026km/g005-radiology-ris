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

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
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

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const s: Record<string, React.CSSProperties> = {
        wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 24 },
        card: { maxWidth: 440, width: '100%', background: '#1e293b', borderRadius: 12, padding: 32, textAlign: 'center' },
        iconWrap: { width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        icon: { color: '#ef4444' },
        title: { fontSize: 20, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 },
        desc: { fontSize: 14, color: '#94a3b8', marginBottom: 24 },
        detail: { marginBottom: 24, padding: 16, background: '#0f172a', borderRadius: 8, textAlign: 'left' },
        detailMsg: { fontSize: 12, fontFamily: 'monospace', color: '#ef4444', wordBreak: 'break-all' as const },
        detailStack: { marginTop: 8, fontSize: 12, fontFamily: 'monospace', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
        btnRow: { display: 'flex', flexDirection: 'column', gap: 12 },
        btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 44, padding: '0 16px', background: '#2563eb', border: 'none', color: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
        btnSecondary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 44, padding: '0 16px', background: '#334155', border: 'none', color: '#f1f5f9', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
        footer: { marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' },
        footerBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, margin: '0 auto' },
      }

      return (
        <div style={s.wrapper}>
          <div style={s.card}>
            <div style={s.iconWrap}>
              <AlertCircle size={32} style={s.icon} />
            </div>
            <h1 style={s.title}>抱歉，出现了一些问题</h1>
            <p style={s.desc}>系统遇到了一个意外错误，请尝试刷新页面或返回首页</p>

            {this.props.showErrorDetails && this.state.error && (
              <div style={s.detail}>
                <div style={s.detailMsg}>{this.state.error.message}</div>
                {this.state.errorInfo && (
                  <div style={s.detailStack}>{this.state.errorInfo.componentStack?.split('\n')[0]}</div>
                )}
              </div>
            )}

            <div style={s.btnRow}>
              <button onClick={this.handleReload} style={s.btnPrimary}>
                <RefreshCw size={16} /> 刷新页面
              </button>
              <button onClick={this.handleGoHome} style={s.btnSecondary}>
                <Home size={16} /> 返回首页
              </button>
            </div>

            <div style={s.footer}>
              <button style={s.footerBtn}>
                <FileQuestion size={14} /> 查看帮助文档
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