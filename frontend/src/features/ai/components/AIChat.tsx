import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  AtSign, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Play, 
  Bookmark, 
  Check, 
  Info 
} from 'lucide-react';
import { toast } from 'sonner';

import { useAIChat } from '../hooks/useAIChat';
import { useWatchlist, useToggleWatchlist } from '../../library/hooks/useWatchlist';
import { TrailerModal } from '../../movies/components/details/TrailerModal';
import { getPosterUrl } from '../../movies/utils/image';

import './AIChat.css';

interface AIChatProps {
  userId: string;
}

// Clean suggestion pills without emojis
const REFERENCE_SUGGESTION_PILLS = [
  { label: 'Thriller movies', query: 'Suggest some gripping, high-suspense thriller movies with great twists' },
  { label: 'Feel-good picks', query: 'Recommend some heartwarming feel-good movies that will lift my mood' },
  { label: 'Movies like Interstellar', query: 'Recommend movies like Interstellar with cosmic scale, mystery, and emotion' },
  { label: 'Something spooky', query: 'Suggest something spooky and eerie for tonight with great atmosphere' },
];

export const AIChat: React.FC<AIChatProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { 
    messages, 
    isTyping, 
    sendMessage 
  } = useAIChat(userId);

  const { data: watchlist } = useWatchlist();
  const toggleWatchlistMutation = useToggleWatchlist();

  const [input, setInput] = useState('');
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

  return (
    <div className="ai-chat-wrapper">
      {/* Main Chat Scroll Area */}
      <div className="ai-chat-scroll custom-scrollbar">
        <div className="ai-chat-content-container">
          {/* Centered Hero Section when no messages */}
          {messages.length === 0 ? (
            <div className="ai-hero-center-wrapper">
              <div className="ai-hero-section">
                <div className="ai-hero-logo">
                  <img src="/logo.png" alt="CineMatch" className="ai-hero-brand-logo" />
                </div>

                <h1 className="ai-hero-title">
                  Chat with <span className="ai-hero-title-highlight">CineMatch</span>
                </h1>

                <p className="ai-hero-subtitle">
                  Tell me what you're in the mood for — a genre, vibe, or even a movie you love. I'll find the perfect match for you.
                </p>

                {/* Bigger Suggestion Pills without Emojis */}
                <div className="ai-suggestion-pills">
                  {REFERENCE_SUGGESTION_PILLS.map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ai-prompt-pill"
                      onClick={() => handlePillClick(pill.query)}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Conversation Messages when chat is active
            <>
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
                    {/* Assistant CineMatch Favicon Avatar */}
                    <div className="ai-avatar-icon">
                      <img src="/logo.png" alt="CineMatch" className="ai-avatar-logo" />
                    </div>

                    <div className="ai-assistant-content">
                      {/* Response Text */}
                      <div className="ai-assistant-text">
                        {msg.content}
                      </div>

                      {/* Movie Recommendation Cards Grid */}
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
                    <img src="/logo.png" alt="CineMatch" className="ai-avatar-logo" />
                  </div>
                  <div className="ai-typing-indicator">
                    <div className="ai-typing-dot" />
                    <div className="ai-typing-dot" />
                    <div className="ai-typing-dot" />
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </>
          )}
        </div>
      </div>

      {/* Floating Big Bottom Input Bar */}
      <div className="ai-input-fixed-dock">
        <form className="ai-input-pill-form" onSubmit={handleSend}>
          <div className="ai-input-lead-icon">
            <AtSign size={22} />
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
            <Send size={19} />
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
    </div>
  );
};
