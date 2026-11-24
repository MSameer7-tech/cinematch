import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { 
  useMovieDetails, 
  useMovieCredits, 
  useMovieVideos, 
  useSimilarMovies 
} from '../hooks/useMovies';
import { MovieHero } from '../components/details/MovieHero';
import { CastCarousel } from '../components/details/CastCarousel';
import { MovieCarousel } from '../components/carousel/MovieCarousel';
import { TrailerModal } from '../components/details/TrailerModal';
import { HeroSkeleton } from '../../../components/loading/HeroSkeleton';
import { MovieRowSkeleton } from '../../../components/loading/MovieRowSkeleton';
import { 
  Info, 
  DollarSign, 
  Globe2, 
  Calendar, 
  Clock, 
  Play, 
  Film, 
  Building2, 
  Clapperboard, 
  Music, 
  Camera, 
  PenTool, 
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import './MovieDetails.css';

export const MovieDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = id ? parseInt(id, 10) : 0;

  // Selected trailer for preview modal
  const [selectedVideoKey, setSelectedVideoKey] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Fetch all necessary data concurrently
  const { 
    data: movie, 
    isLoading: isMovieLoading, 
    isError: isMovieError 
  } = useMovieDetails(movieId);

  const { data: credits, isLoading: isCreditsLoading } = useMovieCredits(movieId);
  const { data: videos } = useMovieVideos(movieId);
  const { data: similarMovies, isLoading: isSimilarLoading } = useSimilarMovies(movieId);

  // Extract key crew members
  const crewInfo = useMemo(() => {
    if (!credits?.crew || credits.crew.length === 0) return {};
    const director = credits.crew.find(c => c.job === 'Director')?.name;
    const writers = credits.crew
      .filter(c => ['Screenplay', 'Writer', 'Story', 'Characters'].includes(c.job))
      .map(c => c.name)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3)
      .join(', ');
    const composer = credits.crew.find(c => 
      ['Original Music Composer', 'Music', 'Music Score'].includes(c.job)
    )?.name;
    const cinematographer = credits.crew.find(c => 
      ['Director of Photography', 'Cinematographer', 'Cinematography'].includes(c.job)
    )?.name;
    const producers = credits.crew
      .filter(c => c.job === 'Producer')
      .map(c => c.name)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3)
      .join(', ');

    return { director, writers, composer, cinematographer, producers };
  }, [credits]);

  // Filter YouTube videos
  const youtubeVideos = useMemo(() => {
    if (!videos) return [];
    return videos.filter(v => v.site === 'YouTube');
  }, [videos]);

  // Format currency
  const formatCurrency = (val: number | undefined | null) => {
    if (!val || val <= 0) return '—';
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)} Billion`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)} Million`;
    return `$${val.toLocaleString()}`;
  };

  // Format full date
  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Language mapping
  const formatLanguage = (langCode: string | undefined | null) => {
    if (!langCode) return 'English';
    const map: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      es: 'Spanish',
      fr: 'French',
      ja: 'Japanese',
      ko: 'Korean',
      de: 'German',
      it: 'Italian',
      te: 'Telugu',
      ta: 'Tamil',
      zh: 'Chinese',
    };
    return map[langCode.toLowerCase()] || langCode.toUpperCase();
  };

  if (isNaN(movieId) || movieId === 0) {
    return <Navigate to="/" replace />;
  }

  if (isMovieError) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <h2 style={{ color: 'var(--text-secondary)' }}>Failed to load movie details.</h2>
      </div>
    );
  }

  return (
    <div className="movie-details-page">
      {/* 1. Hero Section */}
      {isMovieLoading || !movie ? (
        <HeroSkeleton />
      ) : (
        <MovieHero 
          movie={movie} 
          videos={videos || []} 
          directorName={crewInfo.director}
        />
      )}

      {/* 2. Main Content Grid (Left Content + Right Facts Sidebar) */}
      <div className="movie-details-grid">
        {/* Left / Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', minWidth: 0 }}>
          {/* Top Cast Section */}
          <section>
            <div className="details-section-header">
              <div>
                <h2 className="details-section-title">Top Cast</h2>
                <div className="details-section-subtitle">Leading actors and on-screen performances</div>
              </div>
            </div>

            {isCreditsLoading ? (
              <MovieRowSkeleton />
            ) : credits?.cast && credits.cast.length > 0 ? (
              <CastCarousel cast={credits.cast.slice(0, 20)} />
            ) : (
              <div style={{ color: 'rgba(255, 255, 255, 0.5)', padding: '20px 0' }}>
                Cast information currently unavailable.
              </div>
            )}
          </section>

          {/* Official Videos & Trailers */}
          {youtubeVideos.length > 0 && (
            <section>
              <div className="details-section-header">
                <div>
                  <h2 className="details-section-title">Videos & Trailers</h2>
                  <div className="details-section-subtitle">Official teasers, trailers and previews</div>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                gap: '20px' 
              }}>
                {youtubeVideos.slice(0, 4).map((vid) => (
                  <div 
                    key={vid.id}
                    className="video-preview-card"
                    onClick={() => {
                      setSelectedVideoKey(vid.key);
                      setIsVideoModalOpen(true);
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                      <img 
                        src={`https://img.youtube.com/vi/${vid.key}/mqdefault.jpg`}
                        alt={vid.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div className="video-play-badge">
                        <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#f8fafc',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {vid.type || 'Trailer'}
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px 14px' }}>
                      <div style={{ 
                        fontWeight: 600, 
                        fontSize: '13.5px', 
                        color: '#f8fafc', 
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} title={vid.name}>
                        {vid.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Similar Movies Section */}
          {isSimilarLoading ? (
            <MovieRowSkeleton />
          ) : similarMovies?.results && similarMovies.results.length > 0 ? (
            <section style={{ margin: '10px 0' }}>
              <MovieCarousel 
                title="More Like This" 
                subtitle="Titles with similar themes, tone, and storytelling"
                movies={similarMovies.results} 
              />
            </section>
          ) : null}
        </div>

        {/* Right Column / Facts Sidebar */}
        {movie && (
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Movie Information Card */}
            <div className="movie-facts-card">
              <h3 className="facts-card-title">
                <Info size={18} color="#c084fc" />
                <span>Movie Information</span>
              </h3>

              {/* Director */}
              {crewInfo.director && (
                <div className="fact-row">
                  <span className="fact-label">Director</span>
                  <span className="fact-value" style={{ color: '#c084fc' }}>{crewInfo.director}</span>
                </div>
              )}

              {/* Writers */}
              {crewInfo.writers && (
                <div className="fact-row">
                  <span className="fact-label">Writers</span>
                  <span className="fact-value">{crewInfo.writers}</span>
                </div>
              )}

              {/* Composer */}
              {crewInfo.composer && (
                <div className="fact-row">
                  <span className="fact-label">Original Music</span>
                  <span className="fact-value">{crewInfo.composer}</span>
                </div>
              )}

              {/* Cinematography */}
              {crewInfo.cinematographer && (
                <div className="fact-row">
                  <span className="fact-label">Cinematography</span>
                  <span className="fact-value">{crewInfo.cinematographer}</span>
                </div>
              )}

              {/* Status */}
              <div className="fact-row">
                <span className="fact-label">Status</span>
                <span className="fact-value" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
                  <CheckCircle2 size={14} />
                  <span>{movie.status || 'Released'}</span>
                </span>
              </div>

              {/* Release Date */}
              <div className="fact-row">
                <span className="fact-label">Release Date</span>
                <span className="fact-value">{formatDate(movie.releaseDate)}</span>
              </div>

              {/* Runtime */}
              {movie.runtime && (
                <div className="fact-row">
                  <span className="fact-label">Runtime</span>
                  <span className="fact-value">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m ({movie.runtime} min)</span>
                </div>
              )}

              {/* Original Language */}
              <div className="fact-row">
                <span className="fact-label">Language</span>
                <span className="fact-value">{formatLanguage((movie as any).originalLanguage || (movie as any).original_language)}</span>
              </div>

              {/* Budget */}
              <div className="fact-row">
                <span className="fact-label">Budget</span>
                <span className="fact-value">{formatCurrency(movie.budget)}</span>
              </div>

              {/* Revenue */}
              <div className="fact-row">
                <span className="fact-label">Box Office Revenue</span>
                <span className="fact-value" style={{ color: movie.revenue > 0 ? '#fbbf24' : '#f1f5f9' }}>
                  {formatCurrency(movie.revenue)}
                </span>
              </div>

              {/* Production Countries */}
              {movie.productionCountries && movie.productionCountries.length > 0 && (
                <div className="fact-row">
                  <span className="fact-label">Production Countries</span>
                  <span className="fact-value">{movie.productionCountries.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Production Studios Card */}
            {movie.productionCompanies && movie.productionCompanies.length > 0 && (
              <div className="movie-facts-card">
                <h3 className="facts-card-title">
                  <Building2 size={18} color="#c084fc" />
                  <span>Production Studios</span>
                </h3>
                <div className="fact-pill-container">
                  {movie.productionCompanies.map((company) => (
                    <div key={company.id} className="fact-pill">
                      {company.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Video Preview Modal */}
      {selectedVideoKey && movie && (
        <TrailerModal 
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false);
            setSelectedVideoKey(null);
          }}
          videoKey={selectedVideoKey}
          movieTitle={movie.title}
          movieId={movie.id}
        />
      )}
    </div>
  );
};
