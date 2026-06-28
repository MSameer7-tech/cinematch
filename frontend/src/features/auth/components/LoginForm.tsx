import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PasswordInput } from './PasswordInput';
import { GoogleButton } from './GoogleButton';
import { GuestButton } from './GuestButton';
import { Divider } from './Divider';

export const LoginForm: FC = () => {
  const { login, loginWithGoogle, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google.');
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await continueAsGuest();
    } catch (err: any) {
      setError(err?.message || 'Failed to access guest session.');
      setLoading(false);
    }
  };

  return (
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

      <div className="form-group">
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

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label htmlFor="password" className="form-label">PASSWORD</label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
          required
        />
        <div style={{ textAlign: 'right', marginTop: '8px' }}>
          <a href="/forgot-password" className="text-link" style={{ fontSize: '13px' }}>
            Forgot password?
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-auth btn-primary"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <Divider />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <GoogleButton onClick={handleGoogleLogin} disabled={loading} />
        <GuestButton onClick={handleGuestLogin} disabled={loading} />
      </div>
    </form>
  );
};
