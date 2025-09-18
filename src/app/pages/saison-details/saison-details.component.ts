import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';


interface Match {
  team1: string;
  team2: string;
  stadium: string;
  match_date: string;
  time: string;
  team1_logo: string;
  team2_logo: string;
}

interface Matchday {
  label: string;
  matches: Match[];
}

interface Phase {
  name: string;
  matchdays: Matchday[];
}

type PhaseKey = 'first_leg' | 'second_leg';

interface Pool {
  id: string;
  name: string;
  logo: string;
  phases: Record<PhaseKey, Phase>;
}

interface Ranking {
  position: number;
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
}

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  pools: Pool[];
  rankings: Ranking[];
}

@Component({
  selector: 'app-saison-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabViewModule,
    TableModule,
    SelectModule,
    CardModule,
    AccordionModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  templateUrl: './saison-details.component.html',
  styleUrls: ['./saison-details.component.scss']
})
export class SaisonDetailsComponent {
  activeIndex = 0;

  season: Season = {
    id: 'bd9e2773-aeeb-476e-aa9a-2221ad6b8a7c',
    name: 'Ligue 1',
    start_date: '2025-08-12',
    end_date: '2026-01-30',
    pools: [
      {
        id: 'poolA',
        name: 'Poule A',
        logo: 'assets/logoA.png',
        phases: {
          first_leg: {
            name: 'Phase Aller',
            matchdays: [
              {
                label: '1ère Journée',
                matches: [
                  { team1: 'VITESSE FC', team2: 'ASFB', stadium: "Stade de l'USFRAN", match_date: '17/08/2025', time: '16:00', team1_logo: '', team2_logo: '' },
                  { team1: 'ASD', team2: 'MAJESTIC SC', stadium: "Stade de l'Université", match_date: '17/08/2025', time: '16:00', team1_logo: '', team2_logo: '' }
                ]
              },
              {
                label: '2e Journée',
                matches: [
                  { team1: 'MAJESTIC SC', team2: 'VITESSE FC', stadium: 'Stade de Kossodo', match_date: '20/08/2025', time: '16:00', team1_logo: '', team2_logo: '' },
                  { team1: 'ASD', team2: 'ASECK', stadium: 'Stade Municipal', match_date: '20/08/2025', time: '16:00', team1_logo: '', team2_logo: '' }
                ]
              }
            ]
          },
          second_leg: {
            name: 'Phase Retour',
            matchdays: [
              {
                label: '1ère Journée Retour',
                matches: [
                  { team1: 'ASFB', team2: 'VITESSE FC', stadium: "Stade de l'USFRAN", match_date: '05/01/2026', time: '16:00', team1_logo: '', team2_logo: '' }
                ]
              }
            ]
          }
        }
      }
    ],
    rankings: [
      { position: 1, team: 'VITESSE FC', points: 12, played: 5, won: 4, drawn: 0, lost: 1 },
      { position: 2, team: 'MAJESTIC SC', points: 10, played: 5, won: 3, drawn: 1, lost: 1 },
      { position: 3, team: 'ASD', points: 6, played: 5, won: 2, drawn: 0, lost: 3 }
    ]
  };

  selectedPoolId = this.season.pools[0]?.id || null;
  selectedPhaseKey: PhaseKey = 'first_leg';

  getPoolsOptions() {
    return this.season.pools.map(p => ({ label: p.name, value: p.id }));
  }

  getPhasesOptions() {
    const pool = this.season.pools.find(p => p.id === this.selectedPoolId);
    return pool ? Object.entries(pool.phases).map(([key, val]) => ({ label: val.name, value: key })) : [];
  }

  getMatchdays() {
    const pool = this.season.pools.find(p => p.id === this.selectedPoolId);
    if (!pool) return [];
    const phase = pool.phases[this.selectedPhaseKey as PhaseKey];
    return phase?.matchdays || [];
  }

  getInitials(team: string): string {
  return team.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}

getTeamColor(team: string): string {
  // Retourne une couleur selon le hash du nom de l'équipe
  const colors = ['#565b55ff','#595245ff','#333841ff','#604f4fff','#6b6c86ff','#4b5d57ff'];
  let hash = 0;
  for(let i=0;i<team.length;i++){ hash = team.charCodeAt(i) + ((hash << 5) - hash); }
  return colors[Math.abs(hash) % colors.length];
}

}
