import type { FC } from 'react';
import { motion } from 'framer-motion';

export const MovieCardSkeleton: FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      minWidth: '200px',
    }}>
      <motion.div 
        style={{
          width: '100%',
          aspectRatio: '2/3',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-md)',
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <motion.div 
          style={{ width: '80%', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          style={{ width: '40%', height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px' }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
};
