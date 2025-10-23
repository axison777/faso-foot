import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OfficialMatch } from '../../service/official-match.service';
import { MatchCallupService, TeamCallup, CallupPlayer } from '../../service/match-callup.service';

@Component({
    selector: 'app-match-details-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, CheckboxModule, ToastModule],
    providers: [MessageService],
    templateUrl: './match-details-modal.component.html',
    styleUrls: ['./match-details-modal.component.scss']
})
export class MatchDetailsModalComponent implements OnInit, OnChanges {
    @Input() visible = false;
    @Input() match: OfficialMatch | null = null;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() submitReport = new EventEmitter<OfficialMatch>();

    homeTeamCallup: TeamCallup | null = null;
    awayTeamCallup: TeamCallup | null = null;
    loadingCallups = false;

    // Nouvelles propriétés pour la refonte
    showFormationView: 'team1' | 'team2' | null = null;
    hoveredPlayerId: string | null = null;

    // Formations disponibles (copié de pitch-setup)
    formations: Record<string, { x: number; y: number }[]> = {
        '4-4-2': [
            { x: 4, y: 50 },
            { x: 28, y: 18 },
            { x: 24, y: 36 },
            { x: 24, y: 64 },
            { x: 28, y: 82 },
            { x: 50, y: 18 },
            { x: 48, y: 36 },
            { x: 48, y: 64 },
            { x: 50, y: 82 },
            { x: 82, y: 42 },
            { x: 82, y: 58 }
        ],
        '4-3-3': [
            { x: 4, y: 50 },
            { x: 28, y: 18 },
            { x: 24, y: 36 },
            { x: 24, y: 64 },
            { x: 28, y: 82 },
            { x: 54, y: 32 },
            { x: 48, y: 50 },
            { x: 54, y: 68 },
            { x: 76, y: 18 },
            { x: 86, y: 50 },
            { x: 76, y: 82 }
        ],
        '3-5-2': [
            { x: 4, y: 50 },
            { x: 24, y: 34 },
            { x: 22, y: 50 },
            { x: 24, y: 66 },
            { x: 58, y: 18 },
            { x: 52, y: 34 },
            { x: 46, y: 50 },
            { x: 52, y: 66 },
            { x: 58, y: 82 },
            { x: 82, y: 42 },
            { x: 82, y: 58 }
        ],
        '3-4-3': [
            { x: 4, y: 50 },
            { x: 27, y: 18 },
            { x: 20, y: 50 },
            { x: 27, y: 82 },
            { x: 50, y: 16 },
            { x: 50, y: 38 },
            { x: 50, y: 62 },
            { x: 50, y: 84 },
            { x: 76, y: 18 },
            { x: 86, y: 50 },
            { x: 76, y: 82 }
        ]
    };

    constructor(
        private messageService: MessageService,
        private callupService: MatchCallupService
    ) {}

    ngOnInit() {
        this.loadMatchCallups();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['match'] && this.match?.id) {
            this.loadMatchCallups();
        }
    }

    loadMatchCallups() {
        if (!this.match?.id) return;

        this.loadingCallups = true;
        this.callupService.getMatchCallups(this.match.id).subscribe({
            next: (callups) => {
                console.log('Feuilles de match chargées:', callups);
                if (callups) {
                    this.homeTeamCallup = callups.team_one_callup;
                    this.awayTeamCallup = callups.team_two_callup;
                }
                this.loadingCallups = false;
            },
            error: (err) => {
                console.error('Erreur chargement feuilles de match:', err);
                this.loadingCallups = false;
            }
        });
    }

    // Nouvelles méthodes pour la refonte
    toggleFormationView(team: 'team1' | 'team2') {
        this.showFormationView = this.showFormationView === team ? null : team;
    }

    onPlayerHover(playerId: string | null) {
        this.hoveredPlayerId = playerId;
    }

    getPlayerPosition(player: CallupPlayer, formation: string): { x: number; y: number } {
        const positions = this.formations[formation] || this.formations['4-4-2'];
        const starters = this.getStarters(this.showFormationView === 'team1' ? this.homeTeamCallup?.players || [] : this.awayTeamCallup?.players || []);

        const playerIndex = starters.findIndex((p) => p.id === player.id);

        if (playerIndex >= 0 && playerIndex < positions.length) {
            return positions[playerIndex];
        }

        return { x: 50, y: 50 };
    }

    getStarters(players: CallupPlayer[]): CallupPlayer[] {
        if (!players) return [];
        return players.filter((p) => p.is_starter === true || p.is_starter === 'true' || p.is_starter === '1');
    }

    getSubstitutes(players: CallupPlayer[]): CallupPlayer[] {
        if (!players) return [];
        return players.filter((p) => p.is_starter === false || p.is_starter === 'false' || p.is_starter === '0');
    }

    getStatusClass(status: string | null | undefined): string {
        if (!status) return 'status-upcoming';
        return `status-${status.toLowerCase()}`;
    }

    getStatusLabel(status: string | null | undefined): string {
        if (!status) return 'À venir';
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
        if (!role) return 'Officiel';
        switch (role.toUpperCase()) {
            case 'CENTRAL_REFEREE':
            case 'MAIN_REFEREE':
                return 'Arbitre Central';
            case 'ASSISTANT_REFEREE_1':
            case 'ASSISTANT_1':
                return 'Assistant 1';
            case 'ASSISTANT_REFEREE_2':
            case 'ASSISTANT_2':
                return 'Assistant 2';
            case 'FOURTH_OFFICIAL':
                return '4ème Arbitre';
            case 'COMMISSIONER':
                return 'Commissaire';
            default:
                return role;
        }
    }

    getRoleIcon(role: string): string {
        if (!role) return 'pi pi-user';
        switch (role.toUpperCase()) {
            case 'CENTRAL_REFEREE':
            case 'MAIN_REFEREE':
                return 'pi pi-flag';
            case 'ASSISTANT_REFEREE_1':
            case 'ASSISTANT_1':
            case 'ASSISTANT_REFEREE_2':
            case 'ASSISTANT_2':
                return 'pi pi-flag-fill';
            case 'FOURTH_OFFICIAL':
                return 'pi pi-users';
            case 'COMMISSIONER':
                return 'pi pi-briefcase';
            default:
                return 'pi pi-user';
        }
    }

    onClose() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onSubmitReport() {
        if (this.match) {
            this.submitReport.emit(this.match);
            this.onClose();
        }
    }
}
