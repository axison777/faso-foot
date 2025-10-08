import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { CoachMatchDetailsModalComponent } from './coach-match-details-modal.component';

interface CoachMatch {
    id: string;
    competition: {
        name: string;
        type: 'LEAGUE' | 'CUP' | 'FRIENDLY';
    };
    homeTeam: {
        id: string;
        name: string;
        logo?: string;
    };
    awayTeam: {
        id: string;
        name: string;
        logo?: string;
    };
    scheduledAt: string;
    stadium: {
        name: string;
        address: string;
    };
    status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
    score?: {
        home: number;
        away: number;
        halfTime?: {
            home: number;
            away: number;
        };
    };
    teamSheetSubmitted: boolean;
    teamSheetStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    teamSheetRejectionReason?: string;
    isHomeTeam: boolean;
    opponent: {
        name: string;
        logo?: string;
    };
    events?: Array<{
        id: string;
        minute: number;
        type: string;
        description: string;
    }>;
}

@Component({
    selector: 'app-coach-matches',
    standalone: true,
    imports: [
        CommonModule, RouterModule, FormsModule, DialogModule, ButtonModule,
        InputTextModule, TextareaModule, CheckboxModule, ToastModule, CoachMatchDetailsModalComponent
    ],
    providers: [MessageService],
    template: `
        <div class="matches-page">
            <!-- En-tête de la page -->
            <div class="page-header">
                <div class="header-content">
                    <h1>Mes Matchs</h1>
                    <p>Gérez les matchs de votre équipe</p>
                </div>
            </div>

            <!-- Filtres et actions -->
            <div class="filters-section">
                <div class="filters-row">
                    <div class="filter-group">
                        <label for="statusFilter">Statut</label>
                        <select id="statusFilter" [(ngModel)]="selectedStatus" (change)="filterMatches()" class="filter-select">
                            <option value="">Tous les statuts</option>
                            <option value="UPCOMING">À venir</option>
                            <option value="IN_PROGRESS">En cours</option>
                            <option value="COMPLETED">Terminés</option>
                            <option value="POSTPONED">Reportés</option>
                        </select>
                    </div>
                    <button class="refresh-button" (click)="refreshMatches()">
                        <i class="pi pi-refresh"></i>
                        Actualiser
                    </button>
                </div>
            </div>

            <!-- Liste des matchs -->
            <div class="matches-section" *ngIf="filteredMatches$ | async as matches; else loadingMatches">
                <div class="matches-grid" *ngIf="matches.length > 0; else noMatches">
                    <div class="match-card" *ngFor="let match of matches">
                        <!-- En-tête de la carte -->
                        <div class="match-header">
                            <div class="competition-badge" [ngClass]="getCompetitionClass(match.competition.type)">
                                {{ match.competition.name }}
                            </div>
                            <div class="match-status" [ngClass]="getStatusClass(match.status)">
                                {{ getStatusLabel(match.status) }}
                            </div>
                        </div>

                        <!-- Équipes -->
                        <div class="teams-section">
                            <div class="team-info" [ngClass]="{ 'home-team': match.isHomeTeam }">
                                <div class="team-logo" *ngIf="match.homeTeam.logo">
                                    <img [src]="match.homeTeam.logo" [alt]="match.homeTeam.name">
                                </div>
                                <div class="team-name">{{ match.homeTeam.name }}</div>
                            </div>
                            
                            <div class="vs-section">
                                <div class="vs-text">VS</div>
                                <div class="score" *ngIf="match.score">
                                    {{ match.score.home }} - {{ match.score.away }}
                                </div>
                            </div>
                            
                            <div class="team-info" [ngClass]="{ 'away-team': !match.isHomeTeam }">
                                <div class="team-logo" *ngIf="match.awayTeam.logo">
                                    <img [src]="match.awayTeam.logo" [alt]="match.awayTeam.name">
                                </div>
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

                        <!-- Statut de la feuille de match -->
                        <div class="team-sheet-status" *ngIf="match.teamSheetSubmitted">
                            <div class="status-badge" [ngClass]="getTeamSheetStatusClass(match.teamSheetStatus)">
                                <i class="pi" [ngClass]="getTeamSheetIcon(match.teamSheetStatus)"></i>
                                {{ getTeamSheetStatusLabel(match.teamSheetStatus) }}
                            </div>
                            <div class="rejection-reason" *ngIf="match.teamSheetRejectionReason">
                                <small>{{ match.teamSheetRejectionReason }}</small>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="match-actions">
                            <button class="action-button primary" (click)="openMatchDetails(match)">
                                <i class="pi pi-eye"></i>
                                Voir détails
                            </button>
                            <button class="action-button" 
                                    *ngIf="!match.teamSheetSubmitted && match.status === 'UPCOMING'"
                                    (click)="openMatchDetails(match)">
                                <i class="pi pi-file-text"></i>
                                Soumettre feuille
                            </button>
                            <div class="submitted-status" *ngIf="match.teamSheetSubmitted">
                                <i class="pi pi-check-circle"></i>
                                <span>Feuille soumise</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- État vide -->
                <ng-template #noMatches>
                    <div class="empty-state">
                        <i class="pi pi-calendar-times"></i>
                        <h3>Aucun match trouvé</h3>
                        <p>Il n'y a aucun match correspondant à vos critères de recherche.</p>
                    </div>
                </ng-template>
            </div>

            <!-- État de chargement -->
            <ng-template #loadingMatches>
                <div class="loading-state">
                    <i class="pi pi-spin pi-spinner"></i>
                    <p>Chargement des matchs...</p>
                </div>
            </ng-template>
        </div>

        <!-- Modale de détails du match -->
        <app-coach-match-details-modal 
            [(visible)]="showMatchDetails"
            [match]="selectedMatch"
            (teamSheetSubmitted)="onTeamSheetSubmitted($event)">
        </app-coach-match-details-modal>

        <p-toast></p-toast>
    `,
    styles: [`
        .matches-page {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .page-header {
            margin-bottom: 2rem;
        }

        .header-content h1 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
            font-size: 2rem;
            font-weight: 700;
        }

        .header-content p {
            margin: 0;
            color: #6b7280;
            font-size: 1.1rem;
        }

        .filters-section {
            background: #f9fafb;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
        }

        .filters-row {
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 1rem;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .filter-group label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
        }

        .filter-select {
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
            font-size: 0.875rem;
            min-width: 200px;
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
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 1.5rem;
        }

        .match-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .match-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
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

        .competition-friendly {
            background: #dcfce7;
            color: #166534;
        }

        .match-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-upcoming {
            background: #dbeafe;
            color: #1e40af;
        }

        .status-in-progress {
            background: #fed7aa;
            color: #c2410c;
        }

        .status-completed {
            background: #dcfce7;
            color: #166534;
        }

        .status-postponed {
            background: #fef3c7;
            color: #d97706;
        }

        .status-cancelled {
            background: #fecaca;
            color: #dc2626;
        }

        .teams-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }

        .team-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
        }

        .team-info.home-team {
            background: #f0f9ff;
            padding: 1rem;
            border-radius: 12px;
            border: 2px solid #0ea5e9;
        }

        .team-info.away-team {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 12px;
            border: 2px solid #e2e8f0;
        }

        .team-logo {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
        }

        .team-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .team-name {
            font-weight: 600;
            color: #1a1a1a;
            text-align: center;
            font-size: 0.9rem;
        }

        .vs-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            margin: 0 1rem;
        }

        .vs-text {
            font-weight: 700;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .score {
            font-weight: 800;
            color: #3b82f6;
            font-size: 1.25rem;
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

        .team-sheet-status {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .status-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .status-pending {
            color: #d97706;
        }

        .status-approved {
            color: #166534;
        }

        .status-rejected {
            color: #dc2626;
        }

        .rejection-reason {
            margin-top: 0.5rem;
            color: #dc2626;
            font-size: 0.75rem;
        }

        .match-actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .action-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }

        .action-button.primary {
            background: #3b82f6;
            color: white;
        }

        .action-button.primary:hover {
            background: #2563eb;
            transform: translateY(-1px);
        }

        .action-button:not(.primary) {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
        }

        .action-button:not(.primary):hover {
            background: #e5e7eb;
            transform: translateY(-1px);
        }

        .submitted-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #166534;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .empty-state, .loading-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #6b7280;
        }

        .empty-state i, .loading-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #9ca3af;
        }

        .empty-state h3, .loading-state h3 {
            margin: 0 0 0.5rem 0;
            color: #374151;
        }

        .empty-state p, .loading-state p {
            margin: 0;
        }

        .loading-state i {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .matches-page {
                padding: 1rem;
            }

            .matches-grid {
                grid-template-columns: 1fr;
            }

            .filters-row {
                flex-direction: column;
                align-items: stretch;
            }

            .match-actions {
                flex-direction: column;
            }

            .action-button {
                justify-content: center;
            }
        }
    `]
})
export class CoachMatchesComponent implements OnInit {
    filteredMatches$!: Observable<CoachMatch[]>;
    selectedStatus = '';
    showMatchDetails = false;
    selectedMatch: CoachMatch | null = null;

