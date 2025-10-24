// src/app/pages/pitch-setup/pitch-setup.component.ts
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragEnd, CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

type Role = 'GK' | 'LB' | 'CB' | 'RB' | 'LM' | 'CM' | 'RM' | 'LW' | 'ST' | 'RW' | 'DM' | string;

interface Player {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  jersey_number?: number;
  preferred_position?: string;
  status?: string;
  photo_url?: string;
  birth_place?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  height?: number;
  weight?: number;
  blood_type?: string;
  foot_preference?: string;
  license_number?: string;
}

interface Placed {
    playerId?: string;
    x: number;
    y: number;
    role?: Role;
}

interface TeamSheet {
    coach?: string | null;
    formationKey?: string;
    positions: Placed[];
    substitutes: string[];
    captainId?: string | null;
}

interface FormationPreview {
  key: string;
  name: string;
  lines: number[];
}

@Component({
    selector: 'app-pitch-setup',
    standalone: true,
    imports: [CommonModule, FormsModule, DragDropModule, DropdownModule, ButtonModule],
    templateUrl: './pitch-setup.component.html',
    styleUrls: ['./pitch-setup.component.scss']
})
export class PitchSetupComponent implements OnInit, OnChanges {
    @Output() close = new EventEmitter<void>();
    @Input() teamName?: string;
    @Input() teamLogoUrl?: string;
    @Input() coachName?: string;

    /**
     * Emission du payload final vers le parent pour qu'il complète les infos
     * (match_id, team_id, etc.) puis appelle l'endpoint.
     */
    @Output() saveSheet = new EventEmitter<any>();

    /**
     * availablePlayersData: objet reçu depuis le parent.
     * Exemple :
     * { status: true, data: { available_players: [...] }, message: "..." }
     */
    @Input() availablePlayersData?: any;

    @ViewChild('pitchContainer', { static: true }) pitchContainer!: ElementRef<HTMLDivElement>;

    // roster initialisé depuis availablePlayersData
    roster: Player[] = [];

