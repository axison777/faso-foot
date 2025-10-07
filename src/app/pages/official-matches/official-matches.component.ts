import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OfficialMatchService, OfficialMatch } from '../../service/official-match.service';
import { Observable } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { RatingModule } from 'primeng/rating';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-official-matches',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, RatingModule, ToastModule],
    providers: [MessageService],
    template: `
        <div class="matches-page">
            <!-- En-tête de la page -->
            <div class="page-header">
                <h1 class="page-title">Mes matchs assignés</h1>
                <div class="page-actions">
                    <select [(ngModel)]="selectedStatus" (ngModelChange)="filterMatches()" class="status-selector">
                        <option value="">Tous les statuts</option>
                        <option value="UPCOMING">À venir</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="COMPLETED">Terminés</option>
                        <option value="POSTPONED">Reportés</option>
                        <option value="CANCELLED">Annulés</option>
                    </select>
                    <button class="refresh-button" (click)="refreshMatches()">
                        <i class="pi pi-refresh"></i>
                        Actualiser
                    </button>
                </div>
            </div>

            <!-- Grille des matchs -->
            <div class="matches-grid" *ngIf="filteredMatches$ | async as matches; else loadingMatches">
                <div class="match-card" *ngFor="let match of matches">
                    <!-- En-tête de la carte -->
                    <div class="match-header">
                        <div class="competition-badge" [ngClass]="getCompetitionClass(match.competition.type)">
                            {{ match.competition.name }}
                        </div>
                        <div class="status-indicator" [ngClass]="getStatusClass(match.status)">
                            <div class="status-dot"></div>
                            <span>{{ getStatusLabel(match.status) }}</span>
                        </div>
                    </div>

                    <!-- Équipes -->
                    <div class="teams-section">
                        <div class="team home-team">
                            <div class="team-icon">⚽</div>
                            <div class="team-name">{{ match.homeTeam.name }}</div>
                        </div>
                        <div class="vs-section">
                            <div class="vs" *ngIf="match.status !== 'COMPLETED'">vs</div>
                            <div class="score" *ngIf="match.status === 'COMPLETED' && match.score">
                                {{ match.score.home }} - {{ match.score.away }}
                            </div>
                        </div>
                        <div class="team away-team">
                            <div class="team-icon">⚽</div>
                            <div class="team-name">{{ match.awayTeam.name }}</div>
                        </div>
                    </div>

                    <!-- Détails du match -->
                    <div class="match-details">
                        <div class="detail-item">
                            <i class="pi pi-calendar"></i>
                            <span>{{ match.scheduledAt | date:'dd/MM/yyyy' }}</span>
                        </div>
                        <div class="detail-item">
                            <i class="pi pi-clock"></i>
                            <span>{{ match.scheduledAt | date:'HH:mm' }}</span>
                        </div>
                        <div class="detail-item">
                            <i class="pi pi-map-marker"></i>
                            <span>{{ match.stadium.name }}</span>
                        </div>
                    </div>

                    <!-- Rôle de l'officiel -->
                    <div class="official-role">
                        <div class="role-icon">🧑‍⚖️</div>
                        <span class="role-badge" [ngClass]="getRoleClass(match.officialRole)">
                            {{ getRoleLabel(match.officialRole) }}
                        </span>
                    </div>

                    <!-- Actions -->
                    <div class="match-actions">
                        <button class="action-button primary" (click)="viewMatchDetails(match)">
                            <i class="pi pi-eye"></i>
                            Voir détails
                        </button>
                        <button class="action-button" 
                                *ngIf="match.canSubmitReport && !match.reportSubmitted"
                                (click)="submitReport(match.id, $event)">
                            <i class="pi pi-file-text"></i>
                            Saisir rapport
                        </button>
                        <div class="report-status" *ngIf="match.reportSubmitted">
                            <i class="pi pi-check-circle"></i>
                            <span>Rapport soumis</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- État de chargement -->
            <ng-template #loadingMatches>
                <div class="loading-state">
                    <i class="pi pi-spin pi-spinner"></i>
                    <p>Chargement des matchs...</p>
                </div>
            </ng-template>

            <!-- État vide -->
            <div class="empty-state" *ngIf="(filteredMatches$ | async)?.length === 0">
                <i class="pi pi-calendar"></i>
                <h3>Aucun match trouvé</h3>
                <p>Il n'y a aucun match correspondant à vos critères de recherche.</p>
            </div>
        </div>

        <!-- Modale de détails du match -->
        <p-dialog 
            [(visible)]="showMatchDetails" 
            [modal]="true" 
            [style]="{width: '90vw', maxWidth: '1200px'}" 
            [header]="'Détails du match'"
            [closable]="true">
            
            <div class="match-details-modal" *ngIf="selectedMatch">
                <!-- Informations générales -->
                <div class="match-info-section">
                    <h3>Informations du match</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Compétition</label>
                            <span>{{ selectedMatch.competition.name }}</span>
                        </div>
                        <div class="info-item">
                            <label>Date</label>
                            <span>{{ selectedMatch.scheduledAt | date:'dd/MM/yyyy' }}</span>
                        </div>
                        <div class="info-item">
                            <label>Heure</label>
                            <span>{{ selectedMatch.scheduledAt | date:'HH:mm' }}</span>
                        </div>
                        <div class="info-item">
                            <label>Stade</label>
                            <span>{{ selectedMatch.stadium.name }}</span>
                        </div>
                        <div class="info-item">
                            <label>Statut</label>
                            <span class="status-badge" [ngClass]="getStatusClass(selectedMatch.status)">
                                {{ getStatusLabel(selectedMatch.status) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Équipes et score -->
                <div class="teams-section-modal">
                    <h3>Équipes</h3>
                    <div class="teams-display">
                        <div class="team-modal">
                            <div class="team-name">{{ selectedMatch.homeTeam.name }}</div>
                            <div class="team-score" *ngIf="selectedMatch.score">
                                {{ selectedMatch.score.home }}
                            </div>
                        </div>
                        <div class="vs-modal">vs</div>
                        <div class="team-modal">
                            <div class="team-name">{{ selectedMatch.awayTeam.name }}</div>
                            <div class="team-score" *ngIf="selectedMatch.score">
                                {{ selectedMatch.score.away }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Officiels assignés -->
                <div class="officials-section" *ngIf="selectedMatch.otherOfficials">
                    <h3>Officiels assignés</h3>
                    <div class="officials-grid">
                        <div class="official-item" *ngFor="let official of selectedMatch.otherOfficials">
                            <div class="official-role">{{ getRoleLabel(official.role) }}</div>
                            <div class="official-name">{{ official.name }}</div>
                        </div>
                    </div>
                </div>

                <!-- Section événements -->
                <div class="events-section" *ngIf="selectedMatch.events && selectedMatch.events.length > 0">
                    <h3>Événements du match</h3>
                    <div class="events-list">
                        <div class="event-item" *ngFor="let event of selectedMatch.events">
                            <div class="event-time">{{ event.minute }}'</div>
                            <div class="event-type">{{ event.type }}</div>
                            <div class="event-description">{{ event.description }}</div>
                        </div>
                    </div>
                </div>

                <!-- Section rapport (pour commissaires) -->
                <div class="report-section" *ngIf="selectedMatch.officialRole === 'COMMISSIONER'">
                    <h3>Rapport de match</h3>
                    <div class="report-form">
                        <div class="form-group">
                            <label>Conditions météorologiques</label>
                            <input type="text" [(ngModel)]="matchReport.weather" placeholder="Ex: Ensoleillé, 25°C">
                        </div>
                        <div class="form-group">
                            <label>État du terrain</label>
                            <select [(ngModel)]="matchReport.fieldCondition">
                                <option value="EXCELLENT">Excellent</option>
                                <option value="GOOD">Bon</option>
                                <option value="FAIR">Correct</option>
                                <option value="POOR">Mauvais</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Affluence</label>
                            <input type="number" [(ngModel)]="matchReport.attendance" placeholder="Nombre de spectateurs">
                        </div>
                        <div class="form-group">
                            <label>Incidents</label>
                            <textarea [(ngModel)]="matchReport.incidents" rows="3" placeholder="Décrire les incidents survenus"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Résumé du match</label>
                            <textarea [(ngModel)]="matchReport.summary" rows="4" placeholder="Résumé général du match"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Évaluation des arbitres (pour commissaires) -->
                <div class="evaluation-section" *ngIf="selectedMatch.officialRole === 'COMMISSIONER' && selectedMatch.otherOfficials">
                    <h3>Évaluation des arbitres</h3>
                    <div class="evaluations-grid">
                        <div class="evaluation-card" *ngFor="let official of selectedMatch.otherOfficials; let i = index">
                            <h4>{{ official.name }} - {{ getRoleLabel(official.role) }}</h4>
                            <div class="evaluation-criteria">
                                <div class="criterion">
                                    <label>Ponctualité</label>
                                    <p-rating [(ngModel)]="evaluations[i].punctuality"></p-rating>
                                </div>
                                <div class="criterion">
                                    <label>Impartialité</label>
                                    <p-rating [(ngModel)]="evaluations[i].impartiality"></p-rating>
                                </div>
                                <div class="criterion">
                                    <label>Gestion du match</label>
                                    <p-rating [(ngModel)]="evaluations[i].matchManagement"></p-rating>
                                </div>
                                <div class="criterion">
                                    <label>Communication</label>
                                    <p-rating [(ngModel)]="evaluations[i].communication"></p-rating>
                                </div>
                            </div>
                            <div class="evaluation-comments">
                                <label>Commentaires</label>
                                <textarea [(ngModel)]="evaluations[i].comments" rows="2" placeholder="Commentaires sur cet officiel"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button pButton type="button" label="Fermer" class="p-button-text" (click)="closeMatchDetails()"></button>
                <button pButton type="button" label="Saisir rapport" class="p-button-success" 
                        *ngIf="selectedMatch?.canSubmitReport && !selectedMatch?.reportSubmitted"
                        (click)="goToReport()"></button>
                <button pButton type="button" label="Soumettre et clôturer" class="p-button-primary" 
                        *ngIf="selectedMatch?.officialRole === 'COMMISSIONER'"
                        (click)="submitAndCloseMatch()"></button>
            </ng-template>
        </p-dialog>

        <p-toast></p-toast>
    `,
    styles: [`
        .matches-page {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f3f4f6;
        }

        .page-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
        }

        .page-actions {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .status-selector {
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
            font-size: 0.875rem;
            min-width: 150px;
        }

        .refresh-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .refresh-button:hover {
            background: #2563eb;
            transform: translateY(-1px);
        }

        .matches-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 1.5rem;
        }

        .match-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .match-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
            border-color: #3b82f6;
        }

        .match-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .competition-badge {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .competition-league {
            background: #dbeafe;
            color: #1e40af;
        }

        .competition-cup {
            background: #fef3c7;
            color: #d97706;
        }

        .competition-tournament {
            background: #e0e7ff;
            color: #7c3aed;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .status-upcoming {
            background: #dbeafe;
            color: #1e40af;
        }

        .status-upcoming .status-dot {
            background: #3b82f6;
        }

        .status-in-progress {
            background: #fed7aa;
            color: #c2410c;
        }

        .status-in-progress .status-dot {
            background: #f97316;
        }

        .status-completed {
            background: #dcfce7;
            color: #166534;
        }

        .status-completed .status-dot {
            background: #22c55e;
        }

        .status-postponed {
            background: #fef3c7;
            color: #d97706;
        }

        .status-postponed .status-dot {
            background: #f59e0b;
        }

        .status-cancelled {
            background: #fecaca;
            color: #dc2626;
        }

        .status-cancelled .status-dot {
            background: #ef4444;
        }

        .teams-section {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 12px;
        }

        .team {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .team-icon {
            font-size: 1.5rem;
        }

        .team-name {
            font-weight: 600;
            font-size: 1rem;
            color: #1a1a1a;
        }

        .vs-section {
            margin: 0 1rem;
            text-align: center;
        }

        .vs {
            color: #6b7280;
            font-weight: 700;
            font-size: 1.1rem;
        }

        .score {
            font-weight: 800;
            font-size: 1.5rem;
            color: #3b82f6;
        }

        .match-details {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .detail-item i {
            color: #9ca3af;
            width: 16px;
        }

        .official-role {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding: 0.75rem;
            background: #f3f4f6;
            border-radius: 8px;
        }

        .role-icon {
            font-size: 1.2rem;
        }

        .role-badge {
            padding: 0.375rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .role-referee {
            background: #dcfce7;
            color: #166534;
        }

        .role-assistant {
            background: #dbeafe;
            color: #1e40af;
        }

        .role-commissioner {
            background: #fed7aa;
            color: #c2410c;
        }

        .match-actions {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .action-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }

        .action-button:hover {
            background: #f9fafb;
            border-color: #9ca3af;
        }

        .action-button.primary {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }

        .action-button.primary:hover {
            background: #2563eb;
            border-color: #2563eb;
        }

        .report-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: #dcfce7;
            color: #166534;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .loading-state, .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #6b7280;
        }

        .loading-state i, .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            display: block;
        }

        .empty-state h3 {
            margin: 0 0 0.5rem 0;
            color: #374151;
        }

        .empty-state p {
            margin: 0;
        }

        /* Modale de détails */
        .match-details-modal {
            max-height: 70vh;
            overflow-y: auto;
        }

        .match-info-section, .teams-section-modal, .officials-section, .events-section, .report-section, .evaluation-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f9fafb;
            border-radius: 12px;
        }

        .match-info-section h3, .teams-section-modal h3, .officials-section h3, .events-section h3, .report-section h3, .evaluation-section h3 {
            margin: 0 0 1rem 0;
            color: #1a1a1a;
            font-size: 1.25rem;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .info-item label {
            font-weight: 600;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .info-item span {
            color: #1a1a1a;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .teams-display {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
        }

        .team-modal {
            text-align: center;
        }

        .team-modal .team-name {
            font-weight: 600;
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .team-score {
            font-size: 2rem;
            font-weight: 800;
            color: #3b82f6;
        }

        .vs-modal {
            font-size: 1.5rem;
            font-weight: 700;
            color: #6b7280;
        }

        .officials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .official-item {
            padding: 1rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .official-role {
            font-weight: 600;
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }

        .official-name {
            color: #1a1a1a;
            font-weight: 600;
        }

        .events-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .event-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .event-time {
            font-weight: 700;
            color: #3b82f6;
            min-width: 40px;
        }

        .event-type {
            font-weight: 600;
            color: #1a1a1a;
            min-width: 100px;
        }

        .event-description {
            color: #6b7280;
        }

        .report-form {
            display: grid;
            gap: 1rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-group label {
            font-weight: 600;
            color: #374151;
        }

        .form-group input, .form-group select, .form-group textarea {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.875rem;
        }

        .evaluations-grid {
            display: grid;
            gap: 1.5rem;
        }

        .evaluation-card {
            padding: 1.5rem;
            background: white;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }

        .evaluation-card h4 {
            margin: 0 0 1rem 0;
            color: #1a1a1a;
        }

        .evaluation-criteria {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .criterion {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .criterion label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
        }

        .evaluation-comments {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .evaluation-comments label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .matches-page {
                padding: 1rem;
            }

            .page-header {
                flex-direction: column;
                gap: 1rem;
                align-items: flex-start;
            }

            .matches-grid {
                grid-template-columns: 1fr;
            }

            .teams-section {
                flex-direction: column;
                gap: 1rem;
            }

            .vs-section {
                margin: 0;
            }
        }
    `]
})
export class OfficialMatchesComponent implements OnInit {
    filteredMatches$!: Observable<OfficialMatch[]>;
    selectedStatus = '';
    showMatchDetails = false;
    selectedMatch: OfficialMatch | null = null;
    matchReport: any = {
        weather: '',
        fieldCondition: 'GOOD',
        attendance: 0,
        incidents: '',
        summary: ''
    };
    evaluations: any[] = [];

