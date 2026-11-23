import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { AIChat } from '../components/AIChat';

export const AIPicksPage: React.FC = () => {
  const { user, guest } = useAuth();
  const userId = user?.id || (guest as any)?.sessionId || (guest as any)?.guestId || (guest as any)?.id || 'guest-user';

  return (
    <div style={{ height: 'calc(100vh - var(--navbar-height))', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <AIChat userId={userId} />
    </div>
  );
};
