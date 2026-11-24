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
  const dimension = isLarge ? '46px' : size === 'small' ? '36px' : '40px';
  const iconSize = isLarge ? 19 : 17;

  return (
    <motion.button
      className="action-btn-secondary"
      onClick={handleShare}
      title={copied ? "Link Copied!" : "Share Movie"}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: isLarge ? '12px' : '50%',
        backgroundColor: copied ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        color: copied ? '#6ee7b7' : '#e2e8f0',
        border: copied ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ 
        scale: 1.04, 
        backgroundColor: copied ? 'rgba(16, 185, 129, 0.26)' : 'rgba(255, 255, 255, 0.12)',
        borderColor: copied ? 'rgba(16, 185, 129, 0.6)' : 'rgba(255, 255, 255, 0.25)'
      }}
      whileTap={{ scale: 0.94 }}
    >
      {copied ? <Check size={iconSize} strokeWidth={2.4} /> : <Share2 size={iconSize} strokeWidth={2} />}
    </motion.button>
  );
};
