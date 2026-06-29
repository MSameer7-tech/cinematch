import type { FC, ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell: FC<AppShellProps> = ({ children }) => {
  return (
    <div className="app-shell">
      {children}
    </div>
  );
};
