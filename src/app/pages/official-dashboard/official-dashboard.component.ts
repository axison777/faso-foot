import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfficialMatchService, OfficialMatch, OfficialInfo } from '../../service/official-match.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-official-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="dashboard-container">
            <!-- Profil de l'officiel -->
            <div class="official-profile-card" *ngIf="officialInfo$ | async as official">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="pi pi-user"></i>
                    </div>
                    <div class="profile-info">
                        <h2 class="profile-name">{{ official.first_name }} {{ official.last_name }}</h2>
                        <div class="profile-details">
                            <span class="badge badge-type">{{ getOfficialTypeLabel(official.official_type) }}</span>
                            <span class="badge badge-level">{{ official.level }}</span>
                            <span class="badge badge-status" [ngClass]="{'active': official.status === 'ACTIVE'}">{{ official.status }}</span>
                        </div>
                    </div>
                </div>
                <div class="profile-meta">
                    <div class="meta-item">
                        <i class="pi pi-id-card"></i>
                        <span>Licence: {{ official.license_number }}</span>
                    </div>
                    <div class="meta-item" *ngIf="official.certification_date">
                        <i class="pi pi-calendar"></i>
                        <span>Certifié depuis: {{ official.certification_date | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="meta-item" *ngIf="official.nationality">
                        <i class="pi pi-globe"></i>
                        <span>{{ official.nationality }}</span>
                    </div>
                </div>
            </div>

            <!-- Titre principal -->
            <div class="dashboard-header">
                <h1 class="dashboard-title">Vue d'ensemble</h1>
            </div>

            <!-- Cartes statistiques -->
            <div class="stats-grid">
                <div class="stat-card" data-stat="upcoming">
                    <div class="stat-icon">
                        <i class="pi pi-calendar"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">{{ upcomingMatchesCount }}</div>
                        <div class="stat-label">Matchs à venir</div>
                    </div>
                </div>
                <div class="stat-card" data-stat="completed">
                    <div class="stat-icon">
                        <i class="pi pi-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">{{ completedMatchesCount }}</div>
                        <div class="stat-label">Matchs terminés</div>
                    </div>
                </div>
                <div class="stat-card" data-stat="reports">
                    <div class="stat-icon">
                        <i class="pi pi-file-text"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">{{ pendingReportsCount }}</div>
                        <div class="stat-label">Rapports en attente</div>
                    </div>
                </div>
                <div class="stat-card" data-stat="notifications">
                    <div class="stat-icon">
                        <i class="pi pi-bell"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">{{ unreadNotificationsCount }}</div>
                        <div class="stat-label">Notifications</div>
                    </div>
                </div>
                <!-- Carte de note d'arbitre -->
                <div class="stat-card" data-stat="rating" *ngIf="refereeRating">
                    <div class="stat-icon">
                        <i class="pi pi-star"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">{{ refereeRating.toFixed(1) }}</div>
                        <div class="stat-label">Note moyenne</div>
                        <div class="rating-level" [ngClass]="getRatingLevelClass(refereeRating)">
                            {{ getRatingLevelLabel(refereeRating) }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Prochains matchs -->
            <div class="matches-section">
                <div class="section-header">
                    <h2 class="section-title">Mes prochains matchs</h2>
                    <a routerLink="/officiel/matchs" class="view-all-link">
                        Voir tous <i class="pi pi-arrow-right"></i>
                    </a>
                </div>
                <div class="matches-grid" *ngIf="upcomingMatches$ | async as matches; else loadingMatches">
                    <div class="match-card" *ngFor="let match of matches.slice(0, 3)">
                        <div class="match-header">
                            <div class="competition-badge" [ngClass]="getCompetitionClass(match.competition.type)">
                                {{ match.competition.name }}
                            </div>
                        </div>
                        <div class="match-content">
                            <div class="teams">
                                <div class="team">
                                    <span class="team-icon">⚽</span>
                                    <span class="team-name">{{ match.homeTeam.name }}</span>
                                </div>
                                <div class="vs">vs</div>
                                <div class="team">
                                    <span class="team-icon">⚽</span>
                                    <span class="team-name">{{ match.awayTeam.name }}</span>
                                </div>
                            </div>
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
                        </div>
                        <div class="match-footer">
                            <span class="role-badge" [ngClass]="getRoleClass(match.officialRole)">
                                {{ getRoleLabel(match.officialRole) }}
                            </span>
                        </div>
                    </div>
                </div>
                <ng-template #loadingMatches>
                    <div class="loading-state">
                        <i class="pi pi-spin pi-spinner"></i>
                        <p>Chargement des matchs...</p>
                    </div>
                </ng-template>
            </div>

            <!-- Notifications récentes -->
            <div class="notifications-section">
                <div class="section-header">
                    <h2 class="section-title">Notifications récentes</h2>
                    <a routerLink="/officiel/notifications" class="view-all-link">
                        Voir toutes <i class="pi pi-arrow-right"></i>
                    </a>
                </div>
                <div class="notifications-list" *ngIf="notifications$ | async as notifications; else loadingNotifications">
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
                    <div class="loading-state">
                        <i class="pi pi-spin pi-spinner"></i>
                        <p>Chargement des notifications...</p>
                    </div>
                </ng-template>
            </div>

        </div>
    `,
    styles: [`
        .dashboard-container {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .dashboard-header {
            margin-bottom: 2rem;
        }

        .dashboard-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
        }

        /* Grille des statistiques */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }

        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .stat-card[data-stat="upcoming"] {
            background: linear-gradient(135deg, #e3f2fd 0%, #f8f9ff 100%);
        }

        .stat-card[data-stat="completed"] {
            background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%);
        }

        .stat-card[data-stat="reports"] {
            background: linear-gradient(135deg, #fff3e0 0%, #fff8f0 100%);
        }

        .stat-card[data-stat="notifications"] {
            background: linear-gradient(135deg, #f3e5f5 0%, #faf5ff 100%);
        }

        .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            opacity: 0.8;
        }

        .stat-card[data-stat="upcoming"] .stat-icon {
            color: #2196f3;
        }

        .stat-card[data-stat="completed"] .stat-icon {
            color: #4caf50;
        }

        .stat-card[data-stat="reports"] .stat-icon {
            color: #ff9800;
        }

        .stat-card[data-stat="notifications"] .stat-icon {
            color: #9c27b0;
        }

        .stat-card[data-stat="rating"] {
            background: linear-gradient(135deg, #fef3c7 0%, #fef7e0 100%);
        }

        .stat-card[data-stat="rating"] .stat-icon {
            color: #f59e0b;
        }

        .rating-level {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 0.25rem;
        }

        .rating-excellent { color: #166534; }
        .rating-very-good { color: #1e40af; }
        .rating-good { color: #7c3aed; }
        .rating-medium { color: #d97706; }
        .rating-insufficient { color: #c2410c; }
        .rating-bad { color: #dc2626; }

        .stat-content {
            text-align: left;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
            line-height: 1;
        }

        .stat-label {
            color: #6b7280;
            font-size: 1rem;
            font-weight: 500;
        }

        /* Sections principales */
        .matches-section, .notifications-section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            margin-bottom: 2rem;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f3f4f6;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
        }

        .view-all-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s;
        }

        .view-all-link:hover {
            color: #1d4ed8;
            transform: translateX(2px);
        }

        .view-all-link i {
            transition: transform 0.2s;
        }

        .view-all-link:hover i {
            transform: translateX(2px);
        }

        /* Grille des matchs */
        .matches-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
        }

        .match-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .match-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .match-header {
            padding: 1rem 1.5rem 0.5rem;
        }

        .competition-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
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

        .match-content {
            padding: 1rem 1.5rem;
        }

        .teams {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .team {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex: 1;
        }

        .team-icon {
            font-size: 1.2rem;
        }

        .team-name {
            font-weight: 600;
            color: #1a1a1a;
        }

        .vs {
            font-weight: 700;
            color: #6b7280;
            margin: 0 1rem;
        }

        .match-details {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .detail-item i {
            color: #9ca3af;
        }

        .match-footer {
            padding: 1rem 1.5rem;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
        }

        .role-badge {
            display: inline-block;
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

        /* Notifications */
        .notifications-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .notification-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            transition: all 0.2s;
        }

        .notification-item:hover {
            background: #f3f4f6;
        }

        .notification-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e3f2fd;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .notification-icon i {
            color: #2196f3;
            font-size: 1.1rem;
        }

        .notification-content {
            flex: 1;
        }

        .notification-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 0.25rem;
        }

        .notification-message {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }

        .notification-time {
            color: #9ca3af;
            font-size: 0.75rem;
        }

        .loading-state {
            text-align: center;
            padding: 3rem;
            color: #6b7280;
        }

        .loading-state i {
            font-size: 2rem;
            margin-bottom: 1rem;
            display: block;
        }

        /* Profil de l'officiel */
        .official-profile-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
            color: white;
            box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }

        .profile-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .profile-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            backdrop-filter: blur(10px);
        }

        .profile-info {
            flex: 1;
        }

        .profile-name {
            font-size: 1.75rem;
            font-weight: 700;
            margin: 0 0 0.75rem 0;
            color: white;
        }

        .profile-details {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .badge {
            padding: 0.375rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-type {
            background: rgba(255, 255, 255, 0.25);
            color: white;
        }

        .badge-level {
            background: rgba(255, 215, 0, 0.3);
            color: #ffd700;
        }

        .badge-status {
            background: rgba(239, 68, 68, 0.3);
            color: #fca5a5;
        }

        .badge-status.active {
            background: rgba(34, 197, 94, 0.3);
            color: #86efac;
        }

        .profile-meta {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            opacity: 0.95;
        }

        .meta-item i {
            opacity: 0.8;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .dashboard-container {
                padding: 1rem;
            }

            .official-profile-card {
                padding: 1.5rem;
            }

            .profile-header {
                flex-direction: column;
                text-align: center;
            }

            .profile-meta {
                flex-direction: column;
                gap: 0.75rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .matches-grid {
                grid-template-columns: 1fr;
            }

            .section-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
        }
    `]
})
export class OfficialDashboardComponent implements OnInit {
    upcomingMatches$: Observable<OfficialMatch[]>;
    notifications$: Observable<any[]>;
    officialInfo$: Observable<OfficialInfo | null>;
    
    upcomingMatchesCount = 0;
    completedMatchesCount = 0;
    pendingReportsCount = 0;
    unreadNotificationsCount = 0;
    refereeRating: number | null = null;

    constructor(private officialMatchService: OfficialMatchService) {
        this.upcomingMatches$ = this.officialMatchService.getAssignedMatches({ status: 'UPCOMING' });
        this.notifications$ = this.officialMatchService.getNotifications();
        this.officialInfo$ = this.officialMatchService.getOfficialInfo();
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

        // Simuler une note d'arbitre (à remplacer par un appel API réel)
        this.refereeRating = 8.2;
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

    getRatingLevelClass(rating: number): string {
        if (rating >= 9.0) return 'rating-excellent';
        if (rating >= 8.4) return 'rating-very-good';
        if (rating >= 7.9) return 'rating-good';
        if (rating >= 7.0) return 'rating-medium';
        if (rating >= 6.5) return 'rating-insufficient';
        return 'rating-bad';
    }

    getRatingLevelLabel(rating: number): string {
        if (rating >= 9.0) return 'Excellent';
        if (rating >= 8.4) return 'Très bien';
        if (rating >= 7.9) return 'Bien';
        if (rating >= 7.0) return 'Moyen';
        if (rating >= 6.5) return 'Insuffisant';
        return 'Mauvais';
    }

    refreshData() {
        this.loadStatistics();
    }

    getOfficialTypeLabel(type: string): string {
        switch (type?.toUpperCase()) {
            case 'COMMISSIONER':
                return 'Commissaire';
            case 'REFEREE':
                return 'Arbitre';
            case 'ASSISTANT_REFEREE':
                return 'Arbitre Assistant';
            default:
                return type;
        }
    }
}