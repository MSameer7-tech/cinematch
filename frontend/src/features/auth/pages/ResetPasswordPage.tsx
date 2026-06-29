import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { PasswordInput } from '../components/PasswordInput';
import { authService } from '../services/auth.service';

export const ResetPasswordPage: FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the URL hash contains Supabase redirect error messages (like otp_expired)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get('error_code');
    const errorDesc = hashParams.get('error_description');

    if (errorCode || errorDesc) {
      setIsLinkInvalid(true);
      if (errorCode === 'otp_expired') {
        setError('Your password reset link has expired. Please request a new one.');
      } else {
        setError(errorDesc?.replace(/\+/g, ' ') || 'Invalid reset link.');
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLinkInvalid) return;

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await authService.resetPassword(password);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <span>
      Back to{' '}
      <a href="/login" className="text-link">
        Sign in
      </a>
    </span>
  );

  return (
    <AuthCard 
      title="Reset Password" 
      subtitle={isLinkInvalid ? "Reset Link Expired" : "Enter your new password below"}
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
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 10px 0' }}>Password Updated</h3>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
            Your password has been updated successfully. You can now use your new password to sign in.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-auth btn-primary"
          >
            Continue to Login
          </button>
        </div>
      ) : (
        <div style={{ width: '100%' }}>
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

          {isLinkInvalid ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="btn-auth btn-primary"
              >
                Request New Reset Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className="form-group">
                <label htmlFor="password" className="form-label">NEW PASSWORD</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label htmlFor="confirmPassword" className="form-label">CONFIRM PASSWORD</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-auth btn-primary"
              >
                {loading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      )}
    </AuthCard>
  );
};
