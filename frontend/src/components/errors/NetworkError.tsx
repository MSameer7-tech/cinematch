import type { FC } from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const NetworkError: FC<NetworkErrorProps> = ({ 
  message = "Couldn't load movies. Please check your connection.", 
  onRetry 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed rgba(255, 255, 255, 0.1)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <WifiOff size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>Connection Issue</h3>
        <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '300px' }}>
          {message}
        </p>
        
        {onRetry && (
          <button 
            onClick={onRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <RefreshCcw size={16} />
            Retry
          </button>
        )}
      </motion.div>
    </div>
  );
};
