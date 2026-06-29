import type { FC } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionClick,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-color)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--primary-color)')}
        >
          {actionText} →
        </button>
      )}
    </div>
  );
};
