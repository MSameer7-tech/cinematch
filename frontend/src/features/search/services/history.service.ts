export const historyService = {
  getTrendingSearches: (): string[] => {
    return [
      'The Dark Knight',
      'Interstellar',
      'Inception',
      'Gladiator',
      'The Godfather',
      'Pulp Fiction'
    ];
  },

  getSuggestedSearches: (userTasteProfile: { favoriteGenres?: string[]; favoriteDirectors?: string[] } | null): string[] => {
    const suggestions: string[] = [];
    
    if (userTasteProfile) {
      if (userTasteProfile.favoriteDirectors && userTasteProfile.favoriteDirectors.length > 0) {
        suggestions.push(userTasteProfile.favoriteDirectors[0]);
      }
      if (userTasteProfile.favoriteGenres && userTasteProfile.favoriteGenres.length > 0) {
        suggestions.push(...userTasteProfile.favoriteGenres.slice(0, 2));
      }
    }
    
    // Fallbacks
    if (suggestions.length < 3) {
      suggestions.push('Christopher Nolan', 'Science Fiction', 'Action');
    }
    
    return Array.from(new Set(suggestions)).slice(0, 4);
  }
};
export default historyService;