    constructor(private messageService: MessageService) {}

    ngOnInit() {
        this.loadMatches();
    }

    loadMatches() {
        // Simuler des données de matchs (à remplacer par des appels API réels)
        const mockMatches: CoachMatch[] = [
            {
                id: '1',
                competition: { name: 'Championnat D1', type: 'LEAGUE' },
                homeTeam: { id: '1', name: 'Mon Équipe', logo: 'assets/images/team-logo.png' },
                awayTeam: { id: '2', name: 'Équipe Adversaire', logo: 'assets/images/opponent-logo.png' },
                scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
                stadium: { name: 'Stade Municipal', address: '123 Rue du Sport' },
                status: 'UPCOMING',
                isHomeTeam: true,
                opponent: { name: 'Équipe Adversaire', logo: 'assets/images/opponent-logo.png' },
                teamSheetSubmitted: false,
                teamSheetStatus: 'PENDING'
            },
            {
                id: '2',
                competition: { name: 'Coupe Nationale', type: 'CUP' },
                homeTeam: { id: '3', name: 'Équipe Locale', logo: 'assets/images/local-logo.png' },
                awayTeam: { id: '1', name: 'Mon Équipe', logo: 'assets/images/team-logo.png' },
                scheduledAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
                stadium: { name: 'Complexe Sportif', address: '456 Avenue des Champions' },
                status: 'UPCOMING',
                isHomeTeam: false,
                opponent: { name: 'Équipe Locale', logo: 'assets/images/local-logo.png' },
                teamSheetSubmitted: true,
                teamSheetStatus: 'APPROVED'
            },
            {
                id: '3',
                competition: { name: 'Championnat D1', type: 'LEAGUE' },
                homeTeam: { id: '1', name: 'Mon Équipe', logo: 'assets/images/team-logo.png' },
                awayTeam: { id: '4', name: 'Rivaux FC', logo: 'assets/images/rivals-logo.png' },
                scheduledAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
                stadium: { name: 'Stade Municipal', address: '123 Rue du Sport' },
                status: 'COMPLETED',
                score: { home: 2, away: 1, halfTime: { home: 1, away: 0 } },
                isHomeTeam: true,
                opponent: { name: 'Rivaux FC', logo: 'assets/images/rivals-logo.png' },
                teamSheetSubmitted: true,
                teamSheetStatus: 'APPROVED'
            }
        ];

        this.filteredMatches$ = new Observable(observer => {
            observer.next(mockMatches);
        });
    }

