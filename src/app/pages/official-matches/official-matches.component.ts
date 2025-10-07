import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OfficialMatchService, OfficialMatch } from '../../service/official-match.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-official-matches',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h5>Mes matchs assignés</h5>
                        <div class="flex gap-2">
                            <select [(ngModel)]="selectedStatus" (ngModelChange)="filterMatches()" class="p-inputtext">
                                <option value="">Tous les statuts</option>
                                <option value="UPCOMING">À venir</option>
                                <option value="IN_PROGRESS">En cours</option>
                                <option value="COMPLETED">Terminés</option>
                                <option value="POSTPONED">Reportés</option>
                                <option value="CANCELLED">Annulés</option>
                            </select>
                            <button class="p-button p-button-outlined" (click)="refreshMatches()">
                                <i class="pi pi-refresh mr-2"></i>
                                Actualiser
                            </button>
                        </div>
                    </div>

                    <div class="matches-grid" *ngIf="filteredMatches$ | async as matches; else loadingMatches">
                        <div class="match-card" *ngFor="let match of matches" [routerLink]="['/officiel/match-details', match.id]">
                            <div class="match-header">
                                <div class="match-competition">{{ match.competition.name }}</div>
                                <div class="match-status" [ngClass]="getStatusClass(match.status)">
                                    {{ getStatusLabel(match.status) }}
                                </div>
                            </div>
                            
                            <div class="match-teams">
                                <div class="team home-team">
                                    <div class="team-name">{{ match.homeTeam.name }}</div>
                                </div>
                                <div class="vs-section">
                                    <div class="vs" *ngIf="match.status !== 'COMPLETED'">vs</div>
                                    <div class="score" *ngIf="match.status === 'COMPLETED' && match.score">
                                        {{ match.score.home }} - {{ match.score.away }}
                                    </div>
                                </div>
                                <div class="team away-team">
                                    <div class="team-name">{{ match.awayTeam.name }}</div>
                                </div>
                            </div>

                            <div class="match-details">
                                <div class="detail-item">
                                    <i class="pi pi-calendar mr-1"></i>
                                    {{ match.scheduledAt | date:'dd/MM/yyyy' }}
                                </div>
                                <div class="detail-item">
                                    <i class="pi pi-clock mr-1"></i>
                                    {{ match.scheduledAt | date:'HH:mm' }}
                                </div>
                                <div class="detail-item">
                                    <i class="pi pi-map-marker mr-1"></i>
                                    {{ match.stadium.name }}
                                </div>
                            </div>

                            <div class="match-role">
                                <span class="role-badge" [ngClass]="getRoleClass(match.officialRole)">
                                    {{ getRoleLabel(match.officialRole) }}
                                </span>
                            </div>

                            <div class="match-actions" *ngIf="match.canSubmitReport && !match.reportSubmitted">
                                <button class="p-button p-button-sm p-button-outlined" 
                                        (click)="submitReport(match.id, $event)">
                                    <i class="pi pi-file-text mr-1"></i>
                                    Saisir rapport
                                </button>
                            </div>

                            <div class="match-progress" *ngIf="match.reportSubmitted">
                                <i class="pi pi-check-circle text-green-500 mr-1"></i>
                                <span class="text-green-500">Rapport soumis</span>
                            </div>
                        </div>
                    </div>

                    <ng-template #loadingMatches>
                        <div class="text-center p-4">
                            <i class="pi pi-spin pi-spinner"></i>
                            <p class="mt-2">Chargement des matchs...</p>
                        </div>
                    </ng-template>

                    <div class="text-center p-4" *ngIf="(filteredMatches$ | async)?.length === 0">
                        <i class="pi pi-calendar text-4xl text-gray-400 mb-3"></i>
                        <p class="text-gray-500">Aucun match trouvé</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .matches-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
        }

        .match-card {
            border: 1px solid var(--surface-border);
            border-radius: 12px;
            padding: 1.5rem;
            background: var(--surface-card);
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .match-card:hover {
            border-color: var(--primary-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        .match-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .match-competition {
            font-size: 0.875rem;
            color: var(--primary-color);
            font-weight: 600;
        }

        .match-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-upcoming {
            background: var(--blue-100);
            color: var(--blue-700);
        }

        .status-in-progress {
            background: var(--orange-100);
            color: var(--orange-700);
        }

        .status-completed {
            background: var(--green-100);
            color: var(--green-700);
        }

        .status-postponed {
            background: var(--yellow-100);
            color: var(--yellow-700);
        }

        .status-cancelled {
            background: var(--red-100);
            color: var(--red-700);
        }

        .match-teams {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
        }

        .team {
            flex: 1;
            text-align: center;
        }

        .team-name {
            font-weight: 600;
            font-size: 1rem;
        }

        .vs-section {
            margin: 0 1rem;
            text-align: center;
        }

        .vs {
            color: var(--text-color-secondary);
            font-weight: 600;
        }

        .score {
            font-weight: 700;
            font-size: 1.25rem;
            color: var(--primary-color);
        }

        .match-details {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .detail-item {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
            display: flex;
            align-items: center;
        }

        .match-role {
            margin-bottom: 1rem;
        }

        .role-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .role-referee {
            background: var(--blue-100);
            color: var(--blue-700);
        }

        .role-assistant {
            background: var(--green-100);
            color: var(--green-700);
        }

        .role-commissioner {
            background: var(--orange-100);
            color: var(--orange-700);
        }

        .match-actions {
            display: flex;
            justify-content: center;
        }

        .match-progress {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            font-weight: 600;
        }
    `]
})
export class OfficialMatchesComponent implements OnInit {
    filteredMatches$!: Observable<OfficialMatch[]>;
    selectedStatus = '';

    constructor(private officialMatchService: OfficialMatchService) {}

    ngOnInit() {
        this.filterMatches();
    }

    filterMatches() {
        const filters: any = {};
        if (this.selectedStatus) {
            filters.status = this.selectedStatus;
        }
        this.filteredMatches$ = this.officialMatchService.getAssignedMatches(filters);
    }

    refreshMatches() {
        this.filterMatches();
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'UPCOMING':
                return 'À venir';
            case 'IN_PROGRESS':
                return 'En cours';
            case 'COMPLETED':
                return 'Terminé';
            case 'POSTPONED':
                return 'Reporté';
            case 'CANCELLED':
                return 'Annulé';
            default:
                return status;
        }
    }

    getRoleClass(role: string): string {
        switch (role) {
            case 'CENTRAL_REFEREE':
                return 'role-referee';
            case 'ASSISTANT_REFEREE_1':
            case 'ASSISTANT_REFEREE_2':
                return 'role-assistant';
            case 'COMMISSIONER':
                return 'role-commissioner';
            default:
                return 'role-referee';
        }
    }

    getRoleLabel(role: string): string {
        switch (role) {
            case 'CENTRAL_REFEREE':
                return 'Arbitre Central';
            case 'ASSISTANT_REFEREE_1':
                return 'Assistant 1';
            case 'ASSISTANT_REFEREE_2':
                return 'Assistant 2';
            case 'FOURTH_OFFICIAL':
                return '4ème Arbitre';
            case 'COMMISSIONER':
                return 'Commissaire';
            default:
                return role;
        }
    }

    submitReport(matchId: string, event: Event) {
        event.stopPropagation();
        // Navigation vers la page de saisie de rapport
        // this.router.navigate(['/officiel/match-report', matchId]);
        console.log('Saisir rapport pour le match:', matchId);
    }
}