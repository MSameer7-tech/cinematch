import type { 
  AIChatRequest, 
  AIChatResponse, 
  TasteProfile,
  ConversationSummary,
  ConversationDetail
} from '../types/ai.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const aiApi = {
  sendMessage: async (req: AIChatRequest): Promise<AIChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    
    if (!response.ok) {
      throw new Error(`AI Chat failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  listConversations: async (userId: string): Promise<ConversationSummary[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/conversations?user_id=${encodeURIComponent(userId || 'guest')}`);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  },

  getConversation: async (userId: string, conversationId: string): Promise<ConversationDetail | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}?user_id=${encodeURIComponent(userId || 'guest')}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  },

  saveConversation: async (userId: string, conversation: ConversationDetail): Promise<ConversationDetail> => {
    const response = await fetch(`${API_BASE_URL}/ai/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId || 'guest',
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to save conversation: ${response.statusText}`);
    }
    return response.json();
  },

  renameConversation: async (userId: string, conversationId: string, title: string): Promise<ConversationDetail> => {
    const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId || 'guest',
        title
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to rename conversation: ${response.statusText}`);
    }
    return response.json();
  },

  deleteConversation: async (userId: string, conversationId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}?user_id=${encodeURIComponent(userId || 'guest')}`, {
      method: 'DELETE'
    });
    return response.ok;
  },

  clearAllConversations: async (userId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/ai/conversations?user_id=${encodeURIComponent(userId || 'guest')}`, {
      method: 'DELETE'
    });
    return response.ok;
  },

  getTasteProfile: async (userId: string, refresh = false): Promise<TasteProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/taste-profile?refresh=${refresh}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch taste profile: ${response.statusText}`);
    }
    return response.json();
  },

  refreshTasteProfile: async (userId: string): Promise<TasteProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/taste-profile/refresh`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error(`Failed to refresh taste profile: ${response.statusText}`);
    }
    return response.json();
  }
};
