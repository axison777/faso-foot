import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamStats } from '../../models/dashboard.model';

@Component({
  selector: 'app-team-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-card" *ngIf="stats">
      <h4 *ngIf="title">{{ title }}</h4>
      
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Joués</span>
          <span class="stat-value">{{ stats.played }}</span>
        </div>
        <div class="stat-item stat-wins">
          <span class="stat-label">Victoires</span>
          <span class="stat-value">{{ stats.wins }}</span>
        </div>
        <div class="stat-item stat-draws">
          <span class="stat-label">Nuls</span>
          <span class="stat-value">{{ stats.draws }}</span>
        </div>
        <div class="stat-item stat-losses">
          <span class="stat-label">Défaites</span>
          <span class="stat-value">{{ stats.losses }}</span>
        </div>
      </div>

      <div class="goals-row">
        <div class="goal-stat">
          <i class="pi pi-arrow-up"></i>
          <span>{{ stats.goalsFor }} buts marqués</span>
        </div>
        <div class="goal-stat">
          <i class="pi pi-arrow-down"></i>
          <span>{{ stats.goalsAgainst }} buts encaissés</span>
        </div>
      </div>

      <div class="recent-form" *ngIf="stats.recentForm && stats.recentForm.length">
        <span class="form-label">Derniers matchs :</span>
        <div class="form-badges">
          <span *ngFor="let result of stats.recentForm" 
                class="form-badge"
                [class.form-win]="result === 'V'"
                [class.form-draw]="result === 'N'"
                [class.form-loss]="result === 'D'">
            {{ result }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    h4 {
      margin: 0 0 16px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #1e293b;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .stat-item {
      text-align: center;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .stat-wins {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .stat-draws {
      background: #fffbeb;
      border-color: #fde68a;
    }

    .stat-losses {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .stat-label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: #1e293b;
    }

    .goals-row {
      display: flex;
      justify-content: space-around;
      margin: 16px 0;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .goal-stat {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
      color: #475569;
    }

    .goal-stat i {
      color: rgb(50,145,87);
    }

    .recent-form {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .form-label {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }

    .form-badges {
      display: flex;
      gap: 6px;
    }

    .form-badge {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-weight: bold;
      font-size: 0.85rem;
      color: white;
    }

    .form-win {
      background: #22c55e;
    }

    .form-draw {
      background: #f59e0b;
    }

    .form-loss {
      background: #dc2626;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .goals-row {
        flex-direction: column;
        gap: 8px;
      }

      .recent-form {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class TeamStatsCardComponent {
  @Input() stats: TeamStats | null = null;
  @Input() title?: string;
}
