import type { FC } from 'react';
import { MovieCardSkeleton } from './MovieCardSkeleton';
import { motion } from 'framer-motion';

export const MovieRowSkeleton: FC = () => {
  return (
    <section style={{ margin: '40px 0', padding: '0 40px' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <motion.div 
          style={{ width: '150px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }} animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
      </div>
      
      {/* Cards Skeleton Row */}
      <div style={{ display: 'flex', gap: '20px', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ flex: '0 0 200px' }}>
            <MovieCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
};
