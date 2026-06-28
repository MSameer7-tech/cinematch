import { useState } from 'react';
import type { FC } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { authService } from '../services/auth.service';

export const VerifyEmailPage: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) {
      setError('No email address provided to resend verification.');
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await authService.resendVerificationEmail(email);
      if (result.success) {
        setMessage('A new verification link has been sent to your email.');
      } else {
        setError(result.error || 'Failed to resend verification email.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <span>
      Already verified?{' '}
      <a href="/login" className="text-link">
        Sign in
      </a>
    </span>
  );

  return (
    <AuthCard 
      title="Check Your Email" 
      subtitle="We've sent a verification link to your inbox"
      footer={footer}
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ 
          display: 'inline-flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: 'rgba(170, 59, 255, 0.1)', 
          color: 'var(--primary-color)',
          marginBottom: '20px'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        {email && (
          <p style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '24px', wordBreak: 'break-all' }}>
            We sent a verification link to <strong style={{ color: '#fff' }}>{email}</strong>. Please check your inbox and click the link to activate your account.
          </p>
        )}

        {message && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--success-color)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'left',
            fontWeight: 600
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--error-color)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'left',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="btn-auth btn-primary"
          >
            {loading ? 'Sending link...' : 'Resend Verification Email'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-auth btn-social"
          >
            Back to Login
          </button>
        </div>
      </div>
    </AuthCard>
  );
};
