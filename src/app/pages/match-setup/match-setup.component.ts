// match-setup.component.ts (version finalisée)
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CallupService } from '../../service/callup.service';
import { OfficialService } from '../../service/official.service';
import { MessageService } from 'primeng/api';
import { Official } from '../../models/official.model';
import { SelectModule } from 'primeng/select';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Checkbox } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { PitchSetupComponent } from '../pitch-setup/pitch-setup.component';

interface PlayerPoolItem {
    id: string;
    teamId?: string;
    first_name: string;
    last_name: string;
    position: string;
    selected?: boolean;
    photo_url?: string;
    selectionOrder?: number | null;
    jersey_number?: number | null;
    is_starter?: boolean;
    role?: string;
}

interface TeamPlayerSelection {
    playerId: string;
    jersey_number: number | null;
    position: 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK';
    isStarter: boolean;
    substituteOrder?: number | null;
}

interface TeamSetup {
    teamId: string;
    coachId: string | null;
    formation: '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '3-4-3';
    captainId: string | null;
    players: TeamPlayerSelection[];
}

@Component({
    selector: 'app-match-setup',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule, TabViewModule, ButtonModule, DialogModule, Checkbox, ToastModule, PitchSetupComponent],
    templateUrl: './match-setup.component.html',
    styleUrls: ['./match-setup.component.scss']
})
export class MatchSetupComponent implements OnInit {
    @ViewChild(PitchSetupComponent) pitchSetup?: PitchSetupComponent;

    // propriétés utiles
    showPitch = false;
    pitchFor: 'home' | 'away' | null = null;

    // payload passé au composant enfant (respecte le shape attendu par le PitchSetupComponent)
    currentAvailablePlayersPayload: any = null;
    currentCoachName: string | undefined = undefined;
    currentTeamName: string | undefined = undefined;
    matchId!: string;
    match: any;
    callupId: string | null = null;
    activeTab: 'officials' | 'teams' = 'officials';
    isClosed = false;
    officials: Official[] = [];
    officialsofmatch: Official[] = [];
    assignedTeams: any = null;

    selectedOfficialId: string | null = null;
    selectedRole: string | null = null;

    formations: { label: string; value: TeamSetup['formation'] }[] = [
        { label: '4-4-2', value: '4-4-2' },
        { label: '4-3-3', value: '4-3-3' },
        { label: '3-5-2', value: '3-5-2' },
        { label: '4-2-3-1', value: '4-2-3-1' },
        { label: '3-4-3', value: '3-4-3' }
    ];

    roles = [
        { label: 'Arbitre Principal', value: 'MAIN_REFEREE' },
        { label: 'Assistant 1', value: 'ASSISTANT_1' },
        { label: 'Assistant 2', value: 'ASSISTANT_2' },
        { label: 'Quatrième Arbitre', value: 'FOURTH_REFEREE' },
        { label: 'Commissaire', value: 'COMMISSIONER' }
    ];

    // Teams
    homeTeam: any = { id: null, name: '', logo: '', players: [] };
    awayTeam: any = { id: null, name: '', logo: '', players: [] };

    homePlayersPool: PlayerPoolItem[] = [];
    awayPlayersPool: PlayerPoolItem[] = [];

    homeCallup: TeamSetup = { teamId: '', formation: '4-4-2', players: [], coachId: null, captainId: null };
    awayCallup: TeamSetup = { teamId: '', formation: '4-3-3', players: [], coachId: null, captainId: null };

    homeCoaches: { id: string; name: string }[] = [];
    awayCoaches: { id: string; name: string }[] = [];

    showHomeForm = false;
    showAwayForm = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private callupService: CallupService,
        private officialService: OfficialService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.matchId = this.route.snapshot.paramMap.get('id') ?? '';
        this.match = history.state.match;

        if (!this.match) {
            console.warn('Aucun match reçu, redirection...');
            this.router.navigate(['/saisons']);
            return;
        }

        this.homeTeam = {
            id: String(this.match.team1_id),
            name: this.match.team1,
            logo: this.match.team1_logo,
            players: []
        };

        this.awayTeam = {
            id: String(this.match.team2_id),
            name: this.match.team2,
            logo: this.match.team2_logo,
            players: []
        };
        this.homeCallup.teamId = this.homeTeam.id ?? '';
        this.awayCallup.teamId = this.awayTeam.id ?? '';

