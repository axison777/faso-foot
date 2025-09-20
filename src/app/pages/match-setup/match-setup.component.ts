import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CallupService } from '../../service/callup.service';
import { OfficialService } from '../../service/official.service';
import { MessageService } from 'primeng/api';
import { Official } from '../../models/official.model';
import { SelectModule } from 'primeng/select';
import { TabViewModule } from 'primeng/tabview';

type OfficialRole = 'MAIN_REFEREE' | 'ASSISTANT_1' | 'ASSISTANT_2' | 'COMMISSIONER';
interface Assignment {
  role: OfficialRole;
  officialId?: string | null; // ✅ string
}

interface PlayerPoolItem {
  id: string;               // ✅ string
  teamId?: string;          // ✅ string
  first_name: string;
  last_name: string;
  position: string;
  selected?: boolean;
  photo_url?: string;
  selectionOrder?: number | null;
  jersey_number?: number | null;
}

interface TeamPlayerSelection {
  playerId: string;         // ✅ string
  jersey_number: number | null;
  position: 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK';
  isStarter: boolean;
  substituteOrder?: number | null;
}

interface TeamSetup {
  teamId: string;           // ✅ string
  coachId: string | null;   // ✅ string
  formation: '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '3-4-3';
  captainId: string | null; // ✅ string
  players: TeamPlayerSelection[];
}

@Component({
  selector: 'app-match-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, TabViewModule],
  templateUrl: './match-setup.component.html',
  styleUrls: ['./match-setup.component.scss']
})
export class MatchSetupComponent implements OnInit {

