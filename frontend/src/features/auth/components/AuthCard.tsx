import type { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle, footer }) => {
  return (
    <div className="glass-card" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 800, 
          letterSpacing: '3px', 
          marginBottom: '16px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '2px' 
        }}>
          <span style={{ color: '#ffffff' }}>CINE</span>
          <span style={{ color: 'var(--primary-color)' }}>MATCH</span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{subtitle}</p>}
      </div>
      
      {children}

      {footer && (
        <div style={{ 
          marginTop: '28px', 
          paddingTop: '20px', 
          borderTop: '1px solid var(--glass-border)', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: 'var(--text-secondary)' 
        }}>
          {footer}
        </div>
      )}
    </div>
  );
};
