import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OfficialMatchService, OfficialMatch } from '../../service/official-match.service';
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

            <!-- Actions avant le match (pour commissaires) -->
            <div class="col-12" *ngIf="match.officialRole === 'COMMISSIONER' && match.status === 'UPCOMING'">
                <div class="card">
                    <h6>Actions avant le match</h6>
                    <div class="pre-match-actions">
                        <button class="p-button p-button-success" (click)="validateMatchSheet(match.id)">
                            <i class="pi pi-check mr-2"></i>
                            Valider la feuille de match
                        </button>
                        <button class="p-button p-button-warn" (click)="reportIncident(match.id)">
                            <i class="pi pi-exclamation-triangle mr-2"></i>
                            Signaler un incident
                        </button>
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
    `]
})
export class OfficialMatchDetailsComponent implements OnInit {
    match$: Observable<OfficialMatch | null>;
    matchId: string = '';

    constructor(
        private officialMatchService: OfficialMatchService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.matchId = this.route.snapshot.paramMap.get('id') || '';
        this.match$ = this.officialMatchService.getMatchDetails(this.matchId);
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

    validateMatchSheet(matchId: string) {
        console.log('Valider feuille de match pour:', matchId);
        // Ouvrir modal de validation
    }

    reportIncident(matchId: string) {
        console.log('Signaler incident pour le match:', matchId);
        // Ouvrir modal de signalement d'incident
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