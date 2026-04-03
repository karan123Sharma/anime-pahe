import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Anime } from '../../models/anime.model';
import { WatchlistService } from '../../services/watchlist.service';

@Component({
  selector: 'app-anime-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './anime-card.component.html',
  styleUrl: './anime-card.component.css',
})
export class AnimeCardComponent {
  @Input({ required: true }) anime!: Anime;
  @Input() showRank = false;
  @Input() rank = 0;

  constructor(public watchlist: WatchlistService) {}

  get scoreDisplay(): string {
    return this.anime.score ? this.anime.score.toFixed(1) : 'N/A';
  }

  get genreText(): string {
    return (this.anime.genres ?? []).slice(0, 2).map(g => g.name).join(' · ');
  }

  toggleWatchlist(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.watchlist.toggle(this.anime.id);
  }
}