        this.loadTeamPlayers(this.homeTeam);
        this.loadTeamPlayers(this.awayTeam);
        this.loadData();
    }

    loadTeamPlayers(team: any) {
        if (!team.id) return;

        this.callupService.getAvailablePlayers(team.id).subscribe({
            next: (res: any) => {
                const players = res?.data?.available_players || [];

                team.players = players.map((p: any) => ({
                    id: String(p.id),
                    first_name: p.first_name,
                    last_name: p.last_name,
                    position: this.mapPreferredPosition(p.preferred_position),
                    selected: false,
                    selectionOrder: null,
                    photo_url: p.photo_url ?? null,
                    jersey_number: p.jersey_number ?? null
                }));

                if (team === this.homeTeam) {
                    this.homePlayersPool = team.players;
                } else {
                    this.awayPlayersPool = team.players;
                }
            },
            error: (err) => {
                console.error(`Erreur chargement joueurs équipe ${team.name}`, err);
            }
        });
    }

    mapPreferredPosition(pos: string): 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK' {
        const posUpper = pos?.toUpperCase();
        const goalkeepers = ['GK'];
        const defenders = ['CB', 'LB', 'RB', 'LCB', 'RCB'];
        const midfielders = ['CM', 'CDM', 'CAM', 'LM', 'RM', 'RCM', 'LCM'];
        const attackers = ['ST', 'CF', 'LW', 'RW', 'LS', 'RS'];

        if (goalkeepers.includes(posUpper)) return 'GOALKEEPER';
        if (defenders.includes(posUpper)) return 'DEFENSE';
        if (midfielders.includes(posUpper)) return 'MIDFIELD';
        if (attackers.includes(posUpper)) return 'ATTACK';
        return 'MIDFIELD';
    }

    loadData() {
        if (!this.matchId) return;

        this.officialService.getAll().subscribe({
            next: (res: any) => {
                this.officials = res?.data?.officials || res || [];
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des officiels' });
            }
        });

        this.officialService.getOfficialsofMatch(this.matchId).subscribe({
            next: (res: any) => {
                this.officialsofmatch = res?.data?.officials || [];
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des officiels' });
            }
        });

        this.callupService.getCallUpByMatch(this.matchId).subscribe({
            next: (res: any) => {
                this.assignedTeams = res?.data?.match_callups || null;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des listes assignées des équipes' });
            }
        });
    }

    getPlayerPhoto(p: any) {
        return p?.player?.photo || 'assets/images/football-player.png';
    }

    getStarters(players: any[]) {
        return players.filter((p) => p.is_starter);
    }

    getSubstitutes(players: any[]) {
        return players.filter((p) => !p.is_starter);
    }

    assignOfficial() {
        if (!this.selectedOfficialId || !this.selectedRole) return;

        const payload = {
            official_id: this.selectedOfficialId,
            match_id: this.matchId,
            role: this.selectedRole
        };

        this.officialService.assign(payload).subscribe({
            next: (response) => {
                this.messageService.add({ severity: 'success', summary: "Assignation d'officiel", detail: 'Officiel assigné avec succès.' });
                this.loadData();
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: "Assignation d'officiel", detail: "Une erreur est survenue lors de l'assignation de l'officiel." });
                console.error("Erreur lors de l'assignation", error);
            }
        });
    }

    unassignOfficial(officialId: string) {
        if (!officialId || !this.matchId) return;

        // Confirmation avant désassignation
        if (!confirm('Êtes-vous sûr de vouloir désassigner cet officiel du match ?')) {
            return;
        }

        const payload = {
            reason: 'Désassignation par l\'organisateur' // Optionnel
        };

        this.officialService.unassign(this.matchId, officialId, payload).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: "Désassignation d'officiel",
                    detail: 'Officiel désassigné avec succès.'
                });
                this.loadData(); // Recharger les données
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: "Désassignation d'officiel",
                    detail: "Une erreur est survenue lors de la désassignation de l'officiel."
                });
                console.error("Erreur lors de la désassignation", error);
            }
        });
    }

    setTab(tab: 'officials' | 'teams') {
        this.activeTab = tab;
    }

    isPlayerSelected(teamKey: 'home' | 'away', playerId: string): boolean {
        const t = teamKey === 'home' ? this.homeCallup : this.awayCallup;
        return !!t.players.find((p) => p.playerId === playerId);
    }

    onPlayerToggle(side: 'home' | 'away', player: PlayerPoolItem, selected: boolean) {
        const pool = side === 'home' ? this.homePlayersPool : this.awayPlayersPool;
        const callup = side === 'home' ? this.homeCallup : this.awayCallup;

        const otherSelectedCount = pool.filter((p) => p.selected && p.id !== player.id).length;

        if (selected) {
            const nextOrder = otherSelectedCount + 1;
            player.selectionOrder = nextOrder;
            player.selected = true;

            if (!callup.players.some((tp) => tp.playerId === player.id)) {
                callup.players.push({
                    playerId: player.id,
                    jersey_number: player.jersey_number ?? null,
                    position: player.position as 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK',
                    isStarter: nextOrder <= 11,
                    substituteOrder: nextOrder > 11 ? nextOrder - 11 : null
                });
            } else {
                const tp = callup.players.find((tp) => tp.playerId === player.id)!;
                tp.isStarter = nextOrder <= 11;
                tp.substituteOrder = nextOrder > 11 ? nextOrder - 11 : null;
            }
        } else {
            player.selected = false;
            callup.players = callup.players.filter((tp) => tp.playerId !== player.id);
            player.selectionOrder = null;
            this.reorderAfterRemoval(pool, callup);
        }
    }

    private findPlayerNumberInPool(teamId: string, playerId: string): number | null {
        const pool = String(this.homeTeam.id) === String(teamId) ? this.homePlayersPool : this.awayPlayersPool;
        const p = pool.find((x) => String(x.id) === String(playerId));
        return p ? (p.jersey_number ?? null) : null;
    }

    private reorderAfterRemoval(pool: PlayerPoolItem[], callup: TeamSetup) {
        const selected = pool.filter((p) => p.selected).sort((a, b) => (a.selectionOrder ?? 999) - (b.selectionOrder ?? 999));

        selected.forEach((p, idx) => {
            const newOrder = idx + 1;
            p.selectionOrder = newOrder;

            const tp = callup.players.find((x) => x.playerId === p.id);
            if (tp) {
                tp.isStarter = newOrder <= 11;
                tp.substituteOrder = newOrder > 11 ? newOrder - 11 : null;
            }
        });
    }

    getTeamPlayer(side: 'home' | 'away', playerId: string) {
        const callup = side === 'home' ? this.homeCallup : this.awayCallup;
        return callup.players.find((p) => p.playerId === playerId);
    }

    onStarterChange(teamKey: 'home' | 'away', playerId: string, desired: boolean) {
        const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;
        const sel = team.players.find((p) => p.playerId === playerId);
        if (!sel) return;

        if (desired) {
            const starters = team.players.filter((p) => p.isStarter).length;
            if (!sel.isStarter && starters >= 11) {
                sel.isStarter = false;
                return;
            }
            sel.isStarter = true;
            sel.substituteOrder = null;
        } else {
            sel.isStarter = false;
        }
    }

    updateSubOrder(teamKey: 'home' | 'away', playerId: string, order: number | null) {
        const sel = this.getTeamPlayer(teamKey, playerId);
        if (sel) sel.substituteOrder = order ?? null;
    }

    setCoach(teamKey: 'home' | 'away', coachId: string | null | undefined) {
        const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;
        team.coachId = coachId ? String(coachId) : null;
    }

    setCaptain(teamKey: 'home' | 'away', captainId: string | null | undefined) {
        const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;
        if (!captainId) {
            team.captainId = null;
            return;
        }
        if (!team.players.some((p) => p.playerId === captainId)) {
            return;
        }
        team.captainId = String(captainId);
    }

    getPlayerName(teamKey: 'home' | 'away', playerId: string): string {
        const pool = teamKey === 'home' ? this.homePlayersPool : this.awayPlayersPool;
        const p = pool.find((x) => x.id === playerId);
        return p ? `${p.first_name} ${p.last_name}` : 'Inconnu';
    }

    mapRole(role: string | null | undefined): string {
        switch (role) {
            case 'MAIN_REFEREE':
                return 'Arbitre Principal';
            case 'ASSISTANT_1':
                return 'Assistant 1';
            case 'ASSISTANT_2':
                return 'Assistant 2';
            case 'FOURTH_REFERE':
                return 'Quatrième Arbitre';
            case 'COMMISSIONER':
                return 'Commissaire';
            default:
                return role ?? 'Inconnu';
        }
    }

    private makeTeamPayload(team: TeamSetup) {
        return {
            match_id: String(this.matchId),
            team_id: String(team.teamId),
            coach_id: team.coachId ? String(team.coachId) : null,
            formation: team.formation,
            captain_id: team.captainId ? String(team.captainId) : null,
            finalize: false,
            players: team.players.map((p) => {
                // si p.jersey_number est null/undefined, on tente de récupérer depuis le pool
                const jersey = p.jersey_number ?? this.findPlayerNumberInPool(String(team.teamId), p.playerId);
                return {
                    player_id: String(p.playerId),
                    jersey_number: jersey ?? null,
                    position: p.position,
                    is_starter: p.isStarter,
                    substitute_order: p.isStarter ? 0 : (p.substituteOrder ?? 0)
                };
            })
        };
    }

    toggleHomeForm() {
        this.showHomeForm = !this.showHomeForm;
        if (this.showHomeForm) {
            this.prefillTeamFromAssigned('home');
        } else {
            this.restoreSelectionFromAssigned('home');
        }
    }

    toggleAwayForm() {
        this.showAwayForm = !this.showAwayForm;
        if (this.showAwayForm) {
            this.prefillTeamFromAssigned('away');
        } else {
            this.restoreSelectionFromAssigned('away');
        }
    }

    /**
     * Retourne l'id existant de la composition (si présent) pour détecter le mode édition.
     * On regarde plusieurs champs possibles (id / callup_id) au cas où l'API varie.
     */
    private getExistingCallupId(teamKey: 'home' | 'away'): string | null {
        if (!this.assignedTeams) return null;
        const callup = teamKey === 'home' ? this.assignedTeams.team_one_callup : this.assignedTeams.team_two_callup;
        return callup?.id ? String(callup.id) : callup?.callup_id ? String(callup.callup_id) : null;
    }

    /**
     * Préremplit homeCallup/awayCallup ET met à jour les pools (selected + selectionOrder)
     * si assignedTeams contient une composition pour l'équipe demandée.
     */
    private prefillTeamFromAssigned(teamKey: 'home' | 'away') {
        if (!this.assignedTeams) {
            // rien à préremplir
            return;
        }

        const callupData = teamKey === 'home' ? this.assignedTeams.team_one_callup : this.assignedTeams.team_two_callup;
        const pool = teamKey === 'home' ? this.homePlayersPool : this.awayPlayersPool;
        const target = teamKey === 'home' ? this.homeCallup : this.awayCallup;

        if (!callupData) {
            // pas de composition enregistrée -> reset léger
            pool.forEach((p) => {
                p.selected = false;
                p.selectionOrder = null;
            });
            target.players = [];
            target.coachId = null;
            target.captainId = null;
            return;
        }

        // map fields robustement
        target.teamId = String(callupData.team_id ?? target.teamId ?? (teamKey === 'home' ? this.homeTeam.id : this.awayTeam.id));
        target.formation = (callupData.formation ?? target.formation) as TeamSetup['formation'];
        target.coachId = callupData.coach_id ? String(callupData.coach_id) : null;
        target.captainId = callupData.captain_id ? String(callupData.captain_id) : null;

        // build players list dans le format TeamPlayerSelection
        const playersFromApi = (callupData.players || []) as any[];
        const mappedPlayers: TeamPlayerSelection[] = playersFromApi.map((p) => ({
            playerId: String(p.player_id ?? p.playerId ?? p.id),
            jersey_number: p.jersey_number ?? null,
            position: (p.position ?? p.pos ?? 'MIDFIELD') as TeamPlayerSelection['position'],
            isStarter: !!(p.is_starter ?? p.isStarter),
            substituteOrder: p.substitute_order ?? p.substituteOrder ?? null
        }));

        target.players = mappedPlayers;

        // reset pool selections
        pool.forEach((p) => {
            p.selected = false;
            p.selectionOrder = null;
        });

        // assign selectionOrder :
        // - les titulaires conservent un ordre selon leur apparition dans mappedPlayers (où isStarter === true)
        // - les remplaçants sont ordonnés par substituteOrder si présent, puis viennent après les titulaires
        const starters = mappedPlayers.filter((mp) => mp.isStarter);
        starters.forEach((sp, idx) => {
            const poolP = pool.find((pp) => String(pp.id) === String(sp.playerId));
            if (poolP) {
                poolP.selected = true;
                poolP.selectionOrder = idx + 1;
            }
        });

        const substitutes = mappedPlayers.filter((mp) => !mp.isStarter).sort((a, b) => (a.substituteOrder ?? 999) - (b.substituteOrder ?? 999));

        let subStart = starters.length + 1;
        substitutes.forEach((sub, idx) => {
            const poolP = pool.find((pp) => String(pp.id) === String(sub.playerId));
            if (poolP) {
                poolP.selected = true;
                poolP.selectionOrder = subStart + idx;
            }
        });
    }

    private restoreSelectionFromAssigned(teamKey: 'home' | 'away') {
        if (this.assignedTeams) {
            this.prefillTeamFromAssigned(teamKey);
        } else {
            const pool = teamKey === 'home' ? this.homePlayersPool : this.awayPlayersPool;
            pool.forEach((p) => {
                p.selected = false;
                p.selectionOrder = null;
            });
            const target = teamKey === 'home' ? this.homeCallup : this.awayCallup;
            target.players = [];
            target.coachId = null;
            target.captainId = null;
        }
    }

    /**
     * Sauvegarde (create ou update selon présence d'une composition existante)
     */
    saveCallup(teamKey: 'home' | 'away') {
        const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;

        if (!team.teamId) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Identifiant de l'équipe manquant." });
            return;
        }

        if (team.players.filter((p) => p.isStarter).length < 11) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Il faut au moins 11 titulaires.' });
            return;
        }

        const missingNumbers = team.players.filter((p) => !p.jersey_number || p.jersey_number <= 0);
        if (missingNumbers.length > 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Renseignez le numéro de maillot pour tous les joueurs sélectionnés (${missingNumbers.length} manquant(s)).`
            });
            return;
        }

        const payload = this.makeTeamPayload(team);
        console.log('Payload envoyé à create/updateCallup:', payload);

        const existingCallupId = this.getExistingCallupId(teamKey);

        if (existingCallupId) {
            this.callupService.updateCallup(existingCallupId, payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Composition mise à jour' });
                    this.loadData();
                    if (teamKey === 'home') this.showHomeForm = false;
                    else this.showAwayForm = false;
                },
                error: (err) => {
                    console.error('Erreur updateCallup', err);
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la mise à jour.' });
                }
            });
        } else {
            this.callupService.createCallup(payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Composition enregistrée' });
                    this.loadData();
                    if (teamKey === 'home') this.showHomeForm = false;
                    else this.showAwayForm = false;
                },
                error: (err) => {
                    console.error('Erreur createCallup', err);
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la sauvegarde.' });
                }
            });
        }
    }

    getPlayerRingClass(p: any): 'green' | 'yellow' | null {
        if (p.role) {
            if (p.role === 'Titulaire') return 'green';
            if (p.role === 'Remplaçant') return 'yellow';
        } else {
            if (!p.selected) return null;
            return p.selectionOrder && p.selectionOrder <= 11 ? 'green' : 'yellow';
        }
        return null;
    }

    getStatusLabel(status: string | undefined): string {
        switch (status) {
            case 'ACTIVE':
                return 'Actif';
            case 'INACTIVE':
                return 'Inactif';
            case 'SUSPENDED':
                return 'Suspendu';
            default:
                return '';
        }
    }

    getOfficialTypeLabel(type: string | undefined): string {
        switch (type) {
            case 'REFEREE':
                return 'Arbitre';
            case 'COMMISSIONER':
                return 'Commissaire';
            default:
                return '';
        }
    }

    getAvailableRoles() {
        const assignedRoles = this.officialsofmatch.map((o) => o.matches?.[0]?.pivot?.role);
        return this.roles.filter((roleObj) => !assignedRoles.includes(roleObj.value));
    }

    getAvailableOfficialsForRole(role: string): Official[] {
        return this.officials?.filter((o) => o.status === 'ACTIVE') || [];
    }

    openPitch(side: 'home' | 'away') {
        this.pitchFor = side;
        this.showPitch = true;

        if (side === 'home') {
            this.currentAvailablePlayersPayload = { data: { available_players: this.homePlayersPool } };
            this.currentCoachName = this.homeCoaches?.[0]?.id ? this.homeCoaches[0].name : undefined;
            this.currentTeamName = this.homeTeam.name;
        } else {
            this.currentAvailablePlayersPayload = { data: { available_players: this.awayPlayersPool } };
            this.currentCoachName = this.awayCoaches?.[0]?.id ? this.awayCoaches[0].name : undefined;
            this.currentTeamName = this.awayTeam.name;
        }
    }

    onPitchClose() {
        this.showPitch = false;
        this.pitchFor = null;
        this.currentAvailablePlayersPayload = null;
    }

    /**
     * Handler appelé lorsque l'enfant émet (saveSheet).
     * Le payload vient de PitchSetupComponent.getFinalPayload()
     */
    async onReceiveSheet(payloadFromChild: any) {
        try {
            if (!Array.isArray(payloadFromChild.players) || payloadFromChild.players.length === 0) {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Payload invalide : pas de joueurs.' });
                return;
            }

            // Compléter champs en fonction de l'équipe courante (pitchFor)
            const teamId = this.getCurrentTeamId();
            const coachId = this.getCoachId();

            const completed = {
                ...payloadFromChild,
                match_id: String(this.getCurrentMatchId() ?? this.matchId),
                team_id: teamId ? String(teamId) : undefined,
                coach_id: payloadFromChild.coach_id ?? coachId ?? null,
                finalize: false,
                submitted_at: new Date().toISOString()
            };

            // si team_id est manquant -> erreur
            if (!completed.team_id) {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Impossible de déterminer l'équipe (team_id)." });
                return;
            }

            // Détecte si on doit créer OU mettre à jour (si existing callup exists pour cette équipe)
            const existingId = this.getExistingCallupId(this.pitchFor === 'home' ? 'home' : 'away');

            if (existingId) {
                // update
                this.callupService.updateCallup(existingId, completed).subscribe({
                    next: (resp) => {
                        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Composition mise à jour.' });

                        // fermer et rafraîchir
                        this.showPitch = false;
                        this.pitchFor = null;
                        this.currentAvailablePlayersPayload = null;
                        this.loadData();
                    },
                    error: (err) => {
                        console.error('Erreur update via parent', err);
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la mise à jour de la composition.' });
                    }
                });
            } else {
                // create
                this.callupService.createCallup(completed).subscribe({
                    next: (resp) => {
                        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Composition enregistrée.' });

                        this.showPitch = false;
                        this.pitchFor = null;
                        this.currentAvailablePlayersPayload = null;
                        this.loadData();
                    },
                    error: (err) => {
                        console.error('Erreur create via parent', err);
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'enregistrement de la composition." });
                    }
                });
            }
        } catch (err) {
            console.error('Erreur enregistrement feuille:', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l’enregistrement. Voir console.' });
        }
    }

    // Helpers pour déterminer match/team/coach selon le contexte current (pitchFor)
    private getCurrentMatchId(): string | undefined {
        return this.matchId ? String(this.matchId) : undefined;
    }

    private getCurrentTeamId(): string | undefined {
        if (this.pitchFor === 'home') return this.homeTeam?.id ?? undefined;
        if (this.pitchFor === 'away') return this.awayTeam?.id ?? undefined;
        return undefined;
    }

    private getCoachId(): string | null {
        // prefer callup's coachId if set, otherwise take first coach from arrays if present
        if (this.pitchFor === 'home') {
            return this.homeCallup?.coachId ?? (this.homeCoaches?.[0]?.id ? String(this.homeCoaches[0].id) : null);
        }
        if (this.pitchFor === 'away') {
            return this.awayCallup?.coachId ?? (this.awayCoaches?.[0]?.id ? String(this.awayCoaches[0].id) : null);
        }
        return null;
    }
}
