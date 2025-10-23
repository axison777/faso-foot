// coach-match-sheet.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CallupService } from '../../service/callup.service';
import { AuthService } from '../../service/auth.service';
import { CoachService } from '../../service/coach.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { PitchSetupComponent } from '../pitch-setup/pitch-setup.component';

@Component({
    selector: 'app-coach-match-sheet',
    standalone: true,
    imports: [CommonModule, PitchSetupComponent, ToastModule, ButtonModule],
    templateUrl: './coach-match-sheet.component.html',
    styleUrls: ['./coach-match-sheet.component.scss'],
    providers: [MessageService]
})
export class CoachMatchSheetComponent implements OnInit {
    @ViewChild(PitchSetupComponent) pitchSetup?: PitchSetupComponent;

    matchId!: string;
    match: any = null;
    myTeam: any = null;
    myTeamId: string | null = null;
    isHome = false;

    availablePlayersPayload: any = null;
    coachName: string | undefined = undefined;
    teamName: string | undefined = undefined;
    teamLogo: string | undefined = undefined;

    isLoading = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private callupService: CallupService,
        private coachService: CoachService,
        private authService: AuthService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        const currentUser = this.authService.currentUser;
        this.myTeamId = currentUser?.team_id || null;

        if (!this.myTeamId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de déterminer votre équipe'
            });
            this.router.navigate(['/mon-equipe/dashboard']);
            return;
        }

        // Récupérer l'ID du match depuis l'URL
        this.matchId = this.route.snapshot.paramMap.get('id') ?? '';

        if (!this.matchId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Match non spécifié'
            });
            this.router.navigate(['/mon-equipe/dashboard']);
            return;
        }

        console.log('🏟️ [COACH MATCH SHEET] Match ID:', this.matchId);
        console.log('🆔 [COACH MATCH SHEET] Team ID:', this.myTeamId);

        this.loadMatchAndPlayers();
    }

    /**
     * Charge les données du match et les joueurs disponibles
     */
    private loadMatchAndPlayers() {
        this.isLoading = true;

        // Charger les infos de l'équipe
        this.coachService.getTeamById(this.myTeamId!).subscribe({
            next: (team) => {
                this.myTeam = team;
                this.teamName = team.name;
                this.teamLogo = team.logo;

                // Charger les joueurs disponibles
                this.callupService.getAvailablePlayers(this.myTeamId!).subscribe({
                    next: (res: any) => {
                        const players = res?.data?.available_players || [];
                        console.log('Players:', players);
                        // Format pour le pitch-setup
                        this.availablePlayersPayload = {
                            data: {
                                available_players: players.map((p: any) => ({
                                    id: String(p.id),
                                    first_name: p.first_name,
                                    last_name: p.last_name,
                                    position: p.preferred_position,
                                    //   position: this.mapPreferredPosition(p.preferred_position),
                                    photo_url: p.photo_url ?? null,
                                    jersey_number: p.jersey_number ?? null
                                }))
                            }
                        };

                        // Récupérer le nom du coach
                        this.coachService.getTeamStaff(this.myTeamId!).subscribe({
                            next: (staffRes: any) => {
                                const coaches = staffRes?.data?.staffs || [];
                                const coach = coaches.find((s: any) => s.role === 'HEAD_COACH' || s.role === 'COACH');
                                if (coach?.user) {
                                    this.coachName = `${coach.user.first_name} ${coach.user.last_name}`;
                                }
                                this.isLoading = false;
                            },
                            error: () => {
                                this.coachName = undefined;
                                this.isLoading = false;
                            }
                        });
                    },
                    error: (err) => {
                        console.error('Erreur chargement joueurs', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de charger les joueurs'
                        });
                        this.isLoading = false;
                    }
                });
            },
            error: (err) => {
                console.error('Erreur chargement équipe', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Impossible de charger les informations de l'équipe"
                });
                this.router.navigate(['/mon-equipe/dashboard']);
            }
        });
    }

    /**
     * Mappe la position préférée du joueur
     */
    //   private mapPreferredPosition(pos: string): 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK' {
    //     const posUpper = pos?.toUpperCase();
    //     const goalkeepers = ['GK'];
    //     const defenders = ['CB', 'LB', 'RB', 'LCB', 'RCB'];
    //     const midfielders = ['CM', 'CDM', 'CAM', 'LM', 'RM', 'RCM', 'LCM'];
    //     const attackers = ['ST', 'CF', 'LW', 'RW', 'LS', 'RS'];

    //     if (goalkeepers.includes(posUpper)) return 'GOALKEEPER';
    //     if (defenders.includes(posUpper)) return 'DEFENSE';
    //     if (midfielders.includes(posUpper)) return 'MIDFIELD';
    //     if (attackers.includes(posUpper)) return 'ATTACK';
    //     return 'MIDFIELD';
    //   }

    /**
     * Handler appelé quand le coach sauvegarde la feuille
     */
    onSaveSheet(payloadFromPitch: any) {
        console.log('📋 [COACH MATCH SHEET] Payload reçu du pitch:', payloadFromPitch);

        if (!Array.isArray(payloadFromPitch.players) || payloadFromPitch.players.length === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Vous devez sélectionner au moins 11 joueurs'
            });
            return;
        }

        // Compléter le payload avec les informations du match et de l'équipe
        const completedPayload = {
            ...payloadFromPitch,
            match_id: this.matchId,
            team_id: this.myTeamId,
            coach_id: payloadFromPitch.coach_id ?? null,
            finalize: false,
            submitted_at: new Date().toISOString()
        };

        console.log('✅ [COACH MATCH SHEET] Payload complet:', completedPayload);

        // Vérifier s'il existe déjà une composition pour ce match/équipe
        this.callupService.getCallUpByMatch(this.matchId).subscribe({
            next: (res: any) => {
                const existingCallups = res?.data?.match_callups;
                let existingCallupId: string | null = null;

                // Chercher la composition de cette équipe
                if (existingCallups?.team_one_callup?.team_id === this.myTeamId) {
                    existingCallupId = existingCallups.team_one_callup.id || existingCallups.team_one_callup.callup_id;
                } else if (existingCallups?.team_two_callup?.team_id === this.myTeamId) {
                    existingCallupId = existingCallups.team_two_callup.id || existingCallups.team_two_callup.callup_id;
                }

                if (existingCallupId) {
                    // Mise à jour
                    this.updateCallup(existingCallupId, completedPayload);
                } else {
                    // Création
                    this.createCallup(completedPayload);
                }
            },
            error: () => {
                // Si erreur lors de la vérification, tenter la création
                this.createCallup(completedPayload);
            }
        });
    }

    /**
     * Crée une nouvelle composition
     */
    private createCallup(payload: any) {
        this.callupService.createCallup(payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Composition enregistrée avec succès'
                });
                setTimeout(() => {
                    this.router.navigate(['/mon-equipe/dashboard']);
                }, 1500);
            },
            error: (err) => {
                console.error('Erreur création callup', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Erreur lors de l'enregistrement de la composition"
                });
            }
        });
    }

    /**
     * Met à jour une composition existante
     */
    private updateCallup(callupId: string, payload: any) {
        this.callupService.updateCallup(callupId, payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Composition mise à jour avec succès'
                });
                setTimeout(() => {
                    this.router.navigate(['/mon-equipe/dashboard']);
                }, 1500);
            },
            error: (err) => {
                console.error('Erreur mise à jour callup', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la mise à jour de la composition'
                });
            }
        });
    }

    /**
     * Ferme la page et retourne au dashboard
     */
    onClose() {
        this.router.navigate(['/mon-equipe/dashboard']);
    }
}
