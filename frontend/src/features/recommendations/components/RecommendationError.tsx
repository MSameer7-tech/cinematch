import type { FC } from 'react';
import { AlertTriangle } from 'lucide-react';

interface RecommendationErrorProps {
  onRetry: () => void;
}

export const RecommendationError: FC<RecommendationErrorProps> = ({ onRetry }) => {
  return (
    <div style={{ margin: '32px 0', padding: '0 24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>✨</span> Recommended For You
      </h2>
      <div style={{ 
        padding: '32px', 
        backgroundColor: 'var(--bg-surface-elevated)', 
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <AlertTriangle size={32} color="var(--danger-color)" />
        <p>Could not load recommendations at this time.</p>
        <button onClick={onRetry} className="action-btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
          Try Again
        </button>
      </div>
    </div>
  );
};
