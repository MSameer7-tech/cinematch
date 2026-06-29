import type { FC } from 'react';
import { motion } from 'framer-motion';

export const HeroSkeleton: FC = () => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '80vh',
      minHeight: '600px',
      maxHeight: '900px',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      overflow: 'hidden',
    }}>
      <motion.div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '40px',
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        zIndex: 10,
      }}>
        {/* Title */}
        <motion.div 
          style={{ width: '80%', height: '64px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        />
        
        {/* Badges */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i}
              style={{ width: '60px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px' }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 + (i * 0.1) }}
            />
          ))}
        </div>
        
        {/* Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <motion.div style={{ width: '100%', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }} animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
          <motion.div style={{ width: '90%', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }} animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
          <motion.div style={{ width: '70%', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }} animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
        </div>
        
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <motion.div style={{ width: '140px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '24px' }} animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} />
          <motion.div style={{ width: '140px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px' }} animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }} />
        </div>
      </div>
    </div>
  );
};
