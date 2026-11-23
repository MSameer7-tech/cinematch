import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingCardsMenu } from '../components/OnboardingCardsMenu';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px 64px',
        position: 'relative'
      }}
    >
      <OnboardingCardsMenu
        onComplete={() => {
          navigate('/discover');
        }}
      />
    </div>
  );
};
