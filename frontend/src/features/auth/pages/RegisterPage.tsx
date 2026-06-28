import type { FC } from 'react';
import { AuthCard } from '../components/AuthCard';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage: FC = () => {
  const footer = (
    <span>
      Already have an account?{' '}
      <a href="/login" className="text-link">
        Sign in
      </a>
    </span>
  );

  return (
    <AuthCard 
      title="Create Account" 
      subtitle="Join CineMatch and get movie recommendations" 
      footer={footer}
    >
      <RegisterForm />
    </AuthCard>
  );
};
