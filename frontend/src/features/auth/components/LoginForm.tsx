import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { PasswordInput } from './PasswordInput';
import { GoogleButton } from './GoogleButton';
import { GuestButton } from './GuestButton';
import { Divider } from './Divider';

export const LoginForm: FC = () => {
  const { login, loginWithGoogle, continueAsGuest, isSubmitting } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);

    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google.');
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    try {
      await continueAsGuest();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Failed to access guest session.');
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
        <div className="input-container">
          <Mail
            size={15}
            strokeWidth={1.75}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#A6A1B5',
              pointerEvents: 'none',
            }}
          />
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isSubmitting}
            required
            className="auth-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
          <label htmlFor="password" className="form-label" style={{ marginBottom: 0 }}>PASSWORD</label>
          <a
            href="/forgot-password"
            className="text-link"
            style={{ fontSize: '12px', fontWeight: 500, color: '#B36BFF' }}
          >
            Forgot password?
          </a>
        </div>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={isSubmitting}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-auth btn-primary"
      >
        <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
        {!isSubmitting && <ArrowRight size={16} />}
      </button>

      <Divider />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <GoogleButton onClick={handleGoogleLogin} disabled={isSubmitting} />
        <GuestButton onClick={handleGuestLogin} disabled={isSubmitting} />
      </div>
    </form>
  );
};
