export interface WatchlistEntry {
  id: string;
  user_id: string;
  media_id: number;
  created_at: string;
}

export interface FavoriteEntry {
  id: string;
  user_id: string;
  media_id: number;
  created_at: string;
}

export interface RecentlyViewedEntry {
  id: string;
  user_id: string;
  media_id: number;
  viewed_at: string;
}

export interface RatingEntry {
  id: string;
  user_id: string;
  media_id: number;
  rating: number;
  rated_at: string;
}

export interface UserPreferences {
  user_id: string;
  favorite_genres: number[];
  favorite_decades: number[];
  favorite_languages: string[];
  favorite_countries: string[];
  favorite_runtime: number | null;
  favorite_moods: string[];
  hide_watched: boolean;
  include_adult: boolean;
  preferred_providers: number[];
  favorite_directors: number[];
  favorite_actors: number[];
  theme: string;
  created_at: string;
  updated_at: string;
}
