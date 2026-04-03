import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimeService } from '../../services/anime.service';
import { WatchlistService } from '../../services/watchlist.service';
import { AnimeCardComponent } from '../../components/anime-card/anime-card.component';
import { Anime } from '../../models/anime.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-watchlist-page',
  standalone: true,
  imports: [RouterLink, AnimeCardComponent],
  templateUrl: './watchlist-page.component.html',
  styleUrl: './watchlist-page.component.css',
})
export class WatchlistPageComponent implements OnInit {
  animeList = signal<Anime[]>([]);
  loading = signal(true);

  constructor(
    private animeService: AnimeService,
    public watchlist: WatchlistService,
  ) {}

  ngOnInit(): void {
    const ids = this.watchlist.watchlistIds();
    if (ids.length === 0) {
      this.loading.set(false);
      return;
    }

    forkJoin(
      ids.map(id => this.animeService.getAnimeById(id))
    ).subscribe({
      next: list => {
        this.animeList.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  removeAll(): void {
    this.watchlist.watchlistIds().forEach(id => this.watchlist.remove(id));
    this.animeList.set([]);
  }
}
