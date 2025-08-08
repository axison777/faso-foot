// fichier: saison-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule, FormControl, AbstractControl } from '@angular/forms';
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
import { map, Observable, skip } from 'rxjs';
import { LigueService } from '../../../service/ligue.service';
import { Stade, StadeService } from '../../../service/stade.service';
import { Ville, VilleService } from '../../../service/ville.service';
import { EquipeService } from '../../../service/equipe.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { League } from '../../../models/league.model';
import { Team } from '../../../models/team.model';
import { Group } from '../../../models/group.model';
import { TabsModule } from 'primeng/tabs';

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
    PanelModule,
    CardModule,
    InputTextModule,
    ToastModule,
    TabsModule
  ]
})
export class FormulaireSaisonComponent implements OnInit {
  step1Form!: FormGroup;
  step2Form!: FormArray;
  step3Form!: FormArray;
  //step4Form!: FormGroup;
  step4FormArray!: FormArray<FormGroup>
  skipDateControls!: FormControl<Date | null>[]
  //step5Form!: FormGroup;
  step5FormArray!: FormArray<FormGroup>

  leagues:League[] = [
/*     { id: 'league-1', name: 'Ligue 1' },
    { id: 'league-2', name: 'Ligue 2' } */
  ];

  teams:Team[] = [
   /*  { id: 'team-1', name: 'Team A', abbreviation:"TA",logo:"" },
    { id: 'team-2', name: 'Team B', abbreviation:"TB",logo:"" },
    { id: 'team-3', name: 'Team C', abbreviation:"TC",logo:"" } */
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

selectedTeamObjects: { [group: string]: any[] } = {};
selectedStadiumObjects: { [group: string]: any[] } = {};

skipDateControl!: FormControl ;
selectAllTeamsControl = new FormControl(false); // ✅ reactive form
groups:Group[]=[];

///////////
selectedTeamIdsByGroup: string[][] = [];
searchControls: FormControl[] = [];
selectAllControls: FormControl[] = [];
teamControlsByGroup: FormArray[] = [];
activeTabIndex: any=0;
loading=true;
submitloading=false;
pendingRequests: number=0;
totalSelectedTeamCount: number = 0;
teamsWithoutLocalStadiums: { [group: string]: any[] } = {};

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
     /*  end_date: [null, Validators.required], */
     /* group_id: [null, Validators.required] */
    });

    /* this.step2Form = this.fb.group({
      selected_teams: [[], Validators.required]
    }); */

    this.step2Form = this.fb.array<FormGroup>([]);

    this.step3Form = this.fb.array<FormGroup>([]);

    /* this.step4Form = this.fb.group({
      match_start_time: [initialTime, Validators.required],
      allowed_match_days: [[ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], Validators.required],
      min_hours_between_team_matches: [48, Validators.required],
      min_days_between_phases: [30, Validators.required],
      skip_dates: this.fb.array([]),
      //cities: this.fb.array([])
    }); */

    this.step4FormArray= this.fb.array<FormGroup>([]);
    this.skipDateControls = [];

    /* this.step5Form = this.fb.group({
      derbies: this.fb.array([])
    }); */
    this.step5FormArray = this.fb.array<FormGroup>([]);

    //this.skipDateControl= new FormControl(null)

    this.searchControl.valueChanges.subscribe(() => {
    //this.updateTeamControls();
  });
  //this.updateTeamControls();

     this.step1Form.get('start_date')?.valueChanges.subscribe(() => {
        this.validerContraintesDates()
        // supprimer toutes les skip_dates
        for(let i=0;i<this.step4FormArray.length;i++)
        {   //parcourir toutes les skip_dates et checker si la date est plus petite que la date de début et le supprimer
            const skipDates = this.getSkipDatesArray(i).controls as FormControl[];
            for (let j = 0; j < skipDates.length; j++) {
                const skipDate = skipDates[j];

                if(skipDate.value &&skipDate.value?.date < (this.step1Form.get('start_date')?.value)){
                    this.getSkipDatesArray(i).removeAt(j, { emitEvent: true });
                    j--;
                }
            }

        }
    });
  this.skipDateControl?.valueChanges.subscribe(() => this.validerContraintesDates());
  //this.derbies.valueChanges.subscribe(() => this.validerContraintesDates());
  }



  ngOnInit(): void {
    this.pendingRequests = 4;
    this.loadLeagues();
    this.loadStadiums();
    this.loadCities();
    this.loadTeams();

    this.initStep3Form();



  }

