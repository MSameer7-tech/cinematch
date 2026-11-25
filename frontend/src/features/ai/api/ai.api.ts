import { supabase } from '../../../lib/supabase';
import type { 
  AIChatRequest, 
  AIChatResponse, 
  TasteProfile,
  ConversationSummary,
  ConversationDetail
} from '../types/ai.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = async (includeJson = false): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch {
    // Ignore session read errors
  }
  return headers;
};

export const aiApi = {
  sendMessage: async (req: AIChatRequest): Promise<AIChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: await getAuthHeaders(true),
      body: JSON.stringify(req)
    });
    
    if (!response.ok) {
      throw new Error(`AI Chat failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  listConversations: async (userId: string): Promise<ConversationSummary[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ai/conversations?user_id=${encodeURIComponent(userId)}`,
        { headers: await getAuthHeaders() }
      );
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  },

  getConversation: async (userId: string, conversationId: string): Promise<ConversationDetail | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ai/conversations/${encodeURIComponent(conversationId)}?user_id=${encodeURIComponent(userId)}`,
        { headers: await getAuthHeaders() }
      );
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  },

  saveConversation: async (userId: string, conversation: ConversationDetail): Promise<ConversationDetail> => {
    const response = await fetch(`${API_BASE_URL}/ai/conversations`, {
      method: 'POST',
      headers: await getAuthHeaders(true),
      body: JSON.stringify({
        user_id: userId,
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
    const response = await fetch(`${API_BASE_URL}/ai/conversations/${encodeURIComponent(conversationId)}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(true),
      body: JSON.stringify({
        user_id: userId,
        title
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to rename conversation: ${response.statusText}`);
    }
    return response.json();
  },

  deleteConversation: async (userId: string, conversationId: string): Promise<boolean> => {
    const response = await fetch(
      `${API_BASE_URL}/ai/conversations/${encodeURIComponent(conversationId)}?user_id=${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
        headers: await getAuthHeaders()
      }
    );
    return response.ok;
  },

  clearAllConversations: async (userId: string): Promise<boolean> => {
    const response = await fetch(
      `${API_BASE_URL}/ai/conversations?user_id=${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
        headers: await getAuthHeaders()
      }
    );
    return response.ok;
  },

  getTasteProfile: async (userId: string, refresh = false): Promise<TasteProfile> => {
    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(userId)}/taste-profile?refresh=${refresh}`,
      { headers: await getAuthHeaders() }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch taste profile: ${response.statusText}`);
    }
    return response.json();
  },

  refreshTasteProfile: async (userId: string): Promise<TasteProfile> => {
    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(userId)}/taste-profile/refresh`,
      {
        method: 'POST',
        headers: await getAuthHeaders()
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to refresh taste profile: ${response.statusText}`);
    }
    return response.json();
  }
};
