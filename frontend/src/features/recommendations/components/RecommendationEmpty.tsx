import type { FC } from 'react';

export const RecommendationEmpty: FC = () => {
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
        color: 'var(--text-secondary)'
      }}>
        Rate more movies to improve your recommendations!
      </div>
    </div>
  );
};
