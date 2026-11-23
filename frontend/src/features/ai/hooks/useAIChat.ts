import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, TasteProfile, ConversationSummary, ConversationDetail } from '../types/ai.types';
import { aiApi } from '../api/ai.api';
import { v4 as uuidv4 } from 'uuid';
import { movieService } from '../../movies/services/movie.service';
import type { HydratedRecommendation } from '../../recommendations/hooks/useRecommendations';

const getStorageKey = (userId: string) => `cinematch_ai_convos_${userId || 'guest'}`;

export const useAIChat = (userId: string) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>(() => uuidv4());
  const [activeConversationTitle, setActiveConversationTitle] = useState<string>('New Chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConversationsLoading, setIsConversationsLoading] = useState(false);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [isTasteLoading, setIsTasteLoading] = useState(false);

  // Ref to track latest active conversation ID and title in callbacks
  const activeIdRef = useRef(activeConversationId);
  activeIdRef.current = activeConversationId;
  const activeTitleRef = useRef(activeConversationTitle);
  activeTitleRef.current = activeConversationTitle;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // 1. Load conversations from localStorage first (0ms instant render), then sync with backend
  useEffect(() => {
    const safeUserId = userId || 'guest';
    const storageKey = getStorageKey(safeUserId);
    
    // Read local cache first
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached conversations:', e);
    }

    // Sync with backend API
    setIsConversationsLoading(true);
    aiApi.listConversations(safeUserId)
      .then((serverConvos) => {
        if (serverConvos && serverConvos.length > 0) {
          setConversations(serverConvos);
          try {
            localStorage.setItem(storageKey, JSON.stringify(serverConvos));
          } catch {
            // Ignore quota
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load conversations from server:', err);
      })
      .finally(() => {
        setIsConversationsLoading(false);
      });
  }, [userId]);

  // 2. Fetch initial taste profile for user
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

  // Helper to persist conversation update
  const persistConversation = useCallback(async (
    convoId: string, 
    title: string, 
    updatedMessages: ChatMessage[]
  ) => {
    const safeUserId = userId || 'guest';
    const detail: ConversationDetail = {
      id: convoId,
      title,
      messages: updatedMessages
    };

    // 1. Update local storage summary
    setConversations(prev => {
      const existingIdx = prev.findIndex(c => c.id === convoId);
      const now = new Date().toISOString();
      const lastMsg = updatedMessages[updatedMessages.length - 1]?.content || '';
      
      let nextList: ConversationSummary[];
      if (existingIdx >= 0) {
        nextList = [...prev];
        nextList[existingIdx] = {
          ...nextList[existingIdx],
          title,
          updated_at: now,
          message_count: updatedMessages.length,
          last_message: lastMsg.slice(0, 80)
        };
      } else {
        const newSummary: ConversationSummary = {
          id: convoId,
          title,
          created_at: now,
          updated_at: now,
          message_count: updatedMessages.length,
          last_message: lastMsg.slice(0, 80)
        };
        nextList = [newSummary, ...prev];
      }

      // Save list to localStorage
      try {
        localStorage.setItem(getStorageKey(safeUserId), JSON.stringify(nextList));
        // Also save full convo payload to localStorage for instant switching
        localStorage.setItem(`cinematch_ai_convo_detail_${convoId}`, JSON.stringify(detail));
      } catch {
        // Ignore quota
      }
      return nextList;
    });

    // 2. Sync to backend
    try {
      await aiApi.saveConversation(safeUserId, detail);
    } catch (err) {
      console.warn('Failed to sync conversation to backend:', err);
    }
  }, [userId]);

  // CRUD 1: Create New Chat
  const createNewChat = useCallback(() => {
    const newId = uuidv4();
    setActiveConversationId(newId);
    setActiveConversationTitle('New Chat');
    setMessages([]);
  }, []);

  // CRUD 2: Read / Select an Existing Conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    if (conversationId === activeIdRef.current) return;

    setActiveConversationId(conversationId);
    const existingSummary = conversations.find(c => c.id === conversationId);
    if (existingSummary) {
      setActiveConversationTitle(existingSummary.title);
    }

    // Try loading full details from localStorage first
    let loadedMessages: ChatMessage[] | null = null;
    try {
      const cachedDetail = localStorage.getItem(`cinematch_ai_convo_detail_${conversationId}`);
      if (cachedDetail) {
        const parsed: ConversationDetail = JSON.parse(cachedDetail);
        if (parsed && Array.isArray(parsed.messages)) {
          loadedMessages = parsed.messages;
          setMessages(parsed.messages);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached convo detail:', e);
    }

    // Fetch from backend
    try {
      const serverDetail = await aiApi.getConversation(userId || 'guest', conversationId);
      if (serverDetail && Array.isArray(serverDetail.messages)) {
        setMessages(serverDetail.messages);
        setActiveConversationTitle(serverDetail.title || 'Conversation');
        try {
          localStorage.setItem(`cinematch_ai_convo_detail_${conversationId}`, JSON.stringify(serverDetail));
        } catch {
          // Ignore
        }
      } else if (!loadedMessages) {
        setMessages([]);
      }
    } catch (err) {
      console.warn('Failed to fetch conversation from server:', err);
    }
  }, [conversations, userId]);

  // CRUD 3: Update / Rename Conversation
  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return;

    const safeUserId = userId || 'guest';

    // Optimistic UI update
    setConversations(prev => {
      const updated = prev.map(c => c.id === conversationId ? { ...c, title: cleanTitle } : c);
      try {
        localStorage.setItem(getStorageKey(safeUserId), JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (activeIdRef.current === conversationId) {
      setActiveConversationTitle(cleanTitle);
    }

    // Update detail in localStorage
    try {
      const detailKey = `cinematch_ai_convo_detail_${conversationId}`;
      const cached = localStorage.getItem(detailKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.title = cleanTitle;
        localStorage.setItem(detailKey, JSON.stringify(parsed));
      }
    } catch {}

    // Send to backend
    try {
      await aiApi.renameConversation(safeUserId, conversationId, cleanTitle);
    } catch (err) {
      console.error('Failed to rename conversation on server:', err);
    }
  }, [userId]);

  // CRUD 4: Delete Single Conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    const safeUserId = userId || 'guest';

    // Remove from localStorage
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== conversationId);
      try {
        localStorage.setItem(getStorageKey(safeUserId), JSON.stringify(updated));
        localStorage.removeItem(`cinematch_ai_convo_detail_${conversationId}`);
      } catch {}
      return updated;
    });

    // If the active conversation was deleted, switch to another or create new
    if (activeIdRef.current === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId);
      if (remaining.length > 0) {
        selectConversation(remaining[0].id);
      } else {
        createNewChat();
      }
    }

    // Delete on server
    try {
      await aiApi.deleteConversation(safeUserId, conversationId);
    } catch (err) {
      console.error('Failed to delete conversation on server:', err);
    }
  }, [conversations, userId, selectConversation, createNewChat]);

  // CRUD 5: Clear All Conversations
  const clearAllConversations = useCallback(async () => {
    const safeUserId = userId || 'guest';
    setConversations([]);
    try {
      localStorage.removeItem(getStorageKey(safeUserId));
    } catch {}
    createNewChat();

    try {
      await aiApi.clearAllConversations(safeUserId);
    } catch (err) {
      console.error('Failed to clear all conversations on server:', err);
    }
  }, [userId, createNewChat]);

  // Send message in current conversation
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const currentConvoId = activeIdRef.current;
    let currentTitle = activeTitleRef.current;

    // Auto-generate title if this is a fresh conversation
    if (messagesRef.current.length === 0 || currentTitle === 'New Chat') {
      currentTitle = content.trim().slice(0, 36) + (content.trim().length > 36 ? '...' : '');
      setActiveConversationTitle(currentTitle);
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content
    };

    const updatedWithUser = [...messagesRef.current, userMessage];
    setMessages(updatedWithUser);
    setIsTyping(true);

    try {
      const response = await aiApi.sendMessage({
        conversation_id: currentConvoId,
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

      const finalMessages = [...updatedWithUser, assistantMessage];
      setMessages(finalMessages);

      // Persist conversation with both user & assistant messages
      persistConversation(currentConvoId, currentTitle, finalMessages);
    } catch (error) {
      console.error('AI Request Error:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      };
      const finalMessages = [...updatedWithUser, errorMessage];
      setMessages(finalMessages);
      persistConversation(currentConvoId, currentTitle, finalMessages);
    } finally {
      setIsTyping(false);
    }
  }, [userId, persistConversation]);

  return {
    conversations,
    activeConversationId,
    activeConversationTitle,
    isConversationsLoading,
    messages,
    isTyping,
    tasteProfile,
    isTasteLoading,
    refreshTasteProfile,
    sendMessage,
    createNewChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations
  };
};
