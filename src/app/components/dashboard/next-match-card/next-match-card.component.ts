import { Component, Input, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgClass } from '@angular/common';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { MatchService, MatchItem } from '../../../service/match.service';

@Component({
  selector: 'app-next-match-card',
  standalone: true,
  imports: [CommonModule, CardModule, BadgeModule, NgIf, NgClass, DatePipe],
  templateUrl: './next-match-card.component.html',
  styleUrls: ['./next-match-card.component.scss']
})
export class NextMatchCardComponent implements OnInit {
  @Input() teamId!: string;

  private matchService = inject(MatchService);
  nextMatch = signal<MatchItem | null>(null);

  ngOnInit(): void {
    if (this.teamId) {
      this.matchService.getUpcomingMatchForTeam(this.teamId).subscribe(m => this.nextMatch.set(m));
    }
  }

  get dDayBadge(): string | null {
    const m = this.nextMatch();
    if (!m) return null;
    const now = new Date();
    const dt = new Date(m.scheduledAt);
    const diffDays = Math.round((dt.getTime() - now.getTime()) / (24*3600*1000));
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    if (diffDays > 1 && diffDays <= 7) return `J-${diffDays}`;
    return null;
  }
}
