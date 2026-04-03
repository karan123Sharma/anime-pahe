/** Jikan-backed card from /api/discover/sections (not a full DB Anime). */
export interface AnimeSectionCard {
  malId: number;
  title: string;
  titleJapanese: string;
  posterUrl: string;
  type: string;
  status: string;
  episodes: number | null;
  score: number | null;
  year: number | null;
  season: string | null;
  synopsis: string | null;
  malUrl: string;
}

export interface AnimeSection {
  id: string;
  title: string;
  subtitle: string;
  items: AnimeSectionCard[];
}

export interface DiscoverSectionsResponse {
  sections: AnimeSection[];
}
