import type { FC } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  movieId: number;
  size?: 'small' | 'medium' | 'large';
}

export const ShareButton: FC<ShareButtonProps> = ({ movieId, size = 'medium' }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/movie/${movieId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Movie link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isLarge = size === 'large';
  const dimension = isLarge ? '48px' : size === 'small' ? '36px' : '40px';
  const iconSize = isLarge ? 20 : 18;

  return (
    <motion.button
      className="action-btn-secondary"
      onClick={handleShare}
      title={copied ? "Link Copied!" : "Share Movie"}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: isLarge ? '14px' : '50%',
        backgroundColor: copied ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        color: copied ? '#34d399' : '#fff',
        border: copied ? '1.5px solid rgba(16, 185, 129, 0.65)' : '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: copied ? '0 0 20px rgba(16, 185, 129, 0.35)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ 
        scale: 1.05, 
        backgroundColor: copied ? 'rgba(16, 185, 129, 0.32)' : 'rgba(255, 255, 255, 0.15)',
        borderColor: copied ? '#10b981' : 'rgba(255, 255, 255, 0.35)'
      }}
      whileTap={{ scale: 0.92 }}
    >
      {copied ? <Check size={iconSize} strokeWidth={2.5} /> : <Share2 size={iconSize} strokeWidth={2} />}
    </motion.button>
  );
};
