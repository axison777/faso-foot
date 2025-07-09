// fichier: saison-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { Checkbox, CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ListboxModule } from 'primeng/listbox';
import { StepperModule } from 'primeng/stepper';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SaisonService } from '../../../service/saison.service';
import { skip } from 'rxjs';
import { LigueService } from '../../../service/ligue.service';
import { StadeService } from '../../../service/stade.service';
import { Ville, VilleService } from '../../../service/ville.service';
import { EquipeService } from '../../../service/equipe.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulaire-saison',
  standalone: true,
  templateUrl: './formulaire-saison.component.html',
  styleUrls: ['./formulaire-saison.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    CheckboxModule,
    MultiSelectModule,
    ListboxModule,
    StepperModule,
    Checkbox,
    PanelModule,
    CardModule,
    InputTextModule,
    ToastModule
  ]
})
export class FormulaireSaisonComponent implements OnInit {
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;
  step5Form!: FormGroup;

  leagues = [
    { id: 'league-1', name: 'Ligue 1' },
    { id: 'league-2', name: 'Ligue 2' }
  ];

  teams = [
    { id: 'team-1', name: 'Team A', abbreviation:"TA",logo:"" },
    { id: 'team-2', name: 'Team B', abbreviation:"TB",logo:"" },
    { id: 'team-3', name: 'Team C', abbreviation:"TC",logo:"" }
  ];

  stadiums = [
    { id: 'stadium-1', name: 'Stade A' },
    { id: 'stadium-2', name: 'Stade B' },
    { id: 'stadium-3', name: 'Stade C' },
    { id: 'stadium-4', name: 'Stade D' },
    { id: 'stadium-5', name: 'Stade E' },
    { id: 'stadium-6', name: 'Stade F' },
    { id: 'stadium-7', name: 'Stade G' },
    { id: 'stadium-8', name: 'Stade H' },
    { id: 'stadium-9', name: 'Stade I' },
    { id: 'stadium-10', name: 'Stade Jeeeeeeeeeeeeeeeeeee' },
    { id: 'stadium-11', name: 'Stade K' },
    { id: 'stadium-12', name: 'Stade L' },
    { id: 'stadium-13', name: 'Stade M' },
    { id: 'stadium-14', name: 'Stade N' },
    { id: 'stadium-15', name: 'Stade O' },
    { id: 'stadium-16', name: 'Stade P' },
    { id: 'stadium-17', name: 'Stade Q' },
    { id: 'stadium-18', name: 'Stade R' },
    { id: 'stadium-19', name: 'Stade S' },
    { id: 'stadium-20', name: 'Stade T' }
  ];

  cityList=[
    { id: 'city-1', name: 'Paris' },
    { id: 'city-2', name: 'Marseille' },
    { id: 'city-3', name: 'Lyon' },
    { id: 'city-4', name: 'Toulouse' },
    { id: 'city-5', name: 'Nice' },
    { id: 'city-6', name: 'Nantes' },
    { id: 'city-7', name: 'Strasbourg' },
    { id: 'city-8', name: 'Montpellier' },
    { id: 'city-9', name: 'Bordeaux' },
    { id: 'city-10', name: 'Lille' },
  ];

  allowedDaysOptions = [
    { label: 'Lundi', value: 'Monday' },
    { label: 'Mardi', value: 'Tuesday' },
    { label: 'Mercredi', value: 'Wednesday' },
    { label: 'Jeudi', value: 'Thursday' },
    { label: 'Vendredi', value: 'Friday' },
    { label: 'Samedi', value: 'Saturday' },
    { label: 'Dimanche', value: 'Sunday' }
    ];

  searchTeam: string = '';

  selectedStadiums: string[] = [];
  searchControl = new FormControl('');
teamControls: FormArray<FormControl<boolean>> = new FormArray<FormControl<boolean>>([]);

selectedStadiumObjects: any[] = [];
skipDateControl!: FormControl ;

  constructor(private fb: FormBuilder,private saisonService: SaisonService,
    private ligueService:LigueService,
    private stadeService: StadeService,
    private villeService: VilleService,
    private equipeService: EquipeService,
    private messageService:MessageService,
    private router: Router

  ) {
        const initialTime = new Date();
    initialTime.setHours(16); // Set hours
    initialTime.setMinutes(0); // Set minutes
    initialTime.setSeconds(0);
    initialTime.setMilliseconds(0);
    this.step1Form = this.fb.group({
      league_id: [null, Validators.required],
      start_date: [null, Validators.required],
      end_date: [null, Validators.required],
    });

    this.step2Form = this.fb.group({
      selected_teams: [[], Validators.required]
    });

    this.step3Form = this.fb.group({
      selected_stadiums: [[], Validators.required]
    });

    this.step4Form = this.fb.group({
      match_start_time: [initialTime, Validators.required],
      allowed_match_days: [[ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], Validators.required],
      min_hours_between_team_matches: [48, Validators.required],
      min_days_between_phases: [30, Validators.required],
      skip_dates: this.fb.array([]),
      cities: this.fb.array([])
    });

    this.step5Form = this.fb.group({
      derbies: this.fb.array([])
    });

    this.skipDateControl= new FormControl(null)

    this.searchControl.valueChanges.subscribe(() => {
    this.updateTeamControls();
  });
  this.updateTeamControls();
  }



