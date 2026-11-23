import { type FC, useEffect } from 'react';
import { useSearchStore } from '../stores/search.store';
import { useSuggestions } from '../hooks/useSuggestions';
import { historyService } from '../services/history.service';
import { analyticsService } from '../services/analytics.service';
import { useAuth } from '../../auth/hooks/useAuth';
import { Search, X, TrendingUp, Sparkles, History, Play } from 'lucide-react';
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
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#141414',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        padding: '24px',
        maxHeight: '75vh',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      }}
      className="hide-scrollbar"
    >
      {/* 1. Split Recent / Trending / Suggested (When query is empty) */}
      {!query.trim() || query.length < 2 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Recent Searches */}
          {history.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <History size={16} />
                  <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Searches</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    opacity: 0.7,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  Clear All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {history.map((h) => (
                  <div 
                    key={h.query}
                    onClick={() => handleSelectQuery(h.query, 'history')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    className="suggestion-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Search size={14} color="rgba(255,255,255,0.3)" />
                      <span style={{ fontSize: '14px', color: '#fff' }}>{h.query}</span>
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
                        alignItems: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <TrendingUp size={16} />
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trending Searches</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {historyService.getTrendingSearches().map((term) => (
                <div 
                  key={term}
                  onClick={() => handleSelectQuery(term, 'trending')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="trending-suggestion-card"
                >
                  <Play size={10} color="var(--color-primary, #E50914)" fill="var(--color-primary, #E50914)" />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{term}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Searches */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <Sparkles size={16} />
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested Searches</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {historyService.getSuggestedSearches(userTasteProfile).map((suggested) => (
                <button
                  key={suggested}
                  onClick={() => handleSelectQuery(suggested, 'suggested')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(229, 9, 20, 0.08)',
                    border: '1px solid rgba(229, 9, 20, 0.2)',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="suggested-search-tag"
                >
                  {suggested}
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : loading ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ margin: '0 auto 10px auto' }} />
          <span style={{ fontSize: '13px' }}>Searching...</span>
        </div>
      ) : !hasSuggestions ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '14px' }}>No matches found for "{query}".</span>
        </div>
      ) : (
        // 2. Query matches results list (Movies, Actors, Directors, Collections, Genres)
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Movies Section */}
          {suggestions.movies.length > 0 && (
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Movies</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {suggestions.movies.map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => handleSelectQuery(m.title, 'movies', m.id)}
                    style={{ padding: '8px 10px', fontSize: '14px', color: '#fff', cursor: 'pointer', borderRadius: '4px' }}
                    className="suggestion-item"
                  >
                    {m.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cast / Actors Section */}
          {suggestions.actors.length > 0 && (
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Actors</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {suggestions.actors.map((actor) => (
                  <span 
                    key={actor}
                    onClick={() => handleSelectQuery(actor, 'actors')}
                    style={{ padding: '6px 12px', fontSize: '12px', color: '#fff', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
                    className="suggestion-tag"
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
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Directors</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {suggestions.directors.map((d) => (
                  <span 
                    key={d}
                    onClick={() => handleSelectQuery(d, 'directors')}
                    style={{ padding: '6px 12px', fontSize: '12px', color: '#fff', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
                    className="suggestion-tag"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collections Section */}
          {suggestions.collections.length > 0 && (
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Collections</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {suggestions.collections.map((col) => (
                  <span 
                    key={col}
                    onClick={() => handleSelectQuery(col, 'collections')}
                    style={{ padding: '6px 12px', fontSize: '12px', color: '#fff', cursor: 'pointer', backgroundColor: 'rgba(229, 9, 20, 0.1)', border: '1px solid rgba(229, 9, 20, 0.2)', borderRadius: '4px' }}
                    className="suggestion-tag"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Genres Section */}
          {suggestions.genres.length > 0 && (
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Genres</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {suggestions.genres.map((g) => (
                  <span 
                    key={g}
                    onClick={() => handleSelectQuery(g, 'genres')}
                    style={{ padding: '6px 12px', fontSize: '12px', color: '#fff', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}
                    className="suggestion-tag"
                  >
                    {g}
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
