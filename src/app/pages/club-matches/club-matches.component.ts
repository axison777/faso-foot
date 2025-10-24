import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoachMatchesComponent } from '../coach-matches/coach-matches.component';
import { ClubManagerService } from '../../service/club-manager.service';
import { AuthService } from '../../service/auth.service';
import { ClubManagerTeam } from '../../models/club-manager-api.model';

interface ClubTeam {
    id: string;
    name: string;
    category: string;
    logo?: string;
    coach: {
        id: string;
        name: string;
        email: string;
    };
    players: number;
    status: 'ACTIVE' | 'INACTIVE';
}

@Component({
    selector: 'app-club-matches',
    standalone: true,
    imports: [CommonModule, CoachMatchesComponent],
    template: `
        <div class="club-matches-page">
            <!-- En-tête -->
            <div class="page-header">
                <h1>Matchs du Club</h1>
                <p>Gérez les matchs de toutes les équipes</p>
            </div>

            <!-- État de chargement -->
            <div *ngIf="isLoading()" class="loading-container">
                <div class="spinner"></div>
                <p>Chargement des données du club...</p>
            </div>

            <!-- État d'erreur -->
            <div *ngIf="error() && !isLoading()" class="error-container">
                <i class="pi pi-exclamation-triangle"></i>
                <h3>Erreur</h3>
                <p>{{ error() }}</p>
            </div>

            <!-- Liste des équipes -->
            <div *ngIf="!isLoading() && !error()" class="teams-container">
                <h2>Équipes du Club</h2>
                <div class="teams-list">
                    <div 
                        *ngFor="let team of teams" 
                        class="team-item"
                        [ngClass]="{ 'active': selectedTeamId === team.id }"
                        (click)="selectTeam(team.id)">
                        <div class="team-logo">
                            <img *ngIf="team.logo" [src]="team.logo" [alt]="team.name">
                            <div *ngIf="!team.logo" class="logo-placeholder">
                                {{ getInitials(team.name) }}
                            </div>
                        </div>
                        <div class="team-info">
                            <h3>{{ team.name }}</h3>
                            <p class="team-category">{{ team.category }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenu de l'équipe sélectionnée -->
            <div *ngIf="selectedTeam() as team" class="selected-team-content">
                <div class="team-info-header">
                    <h3>Matchs - {{ team.name }}</h3>
                    <p>Gérez les matchs de l'équipe {{ team.category }}</p>
                </div>
                <app-coach-matches 
                    [teamId]="selectedTeamId">
                </app-coach-matches>
            </div>

            <!-- Message si aucune équipe sélectionnée -->
            <div *ngIf="!selectedTeam()" class="no-team-selected">
                <div class="no-team-content">
                    <i class="pi pi-info-circle"></i>
                    <h3>Sélectionnez une équipe</h3>
                    <p>Cliquez sur une équipe ci-dessus pour voir ses matchs</p>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .club-matches-page {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            background: #f8fafc;
            min-height: 100vh;
        }

        .loading-container,
        .error-container {
            background: white;
            border-radius: 16px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            margin-bottom: 2rem;

            i {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            p, h3 {
                margin: 0.5rem 0;
                color: #6b7280;
            }
        }

        .error-container {
            border-color: #fecaca;
            background: #fef2f2;

            i {
                color: #ef4444;
            }

            h3 {
                color: #dc2626;
                font-weight: 600;
            }

            p {
                color: #dc2626;
            }
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .page-header {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;

            h1 {
                margin: 0 0 0.5rem 0;
                color: #1a1a1a;
                font-size: 2.5rem;
                font-weight: 700;
            }

            p {
                margin: 0;
                color: #6b7280;
                font-size: 1.1rem;
            }
        }

        .teams-container {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;

            h2 {
                margin: 0 0 1.5rem 0;
                color: #1a1a1a;
                font-size: 1.5rem;
                font-weight: 700;
            }
        }

        .teams-list {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            padding-bottom: 0.5rem;

            &::-webkit-scrollbar {
                height: 6px;
            }

            &::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 3px;
            }

            &::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;

                &:hover {
                    background: #94a3b8;
                }
            }
        }

        .team-item {
            background: #f8fafc;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 1rem 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 1rem;
            min-width: 250px;
            flex-shrink: 0;

            &:hover {
                border-color: #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                transform: translateY(-2px);
            }

            &.active {
                border-color: #3b82f6;
                background: #eff6ff;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
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
                border: 2px solid #e5e7eb;
                flex-shrink: 0;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }

            .logo-placeholder {
                font-size: 1.25rem;
                font-weight: 700;
                color: #6b7280;
            }

            .team-info {
                flex: 1;
                min-width: 0;

                h3 {
                    margin: 0 0 0.25rem 0;
                    color: #1a1a1a;
                    font-size: 1rem;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .team-category {
                    margin: 0;
                    color: #6b7280;
                    font-size: 0.875rem;
                }
            }
        }

        .selected-team-content {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            overflow: hidden;
        }

        .team-info-header {
            padding: 2rem 2rem 1rem 2rem;
            border-bottom: 1px solid #e5e7eb;

            h3 {
                margin: 0 0 0.5rem 0;
                color: #1a1a1a;
                font-size: 1.5rem;
                font-weight: 700;
            }

            p {
                margin: 0;
                color: #6b7280;
                font-size: 1rem;
            }
        }

        .no-team-selected {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            padding: 4rem 2rem;
            text-align: center;

            .no-team-content {
                i {
                    font-size: 3rem;
                    color: #9ca3af;
                    margin-bottom: 1rem;
                }

                h3 {
                    margin: 0 0 0.5rem 0;
                    color: #6b7280;
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                p {
                    margin: 0;
                    color: #9ca3af;
                    font-size: 1rem;
                }
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .club-matches-page {
                padding: 1rem;
            }

            .teams-list {
                flex-direction: column;
                gap: 0.75rem;
            }

            .team-item {
                min-width: auto;
            }
        }
    `]
})
export class ClubMatchesComponent implements OnInit {
    private clubManagerService = inject(ClubManagerService);
    private authService = inject(AuthService);
    
