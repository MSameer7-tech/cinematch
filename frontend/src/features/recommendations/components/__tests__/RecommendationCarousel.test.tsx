import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecommendationCarousel } from '../RecommendationCarousel';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../../../auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com', onboardingCompleted: true },
    authState: { status: 'AUTHENTICATED', user: { id: 'test-user' }, guest: null },
    isInitializing: false,
    isSubmitting: false,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

const mockRecommendations = [
  {
    movie: {
      id: 1,
      title: 'Inception',
      posterUrl: '/poster.jpg',
      releaseDate: '2010-07-16',
      voteAverage: 8.8,
      overview: 'A thief who steals corporate secrets...',
      genres: [{ id: 878, name: 'Science Fiction' }]
    },
    score: 0.95,
    reasons: ['Because you like Sci-Fi.']
  }
];

describe('RecommendationCarousel Component', () => {
  it('renders a list of recommendations', () => {
    renderWithProviders(<RecommendationCarousel recommendations={mockRecommendations as any} />);
    
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('95% Match')).toBeInTheDocument();
    expect(screen.getByText(/Because you like Sci-Fi\./i)).toBeInTheDocument();
  });

  it('renders nothing when no recommendations are provided', () => {
    const { container } = renderWithProviders(<RecommendationCarousel recommendations={[]} />);
    
    expect(container.firstChild).toBeNull();
  });
});
