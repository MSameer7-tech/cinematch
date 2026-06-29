import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Sparkles, Play, HelpCircle } from 'lucide-react';
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
  runtime?: string;
  progress?: number;
}

const continueWatchingMovies: MockMovie[] = [
  { id: 'cw-1', title: 'Interstellar', rating: 8.7, releaseYear: 2014, genres: ['Sci-Fi'], runtime: '169m', progress: 68 },
  { id: 'cw-2', title: 'Inception', rating: 8.8, releaseYear: 2010, genres: ['Sci-Fi'], runtime: '148m', progress: 42 },
  { id: 'cw-3', title: 'The Dark Knight', rating: 9.0, releaseYear: 2008, genres: ['Action'], runtime: '152m', progress: 85 }
];

const inceptionRecommendations: MockMovie[] = [
  { id: 'ir-1', title: 'Memento', rating: 8.4, releaseYear: 2000, genres: ['Mystery', 'Thriller'], runtime: '113m' },
  { id: 'ir-2', title: 'Shutter Island', rating: 8.2, releaseYear: 2010, genres: ['Mystery', 'Thriller'], runtime: '138m' },
  { id: 'ir-3', title: 'The Prestige', rating: 8.5, releaseYear: 2006, genres: ['Mystery', 'Sci-Fi'], runtime: '130m' },
  { id: 'ir-4', title: 'Coherence', rating: 7.2, releaseYear: 2013, genres: ['Sci-Fi', 'Thriller'], runtime: '89m' },
  { id: 'ir-5', title: 'Dark City', rating: 7.6, releaseYear: 1998, genres: ['Sci-Fi', 'Mystery'], runtime: '100m' }
];

const trendingMovies: MockMovie[] = [
  { id: 'tr-1', title: 'Dune: Part Two', rating: 8.9, releaseYear: 2024, genres: ['Sci-Fi', 'Adventure'], runtime: '166m' },
  { id: 'tr-2', title: 'Oppenheimer', rating: 8.5, releaseYear: 2023, genres: ['Biography', 'Drama'], runtime: '180m' },
  { id: 'tr-3', title: 'Spider-Man: Across the Spider-Verse', rating: 8.7, releaseYear: 2023, genres: ['Animation', 'Action'], runtime: '140m' },
  { id: 'tr-4', title: 'The Batman', rating: 7.8, releaseYear: 2022, genres: ['Action', 'Crime'], runtime: '176m' }
];

const hiddenGems: MockMovie[] = [
  { id: 'hg-1', title: 'Primer', rating: 6.8, releaseYear: 2004, genres: ['Sci-Fi', 'Thriller'], runtime: '77m' },
  { id: 'hg-2', title: 'Moon', rating: 7.8, releaseYear: 2009, genres: ['Sci-Fi', 'Mystery'], runtime: '97m' },
  { id: 'hg-3', title: 'Ex Machina', rating: 7.7, releaseYear: 2014, genres: ['Sci-Fi', 'Drama'], runtime: '108m' },
  { id: 'hg-4', title: 'Predestination', rating: 7.4, releaseYear: 2014, genres: ['Sci-Fi', 'Mystery'], runtime: '97m' }
];