    club = signal<any | null>(null);
    teams: ClubTeam[] = [];
    selectedTeamId = '';
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    ngOnInit() {
        this.loadClubData();
    }

    loadClubData() {
        const currentUser = this.authService.currentUser;
        const clubId = currentUser?.club_id;

        if (!clubId) {
            console.error('❌ [CLUB MATCHES] Club ID manquant');
            this.error.set('Aucun club associé à votre compte');
            return;
        }

        console.log('🏢 [CLUB MATCHES] Chargement du club:', clubId);
        this.isLoading.set(true);
        this.error.set(null);

        this.clubManagerService.getClubById(clubId).subscribe({
            next: (clubData) => {
                console.log('✅ [CLUB MATCHES] Club chargé:', clubData);
                this.club.set(clubData);
                
                // Mapper les équipes avec les vraies données
                this.teams = (clubData?.teams || []).map((team: ClubManagerTeam) => ({
                    id: team.id,
                    name: team.name,
                    category: team.category?.name || 'Senior',
                    logo: team.logo,
                    coach: {
                        id: '1',
                        name: 'Coach assigné',
                        email: team.email || 'coach@club.com'
                    },
                    players: team.player_count || 0,
                    status: team.status === 'ACTIVE' ? 'ACTIVE' as const : 'INACTIVE' as const
                }));

                console.log('✅ [CLUB MATCHES] Équipes chargées:', this.teams.length);

                // Sélectionner la première équipe par défaut
                if (this.teams.length > 0) {
                    this.selectedTeamId = this.teams[0].id;
                }
                
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('❌ [CLUB MATCHES] Erreur lors du chargement du club:', err);
                this.error.set('Erreur lors du chargement des données du club');
                this.isLoading.set(false);
            }
        });
    }

    selectTeam(teamId: string) {
        console.log('⚽ [CLUB MATCHES] Équipe sélectionnée:', teamId);
        this.selectedTeamId = teamId;
    }

    selectedTeam() {
        return this.teams.find(team => team.id === this.selectedTeamId);
    }

    getInitials(name: string): string {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    }
}