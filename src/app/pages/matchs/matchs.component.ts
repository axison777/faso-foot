import { formatDate, NgClass, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../../service/match.service';
import { SaisonService } from '../../service/saison.service';
interface RawMatch {
  id: string;
  home_team: string;
  away_team: string;
  stadium: string;
  season: string;
  type: string;
  scheduled_at: string;
  match_date: string; // au format dd/mm/yyyy
  match_day: string;
}

interface Match {
  numero: number;
  stade: string;
  equipe1: string;
  equipe2: string;
  heure: string;
}

interface Journee {
  nom: string;
  jour: string;
  date: string;
  matchs: Match[];
}

interface Phase {
  phase: string;
  journees: Journee[];
}


@Component({
  selector: 'app-matchs',
  imports: [
    NgFor,

  ],
  templateUrl: './matchs.component.html',
  styleUrl: './matchs.component.scss'
})
export class MatchsComponent implements OnInit{
    saisonId!: string;
    phases: any[] = [];
    MATCHS_FAKE = [
  {
    phase: 'Aller',
    journees: [
      {
        nom: '1ère Journée',
        jour: 'Jeudi',
        date: '2024-11-14',
        matchs: [
          { numero: 1, stade: 'STADE WOBI', equipe1: 'KIKO FC', equipe2: 'BOBO SPORT', heure: '15H30' },
          { numero: 2, stade: 'KOUDOUGOU', equipe1: 'STAB FC', equipe2: 'ROYAL FC', heure: '15H30' },
          { numero: 3, stade: 'TEMA BOKIN', equipe1: 'TEMA BOKIN', equipe2: 'USY', heure: '15H30' },
          { numero: 4, stade: 'BANFORA', equipe1: 'AFFA', equipe2: 'AS MAYA', heure: '15H30' },
          { numero: 5, stade: 'OUAHIGOUYA', equipe1: 'AS ECO', equipe2: 'BPS', heure: '15H30' },
          { numero: 6, stade: 'SANGOULE L', equipe1: 'AJEB', equipe2: 'JCB', heure: '15H30' }
        ]
      },
      {
        nom: '2ème Journée',
        jour: 'Lundi',
        date: '2024-11-18',
        matchs: [
          { numero: 7, stade: 'STADE WOBI', equipe1: 'AJEB', equipe2: 'TEMA BOKIN', heure: '15H30' },
          { numero: 8, stade: 'TERRAIN BAMA', equipe1: 'ROYAL FC', equipe2: 'AFFA', heure: '15H30' },
          { numero: 9, stade: 'SANGOULE L', equipe1: 'BOBO SPORT', equipe2: 'STAB FC', heure: '15H30' },
          { numero: 10, stade: 'OUAHIGOUYA', equipe1: 'USY', equipe2: 'AS MAYA', heure: '15H30' },
          { numero: 11, stade: 'KOUDOUGOU', equipe1: 'BPS', equipe2: 'KIKO FC', heure: '15H30' },
          { numero: 12, stade: 'TERRAIN RCB', equipe1: 'JCB', equipe2: 'AS ECO', heure: '15H30' }
        ]
      }
    ]
  },
  {
    phase: 'Retour',
    journees: [
      {
        nom: '3ème Journée',
        jour: 'Vendredi',
        date: '2024-11-22',
        matchs: [
          { numero: 13, stade: 'TERRAIN BAMA', equipe1: 'AS MAYA', equipe2: 'TEMA BOKIN', heure: '15H30' },
          { numero: 14, stade: 'TERRAIN RCB', equipe1: 'ROYAL FC', equipe2: 'USY', heure: '15H30' },
          { numero: 15, stade: 'BANFORA', equipe1: 'AFFA', equipe2: 'BOBO SPORT', heure: '15H30' },
          { numero: 16, stade: 'KOUDOUGOU', equipe1: 'STAB FC', equipe2: 'BPS', heure: '15H30' },
          { numero: 17, stade: 'SANGOULE L', equipe1: 'KIKO FC', equipe2: 'JCB', heure: '15H30' },
          { numero: 18, stade: 'OUAHIGOUYA', equipe1: 'AS ECO', equipe2: 'AJEB', heure: '15H30' }
        ]
      },
      {
        nom: '4ème Journée',
        jour: 'Mardi',
        date: '2024-11-26',
        matchs: [
          { numero: 19, stade: 'SANGOULE L', equipe1: 'AJEB', equipe2: 'KIKO FC', heure: '15H30' },
          { numero: 20, stade: 'STADE WOBI', equipe1: 'AS MAYA', equipe2: 'ROYAL FC', heure: '15H30' },
          { numero: 21, stade: 'OUAHIGOUYA', equipe1: 'USY', equipe2: 'BOBO SPORT', heure: '15H30' },
          { numero: 22, stade: 'KOUDOUGOU', equipe1: 'BPS', equipe2: 'AFFA', heure: '15H30' },
          { numero: 23, stade: 'TERRAIN BAMA', equipe1: 'JCB', equipe2: 'STAB FC', heure: '15H30' },
          { numero: 24, stade: 'TEMA BOKIN', equipe1: 'TEMA BOKIN', equipe2: 'AS ECO', heure: '15H30' }
        ]
      }
    ]
  }
];
 rawMatches = [
  {
    id: '0f559e7d-f7c3-4e87-9bb0-ffdde7e214be',
    home_team: 'US Ouagadougou',
    away_team: 'AS Binbam',
    stadium: 'Stade Municipal de Bobo-Dioulasso',
    season: '2024-2025',
    type: 'aller', // ou "retour"
    scheduled_at: '15:30',
    match_date: '29/06/2025',
    match_day: 'Jeudi'
  },
  {
    id: 'abc-123',
    home_team: 'Étoile Filante',
    away_team: 'RC Bobo',
    stadium: 'Stade du 4 Août',
    season: '2024-2025',
    type: 'aller',
    scheduled_at: '15:30',
    match_date: '29/06/2025',
    match_day: 'Jeudi'
  },
  {
    id: 'xyz-456',
    home_team: 'KIKO FC',
    away_team: 'JCB',
    stadium: 'Stade Wobi',
    season: '2024-2025',
    type: 'retour',
    scheduled_at: '16:00',
    match_date: '03/07/2025',
    match_day: 'Dimanche'
  }
];


    constructor(private route: ActivatedRoute,private matchService: MatchService, private saisonService: SaisonService) {}


    ngOnInit(): void {
        this.saisonId = this.route.snapshot.paramMap.get('id')!;
        this.loadMatchs();

    }


  loadMatchs() {
   /*  this.matchService.getBySeasonId(this.saisonId).subscribe((res:any) => {

    }) */
    this.MATCHS_FAKE = this.transformMatchesToPhases(this.rawMatches);
    let matches=[]
    this.matchService.getBySeasonId(this.saisonId).subscribe( {
        next: (res:any) => {
          matches = res?.data?.season?.matches;
          this.phases = this.transformMatchesToPhases(matches);
        }


    })
    //this.phases=this.MATCHS_FAKE;
    /* this.saisonService.getMatchsDeSaison(this.saisonId).subscribe((res) => {
      this.phases = res;
    }); */
  }

  formatDate(dateStr: string): string {
    return formatDate(dateStr, 'dd/MM/yyyy', 'fr-FR');
  }
formatDate2(date: string): string {
  // de dd/mm/yyyy vers yyyy-mm-dd
  const [day, month, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

   transformMatchesToPhases(matches: RawMatch[]): Phase[] {
  const phasesMap: Record<string, Record<string, Journee>> = {};
  let matchCount = 1;

  for (const match of matches) {
    const phaseKey = match.type === 'aller' ? 'Aller' : 'Retour';
    const journeeKey = `${match.match_day} ${match.match_date}`;

    if (!phasesMap[phaseKey]) {
      phasesMap[phaseKey] = {};
    }

    if (!phasesMap[phaseKey][journeeKey]) {
      const numeroJournee = Object.keys(phasesMap[phaseKey]).length + 1;

      phasesMap[phaseKey][journeeKey] = {
        nom: `${numeroJournee}ème Journée`,
        jour: match.match_day,
        date: this.formatDate2(match.match_date), // ISO string
        matchs: []
      };
    }

    const journee = phasesMap[phaseKey][journeeKey];

    journee.matchs.push({
      numero: matchCount++,
      stade: match.stadium,
      equipe1: match.home_team,
      equipe2: match.away_team,
      heure: match.scheduled_at
    });
  }

  const result: Phase[] = [];

  for (const phaseKey of Object.keys(phasesMap)) {
    const journees = Object.values(phasesMap[phaseKey]);
    result.push({
      phase: phaseKey,
      journees
    });
  }

  return result;
}

}
