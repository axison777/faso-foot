import { EquipeService } from './../../service/equipe.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { ActivatedRoute, Router } from '@angular/router';
import { SaisonService } from '../../service/saison.service';
import { StepperModule } from 'primeng/stepper';
import { CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { PlayerService } from '../../service/player.service';
import { MatchService } from '../../service/match.service';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';

interface Match {
  team1: string;
  team2: string;
  stadium: string;
  match_date: string;
  time: string;
  team1_logo: string;
  team2_logo: string;
  /////////
/*     "home_score": 0,
  "away_score": 0,
  "halftime_home_score": 0,
  "halftime_away_score": 0,
  "extra_time_home_score": 0,
  "extra_time_away_score": 0,
  "penalty_home_score": 0,
  "penalty_away_score": 0,
  "result_type": "REGULAR" */

  home_score?: number;
  away_score?: number;
  halftime_home_score?: number;
  halftime_away_score?: number;
  extra_time_home_score?: number;
  extra_time_away_score?: number;
  penalty_home_score?: number;
  penalty_away_score?: number;
  result_type?: string;
  result?:any
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
    TooltipModule,
    DialogModule,
    ReactiveFormsModule,
    InputNumberModule,
    StepperModule,
    InputTextModule,
    DividerModule
],
  templateUrl: './saison-details.component.html',
  styleUrls: ['./saison-details.component.scss']
})
export class SaisonDetailsComponent {
      positionOptions = [
    { label: 'Gardien', value: 'GOALKEEPER' },
    { label: 'Défenseur', value: 'DEFENSE' },
    { label: 'Milieu', value: 'MIDFIELD' },
    { label: 'Attaquant', value: 'ATTACK' }
  ];
     resultTypes = [
    { label: 'Temps réglementaire', value: 'REGULAR' },
    { label: 'Prolongations', value: 'EXTRA_TIME' },
    { label: 'Tirs au but', value: 'PENALTIES' }
  ];

  eventTypes = [
    { label: 'But', value: 'GOAL' },
    { label: 'Carton', value: 'CARD' },
    { label: 'Remplacement', value: 'SUBSTITUTION' }
  ];

  goalTypeOptions = [
    { label: 'But normal', value: 'REGULAR' },
    { label: 'Penalty', value: 'PENALTY' },
    { label: 'But contre son camp', value: 'OWN_GOAL' },
    { label: 'Coup franc', value: 'FREE_KICK' }
  ];

  cardTypeOptions = [
    { label: 'Jaune', value: 'YELLOW' },
    { label: 'Rouge', value: 'RED' }
  ];

    periods = [
    { key: 'FIRST_HALF', label: '1ère mi-temps' },
    { key: 'SECOND_HALF', label: '2ème mi-temps' },
    { key: 'EXTRA_TIME', label: 'Prolongations' },
    { key: 'PENALTIES', label: 'Tirs au but' }
  ];

  activeIndex = 0;
activeStepIndex: any=0;
  /*  season: Season = {
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
                  { team1: 'VITESSE FC', team2: 'ASFB', stadium: "Stade de l'USFRAN", match_date: '17/08/2025', time: '16:00', team1_logo: '', team2_logo: '', home_score: 2, away_score: 0, halftime_home_score: 0, halftime_away_score: 0, extra_time_home_score: 0, extra_time_away_score: 0, penalty_home_score: 0, penalty_away_score: 0, result_type: 'REGULAR' },
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
  }; */

  season?: Season
  selectedPoolId = this.season?.pools[0]?.id || null;
  selectedPhaseKey: PhaseKey = 'first_leg';

  detailsDialog = false;
resultDialog = false;
selectedMatch: any = null;
resultForm!: FormGroup;

resultDialogVisible = false;
activeStep = 0;
players:any[]=[]

ranking:any




get events(): FormArray {
  return this.resultForm.get('events') as FormArray;
}



seasonId: string=''
loading?: boolean=false;

