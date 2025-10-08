import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';

interface PlayerDetails {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    position: string;
    jerseyNumber: number;
    status: 'ACTIVE' | 'INJURED' | 'SUSPENDED' | 'TIRED';
    contractEndDate: string;
    photo?: string;
    nationality: string;
    height: number; // en cm
    weight: number; // en kg
    preferredFoot: 'LEFT' | 'RIGHT' | 'BOTH';
    stats: {
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
        matchesPlayed: number;
        minutesPlayed: number;
        shotsOnTarget: number;
        passAccuracy: number;
        tackles: number;
        interceptions: number;
    };
    fitnessLevel: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    injuryType?: string;
    injuryStartDate?: string;
    injuryEndDate?: string;
    suspensionReason?: string;
    suspensionEndDate?: string;
    contractStatus: 'VALID' | 'EXPIRING' | 'EXPIRED';
    injuryHistory: Array<{
        date: string;
        type: string;
        duration: number; // en jours
        status: 'RECOVERED' | 'ONGOING';
    }>;
    performanceGoals: {
        goals: number;
        assists: number;
        matches: number;
        currentGoals: number;
        currentAssists: number;
        currentMatches: number;
    };
    competitionRanking: {
        goals: number;
        assists: number;
        overall: number;
    };
}

@Component({
    selector: 'app-player-details-modal',
    standalone: true,
    imports: [
        CommonModule, ButtonModule, DialogModule, CardModule, TagModule,
        ChartModule, TableModule, TabViewModule, DividerModule
    ],
    template: `
        <p-dialog 
            [(visible)]="visible" 
            [modal]="true" 
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '90vw', maxWidth: '1200px' }"
            [header]="player?.firstName + ' ' + player?.lastName"
            styleClass="player-details-modal">
            
            <div class="player-details-container" *ngIf="player">
                <!-- Zone 1: Profil & État (Colonne de Gauche) -->
                <div class="profile-section">
                    <div class="player-header">
                        <div class="jersey-number-large">
                            {{ player.jerseyNumber }}
                        </div>
                        <div class="player-identity">
                            <h1 class="player-name">{{ player.firstName }} {{ player.lastName }}</h1>
                            <div class="player-position" [ngClass]="getPositionClass(player.position)">
                                {{ player.position }}
                            </div>
                        </div>
                    </div>

                    <div class="player-photo">
                        <img *ngIf="player.photo" 
                             [src]="player.photo" 
                             [alt]="player.firstName + ' ' + player.lastName">
                        <div *ngIf="!player.photo" class="photo-placeholder">
                            {{ getInitials(player.firstName, player.lastName) }}
                        </div>
                    </div>

                    <div class="fitness-indicator">
                        <div class="fitness-header">
                            <h3>Condition Physique</h3>
                            <span class="fitness-status" [ngClass]="getFitnessClass(player.fitnessLevel)">
                                {{ getFitnessLabel(player.fitnessLevel) }}
                            </span>
                        </div>
                        <div class="fitness-bar-large">
                            <div class="fitness-fill" 
                                 [ngClass]="getFitnessClass(player.fitnessLevel)"
                                 [style.width.%]="getFitnessPercentage(player.fitnessLevel)">
                            </div>
                        </div>
                        <div class="fitness-details" *ngIf="player.status !== 'ACTIVE'">
                            <div class="status-info" [ngClass]="getStatusClass(player.status)">
                                <i class="pi" [ngClass]="getStatusIcon(player.status)"></i>
                                <span>{{ getStatusDetails(player) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="quick-info-card">
                        <div class="info-item">
                            <i class="pi pi-calendar"></i>
                            <div>
                                <span class="label">Âge</span>
                                <span class="value">{{ calculateAge(player.birthDate) }} ans</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="pi pi-flag"></i>
                            <div>
                                <span class="label">Nationalité</span>
                                <span class="value">{{ player.nationality }}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="pi pi-ruler"></i>
                            <div>
                                <span class="label">Taille</span>
                                <span class="value">{{ player.height }} cm</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="pi pi-weight-hanging"></i>
                            <div>
                                <span class="label">Poids</span>
                                <span class="value">{{ player.weight }} kg</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="pi pi-send"></i>
                            <div>
                                <span class="label">Pied</span>
                                <span class="value">{{ getPreferredFootLabel(player.preferredFoot) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button class="action-btn primary" (click)="editPlayer()">
                            <i class="pi pi-pencil"></i>
                            Modifier Données
                        </button>
                        <button class="action-btn secondary" (click)="viewMatchHistory()">
                            <i class="pi pi-history"></i>
                            Historique Matchs
                        </button>
                    </div>
                </div>

                <!-- Zone 2: Statistiques Clés (Colonne Centrale) -->
                <div class="stats-section">
                    <h2>Performance de la Saison</h2>
                    
                    <div class="performance-summary">
                        <div class="stat-card goals">
                            <div class="stat-icon">
                                <i class="pi pi-bullseye"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ player.stats.goals }}</div>
                                <div class="stat-label">Buts</div>
                                <div class="stat-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" 
                                             [style.width.%]="getProgressPercentage(player.performanceGoals.currentGoals, player.performanceGoals.goals)">
                                        </div>
                                    </div>
                                    <span class="progress-text">{{ player.performanceGoals.currentGoals }}/{{ player.performanceGoals.goals }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card assists">
                            <div class="stat-icon">
                                <i class="pi pi-send"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ player.stats.assists }}</div>
                                <div class="stat-label">Passes D</div>
                                <div class="stat-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" 
                                             [style.width.%]="getProgressPercentage(player.performanceGoals.currentAssists, player.performanceGoals.assists)">
                                        </div>
                                    </div>
                                    <span class="progress-text">{{ player.performanceGoals.currentAssists }}/{{ player.performanceGoals.assists }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card matches">
                            <div class="stat-icon">
                                <i class="pi pi-calendar-plus"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ player.stats.matchesPlayed }}</div>
                                <div class="stat-label">Matchs</div>
                                <div class="stat-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" 
                                             [style.width.%]="getProgressPercentage(player.performanceGoals.currentMatches, player.performanceGoals.matches)">
                                        </div>
                                    </div>
                                    <span class="progress-text">{{ player.performanceGoals.currentMatches }}/{{ player.performanceGoals.matches }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card shots">
                            <div class="stat-icon">
                                <i class="pi pi-target"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ player.stats.shotsOnTarget }}</div>
                                <div class="stat-label">Tirs Cadrés</div>
                            </div>
                        </div>
                    </div>

                    <!-- Graphique Radar de Performance -->
                    <div class="performance-chart">
                        <h3>Analyse de Performance</h3>
                        <p-chart type="radar" [data]="radarChartData" [options]="radarChartOptions"></p-chart>
                    </div>

                    <!-- Discipline & Disponibilité -->
                    <div class="discipline-section">
                        <h3>Discipline & Disponibilité</h3>
                        <div class="discipline-cards">
                            <div class="discipline-card yellow">
                                <i class="pi pi-exclamation-triangle"></i>
                                <div class="card-content">
                                    <div class="card-value">{{ player.stats.yellowCards }}</div>
                                    <div class="card-label">Cartons Jaunes</div>
                                </div>
                            </div>
                            <div class="discipline-card red">
                                <i class="pi pi-times-circle"></i>
                                <div class="card-content">
                                    <div class="card-value">{{ player.stats.redCards }}</div>
                                    <div class="card-label">Cartons Rouges</div>
                                </div>
                            </div>
                            <div class="discipline-card minutes">
                                <i class="pi pi-clock"></i>
                                <div class="card-content">
                                    <div class="card-value">{{ player.stats.minutesPlayed }}</div>
                                    <div class="card-label">Minutes Jouées</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Meilleure Compétition -->
                    <div class="competition-ranking" *ngIf="player.competitionRanking">
                        <h3>Classement Compétition</h3>
                        <div class="ranking-stats">
                            <div class="ranking-item">
                                <span class="ranking-label">Buts</span>
                                <span class="ranking-value">{{ player.competitionRanking.goals }}ème</span>
                            </div>
                            <div class="ranking-item">
                                <span class="ranking-label">Passes</span>
                                <span class="ranking-value">{{ player.competitionRanking.assists }}ème</span>
                            </div>
                            <div class="ranking-item">
                                <span class="ranking-label">Général</span>
                                <span class="ranking-value">{{ player.competitionRanking.overall }}ème</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Zone 3: Données Administratives & Médicales (Colonne de Droite) -->
                <div class="admin-section">
                    <p-tabView>
                        <p-tabPanel header="Contrat & Licence">
                            <div class="contract-info">
                                <div class="contract-item">
                                    <i class="pi pi-file"></i>
                                    <div class="contract-details">
                                        <span class="contract-label">Fin de Contrat</span>
                                        <span class="contract-value" [ngClass]="getContractClass(player.contractStatus)">
                                            {{ player.contractEndDate | date:'dd/MM/yyyy' }}
                                        </span>
                                        <span class="contract-status" [ngClass]="getContractClass(player.contractStatus)">
                                            {{ getContractStatusLabel(player.contractStatus) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="contract-item">
                                    <i class="pi pi-id-card"></i>
                                    <div class="contract-details">
                                        <span class="contract-label">Statut Licence</span>
                                        <span class="contract-value" [ngClass]="getContractClass(player.contractStatus)">
                                            {{ getContractStatusLabel(player.contractStatus) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </p-tabPanel>

                        <p-tabPanel header="Historique Médical">
                            <div class="injury-history">
                                <div class="injury-item" *ngFor="let injury of player.injuryHistory">
                                    <div class="injury-date">{{ injury.date | date:'dd/MM/yyyy' }}</div>
                                    <div class="injury-details">
                                        <span class="injury-type">{{ injury.type }}</span>
                                        <span class="injury-duration">{{ injury.duration }} jours</span>
                                    </div>
                                    <div class="injury-status" [ngClass]="injury.status === 'RECOVERED' ? 'recovered' : 'ongoing'">
                                        {{ injury.status === 'RECOVERED' ? 'Récupéré' : 'En cours' }}
                                    </div>
                                </div>
                                <div class="no-injuries" *ngIf="player.injuryHistory.length === 0">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Aucune blessure enregistrée</span>
                                </div>
                            </div>
                        </p-tabPanel>

                        <p-tabPanel header="Statistiques Détaillées">
                            <div class="detailed-stats">
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <span class="stat-label">Précision des Passes</span>
                                        <span class="stat-value">{{ player.stats.passAccuracy }}%</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Tacles</span>
                                        <span class="stat-value">{{ player.stats.tackles }}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Interceptions</span>
                                        <span class="stat-value">{{ player.stats.interceptions }}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Minutes Moyennes</span>
                                        <span class="stat-value">{{ getAverageMinutes() }} min</span>
                                    </div>
                                </div>
                            </div>
                        </p-tabPanel>
                    </p-tabView>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="modal-footer">
                    <button class="btn-secondary" (click)="close()">
                        <i class="pi pi-times"></i>
                        Fermer
                    </button>
                </div>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        .player-details-container {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 2rem;
            max-height: 70vh;
            overflow-y: auto;
        }

        .profile-section {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .player-header {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .jersey-number-large {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white;
            border-radius: 50%;
            font-size: 2rem;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .player-identity {
            flex: 1;
        }

        .player-name {
            margin: 0 0 0.5rem 0;
            font-size: 1.8rem;
            font-weight: 700;
            color: #1a1a1a;
        }

        .player-position {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;

            &.position-defender {
                background: #dbeafe;
                color: #1e40af;
            }

            &.position-midfielder {
                background: #fef3c7;
                color: #d97706;
            }

            &.position-forward {
                background: #fecaca;
                color: #dc2626;
            }

            &.position-goalkeeper {
                background: #e5e7eb;
                color: #374151;
            }
        }

        .player-photo {
            width: 200px;
            height: 200px;
            border-radius: 16px;
            overflow: hidden;
            margin: 0 auto;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .photo-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            font-size: 4rem;
            font-weight: 700;
            color: #6b7280;
        }

        .fitness-indicator {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }

        .fitness-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;

            h3 {
                margin: 0;
                font-size: 1.1rem;
                color: #374151;
            }
        }

        .fitness-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;

            &.fitness-excellent {
                background: #dcfce7;
                color: #166534;
            }

            &.fitness-good {
                background: #fef3c7;
                color: #d97706;
            }

            &.fitness-fair {
                background: #fed7aa;
                color: #c2410c;
            }

            &.fitness-poor {
                background: #fecaca;
                color: #dc2626;
            }
        }

        .fitness-bar-large {
            width: 100%;
            height: 12px;
            background: #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 1rem;
        }

        .fitness-fill {
            height: 100%;
            transition: width 0.3s ease;

            &.fitness-excellent {
                background: #10b981;
            }

            &.fitness-good {
                background: #84cc16;
            }

            &.fitness-fair {
                background: #f59e0b;
            }

            &.fitness-poor {
                background: #ef4444;
            }
        }

        .status-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            border-radius: 8px;
            font-weight: 600;

            &.status-injured {
                background: #fef3c7;
                color: #d97706;
            }

            &.status-suspended {
                background: #fecaca;
                color: #dc2626;
            }

            &.status-tired {
                background: #f3f4f6;
                color: #6b7280;
            }
        }

        .quick-info-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;

            &:last-child {
                border-bottom: none;
            }

            i {
                color: #6b7280;
                width: 20px;
            }

            .label {
                display: block;
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 0.25rem;
            }

            .value {
                display: block;
                font-weight: 600;
                color: #1a1a1a;
            }
        }

        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .action-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;

            &.primary {
                background: #3b82f6;
                color: white;

                &:hover {
                    background: #2563eb;
                }
            }

            &.secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;

                &:hover {
                    background: #e5e7eb;
                }
            }
        }

        .stats-section {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .stats-section h2 {
            margin: 0 0 1rem 0;
            color: #1a1a1a;
            font-size: 1.5rem;
            font-weight: 700;
        }

        .performance-summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;
            gap: 1rem;

            &.goals {
                border-left: 4px solid #10b981;
            }

            &.assists {
                border-left: 4px solid #3b82f6;
            }

            &.matches {
                border-left: 4px solid #f59e0b;
            }

            &.shots {
                border-left: 4px solid #ef4444;
            }
        }

        .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;

            .goals & {
                background: #10b981;
            }

            .assists & {
                background: #3b82f6;
            }

            .matches & {
                background: #f59e0b;
            }

            .shots & {
                background: #ef4444;
            }
        }

        .stat-content {
            flex: 1;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
        }

        .stat-progress {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .progress-bar {
            flex: 1;
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: #3b82f6;
            border-radius: 3px;
            transition: width 0.3s ease;
        }

        .progress-text {
            font-size: 0.75rem;
            color: #6b7280;
            font-weight: 600;
        }

        .performance-chart {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

            h3 {
                margin: 0 0 1rem 0;
                color: #374151;
                font-size: 1.1rem;
            }
        }

        .discipline-section {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

            h3 {
                margin: 0 0 1rem 0;
                color: #374151;
                font-size: 1.1rem;
            }
        }

        .discipline-cards {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1rem;
        }

        .discipline-card {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #e5e7eb;

            &.yellow {
                background: #fef3c7;
                border-color: #f59e0b;
            }

            &.red {
                background: #fecaca;
                border-color: #ef4444;
            }

            &.minutes {
                background: #dbeafe;
                border-color: #3b82f6;
            }

            i {
                font-size: 1.5rem;
            }

            .card-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: #1a1a1a;
            }

            .card-label {
                font-size: 0.75rem;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        }

        .competition-ranking {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

            h3 {
                margin: 0 0 1rem 0;
                color: #374151;
                font-size: 1.1rem;
            }
        }

        .ranking-stats {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .ranking-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f3f4f6;

            &:last-child {
                border-bottom: none;
            }

            .ranking-label {
                color: #6b7280;
                font-size: 0.875rem;
            }

            .ranking-value {
                font-weight: 600;
                color: #1a1a1a;
            }
        }

        .admin-section {
            display: flex;
            flex-direction: column;
        }

        .contract-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .contract-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;

            i {
                color: #6b7280;
                font-size: 1.25rem;
            }
        }

        .contract-details {
            flex: 1;
        }

        .contract-label {
            display: block;
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.25rem;
        }

        .contract-value {
            display: block;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 0.25rem;

            &.contract-valid {
                color: #10b981;
            }

            &.contract-expiring {
                color: #f59e0b;
            }

            &.contract-expired {
                color: #ef4444;
            }
        }

        .contract-status {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;

            &.contract-valid {
                color: #10b981;
            }

            &.contract-expiring {
                color: #f59e0b;
            }

            &.contract-expired {
                color: #ef4444;
            }
        }

        .injury-history {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .injury-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .injury-date {
            font-size: 0.875rem;
            color: #6b7280;
            min-width: 80px;
        }

        .injury-details {
            flex: 1;

            .injury-type {
                display: block;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 0.25rem;
            }

            .injury-duration {
                font-size: 0.75rem;
                color: #6b7280;
            }
        }

        .injury-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;

            &.recovered {
                background: #dcfce7;
                color: #166534;
            }

            &.ongoing {
                background: #fef3c7;
                color: #d97706;
            }
        }

        .no-injuries {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 2rem;
            color: #6b7280;

            i {
                font-size: 2rem;
                color: #10b981;
            }
        }

        .detailed-stats {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: white;
            border-radius: 6px;
            border: 1px solid #e5e7eb;

            .stat-label {
                color: #6b7280;
                font-size: 0.875rem;
            }

            .stat-value {
                font-weight: 600;
                color: #1a1a1a;
            }
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
        }

        .btn-secondary {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                background: #e5e7eb;
            }
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .player-details-container {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .performance-summary {
                grid-template-columns: 1fr;
            }

            .discipline-cards {
                grid-template-columns: 1fr;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .player-header {
                flex-direction: column;
                text-align: center;
            }

            .action-buttons {
                flex-direction: row;
            }
        }
    `]
})
export class PlayerDetailsModalComponent implements OnInit {
    @Input() visible = false;
    @Input() player: PlayerDetails | null = null;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() editPlayerEvent = new EventEmitter<PlayerDetails>();
    @Output() viewMatchHistoryEvent = new EventEmitter<PlayerDetails>();

