import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

export interface ClubStats { played: number; wins: number; draws: number; losses: number; goals_for: number; goals_against: number; }

@Component({
  selector: 'app-club-stats-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './club-stats-card.component.html',
  styleUrls: ['./club-stats-card.component.scss']
})
export class ClubStatsCardComponent { @Input() stats!: ClubStats; }
