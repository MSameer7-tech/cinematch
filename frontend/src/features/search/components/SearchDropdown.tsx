import { type FC, useEffect } from 'react';
import { useSearchStore } from '../stores/search.store';
import { useSuggestions } from '../hooks/useSuggestions';
import { historyService } from '../services/history.service';
import { analyticsService } from '../services/analytics.service';
import { useAuth } from '../../auth/hooks/useAuth';
import { Search, X, TrendingUp, Sparkles, History, Film, User, Tag, Clapperboard, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchDropdownProps {
  onClose: () => void;
  userTasteProfile: any;
}

export const SearchDropdown: FC<SearchDropdownProps> = ({ onClose, userTasteProfile }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    query, 
    setQuery, 
    history, 
    loadHistory, 
    deleteHistoryItem, 
    clearHistory 
  } = useSearchStore();

  const { suggestions, loading } = useSuggestions(query);

  useEffect(() => {
    loadHistory();
    if (user?.id) {
      analyticsService.logSuggestionOpened(user.id);
    }
  }, [loadHistory, user?.id]);

  const handleSelectQuery = (selectedText: string, category: string, movieId?: number) => {
    setQuery(selectedText);
    if (user?.id) {
      analyticsService.logSuggestionClicked(user.id, movieId, undefined);
    }
    navigate(`/search?q=${encodeURIComponent(selectedText)}`);
    onClose();
  };

  const hasSuggestions = 
    suggestions.movies.length > 0 ||
    suggestions.actors.length > 0 ||
    suggestions.directors.length > 0 ||
    suggestions.collections.length > 0 ||
    suggestions.genres.length > 0;

  return (
    <div 
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(13, 13, 20, 0.97)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '18px',
        padding: '20px',
        maxHeight: '75vh',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 24px 60px -10px rgba(0, 0, 0, 0.85), 0 0 25px rgba(168, 85, 247, 0.08)',
      }}
      className="custom-scrollbar"
    >
      {/* 1. When query is empty -> Show Recent, Trending, Suggested */}
      {!query.trim() || query.length < 2 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Recent Searches Section */}
          {history.length > 0 && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '10px',
                padding: '0 4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                  <History size={14} />
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Recent Searches
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '11.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#c084fc'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  Clear all
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {history.map((h) => (
                  <div 
                    key={h.query}
                    onClick={() => handleSelectQuery(h.query, 'history')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <Search size={14} color="rgba(255,255,255,0.35)" />
                      <span style={{ fontSize: '13.5px', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.query}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistoryItem(h.query);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#f87171';
                        e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Remove"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches Section */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#c084fc', 
              marginBottom: '10px',
              padding: '0 4px'
            }}>
              <TrendingUp size={14} />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Trending Searches
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '8px' }}>
              {historyService.getTrendingSearches().map((term, index) => (
                <div 
                  key={term}
                  onClick={() => handleSelectQuery(term, 'trending')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.035)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.035)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#a855f7', opacity: 0.9 }}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {term}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Searches Section */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#94a3b8', 
              marginBottom: '10px',
              padding: '0 4px'
            }}>
              <Sparkles size={14} color="#c084fc" />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Suggested For You
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {historyService.getSuggestedSearches(userTasteProfile).map((suggested) => (
                <button
                  key={suggested}
                  onClick={() => handleSelectQuery(suggested, 'suggested')}
                  style={{
                    padding: '7px 14px',
                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid rgba(168, 85, 247, 0.22)',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.18)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.45)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.22)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }}
                >
                  {suggested}
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : loading ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid rgba(168, 85, 247, 0.2)',
            borderTopColor: '#c084fc',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: '13px' }}>Searching catalog...</span>
        </div>
      ) : !hasSuggestions ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>
          <span style={{ fontSize: '13.5px' }}>No matches found for &ldquo;{query}&rdquo;</span>
        </div>
      ) : (
        /* 2. When query has suggestions -> Categorized matches */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Movies Section */}
          {suggestions.movies.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '0 4px', color: '#94a3b8' }}>
                <Film size={13} color="#c084fc" />
                <span style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Movies
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {suggestions.movies.map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => handleSelectQuery(m.title, 'movies', m.id)}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px', 
                      fontSize: '13.5px', 
                      color: '#f8fafc', 
                      cursor: 'pointer', 
                      borderRadius: '8px',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Search size={14} color="rgba(255, 255, 255, 0.35)" />
                    <span>{m.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cast / Actors Section */}
          {suggestions.actors.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '0 4px', color: '#94a3b8' }}>
                <User size={13} color="#c084fc" />
                <span style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Actors
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {suggestions.actors.map((actor) => (
                  <span 
                    key={actor}
                    onClick={() => handleSelectQuery(actor, 'actors')}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px', 
                      color: '#e2e8f0', 
                      cursor: 'pointer', 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Directors Section */}
          {suggestions.directors.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '0 4px', color: '#94a3b8' }}>
                <Clapperboard size={13} color="#c084fc" />
                <span style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Directors
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {suggestions.directors.map((d) => (
                  <span 
                    key={d}
                    onClick={() => handleSelectQuery(d, 'directors')}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px', 
                      color: '#e2e8f0', 
                      cursor: 'pointer', 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Genres & Collections Section */}
          {(suggestions.genres.length > 0 || suggestions.collections.length > 0) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '0 4px', color: '#94a3b8' }}>
                <Tag size={13} color="#c084fc" />
                <span style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Genres & Collections
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {suggestions.genres.map((g) => (
                  <span 
                    key={g}
                    onClick={() => handleSelectQuery(g, 'genres')}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px', 
                      color: '#e2e8f0', 
                      cursor: 'pointer', 
                      backgroundColor: 'rgba(168, 85, 247, 0.08)', 
                      border: '1px solid rgba(168, 85, 247, 0.22)',
                      borderRadius: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.22)';
                    }}
                  >
                    {g}
                  </span>
                ))}
                {suggestions.collections.map((col) => (
                  <span 
                    key={col}
                    onClick={() => handleSelectQuery(col, 'collections')}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px', 
                      color: '#e2e8f0', 
                      cursor: 'pointer', 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
