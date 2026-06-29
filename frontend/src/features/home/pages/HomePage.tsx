import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { MovieCard } from '../../../components/ui/MovieCard';
import { HorizontalMovieCard } from '../../../components/ui/HorizontalMovieCard';
import { Carousel } from '../../../components/ui/Carousel';

interface MockMovie {
  id: string;
  title: string;
  rating: number;
  imageUrl?: string;
  releaseYear: number;
  genres: string[];
  progress?: number;
}

const continueWatchingMovies: MockMovie[] = [
  { id: 'cw-1', title: 'Interstellar', rating: 8.7, releaseYear: 2014, genres: ['Sci-Fi'], progress: 68 },
  { id: 'cw-2', title: 'Inception', rating: 8.8, releaseYear: 2010, genres: ['Sci-Fi'], progress: 42 },
  { id: 'cw-3', title: 'The Dark Knight', rating: 9.0, releaseYear: 2008, genres: ['Action'], progress: 85 }
];

const trendingMovies: MockMovie[] = [
  { id: 'tr-1', title: 'Dune: Part Two', rating: 8.9, releaseYear: 2024, genres: ['Sci-Fi', 'Adventure'] },
  { id: 'tr-2', title: 'Oppenheimer', rating: 8.5, releaseYear: 2023, genres: ['Biography', 'Drama'] },
  { id: 'tr-3', title: 'Spider-Man: Across the Spider-Verse', rating: 8.7, releaseYear: 2023, genres: ['Animation', 'Action'] },
  { id: 'tr-4', title: 'The Batman', rating: 7.8, releaseYear: 2022, genres: ['Action', 'Crime'] },
  { id: 'tr-5', title: 'Blade Runner 2049', rating: 8.0, releaseYear: 2017, genres: ['Sci-Fi', 'Mystery'] }
];

const scienceFictionMovies: MockMovie[] = [
  { id: 'sf-1', title: 'Arrival', rating: 7.9, releaseYear: 2016, genres: ['Sci-Fi', 'Drama'] },
  { id: 'sf-2', title: 'The Martian', rating: 8.0, releaseYear: 2015, genres: ['Sci-Fi', 'Adventure'] },
  { id: 'sf-3', title: 'Gravity', rating: 7.7, releaseYear: 2013, genres: ['Sci-Fi', 'Thriller'] },
  { id: 'sf-4', title: 'Contact', rating: 7.4, releaseYear: 1997, genres: ['Sci-Fi', 'Mystery'] }
];

const popularMovies: MockMovie[] = [
  { id: 'pop-1', title: 'Everything Everywhere All at Once', rating: 8.0, releaseYear: 2022, genres: ['Action', 'Comedy'] },
  { id: 'pop-2', title: 'Parasite', rating: 8.5, releaseYear: 2019, genres: ['Drama', 'Thriller'] },
  { id: 'pop-3', title: 'Past Lives', rating: 7.9, releaseYear: 2023, genres: ['Drama', 'Romance'] },
  { id: 'pop-4', title: 'Whiplash', rating: 8.5, releaseYear: 2014, genres: ['Drama', 'Music'] }
];

export const HomePage: FC = () => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome');

  const displayName = authState.status === 'GUEST' ? 'Guest' : (authState.user?.displayName || 'User');

  // Set local greeting based on hour of the day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Simulate loading for skeleton transitions
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header Greeting */}
      <div>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          fontFamily: 'var(--font-heading)', 
          color: '#fff', 
          margin: '0 0 8px 0',
          letterSpacing: '-0.5px'
        }}>
          {greeting}, {displayName} 👋
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
          Let's discover your next favorite movie today.
        </p>
      </div>

      {/* Continue Watching Row */}
      <div>
        <SectionHeader title="Continue Watching" subtitle="Resume from where you left off" />
        <Carousel>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <HorizontalMovieCard key={`sk-cw-${i}`} isLoading={true} />
            ))
          ) : (
            continueWatchingMovies.map((movie) => (
              <HorizontalMovieCard
                key={movie.id}
                title={movie.title}
                rating={movie.rating}
                releaseYear={movie.releaseYear}
                progress={movie.progress}
              />
            ))
          )}
        </Carousel>
      </div>

      {/* Trending Now Carousel */}
      <div>
        <SectionHeader title="Trending Now" subtitle="Most watched in the last 24 hours" />
        <Carousel>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <MovieCard key={`sk-tr-${i}`} isLoading={true} />
            ))
          ) : (
            trendingMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                rating={movie.rating}
                releaseYear={movie.releaseYear}
                genres={movie.genres}
              />
            ))
          )}
        </Carousel>
      </div>

      {/* Recommendations Carousel */}
      <div>
        <SectionHeader title="Because you liked Interstellar" subtitle="Sci-fi recommendation picks for you" />
        <Carousel>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <MovieCard key={`sk-sf-${i}`} isLoading={true} />
            ))
          ) : (
            scienceFictionMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                rating={movie.rating}
                releaseYear={movie.releaseYear}
                genres={movie.genres}
              />
            ))
          )}
        </Carousel>
      </div>

      {/* Popular Movies Carousel */}
      <div>
        <SectionHeader title="Popular This Week" subtitle="Global favorite picks" />
        <Carousel>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <MovieCard key={`sk-pop-${i}`} isLoading={true} />
            ))
          ) : (
            popularMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                rating={movie.rating}
                releaseYear={movie.releaseYear}
                genres={movie.genres}
              />
            ))
          )}
        </Carousel>
      </div>
    </div>
  );
};
