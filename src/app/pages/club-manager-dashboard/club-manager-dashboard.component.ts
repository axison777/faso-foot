import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClubManagerService } from '../../service/club-manager.service';
import { AuthService } from '../../service/auth.service';
import {
    ClubManagerClub,
    ClubManagerTeam,
    ClubManagerMatch,
    TeamWithData
} from '../../models/club-manager-api.model';

/**
 * Composant Dashboard pour le responsable de club
 * Affiche un aperçu de toutes les équipes du club avec leurs statistiques
 */
@Component({
    selector: 'app-club-manager-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './club-manager-dashboard.component.html',
    styleUrls: ['./club-manager-dashboard.component.scss']
})
export class ClubManagerDashboardComponent implements OnInit {
    private clubManagerService = inject(ClubManagerService);
    private authService = inject(AuthService);
    private router = inject(Router);

    // Signals
    club = signal<ClubManagerClub | null>(null);
    teams = signal<ClubManagerTeam[]>([]);
    selectedTeam = signal<TeamWithData | null>(null);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);

    // Computed values
    clubId = computed(() => this.authService.currentUser?.club_id || null);
    hasTeams = computed(() => this.teams().length > 0);

    ngOnInit() {
        console.log('🏢 [CLUB MANAGER DASHBOARD] Initialisation du dashboard');
        
        const currentUser = this.authService.currentUser;
        console.log('👤 [CLUB MANAGER DASHBOARD] Utilisateur actuel:', currentUser);

        if (!currentUser?.is_club_manager) {
            console.error('❌ [CLUB MANAGER DASHBOARD] Utilisateur non autorisé');
            this.error.set('Vous n\'avez pas les droits d\'accès à cette page');
            return;
        }

        if (!currentUser.club_id) {
            console.error('❌ [CLUB MANAGER DASHBOARD] Club ID manquant');
            this.error.set('Aucun club associé à votre compte');
            return;
        }

        this.loadClubData(currentUser.club_id);
    }

    /**
     * Charge les données du club et ses équipes
     */
    private loadClubData(clubId: string) {
        console.log('📥 [CLUB MANAGER DASHBOARD] Chargement des données du club:', clubId);
        this.isLoading.set(true);
        this.error.set(null);

        this.clubManagerService.getClubById(clubId).subscribe({
            next: (club) => {
                console.log('✅ [CLUB MANAGER DASHBOARD] Club chargé:', club);
                this.club.set(club);
                this.teams.set(club.teams || []);
                this.isLoading.set(false);

                // Charger automatiquement la première équipe si disponible
                if (club.teams && club.teams.length > 0) {
                    this.loadTeamData(club.teams[0].id);
                }
            },
            error: (err) => {
                console.error('❌ [CLUB MANAGER DASHBOARD] Erreur lors du chargement du club:', err);
                this.error.set('Erreur lors du chargement des données du club');
                this.isLoading.set(false);
            }
        });
    }

    /**
     * Charge toutes les données d'une équipe (joueurs, staff, matchs)
     */
    loadTeamData(teamId: string) {
        console.log('📥 [CLUB MANAGER DASHBOARD] Chargement des données de l\'équipe:', teamId);
        this.isLoading.set(true);

        this.clubManagerService.getTeamWithAllData(teamId).subscribe({
            next: (teamData) => {
                console.log('✅ [CLUB MANAGER DASHBOARD] Équipe chargée:', teamData);
                this.selectedTeam.set(teamData);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('❌ [CLUB MANAGER DASHBOARD] Erreur lors du chargement de l\'équipe:', err);
                this.error.set('Erreur lors du chargement des données de l\'équipe');
                this.isLoading.set(false);
            }
        });
    }

    /**
     * Sélectionne une équipe
     */
    selectTeam(team: ClubManagerTeam) {
        console.log('⚽ [CLUB MANAGER DASHBOARD] Équipe sélectionnée:', team);
        this.loadTeamData(team.id);
    }

    /**
     * Navigation vers la page de détails d'une équipe
     */
    navigateToTeamDetails(teamId: string) {
        this.router.navigate(['/club-manager/teams', teamId]);
    }

    /**
     * Navigation vers la page des joueurs d'une équipe
     */
    navigateToTeamPlayers(teamId: string) {
        this.router.navigate(['/club-manager/teams', teamId, 'players']);
    }

    /**
     * Navigation vers la page du staff d'une équipe
     */
    navigateToTeamStaff(teamId: string) {
        this.router.navigate(['/club-manager/teams', teamId, 'staff']);
    }

    /**
     * Navigation vers la page des matchs d'une équipe
     */
    navigateToTeamMatches(teamId: string) {
        this.router.navigate(['/club-manager/teams', teamId, 'matches']);
    }
}