    formations: Record<string, { name: string; positions: { role: string; x: number; y: number }[] }> = {
        //'4-4-2': { name: '4-4-2 (losange)', positions: [ { role: 'GK', x: 4, y: 50 }, { role: 'LB', x: 28, y: 18 }, { role: 'LCB', x: 24, y: 36 }, { role: 'RCB', x: 24, y: 64 }, { role: 'RB', x: 28, y: 82 }, { role: 'DM', x: 40, y: 50 }, { role: 'LCM', x: 52, y: 36 }, { role: 'RCM', x: 52, y: 64 }, { role: 'CAM', x: 64, y: 50 }, { role: 'LST', x: 82, y: 42 }, { role: 'RST', x: 82, y: 58 } ] },
        '4-4-2': {
            name: '4-4-2 (carré)',
            positions: [
                { role: 'GK', x: 4, y: 50 },
                { role: 'LB', x: 28, y: 18 },
                { role: 'LCB', x: 24, y: 36 },
                { role: 'RCB', x: 24, y: 64 },
                { role: 'RB', x: 28, y: 82 },
                { role: 'LM', x: 50, y: 18 },
                { role: 'LCM', x: 48, y: 36 },
                { role: 'RCM', x: 48, y: 64 },
                { role: 'RM', x: 50, y: 82 },
                { role: 'LST', x: 82, y: 42 },
                { role: 'RST', x: 82, y: 58 }
            ]
        },
        '4-3-3': {
            name: '4-3-3',
            positions: [
                { role: 'GK', x: 4, y: 50 },
                { role: 'LB', x: 28, y: 18 },
                { role: 'LCB', x: 24, y: 36 },
                { role: 'RCB', x: 24, y: 64 },
                { role: 'RB', x: 28, y: 82 },
                { role: 'LCM', x: 54, y: 32 },
                { role: 'CM', x: 48, y: 50 },
                { role: 'RCM', x: 54, y: 68 },
                { role: 'LW', x: 76, y: 18 },
                { role: 'ST', x: 86, y: 50 },
                { role: 'RW', x: 76, y: 82 }
            ]
        },
        //'4-5-1': { name: '4-5-1', positions: [ { role: 'GK', x: 4, y: 50 }, { role: 'LB', x: 20, y: 18 }, { role: 'LCB', x: 20, y: 36 }, { role: 'RCB', x: 20, y: 64 }, { role: 'RB', x: 20, y: 82 }, { role: 'LM', x: 64, y: 18 }, { role: 'LCM', x: 60, y: 32 }, { role: 'CM', x: 56, y: 50 }, { role: 'RCM', x: 60, y: 68 }, { role: 'RM', x: 64, y: 82 }, { role: 'ST', x: 86, y: 50 } ] },
        //'5-3-2': { name: '5-3-2', positions: [ { role: 'GK', x: 4, y: 50 }, { role: 'LWB', x: 28, y: 18 }, { role: 'LCB', x: 24, y: 34 }, { role: 'CB', x: 20, y: 50 }, { role: 'RCB', x: 24, y: 66 }, { role: 'RWB', x: 28, y: 82 }, { role: 'LCM', x: 56, y: 36 }, { role: 'CM', x: 52, y: 50 }, { role: 'RCM', x: 56, y: 64 }, { role: 'LST', x: 82, y: 42 }, { role: 'RST', x: 82, y: 58 } ] },
        '3-5-2': {
            name: '3-5-2',
            positions: [
                { role: 'GK', x: 4, y: 50 },
                { role: 'LCB', x: 24, y: 34 },
                { role: 'CB', x: 22, y: 50 },
                { role: 'RCB', x: 24, y: 66 },
                { role: 'LM', x: 58, y: 18 },
                { role: 'LCM', x: 52, y: 34 },
                { role: 'CM', x: 46, y: 50 },
                { role: 'RCM', x: 52, y: 66 },
                { role: 'RM', x: 58, y: 82 },
                { role: 'LST', x: 82, y: 42 },
                { role: 'RST', x: 82, y: 58 }
            ]
        },
        //'5-4-1': { name: '5-4-1', positions: [ { role: 'GK', x: 4, y: 50 }, { role: 'LWB', x: 28, y: 18 }, { role: 'LCB', x: 24, y: 34 }, { role: 'CB', x: 20, y: 50 }, { role: 'RCB', x: 24, y: 66 }, { role: 'RWB', x: 28, y: 82 }, { role: 'LM', x: 56, y: 18 }, { role: 'LCM', x: 52, y: 36 }, { role: 'RCM', x: 52, y: 64 }, { role: 'RM', x: 56, y: 82 }, { role: 'ST', x: 86, y: 50 } ] },
        //'4-1-4-1': { name: '4-1-4-1', positions: [ { role: 'GK', x: 4, y: 50 }, { role: 'LB', x: 24, y: 18 }, { role: 'LCB', x: 20, y: 36 }, { role: 'RCB', x: 20, y: 64 }, { role: 'RB', x: 24, y: 82 }, { role: 'DM', x: 46, y: 50 }, { role: 'LM', x: 65, y: 18 }, { role: 'LCM', x: 65, y: 38 }, { role: 'RCM', x: 65, y: 62 }, { role: 'RM', x: 65, y: 82 }, { role: 'ST', x: 86, y: 50 } ] },
        '3-4-3': {
            name: '3-4-3',
            positions: [
                { role: 'GK', x: 4, y: 50 },
                { role: 'LCB', x: 27, y: 18 },
                { role: 'CB', x: 20, y: 50 },
                { role: 'RCB', x: 27, y: 82 },
                { role: 'LM', x: 50, y: 16 },
                { role: 'LCM', x: 50, y: 38 },
                { role: 'RCM', x: 50, y: 62 },
                { role: 'RM', x: 50, y: 84 },
                { role: 'LW', x: 76, y: 18 },
                { role: 'CF', x: 86, y: 50 },
                { role: 'RW', x: 76, y: 82 }
            ]
        }
    };

    team: TeamSheet = {
        coach: this.coachName ?? null,
        formationKey: '4-4-2',
        positions: [],
        substitutes: [],
        captainId: null
    };

    // UI lists (toujours initialisées)
    starters: Player[] = [];
    substitutes: Player[] = [];
    unselected: Player[] = [];