 match:any



  getPoolsOptions() {
    return this.season?.pools?.map(p => ({ label: p.name, value: p.id }));
  }

  getPhasesOptions() {
    const pool = this.season?.pools?.find(p => p.id === this.selectedPoolId);
    return pool ? Object.entries(pool.phases).map(([key, val]) => ({ label: val.name, value: key })) : [];
  }

  getMatchdays() {
    const pool = this.season?.pools?.find(p => p.id === this.selectedPoolId);
    if (!pool) return [];
    const phase = pool.phases[this.selectedPhaseKey as PhaseKey];
    return phase?.matchdays || [];
  }

  getInitials(team: string): string {
  return team?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}

getTeamColor(team: string): string {
  // Retourne une couleur selon le hash du nom de l'équipe
  const colors = ['#565b55ff','#595245ff','#333841ff','#604f4fff','#6b6c86ff','#4b5d57ff'];
  let hash = 0;
  for(let i=0;i<team?.length;i++){ hash = team.charCodeAt(i) + ((hash << 5) - hash); }
  return colors[Math.abs(hash) % colors.length];
}

constructor(
  private fb: FormBuilder,
  private confirmationService: ConfirmationService,
  private messageService: MessageService,
  private acRoute: ActivatedRoute,
  private saisonService: SaisonService,
  private playerService: PlayerService,
  private matchService: MatchService,
  private router: Router
) {}


ngOnInit() {
  this.resultForm = this.fb.group({
  home_score: [0, Validators.required],
  away_score: [0, Validators.required],
  halftime_home_score: [0, Validators.required],
  halftime_away_score: [0, Validators.required],
  extra_time_home_score: [0],
  extra_time_away_score: [0],
  penalty_home_score: [0],
  penalty_away_score: [0],
  result_type: ['REGULAR', Validators.required],
  events: this.fb.array([]),
});

  this.seasonId = this.acRoute.snapshot.params['id'];

  this.loadSeason();





}
onTabChange(event: any) {
  if(this.activeIndex == 2 && this.selectedPoolId){
    this.loadRanking()
  }
}

loadRanking(){
this.saisonService.getRanking(this.selectedPoolId!).subscribe({

  next: (res: any) => {
    this.ranking = res;
    this.loading = false;
  },
  error: () => {
    this.loading = false;
  },
})
}

loadSeason(){
    this.saisonService.getAllPools(this.seasonId).subscribe({

      next: (res: any) => {
        this.season = res?.data;
        this.selectedPoolId = this.season?.pools[0]?.id || null;
        this.loading = false;
        this.loadRanking();
      },
      error: () => {
        this.loading = false;
      },
    });}

loadPlayers(match:any){
  this.matchService.getPlayers(match.football_match_id).subscribe({
    next: (res: any) => {
        let t1players= res?.data?.match_callups?.team_one_callup?.players || [];
        let t2players= res?.data?.match_callups?.team_two_callup?.players || [];
        if(t1players.length == 0 || t2players.length == 0){
            this.messageService.add({ severity: 'error', summary: 'Veuillez d\'abord initier le match' });
            return
        }
      this.players = [...t1players,...t2players] ;

      this.players.forEach((player: any) => {
        player.fullname = `${player.first_name} ${player.last_name}`
      })
      this.loading = false;
      this.selectedMatch = match;
  this.resultForm.reset({
    home_score: match?.result?.home_score || 0,
    away_score: match?.result?.away_score || 0,
    result_type: match?.result?.result_type || 'REGULAR',

  });
  //this.events.clear();
  this.activeStep = 1;
  this.resultDialogVisible = true;
    },
    error: () => {
      this.loading = false;
    },
  });
}

openDetails(match: any) {
this.matchService.getDetails(match.football_match_id).subscribe({
  next: (res: any) => {
    let match = res?.data.match;
    // mettrre les periods pour 1ere et 2e mitemps

    this.match =match
    this.detailsDialog = true;
  },
  error: () => {
    this.loading = false;
    this.messageService.add({ severity: 'error', summary: 'Erreur lors de la chargement du match' });
  },
})
  this.selectedMatch = match;
  this.detailsDialog = true;
}

/* openResultDialog(match: any) {
  this.selectedMatch = match;
  this.resultForm.patchValue(match);
  this.resultDialog = true;
} */

/* saveResult() {
  Object.assign(this.selectedMatch, this.resultForm.value);
  this.resultDialog = false;
  this.messageService.add({ severity: 'success', summary: 'Résultat enregistré' });
} */

confirmValidate(match: any) {
  this.confirmationService.confirm({
    message: `Valider le résultat du match ${match.team1} vs ${match.team2} ?`,
    header: 'Confirmation',
    accept: () => {
         this.matchService.validate(match.result.id).subscribe({
           next: () => {
             this.messageService.add({ severity: 'success', summary: 'Résultat validé' });
             this.loadSeason();
           },
           error: () => {
             this.messageService.add({ severity: 'error', summary: 'Erreur lors de la validation' });
           },
         })

    }
  });
}

getWinnerClass(match: any, team: 'team1' | 'team2') {
  if (!match) return '';
  if (match?.result?.home_score === match?.result?.away_score) return ''; // égalité
  if (team === 'team1' && match?.result?.home_score > match?.result?.away_score) return 'winner';
  if (team === 'team2' && match?.result?.away_score > match?.result?.home_score) return 'winner';
  return '';
}

getTeamsOptions() {
  if (!this.selectedMatch) return [];
  return [
    { label: this.selectedMatch.team1, value: this.selectedMatch.team1_id },
    { label: this.selectedMatch.team2, value: this.selectedMatch.team2_id },
  ];
}

openResultDialog(match: any) {
    this.loadPlayers(match);
    /* match structure
    {
    "football_match_id": "a2708177-deee-478c-9562-783b970a40f8",
    "team1_id": "61bed823-692a-4456-b1c6-6ce00ae5d55e",
    "team1": "Qui consequatur cons",
    "team1_logo": "N/A",
    "team2_id": "2657f009-efd1-4323-8c0b-6f658d55e1c8",
    "team2": "SALITAS FC",
    "team2_logo": "N/A",
    "stadium_id": "7fedff12-764c-46f4-a776-873c6503803e",
    "stadium": "Rail Club du Kadiogo 22",
    "match_date": "27/08/2025",
    "time": "16:00",
    "is_derby": 1,
    "is_rescheduled": 0,
    "result": {
        "id": "6e271d79-59b6-4d89-b6f6-844ebd92fbda",
        "home_score": 3,
        "away_score": 2,
        "result_type": "REGULAR",
        "verified": true,
        "recorded_at": "2025-09-19T10:44:53.000000Z",
        "decisive_score": {
            "home": 3,
            "away": 2
        },
        "is_draw": false
    }
}
    */

if(match.result){
    this.matchService.getDetails(match.football_match_id).subscribe({
  next: (res: any) => {
    let match = res?.data.match;
    this.patchEvents(match);

  },
  error: () => {
    this.loading = false;
    this.messageService.add({ severity: 'error', summary: 'Erreur lors du chargement du match' });
  },
})
}

}

addEvent() {
  this.events.push(
    this.fb.group({
      type: ['', Validators.required],
      minute: [0, [Validators.required, Validators.min(0), Validators.max(120)]],
      stoppage: [null],
      player_id: ['', Validators.required],
      second_player_id: [null],
      team_id: ['', Validators.required],
      goal_type: [null],
      card_type: [null],
      card_reason: [null],
    })
  );
}

removeEvent(i: number) {
  this.events.removeAt(i);
}

goToStep(step: number) {
  this.activeStepIndex = step;
}

saveResult() {
  if (this.resultForm.valid) {
    console.log('Résultat enregistré : ', this.resultForm.value);
    let payload = this.resultForm.value;
    payload.match_id = this.selectedMatch.football_match_id;
    let events=this.events.value.map((ev:any) => {
    let details:any = null;

    if (ev.type === "GOAL") {
      details = { goal_type: ev.goal_type ?? null };
    } else if (ev.type === "CARD") {
      details = {
        card_type: ev.card_type ?? null,
        card_reason: ev.card_reason ?? null,
      };
    } else if (ev.type === "SUBSTITUTION") {
      details = null; // pas de détails spécifiques
    }

    return {
      type: ev.type,
      minute: ev.minute,
      stoppage: ev.stoppage ?? null,
      player_id: ev.player_id,
      second_player_id: ev.second_player_id ?? null,
      team_id: ev.team_id,
      details,
    };
  });
    payload.events=events;
    /* console.log(payload);
    this.resultForm.reset();
    this.resultDialogVisible = false; */
    this.saisonService.saveResults(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Résultat enregistré' });
        this.resultForm.reset();
        this.resultDialogVisible = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Une erreur est survenue' });
      }
    })
  }
}

  getScoreClass(score?: number |null, opponent?: number| null): string {
    if (score == null || opponent == null) return '';
    return score > opponent ? 'text-green-score' : '';
  }

  getEventsByPeriod(period: string) {
    return this.match.events.filter((ev: any) => ev.period === period);
  }

    getPositionLabel(pos: string | undefined): string {
    if (!pos) return '';
    const opt = this.positionOptions.find(o => o.value === pos);
    return opt ? opt.label : pos;
  }

    get teamOneStarters() {
    return this.match?.team_one_callup?.players?.filter((p: any) => p.is_starter) || [];
  }

  get teamOneSubstitutes() {
    return this.match?.team_one_callup?.players?.filter((p: any)  => !p.is_starter) || [];
  }

  // --- Équipe 2 ---
  get teamTwoStarters() {
    return this.match?.team_two_callup?.players?.filter((p: any)  => p.is_starter) || [];
  }

  get teamTwoSubstitutes() {
    return this.match?.team_two_callup?.players?.filter((p: any)  => !p.is_starter) || [];
  }
    matchSettingUp(match: any): void {
    if (!match || !match.football_match_id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Identifiant du match manquant.'
      });
      return;
    }

    this.router.navigate(['/match-setup', match.football_match_id], {
    state: { match }
  }).catch(err => {
      console.error('Navigation échouée', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de navigation',
        detail: 'Impossible de naviguer vers la page de configuration du match.'
      });
    });
  }

  getResultTypeLabel(type: string): string {
    const opt = this.resultTypes.find(o => o.value === type);
    return opt ? opt.label : type;
  }

  onCloseResultDialog() {
    this.resultForm.reset();
    this.resultDialogVisible = false;
    this.activeStep = 1;
  }

    patchEvents(match: any) {
    const eventsFormArray = this.resultForm.get('events') as FormArray;
    eventsFormArray.clear(); // Clear existing controls

    if (match.events && match.events.length > 0) {
      match.events.forEach((event:any) => {
        const eventGroup = this.fb.group({
          id: [event.id],
          type: [event.type, Validators.required],
          minute: [event.minute, Validators.required],
          stoppage: [event.stoppage || null],
          team_id: [event.team_id, Validators.required],
          player_id: [event.player_id, Validators.required],
          second_player_id: [event.secondary_player_id || null], // Handle null secondary player
          // Add conditional controls for specific event types
          goal_type: [event.type === 'GOAL' ? event.goal_type : null],
          card_type: [event.type === 'CARD' ? event.card_type : null],
          card_reason: [event.type === 'CARD' ? event.card_reason : null]
        });
        eventsFormArray.push(eventGroup);
      });
    }
  }

}
