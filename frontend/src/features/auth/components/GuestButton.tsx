import type { FC } from 'react';

interface GuestButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export const GuestButton: FC<GuestButtonProps> = ({
  onClick,
  disabled = false,
  label = 'Continue as Guest'
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-auth btn-guest"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      {label}
    </button>
  );
};
