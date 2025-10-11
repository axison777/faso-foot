import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OfficialMatchService, OfficialMatch } from '../../service/official-match.service';
import { MatchCallupService, MatchCallups } from '../../service/match-callup.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-official-match-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="grid" *ngIf="match$ | async as match; else loadingMatch">
            <!-- Informations générales du match -->
            <div class="col-12">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h5>Détails du match</h5>
                        <div class="flex gap-2">
                            <button class="p-button p-button-outlined" (click)="goBack()">
                                <i class="pi pi-arrow-left mr-2"></i>
                                Retour
                            </button>
                            <button class="p-button" 
                                    *ngIf="match.canSubmitReport && !match.reportSubmitted"
                                    (click)="submitReport(match.id)">
                                <i class="pi pi-file-text mr-2"></i>
                                Saisir rapport
                            </button>
                        </div>
                    </div>

                    <div class="match-info-grid">
                        <div class="info-section">
                            <h6>Compétition</h6>
                            <p>{{ match.competition.name }}</p>
                        </div>
                        <div class="info-section">
                            <h6>Date et heure</h6>
                            <p>{{ match.scheduledAt | date:'dd/MM/yyyy à HH:mm' }}</p>
                        </div>
                        <div class="info-section">
                            <h6>Stade</h6>
                            <p>{{ match.stadium.name }}</p>
                            <p class="text-sm text-gray-500" *ngIf="match.stadium.address">{{ match.stadium.address }}</p>
                        </div>
                        <div class="info-section">
                            <h6>Statut</h6>
                            <span class="status-badge" [ngClass]="getStatusClass(match.status)">
                                {{ getStatusLabel(match.status) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Équipes -->
            <div class="col-12 lg:col-6">
                <div class="card">
                    <h6>Équipes</h6>
                    <div class="teams-display">
                        <div class="team-card">
                            <div class="team-name">{{ match.homeTeam.name }}</div>
                            <div class="team-label">Domicile</div>
                        </div>
                        <div class="vs-section">
                            <div class="vs" *ngIf="match.status !== 'COMPLETED'">vs</div>
                            <div class="score" *ngIf="match.status === 'COMPLETED' && match.score">
                                {{ match.score.home }} - {{ match.score.away }}
                            </div>
                        </div>
                        <div class="team-card">
                            <div class="team-name">{{ match.awayTeam.name }}</div>
                            <div class="team-label">Extérieur</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Officiels assignés -->
            <div class="col-12 lg:col-6">
                <div class="card">
                    <h6>Officiels assignés</h6>
                    <div class="officials-list" *ngIf="match.otherOfficials; else noOfficials">
                        <div class="official-item" *ngFor="let official of match.otherOfficials">
                            <div class="official-info">
                                <div class="official-name">{{ official.name }}</div>
                                <div class="official-role">{{ getRoleLabel(official.role) }}</div>
                            </div>
                        </div>
                    </div>
                    <ng-template #noOfficials>
                        <p class="text-gray-500">Aucun autre officiel assigné</p>
                    </ng-template>
                </div>
            </div>

            <!-- Feuille de match - Joueurs des équipes -->
            <div class="col-12" *ngIf="matchCallups$ | async as callups">
                <div class="card">
                    <h6 class="mb-4">Feuille de match</h6>
                    
                    <div class="grid">
                        <!-- Équipe Domicile -->
                        <div class="col-12 lg:col-6">
                            <div class="team-callup-section">
                                <div class="team-callup-header">
                                    <div class="team-info">
                                        <img *ngIf="callups.team_one_callup.team_logo" 
                                             [src]="callups.team_one_callup.team_logo" 
                                             [alt]="callups.team_one_callup.team_name"
                                             class="team-logo-small">
                                        <div>
                                            <h6 class="team-title">{{ callups.team_one_callup.team_name }}</h6>
                                            <p class="team-subtitle">Équipe Domicile</p>
                                        </div>
                                    </div>
                                    <div class="team-stats">
                                        <span class="stat-badge">{{ callups.team_one_callup.starters_count }} Titulaires</span>
                                        <span class="stat-badge">{{ callups.team_one_callup.substitutes_count }} Remplaçants</span>
                                    </div>
                                </div>
                                
                                <div class="coach-info" *ngIf="callups.team_one_callup.coach">
                                    <i class="pi pi-user"></i>
                                    <span><strong>Entraîneur:</strong> {{ callups.team_one_callup.coach_name }}</span>
                                </div>
                                
                                <div class="captain-info" *ngIf="callups.team_one_callup.captain">
                                    <i class="pi pi-star"></i>
                                    <span><strong>Capitaine:</strong> {{ callups.team_one_callup.captain_name }} (#{{ callups.team_one_callup.captain_jersey_number }})</span>
                                </div>

                                <!-- Titulaires -->
                                <div class="players-section">
                                    <h6 class="players-section-title">Titulaires</h6>
                                    <div class="players-list">
                                        <div class="player-item" *ngFor="let player of getStarters(callups.team_one_callup.players)">
                                            <div class="player-jersey">{{ player.jersey_number }}</div>
                                            <img *ngIf="player.photo" 
                                                 [src]="player.photo" 
                                                 [alt]="player.first_name + ' ' + player.last_name"
                                                 class="player-photo">
                                            <div class="player-photo-placeholder" *ngIf="!player.photo">
                                                <i class="pi pi-user"></i>
                                            </div>
                                            <div class="player-info">
                                                <div class="player-name">{{ player.first_name }} {{ player.last_name }}</div>
                                                <div class="player-position">{{ player.position || player.preferred_position }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Remplaçants -->
                                <div class="players-section">
                                    <h6 class="players-section-title">Remplaçants</h6>
                                    <div class="players-list">
                                        <div class="player-item" *ngFor="let player of getSubstitutes(callups.team_one_callup.players)">
                                            <div class="player-jersey">{{ player.jersey_number }}</div>
                                            <img *ngIf="player.photo" 
                                                 [src]="player.photo" 
                                                 [alt]="player.first_name + ' ' + player.last_name"
                                                 class="player-photo">
                                            <div class="player-photo-placeholder" *ngIf="!player.photo">
                                                <i class="pi pi-user"></i>
                                            </div>
                                            <div class="player-info">
                                                <div class="player-name">{{ player.first_name }} {{ player.last_name }}</div>
                                                <div class="player-position">{{ player.position || player.preferred_position }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Équipe Extérieur -->
                        <div class="col-12 lg:col-6">
                            <div class="team-callup-section">
                                <div class="team-callup-header">
                                    <div class="team-info">
                                        <img *ngIf="callups.team_two_callup.team_logo" 
                                             [src]="callups.team_two_callup.team_logo" 
                                             [alt]="callups.team_two_callup.team_name"
                                             class="team-logo-small">
                                        <div>
                                            <h6 class="team-title">{{ callups.team_two_callup.team_name }}</h6>
                                            <p class="team-subtitle">Équipe Extérieur</p>
                                        </div>
                                    </div>
                                    <div class="team-stats">
                                        <span class="stat-badge">{{ callups.team_two_callup.starters_count }} Titulaires</span>
                                        <span class="stat-badge">{{ callups.team_two_callup.substitutes_count }} Remplaçants</span>
                                    </div>
                                </div>
                                
                                <div class="coach-info" *ngIf="callups.team_two_callup.coach">
                                    <i class="pi pi-user"></i>
                                    <span><strong>Entraîneur:</strong> {{ callups.team_two_callup.coach_name }}</span>
                                </div>
                                
                                <div class="captain-info" *ngIf="callups.team_two_callup.captain">
                                    <i class="pi pi-star"></i>
                                    <span><strong>Capitaine:</strong> {{ callups.team_two_callup.captain_name }} (#{{ callups.team_two_callup.captain_jersey_number }})</span>
                                </div>

                                <!-- Titulaires -->
                                <div class="players-section">
                                    <h6 class="players-section-title">Titulaires</h6>
                                    <div class="players-list">
                                        <div class="player-item" *ngFor="let player of getStarters(callups.team_two_callup.players)">
                                            <div class="player-jersey">{{ player.jersey_number }}</div>
                                            <img *ngIf="player.photo" 
                                                 [src]="player.photo" 
                                                 [alt]="player.first_name + ' ' + player.last_name"
                                                 class="player-photo">
                                            <div class="player-photo-placeholder" *ngIf="!player.photo">
                                                <i class="pi pi-user"></i>
                                            </div>
                                            <div class="player-info">
                                                <div class="player-name">{{ player.first_name }} {{ player.last_name }}</div>
                                                <div class="player-position">{{ player.position || player.preferred_position }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Remplaçants -->
                                <div class="players-section">
                                    <h6 class="players-section-title">Remplaçants</h6>
                                    <div class="players-list">
                                        <div class="player-item" *ngFor="let player of getSubstitutes(callups.team_two_callup.players)">
                                            <div class="player-jersey">{{ player.jersey_number }}</div>
                                            <img *ngIf="player.photo" 
                                                 [src]="player.photo" 
                                                 [alt]="player.first_name + ' ' + player.last_name"
                                                 class="player-photo">
                                            <div class="player-photo-placeholder" *ngIf="!player.photo">
                                                <i class="pi pi-user"></i>
                                            </div>
                                            <div class="player-info">
                                                <div class="player-name">{{ player.first_name }} {{ player.last_name }}</div>
                                                <div class="player-position">{{ player.position || player.preferred_position }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pendant/après le match -->
            <div class="col-12" *ngIf="match.status === 'IN_PROGRESS' || match.status === 'COMPLETED'">
                <div class="card">
                    <h6>Pendant/Après le match</h6>
                    <div class="match-actions">
                        <button class="p-button" 
                                *ngIf="match.officialRole !== 'COMMISSIONER'"
                                (click)="enterScore(match.id)">
                            <i class="pi pi-calculator mr-2"></i>
                            Saisir le score
                        </button>
                        <button class="p-button p-button-outlined" (click)="enterEvents(match.id)">
                            <i class="pi pi-list mr-2"></i>
                            Saisir les événements
                        </button>
                        <button class="p-button p-button-outlined" (click)="enterCards(match.id)">
                            <i class="pi pi-flag mr-2"></i>
                            Saisir les cartons
                        </button>
                    </div>
                </div>
            </div>

            <!-- Rapports soumis -->
            <div class="col-12" *ngIf="match.reports && match.reports.length > 0">
                <div class="card">
                    <h6>Rapports soumis</h6>
                    <div class="reports-list">
                        <div class="report-item" *ngFor="let report of match.reports">
                            <div class="report-info">
                                <div class="report-type">{{ getReportTypeLabel(report.reportType) }}</div>
                                <div class="report-date">{{ report.submittedAt | date:'dd/MM/yyyy HH:mm' }}</div>
                            </div>
                            <div class="report-status" [ngClass]="getReportStatusClass(report.status)">
                                {{ getReportStatusLabel(report.status) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Incidents signalés -->
            <div class="col-12" *ngIf="match.incidents && match.incidents.length > 0">
                <div class="card">
                    <h6>Incidents signalés</h6>
                    <div class="incidents-list">
                        <div class="incident-item" *ngFor="let incident of match.incidents">
                            <div class="incident-info">
                                <div class="incident-type">{{ getIncidentTypeLabel(incident.category) }}</div>
                                <div class="incident-description">{{ incident.description }}</div>
                                <div class="incident-date">{{ incident.reportedAt | date:'dd/MM/yyyy HH:mm' }}</div>
                            </div>
                            <div class="incident-status" [ngClass]="getIncidentStatusClass(incident.status)">
                                {{ getIncidentStatusLabel(incident.status) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <ng-template #loadingMatch>
            <div class="text-center p-4">
                <i class="pi pi-spin pi-spinner"></i>
                <p class="mt-2">Chargement des détails du match...</p>
            </div>
        </ng-template>
    `,
    styles: [`
        .match-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }

        .info-section h6 {
            color: var(--text-color-secondary);
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-section p {
            margin: 0;
            font-weight: 600;
        }

        .status-badge {
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

        .teams-display {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 1rem;
        }

        .team-card {
            flex: 1;
            text-align: center;
            padding: 1rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-card);
        }

        .team-name {
            font-size: 1.125rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .team-label {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
        }

        .vs-section {
            margin: 0 1rem;
            text-align: center;
        }

        .vs {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-color-secondary);
        }

        .score {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
        }

        .officials-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1rem;
        }

        .official-item {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-card);
        }

        .official-info {
            flex: 1;
        }

        .official-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .official-role {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
        }

        .pre-match-actions, .match-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            flex-wrap: wrap;
        }

        .reports-list, .incidents-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1rem;
        }

        .report-item, .incident-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-card);
        }

        .report-info, .incident-info {
            flex: 1;
        }

        .report-type, .incident-type {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .report-date, .incident-date {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
        }

        .incident-description {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
            margin: 0.25rem 0;
        }

        .report-status, .incident-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-draft {
            background: var(--yellow-100);
            color: var(--yellow-700);
        }

        .status-submitted {
            background: var(--blue-100);
            color: var(--blue-700);
        }

        .status-validated {
            background: var(--green-100);
            color: var(--green-700);
        }

        .status-pending {
            background: var(--orange-100);
            color: var(--orange-700);
        }

        .status-resolved {
            background: var(--green-100);
            color: var(--green-700);
        }

        .status-escalated {
            background: var(--red-100);
            color: var(--red-700);
        }

        /* Styles pour la feuille de match */
        .team-callup-section {
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            padding: 1rem;
            background: var(--surface-50);
        }

        .team-callup-header {
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--surface-border);
        }

        .team-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
        }

        .team-logo-small {
            width: 48px;
            height: 48px;
            object-fit: contain;
            border-radius: 4px;
        }

        .team-title {
            font-size: 1.125rem;
            font-weight: 700;
            margin: 0 0 0.25rem 0;
            color: var(--text-color);
        }

        .team-subtitle {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
            margin: 0;
        }

        .team-stats {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .stat-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            background: var(--primary-100);
            color: var(--primary-700);
        }

        .coach-info, .captain-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            background: var(--surface-card);
            border-radius: 6px;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
        }

        .coach-info i, .captain-info i {
            color: var(--primary-color);
        }

        .players-section {
            margin-top: 1rem;
        }

        .players-section-title {
            font-size: 0.875rem;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-color-secondary);
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--surface-border);
        }

        .players-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .player-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: var(--surface-card);
            border-radius: 6px;
            border: 1px solid var(--surface-border);
            transition: all 0.2s;
        }

        .player-item:hover {
            background: var(--surface-hover);
            transform: translateX(2px);
        }

        .player-jersey {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-color);
            color: white;
            font-weight: 700;
            font-size: 0.875rem;
            border-radius: 4px;
            flex-shrink: 0;
        }

        .player-photo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
        }

        .player-photo-placeholder {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--surface-200);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-color-secondary);
            flex-shrink: 0;
        }

        .player-info {
            flex: 1;
            min-width: 0;
        }

        .player-name {
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 0.125rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .player-position {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
            text-transform: uppercase;
        }
    `]
})
export class OfficialMatchDetailsComponent implements OnInit {
    match$!: Observable<OfficialMatch | null>;
    matchCallups$!: Observable<MatchCallups | null>;
    matchId: string = '';

    constructor(
        private officialMatchService: OfficialMatchService,
        private matchCallupService: MatchCallupService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.matchId = this.route.snapshot.paramMap.get('id') || '';
        this.match$ = this.officialMatchService.getMatchDetails(this.matchId);
        this.matchCallups$ = this.matchCallupService.getMatchCallups(this.matchId);
    }

    goBack() {
        window.history.back();
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

    getReportTypeLabel(type: string): string {
        switch (type) {
            case 'REFEREE':
                return 'Rapport d\'arbitre';
            case 'COMMISSIONER':
                return 'Rapport de commissaire';
            default:
                return type;
        }
    }

    getReportStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getReportStatusLabel(status: string): string {
        switch (status) {
            case 'DRAFT':
                return 'Brouillon';
            case 'SUBMITTED':
                return 'Soumis';
            case 'VALIDATED':
                return 'Validé';
            default:
                return status;
        }
    }

    getIncidentTypeLabel(category: string): string {
        switch (category) {
            case 'TEAM_INCOMPLETE':
                return 'Équipe incomplète';
            case 'FIELD_UNPLAYABLE':
                return 'Terrain impraticable';
            case 'DELAY':
                return 'Retard';
            case 'DISCIPLINE':
                return 'Discipline';
            case 'TECHNICAL':
                return 'Technique';
            case 'OTHER':
                return 'Autre';
            default:
                return category;
        }
    }

    getIncidentStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getIncidentStatusLabel(status: string): string {
        switch (status) {
            case 'PENDING':
                return 'En attente';
            case 'RESOLVED':
                return 'Résolu';
            case 'ESCALATED':
                return 'Escaladé';
            default:
                return status;
        }
    }

    submitReport(matchId: string) {
        console.log('Saisir rapport pour le match:', matchId);
        // Navigation vers la page de saisie de rapport
    }

    getStarters(players: any[]): any[] {
        if (!players) return [];
        return players.filter(p => p.is_starter === true || p.is_starter === 'true' || p.is_starter === '1');
    }

    getSubstitutes(players: any[]): any[] {
        if (!players) return [];
        return players.filter(p => p.is_starter === false || p.is_starter === 'false' || p.is_starter === '0' || p.is_starter === 0);
    }

    enterScore(matchId: string) {
        console.log('Saisir score pour le match:', matchId);
        // Ouvrir modal de saisie de score
    }

    enterEvents(matchId: string) {
        console.log('Saisir événements pour le match:', matchId);
        // Ouvrir modal de saisie d'événements
    }

    enterCards(matchId: string) {
        console.log('Saisir cartons pour le match:', matchId);
        // Ouvrir modal de saisie de cartons
    }
}