    // index de position sélectionnée pour ouverture du sélecteur
    selectedPositionIndex: number | null = null;

  // flag finalize
  finalized = false;

  // onglet actif
  activeTab: 'callup' | 'composition' | 'sheet' = 'composition';

  // formations populaires pour l'aperçu
  popularFormations: FormationPreview[] = [
    { key: '4-4-2', name: '4-4-2', lines: [1, 4, 4, 2] },
    { key: '4-3-3', name: '4-3-3', lines: [1, 4, 3, 3] },
    { key: '3-5-2', name: '3-5-2', lines: [1, 3, 5, 2] },
    { key: '3-4-3', name: '3-4-3', lines: [1, 3, 4, 3] }
  ];

  // État de la sidebar mobile
  isMobileSidebarOpen = false;

    constructor(private hostRef: ElementRef) {}

    ngOnInit(): void {
        if (!this.team.formationKey) this.team.formationKey = '4-4-2';
        this.resetPositionsToFormation(this.team.formationKey);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['availablePlayersData'] && this.availablePlayersData) {
            this.loadAvailablePlayers(this.availablePlayersData);
        }

        if (changes['coachName'] && this.coachName) {
            this.team.coach = this.coachName;
        }
    }

    private loadAvailablePlayers(api: any) {
        const list = api?.data?.available_players ?? api?.available_players ?? null;
        if (!Array.isArray(list)) {
            console.warn('availablePlayersData mal formatté', api);
            this.roster = [];
            this.unselected = [];
            return;
        }

    this.roster = list.map((p: any) => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      name: p.name ?? (p.first_name ? `${p.first_name} ${p.last_name ?? ''}`.trim() : undefined),
      jersey_number: p.jersey_number,
      preferred_position: p.preferred_position,
      status: p.status,
      photo_url: p.photo_url,
      birth_place: p.birth_place,
      nationality: p.nationality,
      phone: p.phone,
      email: p.email,
      date_of_birth: p.date_of_birth,
      height: p.height,
      weight: p.weight,
      blood_type: p.blood_type,
      foot_preference: p.foot_preference,
      license_number: p.license_number
    }));

    // reset UI lists but keep team.positions coords intact
    this.starters = [];
    this.substitutes = [];
    this.unselected = this.roster.slice();
    this.team.substitutes = [];
    this.team.captainId = null;
    this.finalized = false;
    
    // Synchroniser les listes
    this.syncLists();
  }

    get formationKeys(): string[] {
        return Object.keys(this.formations);
    }

    resetPositionsToFormation(key?: string) {
        const k = key ?? this.team.formationKey;
        if (!k) return;
        const f = this.formations[k];
        if (!f) return;
        this.team.positions = f.positions.map((pos) => ({
            playerId: undefined,
            x: pos.x,
            y: pos.y,
            role: pos.role
        }));
    }

  applyFormation(key?: string) {
    if (!key) return;
    this.team.formationKey = key;
    this.resetPositionsToFormation(key);
    // Synchroniser les listes après changement de formation
    this.syncLists();
  }

    // ---- methods demanded by template ----

    openSelect(index: number) {
        this.selectedPositionIndex = index;
    }

  assignPlayerToPosition(playerId: string) {
    if (this.selectedPositionIndex === null) return;
    
    // remove player from other positions / lists
    this.team.positions.forEach(p => { if (p.playerId === playerId) p.playerId = undefined; });
    this.team.substitutes = this.team.substitutes.filter(id => id !== playerId);
    this.removeFromAllLists(playerId);

        // assign to selected position
        this.team.positions[this.selectedPositionIndex].playerId = playerId;

        // ensure starters list contains the player
        const pl = this.getPlayer(playerId);
        if (pl && !this.starters.find((s) => s.id === playerId)) {
            this.starters.push(pl);
        }

        // remove from unselected & substitutes UI
        this.unselected = this.unselected.filter((p) => p.id !== playerId);
        this.substitutes = this.substitutes.filter((p) => p.id !== playerId);

        // close selector
        this.selectedPositionIndex = null;
    }

    selectedRoleLabel(): string {
        if (this.selectedPositionIndex === null) return '';
        const pos = this.team.positions[this.selectedPositionIndex];
        return pos ? (pos.role ?? '') : '';
    }

    pickAsStarter(playerId: string) {
        if (!playerId) return;
        const player = this.getPlayer(playerId);
        if (!player) return;
        if (this.starters.find((p) => p.id === playerId)) return;

        if (this.starters.length >= 11) {
            return;
        }

        // assign to first empty position
        const firstEmpty = this.team.positions.findIndex((pos) => !pos.playerId);
        const idx = firstEmpty >= 0 ? firstEmpty : 0;

        // cleanup
        this.removeFromAllLists(playerId);
        this.team.positions.forEach((p) => {
            if (p.playerId === playerId) p.playerId = undefined;
        });

        this.team.positions[idx].playerId = playerId;
        this.starters.push(player);
        this.unselected = this.unselected.filter((p) => p.id !== playerId);
    }

    addAsSubstitute(playerId: string) {
        if (!playerId) return;
        const player = this.getPlayer(playerId);
        if (!player) return;
        if (this.substitutes.find((p) => p.id === playerId)) return;

        this.removeFromAllLists(playerId);
        this.team.positions.forEach((p) => {
            if (p.playerId === playerId) p.playerId = undefined;
        });

        this.substitutes.push(player);
        if (!this.team.substitutes.includes(playerId)) this.team.substitutes.push(playerId);
        this.unselected = this.unselected.filter((p) => p.id !== playerId);
    }

    removeFromSubstitutes(playerId: string) {
        if (!playerId) return;
        this.substitutes = this.substitutes.filter((p) => p.id !== playerId);
        this.team.substitutes = this.team.substitutes.filter((id) => id !== playerId);
        const pl = this.getPlayer(playerId);
        if (pl && !this.unselected.find((p) => p.id === playerId)) this.unselected.push(pl);
        if (this.team.captainId === playerId) this.team.captainId = null;
    }

  private removeFromAllLists(playerId: string) {
    this.starters = this.starters.filter(p => p.id !== playerId);
    this.substitutes = this.substitutes.filter(p => p.id !== playerId);
    this.unselected = this.unselected.filter(p => p.id !== playerId);
    this.team.substitutes = this.team.substitutes.filter(id => id !== playerId);
    if (this.team.captainId === playerId) this.team.captainId = null;
  }

  private syncLists() {
    // Reconstruire les listes à partir de l'état actuel
    const assignedPlayerIds = new Set<string>();
    
    // Collecter les joueurs assignés sur le terrain
    this.team.positions.forEach(pos => {
      if (pos.playerId) {
        assignedPlayerIds.add(pos.playerId);
      }
    });
    
    // Collecter les remplaçants
    this.team.substitutes.forEach(id => {
      assignedPlayerIds.add(id);
    });
    
    // Reconstruire la liste des titulaires
    this.starters = this.team.positions
      .filter(pos => pos.playerId)
      .map(pos => this.getPlayer(pos.playerId!))
      .filter(p => p) as Player[];
    
    // Reconstruire la liste des remplaçants
    this.substitutes = this.team.substitutes
      .map(id => this.getPlayer(id))
      .filter(p => p) as Player[];
    
    // Reconstruire la liste des non sélectionnés
    this.unselected = this.roster.filter(player => 
      !assignedPlayerIds.has(player.id)
    );
  }

    // drag/drop handler (used if you re-enable cdk lists)
    onDrop(event: CdkDragDrop<Player[]>, listName: 'starters' | 'substitutes' | 'unselected') {
        const prevList = event.previousContainer.data;
        const curList = event.container.data;

        if (event.previousContainer === event.container) {
            return;
        }

        const player = prevList[event.previousIndex];
        if (!player) return;
        if (curList.find((p) => p.id === player.id)) return;

        transferArrayItem(prevList, curList, event.previousIndex, event.currentIndex);

        // sync team model depending on destination
        if (listName === 'starters') {
            const firstEmpty = this.team.positions.findIndex((pp) => !pp.playerId);
            const idx = firstEmpty >= 0 ? firstEmpty : 0;
            this.team.positions.forEach((p) => {
                if (p.playerId === player.id) p.playerId = undefined;
            });
            this.team.positions[idx].playerId = player.id;
            this.team.substitutes = this.team.substitutes.filter((id) => id !== player.id);
        } else if (listName === 'substitutes') {
            if (!this.team.substitutes.includes(player.id)) this.team.substitutes.push(player.id);
            this.team.positions.forEach((p) => {
                if (p.playerId === player.id) p.playerId = undefined;
            });
        } else if (listName === 'unselected') {
            this.team.substitutes = this.team.substitutes.filter((id) => id !== player.id);
            this.team.positions.forEach((p) => {
                if (p.playerId === player.id) p.playerId = undefined;
            });
        }
    }

    // get player by id
    getPlayer(playerId?: string): Player | undefined {
        if (!playerId) return undefined;
        return this.roster.find((r) => r.id === playerId);
    }

    // style helper for template (do not change x/y here)
    playerStyle(p: Placed) {
        return {
            left: `calc(${p.x}%)`,
            top: `calc(${p.y}%)`
        };
    }

    // assign first 11 from roster to starters (auto-fill)
    autoFillFirst11() {
        const first11 = this.roster.slice(0, 11);
        for (let i = 0; i < this.team.positions.length && i < first11.length; i++) {
            this.team.positions[i].playerId = first11[i].id;
        }
        this.starters = first11.slice();
        this.substitutes = this.roster.slice(11);
        this.team.substitutes = this.substitutes.map((s) => s.id);
        this.unselected = this.roster.filter((r) => !this.starters.find((s) => s.id === r.id) && !this.substitutes.find((s) => s.id === r.id));
        // keep captain only if still in starters
        this.team.captainId = this.team.captainId && this.starters.find((s) => s.id === this.team.captainId) ? this.team.captainId : null;
    }

    resetComposition() {
        this.starters = [];
        this.substitutes = [];
        this.unselected = this.roster.slice();
        this.team.substitutes = [];
        this.team.positions.forEach((pos) => (pos.playerId = undefined));
        this.team.captainId = null;
        this.finalized = false;
    }

    canFinalize(): boolean {
        const captainOk = !!this.team.captainId && this.starters.some((s) => s.id === this.team.captainId);
        return this.starters.length === 11 && captainOk;
    }

    finalizeComposition() {
        if (!this.canFinalize()) {
            return;
        }
        const payload = this.getFinalPayload();
        this.finalized = true;
    }

    // helper: map a position/role string (ex: "GK", "CB", "ST") to API allowed categories
  private mapRoleToApiCategory(role?: string | null): 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK' {
    if (!role) return 'MIDFIELD';
    const r = role.toUpperCase();

    // Positions basées sur votre liste: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST']
    const gks = ['GK', 'GOALKEEPER'];
    const defs = ['CB', 'LB', 'RB', 'LCB', 'RCB', 'LWB', 'RWB', 'WB', 'DEF', 'DEFENSE'];
    const mids = ['CDM', 'CM', 'CAM', 'LM', 'RM', 'RCM', 'LCM', 'DM', 'MID', 'MIDFIELD'];
    const atks = ['ST', 'CF', 'LW', 'RW', 'LS', 'RS', 'FW', 'ATT', 'ATTACK'];

    if (gks.includes(r)) return 'GOALKEEPER';
    if (defs.includes(r)) return 'DEFENSE';
    if (mids.includes(r)) return 'MIDFIELD';
    if (atks.includes(r)) return 'ATTACK';
    // fallback sensible
    return 'MIDFIELD';
  }

  // Mapper les positions spécifiques vers des catégories pour le filtrage intelligent
  private mapSpecificPositionToCategory(position?: string | null): 'GK' | 'DEF' | 'MID' | 'ATT' {
    if (!position) return 'MID';
    const pos = position.toUpperCase();

    if (pos === 'GK') return 'GK';
    if (['CB', 'LB', 'RB'].includes(pos)) return 'DEF';
    if (['CDM', 'CM', 'CAM'].includes(pos)) return 'MID';
    if (['LW', 'RW', 'ST'].includes(pos)) return 'ATT';
    
    return 'MID'; // fallback
  }

    getFinalPayload(): any {
        // Build players in positional order (keep placeholders when no player assigned)
        const playersPayload: any[] = [];

        // 1) titulaires based on positions array (preserves order)
        for (const pos of this.team.positions) {
            const pid = pos.playerId ?? null;
            const pl = pid ? this.getPlayer(pid) : undefined;

      // map role -> API allowed position category
      const apiPosition = this.mapRoleToApiCategory(pos.role ?? (pl?.preferred_position ?? null));

      playersPayload.push({
        player_id: pid, // string or null (parent should fill or validation will fail server-side)
        jersey_number: pl ? (pl.jersey_number ?? null) : null,
        position: apiPosition,
        is_starter: !!pid,
        substitute_order: null // starters have null substitute_order
      });
    }

    // 2) substitutes appended after positions (keeps their substitute order)
    const subs = (this.team.substitutes || []).slice();
    for (let i = 0; i < subs.length; i++) {
      const id = subs[i];
      const pl = this.getPlayer(id);
      const apiPosition = this.mapRoleToApiCategory(pl?.preferred_position ?? null);

      playersPayload.push({
        player_id: id ?? null,
        jersey_number: pl ? (pl.jersey_number ?? null) : null,
        position: apiPosition,
        is_starter: false,
        substitute_order: i + 1
      });
    }

        // Count how many real assigned players we have (player_id !== null)
        const assignedCount = playersPayload.filter((p) => p.player_id).length;

        // If fewer than 11 assigned players, do NOT send players array (API requires >=11 if present).
        const playersField = assignedCount >= 11 ? playersPayload : null;

        // Validate formation: only allow the accepted set, otherwise null
        const allowedFormations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '3-4-3'];
        const formation = this.team.formationKey && allowedFormations.includes(this.team.formationKey) ? this.team.formationKey : null;

        return {
            // parent is responsible to fill match_id and team_id (they are required by API on creation)
            match_id: null,
            team_id: null,
            coach_id: this.team.coach ?? null,
            formation: formation,
            captain_id: this.team.captainId ?? null,
            finalize: this.finalized ?? null,
            players: playersField
        };
    }

    // photo fallback
    playerInitials(player?: Player): string {
        if (!player) return '?';
        const n = (player.name || `${player.first_name ?? ''} ${player.last_name ?? ''}`).trim();
        if (!n) return (player.id || '?').slice(0, 2).toUpperCase();
        const parts = n.split(/\s+/);
        const first = parts[0]?.charAt(0) ?? '';
        const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
        return (first + last).toUpperCase();
    }

    onPhotoError(event: Event) {
        const img = event.target as HTMLImageElement;
        if (!img) return;
        const fallback = 'assets/images/football-player.png';
        if (img.src && !img.src.endsWith(fallback)) img.src = fallback;
    }

    save() {
        // build payload
        const payload = this.getFinalPayload();

        // clone profond simple pour éviter mutation par référence
        const clone = JSON.parse(JSON.stringify(payload));

        // log local

        // émet vers le composant parent pour qu'il complète et appelle l'endpoint
        this.saveSheet.emit(clone);

        // feedback UI
    }

    async exportPdf() {
        try {
            const pitchEl = this.pitchContainer?.nativeElement;
            if (!pitchEl) {
                return;
            }
            const canvas = await html2canvas(pitchEl as HTMLElement, { scale: 2, useCORS: true } as any);
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const imgW = pageW * 0.62;
            const imgH = imgW / (canvas.width / canvas.height);
            pdf.addImage(imgData, 'PNG', 10, 10, imgW, imgH);

            const infoX = imgW + 15;
            let y = 14;
            pdf.setFontSize(14);
            pdf.setTextColor(17, 24, 39);
            pdf.text(this.teamName ?? 'Équipe', infoX, y);
            y += 8;
            pdf.setFontSize(11);
            pdf.text(`Sélectionneur: ${this.team.coach ?? '-'}`, infoX, y);
            y += 8;
            pdf.text(`Formation: ${this.team.formationKey ?? '-'}`, infoX, y);
            y += 12;

      pdf.setFontSize(12);
      pdf.text('Titulaires:', infoX, y);
      y += 7;
      pdf.setFontSize(10);
      this.team.positions.forEach(pos => {
        const p = this.getPlayer(pos.playerId);
        const label = `${(p?.jersey_number ?? '-') } ${p?.name ?? (p?.first_name ? (p.first_name + ' ' + p.last_name) : '(vide)')} ${pos.role ? '- ' + pos.role : ''}`;
        pdf.text(label, infoX, y);
        y += 6;
      });

      y += 6;
      pdf.setFontSize(12);
      pdf.text('Remplaçants:', infoX, y);
      y += 7;
      pdf.setFontSize(10);
      (this.team.substitutes || []).forEach((id, idx) => {
        const p = this.getPlayer(id);
        const label = ` ${p?.jersey_number ?? '-'} ${p?.name ?? id}`;
        pdf.text(label, infoX, y);
        y += 6;
      });

            pdf.save('feuille_de_match.pdf');
        } catch (err) {
            console.error(err);
        }
    }

  closePanel() {
    this.close.emit();
  }

  getRecommendedPlayersForPosition(): Player[] {
    if (this.selectedPositionIndex === null) return [];
    
    const selectedPosition = this.team.positions[this.selectedPositionIndex];
    if (!selectedPosition?.role) return [];
    
    // Mapper le rôle du terrain vers une catégorie
    const targetCategory = this.mapSpecificPositionToCategory(selectedPosition.role);
    
    return this.roster.filter(player => {
      // Ne pas inclure les joueurs déjà assignés
      const isAlreadyAssigned = this.team.positions.some(pos => pos.playerId === player.id) ||
                               this.team.substitutes.includes(player.id);
      
      if (isAlreadyAssigned) return false;
      
      // Vérifier si le joueur correspond au poste
      const playerCategory = this.mapSpecificPositionToCategory(player.preferred_position);
      
      // Logique de recommandation plus flexible
      if (targetCategory === 'GK') {
        // Pour gardien, seulement les gardiens
        return playerCategory === 'GK';
      } else if (targetCategory === 'DEF') {
        // Pour défense, défenseurs en priorité, mais accepter milieux défensifs
        return playerCategory === 'DEF' || (playerCategory === 'MID' && player.preferred_position === 'CDM');
      } else if (targetCategory === 'MID') {
        // Pour milieu, tous les milieux
        return playerCategory === 'MID';
      } else if (targetCategory === 'ATT') {
        // Pour attaque, attaquants et milieux offensifs
        return playerCategory === 'ATT' || (playerCategory === 'MID' && player.preferred_position === 'CAM');
      }
      
      return false;
    });
  }

  getOtherAvailablePlayers(): Player[] {
    if (this.selectedPositionIndex === null) return [];
    
    const recommendedIds = this.getRecommendedPlayersForPosition().map(p => p.id);
    
    return this.roster.filter(player => {
      // Ne pas inclure les joueurs déjà assignés
      const isAlreadyAssigned = this.team.positions.some(pos => pos.playerId === player.id) ||
                               this.team.substitutes.includes(player.id);
      
      // Ne pas inclure les joueurs recommandés (déjà affichés dans la section recommandée)
      const isRecommended = recommendedIds.includes(player.id);
      
      return !isAlreadyAssigned && !isRecommended;
    });
  }

  getPositionLabel(position?: string): string {
    if (!position) return 'Non défini';
    
    const positionLabels: { [key: string]: string } = {
      'GK': 'Gardien',
      'CB': 'Défenseur central',
      'LB': 'Arrière gauche',
      'RB': 'Arrière droit',
      'CDM': 'Milieu défensif',
      'CM': 'Milieu central',
      'CAM': 'Milieu offensif',
      'LW': 'Ailier gauche',
      'RW': 'Ailier droit',
      'ST': 'Attaquant',
      // Positions étendues pour compatibilité
      'LCB': 'Défenseur central gauche',
      'RCB': 'Défenseur central droit',
      'LWB': 'Piston gauche',
      'RWB': 'Piston droit',
      'LM': 'Milieu gauche',
      'RM': 'Milieu droit',
      'CF': 'Avant-centre',
      'LF': 'Attaquant gauche',
      'RF': 'Attaquant droit'
    };
    
    return positionLabels[position.toUpperCase()] || position;
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'Non défini';
    
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'Actif';
      case 'INACTIVE':
        return 'Inactif';
      case 'SUSPENDED':
        return 'Suspendu';
      case 'INJURED':
        return 'Blessé';
      default:
        return status;
    }
  }

  getPositionDropData(index: number): Player[] {
    const pos = this.team.positions[index];
    const player = pos?.playerId ? this.getPlayer(pos.playerId) : null;
    return player ? [player] : [];
  }

  // Nouvelles méthodes pour la nouvelle interface
  
  setActiveTab(tab: 'callup' | 'composition' | 'sheet') {
    this.activeTab = tab;
  }

  getPopularFormations(): FormationPreview[] {
    return this.popularFormations;
  }

  getDots(count: number): number[] {
    return Array(count).fill(0);
  }

  getPlayerName(player: Player): string {
    if (player.name) return player.name;
    if (player.first_name) {
      return `${player.first_name} ${player.last_name || ''}`.trim();
    }
    return player.id || 'Joueur';
  }

  getShortName(player: Player): string {
    const fullName = this.getPlayerName(player);
    const parts = fullName.split(' ');
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0].charAt(0)}. ${parts[1]}`;
    return `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
  }

  getStartersCount(): number {
    return this.team.positions.filter(pos => pos.playerId).length;
  }

  openPlayerSelector(index: number) {
    this.selectedPositionIndex = index;
  }

  closePlayerSelector() {
    this.selectedPositionIndex = null;
  }

  onPlayerDropped(event: CdkDragDrop<any>, positionIndex: number) {
    if (event.previousContainer !== event.container) {
      // Récupérer le joueur depuis le container précédent
      let player: Player | undefined;
      
      if (Array.isArray(event.previousContainer.data)) {
        player = event.previousContainer.data[event.previousIndex] as Player;
      }
      
      if (player) {
        // Nettoyer complètement le joueur de toutes les positions et listes
        this.removeFromAllLists(player.id);
        this.team.positions.forEach(pos => {
          if (pos.playerId === player.id) pos.playerId = undefined;
        });
        
        // Assigner à la nouvelle position
        this.team.positions[positionIndex].playerId = player.id;
        
        // Ajouter aux titulaires si pas déjà présent
        if (!this.starters.find(s => s.id === player.id)) {
          this.starters.push(player);
        }
        
        // Synchroniser les listes
        this.syncLists();
      }
    } else {
      // Déplacement au sein de la même position (ne rien faire)
      return;
    }
  }

  onPlayerListDrop(event: CdkDragDrop<Player[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Joueur déplacé depuis le terrain ou les remplaçants vers la liste disponible
      const player = event.previousContainer.data[event.previousIndex] as Player;
      if (player) {
        // Nettoyer complètement le joueur
        this.removeFromAllLists(player.id);
        this.team.positions.forEach(pos => {
          if (pos.playerId === player.id) pos.playerId = undefined;
        });
        
        // Ajouter à la liste des non sélectionnés
        if (!this.unselected.find(p => p.id === player.id)) {
          this.unselected.push(player);
        }
        
        // Synchroniser les listes
        this.syncLists();
      }
    }
  }

  onSubstitutesDrop(event: CdkDragDrop<Player[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // Mettre à jour l'ordre des remplaçants
      this.team.substitutes = this.substitutes.map(s => s.id);
    } else {
      // Joueur déplacé depuis une autre liste vers les remplaçants
      const player = event.previousContainer.data[event.previousIndex] as Player;
      if (player && !this.substitutes.find(s => s.id === player.id)) {
        // Nettoyer le joueur de toutes les autres positions
        this.removeFromAllLists(player.id);
        this.team.positions.forEach(pos => {
          if (pos.playerId === player.id) pos.playerId = undefined;
        });
        
        // Ajouter aux remplaçants
        this.substitutes.push(player);
        this.team.substitutes.push(player.id);
        
        // Synchroniser les listes
        this.syncLists();
      }
    }
  }

  // Toggle de la sidebar mobile
  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  // Récupérer tous les IDs des positions pour connecter les drop lists
  getPositionIds(): string[] {
    return this.team.positions.map((_, index) => `position-${index}`);
  }
}
