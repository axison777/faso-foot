import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

export interface TeamStats {
  played: number; wins: number; draws: number; losses: number; goals_for: number; goals_against: number; recent_form?: Array<'V'|'N'|'D'>;
}

@Component({
  selector: 'app-team-stats-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './team-stats-card.component.html',
  styleUrls: ['./team-stats-card.component.scss']
})
export class TeamStatsCardComponent {
  @Input() stats!: TeamStats;
}
