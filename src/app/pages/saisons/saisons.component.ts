import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { NgFor, NgIf } from '@angular/common';
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
import { VilleService } from '../../service/ville.service';

interface League {
  id: number;
  name: string;
}

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
    cities:{id:string, count: number}[]

}
interface Saison {
  id: number;
  name: string;
  league: League;
  year: number;
  teamCount: number;
  calendarGenerated: boolean;
  startDate: Date;
  endDate: Date;
  constraints?: Constraints;
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
    Checkbox,
    CardModule


  ],
  templateUrl: './saisons.component.html',
  styleUrls: ['./saisons.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SaisonsComponent implements OnInit{
  saisons: Saison[] = [];
  leagues: League[] = [
    { id: 1, name: 'Ligue 1' },
    { id: 2, name: 'Ligue 2' }
  ];

  selectedLeague: League | null = null;
  newSaisonName = '';
  startDate!: Date;
  endDate!: Date;
  displayDialog = false;
  loading = false;
selectedSaisonToGenerate!: Saison;
//
  saisonDialog = true;

  saison: any = {
    nom: '',
    ligue: null,
    date_debut: null,
    date_fin: null,
    max_matches_per_week: null,
    max_matches_per_month: null,
    min_days_between_matches: null,
    max_travels_per_month: null,
    allowed_days: [],
    max_distance_km: null,
    geo_grouping: false,
    max_matches_per_day: null,
    must_play_in_home_stadium: false,
    cities: []
  };

  jours = [
    { label: 'Lundi', value: 'Monday' },
    { label: 'Mardi', value: 'Tuesday' },
    { label: 'Mercredi', value: 'Wednesday' },
    { label: 'Jeudi', value: 'Thursday' },
    { label: 'Vendredi', value: 'Friday' },
    { label: 'Samedi', value: 'Saturday' },
    { label: 'Dimanche', value: 'Sunday' }
  ];

  ligues = [
    { id: 1, nom: 'Ligue 1' },
    { id: 2, nom: 'Ligue 2' }
  ];

  villes = [
    { id: '1', nom: 'Bobo-Dioulasso' },
    { id: '2', nom: 'Ouagadougou' },
    { id: '3', nom: 'Koudougou' }
  ];
  form: FormGroup;

////

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private router: Router,
    private fb: FormBuilder, private villeService:VilleService
  ) {
    // données fictives
    this.saisons = [
      {
        id: 1,
        name: 'Saison 2023-2024',
        league: this.leagues[0],
        year: 2023,
        teamCount: 10,
        calendarGenerated: true,
        startDate: new Date('2023-08-01'),
        endDate: new Date('2024-05-31')
      },
      {
        id: 2,
        name: 'Saison 2024-2025',
        league: this.leagues[1],
        year: 2024,
        teamCount: 8,
        calendarGenerated: false,
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-05-31')
      }
    ];

     this.form = this.fb.group({
    nom: ['', Validators.required],
    ligue: [null, Validators.required],
    date_debut: [null],
    date_fin: [null],
    max_matches_per_week: [null],
    max_matches_per_month: [null],
    min_days_between_matches: [null],
    max_travels_per_month: [null],
    allowed_days: [[]],
    max_distance_km: [null],
    geo_grouping: [false],
    max_matches_per_day: [null],
    must_play_in_home_stadium: [false],
    cities: this.fb.array([])
  });
  }
    ngOnInit(): void {
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

  createSaison() {
    if (!this.newSaisonName || !this.selectedLeague || !this.startDate || !this.endDate) return;

    const newSaison: Saison = {
      id: this.saisons.length + 1,
      name: this.newSaisonName,
      league: this.selectedLeague,
      year: new Date(this.startDate).getFullYear(),
      teamCount: Math.floor(Math.random() * 10) + 6,
      calendarGenerated: false,
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.saisons.push(newSaison);
    this.displayDialog = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Saison créée',
      detail: `${newSaison.name} (${newSaison.league.name}) ajoutée.`,
      life: 3000
    });

    this.newSaisonName = '';
    this.selectedLeague = null;
  }

  genererCalendrier(saison: Saison) {
  this.confirmationService.confirm({
    message: `Voulez-vous générer le calendrier pour "${saison.name}" du ${this.formatDate(saison.startDate)} au ${this.formatDate(saison.endDate)} ?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
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
  // Ici, dans un vrai cas : appel au backend
  this.saisons = [...this.saisons]; // rafraîchissement visuel pour Angular
}


 voirMatchs(saison: Saison) {
  this.router.navigate(['/pages/matchs', saison.id]);
}


  voirCalendrier(saison: Saison) {
    this.messageService.add({
      severity: 'info',
      summary: 'Calendrier',
      detail: `Voir le calendrier de ${saison.name}.`
    });
  }

  ///



  closeDialog() {
    this.saisonDialog = false;
  }

  submitSaison() {
    console.log('Saison à envoyer', this.saison);
    // TODO: envoyer via service
  }
  get cities(): FormArray {
  return this.form.get('cities') as FormArray;
}

addVille() {
  this.cities.push(
    this.fb.group({
      id: [null, Validators.required],
      count: [null, Validators.required]
    })
  );
}

removeVille(index: number) {
  this.cities.removeAt(index);
}

}
