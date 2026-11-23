import { useEffect } from 'react';
import { useSearchStore } from '../stores/search.store';

export const useRecentSearches = () => {
  const { 
    history, 
    loadHistory, 
    addHistory, 
    deleteHistoryItem, 
    clearHistory 
  } = useSearchStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    addSearch: addHistory,
    removeSearch: deleteHistoryItem,
    clearAll: clearHistory,
  };
};
