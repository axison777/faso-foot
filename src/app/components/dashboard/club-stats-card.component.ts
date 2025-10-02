import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubStats } from '../../models/dashboard.model';

@Component({
  selector: 'app-club-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="club-stats-card" *ngIf="stats">
      <h3>Statistiques Globales du Club</h3>
      
      <div class="stats-grid">
        <div class="stat-box stat-total">
          <i class="pi pi-calendar"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalMatches }}</span>
            <span class="stat-label">Matchs joués</span>
          </div>
        </div>

        <div class="stat-box stat-wins">
          <i class="pi pi-check-circle"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.wins }}</span>
            <span class="stat-label">Victoires</span>
          </div>
        </div>

        <div class="stat-box stat-draws">
          <i class="pi pi-minus-circle"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.draws }}</span>
            <span class="stat-label">Nuls</span>
          </div>
        </div>

        <div class="stat-box stat-losses">
          <i class="pi pi-times-circle"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.losses }}</span>
            <span class="stat-label">Défaites</span>
          </div>
        </div>
      </div>

      <div class="goals-summary">
        <div class="goals-item">
          <span class="goals-label">Buts marqués</span>
          <span class="goals-value goals-for">{{ stats.goalsFor }}</span>
        </div>
        <div class="goals-separator">-</div>
        <div class="goals-item">
          <span class="goals-label">Buts encaissés</span>
          <span class="goals-value goals-against">{{ stats.goalsAgainst }}</span>
        </div>
      </div>

      <div class="ranking" *ngIf="stats.ranking">
        <i class="pi pi-trophy"></i>
        <span>Classement général : <strong>{{ stats.ranking }}ème</strong></span>
      </div>
    </div>
  `,
  styles: [`
    .club-stats-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }

    h3 {
      margin: 0 0 20px 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: rgb(50,145,87);
      padding-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .stat-total {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-color: #bae6fd;
    }

    .stat-wins {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-color: #bbf7d0;
    }

    .stat-draws {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-color: #fde68a;
    }

    .stat-losses {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-color: #fecaca;
    }

    .stat-box i {
      font-size: 2rem;
      color: #475569;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: #1e293b;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 4px;
    }

    .goals-summary {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .goals-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .goals-label {
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 8px;
    }

    .goals-value {
      font-size: 2.5rem;
      font-weight: bold;
    }

    .goals-for {
      color: #22c55e;
    }

    .goals-against {
      color: #dc2626;
    }

    .goals-separator {
      font-size: 2rem;
      color: #cbd5e1;
      font-weight: bold;
    }

    .ranking {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: linear-gradient(135deg, rgb(50,145,87) 0%, rgb(22,123,74) 100%);
      color: white;
      border-radius: 8px;
      font-size: 1.1rem;
    }

    .ranking i {
      font-size: 1.3rem;
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .club-stats-card {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .goals-summary {
        flex-direction: column;
        gap: 16px;
      }

      .goals-separator {
        transform: rotate(90deg);
      }
    }
  `]
})
export class ClubStatsCardComponent {
  @Input() stats: ClubStats | null = null;
}
