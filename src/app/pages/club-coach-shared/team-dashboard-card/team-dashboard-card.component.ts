import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';

export interface TeamDashboardData {
  id: string;
  name: string;
  coach?: { name: string; photo?: string };
  playerCount: number;
  totalPlayers: number;
  kit?: { photo?: string };
  nextMatch?: {
    opponent: string;
    date: string;
    competition: string;
    matchId: string;
  };
  standing?: { rank: number; points: number; played: number };
  phase?: string;
  stats: { goals: number; assists: number; yellowCards: number; redCards: number };
}

@Component({
  selector: 'app-team-dashboard-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, ChartModule],
  templateUrl: './team-dashboard-card.component.html',
  styleUrls: ['./team-dashboard-card.component.scss']
})
export class TeamDashboardCardComponent {
  @Input() team!: TeamDashboardData;

  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.chartData = {
      labels: ['Buts', 'Passes D.', 'Cartons J.', 'Cartons R.'],
      datasets: [{
        data: [this.team?.stats?.goals || 0, this.team?.stats?.assists || 0, this.team?.stats?.yellowCards || 0, this.team?.stats?.redCards || 0],
        backgroundColor: ['#10b981', '#3b82f6', '#fbbf24', '#ef4444'],
        borderWidth: 0
      }]
    };

    this.chartOptions = {
      plugins: {
        legend: { display: false }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }
}
