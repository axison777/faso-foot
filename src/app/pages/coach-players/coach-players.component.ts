import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { PlayerDetailsModalV2Component } from './player-details-modal-v2.component';
import { AuthService } from '../../service/auth.service';
import { CoachService } from '../../service/coach.service';
import { CoachPlayer } from '../../models/coach-api.model';

// Interface locale pour affichage avec âge calculé
interface DisplayPlayer extends CoachPlayer {
    age: number;
    displayName: string;
}

@Component({
    selector: 'app-coach-players',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule, TagModule, TableModule, MenuModule, DialogModule, ToastModule, PlayerDetailsModalV2Component],
    providers: [MessageService],
    templateUrl: './coach-players.component.html',
    styleUrls: ['./coach-players.component.scss']
})
export class CoachPlayersComponent implements OnInit {
    @Input() teamId?: string;

    private authService = inject(AuthService);
    private coachService = inject(CoachService);
    private clubManagerService = inject(ClubManagerService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    searchTerm = '';
    selectedFilters: string[] = ['ALL'];
    selectedPosition = '';

    players: DisplayPlayer[] = [];
    filteredPlayers: DisplayPlayer[] = [];
    showPlayerDetails = false;
    showPlayerForm = false;
    selectedPlayer: DisplayPlayer | null = null;
    loading = false;
    error: string | null = null;
    currentTeamId: string = '';

    positionOptions = [
        { label: 'Toutes les positions', value: '' },
        { label: 'Gardien', value: 'GK' },
        { label: 'Défenseur Central', value: 'CB' },
        { label: 'Défenseur Droit', value: 'RB' },
        { label: 'Défenseur Gauche', value: 'LB' },
        { label: 'Milieu Défensif', value: 'CDM' },
        { label: 'Milieu Central', value: 'CM' },
        { label: 'Milieu Droit', value: 'RM' },
        { label: 'Milieu Gauche', value: 'LM' },
        { label: 'Ailier Droit', value: 'RW' },
        { label: 'Ailier Gauche', value: 'LW' },
        { label: 'Attaquant', value: 'ST' }
    ];

    ngOnInit() {
        this.loadPlayers();
    }

    loadPlayers() {
        this.loading = true;
        this.error = null;

        const currentUser = this.authService.currentUser;
        const userTeamId = this.teamId || currentUser?.team_id;

        console.log('👥 [PLAYERS] Chargement des joueurs du coach');
        console.log('👤 [PLAYERS] Current User:', currentUser);
        console.log('🏟️ [PLAYERS] Team ID:', userTeamId);

        if (!userTeamId) {
            console.error('❌ [PLAYERS] Aucun team_id trouvé!');
            this.error = 'Aucune équipe assignée';
            this.loading = false;
            return;
        }

        this.currentTeamId = userTeamId;
        console.log('🔄 [PLAYERS] Appel API GET /teams/' + userTeamId + '/players');

        // Utiliser le CoachService directement
        this.coachService.getTeamPlayers(userTeamId).subscribe({
            next: (apiPlayers) => {
                console.log('✅ [PLAYERS] Joueurs reçus du backend:', apiPlayers);
                console.log('📊 [PLAYERS] Nombre de joueurs:', apiPlayers?.length || 0);

                // Enrichir avec âge calculé et nom complet
                this.players = apiPlayers.map((player) => ({
                    ...player,
                    age: this.coachService.calculatePlayerAge(player.date_of_birth),
                    displayName: `${player.first_name} ${player.last_name}`
                }));

                this.filteredPlayers = [...this.players];
                console.log('✅ [PLAYERS] Joueurs enrichis:', this.players);

                this.loading = false;
            },
            error: (err) => {
                console.error('❌ [PLAYERS] Erreur lors du chargement:', err);
                console.error('❌ [PLAYERS] Status:', err?.status);
                console.error('❌ [PLAYERS] Message:', err?.message);
                this.error = 'Impossible de charger les joueurs';
                this.loading = false;
            }
        });
    }

    // MÉTHODES SUPPRIMÉES - On utilise maintenant le CoachService
    // convertToCoachPlayers() et determineContractStatus() sont maintenant dans CoachService

    filterPlayers() {
        this.filteredPlayers = this.players.filter((player) => {
            const matchesSearch = !this.searchTerm || `${player.first_name} ${player.last_name}`.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesPosition = !this.selectedPosition || player.preferred_position === this.selectedPosition;

            const matchesFilters =
                this.selectedFilters.includes('ALL') ||
                this.selectedFilters.some((filter) => {
                    switch (filter) {
                        case 'INJURED':
                            return player.status === 'INJURED';
                        case 'SUSPENDED':
                            return player.status === 'SUSPENDED';
                        case 'CONTRACT_ENDING':
                            return this.isContractEnding(player.contract_end_date);
                        case 'OPTIMAL_FORM':
                            return player.fitness_level === 'EXCELLENT';
                        default:
                            return false;
                    }
                });

            return matchesSearch && matchesPosition && matchesFilters;
        });
    }

    toggleFilter(filter: string) {
        if (filter === 'ALL') {
            this.selectedFilters = ['ALL'];
        } else {
            this.selectedFilters = this.selectedFilters.filter((f) => f !== 'ALL');
            if (this.selectedFilters.includes(filter)) {
                this.selectedFilters = this.selectedFilters.filter((f) => f !== filter);
            } else {
                this.selectedFilters.push(filter);
            }
            if (this.selectedFilters.length === 0) {
                this.selectedFilters = ['ALL'];
            }
        }
        this.filterPlayers();
    }

    isContractEnding(contractEndDate?: string): boolean {
        if (!contractEndDate) return false;
        const status = this.coachService.determineContractStatus(contractEndDate);
        return status === 'EXPIRING';
    }

    calculateAge(birthDate: string): number {
        return this.coachService.calculatePlayerAge(birthDate);
    }

    getInitials(firstName: string, lastName: string): string {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    getRowClass(player: DisplayPlayer): string {
        const classes = [];
        if (player.status === 'INJURED') classes.push('injured');
        if (player.status === 'SUSPENDED') classes.push('suspended');
        if (this.isContractEnding(player.contract_end_date)) classes.push('contract-ending');
        return classes.join(' ');
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'ACTIVE':
                return 'Actif';
            case 'INJURED':
                return 'Blessé';
            case 'SUSPENDED':
                return 'Suspendu';
            case 'TIRED':
                return 'Fatigué';
            default:
                return status;
        }
    }

    getPositionClass(position: string): string {
        if (['CB', 'RB', 'LB'].includes(position)) return 'position-defender';
        if (['CDM', 'CM', 'RM', 'LM'].includes(position)) return 'position-midfielder';
        if (['RW', 'LW', 'ST'].includes(position)) return 'position-forward';
        if (position === 'GK') return 'position-goalkeeper';
        return '';
    }

    getFitnessClass(level?: string): string {
        if (!level) return 'fitness-good';
        return `fitness-${level.toLowerCase()}`;
    }

    getFitnessLabel(level?: string): string {
        if (!level) return 'Bon';
        switch (level) {
            case 'EXCELLENT':
                return 'Excellent';
            case 'GOOD':
                return 'Bon';
            case 'FAIR':
                return 'Correct';
            case 'POOR':
                return 'Faible';
            default:
                return level;
        }
    }

    getFitnessPercentage(level?: string): number {
        if (!level) return 75;
        switch (level) {
            case 'EXCELLENT':
                return 100;
            case 'GOOD':
                return 75;
            case 'FAIR':
                return 50;
            case 'POOR':
                return 25;
            default:
                return 0;
        }
    }

    addPlayer() {
        this.selectedPlayer = null;
        this.showPlayerForm = true;
    }

    editPlayer(player: DisplayPlayer) {
        this.selectedPlayer = player;
        this.showPlayerForm = true;
    }

    deletePlayer(player: DisplayPlayer) {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer ${player.first_name} ${player.last_name} ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                if (player.id) {
                    this.clubManagerService.deletePlayer(player.id).subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Succès',
                                detail: 'Joueur supprimé avec succès'
                            });
                            this.loadPlayers();
                        },
                        error: (err) => {
                            console.error('Erreur suppression:', err);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erreur',
                                detail: 'Impossible de supprimer le joueur'
                            });
                        }
                    });
                }
            }
        });
    }

    onPlayerSaved() {
        this.showPlayerForm = false;
        this.selectedPlayer = null;
        this.loadPlayers();
    }

    exportToSheets() {
        this.messageService.add({
            severity: 'success',
            summary: 'Export réussi',
            detail: 'Export vers Google Sheets en cours...'
        });
    }

    refreshPlayers() {
        this.messageService.add({
            severity: 'info',
            summary: 'Actualisation',
            detail: 'Liste des joueurs actualisée'
        });
        this.loadPlayers();
    }

    viewPlayerDetails(player: DisplayPlayer) {
        this.selectedPlayer = player;
        this.showPlayerDetails = true;
    }

    onEditPlayer(player: DisplayPlayer | CoachPlayer) {
        this.messageService.add({
            severity: 'info',
            summary: 'Modifier le joueur',
            detail: `Modification de ${player.first_name} ${player.last_name}`
        });
        this.showPlayerDetails = false;
    }
}
