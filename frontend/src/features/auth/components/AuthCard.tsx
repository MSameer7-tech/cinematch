import type { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle, footer }) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '34px 32px',
        width: '100%',
        maxWidth: '410px',
        margin: '0 auto',
        borderRadius: '20px',
        background: 'rgba(16, 14, 28, 0.78)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <img
          src="/logo.png"
          alt="CineMatch"
          style={{
            width: '44px',
            height: '44px',
            margin: '0 auto 10px auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
        <div
          style={{
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '3px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <span style={{ color: '#ffffff' }}>CINE</span>
          <span style={{ color: '#a855f7' }}>MATCH</span>
        </div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 4px 0',
            letterSpacing: '-0.3px',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.52)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {children}

      {footer && (
        <div
          style={{
            marginTop: '22px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.55)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
