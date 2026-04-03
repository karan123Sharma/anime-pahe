export interface HeroSlideGenre {
  id: number;
  name: string;
}

/**
 * Hero carousel slide — from discover `top_rated` (Jikan) or fallback DB anime.
 */
export interface HeroSlide {
  id: number;
  title: string;
  synopsis: string | null;
  posterUrl: string;
  bannerUrl?: string | null;
  type?: string;
  season?: string | null;
  seasonYear?: number | null;
  score?: number | null;
  genres: HeroSlideGenre[];
  /** In-app detail route; omit/null to open Browse with title search */
  slug?: string | null;
  /** MyAnimeList URL (discover cards); optional for DB fallback */
  malUrl?: string | null;
  /** DB anime id — enables + Watchlist on the hero */
  libraryId?: number | null;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Anime {
  id: number;
  malId: number;
  title: string;
  titleJapanese: string;
  slug: string;
  synopsis: string;
  posterUrl: string;
  bannerUrl: string;
  type: string;
  status: string;
  season: string;
  seasonYear: number;
  episodeCount: number;
  score: number;
  airedFrom: string;
  airedTo: string;
  genres: Genre[];
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: number;
  animeId: number;
  animeTitle: string;
  episodeNumber: number;
  title: string;
  duration: string;
  streamUrl: string;
  thumbnailUrl: string;
  airedDate: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/** Matches backend AnimeSearchResponse — DB hits or Jikan import. */
export interface AnimeSearchResponse {
  source: 'database' | 'jikan' | string;
  results: Anime[];
}

export interface WatchProgress {
  animeId: number;
  animeSlug: string;
  animeTitle: string;
  animePosterUrl: string;
  episodeNumber: number;
  progress: number;
  timestamp: number;
}
