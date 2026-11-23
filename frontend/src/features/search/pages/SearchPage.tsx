import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { useSearchStore } from '../stores/search.store';
import { SearchFilters } from '../components/SearchFilters';
import { MovieCard } from '../../movies/components/card/MovieCard';
import { MovieCardSkeleton } from '../../../components/loading/MovieCardSkeleton';
import { searchApi } from '../api/search.api';
import { analyticsService } from '../services/analytics.service';
import { useAuth } from '../../auth/hooks/useAuth';
import { Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const SentinelCard: React.FC<{ onVisible: () => void }> = ({ onVisible }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onVisible();
      }
    }, { rootMargin: '0px 0px 400px 0px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onVisible]);
  return <div ref={ref} style={{ height: '10px', width: '100%', gridColumn: '1 / -1' }} />;
};

export const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const { setQuery, setFilters, resetFilters } = useSearchStore();
  const { results, loading, hasMore, loadNextPage, userTasteProfile } = useSearch();

  // AI Search input variables
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync URL query param to search store
  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
    }
  }, [queryParam, setQuery]);

  const handleAISearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiError(null);

    try {
      // 1. Call LLM extraction API (Phase 13)
      const data = await searchApi.parseAISearch(aiQuery);
      
      // Reset current query filters first
      resetFilters();

      // 2. Set structured filters into the Zustand store
      const mappedFilters: any = {};
      if (data.genres && data.genres.length > 0) {
        mappedFilters.genres = data.genres;
      }
      if (data.runtimeMax) {
        mappedFilters.runtimeMax = data.runtimeMax;
      }
      if (data.ratingMin) {
        mappedFilters.ratingMin = data.ratingMin;
      }
      if (data.language) {
        mappedFilters.language = data.language;
      }
      if (data.yearMin) {
        mappedFilters.yearMin = data.yearMin;
      }
      if (data.yearMax) {
        mappedFilters.yearMax = data.yearMax;
      }

      setFilters(mappedFilters);

      // 3. Set query to seed movie or a key term
      if (data.type === 'recommendation' && data.seedMovies && data.seedMovies.length > 0) {
        setQuery(data.seedMovies[0]);
      } else if (data.keywords && data.keywords.length > 0) {
        setQuery(data.keywords[0]);
      } else {
        // Fallback to query
        setQuery(aiQuery);
      }

      // Track AI Search submission
      if (user?.id) {
        analyticsService.logEvent(user.id, `ai_search:${aiQuery.slice(0, 50)}`);
      }

      setAiQuery('');
    } catch (err: any) {
      setAiError("Failed to parse AI filters. Try again with simpler terms.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleMovieClick = (movieId: number, index: number) => {
    if (user?.id) {
      analyticsService.logMovieClicked(user.id, movieId, index + 1);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Header Grid with AI Search input */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px', 
          marginBottom: '40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '32px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>
            {queryParam ? `Search Results for "${queryParam}"` : 'Explore CineMatch'}
          </h1>
          
          {/* AI Search Assistant input bar */}
          <form 
            onSubmit={handleAISearchSubmit}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              backgroundColor: 'rgba(229, 9, 20, 0.05)',
              border: '1px solid rgba(229, 9, 20, 0.2)',
              borderRadius: '24px',
              padding: '4px 6px 4px 16px',
              width: '100%',
              maxWidth: '480px'
            }}
          >
            <Sparkles size={16} color="var(--color-primary, #E50914)" />
            <input 
              type="text"
              placeholder='Ask AI: "Korean horror movies under 2 hours"'
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              disabled={aiLoading}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                width: '100%',
                padding: '6px 0'
              }}
            />
            <button
              type="submit"
              disabled={aiLoading}
              style={{
                backgroundColor: 'var(--color-primary, #E50914)',
                border: 'none',
                borderRadius: '18px',
                padding: '6px 14px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: aiLoading ? 0.7 : 1
              }}
            >
              {aiLoading ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                'Ask AI'
              )}
            </button>
          </form>
        </div>

        {aiError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4f', fontSize: '13px', margin: 0 }}>
            <AlertCircle size={14} />
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar Filters & Results */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '300px 1fr', 
          gap: '32px',
          alignItems: 'start'
        }}
        className="search-layout-grid"
      >
        
        {/* Filters Sidebar (Phase 10) */}
        <aside>
          <SearchFilters />
        </aside>

        {/* Results Pane */}
        <main style={{ minHeight: '50vh' }}>
          {results.length === 0 && !loading ? (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '80px 0',
                color: 'var(--text-secondary)',
                opacity: 0.7
              }}
            >
              <Search size={48} style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>
                {queryParam ? 'No matching movies found.' : 'Type a query or ask our AI assistant above.'}
              </p>
            </div>
          ) : (
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '24px' 
              }}
              className="search-results-grid"
            >
              {results.map((movie, index) => (
                <div key={`${movie.id}_${index}`} onClick={() => handleMovieClick(movie.id, index)}>
                  <MovieCard movie={movie} />
                </div>
              ))}

              {/* Skeletons load indicators */}
              {loading && (
                <>
                  <MovieCardSkeleton />
                  <MovieCardSkeleton />
                  <MovieCardSkeleton />
                  <MovieCardSkeleton />
                </>
              )}

              {/* Sentinel Card for Infinite Search observer (Phase 11) */}
              {hasMore && !loading && (
                <SentinelCard onVisible={loadNextPage} />
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
export default SearchPage;
