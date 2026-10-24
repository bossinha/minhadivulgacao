import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRecover = () => {
    try {
      sessionStorage.clear();
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.hash = '#/fortaleza';
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#090d16',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '420px',
            width: '100%',
            background: '#121824',
            border: '1px solid rgba(255, 138, 0, 0.3)',
            borderRadius: '24px',
            padding: '32px 24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <img 
              src="https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png" 
              alt="Minha Divulgação" 
              style={{ width: '64px', height: '64px', margin: '0 auto 16px auto', display: 'block', objectFit: 'contain' }}
            />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '8px', color: '#ff8a00' }}>
              MINHA DIVULGAÇÃO
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#c8ceda', marginBottom: '24px', lineHeight: 1.5 }}>
              Atualizamos o portal para oferecer a melhor experiência. Toque no botão abaixo para carregar normalmente.
            </p>
            <button
              onClick={this.handleRecover}
              style={{
                width: '100%',
                background: '#ff8a00',
                color: '#000000',
                border: 'none',
                padding: '14px 20px',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 8px 24px rgba(255, 138, 0, 0.3)'
              }}
            >
              🚀 Abrir Portal Agora
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
