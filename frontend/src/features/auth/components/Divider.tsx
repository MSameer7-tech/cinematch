import type { FC } from 'react';

interface DividerProps {
  label?: string;
}

export const Divider: FC<DividerProps> = ({ label = 'or' }) => {
  return (
    <div className="divider-container">
      <div className="divider-line" />
      <span className="divider-text">{label}</span>
      <div className="divider-line" />
    </div>
  );
};
