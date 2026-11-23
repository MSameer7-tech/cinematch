import type { FC } from 'react';

export const RecommendationSkeleton: FC = () => {
  return (
    <div style={{ margin: '32px 0' }}>
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ width: '250px', height: '32px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }} className="animate-pulse" />
      </div>
      <div style={{ display: 'flex', gap: '24px', padding: '12px 24px', overflow: 'hidden' }}>
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            style={{ 
              width: '320px', 
              height: '240px', 
              backgroundColor: 'var(--bg-surface-elevated)', 
              borderRadius: 'var(--radius-lg)',
              flexShrink: 0
            }} 
            className="animate-pulse" 
          />
        ))}
      </div>
    </div>
  );
};
