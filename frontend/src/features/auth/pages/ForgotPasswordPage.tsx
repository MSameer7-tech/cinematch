import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { authService } from '../services/auth.service';

export const ForgotPasswordPage: FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await authService.forgotPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send password reset email.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <span>
      Remembered your password?{' '}
      <a href="/login" className="text-link">
        Sign in
      </a>
    </span>
  );

  return (
    <AuthCard 
      title="Forgot Password" 
      subtitle="Enter the email associated with your account"
      footer={footer}
    >
      {success ? (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ 
            display: 'inline-flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: 'var(--success-color)',
            marginBottom: '20px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 10px 0' }}>Reset Email Sent</h3>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
            We've sent a password reset link to <strong style={{ color: '#fff' }}>{email}</strong>. Please check your inbox.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-auth btn-primary"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
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

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="email" className="form-label">EMAIL ADDRESS</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              required
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-auth btn-primary"
            style={{ marginBottom: '16px' }}
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-auth btn-social"
            style={{ border: 'none', background: 'transparent' }}
          >
            ← Back to Login
          </button>
        </form>
      )}
    </AuthCard>
  );
};
