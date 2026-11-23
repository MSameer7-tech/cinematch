import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useFavorites } from '../hooks/useFavorites';
import { movieKeys } from '../../../lib/react-query/queryKeys';
import { movieService } from '../../movies/services/movie.service';
import { MovieCard } from '../../movies/components/card/MovieCard';
import { HeroSkeleton } from '../../../components/loading/HeroSkeleton';
import { Search } from 'lucide-react';

export const FavoritesPage: FC = () => {
  const { data: favorites, isLoading: isFavoritesLoading } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  const movieIds = useMemo(() => favorites?.map(entry => entry.media_id) || [], [favorites]);

  const queries = useQueries({
    queries: movieIds.map((id) => ({
      queryKey: movieKeys.detail(id),
      queryFn: () => movieService.getMovie(id),
      staleTime: 1000 * 60 * 60,
    })),
  });

  const isMoviesLoading = queries.some(q => q.isLoading);
  const movies = useMemo(() => {
    return queries
      .map(q => q.data)
      .filter((movie): movie is NonNullable<typeof movie> => movie !== undefined);
  }, [queries]);

  // Filter and Sort movies
  const processedMovies = useMemo(() => {
    let result = [...movies];

    // Local Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(q));
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.voteAverage - a.voteAverage);
    } else {
      // Sort by date added (favorites order is already correct)
      result.sort((a, b) => {
        const indexA = movieIds.indexOf(a.id);
        const indexB = movieIds.indexOf(b.id);
        return indexA - indexB;
      });
    }

    return result;
  }, [movies, searchQuery, sortBy, movieIds]);

  if (isFavoritesLoading || (isMoviesLoading && movies.length === 0)) {
    return <HeroSkeleton />;
  }

  return (
    <div className="page-container" style={{ padding: '100px 40px 60px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 className="section-title" style={{ margin: 0 }}>Your Favorites</h1>
        
        {/* Controls Container */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 12px 10px 38px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                width: '240px'
              }}
            />
          </div>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="date">Sort by Date Added</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>
      
      {processedMovies.length === 0 ? (
        <div style={{ padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            {searchQuery ? 'No matching movies found.' : "You haven't favorited any movies yet. Find something you love!"}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '24px' 
        }}>
          {processedMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} onClick={(id) => window.location.href = `/movie/${id}`} />
          ))}
        </div>
      )}
    </div>
  );
};
