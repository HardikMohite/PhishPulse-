import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          color: 'white',
          padding: '40px',
          fontFamily: 'monospace'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h1 style={{ color: '#ef4444', marginBottom: '16px' }}>
              ⚠️ Something went wrong
            </h1>
            <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Error Details:</h2>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              {this.state.error?.toString()}
            </pre>
            
            {this.state.errorInfo && (
              <>
                <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Stack Trace:</h2>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '16px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '12px',
                  marginBottom: '16px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/auth/login';
              }}
              style={{
                padding: '12px 24px',
                background: '#06b6d4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '12px'
              }}
            >
              Clear Storage & Reload
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;