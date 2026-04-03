import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnimeService } from '../../services/anime.service';
import { WatchlistService } from '../../services/watchlist.service';
import { Anime, Episode } from '../../models/anime.model';
import { AnimeCardComponent } from '../../components/anime-card/anime-card.component';

@Component({
  selector: 'app-anime-detail',
  standalone: true,
  imports: [RouterLink, AnimeCardComponent],
  templateUrl: './anime-detail.component.html',
  styleUrl: './anime-detail.component.css',
})
export class AnimeDetailComponent implements OnInit {
  anime = signal<Anime | null>(null);
  episodes = signal<Episode[]>([]);
  related = signal<Anime[]>([]);
  activeTab = signal<'overview' | 'episodes' | 'reviews' | 'related'>('overview');
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private animeService: AnimeService,
    public watchlist: WatchlistService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) this.loadAnime(slug);
    });
  }

  private loadAnime(slug: string): void {
    this.loading.set(true);
    this.animeService.getAnimeBySlug(slug).subscribe({
      next: anime => {
        this.anime.set(anime);
        this.loading.set(false);
        this.loadEpisodes(anime.id);
        this.loadRelated();
      },
      error: () => this.loading.set(false),
    });
  }

  private loadEpisodes(animeId: number): void {
    this.animeService.getEpisodes(animeId).subscribe({
      next: eps => this.episodes.set(eps),
    });
  }

  private loadRelated(): void {
    this.animeService.getAnimeList(0, 8, 'score,desc').subscribe({
      next: page => {
        const a = this.anime();
        this.related.set(
          page.content.filter(r => r.id !== a?.id).slice(0, 6)
        );
      },
    });
  }

  setTab(tab: 'overview' | 'episodes' | 'reviews' | 'related'): void {
    this.activeTab.set(tab);
  }

  toggleWatchlist(): void {
    const a = this.anime();
    if (a) this.watchlist.toggle(a.id);
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  get statusClass(): string {
    const s = this.anime()?.status?.toLowerCase() ?? '';
    if (s.includes('airing')) return 'status-airing';
    if (s.includes('complete')) return 'status-completed';
    return 'status-upcoming';
  }
}
