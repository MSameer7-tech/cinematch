import type { FC } from 'react';

interface GuestButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const GuestButton: FC<GuestButtonProps> = ({
  onClick,
  disabled = false
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-guest-link"
    >
      <span className="guest-title">
        Continue as Guest
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s ease' }} className="arrow-icon">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
      <span className="guest-subtitle">Browse without creating an account</span>

      <style>{`
        .btn-guest-link:hover .arrow-icon {
          transform: translateX(4px);
        }
      `}</style>
    </button>
  );
};
