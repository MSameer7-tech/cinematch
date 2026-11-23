import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, TasteProfile } from '../types/ai.types';
import { aiApi } from '../api/ai.api';
import { v4 as uuidv4 } from 'uuid';
import { movieService } from '../../movies/services/movie.service';
import type { HydratedRecommendation } from '../../recommendations/hooks/useRecommendations';

export const useAIChat = (userId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [isTasteLoading, setIsTasteLoading] = useState(false);
  const conversationId = useRef<string>(uuidv4());

  // Fetch initial taste profile for user
  useEffect(() => {
    if (!userId || userId === 'guest' || userId === 'guest-user') return;
    let isCancelled = false;
    setIsTasteLoading(true);

    aiApi.getTasteProfile(userId)
      .then(profile => {
        if (!isCancelled && profile) {
          setTasteProfile(profile);
        }
      })
      .catch(err => {
        console.warn('Initial taste profile load warning:', err);
      })
      .finally(() => {
        if (!isCancelled) setIsTasteLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const refreshTasteProfile = useCallback(async () => {
    if (!userId || userId === 'guest' || userId === 'guest-user') return null;
    setIsTasteLoading(true);
    try {
      const updated = await aiApi.refreshTasteProfile(userId);
      setTasteProfile(updated);
      return updated;
    } catch (err) {
      console.error('Failed to refresh taste profile:', err);
      return null;
    } finally {
      setIsTasteLoading(false);
    }
  }, [userId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await aiApi.sendMessage({
        conversation_id: conversationId.current,
        user_id: userId,
        message: content
      });

      // Update taste profile if backend returned latest version
      if (response.taste_profile) {
        setTasteProfile(response.taste_profile);
      }

      // Hydrate raw backend recommendations with full TMDB MovieDetails
      let hydratedMovies: HydratedRecommendation[] = [];
      if (response.movies && response.movies.length > 0) {
        const ids = response.movies
          .map((m: any) => m.movie_id || m.movieId || m.media_id)
          .filter(Boolean);

        if (ids.length > 0) {
          const detailsList = await movieService.getMoviesByIds(ids);
          const detailsMap = new Map(detailsList.map(m => [m.id, m]));

          hydratedMovies = response.movies
            .map((m: any) => {
              const mid = m.movie_id || m.movieId || m.media_id;
              const movie = detailsMap.get(mid);
              if (!movie) return null;
              return {
                movie,
                score: m.score,
                reasons: m.reasons || []
              };
            })
            .filter((item): item is HydratedRecommendation => !!item);
        }
      }

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.reply,
        movies: hydratedMovies
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Request Error:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [userId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    conversationId.current = uuidv4();
  }, []);

  return {
    messages,
    isTyping,
    tasteProfile,
    isTasteLoading,
    refreshTasteProfile,
    sendMessage,
    clearChat
  };
};
