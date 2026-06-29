import type { FC } from 'react';

interface LoadingSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export const LoadingSkeleton: FC<LoadingSkeletonProps> = ({
  className = '',
  width = '100%',
  height = '100%',
  borderRadius = '12px',
  style = {},
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};
