import { Competition } from './../../models/competition.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LigueService } from '../../service/ligue.service';
import { Ville, VilleService } from '../../service/ville.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { League } from '../../models/league.model';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { Team } from '../../models/team.model';
import { EquipeService } from '../../service/equipe.service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-ligues',
  templateUrl: './competitions.component.html',
  standalone: true,
  styleUrls: ['./competitions.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule, // Ajouté pour le dropdown
    ConfirmDialogModule,
    ToastModule,
    SelectModule,
    ReactiveFormsModule,
    FileUploadModule,
    InputNumberModule,
    CheckboxModule
  ]
})
export class CompetitionsComponent implements OnInit {
  @ViewChild('fileUploader') fileUploader!: FileUpload;

  leagues: Competition[] = [];
  villes: Ville[] = [];
  selectedLeague!: Competition;
  searchTerm: string = '';
  loading: boolean = false;
  showForm: boolean = false;
  isEditing: boolean = false;
  editingLeagueId?: string | null = null;
  currentLogo: string | null = null;
  selectedFile: File | null = null;
  leagueForm!: FormGroup;

  // Options pour le dropdown des groupes
  groupOptions = [
    { label: '1 ', value: 1 },
    { label: '2 ', value: 2 }
  ];
  teamsForm!: FormGroup;
  teamControls: FormArray<FormControl<boolean>> = new FormArray<FormControl<boolean>>([]);
  selectedTeamIds: string[] = [];
  selectAllTeamsControl = new FormControl(false);
  teams:Team[] = [
  ];
  teamSearchControl = new FormControl('');
  teamSearchTeam: string = '';
  isEditingTeams: boolean = false;


  constructor(
    private ligueService: LigueService,
    private villeService: VilleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private equipeService: EquipeService
  ) {
    this.leagueForm = this.fb.group({
      name: ['', Validators.required],
      teams_count: ['', Validators.required],
      pools_count: [1, Validators.required], // Ajouté avec valeur par défaut 1
      logo: ['']
    });

    this.teamsForm = this.fb.group({
      selected_teams: [[], Validators.required]
    });
  }

  ngOnInit(): void {
     this.loadLeagues();
     this.loadTeams();
/*     this.leagues = [
  {
    id: 1,
    name: 'Ligue 1 Burkina Faso',
    teams_count: 16,
    logo: 'data:image/jpeg;base64,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'
  },
  {
    id: 2,
    name: 'Super Ligue Ouaga',
    teams_count: 10,
    logo: 'https://via.placeholder.com/80x80.png?text=SLO'
  },
  {
    id: 3,
    name: 'Championnat National U20',
    teams_count: 12,
    logo: 'https://via.placeholder.com/80x80.png?text=U20'
  }
]; */

    this.loadVilles();
  }

  loadLeagues(): void {
/*     this.loading = true;
    this.ligueService.getAll().subscribe({
      next: (res: any) => {
        this.leagues = res?.data?.leagues || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des ligues',
        });
      }
    }); */
    this.leagues=[
        {
            id: '1',
            name: 'Super Ligue Ouaga',
            league_count: 10,
            logo: 'https://via.placeholder.com/80x80.png?text=SLO',
            leagues: [
                {
                    id: '1',
                    name: 'Super Ligue Ouaga U20 Féminine',
                    teams_count: 12,
                    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/00/Barclays_FA_Women%27s_Super_League_logo.svg/langfr-330px-Barclays_FA_Women%27s_Super_League_logo.svg.png'
                },
                 {
                    id: '2',
                    name: 'Super Ligue Ouaga U20 Masculine',
                    teams_count: 12,
                    logo: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Ffr.wikipedia.org%2Fwiki%2FChampionnat_d%2527Angleterre_f%25C3%25A9minin_de_football&psig=AOvVaw33wbqmtNVbASo-pqnUu78c&ust=1756734149844000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCOi4tumWtY8DFQAAAAAdAAAAABAE'
                },
                 {
                    id: '3',
                    name: 'Super Ligue Ouaga Masculine',
                    teams_count: 12,
                    logo: ''
                },
                 {
                    id: '4',
                    name: 'Super Ligue Ouaga Masculine',
                    teams_count: 12,
                    logo: 'https://www.google.com/webhp?hl=fr&sa=X&ved=0ahUKEwiuiYrb_7OPAxUUU0EAHSldMsIQPAgI'
                }
            ]
        },
        {
            id: '2',
            name: 'Ligue blabla',
            league_count: 12,
            logo: 'https://via.placeholder.com/80x80.png?text=U20'
        }
    ]
  }

  loadVilles(): void {
    this.villeService.getAll().subscribe({
      next: (res: any) => {
        this.villes = res?.data.cities || [];
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) this.resetForm();
  }

  resetForm(): void {
    this.leagueForm.reset({
      name: '',
      teams_count: '',
      pools_count: 1, // Valeur par défaut
      logo: ''
    });
    this.fileUploader?.clear();
    this.isEditing = false;
    this.editingLeagueId = null;
    this.currentLogo = null;
    this.selectedFile = null;
  }

  onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.leagueForm.get('logo')?.setValue(file.name);
    }
  }

