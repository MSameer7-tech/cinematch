import React from 'react';
import type { ChatMessage } from '../types/ai.types';
import { RecommendationCarousel } from '../../recommendations/components/RecommendationCarousel';
import { Sparkles, User } from 'lucide-react';

export const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexDirection: isUser ? 'row-reverse' : 'row'
    }}>
      <div style={{
        flexShrink: 0,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        backgroundColor: isUser ? 'var(--primary-color)' : 'var(--bg-surface)',
        border: isUser ? 'none' : '1px solid var(--border-color)',
        color: isUser ? '#fff' : 'var(--primary-color)'
      }}>
        {isUser ? <User size={20} /> : <Sparkles size={20} />}
      </div>
      
      <div style={{
        maxWidth: '85%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: isUser ? 'flex-end' : 'flex-start'
      }}>
        <div style={{
          padding: '16px',
          borderRadius: '16px',
          borderTopRightRadius: isUser ? 0 : '16px',
          borderTopLeftRadius: isUser ? '16px' : 0,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          color: isUser ? '#fff' : 'var(--text-primary)',
          backgroundColor: isUser ? 'var(--primary-color)' : 'var(--bg-surface)',
          border: isUser ? 'none' : '1px solid var(--border-color)',
          lineHeight: 1.5
        }}>
          {message.content}
        </div>
        
        {message.movies && message.movies.length > 0 && (
          <div style={{ width: '100%', marginTop: '8px' }}>
            {/* Hardcode tracking false for AI context to keep it simple, or inject true. */}
            <RecommendationCarousel recommendations={message.movies} />
          </div>
        )}
      </div>
    </div>
  );
};
