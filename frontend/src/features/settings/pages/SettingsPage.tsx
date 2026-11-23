import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { Settings, Bell, Shield, Smartphone, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsPage: FC = () => {
  const { user, guest } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy'>('general');
  const userEmail = (user as any)?.email || user?.displayName || (guest ? 'Guest Session' : 'user@example.com');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ] as const;

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
