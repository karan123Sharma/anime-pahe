import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnimeService } from '../../services/anime.service';
import { AnimeCardComponent } from '../../components/anime-card/anime-card.component';
import { Anime, Genre } from '../../models/anime.model';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [FormsModule, AnimeCardComponent],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.css',
})
export class BrowseComponent implements OnInit, OnDestroy {
  readonly searchPageSize = 24;

  allAnime = signal<Anime[]>([]);
  filteredAnime = signal<Anime[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal(true);

  searchQuery = '';
  selectedGenre = '';
  selectedStatus = '';
  selectedSort = 'score,desc';
  currentPage = signal(0);
  totalPages = signal(0);

  /** True when results came from /api/anime/search */
  isSearchMode = signal(false);
  searchSource = signal<string | null>(null);
  searchHasNextPage = signal(false);

  statuses = ['AIRING', 'COMPLETED', 'UPCOMING'];
  sortOptions = [
    { value: 'score,desc', label: 'Top Rated' },
    { value: 'title,asc', label: 'A–Z' },
    { value: 'title,desc', label: 'Z–A' },
    { value: 'updatedAt,desc', label: 'Recently Updated' },
  ];

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animeService: AnimeService,
  ) {}

  ngOnInit(): void {
    this.animeService.getGenres().subscribe({
      next: g => this.genres.set(g),
    });

    this.route.queryParamMap.subscribe(params => {
      this.searchQuery = params.get('q') ?? '';
      this.selectedGenre = params.get('genre') ?? '';
      this.loadAnime();
    });
  }

  ngOnDestroy(): void {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
  }

  loadAnime(): void {
    const q = this.searchQuery.trim();
    this.loading.set(true);

    if (q) {
      this.isSearchMode.set(true);
      this.animeService.searchAnime(q, this.currentPage(), this.searchPageSize).subscribe({
        next: res => {
          this.allAnime.set(res.results ?? []);
          this.searchSource.set(res.source ?? null);
          this.searchHasNextPage.set((res.results?.length ?? 0) === this.searchPageSize);
          this.totalPages.set(0);
          this.applyFilters();
          this.loading.set(false);
        },
        error: () => {
          this.allAnime.set([]);
          this.searchSource.set(null);
          this.searchHasNextPage.set(false);
          this.applyFilters();
          this.loading.set(false);
        },
      });
      return;
    }

    this.isSearchMode.set(false);
    this.searchSource.set(null);
    this.searchHasNextPage.set(false);

    this.animeService.getAnimeList(this.currentPage(), 30, this.selectedSort).subscribe({
      next: page => {
        this.allAnime.set(page.content);
        this.totalPages.set(page.totalPages);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private sortAnimeList(list: Anime[]): Anime[] {
    const copy = [...list];
    switch (this.selectedSort) {
      case 'score,desc':
        return copy.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      case 'title,asc':
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'title,desc':
        return copy.sort((a, b) => b.title.localeCompare(a.title));
      case 'updatedAt,desc':
        return copy.sort(
          (a, b) =>
            new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime(),
        );
      default:
        return copy;
    }
  }

  applyFilters(): void {
    let result = this.allAnime();

    if (this.selectedGenre) {
      result = result.filter(a =>
        a.genres?.some(
          g => g.slug === this.selectedGenre || g.name.toLowerCase() === this.selectedGenre.toLowerCase(),
        ),
      );
    }

    if (this.selectedStatus) {
      result = result.filter(a => a.status?.toUpperCase() === this.selectedStatus);
    }

    if (this.isSearchMode()) {
      result = this.sortAnimeList(result);
    }

    this.filteredAnime.set(result);
  }

  /** Debounced URL sync + reload (backend search). */
  onSearchQueryChange(): void {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.currentPage.set(0);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: this.searchQuery.trim() || null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }, 400);
  }

  onGenreOrStatusChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    if (this.isSearchMode()) {
      this.applyFilters();
    } else {
      this.currentPage.set(0);
      this.loadAnime();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadAnime();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToSearchPage(page: number): void {
    if (page < 0) return;
    if (page > this.currentPage() && !this.searchHasNextPage()) return;
    this.currentPage.set(page);
    this.loadAnime();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedGenre = '';
    this.selectedStatus = '';
    this.selectedSort = 'score,desc';
    this.currentPage.set(0);
    this.router.navigate(['/browse']);
  }
}
