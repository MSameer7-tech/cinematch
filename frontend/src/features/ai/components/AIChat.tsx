import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  AtSign, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Play, 
  Bookmark, 
  Check, 
  Menu
} from 'lucide-react';
import { toast } from 'sonner';

import { useAIChat } from '../hooks/useAIChat';
import { useWatchlist, useToggleWatchlist } from '../../library/hooks/useWatchlist';
import { TrailerModal } from '../../movies/components/details/TrailerModal';
import { getPosterUrl } from '../../movies/utils/image';
import { ChatHistorySidebar } from './ChatHistorySidebar';

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

/**
 * Formats assistant text cleanly:
 * - Highlights **Movie Titles** with aesthetic cinephile badges
 * - Cleans up excess em-dashes and rogue hyphens
 * - Separates paragraphs and bullet lists with proper line-height
 */
const FormattedMessageContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // 1. Sanitize rogue em-dashes and double hyphens
  const cleaned = content
    .replace(/(\*\*[^*]+\*\*)—/g, '$1: ')
    .replace(/—/g, ': ')
    .replace(/\s*--\s*/g, '. ')
    .replace(/:\s*:/g, ':');

  // 2. Split into distinct paragraphs or lines
  const paragraphs = cleaned
    .split(/\n\s*\n|\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const renderInline = (text: string) => {
    // Split by bold markdown **title**
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <strong key={idx} className="ai-highlight-title">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="ai-formatted-text">
      {paragraphs.map((para, pIdx) => {
        // Check if paragraph is a bullet list item
        if (para.startsWith('• ') || para.startsWith('- ') || para.startsWith('* ')) {
          const itemText = para.replace(/^[•\-*]\s*/, '');
          return (
            <div key={pIdx} className="ai-bubble-bullet-item">
              <span className="ai-bullet-dot">•</span>
              <span className="ai-bullet-text">{renderInline(itemText)}</span>
            </div>
          );
        }

        return (
          <p key={pIdx} className="ai-bubble-paragraph">
            {renderInline(para)}
          </p>
        );
      })}
    </div>
  );
};

export const AIChat: React.FC<AIChatProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { 
    conversations,
    activeConversationId,
    activeConversationTitle,
    isConversationsLoading,
    messages, 
    isTyping, 
    sendMessage,
    createNewChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations
  } = useAIChat(userId);

  const { data: watchlist } = useWatchlist();
  const toggleWatchlistMutation = useToggleWatchlist();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [trailerMovie, setTrailerMovie] = useState<{ id: number; title: string } | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down'>>({});
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages or typing, ensuring content ends above floating dock
  useEffect(() => {
    const scrollToBottom = () => {
      if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    };

    scrollToBottom();
    const t1 = setTimeout(scrollToBottom, 100);
    const t2 = setTimeout(scrollToBottom, 300);
    const t3 = setTimeout(scrollToBottom, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
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

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    toast.success('Copied to clipboard');
    setTimeout(() => {
      setCopiedMsgId(prev => (prev === msgId ? null : prev));
    }, 2000);
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
      {/* 1. Left Chat History Drawer / Sidebar */}
      <ChatHistorySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          selectConversation(id);
          if (window.innerWidth < 868) {
            setIsSidebarOpen(false);
          }
        }}
        onNewChat={() => {
          createNewChat();
          if (window.innerWidth < 868) {
            setIsSidebarOpen(false);
          }
        }}
        onRenameConversation={(id, title) => {
          renameConversation(id, title);
          toast.success('Conversation renamed');
        }}
        onDeleteConversation={(id) => {
          deleteConversation(id);
          toast.success('Conversation deleted');
        }}
        onClearAll={() => {
          clearAllConversations();
          toast.success('All conversations cleared');
        }}
        isLoading={isConversationsLoading}
      />

      {/* 2. Main Chat View Column */}
      <div className="ai-chat-main-area">
        {/* Pill-Shaped Hamburger Icon Button at Bottom Left */}
        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="ai-pill-hamburger-btn"
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="View Chat History"
              aria-label="View Chat History"
            >
              <Menu size={18} strokeWidth={2.4} />
              <span>Chats</span>
              {conversations.length > 0 && (
                <span className="ai-pill-badge">{conversations.length}</span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main Chat Scroll Area */}
        <div ref={scrollContainerRef} className="ai-chat-scroll custom-scrollbar">
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
                        {/* Response Text inside Frosted Chat Card / Bubble */}
                        {msg.content && msg.content.trim().length > 0 && (
                          <div className="ai-assistant-bubble">
                            <FormattedMessageContent content={msg.content} />
                          </div>
                        )}

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
                                    <div className="ai-movie-card-title" title={movie.title}>
                                      {movie.title}
                                    </div>
                                    <div className="ai-movie-card-meta">
                                      <span className="ai-movie-card-rating">
                                        ★ {movie.voteAverage?.toFixed(1) || 'N/A'}
                                      </span>
                                      <span className="ai-movie-card-genres">{genresStr}</span>
                                    </div>
                                  </div>

                                  {/* Hover Actions */}
                                  <div className="ai-movie-card-actions">
                                    <button
                                      type="button"
                                      className="ai-movie-action-btn"
                                      title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                      onClick={(e) => handleToggleWatchlist(e, movie.id, movie.title)}
                                    >
                                      {isWatchlisted ? <Check size={14} color="#a855f7" /> : <Bookmark size={14} />}
                                    </button>
                                    <button
                                      type="button"
                                      className="ai-movie-action-btn"
                                      title="Watch Trailer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTrailerMovie({ id: movie.id, title: movie.title });
                                      }}
                                    >
                                      <Play size={14} fill="currentColor" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Assistant Action Bar: Copy, Thumbs Up, Thumbs Down */}
                        <div className="ai-assistant-actions">
                          <button
                            type="button"
                            className={`ai-action-btn ${copiedMsgId === msg.id ? 'copied' : ''}`}
                            title={copiedMsgId === msg.id ? 'Copied to clipboard' : 'Copy response'}
                            onClick={() => handleCopy(msg.id, msg.content)}
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check size={13} strokeWidth={2.4} />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <span className="ai-action-divider" />

                          <button
                            type="button"
                            className={`ai-action-btn icon-only ${currentFeedback === 'up' ? 'active-up' : ''}`}
                            title="Helpful response"
                            aria-label="Helpful response"
                            onClick={() => handleFeedback(msg.id, 'up')}
                          >
                            <ThumbsUp size={13} fill={currentFeedback === 'up' ? 'currentColor' : 'none'} />
                          </button>

                          <button
                            type="button"
                            className={`ai-action-btn icon-only ${currentFeedback === 'down' ? 'active-down' : ''}`}
                            title="Not helpful"
                            aria-label="Not helpful"
                            onClick={() => handleFeedback(msg.id, 'down')}
                          >
                            <ThumbsDown size={13} fill={currentFeedback === 'down' ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator while thinking */}
                {isTyping && (
                  <div className="ai-message-row assistant">
                    <div className="ai-avatar-icon">
                      <img src="/logo.png" alt="CineMatch" className="ai-avatar-logo" />
                    </div>
                    <div className="ai-typing-indicator">
                      <span className="ai-typing-dot" />
                      <span className="ai-typing-dot" />
                      <span className="ai-typing-dot" />
                    </div>
                  </div>
                )}

                <div ref={endRef} className="ai-scroll-spacer" />
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
