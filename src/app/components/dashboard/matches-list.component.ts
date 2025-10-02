import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { MatchListItem } from '../../models/dashboard.model';
import { MatchService } from '../../service/match.service';
import { MockDataService } from '../../service/mock-data.service';
import { CompetitionFilterComponent, CompetitionOption } from './competition-filter.component';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [
    CommonModule, 
    TabViewModule, 
    TableModule, 
    CompetitionFilterComponent
  ],
  template: `
    <!-- TODO: Remettre *hasPermission="'voir-matchs'" quand les comptes seront prêts -->
    <div class="matches-list">
      <app-competition-filter
        [competitions]="competitions"
        [(selectedCompetitionId)]="selectedCompetitionId"
        (competitionChange)="onFilterChange()">
      </app-competition-filter>

      <p-tabView (onChange)="onTabChange($event)">
        <p-tabPanel header="À jouer" leftIcon="pi pi-calendar-plus">
          <div *ngIf="loadingUpcoming" class="loading">
            <i class="pi pi-spin pi-spinner"></i>
            Chargement...
          </div>

          <div class="table-container" *ngIf="!loadingUpcoming && upcomingMatches.length > 0">
            <table class="matches-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Adversaire</th>
                  <th>Stade</th>
                  <th>Lieu</th>
                  <th *ngIf="showPhase">Phase</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let match of upcomingMatches">
                  <td>{{ match.number || '-' }}</td>
                  <td>{{ formatDate(match.scheduledAt) }}</td>
                  <td>{{ formatTime(match.scheduledAt) }}</td>
                  <td>
                    <div class="team-cell">
                      <img *ngIf="match.opponent.logo" [src]="match.opponent.logo" 
                           [alt]="match.opponent.name" class="team-logo">
                      <span>{{ match.opponent.name }}</span>
                    </div>
                  </td>
                  <td>{{ match.stadium.name }}</td>
                  <td>
                    <span class="badge" [class.badge-home]="match.homeAway === 'HOME'"
                                        [class.badge-away]="match.homeAway === 'AWAY'">
                      {{ match.homeAway === 'HOME' ? 'Domicile' : 'Extérieur' }}
                    </span>
                  </td>
                  <td *ngIf="showPhase">{{ match.phase || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="no-results" *ngIf="!loadingUpcoming && upcomingMatches.length === 0">
            <i class="pi pi-calendar-times"></i>
            <p>Aucun match à venir</p>
          </div>
        </p-tabPanel>

        <p-tabPanel header="Joués" leftIcon="pi pi-check-circle">
          <div *ngIf="loadingPlayed" class="loading">
            <i class="pi pi-spin pi-spinner"></i>
            Chargement...
          </div>

          <div class="table-container" *ngIf="!loadingPlayed && playedMatches.length > 0">
            <table class="matches-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Adversaire</th>
                  <th>Stade</th>
                  <th>Résultat</th>
                  <th *ngIf="showPhase">Phase</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let match of playedMatches">
                  <td>{{ match.number || '-' }}</td>
                  <td>{{ formatDate(match.scheduledAt) }}</td>
                  <td>{{ formatTime(match.scheduledAt) }}</td>
                  <td>
                    <div class="team-cell">
                      <img *ngIf="match.opponent.logo" [src]="match.opponent.logo" 
                           [alt]="match.opponent.name" class="team-logo">
                      <span>{{ match.opponent.name }}</span>
                    </div>
                  </td>
                  <td>{{ match.stadium.name }}</td>
                  <td>
                    <span class="score" *ngIf="match.score">
                      {{ match.score.home }} - {{ match.score.away }}
                    </span>
                    <span *ngIf="!match.score">-</span>
                  </td>
                  <td *ngIf="showPhase">{{ match.phase || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="no-results" *ngIf="!loadingPlayed && playedMatches.length === 0">
            <i class="pi pi-calendar-times"></i>
            <p>Aucun match joué</p>
          </div>
        </p-tabPanel>
      </p-tabView>
    </div>
  `,
  styles: [`
    .matches-list {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .table-container {
      overflow-x: auto;
      margin-top: 16px;
    }

    .matches-table {
      width: 100%;
      border-collapse: collapse;
    }

    .matches-table thead {
      background: rgb(50,145,87);
      color: white;
    }

    .matches-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .matches-table tbody tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background-color 0.2s;
    }

    .matches-table tbody tr:hover {
      background-color: #f0fdf4;
    }

    .matches-table td {
      padding: 12px;
      vertical-align: middle;
    }

    .team-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .team-logo {
      width: 32px;
      height: 32px;
      object-fit: contain;
      border-radius: 4px;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .badge-home {
      background: #dcfce7;
      color: #166534;
    }

    .badge-away {
      background: #fef3c7;
      color: #92400e;
    }

    .score {
      font-weight: bold;
      font-size: 1.1rem;
      color: rgb(50,145,87);
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #64748b;
      font-size: 1.1rem;
    }

    .loading i {
      font-size: 2rem;
      margin-bottom: 12px;
      display: block;
    }

    .no-results {
      text-align: center;
      padding: 40px;
      color: #64748b;
    }

    .no-results i {
      font-size: 3rem;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .no-results p {
      margin: 0;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .matches-table {
        font-size: 0.85rem;
      }

      .matches-table th,
      .matches-table td {
        padding: 8px 4px;
      }

      .team-logo {
        width: 24px;
        height: 24px;
      }
    }
  `]
})
export class MatchesListComponent implements OnInit, OnChanges {
  @Input() teamId!: string;
  @Input() competitions: CompetitionOption[] = [];

