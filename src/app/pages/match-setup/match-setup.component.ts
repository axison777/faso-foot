import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CallupService } from '../../service/callup.service';
import { OfficialService } from '../../service/official.service';
import { MessageService } from 'primeng/api';
import { Official } from '../../models/official.model';
import { SelectModule } from 'primeng/select';

type OfficialRole = 'MAIN_REFEREE' | 'ASSISTANT_1' | 'ASSISTANT_2' | 'COMMISSIONER';
interface Assignment {
  role: OfficialRole;
  officialId?: number | null;
}

interface PlayerPoolItem {
  id: number;
  teamId?: number;
  first_name: string;
  last_name: string;
  position: string;
  selected?: boolean;
  photo_url?: string;
  selectionOrder?: number | null; // ✅ Ajoute cette ligne
}

interface TeamPlayerSelection {
  playerId: number;
  jerseyNumber: number;
  position: 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK';
  isStarter: boolean;
  substituteOrder?: number | null;
}

interface TeamSetup {
  teamId: number;
  coachId: number | null;
  formation: '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '3-4-3';
  captainId: number | null;
  players: TeamPlayerSelection[];
}

@Component({
  selector: 'app-match-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './match-setup.component.html',
  styleUrls: ['./match-setup.component.scss']
})
export class MatchSetupComponent implements OnInit {

  matchId!: string;
  match: any;
  callupId: number | string | null = null;
  activeTab: 'officials' | 'teams' = 'officials';
  isClosed = false;
  officials: Official[] = [];
  officialsofmatch: Official[] = [];

  selectedOfficialId: string | null = null;
  selectedRole: string | null = null;

  // Rôles possibles
  roles = [
    { label: 'Arbitre Principal', value: 'MAIN_REFEREE' },
    { label: 'Assistant 1', value: 'ASSISTANT_1' },
    { label: 'Assistant 2', value: 'ASSISTANT_2' },
    { label: 'Commissaire', value: 'COMMISSIONER' },
  ];

  // Teams
  homeTeam: any = { id: null, name: '', logo: '', players: [] };
  awayTeam: any = { id: null, name: '', logo: '', players: [] };

  // Pools
  homePlayersPool: PlayerPoolItem[] = [];
  awayPlayersPool: PlayerPoolItem[] = [];

  // Team callups (internal normalized shape)
  homeCallup: TeamSetup = { teamId: 0, formation: '4-4-2', players: [], coachId: null, captainId: null };
  awayCallup: TeamSetup = { teamId: 0, formation: '4-3-3', players: [], coachId: null, captainId: null };

  // coaches (mock / optional - can be filled from API)
  homeCoaches: { id: number; name: string }[] = [];
  awayCoaches: { id: number; name: string }[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private callupService: CallupService,
    private officialService: OfficialService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('id') ?? '';
    // Récupérer l'objet match depuis l'état de navigation
    this.match = history.state.match;

    if (!this.match) {
      console.warn('Aucun match reçu, redirection...');
      this.router.navigate(['/saisons']);
      return;
    }

    // Hydrater les équipes
    this.homeTeam = {
      id: this.match.team1_id,
      name: this.match.team1,
      logo: this.match.team1_logo,
      players: []
    };

    this.awayTeam = {
      id: this.match.team2_id,
      name: this.match.team2,
      logo: this.match.team2_logo,
      players: []
    };

    // Charger les joueurs des deux équipes
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
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          position: this.mapPreferredPosition(p.preferred_position),
          selected: false,
          selectionOrder: null,  // 🆕 On initialise ici
          photo_url: p.photo_url ?? null
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

    return 'MIDFIELD'; // par défaut si inconnu
  }


  // ---------- load ----------
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
        // Optionnel : notifier l'utilisateur ou rafraîchir la liste des officiels assignés
      },
      error: (error) => {
        console.error('Erreur lors de l\'assignation', error);
        // Optionnel : afficher une notification d'erreur
      }
    });
  }


  // ---------- helpers used by template ----------
  setTab(tab: 'officials' | 'teams') { this.activeTab = tab; }

  // ---------- team / players ----------
  isPlayerSelected(teamKey: 'home' | 'away', playerId: number): boolean {
    const t = teamKey === 'home' ? this.homeCallup : this.awayCallup;
    return !!t.players.find(p => p.playerId === playerId);
  }

  // --- remplacer onPlayerToggle par ceci ---