  saveLeague(): void {
    if ((this.leagueForm.invalid && !this.isEditing) || (this.leagueForm.get('name')?.invalid && this.isEditing)) {
      this.leagueForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = new FormData();

    if (this.leagueForm.get('name')?.value)
      formData.append('name', this.leagueForm.get('name')?.value);
    if (this.leagueForm.get('teams_count')?.value)
      formData.append('teams_count', this.leagueForm.get('teams_count')?.value);
    if (this.leagueForm.get('pools_count')?.value)
      formData.append('pools_count', this.leagueForm.get('pools_count')?.value);
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }
    if (this.isEditing) {
      formData.append('_method', 'PUT');
    }

    const request$ = this.isEditing && this.editingLeagueId
      ? this.ligueService.update(this.editingLeagueId, formData)
      : this.ligueService.create(formData);

    request$.subscribe({
      next: () => {
        this.loadLeagues();
        this.toggleForm();
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: this.isEditing ? 'Ligue modifiée' : 'Ligue créée',
          detail: this.leagueForm.get('name')?.value,
          life: 3000
        });
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} de la ligue`,
        });
      }
    });
  }

  editLeague(league: League): void {
    this.isEditing = true;
    this.editingLeagueId = league.id;
    this.currentLogo = league.logo ?? null;
    this.leagueForm.patchValue({
      name: league.name,
      teams_count: league.teams_count,
      pools_count: league.pools_count || 1, // Valeur par défaut si non définie
      logo: league.logo ? league.logo : ''
    });
    this.selectedFile = null;
    this.showForm = true;
  }

  editLeagueTeams(league: League): void {

    this.selectedTeamIds = Array.from(league.teams_ids || []);
    this.isEditingTeams = true;
    this.selectedLeague = league;
    this.updateTeamControls();
  }

  saveLeagueTeams(): void {
    this.loading = true;
 /*    if( this.selectedTeamObjects.length==this.selectedLeague?.teams_count){
        this.ligueService.setTeams(this.selectedLeague.id!,this.selectedLeague.name!, this.selectedTeamIds,).subscribe({

          next: () => {
            this.loading = false;
            this.loadLeagues();
            this.isEditingTeams = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Ligue modifiée',
              detail: this.leagueForm.get('name')?.value,
              life: 3000
            });
          },
          error: () => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Erreur lors de la modification de la ligue`,
            });
          }

        })

    } */
  }

  filteredTeams(): any[] {
  const term = this.teamSearchControl.value?.toLowerCase() || '';
  return this.teams.filter(team =>
    team.name?.toLowerCase().includes(term) ||
    team.abbreviation?.toLowerCase().includes(term)
  );
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
  this.teamsForm.get('selected_teams')?.setValue([...this.selectedTeamIds]);
}

updateSearchTeam(event: Event): void {
  this.teamSearchTeam = (event.target as HTMLInputElement).value;
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



get selectedTeamObjects() {
  return this.teams.filter(team => this.selectedTeamIds.includes(team?.id!));
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

trackByTeamId( team: any): string {
  return team.id;
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

// Appelé quand on clique sur la case "tout sélectionner"
toggleAllSelections() {
  const value = this.selectAllTeamsControl.value;
  this.teamSelectionControls.forEach(control => control.setValue(value));
}

// Appelé quand une case individuelle change
updateGlobalSelection() {
  const allChecked = this.teamSelectionControls.every(c => c.value === true);
  this.selectAllTeamsControl.setValue(allChecked, { emitEvent: false }); // pour éviter la boucle infinie
}

  deleteLeague(id?: string): void {
    this.confirmationService.confirm({
     icon: 'pi pi-exclamation-triangle',
      message: 'Voulez-vous vraiment supprimer ce club ?',
      accept: () => {
        this.ligueService.delete(id).subscribe(() => {
          this.loadLeagues();
          this.messageService.add({
            severity: 'success',
            summary: 'Suppression réussie',
            detail: 'La ligue a été supprimée.'
          });
        });
      }
    });
  }

  get filteredLeagues(): Competition[] {
    if (!this.searchTerm) return this.leagues;
    return this.leagues.filter(league =>
      league?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  closeTeamsForm(){
    this.isEditingTeams = false
    this.selectedTeamIds = [];
    this.teamControls.reset();
    this.teamsForm.reset();
    this.teamSelectionControls.forEach(ctrl => ctrl.setValue(false));
    this.updateGlobalSelection();
    this.updateTeamControls();
    this.updateSelectedTeamsControl();


  }

    getOriginalIndex(obj: any): number {
  return this.leagues.indexOf(obj) + 1;
}
}
