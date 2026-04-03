import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimeSectionCard } from '../../models/discover.model';

@Component({
  selector: 'app-discover-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './discover-card.component.html',
  styleUrl: './discover-card.component.css',
})
export class DiscoverCardComponent {
  @Input({ required: true }) card!: AnimeSectionCard;
  @Input() showRank = false;
  @Input() rank = 0;

  get scoreDisplay(): string {
    return this.card.score != null ? this.card.score.toFixed(1) : 'N/A';
  }
}
