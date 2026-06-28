import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PasswordInput } from './PasswordInput';
import { GoogleButton } from './GoogleButton';
import { Divider } from './Divider';

export const RegisterForm: FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({ email, password, displayName });
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
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
        <label htmlFor="displayName" className="form-label">DISPLAY NAME</label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Doe"
          disabled={loading}
          required
          className="auth-input"
        />
      </div>

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

      <div className="form-group">
        <label htmlFor="password" className="form-label">PASSWORD</label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          disabled={loading}
          required
        />
      </div>

      <div className="form-group" style={{ marginBottom: '28px' }}>
        <label htmlFor="confirmPassword" className="form-label">CONFIRM PASSWORD</label>
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
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
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <Divider />

      <GoogleButton onClick={handleGoogleLogin} disabled={loading} />
    </form>
  );
};
