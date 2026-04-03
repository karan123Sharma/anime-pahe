import { Injectable, signal, computed } from '@angular/core';
import { WatchProgress } from '../models/anime.model';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly WATCHLIST_KEY = 'animepahe_watchlist';
  private readonly PROGRESS_KEY = 'animepahe_progress';

  readonly watchlistIds = signal<number[]>(this.loadIds());
  readonly watchlistCount = computed(() => this.watchlistIds().length);

  private loadIds(): number[] {
    try {
      return JSON.parse(localStorage.getItem(this.WATCHLIST_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private persist(ids: number[]): void {
    localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(ids));
    this.watchlistIds.set(ids);
  }

  isInWatchlist(animeId: number): boolean {
    return this.watchlistIds().includes(animeId);
  }

  toggle(animeId: number): boolean {
    const ids = [...this.watchlistIds()];
    const idx = ids.indexOf(animeId);
    if (idx >= 0) {
      ids.splice(idx, 1);
      this.persist(ids);
      return false;
    }
    ids.unshift(animeId);
    this.persist(ids);
    return true;
  }

  add(animeId: number): void {
    if (!this.isInWatchlist(animeId)) {
      this.persist([animeId, ...this.watchlistIds()]);
    }
  }

  remove(animeId: number): void {
    this.persist(this.watchlistIds().filter(id => id !== animeId));
  }

  getProgress(): WatchProgress[] {
    try {
      return JSON.parse(localStorage.getItem(this.PROGRESS_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  saveProgress(entry: WatchProgress): void {
    const list = this.getProgress();
    const idx = list.findIndex(
      p => p.animeId === entry.animeId && p.episodeNumber === entry.episodeNumber
    );
    if (idx >= 0) list[idx] = entry;
    else list.unshift(entry);
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(list.slice(0, 100)));
  }

  getContinueWatching(): WatchProgress[] {
    return this.getProgress()
      .filter(p => p.progress < 95)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }
}
