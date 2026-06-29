import type { FC } from 'react';
import { Search } from 'lucide-react';

export const SearchBar: FC = () => {
  return (
    <div className="search-container">
      <Search className="search-icon" />
      <input 
        type="text" 
        placeholder="Search movies, TV shows..." 
        className="search-input"
      />
    </div>
  );
};