  ngOnInit(): void {
    this.loadLeagues();
    this.loadStadiums();
    this.loadCities();
    this.loadTeams();


  }

  get derbies(): FormArray {
    return this.step5Form.get('derbies') as FormArray;
  }

  addDerby(): void {
    const derbyGroup = this.fb.group({
      team_one_id: [null, Validators.required],
      team_two_id: [null, Validators.required],
      first_leg_date: [null, Validators.required],
      first_leg_stadium_id: [null, Validators.required],
      second_leg_date: [null, Validators.required],
      second_leg_stadium_id: [null, Validators.required]
    });
    this.derbies.push(derbyGroup);
  }

  removeDerby(index: number): void {
    this.derbies.removeAt(index);
  }

  submitForm(): void {

    let skipDatesValues:any[]=[];
    this.skipDates.controls.forEach((control) => {
      skipDatesValues.push(control.value?.date);
    });

    if (
      this.step1Form.valid &&
      this.step2Form.valid &&
      this.step3Form.valid &&
      this.step4Form.valid &&
      this.step5Form.valid
    ) {
      const formData = {
        ...this.step1Form.value,
        teams_ids: this.selectedTeamIds,
        stadiums_ids: this.step3Form.value.selected_stadiums,
        /* ...this.step4Form.value, */
        // step4Form values
        match_start_time: formatDate(this.step4Form.value.match_start_time, 'HH:mm', 'fr-FR')  ,
        allowed_match_days: this.step4Form.value.allowed_match_days,
        min_hours_between_team_matches: this.step4Form.value.min_hours_between_team_matches,
        min_days_between_phases: this.step4Form.value.min_days_between_phases,
        cities: this.step4Form.value.cities,
        skip_dates: skipDatesValues,
        derbies:this.step5Form.value.derbies
      };


      this.saisonService.create(formData).subscribe({
        next: (response) => {
          console.log('Saison créée avec succès :', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `Saison ajoutée.`,
            life: 5000
          });
          setTimeout(() => {
            this.router.navigate(['/saisons']);
          }, 1500);
        },
        error: (error) => {
          console.error('Erreur lors de la création de la saison :', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Une erreur est survenue.`,
            life: 5000
          });
        }
      });
    } else {
      console.warn('Formulaire invalide');
        const formData = {
        ...this.step1Form.value,
        teams_ids: this.selectedTeamIds,
        stadiums_ids: this.step3Form.value.selected_stadiums,
        /* ...this.step4Form.value, */
        // step4Form values
        match_start_time: formatDate(this.step4Form.value.match_start_time, 'HH:mm', 'fr-FR')  ,
        allowed_match_days: this.step4Form.value.allowed_match_days,
        min_hours_between_team_matches: this.step4Form.value.min_hours_between_team_matches,
        min_days_between_phases: this.step4Form.value.min_days_between_phases,
        cities: this.step4Form.value.cities,
        skip_dates: skipDatesValues,
        derbies:this.step5Form.value.derbies
      };
      console.log('Formulaire soumis :', formData);
      this.saisonService.create(formData).subscribe({
        next: (response) => {

          console.log('Saison créée avec succès :', response);
           this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: `Saison ajoutée.`,
            life: 5000
          });
          setTimeout(() => {
            this.router.navigate(['/saisons']);
          }, 1500);

        },
        error: (error) => {
          console.error('Erreur lors de la création de la saison :', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Une erreur est survenue.`,
            life: 5000
          });
        }
      });

    }
  }


filteredTeams(): any[] {
  const term = this.searchControl.value?.toLowerCase() || '';
  return this.teams.filter(team =>
    team.name.toLowerCase().includes(term) ||
    team.abbreviation.toLowerCase().includes(term)
  ).slice(0, 8);
}

toggleTeamSelection(teamId: string): void {
  const index = this.selectedTeamIds.indexOf(teamId);
  if (index === -1) {
    this.selectedTeamIds.push(teamId);
  } else {
    this.selectedTeamIds = this.selectedTeamIds.filter(id => id !== teamId);
;
  }
  this.updateSelectedTeamsControl();
}

