import type { FC } from 'react';
import { SmartHero } from '../../movies/components/hero/SmartHero';
import { MovieSection } from '../../movies/components/carousel/MovieSection';
import { 
  useTrendingMovies, 
  usePopularMovies, 
  useTopRatedMovies, 
  useUpcomingMovies 
} from '../../movies/hooks/useMovies';
import { features } from '../../../config/features';
import { Sparkles } from 'lucide-react';

export const HomePage: FC = () => {
  return (
    <div className="home-page" style={{ paddingBottom: '60px' }}>
      {/* 1. Hero Banner (Smart Strategy) */}
      <SmartHero />

      {/* 2. Continue Watching (Stub) */}
      <section style={{ margin: '40px 0', padding: '0 40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
          Continue Watching
        </h2>
        <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
          No watch history yet. Start watching to see titles here.
        </div>
      </section>

      {/* 3. AI Pick For You (Feature Flagged) */}
      {features.ENABLE_AI && (
        <section style={{ margin: '40px 0', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Sparkles size={20} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, background: 'linear-gradient(90deg, var(--primary-color), #d8b4fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Pick For You
            </h2>
          </div>
          <div style={{ padding: '20px', backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px', color: 'var(--primary-light)' }}>
            Tell our AI what you're in the mood for, and we'll find the perfect match. (Coming soon in Phase 2)
          </div>
        </section>
      )}

      {/* 4. Live TMDB Data Sections */}
      <MovieSection 
        title="Trending Now" 
        queryHook={() => useTrendingMovies(1)} 
      />
      
      <MovieSection 
        title="Popular Movies" 
        queryHook={() => usePopularMovies(1)} 
      />
      
      <MovieSection 
        title="Top Rated" 
        queryHook={() => useTopRatedMovies(1)} 
      />
      
      <MovieSection 
        title="Coming Soon" 
        queryHook={() => useUpcomingMovies(1)} 
      />
    </div>
  );
};
