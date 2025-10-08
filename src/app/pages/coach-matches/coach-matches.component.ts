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
                    <h1>Calendrier de la Saison</h1>
                    <p>Gérez les matchs de votre équipe</p>
                </div>
            </div>

            <!-- Filtres et navigation -->
            <div class="filters-section">
                <div class="filters-main">
                    <!-- Filtres par compétition (Tags) -->
                    <div class="competition-filters">
                        <h3>Compétitions</h3>
                        <div class="filter-tags">
                            <button class="filter-tag" 
                                    [class.active]="selectedCompetition === ''"
                                    (click)="filterByCompetition('')">
                                Toutes
                            </button>
                            <button class="filter-tag" 
                                    [class.active]="selectedCompetition === 'LEAGUE'"
                                    (click)="filterByCompetition('LEAGUE')">
                                <i class="pi pi-trophy"></i>
                                Championnat
                            </button>
                            <button class="filter-tag" 
                                    [class.active]="selectedCompetition === 'CUP'"
                                    (click)="filterByCompetition('CUP')">
                                <i class="pi pi-star"></i>
                                Coupe Nationale
                            </button>
                            <button class="filter-tag" 
                                    [class.active]="selectedCompetition === 'FRIENDLY'"
                                    (click)="filterByCompetition('FRIENDLY')">
                                <i class="pi pi-heart"></i>
                                Match Amical
                            </button>
                        </div>
                    </div>

                    <!-- Filtres par statut -->
                    <div class="status-filters">
                        <h3>Statut</h3>
                        <div class="filter-tags">
                            <button class="filter-tag" 
                                    [class.active]="selectedStatus === ''"
                                    (click)="filterByStatus('')">
                                Tous
                            </button>
                            <button class="filter-tag upcoming" 
                                    [class.active]="selectedStatus === 'UPCOMING'"
                                    (click)="filterByStatus('UPCOMING')">
                                <i class="pi pi-clock"></i>
                                À venir
                            </button>
                            <button class="filter-tag in-progress" 
                                    [class.active]="selectedStatus === 'IN_PROGRESS'"
                                    (click)="filterByStatus('IN_PROGRESS')">
                                <i class="pi pi-play"></i>
                                En cours
                            </button>
                            <button class="filter-tag completed" 
                                    [class.active]="selectedStatus === 'COMPLETED'"
                                    (click)="filterByStatus('COMPLETED')">
                                <i class="pi pi-check"></i>
                                Terminés
                            </button>
                            <button class="filter-tag postponed" 
                                    [class.active]="selectedStatus === 'POSTPONED'"
                                    (click)="filterByStatus('POSTPONED')">
                                <i class="pi pi-exclamation-triangle"></i>
                                Reportés
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="actions-row">
                    <button class="refresh-button" (click)="refreshMatches()">
                        <i class="pi pi-refresh"></i>
                        Actualiser
                    </button>
                </div>
            </div>

            <!-- Navigation rapide par mois -->
            <div class="quick-nav">
                <h3>Navigation Rapide</h3>
                <div class="month-nav">
                    <button class="month-btn" 
                            *ngFor="let month of months" 
                            [class.active]="selectedMonth === month.value"
                            (click)="filterByMonth(month.value)">
                        {{ month.label }}
                    </button>
                </div>
            </div>

            <!-- Liste des matchs regroupés par compétition -->
            <div class="matches-section" *ngIf="groupedMatches$ | async as groupedMatches; else loadingMatches">
                <div *ngIf="getGroupedMatchesKeys(groupedMatches).length > 0; else noMatches">
                    <div class="competition-group" *ngFor="let group of getCompetitionGroups(groupedMatches)">
                        <div class="competition-header">
                            <div class="competition-info">
                                <i class="pi" [ngClass]="getCompetitionIcon(group.competition.type)"></i>
                                <h2>{{ group.competition.name }}</h2>
                                <span class="match-count">{{ group.matches.length }} match{{ group.matches.length > 1 ? 's' : '' }}</span>
                            </div>
                            <div class="competition-stats">
                                <div class="stat-item">
                                    <span class="stat-value">{{ getWins(group.matches) }}</span>
                                    <span class="stat-label">Victoires</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">{{ getDraws(group.matches) }}</span>
                                    <span class="stat-label">Nuls</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">{{ getLosses(group.matches) }}</span>
                                    <span class="stat-label">Défaites</span>
                                </div>
                            </div>
                        </div>

                        <div class="matches-grid">
                            <div class="match-card" 
                                 *ngFor="let match of group.matches" 
                                 [ngClass]="getMatchCardClass(match)">
                                
                                <!-- En-tête de carte avec statut -->
                                <div class="match-header" [ngClass]="getMatchHeaderClass(match.status)">
                                    <div class="match-date-time">
                                        <div class="date">{{ match.scheduledAt | date:'dd MMM':'':'fr' }}</div>
                                        <div class="time" *ngIf="match.status === 'UPCOMING'">
                                            {{ match.scheduledAt | date:'HH:mm':'':'fr' }}
                                        </div>
                                        <div class="score" *ngIf="match.score">
                                            {{ match.score.home }} - {{ match.score.away }}
                                        </div>
                                    </div>
                                    <div class="match-status-badge" [ngClass]="getStatusClass(match.status)">
                                        <i class="pi" [ngClass]="getStatusIcon(match.status)"></i>
                                        {{ getStatusLabel(match.status) }}
                                    </div>
                                </div>

                                <!-- Confrontation -->
                                <div class="confrontation">
                                    <div class="team-section" [ngClass]="{ 'my-team': match.isHomeTeam }">
                                        <div class="team-logo">
                                            <img [src]="match.homeTeam.logo || 'assets/images/default-team.png'" 
                                                 [alt]="match.homeTeam.name">
                                        </div>
                                        <div class="team-name">{{ match.homeTeam.name }}</div>
                                    </div>
                                    
                                    <div class="vs-section">
                                        <div class="vs-text">VS</div>
                                        <div class="match-result" *ngIf="match.score">
                                            <div class="score-display" [ngClass]="getScoreClass(match)">
                                                <span class="home-score" [ngClass]="{ 'highlight': match.isHomeTeam && match.score.home > match.score.away }">
                                                    {{ match.score.home }}
                                                </span>
                                                <span class="separator">-</span>
                                                <span class="away-score" [ngClass]="{ 'highlight': !match.isHomeTeam && match.score.away > match.score.home }">
                                                    {{ match.score.away }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="time-display" *ngIf="match.status === 'UPCOMING'">
                                            {{ match.scheduledAt | date:'HH:mm':'':'fr' }}
                                        </div>
                                    </div>
                                    
                                    <div class="team-section" [ngClass]="{ 'my-team': !match.isHomeTeam }">
                                        <div class="team-logo">
                                            <img [src]="match.awayTeam.logo || 'assets/images/default-team.png'" 
                                                 [alt]="match.awayTeam.name">
                                        </div>
                                        <div class="team-name">{{ match.awayTeam.name }}</div>
                                    </div>
                                </div>

                                <!-- Détails rapides -->
                                <div class="match-details">
                                    <div class="detail-row">
                                        <div class="detail-item">
                                            <i class="pi pi-map-marker"></i>
                                            <span>{{ match.stadium.name }}</span>
                                        </div>
                                        <div class="detail-item" *ngIf="match.teamSheetSubmitted">
                                            <i class="pi" [ngClass]="getTeamSheetIcon(match.teamSheetStatus)"></i>
                                            <span [ngClass]="getTeamSheetStatusClass(match.teamSheetStatus)">
                                                {{ getTeamSheetStatusLabel(match.teamSheetStatus) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="match-actions">
                                    <button class="action-button primary" (click)="openMatchDetails(match)">
                                        <i class="pi pi-cog"></i>
                                        Préparer & Détails
                                    </button>
                                </div>
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

            <!-- Pagination -->
            <div class="pagination-section" *ngIf="(groupedMatches$ | async) && getGroupedMatchesKeys((groupedMatches$ | async)!).length > 0">
                <div class="pagination-controls">
                    <button class="pagination-btn prev" [disabled]="currentPage === 1" (click)="previousPage()">
                        <i class="pi pi-chevron-left"></i>
                        Précédent
                    </button>
                    <div class="page-info">
                        Page {{ currentPage }} sur {{ totalPages }}
                    </div>
                    <button class="pagination-btn next" [disabled]="currentPage === totalPages" (click)="nextPage()">
                        Suivant
                        <i class="pi pi-chevron-right"></i>
                    </button>
                </div>
            </div>
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
            background: #f8fafc;
            min-height: 100vh;
        }

        .page-header {
            margin-bottom: 2rem;
        }

        .header-content h1 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
            font-size: 2.5rem;
            font-weight: 700;
        }

        .header-content p {
            margin: 0;
            color: #6b7280;
            font-size: 1.1rem;
        }

        /* Filtres et Navigation */
        .filters-section {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }

        .filters-main {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 1.5rem;
        }

        .competition-filters, .status-filters {
            h3 {
                margin: 0 0 1rem 0;
                font-size: 1.1rem;
                font-weight: 600;
                color: #374151;
            }
        }

        .filter-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
        }

        .filter-tag {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            border: 2px solid #e5e7eb;
            border-radius: 25px;
            background: white;
            color: #6b7280;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                border-color: #3b82f6;
                color: #3b82f6;
                transform: translateY(-2px);
            }

            &.active {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }

            i {
                font-size: 1rem;
            }
        }

        .filter-tag.upcoming.active {
            background: #10b981;
            border-color: #10b981;
        }

        .filter-tag.in-progress.active {
            background: #f59e0b;
            border-color: #f59e0b;
        }

        .filter-tag.completed.active {
            background: #3b82f6;
            border-color: #3b82f6;
        }

        .filter-tag.postponed.active {
            background: #ef4444;
            border-color: #ef4444;
        }

        .actions-row {
            display: flex;
            justify-content: flex-end;
        }

        .refresh-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

            &:hover {
                background: #059669;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            }
        }

        /* Navigation Rapide */
        .quick-nav {
            background: white;
            padding: 1.5rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;

            h3 {
                margin: 0 0 1rem 0;
                font-size: 1.1rem;
                font-weight: 600;
                color: #374151;
            }
        }

        .month-nav {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .month-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            background: white;
            color: #6b7280;
            font-weight: 500;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                border-color: #3b82f6;
                color: #3b82f6;
                transform: translateY(-1px);
            }

            &.active {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
                transform: translateY(-1px);
            }
        }

        /* Groupes de Compétition */
        .competition-group {
            margin-bottom: 3rem;
        }

        .competition-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            color: white;
        }

        .competition-info {
            display: flex;
            align-items: center;
            gap: 1rem;

            i {
                font-size: 2rem;
            }

            h2 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 700;
            }

            .match-count {
                background: rgba(255, 255, 255, 0.2);
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.875rem;
                font-weight: 600;
            }
        }

        .competition-stats {
            display: flex;
            gap: 2rem;

            .stat-item {
                text-align: center;

                .stat-value {
                    display: block;
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    font-size: 0.875rem;
                    opacity: 0.8;
                }
            }
        }

        /* Grille des Matchs */
        .matches-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
            gap: 1.5rem;
        }

        /* Cartes de Match */
        .match-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            position: relative;

            &:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
            }

            /* Différenciation visuelle par statut */
            &.status-upcoming {
                border-left: 4px solid #10b981;
            }

            &.status-completed {
                &.result-win {
                    border-left: 4px solid #10b981;
                }
                &.result-draw {
                    border-left: 4px solid #f59e0b;
                }
                &.result-loss {
                    border-left: 4px solid #ef4444;
                }
            }

            &.status-in-progress {
                border-left: 4px solid #3b82f6;
            }

            &.status-postponed {
                border-left: 4px solid #f59e0b;
            }
        }

        .match-header {
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;

            &.header-upcoming {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }

            &.header-completed {
                background: #f8fafc;
                color: #374151;
            }

            &.header-in-progress {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
            }

            &.header-postponed {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
            }
        }

        .match-date-time {
            .date {
                font-size: 1.1rem;
                font-weight: 600;
            }

            .time {
                font-size: 0.9rem;
                opacity: 0.8;
            }

            .score {
                font-size: 1.25rem;
                font-weight: 700;
                margin-top: 0.25rem;
            }
        }

        .match-status-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.2);

            i {
                font-size: 1rem;
            }
        }

        /* Confrontation */
        .confrontation {
            padding: 2rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .team-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            flex: 1;

            &.my-team {
                background: #f0f9ff;
                padding: 1.5rem;
                border-radius: 12px;
                border: 2px solid #0ea5e9;
            }
        }

        .team-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .team-name {
            font-weight: 600;
            color: #1a1a1a;
            text-align: center;
            font-size: 1rem;
        }

        .vs-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            margin: 0 1.5rem;

            .vs-text {
                font-weight: 700;
                color: #6b7280;
                font-size: 1.25rem;
            }

            .time-display {
                font-size: 1.1rem;
                font-weight: 600;
                color: #3b82f6;
            }
        }

        .match-result {
            .score-display {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.5rem;
                font-weight: 700;

                .home-score, .away-score {
                    min-width: 2rem;
                    text-align: center;

                    &.highlight {
                        color: #10b981;
                        font-size: 1.75rem;
                    }
                }

                .separator {
                    color: #6b7280;
                }
            }

            &.score-win .score-display {
                color: #10b981;
            }

            &.score-loss .score-display {
                color: #ef4444;
            }

            &.score-draw .score-display {
                color: #f59e0b;
            }
        }

        /* Détails du Match */
        .match-details {
            padding: 1rem 1.5rem;
            background: #f8fafc;
            border-top: 1px solid #e5e7eb;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #6b7280;
            font-size: 0.875rem;

            i {
                color: #9ca3af;
                width: 16px;
            }

            &.status-pending {
                color: #d97706;
            }

            &.status-approved {
                color: #166534;
            }

            &.status-rejected {
                color: #dc2626;
            }
        }

        /* Actions */
        .match-actions {
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
        }

        .action-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            justify-content: center;

            &.primary {
                background: #10b981;
                color: white;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

                &:hover {
                    background: #059669;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
                }
            }

            i {
                font-size: 1rem;
            }
        }

        /* Pagination */
        .pagination-section {
            margin-top: 3rem;
            display: flex;
            justify-content: center;
        }

        .pagination-controls {
            display: flex;
            align-items: center;
            gap: 2rem;
            background: white;
            padding: 1rem 2rem;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }

        .pagination-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            color: #6b7280;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover:not(:disabled) {
                border-color: #3b82f6;
                color: #3b82f6;
                transform: translateY(-2px);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            i {
                font-size: 1rem;
            }
        }

        .page-info {
            font-weight: 600;
            color: #374151;
        }

        /* États */
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
        @media (max-width: 1200px) {
            .filters-main {
                grid-template-columns: 1fr;
            }

            .competition-header {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }

            .competition-stats {
                justify-content: center;
            }
        }

        @media (max-width: 768px) {
            .matches-page {
                padding: 1rem;
            }

            .matches-grid {
                grid-template-columns: 1fr;
            }

            .confrontation {
                flex-direction: column;
                gap: 1rem;

                .vs-section {
                    margin: 0;
                }
            }

            .pagination-controls {
                flex-direction: column;
                gap: 1rem;
            }

            .filter-tags {
                justify-content: center;
            }

            .month-nav {
                justify-content: center;
            }
        }
    `]
})
export class CoachMatchesComponent implements OnInit {
    groupedMatches$!: Observable<{[key: string]: CoachMatch[]}>;
    selectedStatus = '';
    selectedCompetition = '';
    selectedMonth = '';
    showMatchDetails = false;
    selectedMatch: CoachMatch | null = null;
    currentPage = 1;
    totalPages = 1;
    itemsPerPage = 6;

    months = [
        { label: 'Septembre', value: '2024-09' },
        { label: 'Octobre', value: '2024-10' },
        { label: 'Novembre', value: '2024-11' },
        { label: 'Décembre', value: '2024-12' },
        { label: 'Janvier', value: '2025-01' },
        { label: 'Février', value: '2025-02' },
        { label: 'Mars', value: '2025-03' },
        { label: 'Avril', value: '2025-04' },
        { label: 'Mai', value: '2025-05' }
    ];

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
            },
            {
                id: '4',
                competition: { name: 'Championnat D1', type: 'LEAGUE' },
                homeTeam: { id: '5', name: 'Adversaire 2', logo: 'assets/images/opponent2-logo.png' },
                awayTeam: { id: '1', name: 'Mon Équipe', logo: 'assets/images/team-logo.png' },
                scheduledAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
                stadium: { name: 'Stade des Champions', address: '789 Boulevard du Sport' },
                status: 'COMPLETED',
                score: { home: 0, away: 3, halfTime: { home: 0, away: 2 } },
                isHomeTeam: false,
                opponent: { name: 'Adversaire 2', logo: 'assets/images/opponent2-logo.png' },
                teamSheetSubmitted: true,
                teamSheetStatus: 'APPROVED'
            },
            {
                id: '5',
                competition: { name: 'Match Amical', type: 'FRIENDLY' },
                homeTeam: { id: '1', name: 'Mon Équipe', logo: 'assets/images/team-logo.png' },
                awayTeam: { id: '6', name: 'Équipe Test', logo: 'assets/images/test-logo.png' },
                scheduledAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
                stadium: { name: 'Terrain d\'Entraînement', address: '321 Allée du Sport' },
                status: 'UPCOMING',
                isHomeTeam: true,
                opponent: { name: 'Équipe Test', logo: 'assets/images/test-logo.png' },
                teamSheetSubmitted: false,
                teamSheetStatus: 'PENDING'
            }
        ];

        this.groupedMatches$ = new Observable(observer => {
            const filtered = this.applyFilters(mockMatches);
            const grouped = this.groupMatchesByCompetition(filtered);
            observer.next(grouped);
        });
    }

    applyFilters(matches: CoachMatch[]): CoachMatch[] {
        return matches.filter(match => {
            const statusMatch = !this.selectedStatus || match.status === this.selectedStatus;
            const competitionMatch = !this.selectedCompetition || match.competition.type === this.selectedCompetition;
            const monthMatch = !this.selectedMonth || this.getMonthFromDate(match.scheduledAt) === this.selectedMonth;
            
            return statusMatch && competitionMatch && monthMatch;
        });
    }

    groupMatchesByCompetition(matches: CoachMatch[]): {[key: string]: CoachMatch[]} {
        const grouped: {[key: string]: CoachMatch[]} = {};
        
        matches.forEach(match => {
            const key = `${match.competition.type}-${match.competition.name}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(match);
        });

        // Trier les matchs par date dans chaque groupe
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        });

        return grouped;
    }

    getGroupedMatchesKeys(groupedMatches: {[key: string]: CoachMatch[]}): string[] {
        return Object.keys(groupedMatches);
    }

    getCompetitionGroups(groupedMatches: {[key: string]: CoachMatch[]}): any[] {
        return Object.keys(groupedMatches).map(key => {
            const matches = groupedMatches[key];
            return {
                competition: matches[0].competition,
                matches: matches
            };
        });
    }

    getMonthFromDate(dateString: string): string {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    filterByCompetition(competition: string) {
        this.selectedCompetition = competition;
        this.loadMatches();
    }

    filterByStatus(status: string) {
        this.selectedStatus = status;
        this.loadMatches();
    }

    filterByMonth(month: string) {
        this.selectedMonth = month;
        this.loadMatches();
    }

    filterMatches() {
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

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadMatches();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadMatches();
        }
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

    // Nouvelles méthodes pour les statistiques
    getWins(matches: CoachMatch[]): number {
        return matches.filter(match => {
            if (match.status !== 'COMPLETED' || !match.score) return false;
            return (match.isHomeTeam && match.score.home > match.score.away) ||
                   (!match.isHomeTeam && match.score.away > match.score.home);
        }).length;
    }

    getDraws(matches: CoachMatch[]): number {
        return matches.filter(match => {
            return match.status === 'COMPLETED' && match.score && match.score.home === match.score.away;
        }).length;
    }

    getLosses(matches: CoachMatch[]): number {
        return matches.filter(match => {
            if (match.status !== 'COMPLETED' || !match.score) return false;
            return (match.isHomeTeam && match.score.home < match.score.away) ||
                   (!match.isHomeTeam && match.score.away < match.score.home);
        }).length;
    }

    // Nouvelles méthodes pour les classes CSS
    getCompetitionIcon(type: string): string {
        switch (type) {
            case 'LEAGUE': return 'pi-trophy';
            case 'CUP': return 'pi-star';
            case 'FRIENDLY': return 'pi-heart';
            default: return 'pi-trophy';
        }
    }

    getMatchCardClass(match: CoachMatch): string {
        const baseClass = 'match-card';
        const statusClass = `status-${match.status.toLowerCase()}`;
        const resultClass = this.getResultClass(match);
        return `${baseClass} ${statusClass} ${resultClass}`;
    }

    getMatchHeaderClass(status: string): string {
        return `header-${status.toLowerCase()}`;
    }

    getResultClass(match: CoachMatch): string {
        if (match.status !== 'COMPLETED' || !match.score) return '';
        
        const isWin = (match.isHomeTeam && match.score.home > match.score.away) ||
                     (!match.isHomeTeam && match.score.away > match.score.home);
        const isDraw = match.score.home === match.score.away;
        
        if (isWin) return 'result-win';
        if (isDraw) return 'result-draw';
        return 'result-loss';
    }

    getScoreClass(match: CoachMatch): string {
        if (match.status !== 'COMPLETED' || !match.score) return '';
        
        const isWin = (match.isHomeTeam && match.score.home > match.score.away) ||
                     (!match.isHomeTeam && match.score.away > match.score.home);
        const isLoss = (match.isHomeTeam && match.score.home < match.score.away) ||
                      (!match.isHomeTeam && match.score.away < match.score.home);
        
        if (isWin) return 'score-win';
        if (isLoss) return 'score-loss';
        return 'score-draw';
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'UPCOMING': return 'pi-clock';
            case 'IN_PROGRESS': return 'pi-play';
            case 'COMPLETED': return 'pi-check';
            case 'POSTPONED': return 'pi-exclamation-triangle';
            case 'CANCELLED': return 'pi-times';
            default: return 'pi-circle';
        }
    }
}