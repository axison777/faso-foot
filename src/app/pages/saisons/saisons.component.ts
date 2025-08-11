import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberModule } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { SaisonService } from '../../service/saison.service';
import { VilleService } from '../../service/ville.service';
import { LigueService } from '../../service/ligue.service';
import { Season } from '../../models/season.model';
import { League } from '../../models/league.model';
import { Group } from '../../models/group.model';



interface Constraints{
    max_matches_per_week: number;
    max_matches_per_month: number;
    min_days_between_matches: number;
    max_travels_per_month: number;
    allowed_days: string[];
    max_distance_km: number;
    geo_grouping: boolean;
    max_matches_per_day: number;
    must_play_in_home_stadium: boolean;
    cities:{id:string, min: number}[]

}
interface Saison {
  id?: string;
  name: string;
  league: League;
  year: number;
  teamCount: number;
  calendarGenerated: boolean;
  start_date: Date;
  end_date: Date;
  constraints?: Constraints;
  pools?: Group[]
}



@Component({
  selector: 'app-saisons',
  imports: [
     ProgressSpinnerModule,
    TableModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    NgIf,
    NgFor,
    ConfirmDialogModule,
    ToastModule,
    MultiSelectModule,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    InputNumberModule,
    CardModule,
    CommonModule


  ],
  templateUrl: './saisons.component.html',
  styleUrls: ['./saisons.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SaisonsComponent implements OnInit{
  saisons: Saison[] = [];
  leagues: League[] = [
  ];

  selectedLeague: League | null = null;
  newSaisonName = '';
  start_date!: Date;
  end_date!: Date;
  displayDialog = false;
  loading = false;
selectedSaisonToGenerate!: Saison;
//
  saisonDialog = true;

  saison?: Season;

  jours = [
    { label: 'Lundi', value: 'Monday' },
    { label: 'Mardi', value: 'Tuesday' },
    { label: 'Mercredi', value: 'Wednesday' },
    { label: 'Jeudi', value: 'Thursday' },
    { label: 'Vendredi', value: 'Friday' },
    { label: 'Samedi', value: 'Saturday' },
    { label: 'Dimanche', value: 'Sunday' }
  ];

   villes = [
    { id: '1', name: 'Bobo-Dioulasso' },
    { id: '2', name: 'Ouagadougou' },
    { id: '3', name: 'Koudougou' }
  ];
  seasonForm: FormGroup;

////
searchTerm: string = '';

selectedGroupId: FormControl = new FormControl('', [Validators.required]);
displayGroupChoiceDialog = false;
groupChoices?: Group[] = [];
    selectedSeasonId: string | undefined;

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private router: Router,
    private villeService: VilleService,private fb: FormBuilder, private saisonService:SaisonService,
     private ligueService: LigueService
  ) {
    // données fictives
/*     this.saisons = [
      {
        id: '1',
        name: 'Saison 2023-2024',
        league: this.leagues[0],
        year: 2023,
        teamCount: 10,
        calendarGenerated: true,
        start_date: new Date('2023-08-01'),
        end_date: new Date('2024-05-31')
      },
      {
        id:'2',
        name: 'Saison 2024-2025',
        league: this.leagues[1],
        year: 2024,
        teamCount: 8,
        calendarGenerated: false,
        start_date: new Date('2024-08-01'),
        end_date: new Date('2025-05-31')
      }
    ]; */

    this.seasonForm = this.fb.group({
    league_id: [null, Validators.required],
    start_date: [null, Validators.required],
    end_date: [null, Validators.required],
    match_start_time: [null, Validators.required],
    allowed_match_days: [null, Validators.required],
    min_hours_between_team_matches: [null, Validators.required],
    min_days_between_phases: [null, Validators.required],
    cities: this.fb.array([])
  });
  }

    ngOnInit(): void {

        this.loadSeasons();
        this.villeService.getAll().subscribe( {
          next: (res:any) => {
            this.villes = res?.data?.cities;
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors du chargement des villes',
            })
          }
        })




    }

    loadSeasons() {
        this.loading = true;
        this.saisonService.getAll().subscribe( {

          next: (res:any) => {
            this.saisons = res?.data?.seasons;
            this.loading = false;

          },
          error: (error) => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors du chargement des saisons',
            })
          }

        })
    }

  createSaison() {
    //if (!this.newSaisonName || !this.selectedLeague || !this.start_date || !this.end_date) return;
/*
    let newSaison: any = {
      name: this.form.get('nom')?.value,
      league: this.form,
      calendarGenerated: false,
      start_date: this.form.get('date_debut')?.value,
      end_date: this.form.get('date_fin')?.value,
      cities:this.form.get('cities')?.value
    }; */

     const formValue = this.seasonForm.value;
     //this.cities= formValue.cities;
    let newSaison  = {
    //id: this.editingSaison ? this.editingSaison.id : this.saisons.length + 1,
    //name: formValue.nom,
    league_id: formValue.ligue.id,
    //year: new Date(formValue.date_debut).getFullYear(),
    //teamCount: this.editingSaison ? this.editingSaison.teamCount : Math.floor(Math.random() * 10) + 6,
    //calendarGenerated: this.editingSaison ? this.editingSaison.calendarGenerated : false,
    start_date: formValue.date_debut?.toISOString(),
    end_date: formValue.date_fin?.toISOString(),
    constraints: {
      max_matches_per_week: formValue.max_matches_per_week,
      max_matches_per_month: formValue.max_matches_per_month,
      min_days_between_matches: formValue.min_days_between_matches,
      max_travels_per_month: formValue.max_travels_per_month,
      allowed_days: formValue.allowed_days,
      max_distance_km: formValue.max_distance_km,
      geo_grouping: formValue.geo_grouping,
      max_matches_per_day: formValue.max_matches_per_day,
      must_play_in_home_stadium: formValue.must_play_in_home_stadium,
      cities: formValue.cities.map((c: any) => ({
        id: c.id.id,
        min: c.count
      }))
    }}

    return newSaison;

  }

  genererCalendrier(saison: Saison) {
  this.confirmationService.confirm({
    message: `Voulez-vous générer le calendrier pour "${saison?.league?.name}" du ${this.formatDate(saison?.start_date)} au ${this.formatDate(saison.end_date)} ?`,
    header: 'Confirmation',

    accept: () => {
      this.selectedSaisonToGenerate = saison;
      this.simulerGenerationCalendrier(saison);  // simulate fake loading
    }
  });
}
simulerGenerationCalendrier(saison: Saison) {
  this.loading = true;

  setTimeout(() => {
    // simulate success

    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: `Le calendrier pour ${saison.name} a été généré.`,
      life: 5000
    });
    saison.calendarGenerated = true;
    this.loading=false;
    // Simuler rechargement (dans une vraie app : refetch)
    this.rechargerSaisons();
  }, 3000);
}
formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
}
rechargerSaisons() {
        this.saisonService.getAll().subscribe( {
          next: (res:any) => {
            this.saisons = res?.data?.seasons;

          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors du chargement des saisons',
            })
          }

        })
}


 voirMatchs(saison: Saison) {
  this.router.navigate(['/matchs', saison.id]);
}


  voirCalendrier(saison: Saison) {
    if(saison?.pools?.length==1)
     this.router.navigate(['/calendrier'], { queryParams: { groupId: saison?.pools[0]?.id, seasonId: saison.id } });
    else{
        this.displayGroupChoiceDialog=true
        this.groupChoices=saison?.pools
        this.selectedSeasonId=saison.id
    }
  }


  ///

  closeDialog() {
    this.saisonDialog = false;
  }

  submitSaison() {
    this.loading = true;
    let saison=this.createSaison()
    this.saisonService.create(saison).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Saison ajoutée.`,
          life: 5000
        });
        this.rechargerSaisons();
        this.loading = false;
        this.displayDialog = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue.',
          life: 5000
        });
        this.loading = false;
      }
    });
  }
  get cities(): FormArray {
  return this.seasonForm.get('cities') as FormArray;
}

addVille() {
  this.cities.push(
    this.fb.group({
      id: [null, Validators.required],
      count: [null, Validators.required]
    })
  );
}
addSeason() {
this.router.navigate(['/ajout-saison']);
}

removeVille(index: number) {
  this.cities.removeAt(index);
}

  get filteredSaisons(): any[] {
    if (!this.searchTerm) {
      return this.saisons;
    }
    return this.saisons.filter(s =>
      (
  s.start_date.toString().includes(this.searchTerm)
        || s.end_date.toString().includes(this.searchTerm)
    )
    );
  }

getParsedDate(rawDate:string): Date {
  const parts = rawDate?.split('/');
  const day = +parts[0];
  const month = +parts[1] - 1;
  const year = +parts[2];
  return new Date(year, month, day);
}

deleteSeason(id: string) {  // delete saison
  this.confirmationService.confirm({
    message: 'Voulez-vous vraiment supprimer cette saison ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.saisonService.delete(id).subscribe({
        next: (res: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Saison supprimée.',
            life: 5000
          });
          this.rechargerSaisons();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue.',
            life: 5000
          });
        }
      });
    }
  });
}

goToGroupCalendar(groupId: string) {
    this.router.navigate(['/calendrier'], { queryParams: { groupId: groupId, seasonId: this.selectedSeasonId } });

}

  getOriginalIndex(obj: any): number {
  return this.saisons.indexOf(obj) + 1;
}




}

