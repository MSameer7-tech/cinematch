import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Film, 
  Send, 
  AtSign, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Play, 
  Bookmark, 
  Check, 
  Info, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  X, 
  UserCheck 
} from 'lucide-react';
import { toast } from 'sonner';

import { useAIChat } from '../hooks/useAIChat';
import { useWatchlist, useToggleWatchlist } from '../../library/hooks/useWatchlist';
import { TrailerModal } from '../../movies/components/details/TrailerModal';
import { getPosterUrl } from '../../movies/utils/image';
import { IMAGE_SIZES } from '../../movies/constants/images';

import './AIChat.css';

interface AIChatProps {
  userId: string;
}

const REFERENCE_SUGGESTION_PILLS = [
  { emoji: '🎬', label: 'Thriller movies', query: 'Suggest some gripping, high-suspense thriller movies with great twists' },
  { emoji: '💖', label: 'Feel-good picks', query: 'Recommend some heartwarming feel-good movies that will lift my mood' },
  { emoji: '✨', label: 'Movies like Interstellar', query: 'Recommend movies like Interstellar with cosmic scale, mystery, and emotion' },
  { emoji: '😃', label: 'Something spooky', query: 'Suggest something spooky and eerie for tonight with great atmosphere' },
];

export const AIChat: React.FC<AIChatProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { 
    messages, 
    isTyping, 
    tasteProfile, 
    refreshTasteProfile, 
    sendMessage 
  } = useAIChat(userId);

  const { data: watchlist } = useWatchlist();
  const toggleWatchlistMutation = useToggleWatchlist();

  const [input, setInput] = useState('');
  const [showTasteModal, setShowTasteModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState<{ id: number; title: string } | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down'>>({});

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages or typing
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && !isTyping) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handlePillClick = (query: string) => {
    if (!isTyping) {
      sendMessage(query);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setFeedbackState(prev => {
      const current = prev[msgId];
      if (current === type) {
        const copy = { ...prev };
        delete copy[msgId];
        return copy;
      }
      return { ...prev, [msgId]: type };
    });
    toast.success(type === 'up' ? 'Thanks for the feedback!' : 'Feedback noted. Refining suggestions!');
  };

  const handleToggleWatchlist = (e: React.MouseEvent, movieId: number, title: string) => {
    e.stopPropagation();
    const isWatchlisted = watchlist?.some(w => w.media_id === movieId) ?? false;
    toggleWatchlistMutation.mutate(
      { movieId, isWatchlisted },
      {
        onSuccess: () => {
          toast.success(isWatchlisted ? `Removed "${title}" from watchlist` : `Added "${title}" to watchlist`);
        }
      }
    );
  };

  const handleRefreshTaste = async () => {
    setIsRefreshing(true);
    await refreshTasteProfile();
    setIsRefreshing(false);
    toast.success('Taste profile refreshed!');
  };

  return (
    <div className="ai-chat-wrapper">
      {/* Background Film Reel Silhouette Watermarks */}
      <svg className="ai-watermark-left" viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" />
        <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="4" fill="none" />
        <circle cx="50" cy="20" r="8" fill="currentColor" />
        <circle cx="50" cy="80" r="8" fill="currentColor" />
        <circle cx="20" cy="50" r="8" fill="currentColor" />
        <circle cx="80" cy="50" r="8" fill="currentColor" />
        <circle cx="29" cy="29" r="7" fill="currentColor" />
        <circle cx="71" cy="71" r="7" fill="currentColor" />
        <circle cx="29" cy="71" r="7" fill="currentColor" />
        <circle cx="71" cy="29" r="7" fill="currentColor" />
      </svg>

      <svg className="ai-watermark-right" viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" />
        <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="4" fill="none" />
        <circle cx="50" cy="20" r="8" fill="currentColor" />
        <circle cx="50" cy="80" r="8" fill="currentColor" />
        <circle cx="20" cy="50" r="8" fill="currentColor" />
        <circle cx="80" cy="50" r="8" fill="currentColor" />
      </svg>

      {/* Top Subtle Taste Bar (Unobtrusive) */}
      {tasteProfile && (
        <div className="ai-taste-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="ai-taste-strip-badge">
              <Sparkles size={13} />
              {tasteProfile.persona_title || 'Film Explorer'}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>
              {tasteProfile.critic_style || 'Taste Engine Active'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="ai-taste-strip-btn"
              onClick={() => setShowTasteModal(true)}
            >
              <FileText size={13} style={{ color: '#c084fc' }} />
              <span>Taste Document</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Scroll Area */}
      <div className="ai-chat-scroll custom-scrollbar">
        <div className="ai-chat-content-container">
          {/* Center Hero Section (Matching Reference Image) */}
          <div className="ai-hero-section">
            <div className="ai-hero-logo">
              <div className="ai-hero-logo-glow" />
              <Film size={30} strokeWidth={2.2} />
            </div>

            <h1 className="ai-hero-title">
              Chat with <span className="ai-hero-title-highlight">CineMatch</span>
            </h1>

            <p className="ai-hero-subtitle">
              Tell me what you're in the mood for — a genre, vibe, or even a movie you love. I'll find the perfect match for you.
            </p>

            {/* Quick Suggestion Pills from Reference */}
            <div className="ai-suggestion-pills">
              {REFERENCE_SUGGESTION_PILLS.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="ai-prompt-pill"
                  onClick={() => handlePillClick(pill.query)}
                >
                  <span>{pill.emoji}</span>
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            if (isUser) {
              return (
                <div key={msg.id} className="ai-message-row user">
                  <div className="ai-user-bubble">
                    {msg.content}
                  </div>
                </div>
              );
            }

            // Assistant message
            const currentFeedback = feedbackState[msg.id];

            return (
              <div key={msg.id} className="ai-message-row assistant">
                {/* Assistant Film Reel Icon Avatar */}
                <div className="ai-avatar-icon">
                  <Film size={18} />
                </div>

                <div className="ai-assistant-content">
                  {/* Response Text */}
                  <div className="ai-assistant-text">
                    {msg.content}
                  </div>

                  {/* Movie Recommendation Cards Grid (Matching Reference) */}
                  {msg.movies && msg.movies.length > 0 && (
                    <div className="ai-movie-cards-grid">
                      {msg.movies.slice(0, 4).map((rec, idx) => {
                        const movie = rec.movie;
                        const posterSrc = getPosterUrl(movie.posterPath, 'w500');
                        const isWatchlisted = watchlist?.some(w => w.media_id === movie.id);
                        const genresStr = movie.genres?.slice(0, 2).map(g => g.name).join(' • ') || 'Film';

                        return (
                          <div
                            key={movie.id || idx}
                            className="ai-movie-card"
                            onClick={() => navigate(`/movie/${movie.id}`)}
                          >
                            <img
                              src={posterSrc}
                              alt={movie.title}
                              className="ai-movie-card-poster"
                              loading="lazy"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
                              }}
                            />

                            <div className="ai-movie-card-gradient" />

                            {/* Info on Card */}
                            <div className="ai-movie-card-info">
                              <h4 className="ai-movie-card-title" title={movie.title}>
                                {movie.title}
                              </h4>
                              {movie.voteAverage > 0 && (
                                <div className="ai-movie-card-rating">
                                  <span>★</span>
                                  <span>{movie.voteAverage.toFixed(1)}</span>
                                </div>
                              )}
                              <div className="ai-movie-card-genre">
                                {genresStr}
                              </div>
                            </div>

                            {/* Hover Action Dock */}
                            <div className="ai-movie-card-dock">
                              <button
                                type="button"
                                className="ai-card-play-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTrailerMovie({ id: movie.id, title: movie.title });
                                }}
                              >
                                <Play size={13} fill="currentColor" />
                                Show
                              </button>

                              <div className="ai-card-dock-row">
                                <button
                                  type="button"
                                  className="ai-card-icon-btn"
                                  title={isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
                                  onClick={(e) => handleToggleWatchlist(e, movie.id, movie.title)}
                                >
                                  {isWatchlisted ? <Check size={14} color="#a855f7" /> : <Bookmark size={14} />}
                                </button>

                                <button
                                  type="button"
                                  className="ai-card-icon-btn"
                                  title="View Details"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/movie/${movie.id}`);
                                  }}
                                >
                                  <Info size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Feedback Action Bar (Copy, Thumbs Up, Thumbs Down) */}
                  <div className="ai-feedback-bar">
                    <button
                      type="button"
                      className="ai-feedback-btn"
                      title="Copy response"
                      onClick={() => handleCopy(msg.content)}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      className={`ai-feedback-btn ${currentFeedback === 'up' ? 'active' : ''}`}
                      title="Good recommendation"
                      onClick={() => handleFeedback(msg.id, 'up')}
                    >
                      <ThumbsUp size={14} />
                    </button>
                    <button
                      type="button"
                      className={`ai-feedback-btn ${currentFeedback === 'down' ? 'active' : ''}`}
                      title="Poor recommendation"
                      onClick={() => handleFeedback(msg.id, 'down')}
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="ai-message-row assistant">
              <div className="ai-avatar-icon">
                <Film size={18} />
              </div>
              <div className="ai-typing-indicator">
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Floating Bottom Input Bar (Matching Reference) */}
      <div className="ai-input-fixed-dock">
        <form className="ai-input-pill-form" onSubmit={handleSend}>
          <div className="ai-input-lead-icon">
            <AtSign size={18} />
          </div>

          <input
            ref={inputRef}
            type="text"
            className="ai-input-field"
            placeholder="Ask for recommendations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />

          <button
            type="submit"
            className="ai-send-btn"
            disabled={!input.trim() || isTyping}
            title="Send Message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Trailer Modal */}
      {trailerMovie && (
        <TrailerModal
          isOpen={!!trailerMovie}
          onClose={() => setTrailerMovie(null)}
          movieId={trailerMovie.id}
          movieTitle={trailerMovie.title}
        />
      )}

      {/* Taste Profile Modal */}
      {showTasteModal && tasteProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#131422',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} color="#c084fc" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#fff' }}>
                  Detail Engine Taste Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTasteModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
              <div style={{
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#f3f4f6', marginBottom: '4px' }}>
                  {tasteProfile.persona_title}
                </div>
                <div style={{ fontSize: '13px', color: '#c084fc', marginBottom: '8px' }}>
                  {tasteProfile.critic_style}
                </div>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                  {tasteProfile.summary}
                </p>
              </div>

              {tasteProfile.top_genres && tasteProfile.top_genres.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    Top Genre Distribution
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tasteProfile.top_genres.map((g, idx) => (
                      <span key={idx} style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '12px',
                        color: '#e2e8f0'
                      }}>
                        {g.name} ({g.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tasteProfile.taste_document_text && (
                <div>
                  <h4 style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Taste Profile Raw Dossier
                  </h4>
                  <div style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '12.5px',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line'
                  }}>
                    {tasteProfile.taste_document_text}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={handleRefreshTaste}
                disabled={isRefreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: isRefreshing ? 'wait' : 'pointer'
                }}
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Refresh Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTasteModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary-color)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
