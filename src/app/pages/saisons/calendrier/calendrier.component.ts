import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';

interface Match {
  team1: string;
  team2: string;
  stadium: string;
  date: string;
  time: string;
}

interface Matchday {
  label: string;
  matches: Match[];
}

interface Phase {
  name: string;
  start: string;
  end: string;
  matchdays: Matchday[];
}

@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [CommonModule, CarouselModule, TabViewModule,TabsModule, ButtonModule],
  templateUrl: './calendrier.component.html',
  styleUrls: ['./calendrier.component.scss']
})
export class CalendrierComponent {
    selectedPhaseIndex = 0;

  phases: Phase[] = [
    {
      name: 'Phase Aller',
      start: '2025-08-12',
      end: '2026-06-30',
      matchdays: [
        {
          label: '1ère Journée',
          matches: [
            { team1: 'AS SONABEL', team2: 'SALITAS', stadium: 'Stade municipal Ouaga', date: '2025-08-12', time: '15:30' },
            { team1: 'RCK', team2: 'MAJESTIC', stadium: 'Stade du 4 août Ouaga', date: '2025-08-12', time: '15:30' },
            { team1: 'EFO', team2: 'USFA', stadium: 'Stade Wobi Bobo', date: '2025-08-12', time: '15:30' },
            { team1: 'KOZAF', team2: 'USO', stadium: 'Stade municipal Ouaga', date: '2025-08-12', time: '15:30' }
          ]
        },
        {
          label: '2e Journée',
          matches: [
            { team1: 'SALITAS', team2: 'RCK', stadium: 'Stade municipal Ouaga', date: '2025-08-19', time: '15:30' },
            { team1: 'AS SONABEL', team2: 'KOZAF', stadium: 'Stade du 4 août Ouaga', date: '2025-08-19', time: '15:30' },
            { team1: 'USO', team2: 'EFO', stadium: 'Stade Wobi Bobo', date: '2025-08-19', time: '15:30' },
            { team1: 'MAJESTIC', team2: 'USFA', stadium: 'Stade municipal Ouaga', date: '2025-08-19', time: '15:30' }
          ]
        },
        {
          label: '3e Journée',
          matches: [
            { team1: 'AS SONABEL', team2: 'EFO', stadium: 'Stade municipal Ouaga', date: '2025-08-26', time: '15:30' },
            { team1: 'RCK', team2: 'USO', stadium: 'Stade du 4 août Ouaga', date: '2025-08-26', time: '15:30' },
            { team1: 'USFA', team2: 'SALITAS', stadium: 'Stade Wobi Bobo', date: '2025-08-26', time: '15:30' },
            { team1: 'MAJESTIC', team2: 'KOZAF', stadium: 'Stade municipal Ouaga', date: '2025-08-26', time: '15:30' }
          ]
        },
        {
          label: '4e Journée',
          matches: [
            { team1: 'USFA', team2: 'AS SONABEL', stadium: 'Stade municipal Ouaga', date: '2025-09-02', time: '15:30' },
            { team1: 'SALITAS', team2: 'KOZAF', stadium: 'Stade Wobi Bobo', date: '2025-09-02', time: '15:30' },
            { team1: 'EFO', team2: 'MAJESTIC', stadium: 'Stade du 4 août Ouaga', date: '2025-09-02', time: '15:30' },
            { team1: 'USO', team2: 'RCK', stadium: 'Stade municipal Ouaga', date: '2025-09-02', time: '15:30' }
          ]
        },
        {
          label: '5e Journée',
          matches: [
            { team1: 'KOZAF', team2: 'AS SONABEL', stadium: 'Stade municipal Ouaga', date: '2025-09-09', time: '15:30' },
            { team1: 'USO', team2: 'SALITAS', stadium: 'Stade Wobi Bobo', date: '2025-09-09', time: '15:30' },
            { team1: 'EFO', team2: 'RCK', stadium: 'Stade du 4 août Ouaga', date: '2025-09-09', time: '15:30' },
            { team1: 'MAJESTIC', team2: 'USFA', stadium: 'Stade municipal Ouaga', date: '2025-09-09', time: '15:30' }
          ]
        },
          {
          label: '6e Journée',
          matches: [
            { team1: 'KOZAF', team2: 'AS SONABEL', stadium: 'Stade municipal Ouaga', date: '2025-09-09', time: '15:30' },
            { team1: 'USO', team2: 'SALITAS', stadium: 'Stade Wobi Bobo', date: '2025-09-09', time: '15:30' },
            { team1: 'EFO', team2: 'RCK', stadium: 'Stade du 4 août Ouaga', date: '2025-09-09', time: '15:30' },
            { team1: 'MAJESTIC', team2: 'USFA', stadium: 'Stade municipal Ouaga', date: '2025-09-09', time: '15:30' }
          ]
        }
      ]
    },
    {
      name: 'Phase Retour',
      start: '2026-01-12',
      end: '2026-06-30',
      matchdays: [] // Tu peux dupliquer ou générer dynamiquement plus tard
    }
  ];

    formatDate(dateStr: string): string {
      return formatDate(dateStr, 'dd/MM/yyyy', 'fr-FR');
    }
}