    radarChartData: any;
    radarChartOptions: any;

    ngOnInit() {
        this.initializeChart();
    }

    initializeChart() {
        this.radarChartData = {
            labels: ['Attaque', 'Défense', 'Physique', 'Technique', 'Mental', 'Discipline'],
            datasets: [{
                label: 'Performance',
                data: [85, 70, 90, 80, 75, 95],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
            }]
        };

        this.radarChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        };
    }

    close() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    editPlayer() {
        if (this.player) {
            this.editPlayerEvent.emit(this.player);
        }
    }

    viewMatchHistory() {
        if (this.player) {
            this.viewMatchHistoryEvent.emit(this.player);
        }
    }

    calculateAge(birthDate: string): number {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    getInitials(firstName: string, lastName: string): string {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    getPositionClass(position: string): string {
        if (['CB', 'RB', 'LB'].includes(position)) return 'position-defender';
        if (['CDM', 'CM', 'RM', 'LM'].includes(position)) return 'position-midfielder';
        if (['RW', 'LW', 'ST'].includes(position)) return 'position-forward';
        if (position === 'GK') return 'position-goalkeeper';
        return '';
    }

    getFitnessClass(level: string): string {
        return `fitness-${level.toLowerCase()}`;
    }

    getFitnessLabel(level: string): string {
        switch (level) {
            case 'EXCELLENT': return 'Excellent';
            case 'GOOD': return 'Bon';
            case 'FAIR': return 'Correct';
            case 'POOR': return 'Faible';
            default: return level;
        }
    }

    getFitnessPercentage(level: string): number {
        switch (level) {
            case 'EXCELLENT': return 100;
            case 'GOOD': return 75;
            case 'FAIR': return 50;
            case 'POOR': return 25;
            default: return 0;
        }
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'INJURED': return 'pi-heart';
            case 'SUSPENDED': return 'pi-ban';
            case 'TIRED': return 'pi-clock';
            default: return 'pi-check';
        }
    }

    getStatusDetails(player: PlayerDetails): string {
        switch (player.status) {
            case 'INJURED':
                return player.injuryType || 'Blessé';
            case 'SUSPENDED':
                return player.suspensionReason || 'Suspendu';
            case 'TIRED':
                return 'Légèrement fatigué';
            default:
                return 'En pleine forme';
        }
    }

    getPreferredFootLabel(foot: string): string {
        switch (foot) {
            case 'LEFT': return 'Gauche';
            case 'RIGHT': return 'Droit';
            case 'BOTH': return 'Ambi';
            default: return foot;
        }
    }

    getContractClass(status: string): string {
        return `contract-${status.toLowerCase()}`;
    }

    getContractStatusLabel(status: string): string {
        switch (status) {
            case 'VALID': return 'Valide';
            case 'EXPIRING': return 'Expire bientôt';
            case 'EXPIRED': return 'Expirée';
            default: return status;
        }
    }

    getProgressPercentage(current: number, target: number): number {
        if (target === 0) return 0;
        return Math.min((current / target) * 100, 100);
    }

    getAverageMinutes(): number {
        if (!this.player || this.player.stats.matchesPlayed === 0) return 0;
        return Math.round(this.player.stats.minutesPlayed / this.player.stats.matchesPlayed);
    }
}