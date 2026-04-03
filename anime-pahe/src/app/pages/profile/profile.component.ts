import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimeService } from '../../services/anime.service';
import { WatchlistService } from '../../services/watchlist.service';
import { AnimeCardComponent } from '../../components/anime-card/anime-card.component';
import { Anime, WatchProgress } from '../../models/anime.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, AnimeCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  watchlistAnime = signal<Anime[]>([]);
  continueWatching = signal<WatchProgress[]>([]);
  watchHistory = signal<WatchProgress[]>([]);
  loading = signal(true);

  stats = signal({
    totalWatched: 0,
    watchlistCount: 0,
    hoursWatched: 0,
    avgScore: 0,
  });

  favoriteGenres = signal<string[]>([]);

  badges = [
    { icon: '🎬', label: 'First Watch', desc: 'Watched your first anime' },
    { icon: '📚', label: 'Collector', desc: '10+ anime in watchlist' },
    { icon: '⭐', label: 'Critic', desc: 'Left your first review' },
    { icon: '🔥', label: 'Binge King', desc: 'Watched 5+ episodes in a day' },
    { icon: '🌸', label: 'Seasonal Fan', desc: 'Watched all seasonal anime' },
    { icon: '💎', label: 'Top Rated', desc: 'Watched all top 10 anime' },
  ];

  constructor(
    private animeService: AnimeService,
    public watchlistService: WatchlistService,
  ) {}

  ngOnInit(): void {
    this.continueWatching.set(this.watchlistService.getContinueWatching());
    this.watchHistory.set(this.watchlistService.getProgress());

    const ids = this.watchlistService.watchlistIds();
    this.stats.set({
      totalWatched: this.watchHistory().length,
      watchlistCount: ids.length,
      hoursWatched: Math.round(this.watchHistory().length * 0.4),
      avgScore: 8.4,
    });

    if (ids.length > 0) {
      const requests = ids.slice(0, 20).map(id => this.animeService.getAnimeById(id));
      if (requests.length > 0) {
        forkJoin(requests).subscribe({
          next: results => {
            this.watchlistAnime.set(results);
            const genreCounts = new Map<string, number>();
            results.forEach(a => a.genres?.forEach(g => {
              genreCounts.set(g.name, (genreCounts.get(g.name) ?? 0) + 1);
            }));
            this.favoriteGenres.set(
              [...genreCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name]) => name)
            );
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      } else {
        this.loading.set(false);
      }
    } else {
      this.loading.set(false);
    }
  }
}