export const HomePage: FC = () => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome');

  const displayName = authState.status === 'GUEST' ? 'Guest' : (authState.user?.displayName || 'User');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleActionClick = () => {
    console.log('View All clicked');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* Header greeting & hook */}
      <div>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          fontFamily: 'var(--font-heading)', 
          color: '#fff', 
          margin: '0 0 6px 0',
          letterSpacing: '-0.5px'
        }}>
          {greeting}, {displayName} 👋
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
          Your AI found <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>6 movies</span> you'll probably rate above 9/10 today.
        </p>
      </div>

      {/* AI Hero Row (Match of the Day + Taste Profile) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '32px',
          alignItems: 'stretch'
        }}
      >
        {/* Match of the Day (65% Equivalent card) */}
        <div 
          style={{ 
            gridColumn: 'span 2',
            background: 'linear-gradient(135deg, rgba(24, 24, 31, 0.95) 0%, rgba(17, 17, 24, 0.98) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-card)',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Glowing purple ambient effect */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            filter: 'blur(100px)',
            opacity: 0.15,
            pointerEvents: 'none'
          }} />

          <div>
            {/* 98% Match Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={14} style={{ color: 'var(--primary-color)' }} />
                <span style={{ 
                  color: 'var(--primary-color)', 
                  fontWeight: 800, 
                  fontSize: '12px', 
                  fontFamily: 'var(--font-number)',
                  letterSpacing: '0.5px' 
                }}>
                  98% MATCH
                </span>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                MATCH OF THE DAY
              </span>
            </div>

            {/* Title */}
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: 800, 
              fontFamily: 'var(--font-heading)', 
              color: '#fff', 
              margin: '0 0 16px 0',
              lineHeight: 1.1,
              letterSpacing: '-1px'
            }}>
              Arrival
            </h2>

            {/* AI Reasoning Points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '480px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓</span>
                <span>Because you loved <strong style={{ color: '#fff' }}>Interstellar</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓</span>
                <span>Similar cerebral pacing and atmospheric style</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓</span>
                <span>Explores philosophical alien contact concepts</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: 'var(--primary-color)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.3)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-color)')}
            >
              <Play size={16} fill="#fff" />
              <span>Watch Trailer</span>
            </button>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-button)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            >
              <HelpCircle size={16} />
              <span>Why this?</span>
            </button>
          </div>
        </div>

        {/* Your Taste Profile (35% Equivalent card) */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, rgba(24, 24, 31, 0.95) 0%, rgba(17, 17, 24, 0.98) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-card)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.8px', textTransform: 'uppercase', opacity: 0.7 }}>
              Today's AI Insight
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '8px 0 20px 0', fontFamily: 'var(--font-heading)' }}>
              Your Taste Profile
            </h3>

            {/* Stats Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: '#fff', fontWeight: 500 }}>Sci-Fi</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-number)' }}>72%</span>
                </div>
                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                  <div style={{ width: '72%', height: '100%', backgroundColor: 'var(--primary-color)', borderRadius: '2px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: '#fff', fontWeight: 500 }}>Thriller</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-number)' }}>18%</span>
                </div>
                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                  <div style={{ width: '18%', height: '100%', backgroundColor: '#60a5fa', borderRadius: '2px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: '#fff', fontWeight: 500 }}>Drama</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-number)' }}>10%</span>
                </div>
                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                  <div style={{ width: '10%', height: '100%', backgroundColor: '#f472b6', borderRadius: '2px' }} />
                </div>
              </div>
            </div>

            {/* Taste Traits */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Mind-bending', 'Slow Pacing', 'Strong Endings'].map((trait) => (
                <span
                  key={trait}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Taste Score */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Taste Match Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ 
                fontSize: '28px', 
                fontWeight: 800, 
                color: 'var(--primary-color)', 
                fontFamily: 'var(--font-number)',
                textShadow: '0 0 12px rgba(168, 85, 247, 0.3)'
              }}>
                94
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-number)' }}>/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Watching Section */}
      <div>
        <SectionHeader title="Continue Watching" subtitle="Resume where you left off" actionText="View All" onActionClick={handleActionClick} />
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

      {/* Inception Recommendations Carousel */}
      <div>
        <SectionHeader title="Because You Rated Inception 10/10" subtitle="Cerebral thrillers tailored to your scores" actionText="View All" onActionClick={handleActionClick} />
        <Carousel>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <MovieCard key={`sk-ir-${i}`} isLoading={true} />
            ))
          ) : (
            inceptionRecommendations.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                rating={movie.rating}
                releaseYear={movie.releaseYear}
                genres={movie.genres}
                runtime={movie.runtime}
              />
            ))
          )}
        </Carousel>
      </div>

      {/* Trending Now Carousel */}
      <div>
        <SectionHeader title="Trending Now" subtitle="Most watched today" actionText="View All" onActionClick={handleActionClick} />
        <Carousel>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
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
                runtime={movie.runtime}
              />
            ))
          )}
        </Carousel>
      </div>

      {/* Hidden Gems Carousel */}
      <div>
        <SectionHeader title="Hidden Gems You Might Have Missed" subtitle="Unsung masterpieces based on your taste profile" actionText="View All" onActionClick={handleActionClick} />
        <Carousel>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <MovieCard key={`sk-hg-${i}`} isLoading={true} />
            ))
          ) : (
            hiddenGems.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                rating={movie.rating}
                releaseYear={movie.releaseYear}
                genres={movie.genres}
                runtime={movie.runtime}
              />
            ))
          )}
        </Carousel>
      </div>
    </div>
  );
};
