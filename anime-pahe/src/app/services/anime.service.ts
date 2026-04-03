import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Anime, AnimeSearchResponse, Episode, Genre, PageResponse } from '../models/anime.model';
import { DiscoverSectionsResponse } from '../models/discover.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnimeService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAnimeList(page = 0, size = 20, sort = 'score,desc'): Observable<PageResponse<Anime>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PageResponse<Anime>>(`${this.api}/anime`, { params });
  }

  /** Title search (DB first, else Jikan import). Backend requires non-empty q. */
  searchAnime(q: string, page = 0, size = 24): Observable<AnimeSearchResponse> {
    const params = new HttpParams()
      .set('q', q.trim())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<AnimeSearchResponse>(`${this.api}/anime/search`, { params });
  }

  getAnimeById(id: number): Observable<Anime> {
    return this.http.get<Anime>(`${this.api}/anime/${id}`);
  }

  getAnimeBySlug(slug: string): Observable<Anime> {
    return this.http.get<Anime>(`${this.api}/anime/slug/${slug}`);
  }

  getAnimeByStatus(status: string): Observable<Anime[]> {
    return this.http.get<Anime[]>(`${this.api}/anime/status/${status}`);
  }

  getEpisodes(animeId: number): Observable<Episode[]> {
    return this.http.get<Episode[]>(`${this.api}/anime/${animeId}/episodes`);
  }

  getEpisode(animeId: number, episodeNumber: number): Observable<Episode> {
    return this.http.get<Episode>(`${this.api}/anime/${animeId}/episodes/${episodeNumber}`);
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.api}/genres`);
  }

  /** Homepage rows from Jikan (seasons/now, top anime filters, etc.). */
  getDiscoverSections(): Observable<DiscoverSectionsResponse> {
    return this.http.get<DiscoverSectionsResponse>(`${this.api}/discover/sections`);
  }
}
