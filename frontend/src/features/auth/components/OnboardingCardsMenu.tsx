import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Film, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  Star, 
  Layers, 
  ArrowRight, 
  Compass, 
  Clapperboard,
  ShieldCheck,
  Cpu,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { preferencesService } from '../../library/services/preferences.service';
import { supabase } from '../../../lib/supabase';
import { aiApi } from '../../ai/api/ai.api';
import { toast } from 'sonner';
import { getPosterUrl } from '../../movies/utils/image';

interface OnboardingCardsMenuProps {
  onComplete?: () => void;
  isModal?: boolean;
}

// 12 Curated Storytelling Vibes / Genres
const ONBOARDING_GENRES = [
  { id: 878, name: 'Sci-Fi & Speculative', anchor: 'Interstellar, Arrival, 2001', icon: '🌌' },
  { id: 53, name: 'Psychological Thriller', anchor: 'Gone Girl, Prisoners, Se7en', icon: '🕵️' },
  { id: 28, name: 'Action & Spectacle', anchor: 'Mad Max, John Wick, Top Gun', icon: '⚡' },
  { id: 18, name: 'Character Drama', anchor: 'Whiplash, Oppenheimer, Tar', icon: '🎭' },
  { id: 9648, name: 'Mind-Bending Mystery', anchor: 'Memento, Shutter Island, Zodiac', icon: '🧩' },
  { id: 12, name: 'Grand Adventure', anchor: 'Dune, Lord of the Rings, Gladiator', icon: '🧭' },
  { id: 16, name: 'Visual Animation', anchor: 'Spider-Verse, Spirited Away, Arcane', icon: '🎨' },
  { id: 27, name: 'Atmospheric Horror', anchor: 'Hereditary, The Witch, Alien', icon: '🩸' },
  { id: 80, name: 'Neo-Noir & Crime', anchor: 'The Batman, Heat, Taxi Driver', icon: '🏙️' },
  { id: 35, name: 'Dark & Satirical Comedy', anchor: 'Parasite, Fargo, The Big Lebowski', icon: '🍸' },
  { id: 36, name: 'Historical Epic', anchor: '1917, Kingdom of Heaven, Dunkirk', icon: '🏛️' },
  { id: 10749, name: 'Intimate Romance', anchor: 'Past Lives, Before Sunrise, Her', icon: '🥀' },
];

// 12 Curated Universal Foundation Movies
const FOUNDATION_MOVIES = [
  {
    id: 27205,
    title: 'Inception',
    poster_path: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
    release_year: '2010',
    director: 'Christopher Nolan',
    genre_ids: [28, 878],
    genres: ['Action', 'Sci-Fi']
  },
  {
    id: 155,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    release_year: '2008',
    director: 'Christopher Nolan',
    genre_ids: [28, 80],
    genres: ['Action', 'Crime']
  },
  {
    id: 157336,
    title: 'Interstellar',
    poster_path: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    release_year: '2014',
    director: 'Christopher Nolan',
    genre_ids: [12, 18, 878],
    genres: ['Adventure', 'Drama']
  },
  {
    id: 438631,
    title: 'Dune',
    poster_path: '/gDzOcq0pfeCeqMBwKIJlSmQpjkZ.jpg',
    release_year: '2021',
    director: 'Denis Villeneuve',
    genre_ids: [878, 12],
    genres: ['Sci-Fi', 'Adventure']
  },
  {
    id: 496243,
    title: 'Parasite',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    release_year: '2019',
    director: 'Bong Joon-ho',
    genre_ids: [35, 53],
    genres: ['Comedy', 'Thriller']
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    release_year: '2023',
    director: 'Joaquim Dos Santos',
    genre_ids: [16, 28],
    genres: ['Animation', 'Action']
  },
  {
    id: 244786,
    title: 'Whiplash',
    poster_path: '/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    release_year: '2014',
    director: 'Damien Chazelle',
    genre_ids: [18, 10402],
    genres: ['Drama', 'Music']
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    poster_path: '/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg',
    release_year: '1994',
    director: 'Quentin Tarantino',
    genre_ids: [53, 80],
    genres: ['Thriller', 'Crime']
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    release_year: '2017',
    director: 'Denis Villeneuve',
    genre_ids: [878, 18],
    genres: ['Sci-Fi', 'Drama']
  },
  {
    id: 603,
    title: 'The Matrix',
    poster_path: '/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg',
    release_year: '1999',
    director: 'The Wachowskis',
    genre_ids: [28, 878],
    genres: ['Action', 'Sci-Fi']
  },
  {
    id: 98,
    title: 'Gladiator',
    poster_path: '/wN2xWp1eIwCKOD0BHTcErTBv1Uq.jpg',
    release_year: '2000',
    director: 'Ridley Scott',
    genre_ids: [28, 18],
    genres: ['Action', 'Drama']
  },
  {
    id: 550,
    title: 'Fight Club',
    poster_path: '/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg',
    release_year: '1999',
    director: 'David Fincher',
    genre_ids: [18, 53],
    genres: ['Drama', 'Thriller']
  }
];

