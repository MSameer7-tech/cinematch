import type { FC } from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Sparkles } from 'lucide-react';
import { useRatings, useRateMovie, useDeleteRating } from '../hooks/useRatings';

interface RatingDialogProps {
  movieId: number;
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Disappointing',
  2: 'Poor',
  3: 'Weak',
  4: 'Below Average',
  5: 'Average',
  6: 'Decent',
  7: 'Good',
  8: 'Great',
  9: 'Excellent',
  10: 'Masterpiece 🌟',
};

export const RatingDialog: FC<RatingDialogProps> = ({ movieId, isOpen, onClose, movieTitle }) => {
  const { data: ratings } = useRatings();
  const rateMutation = useRateMovie();
  const deleteMutation = useDeleteRating();

  const existingRating = ratings?.find(entry => entry.media_id === movieId)?.rating;
  const [selectedRating, setSelectedRating] = useState<number | null>(existingRating || null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const activeNumber = hoveredRating ?? selectedRating;

  const handleSave = () => {
    if (selectedRating !== null) {
      rateMutation.mutate({ movieId, rating: selectedRating }, {
        onSuccess: () => onClose()
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(movieId, {
      onSuccess: () => {
        setSelectedRating(null);
        onClose();
      }
    });
  };

  const scale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(5, 5, 12, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '1.5rem',
        }}>
          {/* Backdrop click closes modal */}
          <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'rgba(14, 14, 24, 0.88)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '28px',
              color: '#fff',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.25)',
              zIndex: 10000
            }}
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.65)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
              }}
            >
              <X size={16} />
            </button>

            {/* Header with Star Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.25) 0%, rgba(234, 179, 8, 0.1) 100%)',
                border: '1px solid rgba(245, 197, 24, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F5C518',
                boxShadow: '0 0 16px rgba(245, 197, 24, 0.3)',
              }}>
                <Star size={20} fill="#F5C518" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.3px' }}>Rate this Movie</h3>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.55)' }}>Your rating influences recommendations</span>
              </div>
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', margin: '16px 0 20px 0', lineHeight: 1.5 }}>
              How would you rate <strong style={{ color: '#fff' }}>{movieTitle}</strong>?
            </p>

            {/* Rating Feedback Label */}
            <div style={{ 
              height: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              fontSize: '13px', 
              fontWeight: 600,
              color: activeNumber ? '#F5C518' : 'rgba(255, 255, 255, 0.35)',
              marginBottom: '14px',
              transition: 'all 0.15s ease',
            }}>
              {activeNumber ? (
                <>
                  <Sparkles size={14} />
                  <span>{activeNumber}/10 • {RATING_LABELS[activeNumber]}</span>
                </>
              ) : (
                <span>Select a score from 1 to 10</span>
              )}
            </div>

            {/* Scale Container */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                gap: '6px',
                marginBottom: '26px'
              }}
              onMouseLeave={() => setHoveredRating(null)}
            >
              {scale.map((num) => {
                const isSelected = selectedRating === num;
                const isHovered = hoveredRating !== null && num <= hoveredRating;
                const isActive = selectedRating !== null && hoveredRating === null && num <= selectedRating;

                let bgColor = 'rgba(255, 255, 255, 0.04)';
                let textColor = 'rgba(255, 255, 255, 0.6)';
                let borderColor = 'rgba(255, 255, 255, 0.08)';
                let glow = 'none';

                if (isSelected) {
                  bgColor = 'linear-gradient(135deg, #F5C518 0%, #D97706 100%)';
                  textColor = '#000000';
                  borderColor = '#F5C518';
                  glow = '0 0 14px rgba(245, 197, 24, 0.6)';
                } else if (isHovered || isActive) {
                  bgColor = 'rgba(245, 197, 24, 0.18)';
                  textColor = '#F5C518';
                  borderColor = 'rgba(245, 197, 24, 0.45)';
                  glow = '0 0 10px rgba(245, 197, 24, 0.25)';
                }

                return (
                  <button
                    key={num}
                    onMouseEnter={() => setHoveredRating(num)}
                    onClick={() => setSelectedRating(num)}
                    style={{
                      flex: 1,
                      height: '42px',
                      borderRadius: '10px',
                      background: bgColor,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: glow,
                      transform: isSelected || hoveredRating === num ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
              {existingRating && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                >
                  Delete Rating
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={selectedRating === null || rateMutation.isPending}
                style={{
                  padding: '10px 24px',
                  background: selectedRating !== null 
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  color: selectedRating !== null ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: selectedRating === null ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  boxShadow: selectedRating !== null ? '0 4px 16px rgba(124, 58, 237, 0.45)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedRating !== null) {
                    e.currentTarget.style.transform = 'scale(1.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {rateMutation.isPending ? 'Saving...' : 'Save Rating'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
