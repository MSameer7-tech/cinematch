import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle, footer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      style={{
        padding: '38px 36px',
        width: '100%',
        maxWidth: '445px',
        margin: '0 auto',
        borderRadius: '14px',
        background: 'rgba(16, 15, 25, 0.86)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '26px' }}>
        <img
          src="/logo.png"
          alt="CineMatch"
          style={{
            width: '38px',
            height: '38px',
            margin: '0 auto 14px auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
        <h2
          style={{
            fontSize: '21px',
            fontWeight: 700,
            color: '#F5F3FA',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '13.5px', color: '#A6A1B5', margin: 0, lineHeight: 1.45 }}>
            {subtitle}
          </p>
        )}
      </div>

      {children}

      {footer && (
        <div
          style={{
            marginTop: '22px',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.07)',
            textAlign: 'center',
            fontSize: '13px',
            color: '#A6A1B5',
          }}
        >
          {footer}
        </div>
      )}
    </motion.div>
  );
};
