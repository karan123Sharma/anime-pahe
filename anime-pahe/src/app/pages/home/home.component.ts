import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { HeroCarouselComponent } from '../../components/hero-carousel/hero-carousel.component';
import { DiscoverCardComponent } from '../../components/discover-card/discover-card.component';
import { AnimeService } from '../../services/anime.service';
import { WatchlistService } from '../../services/watchlist.service';
import { Anime, HeroSlide, WatchProgress } from '../../models/anime.model';
import { AnimeSection, AnimeSectionCard } from '../../models/discover.model';

const HERO_MAX_SLIDES = 6;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HeroCarouselComponent, DiscoverCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);

  heroSlides = signal<HeroSlide[]>([]);
  discoverSections = signal<AnimeSection[]>([]);
  recentlyUpdated = signal<Anime[]>([]);
  continueWatching = signal<WatchProgress[]>([]);
  loading = signal(true);

  constructor(
    private animeService: AnimeService,
    private watchlistService: WatchlistService,
  ) {}

  ngAfterViewInit(): void {
    queueMicrotask(() => this.refreshScrollRails());
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.refreshScrollRails();
  }

  ngOnInit(): void {
    this.continueWatching.set(this.watchlistService.getContinueWatching());

    forkJoin({
      discover: this.animeService.getDiscoverSections().pipe(
        catchError(() => of({ sections: [] as AnimeSection[] })),
      ),
      heroFallback: this.animeService.getAnimeList(0, 8, 'score,desc'),
      recent: this.animeService.getAnimeList(0, 12, 'updatedAt,desc'),
    }).subscribe({
      next: ({ discover, heroFallback, recent }) => {
        const sections = (discover.sections ?? []).map(s => ({
          ...s,
          items: s.items ?? [],
        }));
        this.discoverSections.set(sections);

        const topRated = sections.find(s => s.id === 'top_rated');
        const fromTopRated = (topRated?.items ?? [])
          .slice(0, HERO_MAX_SLIDES)
          .map(c => this.cardToHeroSlide(c));

        if (fromTopRated.length > 0) {
          this.heroSlides.set(fromTopRated);
        } else {
          this.heroSlides.set(
            heroFallback.content.slice(0, 5).map(a => this.animeToHeroSlide(a)),
          );
        }

        this.recentlyUpdated.set(recent.content);
        this.loading.set(false);
        setTimeout(() => this.refreshScrollRails(), 0);
      },
      error: () => this.loading.set(false),
    });
  }

  private cardToHeroSlide(card: AnimeSectionCard): HeroSlide {
    return {
      id: card.malId,
      title: card.title,
      synopsis: card.synopsis ?? null,
      posterUrl: card.posterUrl,
      bannerUrl: null,
      type: card.type,
      season: card.season ?? null,
      seasonYear: card.year ?? null,
      score: card.score,
      genres: [],
      slug: null,
      malUrl: card.malUrl ?? null,
    };
  }

  private animeToHeroSlide(a: Anime): HeroSlide {
    return {
      id: a.id,
      title: a.title,
      synopsis: a.synopsis ?? null,
      posterUrl: a.posterUrl,
      bannerUrl: a.bannerUrl ?? null,
      type: a.type,
      season: a.season ?? null,
      seasonYear: a.seasonYear ?? null,
      score: a.score,
      genres: (a.genres ?? []).map(g => ({ id: g.id, name: g.name })),
      slug: a.slug,
      malUrl: a.malId ? `https://myanimelist.net/anime/${a.malId}` : null,
      libraryId: a.id,
    };
  }

  isGridSection(id: string): boolean {
    return id === 'top_rated';
  }

  /** Horizontal row arrows: scroll the `.scroll-row` inside the same `.scroll-shelf`. */
  scrollShelf(event: Event, direction: number): void {
    const btn = event.currentTarget as HTMLElement | null;
    const shelf = btn?.closest('.scroll-shelf');
    const row = shelf?.querySelector('.scroll-row') as HTMLElement | null;
    const delta = direction * Math.min(320, typeof window !== 'undefined' ? window.innerWidth * 0.35 : 320);
    row?.scrollBy({ left: delta, behavior: 'smooth' });
  }

  /** Sync custom tilted scroll rail to `.scroll-row` scroll position (native bar hidden). */
  syncScrollRail(event: Event): void {
    const row = event.target as HTMLElement;
    const rail = row.nextElementSibling as HTMLElement | null;
    if (!rail?.classList.contains('scroll-rail')) return;
    const maxScroll = row.scrollWidth - row.clientWidth;
    const progress = maxScroll <= 0 ? 0 : row.scrollLeft / maxScroll;
    const wFrac = Math.min(1, Math.max(0.12, row.clientWidth / row.scrollWidth));
    const leftFrac = progress * (1 - wFrac);
    rail.style.setProperty('--thumb-w', `${(wFrac * 100).toFixed(2)}%`);
    rail.style.setProperty('--thumb-left', `${(leftFrac * 100).toFixed(2)}%`);
  }

  private refreshScrollRails(): void {
    const rows = this.host.nativeElement.querySelectorAll('.scroll-shelf .scroll-row');
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as HTMLElement;
      this.syncScrollRail({ target: row } as unknown as Event);
    }
  }
}