    filterMatches() {
        // Logique de filtrage (à implémenter)
        this.loadMatches();
    }

    refreshMatches() {
        this.messageService.add({
            severity: 'info',
            summary: 'Actualisation',
            detail: 'Liste des matchs actualisée'
        });
        this.loadMatches();
    }

    openMatchDetails(match: CoachMatch) {
        this.selectedMatch = match;
        this.showMatchDetails = true;
    }

    onTeamSheetSubmitted(teamSheetData: any) {
        console.log('Feuille de match soumise:', teamSheetData);
        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Feuille de match soumise avec succès'
        });
        this.refreshMatches();
    }

    getCompetitionClass(type: string): string {
        switch (type) {
            case 'LEAGUE': return 'competition-league';
            case 'CUP': return 'competition-cup';
            case 'FRIENDLY': return 'competition-friendly';
            default: return 'competition-league';
        }
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'UPCOMING': return 'À venir';
            case 'IN_PROGRESS': return 'En cours';
            case 'COMPLETED': return 'Terminé';
            case 'POSTPONED': return 'Reporté';
            case 'CANCELLED': return 'Annulé';
            default: return status;
        }
    }

    getTeamSheetStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getTeamSheetStatusLabel(status: string): string {
        switch (status) {
            case 'PENDING': return 'En attente de validation';
            case 'APPROVED': return 'Approuvée';
            case 'REJECTED': return 'Rejetée';
            default: return status;
        }
    }

    getTeamSheetIcon(status: string): string {
        switch (status) {
            case 'PENDING': return 'pi-clock';
            case 'APPROVED': return 'pi-check-circle';
            case 'REJECTED': return 'pi-times-circle';
            default: return 'pi-clock';
        }
    }
}