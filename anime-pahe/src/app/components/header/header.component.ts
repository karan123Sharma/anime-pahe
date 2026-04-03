import { Component, HostListener, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  scrolled = signal(false);
  mobileMenuOpen = signal(false);
  searchQuery = '';

  constructor(private router: Router) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/browse'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }

  toggleMobile(): void {
    this.mobileMenuOpen.update(v => !v);
  }
}
