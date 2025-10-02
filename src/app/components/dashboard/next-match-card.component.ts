import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchListItem } from '../../models/dashboard.model';

@Component({
  selector: 'app-next-match-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="next-match-card" *ngIf="match">
      <div class="card-header">
        <h3>Prochain Match</h3>
        <span class="badge" [class.badge-home]="match.homeAway === 'HOME'" 
                            [class.badge-away]="match.homeAway === 'AWAY'">
          {{ match.homeAway === 'HOME' ? 'Domicile' : 'Extérieur' }}
        </span>
      </div>
      
      <div class="match-info">
        <div class="opponent">
          <img *ngIf="match.opponent.logo" [src]="match.opponent.logo" [alt]="match.opponent.name" class="opponent-logo">
          <div *ngIf="!match.opponent.logo" class="opponent-logo-placeholder">
            {{ match.opponent.name.substring(0, 2).toUpperCase() }}
          </div>
          <span class="opponent-name">{{ match.opponent.name }}</span>
        </div>
        
        <div class="match-details">
          <div class="detail-row">
            <i class="pi pi-calendar"></i>
            <span>{{ formatDate(match.scheduledAt) }}</span>
          </div>
          <div class="detail-row">
            <i class="pi pi-clock"></i>
            <span>{{ formatTime(match.scheduledAt) }}</span>
          </div>
          <div class="detail-row">
            <i class="pi pi-map-marker"></i>
            <span>{{ match.stadium.name }}</span>
          </div>
          <div class="detail-row" *ngIf="match.competition">
            <i class="pi pi-trophy"></i>
            <span>{{ match.competition.name }}</span>
          </div>
        </div>
        
        <div class="countdown" *ngIf="getDaysUntil(match.scheduledAt) >= 0">
          <span class="countdown-badge">J-{{ getDaysUntil(match.scheduledAt) }}</span>
        </div>
      </div>
    </div>
    
    <div class="no-match" *ngIf="!match">
      <i class="pi pi-calendar-times"></i>
      <p>Aucun match programmé</p>
    </div>
  `,
  styles: [`
    .next-match-card {
      background: linear-gradient(135deg, rgb(50,145,87) 0%, rgb(22,123,74) 100%);
      border-radius: 12px;
      padding: 24px;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .badge-home {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .badge-away {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .match-info {
      display: grid;
      gap: 20px;
    }

    .opponent {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .opponent-logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 8px;
      background: white;
      padding: 8px;
    }

    .opponent-logo-placeholder {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      font-weight: bold;
      font-size: 1.2rem;
      color: rgb(50,145,87);
    }

    .opponent-name {
      font-size: 1.3rem;
      font-weight: 600;
    }

    .match-details {
      display: grid;
      gap: 12px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1rem;
    }

    .detail-row i {
      font-size: 1.1rem;
      width: 20px;
    }

    .countdown {
      text-align: center;
    }

    .countdown-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.9);
      color: rgb(50,145,87);
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .no-match {
      background: #f8fafc;
      border: 2px dashed #e2e8f0;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      color: #64748b;
      margin-bottom: 24px;
    }

    .no-match i {
      font-size: 3rem;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .no-match p {
      margin: 0;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .next-match-card {
        padding: 16px;
      }

      .opponent {
        flex-direction: column;
        text-align: center;
      }

      .opponent-name {
        font-size: 1.1rem;
      }
    }
  `]
})
export class NextMatchCardComponent {
  @Input() match: MatchListItem | null = null;

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getDaysUntil(dateStr: string): number {
    const matchDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    matchDate.setHours(0, 0, 0, 0);
    const diff = matchDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
