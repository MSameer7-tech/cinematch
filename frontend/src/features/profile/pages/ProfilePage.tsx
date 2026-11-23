import type { FC } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useWatchlist } from '../../library/hooks/useWatchlist';
import { useFavorites } from '../../library/hooks/useFavorites';
import { User, Mail, Calendar, Bookmark, Heart, LogOut, Sparkles, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: FC = () => {
  const { session, user, logout } = useAuth();
  const { data: watchlist } = useWatchlist();
  const { data: favorites } = useFavorites();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Recently joined';

  const userEmail = user?.email || session?.user?.email || 'user@example.com';
  const userName = userEmail.split('@')[0];

  return (
    <div className="page-container" style={{ padding: '100px 40px 60px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="section-title" style={{ marginBottom: '32px' }}>Your Profile</h1>

      {/* Main Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '32px'
        }}
      >
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-color-hover))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
            flexShrink: 0
          }}>
            <User size={56} color="#fff" />
          </div>

          {/* User Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', textTransform: 'capitalize' }}>
              {userName}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Mail size={16} />
                <span>{userEmail}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Calendar size={16} />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/watchlist')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Watchlist</span>
            <Bookmark size={20} color="var(--primary-color)" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800 }}>{watchlist?.length || 0}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Movies saved</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/favorites')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Favorites</span>
            <Heart size={20} color="#ec4899" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800 }}>{favorites?.length || 0}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loved movies</div>
        </motion.div>
      </div>

      {/* Taste Calibration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(124, 58, 237, 0.03) 100%)',
          borderRadius: '20px',
          padding: '24px 28px',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '480px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}
          >
            <Sparkles size={24} color="#c084fc" />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px', color: '#f3f4f6' }}>
              Cinematic Taste Calibration
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.45 }}>
              Recalibrate your preferred vibes, foundation anchor films, and persona archetype to fine-tune AI recommendations.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 22px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(168, 85, 247, 0.35)',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(168, 85, 247, 0.35)';
          }}
        >
          <SlidersHorizontal size={15} />
          <span>Launch Calibration</span>
        </button>
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '16px',
            backgroundColor: 'transparent',
            border: '1px solid var(--danger-color)',
            borderRadius: '12px',
            color: 'var(--danger-color)',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger-color)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--danger-color)';
          }}
        >
          <LogOut size={20} />
          Sign Out of CineMatch
        </button>
      </motion.div>
    </div>
  );
};
