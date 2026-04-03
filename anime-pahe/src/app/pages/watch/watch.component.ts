import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnimeService } from '../../services/anime.service';
import { WatchlistService } from '../../services/watchlist.service';
import { Anime, Episode } from '../../models/anime.model';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './watch.component.html',
  styleUrl: './watch.component.css',
})
export class WatchComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoRef!: ElementRef<HTMLVideoElement>;

  anime = signal<Anime | null>(null);
  episode = signal<Episode | null>(null);
  episodes = signal<Episode[]>([]);
  currentEpNum = signal(1);
  loading = signal(true);

  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(1);
  isMuted = signal(false);
  quality = signal('1080p');
  showControls = signal(true);
  subtitlesOn = signal(true);
  sidebarOpen = signal(true);
  isFullscreen = signal(false);

  qualities = ['480p', '720p', '1080p'];
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animeService: AnimeService,
    public watchlist: WatchlistService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const animeId = Number(params.get('animeId'));
      const epNum = Number(params.get('episode'));
      if (animeId && epNum) {
        this.currentEpNum.set(epNum);
        this.loadData(animeId, epNum);
      }
    });
  }

  ngOnDestroy(): void {
    this.saveCurrentProgress();
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }

  private loadData(animeId: number, epNum: number): void {
    this.loading.set(true);
    this.animeService.getAnimeById(animeId).subscribe({
      next: anime => {
        this.anime.set(anime);
        this.animeService.getEpisodes(animeId).subscribe({
          next: eps => {
            this.episodes.set(eps);
            const ep = eps.find(e => e.episodeNumber === epNum) ?? eps[0];
            this.episode.set(ep ?? null);
            this.loading.set(false);
          },
        });
      },
      error: () => this.loading.set(false),
    });
  }

  togglePlay(): void {
    const vid = this.videoRef?.nativeElement;
    if (!vid) return;
    if (vid.paused) { vid.play(); this.isPlaying.set(true); }
    else { vid.pause(); this.isPlaying.set(false); }
  }

  onTimeUpdate(): void {
    const vid = this.videoRef?.nativeElement;
    if (vid) {
      this.currentTime.set(vid.currentTime);
      this.duration.set(vid.duration || 0);
    }
  }

  seek(e: Event): void {
    const vid = this.videoRef?.nativeElement;
    const val = (e.target as HTMLInputElement).valueAsNumber;
    if (vid) vid.currentTime = val;
  }

  toggleMute(): void {
    const vid = this.videoRef?.nativeElement;
    if (vid) {
      vid.muted = !vid.muted;
      this.isMuted.set(vid.muted);
    }
  }

  setVolume(e: Event): void {
    const vid = this.videoRef?.nativeElement;
    const val = (e.target as HTMLInputElement).valueAsNumber;
    if (vid) {
      vid.volume = val;
      this.volume.set(val);
      this.isMuted.set(val === 0);
    }
  }

  setQuality(q: string): void {
    this.quality.set(q);
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.isFullscreen.set(true);
    } else {
      document.exitFullscreen();
      this.isFullscreen.set(false);
    }
  }

  toggleSubtitles(): void {
    this.subtitlesOn.update(v => !v);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  onMouseMove(): void {
    this.showControls.set(true);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      if (this.isPlaying()) this.showControls.set(false);
    }, 3000);
  }

  goToEpisode(epNum: number): void {
    this.saveCurrentProgress();
    const a = this.anime();
    if (a) this.router.navigate(['/watch', a.id, epNum]);
  }

  nextEpisode(): void {
    const current = this.currentEpNum();
    const eps = this.episodes();
    const next = eps.find(e => e.episodeNumber === current + 1);
    if (next) this.goToEpisode(next.episodeNumber);
  }

  prevEpisode(): void {
    const current = this.currentEpNum();
    if (current > 1) this.goToEpisode(current - 1);
  }

  toggleWatchlist(): void {
    const a = this.anime();
    if (a) this.watchlist.toggle(a.id);
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  get progressPercent(): number {
    return this.duration() > 0 ? (this.currentTime() / this.duration()) * 100 : 0;
  }

  private saveCurrentProgress(): void {
    const a = this.anime();
    const ep = this.episode();
    if (a && ep && this.duration() > 0) {
      this.watchlist.saveProgress({
        animeId: a.id,
        animeSlug: a.slug,
        animeTitle: a.title,
        animePosterUrl: a.posterUrl,
        episodeNumber: ep.episodeNumber,
        progress: Math.round(this.progressPercent),
        timestamp: Date.now(),
      });
    }
  }
}
