import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AIChat } from '../AIChat';
import { vi } from 'vitest';

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

// Mock the hook to prevent actual API calls
vi.mock('../../hooks/useAIChat', () => ({
  useAIChat: () => ({
    conversations: [],
    activeConversationId: null,
    activeConversationTitle: '',
    isConversationsLoading: false,
    messages: [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there! How can I help?' }
    ],
    isTyping: false,
    sendMessage: vi.fn(),
    selectConversation: vi.fn(),
    createNewConversation: vi.fn(),
    removeConversation: vi.fn(),
    renameConversation: vi.fn(),
  })
}));

vi.mock('../../../library/hooks/useWatchlist', () => ({
  useWatchlist: () => ({ data: [], isLoading: false }),
  useToggleWatchlist: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('AIChat Component', () => {
  it('renders chat messages correctly', () => {
    renderWithProviders(<AIChat userId="test-user" />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there! How can I help?')).toBeInTheDocument();
  });

  it('renders chat input', () => {
    renderWithProviders(<AIChat userId="test-user" />);
    expect(screen.getByPlaceholderText(/Ask for recommendations/i)).toBeInTheDocument();
  });
});
