import { render, screen, fireEvent } from '@testing-library/react';
import { AIChat } from '../AIChat';
import { vi } from 'vitest';

// Mock the hook to prevent actual API calls
vi.mock('../../hooks/useAIChat', () => ({
  useAIChat: () => ({
    messages: [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there! How can I help?' }
    ],
    isTyping: false,
    sendMessage: vi.fn(),
  })
}));

describe('AIChat Component', () => {
  it('renders chat messages correctly', () => {
    render(<AIChat userId="test-user" />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there! How can I help?')).toBeInTheDocument();
  });

  it('renders chat input', () => {
    render(<AIChat userId="test-user" />);
    expect(screen.getByPlaceholderText(/E.g., Recommend something/i)).toBeInTheDocument();
  });
});