export const OnboardingCardsMenu: React.FC<OnboardingCardsMenuProps> = ({ 
  onComplete,
  isModal = false 
}) => {
  const navigate = useNavigate();
  const { user, guest, refreshSession } = useAuth();
  const effectiveUserId = user?.id || (guest as any)?.sessionId || (guest as any)?.id || 'guest-user';

  // Step State: 1 = Welcome, 2 = Genres, 3 = Foundation Movies, 4 = Persona Dossier
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User Selections
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([878, 53, 28]);
  const [favoriteMovieIds, setFavoriteMovieIds] = useState<number[]>([27205, 157336]);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

  // Toggle Genre
  const handleToggleGenre = (id: number) => {
    setSelectedGenreIds(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  // Toggle Movie Favorite
  const handleToggleMovie = (id: number) => {
    setFavoriteMovieIds(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Derived Archetype Persona based on user's choices
  const personaDossier = useMemo(() => {
    const hasSciFi = selectedGenreIds.includes(878);
    const hasThriller = selectedGenreIds.includes(53) || selectedGenreIds.includes(9648);
    const hasAction = selectedGenreIds.includes(28) || selectedGenreIds.includes(12);
    const hasDrama = selectedGenreIds.includes(18);
    const hasAnimation = selectedGenreIds.includes(16);

    let title = 'Eclectic Cinema Explorer';
    let archetype = 'Visionary Seeker';
    let summary = 'You appreciate bold, boundary-pushing cinema that merges visual spectacle with narrative substance.';

    if (hasSciFi && hasThriller) {
      title = 'Cerebral Sci-Fi & Mind-Bending Mystery Connoisseur';
      archetype = 'The Intellectual Analyst';
      summary = 'Your taste favors complex conceptual narratives, speculative futures, and high-stakes psychological tension.';
    } else if (hasAction && hasAdventure) {
      title = 'Epic Adventure & Blockbuster Spectacle Aficionado';
      archetype = 'The Grand Adventurer';
      summary = 'You are drawn to visceral storytelling, massive worldbuilding, and adrenaline-charged character journeys.';
    } else if (hasDrama && (hasThriller || hasSciFi)) {
      title = 'Atmospheric Drama & Psychological Storyteller';
      archetype = 'The Deep Observer';
      summary = 'You value nuanced emotional arcs, sharp character studies, and lingering thematic depth.';
    } else if (hasAnimation) {
      title = 'Visual Artistry & Imaginative Universe Fan';
      archetype = 'The Creative Visionary';
      summary = 'You celebrate groundbreaking visual direction, stylized aesthetic craft, and vibrant world design.';
    }

    return { title, archetype, summary };
  }, [selectedGenreIds]);

  // Complete Onboarding Handler
  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      // 1. Save preferences to user_preferences if authenticated
      if (user?.id) {
        try {
          await preferencesService.updatePreferences({
            favorite_genres: selectedGenreIds,
          });
        } catch (prefErr) {
          console.warn('Preference save notice:', prefErr);
        }

        // 2. Mark onboarding as completed in users table
        try {
          await supabase
            .from('users')
            .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
            .eq('id', user.id);
        } catch (userErr) {
          console.warn('User status update notice:', userErr);
        }

        // 3. Insert selected foundation movies into favorites
        if (favoriteMovieIds.length > 0) {
          try {
            const records = favoriteMovieIds.map(mid => ({
              user_id: user.id,
              media_id: mid,
              created_at: new Date().toISOString()
            }));
            await supabase.from('favorites').upsert(records, { onConflict: 'user_id,media_id' });
          } catch (favErr) {
            console.warn('Favorites anchor insert notice:', favErr);
          }
        }

        // 4. Trigger DetailEngine refresh so recommendation cache updates instantly
        try {
          await aiApi.refreshTasteProfile(user.id);
        } catch (aiErr) {
          console.warn('Taste profile refresh notice:', aiErr);
        }

        // 5. Update session state
        try {
          await refreshSession();
        } catch (sessErr) {
          console.warn('Session refresh notice:', sessErr);
        }
      } else {
        // Save guest state locally
        localStorage.setItem('cinematch_guest_onboarding', JSON.stringify({
          genres: selectedGenreIds,
          foundationMovies: favoriteMovieIds,
          completedAt: new Date().toISOString()
        }));
      }

      toast.success('Your personalized CineMatch taste profile is active!');

      if (onComplete) {
        onComplete();
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Onboarding completion error:', err);
      toast.error('Saved with default calibration. Entering CineMatch...');
      if (onComplete) onComplete();
      else navigate('/');
    } finally {
      setIsFinishing(false);
    }
  };

  const stepLabels = [
    { num: 1, label: 'Vision' },
    { num: 2, label: 'Sensibilities' },
    { num: 3, label: 'Anchor Films' },
    { num: 4, label: 'Persona' },
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: '960px',
      margin: '0 auto',
      backgroundColor: '#0c0f17',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      boxShadow: '0 30px 80px -10px rgba(0, 0, 0, 0.85)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      {/* Top Header & Minimalist Stepper */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.015)'
      }}>
        {/* Brand Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 800
          }}>
            C
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.3px' }}>
            CineMatch Calibration
          </span>
        </div>

        {/* Step Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {stepLabels.map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <div
                key={s.num}
                onClick={() => {
                  if (isCompleted || s.num < currentStep) setCurrentStep(s.num);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  backgroundColor: isActive 
                    ? 'rgba(139, 92, 246, 0.2)' 
                    : isCompleted 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'transparent',
                  border: isActive 
                    ? '1px solid rgba(139, 92, 246, 0.45)' 
                    : '1px solid transparent',
                  cursor: (isCompleted || s.num < currentStep) ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? '#a855f7' : isCompleted ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#fff' : isCompleted ? '#e2e8f0' : 'rgba(255, 255, 255, 0.4)'
                }}>
                  {isCompleted ? <Check size={11} strokeWidth={3} /> : s.num}
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#f1f5f9' : isCompleted ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)'
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Subtle Skip for now button */}
        <button
          onClick={handleFinish}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.45)',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)'}
        >
          Skip to Home
        </button>
      </div>

      {/* Main Card Content Body */}
      <div style={{ padding: '36px 44px', minHeight: '480px', display: 'flex', flexDirection: 'column' }}>

        {/* ======================================================== */}
        {/* CARD 1: WELCOME & THE CINEMATCH VALUE PROPOSITION         */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1 }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                color: '#c084fc',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                <Cpu size={14} />
                <span>Next-Gen Cinema Discovery</span>
              </div>

              <h1 style={{
                fontSize: '34px',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 12px 0',
                letterSpacing: '-0.8px',
                lineHeight: 1.2
              }}>
                Curate your cinematic universe with mathematical precision.
              </h1>

              <p style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.65)',
                lineHeight: 1.6,
                maxWidth: '680px',
                margin: '0 0 36px 0'
              }}>
                CineMatch isn't a passive streaming grid. We construct a dynamic mathematical profile of your film taste — learning from director signatures, narrative tropes, and your viewing affinity.
              </p>

              {/* 3 Architectural Pillars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c084fc'
                  }}>
                    <Layers size={20} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Detail Engine
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5, margin: 0 }}>
                    Extracts director lineages, cast affinities, and genre distribution vectors tailored to you.
                  </p>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}>
                    <Sparkles size={20} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Conversational AI
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5, margin: 0 }}>
                    Inquire about your film archetype, ask for bespoke mood recommendations, and explore cinema.
                  </p>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(234, 179, 8, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#eab308'
                  }}>
                    <Clapperboard size={20} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Adaptive Hero Canvas
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5, margin: 0 }}>
                    Your homepage hero poster immediately updates to showcase cinematic titles matching your persona.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
              <button
                onClick={() => setCurrentStep(2)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Initialize Taste Profile</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 2: STORYTELLING SENSIBILITIES & GENRES               */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
                  Select your core storytelling sensibilities
                </h2>
                <span style={{ fontSize: '13px', color: selectedGenreIds.length >= 3 ? '#a855f7' : 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
                  {selectedGenreIds.length} selected (3 recommended)
                </span>
              </div>

              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                Choose the narrative worlds and tones you gravitate toward. These form the primary weights of your affinity distribution.
              </p>

              {/* 12 Curated Genre Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {ONBOARDING_GENRES.map((genre) => {
                  const isSelected = selectedGenreIds.includes(genre.id);

                  return (
                    <div
                      key={genre.id}
                      onClick={() => handleToggleGenre(genre.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '16px',
                        backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1.5px solid rgba(168, 85, 247, 0.65)' : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        position: 'relative',
                        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                        userSelect: 'none',
                        boxShadow: isSelected ? '0 4px 16px rgba(139, 92, 246, 0.25)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '20px' }}>{genre.icon}</span>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#a855f7' : 'rgba(255, 255, 255, 0.08)',
                          border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          transition: 'all 0.15s ease'
                        }}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>

                      <span style={{ fontSize: '14.5px', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#fff' : '#f1f5f9', marginTop: '4px' }}>
                        {genre.name}
                      </span>
                      <span style={{ fontSize: '11.5px', color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.45)', lineHeight: 1.3 }}>
                        {genre.anchor}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px' }}>
              <button
                onClick={() => setCurrentStep(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.75)',
                  padding: '10px 18px',
                  borderRadius: '20px',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                disabled={selectedGenreIds.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '24px',
                  background: selectedGenreIds.length > 0
                    ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  cursor: selectedGenreIds.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  opacity: selectedGenreIds.length > 0 ? 1 : 0.5
                }}
              >
                <span>Continue to Anchor Films</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 3: UNIVERSAL ANCHOR FILMS (FAVORITES / RATINGS)      */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
                  Anchor your baseline with films you admire
                </h2>
                <span style={{ fontSize: '13px', color: favoriteMovieIds.length >= 2 ? '#a855f7' : 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
                  {favoriteMovieIds.length} anchor films selected
                </span>
              </div>

              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                Click any titles you’ve enjoyed or rated highly. These landmark anchors seed the collaborative filtering algorithms.
              </p>

              {/* 12 Anchor Films Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>
                {FOUNDATION_MOVIES.map((movie) => {
                  const isFavorited = favoriteMovieIds.includes(movie.id);

                  return (
                    <div
                      key={movie.id}
                      onClick={() => handleToggleMovie(movie.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        userSelect: 'none',
                        position: 'relative'
                      }}
                    >
                      {/* Poster Container */}
                      <div
                        style={{
                          position: 'relative',
                          aspectRatio: '2/3',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: '#181b26',
                          border: isFavorited
                            ? '2px solid #a855f7'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: isFavorited
                            ? '0 0 0 2px rgba(168, 85, 247, 0.4), 0 10px 24px rgba(168, 85, 247, 0.35)'
                            : '0 4px 12px rgba(0, 0, 0, 0.4)',
                          transform: isFavorited ? 'scale(1.03)' : 'scale(1)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isFavorited) {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isFavorited) {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <img
                          src={getPosterUrl(movie.poster_path, 'w342')}
                          alt={movie.title}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />

                        {/* Top Right Favorite Indicator Button */}
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: isFavorited ? '#a855f7' : 'rgba(0, 0, 0, 0.65)',
                          backdropFilter: 'blur(6px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                          transition: 'all 0.15s'
                        }}>
                          <Heart size={14} fill={isFavorited ? '#fff' : 'none'} />
                        </div>

                        {/* Bottom Vignette */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: '8px'
                        }}>
                          <span style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 600 }}>
                            {movie.release_year}
                          </span>
                        </div>
                      </div>

                      {/* Movie Title */}
                      <span style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        fontWeight: isFavorited ? 700 : 500,
                        color: isFavorited ? '#f8fafc' : 'rgba(255, 255, 255, 0.75)',
                        lineHeight: 1.3,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {movie.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px' }}>
              <button
                onClick={() => setCurrentStep(2)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.75)',
                  padding: '10px 18px',
                  borderRadius: '20px',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Synthesize Persona Dossier</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 4: SYNTHESIZED TASTE PERSONA & LAUNCH                */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1 }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '14px'
              }}>
                <ShieldCheck size={14} />
                <span>Taste Profile Synthesized</span>
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                Your CineMatch Cinematic Persona
              </h2>

              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', margin: '0 0 28px 0', lineHeight: 1.5 }}>
                The Detail Engine has synthesized your baseline taste vectors. Your recommendations and AI companion will calibrate to this identity.
              </p>

              {/* Persona Dossier Card */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1.5px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '20px',
                padding: '28px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(12, 15, 23, 0.8) 100%)',
                boxShadow: '0 16px 40px -10px rgba(139, 92, 246, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#c084fc', fontWeight: 700 }}>
                    Identified Archetype
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', margin: '4px 0 8px 0' }}>
                    {personaDossier.title}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                    {personaDossier.summary}
                  </p>
                </div>

                {/* Affinity Breakdown & Foundation Summary */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>
                      Primary Sensibility
                    </span>
                    <strong style={{ fontSize: '14px', color: '#f8fafc' }}>
                      {ONBOARDING_GENRES.find(g => selectedGenreIds.includes(g.id))?.name || 'Sci-Fi'}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>
                      Anchor Films Stored
                    </span>
                    <strong style={{ fontSize: '14px', color: '#f8fafc' }}>
                      {favoriteMovieIds.length} Initial Anchors
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>
                      CineMatch AI Assistant
                    </span>
                    <strong style={{ fontSize: '14px', color: '#a855f7' }}>
                      Profile Injected
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px' }}>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={isFinishing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.75)',
                  padding: '10px 18px',
                  borderRadius: '20px',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  cursor: isFinishing ? 'wait' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                onClick={handleFinish}
                disabled={isFinishing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 36px',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isFinishing ? 'wait' : 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  opacity: isFinishing ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isFinishing) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFinishing) {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isFinishing ? (
                  <span>Calibrating CineMatch...</span>
                ) : (
                  <>
                    <span>Enter CineMatch</span>
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