    constructor(
        private officialMatchService: OfficialMatchService,
        private messageService: MessageService
    ) {}

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

    getCompetitionClass(type: string): string {
        switch (type) {
            case 'LEAGUE':
                return 'competition-league';
            case 'CUP':
                return 'competition-cup';
            case 'TOURNAMENT':
                return 'competition-tournament';
            default:
                return 'competition-league';
        }
    }

    viewMatchDetails(match: OfficialMatch) {
        this.selectedMatch = match;
        this.showMatchDetails = true;
        
        // Initialiser les évaluations si c'est un commissaire
        if (match.officialRole === 'COMMISSIONER' && match.otherOfficials) {
            this.evaluations = match.otherOfficials.map(official => ({
                officialId: official.id,
                officialName: official.name,
                role: official.role,
                punctuality: 5,
                impartiality: 5,
                matchManagement: 5,
                communication: 5,
                comments: ''
            }));
        }
    }

    closeMatchDetails() {
        this.showMatchDetails = false;
        this.selectedMatch = null;
        this.evaluations = [];
    }

    goToReport() {
        if (this.selectedMatch) {
            this.closeMatchDetails();
            // Navigation vers la page de rapport
            // this.router.navigate(['/officiel/match-report', this.selectedMatch.id]);
            console.log('Aller au rapport pour le match:', this.selectedMatch.id);
        }
    }

    submitAndCloseMatch() {
        if (this.selectedMatch) {
            // Logique de soumission du rapport et clôture du match
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Rapport soumis et match clôturé avec succès'
            });
            this.closeMatchDetails();
            this.refreshMatches();
        }
    }
}