onPlayerToggle(side: 'home' | 'away', player: PlayerPoolItem, selected: boolean) {
  const pool = side === 'home' ? this.homePlayersPool : this.awayPlayersPool;
  const callup = side === 'home' ? this.homeCallup : this.awayCallup;

  if (selected) {
    // p.selected a déjà été mis à jour par ngModel avant l'appel ici
    // Calculer le prochain ordre (nombre de sélectionnés après le changement)
    const nextOrder = pool.filter(p => p.selected).length;
    player.selectionOrder = nextOrder;

    // push dans la liste canonique si pas déjà présent
    if (!callup.players.some(tp => tp.playerId === player.id)) {
      callup.players.push({
        playerId: player.id,
        jerseyNumber: 0, // défaut 0, modifiable via l'UI
        position: player.position as 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK',
        isStarter: (nextOrder <= 11),
        substituteOrder: nextOrder > 11 ? (nextOrder - 11) : null
      });
    } else {
      // si déjà présent (sécurité), on met à jour ses flags
      const tp = callup.players.find(tp => tp.playerId === player.id)!;
      tp.isStarter = nextOrder <= 11;
      tp.substituteOrder = nextOrder > 11 ? (nextOrder - 11) : null;
    }
  } else {
    // décocher -> retire du callup et réordonne la sélection
    callup.players = callup.players.filter(tp => tp.playerId !== player.id);
    player.selectionOrder = null;

    this.reorderAfterRemoval(pool, callup);
  }
}

// --- utilitaire pour réordonner après suppression ---
private reorderAfterRemoval(pool: PlayerPoolItem[], callup: TeamSetup) {
  // recalcule les selectionOrder en séquentiel pour les joueurs encore sélectionnés
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

  getTeamPlayer(side: 'home' | 'away', playerId: number) {
    const callup = side === 'home' ? this.homeCallup : this.awayCallup;
    return callup.players.find(p => p.playerId === playerId);
  }


  onStarterChange(teamKey: 'home' | 'away', playerId: number, desired: boolean) {
    const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;
    const sel = team.players.find(p => p.playerId === playerId);
    if (!sel) return;

    if (desired) {
      const starters = team.players.filter(p => p.isStarter).length;
      if (!sel.isStarter && starters >= 11) {
        window.alert('Nombre maximum de titulaires atteint (11).');
        // revert
        sel.isStarter = false;
        return;
      }
      sel.isStarter = true;
      sel.substituteOrder = null;
    } else {
      sel.isStarter = false;
    }
  }

  updateSubOrder(teamKey: 'home' | 'away', playerId: number, order: number | null) {
    const sel = this.getTeamPlayer(teamKey, playerId);
    if (sel) sel.substituteOrder = order ?? null;
  }

  setCoach(teamKey: 'home' | 'away', coachId: number | null | undefined) {
    const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;
    team.coachId = coachId ?? null;
  }

  setCaptain(teamKey: 'home' | 'away', captainId: number | null | undefined) {
    const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;
    if (captainId == null) { team.captainId = null; return; }
    if (!team.players.some(p => p.playerId === captainId)) {
      window.alert('Le capitaine doit être sélectionné dans la liste des joueurs.');
      return;
    }
    team.captainId = captainId;
  }

  getPlayerName(teamKey: 'home' | 'away', playerId: number): string {
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


  // ---------- payload & API ----------
  private makeTeamPayload(team: TeamSetup) {
    return {
      match_id: this.matchId,
      team_id: team.teamId,
      coach_id: team.coachId,
      formation: team.formation,
      captain_id: team.captainId,
      finalize: false,
      players: team.players.map(p => ({
        player_id: p.playerId,
        jersey_number: p.jerseyNumber,
        position: p.position,
        is_starter: p.isStarter,
        substitute_order: p.substituteOrder ?? null,
      }))
    };
  }


  saveCallup(teamKey: 'home' | 'away') {
    const team = teamKey === 'home' ? this.homeCallup : this.awayCallup;

    /* if (!team.coachId) {
      window.alert('Un coach est obligatoire.');
      return;
    } */

    if (team.players.filter(p => p.isStarter).length < 11) {
      window.alert('Il faut au moins 11 titulaires.');
      return;
    }

    const payload = this.makeTeamPayload(team);
      console.log('Payload envoyé à createCallup:', payload);

    this.callupService.createCallup(payload).subscribe({
      next: () => window.alert('Composition sauvegardée.'),
      error: (err) => {
        console.error('Erreur saveCallup', err);
        window.alert('Erreur lors de la sauvegarde.');
      }
    });
  }

}
