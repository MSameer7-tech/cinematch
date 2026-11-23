import { render, screen } from '@testing-library/react';
import { RecommendationCarousel } from '../RecommendationCarousel';
import { BrowserRouter } from 'react-router-dom';

const mockRecommendations = [
  {
    movie: {
      id: 1,
      title: 'Inception',
      poster_path: '/poster.jpg',
      release_date: '2010-07-16',
      vote_average: 8.8,
      overview: 'A thief who steals corporate secrets...'
    },
    score: 0.95,
    match_percentage: 95,
    explanation: 'Because you like Sci-Fi.'
  }
];

describe('RecommendationCarousel Component', () => {
  it('renders a list of recommendations', () => {
    render(
      <BrowserRouter>
        <RecommendationCarousel recommendations={mockRecommendations} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('95% Match')).toBeInTheDocument();
    expect(screen.getByText('Because you like Sci-Fi.')).toBeInTheDocument();
  });

  it('renders empty state when no recommendations are provided', () => {
    render(
      <BrowserRouter>
        <RecommendationCarousel recommendations={[]} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/No recommendations available/i)).toBeInTheDocument();
  });
});
