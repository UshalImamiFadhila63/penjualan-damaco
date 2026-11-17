import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#F8FAF9',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '36px 32px',
              maxWidth: '480px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                margin: '0 auto 16px',
              }}
            >
              ⚠️
            </div>
            <h2 style={{ fontSize: 20, color: '#0F172A', margin: '0 0 8px', fontWeight: 700 }}>
              Terjadi Kendala Tampilan
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, margin: '0 0 20px' }}>
              Halaman ini mengalami kendala sementara. Anda dapat kembali ke katalog utama dengan aman.
            </p>
            {this.state.error?.message && (
              <div
                style={{
                  background: '#F1F5F9',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: 12,
                  color: '#475569',
                  textAlign: 'left',
                  marginBottom: '20px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                background: '#286845',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s',
              }}
            >
              Kembali ke Katalog Utama →
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

