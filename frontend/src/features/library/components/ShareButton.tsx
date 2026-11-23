import type { FC } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  movieId: number;
}

export const ShareButton: FC<ShareButtonProps> = ({ movieId }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/movie/${movieId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.button
      className="action-btn-secondary"
      onClick={handleShare}
      title="Share Movie"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        color: copied ? '#22c55e' : '#fff',
        border: copied ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      whileTap={{ scale: 0.9 }}
    >
      {copied ? <Check size={20} /> : <Share2 size={20} />}
    </motion.button>
  );
};
