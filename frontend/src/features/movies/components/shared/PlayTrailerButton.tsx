import type { FC } from 'react';
import { Play } from 'lucide-react';

interface PlayTrailerButtonProps {
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayTrailerButton: FC<PlayTrailerButtonProps> = ({ onClick, size = 'md' }) => {
  const getStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '13px', iconSize: 14 };
      case 'lg':
        return { padding: '14px 28px', fontSize: '16px', iconSize: 20 };
      case 'md':
      default:
        return { padding: '10px 20px', fontSize: '14px', iconSize: 16 };
    }
  };

  const { padding, fontSize, iconSize } = getStyles();

  return (
    <button
      onClick={onClick}
      className="btn-play-trailer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding,
        backgroundColor: 'var(--primary-color)',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius-button)',
        fontWeight: 600,
        fontSize,
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = 'var(--primary-color)';
      }}
    >
      <Play size={iconSize} fill="currentColor" />
      Play Trailer
    </button>
  );
};
