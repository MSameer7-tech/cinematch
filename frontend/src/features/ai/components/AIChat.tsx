import React, { useEffect, useRef, useState } from 'react';
import { useAIChat } from '../hooks/useAIChat';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { Bot, Sparkles, FileText, RefreshCw, X, UserCheck } from 'lucide-react';

interface AIChatProps {
  userId: string;
}

const SUGGESTION_CHIPS = [
  { label: '✨ What is my taste profile?', query: 'What is my movie taste profile and persona archetype?' },
  { label: '🎬 Recommend movies based on my taste', query: 'Recommend some movies that match my taste profile' },
  { label: '🍿 Top genres & favorite directors', query: 'What are my top genres and favorite directors based on my history?' },
  { label: '🔮 Suggest something out of my comfort zone', query: 'Surprise me with a critically acclaimed movie slightly outside my typical genres' },
];

export const AIChat: React.FC<AIChatProps> = ({ userId }) => {
  const { 
    messages, 
    isTyping, 
    tasteProfile, 
    refreshTasteProfile, 
    sendMessage 
  } = useAIChat(userId);

  const endRef = useRef<HTMLDivElement>(null);
  const [showTasteModal, setShowTasteModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasteProfile();
    setIsRefreshing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-default)', position: 'relative' }}>
      {/* Top Taste Profile Bar */}
      {tasteProfile && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(11, 14, 23, 0.75)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
              flexShrink: 0
            }}>
              <Sparkles size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {tasteProfile.persona_title || 'Film Explorer'}
                </span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  {tasteProfile.critic_style || 'Taste Engine Active'}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {tasteProfile.top_genres?.slice(0, 3).map(g => `${g.name} (${g.percentage}%)`).join(' • ') || 'Personalized movie intelligence'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => setShowTasteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            >
              <FileText size={14} color="#c084fc" />
              <span>Taste Document</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div 
        className="custom-scrollbar"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px',
          paddingTop: tasteProfile ? '20px' : '60px'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
            <div style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              color: 'var(--primary-color)',
              boxShadow: '0 8px 32px rgba(168, 85, 247, 0.15)'
            }}>
              <Bot size={36} />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.02em' }}>
              CineMatch Taste AI
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, maxWidth: '480px', marginBottom: '28px' }}>
              Powered by your personal <strong style={{ color: '#c084fc' }}>Detail Engine Taste Profile</strong>. Ask for personalized picks, explore your cinematic persona, or find movies matching your unique mood.
            </p>

            {tasteProfile && (
              <div style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '28px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <UserCheck size={16} color="#a855f7" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f3f4f6' }}>
                    Active Persona: {tasteProfile.persona_title}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.5, margin: 0 }}>
                  {tasteProfile.summary}
                </p>
              </div>
            )}

            {/* Quick Suggestions Grid */}
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {SUGGESTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(chip.query)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#e5e7eb',
                    fontSize: '13px',
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>{chip.label}</span>
                  <span style={{ color: '#a855f7', opacity: 0.8, fontSize: '14px' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', 
                  backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                  color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={20} className="animate-pulse" />
                </div>
                <div style={{
                  backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                  padding: '16px', borderRadius: '16px', borderTopLeftRadius: 0,
                  display: 'flex', gap: '4px', alignItems: 'center'
                }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', animation: 'bounce 1s infinite 0ms' }} />
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', animation: 'bounce 1s infinite 150ms' }} />
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', animation: 'bounce 1s infinite 300ms' }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Suggestion Chips Bar when conversation is ongoing */}
      {messages.length > 0 && (
        <div style={{
          padding: '0 24px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          scrollbarWidth: 'none'
        }}>
          {SUGGESTION_CHIPS.slice(0, 3).map((chip, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(chip.query)}
              disabled={isTyping}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#d1d5db',
                cursor: isTyping ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                if (!isTyping) e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)';
              }}
              onMouseLeave={(e) => {
                if (!isTyping) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Input Field */}
      <div style={{ 
        padding: '16px 24px 24px', 
        background: 'linear-gradient(to top, var(--bg-default) 60%, transparent)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ChatInput onSend={sendMessage} disabled={isTyping} />
        </div>
      </div>

      {/* Taste Profile Document Modal */}
      {showTasteModal && tasteProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#111522',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), transparent)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6', margin: 0 }}>
                    User Taste Profile Document
                  </h3>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Generated by Cinematch Detail Engine
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="Recalculate taste profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e5e7eb',
                    cursor: isRefreshing ? 'wait' : 'pointer'
                  }}
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>{isRefreshing ? 'Rebuilding...' : 'Refresh Profile'}</span>
                </button>
                <button
                  onClick={() => setShowTasteModal(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div 
              className="custom-scrollbar"
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#d1d5db'
              }}
            >
              {/* Quick Persona Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.1))',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c084fc', fontWeight: 700, marginBottom: '4px' }}>
                  Cinematic Persona
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f3f4f6', marginBottom: '8px' }}>
                  {tasteProfile.persona_title}
                </div>
                <p style={{ fontSize: '13px', color: '#e5e7eb', margin: 0, lineHeight: 1.5 }}>
                  {tasteProfile.summary}
                </p>

                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Average Rating</span>
                    <strong style={{ fontSize: '15px', color: '#f3f4f6' }}>{tasteProfile.average_rating > 0 ? `${tasteProfile.average_rating.toFixed(1)}/10` : 'None'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Ratings</span>
                    <strong style={{ fontSize: '15px', color: '#f3f4f6' }}>{tasteProfile.total_ratings}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Favorites</span>
                    <strong style={{ fontSize: '15px', color: '#f3f4f6' }}>{tasteProfile.total_favorites}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Watchlist</span>
                    <strong style={{ fontSize: '15px', color: '#f3f4f6' }}>{tasteProfile.total_watchlist}</strong>
                  </div>
                </div>
              </div>

              {/* Formatted Markdown Taste Document View */}
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '18px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontFamily: 'monospace',
                fontSize: '12.5px',
                whiteSpace: 'pre-wrap',
                color: '#e2e8f0',
                lineHeight: 1.6
              }}>
                {tasteProfile.taste_document_text}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}>
              <button
                onClick={() => {
                  setShowTasteModal(false);
                  sendMessage('Analyze my taste profile and explain why my persona was chosen.');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--primary-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={16} />
                <span>Discuss Profile with AI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
