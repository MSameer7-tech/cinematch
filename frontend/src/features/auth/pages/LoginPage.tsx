import type { FC } from 'react';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: FC = () => {
  const footer = (
    <span>
      Don't have an account?{' '}
      <a href="/register" className="text-link">
        Sign up
      </a>
    </span>
  );

  return (
    <AuthCard 
      title="Welcome Back" 
      subtitle="Sign in to your CineMatch account" 
      footer={footer}
    >
      <LoginForm />
    </AuthCard>
  );
};
