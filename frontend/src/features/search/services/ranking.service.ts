import type { MovieDetails } from '../../movies/types/movie.types';

export const rankingService = {
  calculateScore: (
    movie: MovieDetails,
    query: string,
    fuseScore: number, // 0.0 to 1.0 (higher is better)
    userTasteProfile: {
      favoriteGenres?: string[];
      favoriteDirectors?: string[];
      favoriteActors?: string[];
    } | null
  ): number => {
    let score = fuseScore * 10.0; // Base text similarity weight

    const lowerTitle = movie.title.toLowerCase();
    const lowerQuery = query.toLowerCase().trim();

    // 1. Exact Match Bonus (Phase 5)
    if (lowerTitle === lowerQuery) {
      score += 15.0;
    }

    // 2. Prefix Match Bonus (Phase 5)
    else if (lowerTitle.startsWith(lowerQuery)) {
      score += 5.0;
    }

    // 3. Quality & Popularity Boosts
    score += Math.min((movie.popularity || 0) / 100, 3.0); // Popularity scaling (max 3 points)
    score += ((movie.voteAverage ?? (movie as any).vote_average) || 0) * 0.5; // Vote average scaling (max 5 points)

    // 4. User Preference Personalization Bonus (Phase 5)
    if (userTasteProfile) {
      // Genre boost
      if (userTasteProfile.favoriteGenres && movie.genres) {
        const matchingGenres = movie.genres.filter((g) => 
          userTasteProfile.favoriteGenres?.some(fav => fav.toLowerCase() === g.name.toLowerCase())
        );
        score += matchingGenres.length * 2.0; // 2 points per preferred genre
      }

      // Director boost
      const movieDirector = (movie as any).director;
      if (userTasteProfile.favoriteDirectors && movieDirector) {
        const isFavDirector = userTasteProfile.favoriteDirectors.some(
          (d) => d.toLowerCase() === movieDirector?.toLowerCase()
        );
        if (isFavDirector) {
          score += 5.0;
        }
      }

      // Actor boost
      const movieCast = (movie as any).cast;
      if (userTasteProfile.favoriteActors && movieCast && Array.isArray(movieCast)) {
        const matchingActors = movieCast.filter((actor: string) => 
          userTasteProfile.favoriteActors?.some(fav => fav.toLowerCase() === actor.toLowerCase())
        );
        score += Math.min(matchingActors.length * 2.5, 7.5); // 2.5 points per matching actor (max 7.5)
      }
    }

    // Normalize raw ranking points (typically 5.0 to 35.0+) into a realistic 0.60 to 0.99 match percentage
    let normalizedScore: number;
    if (lowerTitle === lowerQuery) {
      // Exact match: 96% to 99% Match
      normalizedScore = 0.96 + Math.min(0.03, Math.max(0.0, (score - 25.0) / 100.0));
    } else {
      // Relevant search results: 60% to 92% Match based on title/genre/director affinity
      const norm = Math.max(0.0, Math.min(1.0, (score - 5.0) / 20.0));
      normalizedScore = 0.60 + (norm * 0.32);
    }

    return parseFloat(normalizedScore.toFixed(3));
  },

  generateMatchReasons: (
    movie: MovieDetails,
    query: string,
    userTasteProfile: any
  ): string[] => {
    const reasons: string[] = [];
    const lowerTitle = movie.title.toLowerCase();
    const lowerQuery = query.toLowerCase().trim();

    if (lowerTitle === lowerQuery) {
      reasons.push("Exact match");
    }

    if (userTasteProfile) {
      if (userTasteProfile.favoriteGenres && movie.genres) {
        const matching = movie.genres.find((g) => 
          userTasteProfile.favoriteGenres?.some((fav: string) => fav.toLowerCase() === g.name.toLowerCase())
        );
        if (matching) {
          reasons.push(`Preferred genre: ${matching.name}`);
        }
      }
      const movieDirector = (movie as any).director;
      if (userTasteProfile.favoriteDirectors && movieDirector) {
        const match = userTasteProfile.favoriteDirectors.some(
          (d: string) => d.toLowerCase() === movieDirector?.toLowerCase()
        );
        if (match) {
          reasons.push(`Directed by ${movieDirector}`);
        }
      }
    }

    // Default movie score
    const voteAvg = movie.voteAverage ?? (movie as any).vote_average ?? 0;
    if (voteAvg >= 8.0) {
      reasons.push("Highly rated");
    } else if (movie.popularity > 150) {
      reasons.push("Trending movie");
    }

    return reasons;
  }
};
