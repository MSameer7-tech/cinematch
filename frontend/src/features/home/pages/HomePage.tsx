import { type FC, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '../../movies/components/hero/HeroBanner';
import { MovieCarousel } from '../../movies/components/carousel/MovieCarousel';
import { useAuth } from '../../auth/hooks/useAuth';
import { useHomepage } from '../hooks/useHomepage';
import { useRecommendationTracking } from '../../recommendations/hooks/useRecommendationTracking';
import { useWatchedTrailers } from '../../movies/hooks/useWatchedTrailers';
import { HeroSkeleton } from '../../../components/loading/HeroSkeleton';
import { MovieRowSkeleton } from '../../../components/loading/MovieRowSkeleton';
import { isMovieReleased } from '../../movies/utils/movie.mapper';
import type { Movie } from '../../movies/types/movie.types';
import { useUserPreferences } from '../../settings/utils/preferences';

export const HomePage: FC = () => {
  const { user, guest } = useAuth();
  const userId = user?.id || guest?.id || 'anonymous';
  const { sections, hero, heroMovies: backendHeroMovies, isLoading, isError, refetch } = useHomepage(userId);
  const { trackEvent } = useRecommendationTracking();
  const { watchedMovies: rawWatchedMovies } = useWatchedTrailers();
  const { includeMature } = useUserPreferences();

  const watchedMovies = useMemo(() => {
    if (includeMature) return rawWatchedMovies;
    return rawWatchedMovies.filter((m) => !(m as any).adult);
  }, [rawWatchedMovies, includeMature]);

  // Curate top featured movies with backdrop artwork for the rotating hero banner
  const heroMovies = useMemo(() => {
    const list: Movie[] = [];
    const seen = new Set<number>();

    // 1. Prioritize taste-profile recommended hero movies from backend
    if (backendHeroMovies && backendHeroMovies.length > 0) {
      for (const m of backendHeroMovies) {
        const hasBackdrop = Boolean(m && (m.backdropPath || (m as any).backdrop_path));
        if (m && isMovieReleased(m) && hasBackdrop && !seen.has(m.id)) {
          seen.add(m.id);
          list.push(m as any);
        }
        if (list.length >= 8) break;
      }
    }
    
    // Also include primary hero movie if valid and not yet in list
    if (hero && isMovieReleased(hero) && (hero.backdropPath || (hero as any).backdrop_path) && !seen.has(hero.id)) {
      list.push(hero as any);
      seen.add(hero.id);
    }

    // 2. Add high quality backdrop movies from sections to fill up to 8
    for (const section of sections) {
      for (const m of section.movies) {
        const hasBackdrop = Boolean(m && (m.backdropPath || (m as any).backdrop_path));
        if (m && isMovieReleased(m) && hasBackdrop && !seen.has(m.id)) {
          seen.add(m.id);
          list.push(m as any);
        }
        if (list.length >= 8) break;
      }
      if (list.length >= 8) break;
    }

    return list;
  }, [hero, backendHeroMovies, sections]);

  // Filter out any stale generic continue_watching section from backend
  const standardSections = useMemo(() => {
    return sections.filter((s) => 
      s.id !== 'continue_watching' && 
      s.strategy !== 'continue_watching' &&
      !s.title.toLowerCase().includes('continue watching')
    );
  }, [sections]);

  useEffect(() => {
    if (!isLoading && user?.id) {
      // Preload search index when homepage loads and user is logged in
      import('../../search/services/index.service').then(({ indexService }) => {
        indexService.preloadIndex();
      });
    }
  }, [isLoading, user?.id]);

  const navigate = useNavigate();

  const handleMovieShown = useCallback((id: number, position: number, sectionId: string) => {
    if (user?.id) {
      // Track card shown event with section and position for CTR calculations (Phase 10)
      trackEvent(user.id, 'shown', id, undefined, sectionId, position);
    }
  }, [user?.id, trackEvent]);

  const handleMovieClick = useCallback((id: number, position: number, sectionId: string) => {
    if (user?.id) {
      // Track card clicked event with section type and card index position
      trackEvent(user.id, 'clicked', id, undefined, sectionId, position);
    }
    // Client-side smooth navigation
    navigate(`/movie/${id}`);
  }, [user?.id, trackEvent, navigate]);

  if (isLoading) {
    return (
      <div className="home-page" style={{ paddingBottom: '60px', overflowX: 'hidden', maxWidth: '100vw' }}>
        <HeroSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '60px 40px', minHeight: '60vh', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
        <h3>Error loading homepage contents. Please try again.</h3>
        <button
          onClick={() => refetch()}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            background: '#8B5CF6',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="home-page" style={{ paddingBottom: '60px', overflowX: 'hidden', maxWidth: '100vw' }}>
      {/* 1. Dynamic Rotating Hero Banner */}
      {heroMovies.length > 0 && (
        <HeroBanner movies={heroMovies} intervalMs={6000} />
      )}

      {/* 2. Continue Watching (ONLY movies whose trailer the user has been watching) */}
      {watchedMovies.length > 0 && (
        <MovieCarousel
          key="continue_watching"
          sectionId="continue_watching"
          title="Continue Watching"
          movies={watchedMovies}
          page={1}
          pageSize={watchedMovies.length}
          totalMovies={watchedMovies.length}
          hasMore={false}
          nextPage={null}
          onMovieShown={handleMovieShown}
          onMovieClick={handleMovieClick}
        />
      )}

      {/* 3. Discovery Sections Loop */}
      {standardSections.map((section) => (
        <MovieCarousel
          key={section.id}
          sectionId={section.id}
          title={section.title}
          movies={section.movies}
          page={section.page}
          pageSize={section.pageSize}
          totalMovies={section.totalMovies}
          hasMore={section.hasMore}
          nextPage={section.nextPage}
          onMovieShown={handleMovieShown}
          onMovieClick={handleMovieClick}
        />
      ))}
    </div>
  );
};
