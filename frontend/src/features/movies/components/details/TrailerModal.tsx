import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { X, Clapperboard, Loader2, ExternalLink, Film } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { recordWatchedTrailer } from '../../hooks/useWatchedTrailers';
import { movieService } from '../../services/movie.service';
import { useUserPreferences } from '../../../settings/utils/preferences';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoKey?: string | null;
  movieTitle?: string;
  movieId?: number;
}

export const TrailerModal: FC<TrailerModalProps> = ({ isOpen, onClose, videoKey, movieTitle, movieId }) => {
  const { autoPlayTrailers, trailerSound } = useUserPreferences();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState<string | null>(videoKey || null);
  const [isLoading, setIsLoading] = useState<boolean>(!videoKey && !!movieId);

  const handleClose = () => {
    if (movieId) {
      recordWatchedTrailer(movieId);
    }
    onClose();
  };

  // Fetch trailer if videoKey is not provided
  useEffect(() => {
    if (!isOpen) return;

    if (videoKey) {
      setActiveKey(videoKey);
      setIsLoading(false);
      return;
    }

    if (movieId) {
      let isMounted = true;
      setIsLoading(true);
      setActiveKey(null);

      // Safety timeout: If fetching takes longer than 7 seconds, fall back gracefully
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
          setActiveKey(null);
        }
      }, 7000);

      movieService.getMovieVideos(movieId, movieTitle)
        .then((videos) => {
          if (!isMounted) return;
          clearTimeout(timeoutId);
          if (videos && videos.length > 0) {
            // Find the best YouTube trailer
            const ytVideos = videos.filter((v) => v.site?.toLowerCase() === 'youtube' || !v.site);
            const officialTrailer = ytVideos.find((v) => v.type === 'Trailer' && v.isOfficial);
            const anyTrailer = ytVideos.find((v) => v.type === 'Trailer');
            const anyTeaser = ytVideos.find((v) => v.type === 'Teaser');
            const bestVideo = officialTrailer || anyTrailer || anyTeaser || ytVideos[0];

            if (bestVideo?.key) {
              setActiveKey(bestVideo.key);
            } else {
              setActiveKey(null);
            }
          } else {
            setActiveKey(null);
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch movie trailer:', err);
          if (isMounted) setActiveKey(null);
        })
        .finally(() => {
          clearTimeout(timeoutId);
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    } else {
      setActiveKey(null);
      setIsLoading(false);
    }
  }, [isOpen, videoKey, movieId, movieTitle]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, movieId, onClose]);

  // Close when clicking outside the modal content
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  if (!isOpen) return null;

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent((movieTitle || 'Movie') + ' official trailer')}`;

  return createPortal(
    <AnimatePresence>
      <div 
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 5, 12, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1020px',
            backgroundColor: '#0a0a12',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a78bfa',
              }}>
                <Clapperboard size={18} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
                {movieTitle ? `${movieTitle} - Official Trailer` : 'Official Trailer'}
              </span>
            </div>

            <button
              onClick={handleClose}
              title="Close Trailer"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.75)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Video Player */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#000' }}>
            {isLoading ? (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}>
                <Loader2 size={36} className="animate-spin" style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Loading official trailer...</span>
              </div>
            ) : activeKey ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube-nocookie.com/embed/${activeKey}?autoplay=${autoPlayTrailers ? 1 : 0}&mute=${trailerSound ? 0 : 1}&enablejsapi=1&rel=0`}
                title={movieTitle ? `${movieTitle} Trailer` : 'Movie Trailer'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />
            ) : (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '24px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}>
                  <Film size={28} />
                </div>
                <div>
                  <h4 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                    Trailer Not Available
                  </h4>
                  <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '380px' }}>
                    No embedded video trailer is currently listed for this title. You can watch the official trailer directly on YouTube.
                  </p>
                </div>
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#8b5cf6',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7c3aed';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#8b5cf6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <ExternalLink size={15} />
                  <span>Search on YouTube</span>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
