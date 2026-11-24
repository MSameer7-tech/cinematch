import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  Sliders, 
  Sparkles, 
  HardDrive, 
  ChevronRight, 
  RefreshCw, 
  MessageSquare,
  BarChart2,
  Film,
  Copy,
  Check,
  Download,
  Trash2,
  RotateCcw,
  User,
  ShieldCheck,
  Globe,
  Tv,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../../ai/api/ai.api';
import type { TasteProfile } from '../../ai/types/ai.types';
import './SettingsPage.css';

type SettingsTab = 'preferences' | 'taste-profile' | 'account-data';

export const SettingsPage: FC = () => {
  const { user, guest, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<SettingsTab>('preferences');
  const userEmail = (user as any)?.email || user?.displayName || (guest ? 'Guest Session' : 'user@example.com');
  const userId = user?.id || (guest as any)?.sessionId || (guest as any)?.guestId || (guest as any)?.id || 'guest-user';
  const isGuest = Boolean(!user && guest);

  // Preference States (Persisted in localStorage)
  const [highQualityPosters, setHighQualityPosters] = useState<boolean>(() => {
    return localStorage.getItem('cinematch_hq_posters') !== 'false';
  });

  const [autoPlayTrailers, setAutoPlayTrailers] = useState<boolean>(() => {
    return localStorage.getItem('cinematch_autoplay_trailers') !== 'false';
  });

  const [trailerSound, setTrailerSound] = useState<boolean>(() => {
    return localStorage.getItem('cinematch_trailer_sound') === 'true';
  });

  const [contentRegion, setContentRegion] = useState<'all' | 'bollywood' | 'international'>(() => {
    return (localStorage.getItem('cinematch_content_region') as any) || 'all';
  });

  const [includeMature, setIncludeMature] = useState<boolean>(() => {
    return localStorage.getItem('cinematch_include_mature') !== 'false';
  });

  // Taste Profile State
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [isLoadingTaste, setIsLoadingTaste] = useState(false);
  const [isRefreshingTaste, setIsRefreshingTaste] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);

  // Toggle Handlers with Toasts & Persistence
  const handleToggleHqPosters = () => {
    const nextVal = !highQualityPosters;
    setHighQualityPosters(nextVal);
    localStorage.setItem('cinematch_hq_posters', String(nextVal));
    toast.success(nextVal ? 'High quality posters enabled (original assets)' : 'Standard posters enabled (bandwidth saver)');
  };

  const handleToggleAutoPlay = () => {
    const nextVal = !autoPlayTrailers;
    setAutoPlayTrailers(nextVal);
    localStorage.setItem('cinematch_autoplay_trailers', String(nextVal));
    toast.success(nextVal ? 'Auto-play trailers enabled' : 'Auto-play trailers disabled');
  };

  const handleToggleTrailerSound = () => {
    const nextVal = !trailerSound;
    setTrailerSound(nextVal);
    localStorage.setItem('cinematch_trailer_sound', String(nextVal));
    toast.success(nextVal ? 'Trailer sound unmuted by default' : 'Trailers muted by default');
  };

  const handleChangeRegion = (val: 'all' | 'bollywood' | 'international') => {
    setContentRegion(val);
    localStorage.setItem('cinematch_content_region', val);
    const label = val === 'bollywood' ? 'Bollywood & Indian Cinema' : val === 'international' ? 'Hollywood & International' : 'Global Cinema';
    toast.success(`Content region set to ${label}`);
  };

  const handleToggleMature = () => {
    const nextVal = !includeMature;
    setIncludeMature(nextVal);
    localStorage.setItem('cinematch_include_mature', String(nextVal));
    toast.success(nextVal ? 'Mature / R-Rated content included' : 'Family-friendly filter enabled');
  };

  // Load Taste Profile on Mount or Tab Change
  useEffect(() => {
    if (activeTab === 'taste-profile' && !tasteProfile && !isLoadingTaste) {
      setIsLoadingTaste(true);
      aiApi.getTasteProfile(userId)
        .then(profile => setTasteProfile(profile))
        .catch(err => {
          console.error('Failed to load taste profile:', err);
        })
        .finally(() => setIsLoadingTaste(false));
    }
  }, [activeTab, userId, tasteProfile, isLoadingTaste]);

  const handleRefreshTaste = async () => {
    if (isRefreshingTaste) return;
    setIsRefreshingTaste(true);
    try {
      const refreshed = await aiApi.refreshTasteProfile(userId);
      setTasteProfile(refreshed);
      toast.success('Taste Document updated from your recent ratings & favorites!');
    } catch (err) {
      console.error('Failed to refresh taste profile:', err);
      toast.error('Failed to refresh taste profile');
    } finally {
      setIsRefreshingTaste(false);
    }
  };

  const handleCopyDossier = () => {
    if (!tasteProfile?.taste_document_text) return;
    navigator.clipboard.writeText(tasteProfile.taste_document_text);
    setCopiedDossier(true);
    toast.success('AI Taste Document copied to clipboard!');
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  // Storage / Data Handlers
  const handleClearSearchHistory = () => {
    localStorage.removeItem('cinematch_recent_searches');
    toast.success('Recent search history cleared');
  };

  const handleClearCache = () => {
    queryClient.clear();
    toast.success('Application query cache refreshed');
  };

  const handleExportData = () => {
    const exportObject = {
      user: {
        id: userId,
        email: userEmail,
        isGuest,
      },
      exportedAt: new Date().toISOString(),
      preferences: {
        highQualityPosters,
        autoPlayTrailers,
        trailerSound,
        contentRegion,
        includeMature,
      },
      tasteProfile: tasteProfile || null,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cinematch_profile_${userId.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CineMatch profile data exported as JSON');
  };

  const handleResetDefaults = () => {
    setHighQualityPosters(true);
    setAutoPlayTrailers(true);
    setTrailerSound(false);
    setContentRegion('all');
    setIncludeMature(true);
    localStorage.setItem('cinematch_hq_posters', 'true');
    localStorage.setItem('cinematch_autoplay_trailers', 'true');
    localStorage.setItem('cinematch_trailer_sound', 'false');
    localStorage.setItem('cinematch_content_region', 'all');
    localStorage.setItem('cinematch_include_mature', 'true');
    toast.success('All settings reset to default');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const tabs = [
    { id: 'preferences' as const, label: 'General & Playback', icon: Sliders },
    { id: 'taste-profile' as const, label: 'AI Taste Profile', icon: Sparkles },
    { id: 'account-data' as const, label: 'Account & Storage', icon: HardDrive },
  ];

  return (
    <div className="settings-page-wrapper">
      {/* Header */}
      <div className="settings-header">
        <h1 className="settings-title">Settings & Preferences</h1>
        <p className="settings-subtitle">
          Manage playback, curate your cinema experience, and review your AI Taste Profile.
        </p>
      </div>

      <div className="settings-layout">
        {/* Navigation Sidebar */}
        <aside className="settings-nav-container">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`settings-nav-btn ${isActive ? 'active' : ''}`}
                type="button"
              >
                {isActive && (
                  <motion.div
                    layoutId="settings-active-pill"
                    className="settings-nav-active-indicator"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="settings-nav-content">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="settings-panel-card">
                {/* 1. General & Playback Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    {/* Account Overview Header Box */}
                    <div className="settings-section-header">
                      <h2 className="settings-section-title">Playback & Viewing Preferences</h2>
                      <p className="settings-section-desc">
                        Customize video playback behavior, image rendering quality, and regional content curation.
                      </p>
                    </div>

                    {/* Cinematic Taste Calibration Quick Banner */}
                    <div
                      onClick={() => navigate('/onboarding')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 22px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(99, 102, 241, 0.08))',
                        border: '1px solid rgba(168, 85, 247, 0.28)',
                        cursor: 'pointer',
                        marginBottom: '28px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(99, 102, 241, 0.12))';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.45)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(99, 102, 241, 0.08))';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.28)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'rgba(168, 85, 247, 0.22)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 16px rgba(168, 85, 247, 0.25)',
                          }}
                        >
                          <Sparkles size={20} color="#c084fc" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '15px' }}>
                            Cinematic Taste Calibration
                          </div>
                          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
                            Recalibrate your preferred genres, favorite foundation films & persona archetype
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={20} color="rgba(255, 255, 255, 0.6)" />
                    </div>

                    {/* Group: Media & Streaming */}
                    <div className="settings-group">
                      <div className="settings-row">
                        <div>
                          <div className="settings-row-label">High-Resolution Artwork</div>
                          <div className="settings-row-desc">
                            Download full-resolution original movie posters and backdrops for sharp displays.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleHqPosters}
                          className={`settings-switch ${highQualityPosters ? 'active' : ''}`}
                          aria-label="Toggle High Resolution Artwork"
                        >
                          <span className="settings-switch-thumb" />
                        </button>
                      </div>

                      <div className="settings-row">
                        <div>
                          <div className="settings-row-label">Auto-Play Movie Trailers</div>
                          <div className="settings-row-desc">
                            Automatically stream official trailers when opening movie details or hero banners.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleAutoPlay}
                          className={`settings-switch ${autoPlayTrailers ? 'active' : ''}`}
                          aria-label="Toggle Auto-Play Trailers"
                        >
                          <span className="settings-switch-thumb" />
                        </button>
                      </div>

                      <div className="settings-row">
                        <div>
                          <div className="settings-row-label">Unmute Trailer Audio by Default</div>
                          <div className="settings-row-desc">
                            Start trailer playback with audio enabled rather than muted.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleTrailerSound}
                          className={`settings-switch ${trailerSound ? 'active' : ''}`}
                          aria-label="Toggle Trailer Audio"
                        >
                          <span className="settings-switch-thumb" />
                        </button>
                      </div>
                    </div>

                    {/* Group: Curation & Regional Preferences */}
                    <div className="settings-group">
                      <div className="settings-row">
                        <div>
                          <div className="settings-row-label">Primary Cinema Focus</div>
                          <div className="settings-row-desc">
                            Tailor homepage carousels and discover suggestions to your preferred regional cinema.
                          </div>
                        </div>
                        <div className="settings-pills-container">
                          <button
                            type="button"
                            onClick={() => handleChangeRegion('all')}
                            className={`settings-pill ${contentRegion === 'all' ? 'active' : ''}`}
                          >
                            All Global
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeRegion('bollywood')}
                            className={`settings-pill ${contentRegion === 'bollywood' ? 'active' : ''}`}
                          >
                            Bollywood & Indian
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeRegion('international')}
                            className={`settings-pill ${contentRegion === 'international' ? 'active' : ''}`}
                          >
                            Hollywood & Western
                          </button>
                        </div>
                      </div>

                      <div className="settings-row">
                        <div>
                          <div className="settings-row-label">Include Mature Content</div>
                          <div className="settings-row-desc">
                            Allow R-rated, TV-MA, and intense psychological thrillers in recommendations.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleMature}
                          className={`settings-switch ${includeMature ? 'active' : ''}`}
                          aria-label="Toggle Mature Content"
                        >
                          <span className="settings-switch-thumb" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AI Taste Profile Tab */}
                {activeTab === 'taste-profile' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                      <div className="settings-section-header" style={{ marginBottom: 0 }}>
                        <h2 className="settings-section-title">Cinematic Taste Document</h2>
                        <p className="settings-section-desc">
                          Your synthesized AI Persona, taste metrics, and prompt dossier generated from your film interactions.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRefreshTaste}
                        disabled={isRefreshingTaste || isLoadingTaste}
                        className="settings-btn-secondary"
                        style={{ color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                      >
                        <RefreshCw size={14} className={isRefreshingTaste ? 'animate-spin' : ''} />
                        <span>{isRefreshingTaste ? 'Synthesizing...' : 'Refresh Document'}</span>
                      </button>
                    </div>

                    {isLoadingTaste ? (
                      <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: '#a855f7' }} />
                        <p style={{ margin: 0, fontSize: '15px' }}>Synthesizing your cinematic taste dossier...</p>
                      </div>
                    ) : tasteProfile ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Persona Archetype Hero Card */}
                        <div
                          style={{
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.14) 0%, rgba(99, 102, 241, 0.08) 100%)',
                            border: '1px solid rgba(168, 85, 247, 0.28)',
                            borderRadius: '20px',
                            padding: '28px',
                            boxShadow: '0 8px 32px rgba(168, 85, 247, 0.12)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Sparkles size={18} color="#c084fc" />
                              <span style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c084fc', fontWeight: 700 }}>
                                Active Persona
                              </span>
                            </div>
                            {tasteProfile.critic_style && (
                              <span
                                style={{
                                  fontSize: '11.5px',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  color: '#e2e8f0',
                                  fontWeight: 500,
                                }}
                              >
                                {tasteProfile.critic_style}
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                            {tasteProfile.persona_title || 'Film Connoisseur'}
                          </div>
                          <p style={{ fontSize: '14.5px', color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
                            {tasteProfile.summary || 'Your cinema taste profile actively evolves based on your ratings, library, and watch habits.'}
                          </p>

                          {/* Stats Grid */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                              gap: '16px',
                              marginTop: '24px',
                              paddingTop: '20px',
                              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Average Rating</span>
                              <strong style={{ fontSize: '18px', color: '#f8fafc' }}>
                                {Number(tasteProfile.average_rating) > 0 ? `${Number(tasteProfile.average_rating).toFixed(1)}/10` : 'None'}
                              </strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Total Ratings</span>
                              <strong style={{ fontSize: '18px', color: '#f8fafc' }}>{tasteProfile.total_ratings ?? 0}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Favorites</span>
                              <strong style={{ fontSize: '18px', color: '#f8fafc' }}>{tasteProfile.total_favorites ?? 0}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Watchlist</span>
                              <strong style={{ fontSize: '18px', color: '#f8fafc' }}>{tasteProfile.total_watchlist ?? 0}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Top Genres Breakdown */}
                        {tasteProfile.top_genres && tasteProfile.top_genres.length > 0 && (
                          <div className="settings-group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                              <BarChart2 size={16} color="#c084fc" />
                              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Top Genre Affinities
                              </h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              {tasteProfile.top_genres.map((g, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 14px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    fontSize: '13px',
                                    color: '#e2e8f0',
                                  }}
                                >
                                  <Film size={14} color="#a855f7" />
                                  <span style={{ fontWeight: 600 }}>{g.name}</span>
                                  {g.percentage > 0 && (
                                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{Math.round(g.percentage)}%</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Raw AI Taste Dossier */}
                        {tasteProfile.taste_document_text && (
                          <div className="settings-group">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={16} color="#c084fc" />
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Synthesized AI Prompt Dossier
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={handleCopyDossier}
                                className="settings-btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                {copiedDossier ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                                <span>{copiedDossier ? 'Copied' : 'Copy Dossier'}</span>
                              </button>
                            </div>
                            <div
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                borderRadius: '14px',
                                padding: '20px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                fontSize: '13px',
                                whiteSpace: 'pre-wrap',
                                color: '#e2e8f0',
                                lineHeight: 1.6,
                                maxHeight: '280px',
                                overflowY: 'auto',
                              }}
                              className="custom-scrollbar"
                            >
                              {tasteProfile.taste_document_text}
                            </div>
                          </div>
                        )}

                        {/* Action Link to AI Chat */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => navigate('/ai-picks')}
                            className="settings-btn-primary"
                          >
                            <MessageSquare size={16} />
                            <span>Discuss Taste Profile with CineMatch AI</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '48px 24px',
                          textAlign: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '18px',
                          border: '1px dashed rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Sparkles size={36} color="rgba(168, 85, 247, 0.5)" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#f3f4f6', margin: '0 0 8px 0' }}>
                          No Taste Profile Generated Yet
                        </h3>
                        <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                          Rate films, save favorites, or take the interactive taste calibration to establish your unique cinematic identity.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/onboarding')}
                          className="settings-btn-primary"
                        >
                          Calibrate Taste Profile
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Account & Storage Tab */}
                {activeTab === 'account-data' && (
                  <div>
                    <div className="settings-section-header">
                      <h2 className="settings-section-title">Account & Local Storage</h2>
                      <p className="settings-section-desc">
                        Review account session identity, export data, and manage browser storage.
                      </p>
                    </div>

                    {/* Account Identity Card */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '24px',
                        borderRadius: '18px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7C3AED 0%, #a855f7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '20px',
                            fontWeight: 700,
                            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
                          }}
                        >
                          {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                              {user?.displayName || userEmail}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: isGuest ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                color: isGuest ? '#facc15' : '#4ade80',
                                border: isGuest ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                              }}
                            >
                              {isGuest ? 'Guest Session' : 'Verified Member'}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                            {isGuest ? 'Preferences and ratings saved in local session.' : 'Preferences synchronized with Supabase.'}
                          </div>
                        </div>
                      </div>

                      {isGuest ? (
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="settings-btn-primary"
                        >
                          Sign In / Register
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="settings-btn-secondary"
                        >
                          Sign Out
                        </button>
                      )}
                    </div>

                    {/* Data & Storage Management */}
                    <div className="settings-group">
                      <div className="settings-row">
                        <div>
                          <div className="settings-row-label">Clear Search History</div>
                          <div className="settings-row-desc">
                            Remove cached queries and previous search terms from the dropdown.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearSearchHistory}
                          className="settings-btn-secondary"
                        >
                          <Trash2 size={14} />
                          <span>Clear Searches</span>
                        </button>
                      </div>

                      <div className="settings-row">
                        <div>
                          <div className="settings-row-label">Refresh Application Cache</div>
                          <div className="settings-row-desc">
                            Invalidate in-memory React Query cache and re-fetch freshest movie data.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearCache}
                          className="settings-btn-secondary"
                        >
                          <RefreshCw size={14} />
                          <span>Clear Cache</span>
                        </button>
                      </div>

                      <div className="settings-row">
                        <div>
                          <div className="settings-row-label">Export CineMatch Profile (JSON)</div>
                          <div className="settings-row-desc">
                            Download a portable JSON archive of your taste profile, preferences, and ratings.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleExportData}
                          className="settings-btn-secondary"
                        >
                          <Download size={14} />
                          <span>Export JSON</span>
                        </button>
                      </div>
                    </div>

                    {/* Danger / Reset Zone */}
                    <div className="settings-group" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                      <div className="settings-row">
                        <div>
                          <div className="settings-row-label" style={{ color: '#f87171' }}>
                            Reset All Preferences
                          </div>
                          <div className="settings-row-desc">
                            Restore default resolution, region, audio, and content settings.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetDefaults}
                          className="settings-btn-danger"
                        >
                          <RotateCcw size={14} />
                          <span>Reset to Default</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
