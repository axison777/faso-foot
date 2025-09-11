import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipeService } from '../../service/equipe.service';
import { Ville, VilleService } from '../../service/ville.service';
import { LigueService } from '../../service/ligue.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { Team } from '../../models/team.model';
import { League } from '../../models/league.model';
import { FileUploadModule } from 'primeng/fileupload';
import { TeamCategory } from '../../models/team-category.model';
import { TeamCategoryService } from '../../service/team-category.service';
import { ClubService } from '../../service/club.service';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-equipes',
  templateUrl: './equipes.component.html',
  standalone: true,
  styleUrls: ['./equipes.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule,
    ReactiveFormsModule,
    FileUploadModule,
    DropdownModule,
    InputTextModule
  ]
})
export class EquipesComponent implements OnInit {
  teams: Team[] = [];
  villes: Ville[] = [];
  leagues: League[] = [];
  selectedTeam: Team | null = null;
  searchTerm: string = '';
  loading: boolean = false;
  showDetails: boolean = false;
  showForm: boolean = false;
  showLeagueTransferDialog: boolean = false; // Nouveau nom spécifique
  newTeam: any = { name: '', city_id: null };
  isEditing: boolean = false;
  editingTeamId?: string | null = null;
  teamForm!: FormGroup;
  leagueTransferForm!: FormGroup; // Nouveau nom spécifique
  currentLogo: string | null = null;
  selectedFile: File | null = null;
  teamToTransfer: Team | null = null; // Nouveau nom spécifique
  categories: TeamCategory[] = [];
  clubs: Club[]=[]

