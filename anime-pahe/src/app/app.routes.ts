import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'browse',
    loadComponent: () => import('./pages/browse/browse.component').then(m => m.BrowseComponent),
  },
  {
    path: 'watchlist',
    loadComponent: () => import('./pages/watchlist/watchlist-page.component').then(m => m.WatchlistPageComponent),
  },
  {
    path: 'anime/:slug',
    loadComponent: () => import('./pages/anime-detail/anime-detail.component').then(m => m.AnimeDetailComponent),
  },
  {
    path: 'watch/:animeId/:episode',
    loadComponent: () => import('./pages/watch/watch.component').then(m => m.WatchComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
