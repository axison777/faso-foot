import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfficialMatchService, OfficialMatch } from '../../service/official-match.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-official-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="grid">
            <!-- Statistiques rapides -->
            <div class="col-12">
                <div class="card">
                    <h5>Vue d'ensemble</h5>
                    <div class="grid">
                        <div class="col-12 md:col-3">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-calendar text-blue-500"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-value">{{ upcomingMatchesCount }}</div>
                                    <div class="stat-label">Matchs à venir</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 md:col-3">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-check-circle text-green-500"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-value">{{ completedMatchesCount }}</div>
                                    <div class="stat-label">Matchs terminés</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 md:col-3">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-file-text text-orange-500"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-value">{{ pendingReportsCount }}</div>
                                    <div class="stat-label">Rapports en attente</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 md:col-3">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-bell text-purple-500"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-value">{{ unreadNotificationsCount }}</div>
                                    <div class="stat-label">Notifications</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Prochains matchs -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-3">
                        <h5>Mes prochains matchs</h5>
                        <a routerLink="/officiel/matchs" class="p-button p-button-text">
                            Voir tous <i class="pi pi-arrow-right ml-2"></i>
                        </a>
                    </div>
                    <div class="match-list" *ngIf="upcomingMatches$ | async as matches; else loadingMatches">
                        <div class="match-item" *ngFor="let match of matches.slice(0, 3)">
                            <div class="match-info">
                                <div class="match-competition">{{ match.competition.name }}</div>
                                <div class="match-teams">
                                    <span class="team">{{ match.homeTeam.name }}</span>
                                    <span class="vs">vs</span>
                                    <span class="team">{{ match.awayTeam.name }}</span>
                                </div>
                                <div class="match-details">
                                    <i class="pi pi-calendar mr-1"></i>
                                    {{ match.scheduledAt | date:'dd/MM/yyyy' }}
                                    <i class="pi pi-clock ml-3 mr-1"></i>
                                    {{ match.scheduledAt | date:'HH:mm' }}
                                    <i class="pi pi-map-marker ml-3 mr-1"></i>
                                    {{ match.stadium.name }}
                                </div>
                            </div>
                            <div class="match-role">
                                <span class="role-badge" [ngClass]="getRoleClass(match.officialRole)">
                                    {{ getRoleLabel(match.officialRole) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <ng-template #loadingMatches>
                        <div class="text-center p-4">
                            <i class="pi pi-spin pi-spinner"></i>
                            <p class="mt-2">Chargement des matchs...</p>
                        </div>
                    </ng-template>
                </div>
            </div>

            <!-- Notifications récentes -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-3">
                        <h5>Notifications récentes</h5>
                        <a routerLink="/officiel/notifications" class="p-button p-button-text">
                            Voir toutes <i class="pi pi-arrow-right ml-2"></i>
                        </a>
                    </div>
                    <div class="notification-list" *ngIf="notifications$ | async as notifications; else loadingNotifications">
                        <div class="notification-item" *ngFor="let notification of notifications.slice(0, 4)">
                            <div class="notification-icon">
                                <i class="pi" [ngClass]="getNotificationIcon(notification.type)"></i>
                            </div>
                            <div class="notification-content">
                                <div class="notification-title">{{ notification.title }}</div>
                                <div class="notification-message">{{ notification.message }}</div>
                                <div class="notification-time">{{ notification.createdAt | date:'dd/MM HH:mm' }}</div>
                            </div>
                        </div>
                    </div>
                    <ng-template #loadingNotifications>
                        <div class="text-center p-4">
                            <i class="pi pi-spin pi-spinner"></i>
                            <p class="mt-2">Chargement des notifications...</p>
                        </div>
                    </ng-template>
                </div>
            </div>

            <!-- Actions rapides -->
            <div class="col-12">
                <div class="card">
                    <h5>Actions rapides</h5>
                    <div class="grid">
                        <div class="col-12 md:col-3">
                            <button class="action-button" routerLink="/officiel/matchs">
                                <i class="pi pi-calendar"></i>
                                <span>Voir mes matchs</span>
                            </button>
                        </div>
                        <div class="col-12 md:col-3">
                            <button class="action-button" routerLink="/officiel/rapports">
                                <i class="pi pi-file-text"></i>
                                <span>Saisir un rapport</span>
                            </button>
                        </div>
                        <div class="col-12 md:col-3">
                            <button class="action-button" routerLink="/officiel/notifications">
                                <i class="pi pi-bell"></i>
                                <span>Notifications</span>
                            </button>
                        </div>
                        <div class="col-12 md:col-3">
                            <button class="action-button" (click)="refreshData()">
                                <i class="pi pi-refresh"></i>
                                <span>Actualiser</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .stat-card {
            display: flex;
            align-items: center;
            padding: 1rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-card);
        }

        .stat-icon {
            font-size: 2rem;
            margin-right: 1rem;
        }

        .stat-content {
            flex: 1;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .stat-label {
            color: var(--text-color-secondary);
            font-size: 0.875rem;
        }

        .match-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .match-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-card);
        }

        .match-info {
            flex: 1;
        }

        .match-competition {
            font-size: 0.875rem;
            color: var(--primary-color);
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .match-teams {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .vs {
            margin: 0 0.5rem;
            color: var(--text-color-secondary);
        }

        .match-details {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
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

        .notification-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .notification-item {
            display: flex;
            align-items: flex-start;
            padding: 0.75rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-card);
        }

        .notification-icon {
            font-size: 1.25rem;
            margin-right: 0.75rem;
            margin-top: 0.125rem;
        }

        .notification-content {
            flex: 1;
        }

        .notification-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .notification-message {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
            margin-bottom: 0.25rem;
        }

        .notification-time {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
        }

        .action-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1.5rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-card);
            color: var(--text-color);
            text-decoration: none;
            transition: all 0.2s;
            width: 100%;
        }

        .action-button:hover {
            background: var(--surface-hover);
            border-color: var(--primary-color);
        }

        .action-button i {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--primary-color);
        }

        .action-button span {
            font-weight: 600;
        }
    `]
})
export class OfficialDashboardComponent implements OnInit {
    upcomingMatches$: Observable<OfficialMatch[]>;
    notifications$: Observable<any[]>;
    
    upcomingMatchesCount = 0;
    completedMatchesCount = 0;
    pendingReportsCount = 0;
    unreadNotificationsCount = 0;

    constructor(private officialMatchService: OfficialMatchService) {
        this.upcomingMatches$ = this.officialMatchService.getAssignedMatches({ status: 'UPCOMING' });
        this.notifications$ = this.officialMatchService.getNotifications();
    }

    ngOnInit() {
        this.loadStatistics();
    }

    loadStatistics() {
        // Charger les statistiques
        this.officialMatchService.getAssignedMatches({ status: 'UPCOMING' }).subscribe(matches => {
            this.upcomingMatchesCount = matches.length;
        });

        this.officialMatchService.getAssignedMatches({ status: 'COMPLETED' }).subscribe(matches => {
            this.completedMatchesCount = matches.length;
            this.pendingReportsCount = matches.filter(m => !m.reportSubmitted).length;
        });

        this.officialMatchService.getNotifications().subscribe(notifications => {
            this.unreadNotificationsCount = notifications.filter(n => !n.read).length;
        });
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

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'MATCH_REMINDER':
                return 'pi-calendar';
            case 'REPORT_SUBMITTED':
                return 'pi-file-text';
            case 'INCIDENT_REPORTED':
                return 'pi-exclamation-triangle';
            default:
                return 'pi-info-circle';
        }
    }

    refreshData() {
        this.loadStatistics();
    }
}