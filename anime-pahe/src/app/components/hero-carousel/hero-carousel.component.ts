import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroSlide } from '../../models/anime.model';
import { WatchlistService } from '../../services/watchlist.service';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.css',
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  @Input({ required: true }) slides: HeroSlide[] = [];

  current = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(public watchlist: WatchlistService) {}

  get slide() {
    return this.slides[this.current()] ?? null;
  }

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  goTo(index: number): void {
    if (index === this.current()) return;
    this.current.set(index);
    this.restartAutoPlay();
  }

  next(): void {
    this.goTo((this.current() + 1) % this.slides.length);
  }

  prev(): void {
    this.goTo((this.current() - 1 + this.slides.length) % this.slides.length);
  }

  private startAutoPlay(): void {
    this.timer = setInterval(() => this.next(), 7000);
  }

  private stopAutoPlay(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  truncate(text: string, max: number): string {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '...' : text;
  }

  /** Jikan / discover slides have no banner — using poster full-bleed looks stretched; we use a blurred fill + contained art instead. */
  usesPosterAsHero(s: HeroSlide): boolean {
    return !(s.bannerUrl && s.bannerUrl.trim().length > 0);
  }

  heroBlurBackground(s: HeroSlide): string {
    const u = this.heroImageUrl(s);
    if (!u) return 'none';
    const safe = u.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `url("${safe}")`;
  }

  heroObjectPosition(s: HeroSlide): string {
    if (this.usesPosterAsHero(s)) return 'center bottom';
    return 'center 22%';
  }

  heroImageUrl(s: HeroSlide): string {
    return (s.bannerUrl && s.bannerUrl.trim()) || s.posterUrl || '';
  }

  firstGenreName(s: HeroSlide): string | null {
    return s.genres?.[0]?.name ?? null;
  }

  toggleHeroWatchlist(e: Event, libraryId: number): void {
    e.preventDefault();
    e.stopPropagation();
    this.watchlist.toggle(libraryId);
  }
}
