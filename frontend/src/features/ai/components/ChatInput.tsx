import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: 'var(--bg-surface)',
        padding: '8px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder="E.g., Recommend something like Interstellar but happier..."
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '0 16px',
          color: 'var(--text-primary)',
          fontSize: '15px'
        }}
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        style={{
          backgroundColor: 'var(--primary-color)',
          color: '#fff',
          padding: '12px',
          borderRadius: '12px',
          border: 'none',
          cursor: (disabled || !input.trim()) ? 'not-allowed' : 'pointer',
          opacity: (disabled || !input.trim()) ? 0.5 : 1,
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (!disabled && input.trim()) {
            e.currentTarget.style.backgroundColor = 'var(--primary-color-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && input.trim()) {
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
          }
        }}
      >
        <Send size={20} />
      </button>
    </form>
  );
};
