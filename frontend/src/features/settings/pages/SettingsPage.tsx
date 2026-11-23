import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  Settings, 
  Bell, 
  Shield, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  MessageSquare,
  BarChart2,
  Film
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { aiApi } from '../../ai/api/ai.api';
import type { TasteProfile } from '../../ai/types/ai.types';

export const SettingsPage: FC = () => {
  const { user, guest } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'taste-document' | 'notifications' | 'privacy'>('general');
  const userEmail = (user as any)?.email || user?.displayName || (guest ? 'Guest Session' : 'user@example.com');
  const userId = user?.id || (guest as any)?.sessionId || (guest as any)?.guestId || (guest as any)?.id || 'guest-user';

  // Taste Document State
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [isLoadingTaste, setIsLoadingTaste] = useState(false);
  const [isRefreshingTaste, setIsRefreshingTaste] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'taste-document', label: 'Taste Document', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ] as const;

  // Load Taste Profile when tab is selected
  useEffect(() => {
    if (activeTab === 'taste-document' && !tasteProfile && !isLoadingTaste) {
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
      toast.success('Taste Document updated from your recent activity!');
    } catch (err) {
      console.error('Failed to refresh taste profile:', err);
      toast.error('Failed to refresh taste profile');
    } finally {
      setIsRefreshingTaste(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '100px 40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="section-title" style={{ marginBottom: '40px' }}>Settings</h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div style={{ width: '240px', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: isActive ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ flex: 1, minWidth: '300px' }}
        >
          <div style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Account Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Email Address</label>
                      <input 
                        type="text" 
                        value={userEmail} 
                        disabled 
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: 'var(--text-secondary)',
                          cursor: 'not-allowed'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
                        Email cannot be changed right now.
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>App Preferences</h3>
                  
                  {/* Taste Calibration */}
                  <div
                    onClick={() => navigate('/onboarding')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '14px',
                      background: 'rgba(168, 85, 247, 0.08)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      cursor: 'pointer',
                      marginBottom: '16px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.13)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.2)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: 'rgba(168, 85, 247, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Sparkles size={18} color="#c084fc" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f3f4f6' }}>Cinematic Taste Calibration</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)' }}>
                          Recalibrate your preferred genres, foundation films & persona archetype
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="rgba(255, 255, 255, 0.5)" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>High Quality Posters</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Download full resolution movie posters</div>
                    </div>
                    <div style={{ 
                      width: '44px', height: '24px', borderRadius: '12px', backgroundColor: 'var(--primary-color)', 
                      position: 'relative', cursor: 'pointer' 
                    }}>
                      <div style={{ 
                        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', 
                        position: 'absolute', top: '2px', right: '2px' 
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Taste Document Tab */}
            {activeTab === 'taste-document' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#f3f4f6', margin: '0 0 6px 0' }}>Cinematic Taste Document</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, maxWidth: '520px', lineHeight: 1.5 }}>
                      Your personalized AI Taste Profile synthesized from your ratings, watchlist, favorites, and cinematic preferences.
                    </p>
                  </div>
                  <button
                    onClick={handleRefreshTaste}
                    disabled={isRefreshingTaste || isLoadingTaste}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(168, 85, 247, 0.12)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      color: '#c084fc',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isRefreshingTaste || isLoadingTaste ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isRefreshingTaste || isLoadingTaste ? 0.6 : 1
                    }}
                  >
                    <RefreshCw size={14} className={isRefreshingTaste ? 'animate-spin' : ''} />
                    <span>{isRefreshingTaste ? 'Updating...' : 'Refresh Document'}</span>
                  </button>
                </div>

                {isLoadingTaste ? (
                  <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                    <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                    <p style={{ margin: 0 }}>Synthesizing your cinematic taste document...</p>
                  </div>
                ) : tasteProfile ? (
                  <>
                    {/* Persona Archetype Card */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(99, 102, 241, 0.08))',
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      borderRadius: '18px',
                      padding: '24px',
                      boxShadow: 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Sparkles size={16} color="#c084fc" />
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c084fc', fontWeight: 700 }}>
                          Active Persona
                        </span>
                        {tasteProfile.critic_style && (
                          <span style={{
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            color: '#e2e8f0',
                            marginLeft: 'auto'
                          }}>
                            {tasteProfile.critic_style}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                        {tasteProfile.persona_title || 'Film Connoisseur'}
                      </div>
                      <p style={{ fontSize: '14px', color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
                        {tasteProfile.summary || 'Your personalized cinema profile evolves as you rate, favorite, and browse movies.'}
                      </p>

                      {/* Taste Stats Row */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
                        gap: '16px', 
                        marginTop: '20px', 
                        paddingTop: '16px', 
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)' 
                      }}>
                        <div>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Average Rating</span>
                          <strong style={{ fontSize: '16px', color: '#f8fafc' }}>
                            {tasteProfile.average_rating > 0 ? `${tasteProfile.average_rating.toFixed(1)}/10` : 'None'}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Total Ratings</span>
                          <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{tasteProfile.total_ratings}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Favorites</span>
                          <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{tasteProfile.total_favorites}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Watchlist</span>
                          <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{tasteProfile.total_watchlist}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Top Genres Breakdown */}
                    {tasteProfile.top_genres && tasteProfile.top_genres.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <BarChart2 size={16} color="#c084fc" />
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Top Genre Affinities
                          </h4>
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
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                fontSize: '13px',
                                color: '#e2e8f0'
                              }}
                            >
                              <Film size={14} color="#a855f7" />
                              <span style={{ fontWeight: 500 }}>{g.name}</span>
                              {g.percentage > 0 && (
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>{Math.round(g.percentage)}%</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Raw AI Taste Dossier Document */}
                    {tasteProfile.taste_document_text && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <FileText size={16} color="#c084fc" />
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Synthesized AI Taste Document
                          </h4>
                        </div>
                        <div style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '14px',
                          padding: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontSize: '13px',
                          whiteSpace: 'pre-wrap',
                          color: '#e2e8f0',
                          lineHeight: 1.6,
                          maxHeight: '320px',
                          overflowY: 'auto'
                        }} className="custom-scrollbar">
                          {tasteProfile.taste_document_text}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                      <button
                        onClick={() => navigate('/ai-picks')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: 'var(--primary-color)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <MessageSquare size={16} />
                        <span>Discuss Taste Profile with CineMatch AI</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '16px',
                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                  }}>
                    <FileText size={36} color="rgba(255, 255, 255, 0.3)" style={{ margin: '0 auto 14px' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', margin: '0 0 8px 0' }}>No Taste Profile Generated Yet</h4>
                    <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                      Start rating movies, saving favorites, or complete your onboarding taste calibration to generate your personalized dossier.
                    </p>
                    <button
                      onClick={() => navigate('/onboarding')}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'var(--primary-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Calibrate Taste Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Email Notifications</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Weekly Recommendations</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Get a weekly email with tailored AI Picks</div>
                  </div>
                  <div style={{ 
                    width: '44px', height: '24px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', 
                    position: 'relative', cursor: 'pointer' 
                  }}>
                    <div style={{ 
                      width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', 
                      position: 'absolute', top: '2px', left: '2px' 
                    }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>New Features & Updates</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Hear about new CineMatch features</div>
                  </div>
                  <div style={{ 
                    width: '44px', height: '24px', borderRadius: '12px', backgroundColor: 'var(--primary-color)', 
                    position: 'relative', cursor: 'pointer' 
                  }}>
                    <div style={{ 
                      width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', 
                      position: 'absolute', top: '2px', right: '2px' 
                    }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Security</h3>
                  <button style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px', color: '#fff', cursor: 'pointer'
                  }}>
                    <span style={{ fontWeight: 500 }}>Change Password</span>
                    <ChevronRight size={18} color="var(--text-secondary)" />
                  </button>
                </div>
                
                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--danger-color)' }}>Danger Zone</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button style={{
                    padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid var(--danger-color)',
                    borderRadius: '8px', color: 'var(--danger-color)', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