  matchId!: string;
  match: any;
  callupId: string | null = null; // ✅ string
  activeTab: 'officials' | 'teams' = 'officials';
  isClosed = false;
  officials: Official[] = [];
  officialsofmatch: Official[] = [];

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
    { label: 'Commissaire', value: 'COMMISSIONER' },
  ];

  // Teams
  homeTeam: any = { id: null, name: '', logo: '', players: [] };
  awayTeam: any = { id: null, name: '', logo: '', players: [] };

  homePlayersPool: PlayerPoolItem[] = [];
  awayPlayersPool: PlayerPoolItem[] = [];

  homeCallup: TeamSetup = { teamId: '', formation: '4-4-2', players: [], coachId: null, captainId: null };
  awayCallup: TeamSetup = { teamId: '', formation: '4-3-3', players: [], coachId: null, captainId: null };

  homeCoaches: { id: string; name: string }[] = []; // ✅ string
  awayCoaches: { id: string; name: string }[] = []; // ✅ string

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private callupService: CallupService,
    private officialService: OfficialService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('id') ?? '';
    this.match = history.state.match;

    if (!this.match) {
      console.warn('Aucun match reçu, redirection...');
      this.router.navigate(['/saisons']);
      return;
    }

    this.homeTeam = {
      id: String(this.match.team1_id), // ✅ cast en string
      name: this.match.team1,
      logo: this.match.team1_logo,
      players: []
    };

    this.awayTeam = {
      id: String(this.match.team2_id), // ✅ cast en string
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
          id: String(p.id),                // ✅ string
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des officiels'
        });
      }
    });

    this.officialService.getOfficialsofMatch(this.matchId).subscribe({
      next: (res: any) => {
        this.officialsofmatch = res?.data?.officials || [];
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des officiels'
        });
      }
    });
  }

  assignOfficial() {
    if (!this.selectedOfficialId || !this.selectedRole) return;

    const payload = {
      official_id: this.selectedOfficialId,
      match_id: this.matchId,
      role: this.selectedRole,
    };

    this.officialService.assign(payload).subscribe({
      next: (response) => {
        console.log('Officiel assigné avec succès', response);
      },
      error: (error) => {
        console.error('Erreur lors de l\'assignation', error);
      }
    });
  }

  setTab(tab: 'officials' | 'teams') { this.activeTab = tab; }

  isPlayerSelected(teamKey: 'home' | 'away', playerId: string): boolean {
    const t = teamKey === 'home' ? this.homeCallup : this.awayCallup;
    return !!t.players.find(p => p.playerId === playerId);
  }

  onPlayerToggle(side: 'home' | 'away', player: PlayerPoolItem, selected: boolean) {
  const pool = side === 'home' ? this.homePlayersPool : this.awayPlayersPool;
  const callup = side === 'home' ? this.homeCallup : this.awayCallup;

  // nombre de joueurs sélectionnés *hors* le joueur courant
  const otherSelectedCount = pool.filter(p => p.selected && p.id !== player.id).length;

  if (selected) {
    // nouvelle sélection
    // nextOrder = nombre déjà sélectionnés hors courant + 1
    const nextOrder = otherSelectedCount + 1;
    player.selectionOrder = nextOrder;
    player.selected = true; // synchronise le modèle si appelé depuis parent click

    if (!callup.players.some(tp => tp.playerId === player.id)) {
      callup.players.push({
        playerId: player.id,
        jersey_number: player.jersey_number ?? null,
        position: player.position as 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK',
        isStarter: (nextOrder <= 11),
        substituteOrder: nextOrder > 11 ? (nextOrder - 11) : null
      });
    } else {
      const tp = callup.players.find(tp => tp.playerId === player.id)!;
      tp.isStarter = nextOrder <= 11;
      tp.substituteOrder = nextOrder > 11 ? (nextOrder - 11) : null;
    }
  } else {
    // désélection
    // si appelé depuis checkbox ngModelChange, p.selected a déjà été mis à false par ngModel
    // si appelé depuis parent click, on s'assure de mettre player.selected = false
    player.selected = false;
    callup.players = callup.players.filter(tp => tp.playerId !== player.id);
    player.selectionOrder = null;
    this.reorderAfterRemoval(pool, callup);
  }
}


  /** Cherche le jersey_number d'un joueur dans les pools (home/away) */
  private findPlayerNumberInPool(teamId: string, playerId: string): number | null {
    const pool = String(this.homeTeam.id) === String(teamId) ? this.homePlayersPool : this.awayPlayersPool;
    const p = pool.find(x => String(x.id) === String(playerId));
    return p ? (p.jersey_number ?? null) : null;
  }

  private reorderAfterRemoval(pool: PlayerPoolItem[], callup: TeamSetup) {
    const selected = pool
      .filter(p => p.selected)
      .sort((a, b) => (a.selectionOrder ?? 999) - (b.selectionOrder ?? 999));

    selected.forEach((p, idx) => {
      const newOrder = idx + 1;
      p.selectionOrder = newOrder;

      const tp = callup.players.find(x => x.playerId === p.id);
      if (tp) {
        tp.isStarter = newOrder <= 11;
        tp.substituteOrder = newOrder > 11 ? (newOrder - 11) : null;
      }
    });
  }

  getTeamPlayer(side: 'home' | 'away', playerId: string) {
    const callup = side === 'home' ? this.homeCallup : this.awayCallup;
    return callup.players.find(p => p.playerId === playerId);
  }

  onStarterChange(teamKey: 'home' | 'away', playerId: string, desired: boolean) {
    const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;
    const sel = team.players.find(p => p.playerId === playerId);
    if (!sel) return;

    if (desired) {
      const starters = team.players.filter(p => p.isStarter).length;
      if (!sel.isStarter && starters >= 11) {
        window.alert('Nombre maximum de titulaires atteint (11).');
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
    team.coachId = coachId ? String(coachId) : null; // assure null si vide
  }

  setCaptain(teamKey: 'home' | 'away', captainId: string | null | undefined) {
    const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;
    if (!captainId) { team.captainId = null; return; } // null si vide
    if (!team.players.some(p => p.playerId === captainId)) {
      window.alert('Le capitaine doit être sélectionné dans la liste des joueurs.');
      return;
    }
    team.captainId = String(captainId);
  }

  getPlayerName(teamKey: 'home' | 'away', playerId: string): string {
    const pool = teamKey === 'home' ? this.homePlayersPool : this.awayPlayersPool;
    const p = pool.find(x => x.id === playerId);
    return p ? `${p.first_name} ${p.last_name}` : 'Inconnu';
  }

  mapRole(role: string | null | undefined): string {
    switch (role) {
      case 'MAIN_REFEREE': return 'Arbitre Principal';
      case 'ASSISTANT_1': return 'Assistant 1';
      case 'ASSISTANT_2': return 'Assistant 2';
      case 'COMMISSIONER': return 'Commissaire';
      default: return role ?? 'Inconnu';
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

  saveCallup(teamKey: 'home' | 'away') {
    const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;

    if (!team.teamId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Identifiant de l\'équipe manquant.'
      });
      return;
    }

    if (team.players.filter(p => p.isStarter).length < 11) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Il faut au moins 11 titulaires.'
      });
      return;
    }

    const missingNumbers = team.players.filter(p => !p.jersey_number || p.jersey_number <= 0);
    if (missingNumbers.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: `Renseignez le numéro de maillot pour tous les joueurs sélectionnés (${missingNumbers.length} manquant(s)).`
      });
      return;
    }

    const payload = this.makeTeamPayload(team);
    console.log('Payload envoyé à createCallup:', payload);

    this.callupService.createCallup(payload).subscribe({
      next: () => this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: "Composition enregistrée",
        }),
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la sauvegarde.'
        });
      }
    });
  }

}
