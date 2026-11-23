import { useState, useEffect } from 'react';
import indexService from '../services/index.service';

export interface SuggestionGroup {
  movies: { id: number; title: string }[];
  actors: string[];
  directors: string[];
  collections: string[];
  genres: string[];
}

export const useSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<SuggestionGroup>({
    movies: [],
    actors: [],
    directors: [],
    collections: [],
    genres: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions({ movies: [], actors: [], directors: [], collections: [], genres: [] });
      return;
    }

    // Debounce duration: 250ms (Phase 6)
    const timer = setTimeout(() => {
      setLoading(true);
      const bootstrap = indexService.getIndex();
      if (!bootstrap) {
        setLoading(false);
        return;
      }

      const q = query.toLowerCase().trim();
      const matchedMovies: { id: number; title: string }[] = [];
      const matchedActors = new Set<string>();
      const matchedDirectors = new Set<string>();
      const matchedCollections = new Set<string>();
      const matchedGenres = new Set<string>();

      // 1. Genres matches
      bootstrap.genres.forEach(genre => {
        if (genre.toLowerCase().includes(q) && matchedGenres.size < 3) {
          matchedGenres.add(genre);
        }
      });

      // 2. Collection keywords matches
      const collectionsKeywords = ["marvel", "star wars", "harry potter", "lord of the rings", "disney", "pixar", "batman", "avengers", "james bond", "jurassic park"];

      bootstrap.movies.forEach((movie) => {
        // Movies title matches (max 5)
        if (movie.title.toLowerCase().includes(q)) {
          if (matchedMovies.length < 5) {
            matchedMovies.push({ id: movie.id, title: movie.title });
          }
        }

        // Actors matches (max 5)
        movie.cast.forEach((actor) => {
          if (actor.toLowerCase().includes(q) && matchedActors.size < 5) {
            matchedActors.add(actor);
          }
        });

        // Directors matches (max 3)
        if (movie.director && movie.director.toLowerCase().includes(q) && matchedDirectors.size < 3) {
          matchedDirectors.add(movie.director);
        }

        // Collections keyword matches
        movie.keywords.forEach((kw) => {
          const lkw = kw.toLowerCase();
          const matchCollection = collectionsKeywords.some(col => col.includes(lkw) || lkw.includes(col));
          if (matchCollection && lkw.includes(q) && matchedCollections.size < 3) {
            // Capitalize keyword for clean label
            matchedCollections.add(kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          }
        });
      });

      setSuggestions({
        movies: matchedMovies,
        actors: Array.from(matchedActors),
        directors: Array.from(matchedDirectors),
        collections: Array.from(matchedCollections),
        genres: Array.from(matchedGenres),
      });
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading };
};
export default useSuggestions;
