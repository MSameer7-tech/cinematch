import { useState } from 'react';
import type { FC } from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthDebugPage: FC = () => {
  const { user, guest, authState, loading, login, logout, continueAsGuest, refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
  };

  const handleGuest = async () => {
    setError(null);
    try {
      await continueAsGuest();
    } catch (err: any) {
      setError(err?.message || 'Guest session failed');
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await logout();
    } catch (err: any) {
      setError(err?.message || 'Logout failed');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', textAlign: 'left', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '32px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
        🔑 Auth Debug Console
      </h1>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--error-color)', borderRadius: '6px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Side: Current State */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>Status & Session</h2>
          <div>
            <strong>Loading Status:</strong> {loading ? '⏳ Yes (LOADING)' : '✅ No'}
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>AuthState Status:</strong> <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{authState.status}</span>
          </div>
          <div style={{ marginTop: '16px' }}>
            <strong>Active Cookies:</strong>
            <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px' }}>
              {document.cookie || '(No cookies found)'}
            </pre>
          </div>
          <div style={{ marginTop: '16px' }}>
            <button onClick={refreshSession} className="btn-auth btn-social" style={{ padding: '8px 16px', fontSize: '13px' }}>
              🔄 Force Sync / Refresh Session
            </button>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>Trigger Actions</h2>
          
          <form onSubmit={handleLogin} style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Email Login Test</h3>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="auth-input" 
              style={{ marginBottom: '8px', padding: '8px' }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="auth-input" 
              style={{ marginBottom: '8px', padding: '8px' }}
            />
            <button type="submit" className="btn-auth btn-primary" style={{ padding: '8px', fontSize: '14px' }}>
              Login with Email
            </button>
          </form>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleGuest} className="btn-auth btn-social" style={{ padding: '8px', fontSize: '14px', flex: 1 }}>
              👥 Continue as Guest
            </button>
            <button onClick={handleLogout} className="btn-auth btn-guest" style={{ padding: '8px', fontSize: '14px', flex: 1 }}>
              🚪 Log Out
            </button>
          </div>
        </div>
      </div>

      {/* JSON Viewer */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>Raw Auth State data</h2>
        <div>
          <strong>User Profile (AppUser):</strong>
          <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', overflowX: 'auto', fontSize: '12px' }}>
            {user ? JSON.stringify(user, null, 2) : 'null'}
          </pre>
        </div>
        <div style={{ marginTop: '16px' }}>
          <strong>Guest Session (GuestUser):</strong>
          <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', overflowX: 'auto', fontSize: '12px' }}>
            {guest ? JSON.stringify(guest, null, 2) : 'null'}
          </pre>
        </div>
      </div>
    </div>
  );
};
