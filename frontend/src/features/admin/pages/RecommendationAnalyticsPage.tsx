import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, BarChart3, Users, Filter, ArrowRight } from 'lucide-react';

interface AnalyticsData {
  cache_stats: {
    cache_hits: number;
    cache_misses: number;
    hit_rate_percent: number;
    current_entries: number;
    expired_entries_cleaned: number;
  };
  funnel: {
    generated: number;
    shown: number;
    clicked: number;
    watchlisted: number;
    rated: number;
    liked: number;
  };
  score_distribution: Record<string, number>;
  top_genres: string[];
  worst_genres: string[];
}

export const RecommendationAnalyticsPage: FC = () => {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Require manual admin key entry (never embed admin secrets in VITE_* env vars)

  const handleLogin = async (key: string = adminKey) => {
    setLoading(true);
    setError('');
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${baseUrl}/recommendations/analytics`, {
        headers: { 'X-Admin-Key': key }
      });
      if (!res.ok) throw new Error('Unauthorized or Server Error');
      const json = await res.json();
      setData(json);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-default)', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ padding: '32px', backgroundColor: 'var(--bg-surface)', borderRadius: '16px', maxWidth: '400px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--accent-primary)' }}>
              <Lock size={48} />
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Admin Access Required</h2>
            <input 
              type="password" 
              value={adminKey} 
              onChange={e => setAdminKey(e.target.value)}
              placeholder="Enter Admin Secret Key"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'white',
                marginBottom: '16px'
              }}
            />
            {error && <p style={{ color: 'var(--error)', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
            <button 
              onClick={() => handleLogin()}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Authenticating...' : 'View Analytics'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  const funnelMax = data.funnel.generated;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-default)', paddingBottom: '64px' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={32} color="var(--accent-primary)" />
          Recommendation Analytics
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Cache Stats */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} /> Cache Performance
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Hit Rate:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{data.cache_stats.hit_rate_percent}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Hits / Misses:</span>
              <span>{data.cache_stats.cache_hits} / {data.cache_stats.cache_misses}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Entries:</span>
              <span>{data.cache_stats.current_entries}</span>
            </div>
          </div>

          {/* Genres */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Genre Performance</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Top Performing</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {data.top_genres.map(g => (
                  <span key={g} style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>{g}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Worst Performing</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {data.worst_genres.map(g => (
                  <span key={g} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Conversion Funnel</h2>
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '32px', borderRadius: '16px', marginBottom: '32px' }}>
          {Object.entries(data.funnel).map(([step, count], idx) => {
            const percentage = Math.round((count / funnelMax) * 100) || 0;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
                <div style={{ width: '120px', textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  {step}
                </div>
                <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    style={{ height: '100%', backgroundColor: 'var(--accent-primary)' }}
                  />
                </div>
                <div style={{ width: '60px', textAlign: 'right', fontWeight: 'bold' }}>
                  {count}
                </div>
                <div style={{ width: '60px', textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
