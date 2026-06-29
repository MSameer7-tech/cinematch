import { type FC, useMemo } from 'react';
import { useTrendingMovies } from '../../hooks/useMovies';
import { HeroBanner } from './HeroBanner';
import { HeroSkeleton } from '../../../../components/loading/HeroSkeleton';
import { NetworkError } from '../../../../components/errors/NetworkError';

export const SmartHero: FC = () => {
  const { data, isLoading, isError, refetch } = useTrendingMovies(1);

  const heroMovie = useMemo(() => {
    if (!data?.results?.length) return null;
    
    // 1. Get Top 10
    const top10 = data.results.slice(0, 10);
    
    // 2. Filter for backdrops and good ratings (> 7.0 to be safe)
    const validMovies = top10.filter(m => m.backdropPath && m.voteAverage > 7.0);
    
    // 3. Fallback to any top 10 if none match strict criteria
    const pool = validMovies.length > 0 ? validMovies : top10;
    
    // 4. Random selection
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }, [data]);

  if (isLoading) return <HeroSkeleton />;
  
  if (isError || !heroMovie) {
    return (
      <div style={{ padding: '60px 40px', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <NetworkError onRetry={() => refetch()} />
      </div>
    );
  }

  return <HeroBanner movie={heroMovie} />;
};