/*   get derbies(): FormArray {
    return this.step5Form.get('derbies') as FormArray;
  } */

 /*  addDerby(): void {
    const derbyGroup = this.fb.group({
      team_one_id: [null, Validators.required],
      team_two_id: [null, Validators.required],
      first_leg_date: [null, Validators.required],
      first_leg_stadium_id: [null, Validators.required],
      second_leg_date: [null, Validators.required],
      second_leg_stadium_id: [null, Validators.required]
    });
    this.derbies.push(derbyGroup);
  } */

 /*  removeDerby(index: number): void {
    this.derbies.removeAt(index);
  } */

  submitForm(): void {
    this.submitloading=true
    let formData2=this.buildSeasonPayload();
    console.log(formData2);

    let skipDatesValues:any[]=[];
/*     this.skipDates.controls.forEach((control) => {
      skipDatesValues.push(control.value?.date);
    }); */
    // team count for all groups
    let selectedTeamCount=0;
    this.selectedTeamIdsByGroup.forEach((teamIds) => {
      selectedTeamCount += teamIds.length;
    });

    if (
      this.step1Form.valid &&
      this.getTotalSelectedTeamCount() == this.getLeagueFromLeagueId(this.step1Form.get('league_id')?.value)?.teams_count
      //&& this.step3Form.valid
      //&& this.step4Form.valid &&
      //this.step5Form.valid
    ) {
      const formData = {
        ...this.step1Form.value,
        // teams ids for each group on this format [{"group_id":1,"teams_ids":[1,2,3]}]
        teams_ids: this.selectedTeamIdsByGroup.map((teamIds, groupIndex) => ({ group_id: this.groups[groupIndex].id, teams_ids: teamIds })),
        stadiums_ids: this.step3Form.value.selected_stadiums,
        /* ...this.step4Form.value, */
        // step4Form values
/*         match_start_time: formatDate(this.step4Form.value.match_start_time, 'HH:mm', 'fr-FR')  ,
        allowed_match_days: this.step4Form.value.allowed_match_days,
        min_hours_between_team_matches: this.step4Form.value.min_hours_between_team_matches,
        min_days_between_phases: this.step4Form.value.min_days_between_phases,
        cities: this.step4Form.value.cities, */
/*         skip_dates: skipDatesValues,
        derbies:this.step5Form.value.derbies */
      };
      if (skipDatesValues.length > 0) {
        formData['skip_dates'] = skipDatesValues;
      }
      /* if (this.step5Form.value.derbies.length > 0) {
        formData['derbies'] = this.step5Form.value.derbies;
      } */


      this.saisonService.create(formData2).subscribe({
        next: (response) => {
          this.submitloading=false
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
          this.submitloading=false
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error?.error?.message? error?.error?.message : 'Une erreur est survenue.',
            life: 5000
          });
        }
      });
    } else {

      this.step1Form.markAllAsTouched();
      this.step2Form.markAllAsTouched();
      this.step3Form.markAllAsTouched();
      //this.step4Form.markAllAsTouched();
      //this.step5Form.markAllAsTouched();
        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Veuillez remplir le formulaire correctement.`,
            life: 5000
        });

/*         const formData = {
        ...this.step1Form.value,
        teams_ids: this.selectedTeamIds,
        stadiums_ids: this.step3Form.value.selected_stadiums,
        match_start_time: formatDate(this.step4Form.value.match_start_time, 'HH:mm', 'fr-FR')  ,
        allowed_match_days: this.step4Form.value.allowed_match_days,
        min_hours_between_team_matches: this.step4Form.value.min_hours_between_team_matches,
        min_days_between_phases: this.step4Form.value.min_days_between_phases,
        cities: this.step4Form.value.cities,
        skip_dates: skipDatesValues,
        derbies:this.step5Form.value.derbies
      }; */
/*       console.log('Formulaire soumis :', formData);
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
      }); */

    }
  }


/* filteredTeams(): any[] {
  const term = this.searchControl.value?.toLowerCase() || '';
  return this.teams.filter(team =>
    team.name?.toLowerCase().includes(term) ||
    team.abbreviation?.toLowerCase().includes(term)
  );
} */







/* updateTeamControls() {
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
 */
selectedTeamIds: string[] = [];

/* get selectedTeamObjects() {
  return this.teams.filter(team => this.selectedTeamIds.includes(team?.id!));
} */

/* uncheckTeam(teamId: string) {
  const filtered = this.filteredTeams();
  const index = filtered.findIndex(t => t.id === teamId);
  if (index !== -1) {
    this.teamSelectionControls[index].setValue(false);
  } else {
    // Forcément masqué → désélectionner manuellement
    this.selectedTeamIds = this.selectedTeamIds.filter(id => id !== teamId);
  }
  console.log(this.selectedTeamIds);
} */

trackByTeamId(index: number, team: any): string {
  return team.id;
}


// Suppression d'un stade via la croix
/* removeStadium(stadiumId: string): void {
  const current = this.step3Form.get('selected_stadiums')?.value || [];
  this.step3Form.patchValue({
    selected_stadiums: current.filter((id: string) => id !== stadiumId)
  });
    this.change();
}

change(){
    const selectedIds = this.step3Form.get('selected_stadiums')?.value || [];
    this.selectedStadiumObjects =  this.stadiums.filter(s => selectedIds.includes(s.id));


} */

/*   get cities(): FormArray {
  return this.step4Form.get('cities') as FormArray;
} */

/* removeCity(index: number) {
  this.cities.removeAt(index);
} */

/* addCity() {
  this.cities.push(
    this.fb.group({
      id: [null, Validators.required],
      min: [null, Validators.required]
    })
  );
} */

/*  get skipDates(): FormArray {
    return this.step4Form.get('skip_dates') as FormArray;
  } */

/*   addSkipDate(): void {
    const date = this.skipDateControl?.value;
    if (date && !this.skipDateExists(date)) {
      this.skipDates.push(
        this.fb.group({
          date: new FormControl(date),
        })
      );
      this.skipDateControl?.reset();
    }
  } */

/*   removeSkipDate(index: number): void {
    this.skipDates.removeAt(index);
  } */

/*  private skipDateExists(date: Date): boolean {
    return this.skipDates.controls.some(
      ctrl => new Date(ctrl.value.date).toDateString() === date.toDateString()
    );
  } */
    loadLeagues(): void {
        this.ligueService.getAll().subscribe({
        next: (res: any) => {
            this.leagues = res?.data?.leagues || [];

        },
        error: (err) => {
            console.error('Erreur lors du chargement des ligues', err);
        },
        complete: () => {
        this.decrementPendingRequests();
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
            },
            complete: () => {
        this.decrementPendingRequests();
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
            },
            complete: () => {
        this.decrementPendingRequests();
      }
        });
    }

    loadTeams(): void {
        this.equipeService.getAll().subscribe({
            next: (res: any) => {
                this.teams = res?.data?.teams || [];
                 this.teams=this.teams.filter(team=>this.getLeagueFromLeagueId(this.step1Form.get('league_id')?.value)?.teams_ids?.includes(team.id!));
                //this.updateTeamControls();
                if (this.groups.length && this.step2Form.length === this.groups.length) {
                    this.groups.forEach((group, index) => this.updateTeamControls(index));
                    }
            },
            error: (err) => {
                console.error('Erreur lors du chargement des équipes', err);
            },
            complete: () => {
        this.decrementPendingRequests();
      }
        });
    }

// Appelé quand on clique sur la case "tout sélectionner"
/* toggleAllSelections() {
  const value = this.selectAllTeamsControl.value;
  this.teamSelectionControls.forEach(control => control.setValue(value));
} */

// Appelé quand une case individuelle change
/* updateGlobalSelection() {
  const allChecked = this.teamSelectionControls.every(c => c.value === true);
  this.selectAllTeamsControl.setValue(allChecked, { emitEvent: false }); // pour éviter la boucle infinie
} */

getLeagueFromLeagueId(leagueId: string): League | undefined {
  return this.leagues.find(league => league.id === leagueId);
}

validerContraintesDates() {
  const dateDebutSaison = new Date(this.step1Form.get('start_date')?.value);


  const dateReposCtrl = this.skipDateControl;
  const dateRepos = dateReposCtrl?.value ? new Date(dateReposCtrl.value) : null;
  if (dateRepos && dateRepos <= dateDebutSaison) {
    dateReposCtrl?.setErrors({ tropTot: true });
  } else {
    dateReposCtrl?.setErrors(null);
  }


/*   this.derbies.controls.forEach((derbyGroup: AbstractControl) => {
    const firstLegCtrl = derbyGroup.get('first_leg_date');
    const secondLegCtrl = derbyGroup.get('second_leg_date');

    const firstLegDate = firstLegCtrl?.value ? new Date(firstLegCtrl.value) : null;
    const secondLegDate = secondLegCtrl?.value ? new Date(secondLegCtrl.value) : null;

    if (firstLegDate && firstLegDate <= dateDebutSaison) {
      firstLegCtrl?.setErrors({ tropTot: true });
    } else {
      firstLegCtrl?.setErrors(null);
    }

    // b. retour > aller
    if (firstLegDate && secondLegDate && secondLegDate <= firstLegDate) {
      secondLegCtrl?.setErrors({ avantAller: true });
    } else {
      secondLegCtrl?.setErrors(null);
    }
  }); */
}

onLeagueChange(event: any) {
    //groups=this.leagues.find(league => league.id === event.value)?.groups;
     this.groups=this.generateGroups(this.getLeagueFromLeagueId(this.step1Form.get('league_id')?.value)?.pools_count!);

/*     if(this.groups.length<2)
        this.step1Form.get('group_id')?.setValue(this.groups[0].id);

    this.step2Form=this.fb.array([]);
    this.groups.forEach(group => {
        this.step2Form.push(this.fb.group({
            selected_teams: [[], Validators.required]
        }));
    }) */

this.step2Form.clear();
this.selectedTeamIdsByGroup = [];
this.searchControls = [];
this.selectAllControls = [];
this.teamControlsByGroup = [];

this.groups.forEach((group, index) => {
  this.step2Form.push(this.fb.group({
    selected_teams: [[], Validators.required]
  }));
  this.selectedTeamIdsByGroup.push([]);
  this.searchControls.push(new FormControl(''));
  this.selectAllControls.push(new FormControl(false));
  this.teamControlsByGroup.push(new FormArray<FormControl<boolean>>([]));

  this.initStep3Form();
  this.initStep4Form();
  this.initStep5Form();
});

////////////
  const selectedLeagueId = event.value;
  const league = this.leagues.find(l => l.id === selectedLeagueId);

  // Charger les groupes
  //this.groups = league?.groups || []; // ou depuis API

  // Réinitialiser le FormArray
  this.step2Form.clear();
  this.teamControlsByGroup = [];
  this.selectedTeamIdsByGroup = [];
  this.selectAllControls = [];
  this.searchControls = [];

  this.groups.forEach((group, index) => {
    this.step2Form.push(this.fb.group({
      selected_teams: [[], Validators.required]
    }));
    this.selectedTeamIdsByGroup.push([]);
    this.teamControlsByGroup.push(new FormArray<FormControl<boolean>>([]));
    this.searchControls.push(new FormControl(''));
    this.selectAllControls.push(new FormControl(false));

    // 🔁 Abonnement au search
    this.searchControls[index].valueChanges.subscribe(() => {
      this.updateTeamControls(index);
    });
  });

  // Charger les équipes et mettre à jour les cases
  this.loadTeams();


}

///////////////////
filteredTeams(groupIndex: number): any[] {
  const term = this.searchControls[groupIndex].value?.toLowerCase() || '';
  return this.teams.filter(team =>
    team.name?.toLowerCase().includes(term) ||
    team.abbreviation?.toLowerCase().includes(term)

  );
}

updateTeamControls(groupIndex: number) {
  const filtered = this.filteredTeams(groupIndex);
  const formArray = this.teamControlsByGroup[groupIndex];
  const selectedIds = this.selectedTeamIdsByGroup[groupIndex];

  formArray.clear();

  for (let team of filtered) {
    const control = new FormControl<boolean>(selectedIds.includes(team.id), { nonNullable: true });
    formArray.push(control);
    control.valueChanges.subscribe(checked => {
      if (checked && !selectedIds.includes(team.id)) {
        selectedIds.push(team.id);
      } else if (!checked) {
        const idx = selectedIds.indexOf(team.id);
        if (idx !== -1) selectedIds.splice(idx, 1);
      }
      this.step2Form.at(groupIndex).get('selected_teams')?.setValue([...selectedIds]);
      this.selectedTeamIdsByGroup[groupIndex] = [...selectedIds];
      this.selectedTeamObjects[this.groups[groupIndex].name!]=this.teams.filter(team => selectedIds.includes(team?.id!));
      this.updateGlobalSelection(groupIndex);
    });


}
}

toggleAllSelections(groupIndex: number) {
  const value = this.selectAllControls[groupIndex].value;
  this.teamControlsByGroup[groupIndex].controls.forEach(c => c.setValue(value));
      this.teamControlsByGroup.forEach((group, gIndex) => {
      if (gIndex !== groupIndex && value) {
        this.selectedTeamIdsByGroup[gIndex] = [];
        group.controls.forEach((ctrl, tIndex) => {
          const team = this.filteredTeams(gIndex)[tIndex];

            ctrl.setValue(false, { emitEvent: true });

        });
        // Mets à jour le "select all" du groupe concerné
        this.updateGlobalSelection(gIndex);
      }
    })

    if(value){
        this.selectedTeamIdsByGroup[groupIndex]=this.teams.map(team => team.id!);
        this.selectedTeamObjects[this.groups[groupIndex].name!]=this.teams
    }

    else{
        this.selectedTeamIdsByGroup[groupIndex]=[];
         this.selectedTeamObjects[this.groups[groupIndex].name!]=[];
    }




}

updateGlobalSelection(groupIndex: number) {
  const controls = this.teamControlsByGroup[groupIndex].controls;
  const allChecked = controls.every(c => c.value === true);
  this.selectAllControls[groupIndex].setValue(allChecked, { emitEvent: false });
  this.totalSelectedTeamCount = this.getTotalSelectedTeamCount();
      this.teamsWithoutLocalStadiums[this.groups[groupIndex].name!] = this.selectedTeamObjects[this.groups[groupIndex].name!].filter(team => {
      const hasLocalStadium = this.selectedStadiumObjects[this.groups[groupIndex].name!].some(
        stadium => stadium.city_id === team.city_id
      );
      return !hasLocalStadium;
    });


}

getStep2FormGroup(groupIndex: number): FormGroup {
  return this.step2Form.at(groupIndex) as FormGroup;
}

getTeamControlsByGroup(groupIndex: number, controlIndex: number): FormControl<boolean> {
  return this.teamControlsByGroup[groupIndex].at(controlIndex) as FormControl<boolean>;
}

/////////////////////////////////
initStep3Form() {
  this.step3Form = this.fb.array(
    this.groups.map(() =>
      this.fb.group({
        selected_stadiums: [[], Validators.required],
      })
    )
  );

  // init des stades sélectionnés
  this.groups.forEach(group => {
    this.selectedStadiumObjects[group.name!] = [];
  });
}


getStadiumFormGroup(index: number): FormGroup {
  return this.step3Form.at(index) as FormGroup;
}

onStadiumChange(index: number) {
  const formGroup = this.getStadiumFormGroup(index);
  const selectedIds = formGroup.get('selected_stadiums')?.value || [];
  this.selectedStadiumObjects[this.groups[index].name!] = this.stadiums.filter(s => selectedIds.includes(s.id));
        this.teamsWithoutLocalStadiums[this.groups[index].name!] = this.selectedTeamObjects[this.groups[index].name!].filter(team => {
      const hasLocalStadium = this.selectedStadiumObjects[this.groups[index].name!].some(
        stadium => stadium.city_id === team.city_id
      );
      return !hasLocalStadium;
    });
}

removeStadium(index: number, stadiumId: string): void {
  const formGroup = this.getStadiumFormGroup(index);
  const current = formGroup.get('selected_stadiums')?.value || [];
  formGroup.patchValue({
    selected_stadiums: current.filter((id: string) => id !== stadiumId),
  });
  this.onStadiumChange(index);
}

/////////////

initStep4Form() {
           const initialTime = new Date();
    initialTime.setHours(16); // Set hours
    initialTime.setMinutes(0); // Set minutes
    initialTime.setSeconds(0);
    initialTime.setMilliseconds(0);
  this.step4FormArray = this.fb.array(
    this.groups.map(() => this.fb.group({
      first_leg_start: [null, Validators.required],
      first_leg_end: [null, Validators.required],
      second_leg_start: [null],
      second_leg_end: [null],
      match_start_time: [initialTime, Validators.required],
      min_hours_between_team_matches: [48, Validators.required],
      //min_days_between_phases: [30, Validators.required],
      allowed_match_days: [[ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], Validators.required],
      skip_dates: this.fb.array([]),
      /* matches_per_matchday: [2, Validators.required], */
    }))
  );

  this.skipDateControls = this.groups.map(() => this.fb.control<Date | null>(null));
}

getStep4FormGroup(index: number): FormGroup {
  return this.step4FormArray.at(index) as FormGroup;
}

getSkipDatesArray(index: number): FormArray {
  return this.getStep4FormGroup(index).get('skip_dates') as FormArray;
}

getSkipDateControl(index: number): FormControl<Date | null> {
  return this.skipDateControls[index];
}

addSkipDate(index: number) {
  const date = this.getSkipDateControl(index).value;
  if (date && !this.skipDateExistsByGroup(date, index)) {
    this.getSkipDatesArray(index).push(this.fb.group({ date: [date] }));
    this.getSkipDateControl(index).reset();
  }
}

removeSkipDate(groupIndex: number, dateIndex: number) {
  this.getSkipDatesArray(groupIndex).removeAt(dateIndex);
}

/////////////////////step5
initStep5Form() {
  this.step5FormArray = this.fb.array(
    this.groups.map(() =>
      this.fb.group({
        derbies: this.fb.array([]),
      })
    )
  );
}

// Accesseurs
getStep5FormGroup(index: number): FormGroup {
  return this.step5FormArray.at(index) as FormGroup;
}

getDerbiesArray(index: number): FormArray {
  return this.getStep5FormGroup(index).get('derbies') as FormArray;
}

// Ajouter un derby dans une poule
addDerby(groupIndex: number): void {
  const derbyGroup = this.fb.group({
    team_one_id: [null, Validators.required],
    team_two_id: [null, Validators.required],
    first_leg_date: [null, Validators.required],
    first_leg_stadium_id: [null, Validators.required],
    second_leg_date: [null, Validators.required],
    second_leg_stadium_id: [null, Validators.required],
  });

  this.getDerbiesArray(groupIndex).push(derbyGroup);
}

// Supprimer un derby
removeDerby(groupIndex: number, derbyIndex: number): void {
  this.getDerbiesArray(groupIndex).removeAt(derbyIndex);
}

//////////////
buildSeasonPayload(): any | null {
  if (!this.step1Form?.valid) {
    console.warn('Step1 invalide.');
    return null;
  }

  const league_id = this.step1Form.value.league_id;
  const start_date_raw = this.step1Form.value.start_date;
  //const start_date_iso = toIsoDateTime(start_date_raw); // ou toIsoDate(start_date_raw) selon backend

  // sécurité
  //if (!league_id || !start_date_iso) return null;

  // Base date JS pour combiner l'heure des matchs si besoin
  //const startDateObj = start_date_raw ? new Date(start_date_raw) : null;

  const pools: any[] = this.groups.map((group, i) => {
    // ---- Step2: Teams (TODO -> fonction util) ----
    const teams_ids = this.selectedTeamIdsByGroup[i] || [];

    // ---- Step3: Stadiums ----
    // soit depuis le form:
    const step3FG = this.getStadiumFormGroup(i);
    const stadiums_ids_from_form = step3FG?.value?.selected_stadiums ?? [];
    // soit depuis selectedStadiumObjects[group.name!] si tu préfères :
    // const stadiums_ids = (this.selectedStadiumObjects[group.name!] ?? []).map((s:any)=>s.id);
    const stadiums_ids = stadiums_ids_from_form;

    // ---- Step4: Calendar constraints ----
    const step4FG = this.step4FormArray?.at(i);
    const first_leg_start = step4FG?.value?.first_leg_start ?? null;
    const first_leg_end = step4FG?.value?.first_leg_end ?? null;
    const second_leg_start = step4FG?.value?.second_leg_start ?? null;
    const second_leg_end = step4FG?.value?.second_leg_end ?? null;
    //const start_date_iso = toIsoDateTime(start_date); // ou toIsoDate selon backend
    const match_start_time_raw = step4FG?.value?.match_start_time ?? null;
    const min_hours_between_team_matches = step4FG?.value?.min_hours_between_team_matches ?? null;
    //const min_days_between_phases = step4FG?.value?.min_days_between_phases ?? null;
    /* const matches_per_matchday = step4FG?.value?.matches_per_matchday ?? null; */
    const allowed_match_days = step4FG?.value?.allowed_match_days ?? [];

    // skip_dates FormArray
    let skip_dates: string[] = [];
    if (step4FG) {
      const skipFA = step4FG.get('skip_dates') as FormArray | null;
      if (skipFA) {
        skip_dates = skipFA.controls
          .map(ctrl => {
            /* const d = ctrl.value?.date;
            return toIsoDateTime(d); */ // ou toIsoDate
            return ctrl.value?.date;
          })
          .filter(Boolean) as string[];
      }
    }

    // match_start_time conversion
    // si timeOnly → combine avec start_date
    const match_start_time_iso = formatDate(match_start_time_raw, 'HH:mm', 'fr-FR');

    // ---- Step5: Derbies ----
    const step5FG = this.step5FormArray?.at(i);
    let derbies: any[] = [];
    if (step5FG) {
      const derbiesFA = step5FG.get('derbies') as FormArray | null;
      if (derbiesFA) {
        derbies = derbiesFA.controls.map(ctrl => {
          const v = ctrl.value;
          return {
            team_one_id: v.team_one_id,
            team_two_id: v.team_two_id,
            first_leg_date: (v.first_leg_date) ?? '',
            first_leg_stadium_id: v.first_leg_stadium_id,
            second_leg_date: (v.second_leg_date) ?? '',
            second_leg_stadium_id: v.second_leg_stadium_id,
          };
        });
      }
    }

    const poolPayload: any = {
      name: group.name ?? `Poule ${i + 1}`,
      first_leg_start: first_leg_start,
      first_leg_end: first_leg_end,
 /*      second_leg_start: second_leg_start,
      second_leg_end: second_leg_end, */

      match_start_time: match_start_time_iso ?? '',
      min_hours_between_team_matches: Number(min_hours_between_team_matches) || 0,
      //min_days_between_phases: Number(min_days_between_phases) || 0,
      /* matches_per_matchday: Number(matches_per_matchday) || 0, */
      teams_ids,
      stadiums_ids,
      allowed_match_days,
      skip_dates,
      derbies,
    };

    return poolPayload;
  });

  const payload: any = {
    league_id,
    start_date: start_date_raw,
    pools,
  };

  return payload;
}


generateGroups(count: number): { name: string }[] {
  const groups: { name: string }[] = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < count; i++) {
    groups.push({
      name: `Poule ${alphabet[i]}`
    });
  }

  return groups;
}

updateTeamSelection(groupIndex: number, teamIndex: number) {
  const selectedTeamId = this.filteredTeams(groupIndex)[teamIndex].id;

  // Si la case a été cochée
  const isSelected = this.teamControlsByGroup[groupIndex].controls[teamIndex].value;

  if (isSelected) {
    // Parcours de tous les groupes sauf celui en cours
    this.teamControlsByGroup.forEach((group, gIndex) => {
      if (gIndex !== groupIndex) {
        group.controls.forEach((ctrl, tIndex) => {
          const team = this.filteredTeams(gIndex)[tIndex];
          if (team.id === selectedTeamId) {
            ctrl.setValue(false, { emitEvent: true });
          }
        });
        // Mets à jour le "select all" du groupe concerné
        this.updateGlobalSelection(gIndex);
      }
    });
  }

  // Mets à jour le "select all" du groupe courant
  const selectedIds = this.selectedTeamIdsByGroup[groupIndex];
    this.selectedTeamObjects[this.groups[groupIndex].name!]=this.teams.filter(team => selectedIds.includes(team?.id!));
    console.log(this.selectedTeamObjects);
  this.updateGlobalSelection(groupIndex);
}


getTotalSelectedTeamCount(): number {
  let total = 0;
  this.teamControlsByGroup.forEach(group => {
    total += group.controls.filter(ctrl => ctrl.value).length;
  });
  return total;
}

uncheckTeam(groupIndex: number, teamId: string) {
  // Teams filtered for this pool
  const filtered = this.filteredTeams(groupIndex);

  const index = filtered.findIndex(t => t.id === teamId);

  if (index !== -1) {
    // Uncheck the team in the FormArray for this pool
    const teamControls = this.teamControlsByGroup[groupIndex].controls;
    teamControls[index].setValue(false);
  } else {
    // If the team is hidden (filtered out), we must remove it manually
    this.selectedTeamIdsByGroup[groupIndex] = this.selectedTeamIdsByGroup[groupIndex].filter(id => id !== teamId);
  }


}




getStep2FormValid(){
    let valid=true
    this.selectedTeamIdsByGroup.forEach(g=>{
        if(g?.length<1){
            valid=false
        }
    })
    return valid

}

getStep4FormValid(){
    // check all step4forgoups from step4FormArray
    let valid=true
    this.step4FormArray?.controls.forEach(g=>{
        if(!g.valid){
            valid=false
        }
    })
    return valid

}

getStep5FormValid(){
    // check all step5forgoups from step5FormArray
    let valid=true
    this.step5FormArray?.controls.forEach(g=>{
        if(!g.valid){
            valid=false
    console.log(g)

        }
    })
    return valid

}

private skipDateExistsByGroup(date: Date, groupIndex: number): boolean {
  return this.getSkipDatesArray(groupIndex).controls.some(
    ctrl => new Date(ctrl.value.date).toDateString() === date.toDateString()
  );
}


validateDerbiesDates(): void {
  if (!this.step5FormArray) return;

  this.step5FormArray.controls.forEach((poolGroup: AbstractControl, poolIndex: number) => {
    const derbiesFA = poolGroup.get('derbies') as FormArray;
    if (!derbiesFA) return;

    derbiesFA.controls.forEach((derbyGroup: AbstractControl) => {
      const firstLegCtrl = derbyGroup.get('first_leg_date');
      const secondLegCtrl = derbyGroup.get('second_leg_date');

      const firstLegDate = firstLegCtrl?.value ? new Date(firstLegCtrl.value) : null;
      const secondLegDate = secondLegCtrl?.value ? new Date(secondLegCtrl.value) : null;

      // Start date of season from Step1
      const seasonStartDateRaw = this.step1Form?.get('start_date')?.value;
      const seasonStartDate = seasonStartDateRaw ? new Date(seasonStartDateRaw) : null;

      // a) first leg after season start
      if (firstLegDate && seasonStartDate && firstLegDate <= seasonStartDate) {
        firstLegCtrl?.setErrors({ tooEarly: true });
      } else {
        // Remove only this custom error
        if (firstLegCtrl?.hasError('tooEarly')) {
          const currentErrors = { ...firstLegCtrl.errors };
          delete currentErrors['tooEarly'];
          firstLegCtrl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
        }
      }

      // b) second leg > first leg
      if (firstLegDate && secondLegDate && secondLegDate <= firstLegDate) {
        secondLegCtrl?.setErrors({ beforeFirstLeg: true });
      } else {
        // Remove only this custom error
        if (secondLegCtrl?.hasError('beforeFirstLeg')) {
          const currentErrors = { ...secondLegCtrl.errors };
          delete currentErrors['beforeFirstLeg'];
          secondLegCtrl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
        }
      }
    });
  });
}

 private decrementPendingRequests(): void {
    this.pendingRequests--;
    if (this.pendingRequests === 0) {
      this.loading = false;
    }
  }

  getCityName(cityId: string): string {
    const city = this.cityList.find(c => c.id === cityId);
    return city ? city.name : '';
  }




}