  constructor(
    private equipeService: EquipeService,
    private villeService: VilleService,
    private ligueService: LigueService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private tcService: TeamCategoryService,
    private clubService: ClubService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      name: [''],
      abbreviation: [''],
      phone: [''],
      email: ['', [Validators.email]],
      city_id: ['', Validators.required],
      logo: [''],
      manager_first_name: [''],
      manager_last_name: [''],
      manager_role: [''],
      category_id: [''],
      club_id: ['']
    });

    // Formulaire spécifique pour le transfert de ligue
    this.leagueTransferForm = this.fb.group({
      league_id: [this.selectedTeam?.league?.id, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTeams();
    this.loadVilles();
    this.loadLeagues();
    this.loadCategories();
    this.loadClubs();
  }

  loadLeagues(): void {
    this.ligueService.getAll().subscribe({
      next: (res: any) => {
        this.leagues = res?.data.leagues || [];
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des ligues',
        });
      }
    });
  }

  loadCategories(): void {
    this.tcService.getAll().subscribe({
      next: (res: any) => {
        this.categories = res?.data.team_categories || [];
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des categories',
        });
      }
    });
  }

  loadClubs(): void {
    this.clubService.getAll().subscribe({
        next: (res: any) => {
            this.clubs=res?.data.clubs || [];
        },
        error: () => {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors du chargement des clubs',
            });
        }
    })
  }

  // Méthode pour ouvrir le dialog de transfert de ligue
  openLeagueTransferDialog(team: Team): void {
    this.teamToTransfer = team;
    this.leagueTransferForm.reset();
    this.showLeagueTransferDialog = true;
  }

  // Méthode pour fermer le dialog de transfert de ligue
  closeLeagueTransferDialog(): void {
    this.showLeagueTransferDialog = false;
    this.teamToTransfer = null;
    this.leagueTransferForm.reset();
  }

  // Méthode spécifique pour changer la ligue (utilise setLeague du service)
  setLeague(): void {
    if (this.leagueTransferForm.valid && this.teamToTransfer?.id) {
      const selectedLeagueId = this.leagueTransferForm.get('league_id')?.value;
      const selectedLeague = this.leagues.find(l => l.id === selectedLeagueId);

      this.equipeService.setLeague(this.teamToTransfer.id, selectedLeagueId).subscribe({
        next: () => {
          this.loadTeams(); // Recharger la liste des équipes
          this.closeLeagueTransferDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'Transfert réussi',
            detail: `${this.teamToTransfer?.name} a été transférée vers "${selectedLeague?.name}"`,
            life: 4000
          });
        },
        error: (error) => {
          console.error('Erreur lors du transfert:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors du transfert de l\'équipe vers la nouvelle ligue',
          });
        }
      });
    } else {
      this.leagueTransferForm.markAllAsTouched();
    }
  }

  getLeagueNameById(leagueId: string | undefined): string {
    if (!leagueId) return 'Aucune ligue';
    const league = this.leagues.find(l => l.id === leagueId);
    return league ? league.name || 'Ligue sans nom' : 'Ligue inconnue';
  }

  // Méthode pour obtenir les ligues disponibles (exclure la ligue actuelle)
  getAvailableLeagues(): League[] {
    if (!this.teamToTransfer?.league_id) return this.leagues;
    return this.leagues.filter(league => league.id !== this.teamToTransfer?.league_id);
  }

  // ... Reste du code existant (pas de changements) ...

  onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.teamForm.get('logo')?.setValue(file.name);
    }
  }

  loadTeams(): void {
    this.loading = true;
    this.equipeService.getAll().subscribe({
      next: (res: any) => {
        this.teams = res?.data.teams || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des équipes',
        });
      }
    });
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
    if (this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.teamForm.reset();
    this.isEditing = false;
    this.editingTeamId = null;
    this.currentLogo = null;
    this.selectedFile = null;
  }

  saveTeam(): void {
    if (this.teamForm.valid) {
      const formData = new FormData();
      if(this.teamForm.get('name')?.value)
        formData.append('name', this.teamForm.get('name')?.value);
      if(this.teamForm.get('abbreviation')?.value)
        formData.append('abbreviation', this.teamForm.get('abbreviation')?.value);
      if(this.teamForm.get('phone')?.value)
        formData.append('phone', this.teamForm.get('phone')?.value);
      if(this.teamForm.get('email')?.value)
        formData.append('email', this.teamForm.get('email')?.value);
      if(this.teamForm.get('city_id')?.value)
        formData.append('city_id', this.teamForm.get('city_id')?.value);
      if(this.teamForm.get('manager_first_name')?.value)
        formData.append('manager_first_name', this.teamForm.get('manager_first_name')?.value);
      if(this.teamForm.get('manager_last_name')?.value)
        formData.append('manager_last_name', this.teamForm.get('manager_last_name')?.value);
      if(this.teamForm.get('manager_role')?.value)
        formData.append('manager_role', this.teamForm.get('manager_role')?.value);
        if(this.teamForm.get('category_id')?.value)
        formData.append('category_id', this.teamForm.get('category_id')?.value);
        if(this.teamForm.get('club_id')?.value)
        formData.append('club_id', this.teamForm.get('club_id')?.value);

      if (this.selectedFile) {
        formData.append('logo', this.selectedFile);
      }

      if (this.isEditing) {
        formData.append('_method', 'PUT');
      }

      const onSuccess = () => {
        this.loadTeams();
        this.toggleForm();
        this.teamForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: this.isEditing ? 'Équipe modifiée' : 'Équipe créée',
          detail: `${this.teamForm.get('name')?.value}`,
          life: 3000
        });
      };

      const onError = () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} de l'équipe`,
        });
      };

      if (this.isEditing && this.editingTeamId) {
        this.equipeService.update(this.editingTeamId, formData).subscribe({ next: onSuccess, error: onError });
      } else {
        this.equipeService.create(formData).subscribe({ next: onSuccess, error: onError });
      }
    } else {
      this.teamForm.markAllAsTouched();
    }
  }

  viewTeamDetails(team: Team): void {
    /* this.selectedTeam = team;
    this.showDetails = true; */
    this.router.navigate(['/equipe-details', team.id], { state: { team } });
  }

  editTeam(team: Team): void {
    this.teamForm.get('name')?.setValue(team.name);
    this.teamForm.get('abbreviation')?.setValue(team.abbreviation);
    this.teamForm.get('phone')?.setValue(team.phone);
    this.teamForm.get('email')?.setValue(team.email);
    this.teamForm.get('city_id')?.patchValue(team.city_id);
    this.teamForm.get('manager_first_name')?.setValue(team.manager_first_name);
    this.teamForm.get('manager_last_name')?.setValue(team.manager_last_name);
    this.teamForm.get('manager_role')?.setValue(team.manager_role);
    this.currentLogo = team.logo ?? null;
    this.teamForm.get('logo')?.patchValue(team.logo ? team.logo : '');
    this.isEditing = true;
    this.editingTeamId = team.id;
    this.showForm = true;
  }

  deleteTeam(id?: string): void {
    this.confirmationService.confirm({
        icon: 'pi pi-exclamation-triangle',
      message: 'Voulez-vous vraiment supprimer cette équipe ?',
      accept: () => {
        this.equipeService.delete(id).subscribe(() => {
          this.loadTeams();
          this.messageService.add({
            severity: 'success',
            summary: 'Suppression réussie',
            detail: 'L\'équipe a été supprimée.'
          });
        });
      }
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  get filteredTeams(): Team[] {
    if (!this.searchTerm) return this.teams;
    return this.teams.filter(team =>
      team?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      team?.abbreviation?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getCityNameById(cityId: string | undefined): string {
    const ville = this.villes.find(v => v.id === cityId);
    return ville ? ville?.name || 'Ville sans nom' : 'Ville inconnue';
  }

      getOriginalIndex(obj: any): number {
  return this.teams.indexOf(obj) + 1;
}
}