isTeamSelected(teamId: string): boolean {
  return this.selectedTeamIds.includes(teamId);
}

removeTeam(teamId: string): void {
  this.selectedTeamIds = this.selectedTeamIds.filter(id => id !== teamId);
  this.updateSelectedTeamsControl();
  console.log(this.selectedTeamIds);
}

updateSelectedTeamsControl(): void {
  this.step2Form.get('selected_teams')?.setValue([...this.selectedTeamIds]);
}

updateSearchTeam(event: Event): void {
  this.searchTeam = (event.target as HTMLInputElement).value;
}

get teamSelectionControls(): FormControl[] {
  return this.teamControls.controls as FormControl[];
}

updateTeamControls() {
  const filtered = this.filteredTeams();
  this.teamControls.clear();
  for (let team of filtered) {
    const control = new FormControl<boolean>(this.selectedTeamIds.includes(team.id), { nonNullable: true });

    this.teamControls.push(control);
    control.valueChanges.subscribe(checked => {
      if (checked && !this.selectedTeamIds.includes(team.id)) {
        this.selectedTeamIds.push(team.id);
      } else if (!checked) {
        this.selectedTeamIds = this.selectedTeamIds.filter(id => id !== team.id);
      }
    });
  }
}

selectedTeamIds: string[] = [];

get selectedTeamObjects() {
  return this.teams.filter(team => this.selectedTeamIds.includes(team.id));
}

uncheckTeam(teamId: string) {
  const filtered = this.filteredTeams();
  const index = filtered.findIndex(t => t.id === teamId);
  if (index !== -1) {
    this.teamSelectionControls[index].setValue(false);
  } else {
    // Forcément masqué → désélectionner manuellement
    this.selectedTeamIds = this.selectedTeamIds.filter(id => id !== teamId);
  }
  console.log(this.selectedTeamIds);
}

trackByTeamId(index: number, team: any): string {
  return team.id;
}


// Suppression d'un stade via la croix
removeStadium(stadiumId: string): void {
  const current = this.step3Form.get('selectedStadiums')?.value || [];
  this.step3Form.patchValue({
    selectedStadiums: current.filter((id: string) => id !== stadiumId)
  });
}

change(){
    console.log(this.step3Form.get('selected_stadiums')?.value);
    const selectedIds = this.step3Form.get('selected_stadiums')?.value || [];
    this.selectedStadiumObjects =  this.stadiums.filter(s => selectedIds.includes(s.id));

}

  get cities(): FormArray {
  return this.step4Form.get('cities') as FormArray;
}

removeCity(index: number) {
  this.cities.removeAt(index);
}

addCity() {
  this.cities.push(
    this.fb.group({
      id: [null, Validators.required],
      min: [null, Validators.required]
    })
  );
}

 get skipDates(): FormArray {
    return this.step4Form.get('skip_dates') as FormArray;
  }

  addSkipDate(): void {
    const date = this.skipDateControl?.value;
    if (date && !this.skipDateExists(date)) {
      this.skipDates.push(
        this.fb.group({
          date: new FormControl(date),
        })
      );
      this.skipDateControl?.reset();
    }
  }

  removeSkipDate(index: number): void {
    this.skipDates.removeAt(index);
  }

  private skipDateExists(date: Date): boolean {
    return this.skipDates.controls.some(
      ctrl => new Date(ctrl.value.date).toDateString() === date.toDateString()
    );
  }
    loadLeagues(): void {
        this.ligueService.getAll().subscribe({
        next: (res: any) => {
            this.leagues = res?.data?.leagues || [];
        },
        error: (err) => {
            console.error('Erreur lors du chargement des ligues', err);
        }
        });
    }

    loadStadiums(): void {
        this.stadeService.getAll().subscribe({
            next: (res: any) => {
                this.stadiums = res?.data?.stadiums || [];
            },
            error: (err) => {
                console.error('Erreur lors du chargement des stades', err);
            }
        });
    }
    loadCities(): void {
        this.villeService.getAll().subscribe({
            next: (res: any) => {
                this.cityList = res?.data?.cities || [];
            },
            error: (err) => {
                console.error('Erreur lors du chargement des villes', err);
            }
        });
    }

    loadTeams(): void {
        this.equipeService.getAll().subscribe({
            next: (res: any) => {
                this.teams = res?.data?.teams || [];
                this.updateTeamControls();
            },
            error: (err) => {
                console.error('Erreur lors du chargement des équipes', err);
            }
        });
    }



}
