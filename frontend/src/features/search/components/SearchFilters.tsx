import type { FC } from 'react';
import { useSearchStore } from '../stores/search.store';
import indexService from '../services/index.service';
import type { SortOption } from '../types/search.types';

export const SearchFilters: FC = () => {
  const { filters, setFilters, resetFilters, sort, setSort } = useSearchStore();
  const bootstrap = indexService.getIndex();

  const handleGenreToggle = (genreName: string) => {
    const active = filters.genres;
    const updated = active.includes(genreName)
      ? active.filter((g) => g !== genreName)
      : [...active, genreName];
    setFilters({ genres: updated });
  };

  return (
    <div 
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        position: 'sticky',
        top: '100px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Filters</h3>
        <button 
          onClick={resetFilters}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-primary, #E50914)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Reset All
        </button>
      </div>

      {/* Sort Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort By</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="relevance">Relevance</option>
          <option value="popularity">Popularity</option>
          <option value="rating">Rating</option>
          <option value="newest">Newest Releases</option>
          <option value="oldest">Oldest Releases</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {/* Content Type Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Content Type</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['both', 'movie', 'tv'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilters({ contentType: type })}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: filters.contentType === type ? 'var(--color-primary, #E50914)' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: filters.contentType === type ? 'rgba(229, 9, 20, 0.1)' : 'transparent',
                color: filters.contentType === type ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {type === 'both' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Genres Checklist Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Genres</label>
        <div 
          style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            maxHeight: '180px', 
            overflowY: 'auto',
            paddingRight: '4px'
          }}
          className="hide-scrollbar"
        >
          {bootstrap?.genres.map((genre) => {
            const isSelected = filters.genres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--color-primary, #E50914)' : 'rgba(255, 255, 255, 0.08)',
                  backgroundColor: isSelected ? 'var(--color-primary, #E50914)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Filter Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Minimum Rating</label>
          <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{filters.ratingMin || '0.0'}+</span>
        </div>
        <input 
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={filters.ratingMin || 0}
          onChange={(e) => setFilters({ ratingMin: parseFloat(e.target.value) || null })}
          style={{
            accentColor: 'var(--color-primary, #E50914)',
            cursor: 'pointer',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            outline: 'none'
          }}
        />
      </div>

      {/* Runtime Limits */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Max Runtime</label>
          <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
            {filters.runtimeMax ? `${filters.runtimeMax} min` : 'Any'}
          </span>
        </div>
        <input 
          type="range"
          min="30"
          max="240"
          step="10"
          value={filters.runtimeMax || 240}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setFilters({ runtimeMax: val === 240 ? null : val });
          }}
          style={{
            accentColor: 'var(--color-primary, #E50914)',
            cursor: 'pointer',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            outline: 'none'
          }}
        />
      </div>

      {/* Language Option Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Language</label>
        <select
          value={filters.language || ''}
          onChange={(e) => setFilters({ language: e.target.value || null })}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          <option value="">Any Language</option>
          {bootstrap?.languages.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Year Range Selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Release Year Range</label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="number"
            placeholder="Min"
            value={filters.yearMin || ''}
            onChange={(e) => setFilters({ yearMin: parseInt(e.target.value) || null })}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
              fontSize: '13px',
              color: '#fff',
              outline: 'none',
              textAlign: 'center'
            }}
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>to</span>
          <input 
            type="number"
            placeholder="Max"
            value={filters.yearMax || ''}
            onChange={(e) => setFilters({ yearMax: parseInt(e.target.value) || null })}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
              fontSize: '13px',
              color: '#fff',
              outline: 'none',
              textAlign: 'center'
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default SearchFilters;