  upcomingMatches: MatchListItem[] = [];
  playedMatches: MatchListItem[] = [];
  selectedCompetitionId: string | null = null;
  loadingUpcoming = false;
  loadingPlayed = false;
  showPhase = false;
  useMockData = true; // TODO: Mettre à false quand le backend est prêt

  constructor(
    private matchService: MatchService,
    private mockDataService: MockDataService
  ) {}

  ngOnInit(): void {
    this.loadUpcomingMatches();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teamId'] && !changes['teamId'].firstChange) {
      this.loadUpcomingMatches();
    }
  }

  loadUpcomingMatches(): void {
    this.loadingUpcoming = true;
    const filters: any = { status: 'UPCOMING' };
    if (this.selectedCompetitionId) {
      filters.competitionId = this.selectedCompetitionId;
    }

    const service$ = this.useMockData
      ? this.mockDataService.getMockMatches(this.teamId, 'UPCOMING')
      : this.matchService.getMatchesForTeam(this.teamId, filters);

    service$.subscribe({
      next: (matches) => {
        this.upcomingMatches = matches;
        this.loadingUpcoming = false;
        this.checkIfShowPhase();
      },
      error: () => {
        this.loadingUpcoming = false;
        this.upcomingMatches = [];
      }
    });
  }

  loadPlayedMatches(): void {
    this.loadingPlayed = true;
    const filters: any = { status: 'PLAYED' };
    if (this.selectedCompetitionId) {
      filters.competitionId = this.selectedCompetitionId;
    }

    const service$ = this.useMockData
      ? this.mockDataService.getMockMatches(this.teamId, 'PLAYED')
      : this.matchService.getMatchesForTeam(this.teamId, filters);

    service$.subscribe({
      next: (matches) => {
        this.playedMatches = matches;
        this.loadingPlayed = false;
        this.checkIfShowPhase();
      },
      error: () => {
        this.loadingPlayed = false;
        this.playedMatches = [];
      }
    });
  }

  onTabChange(event: any): void {
    if (event.index === 0) {
      if (this.upcomingMatches.length === 0) {
        this.loadUpcomingMatches();
      }
    } else if (event.index === 1) {
      if (this.playedMatches.length === 0) {
        this.loadPlayedMatches();
      }
    }
  }

  onFilterChange(): void {
    this.loadUpcomingMatches();
    if (this.playedMatches.length > 0) {
      this.loadPlayedMatches();
    }
  }

  checkIfShowPhase(): void {
    const allMatches = [...this.upcomingMatches, ...this.playedMatches];
    this.showPhase = allMatches.some(m => m.competition?.type === 'CUP' || m.phase);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
