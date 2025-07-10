import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipeService } from '../../service/equipe.service';
import { Ville, VilleService } from '../../service/ville.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { Team } from '../../models/team.model';
import { FileUploadModule } from 'primeng/fileupload';

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
  ]
})
export class EquipesComponent implements OnInit {
  teams: Team[] = [];
  villes: Ville[] = [];

  selectedTeam: Team | null = null;
  searchTerm: string = '';
  loading: boolean = false;
  showDetails: boolean = false;

  showForm: boolean = false;
  newTeam: any = { name: '', city_id: null };
  isEditing: boolean = false;
  editingTeamId?: string | null = null;
  teamForm!: FormGroup;
  currentLogo: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private equipeService: EquipeService,
    private villeService: VilleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      abbreviation: [''],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      city_id: ['', Validators.required],
      logo: [''],
      manager_first_name: ['', Validators.required],
      manager_last_name: ['', Validators.required],
      manager_role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTeams();
    this.loadVilles();
  }

  onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.teamForm.get('logo')?.setValue(file.name); // activer validation
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
      formData.append('name', this.teamForm.get('name')?.value);
      formData.append('abbreviation', this.teamForm.get('abbreviation')?.value);
      formData.append('phone', this.teamForm.get('phone')?.value);
      formData.append('email', this.teamForm.get('email')?.value);
      formData.append('city_id', this.teamForm.get('city_id')?.value);
      formData.append('manager_first_name', this.teamForm.get('manager_first_name')?.value);
      formData.append('manager_last_name', this.teamForm.get('manager_last_name')?.value);
      formData.append('manager_role', this.teamForm.get('manager_role')?.value);

    if (this.selectedFile ) {
      formData.append('logo', this.selectedFile);
    }
    if (this.isEditing && this.selectedFile) {
      formData.append('_method', 'PUT');

    }

      const onSuccess = () => {
        this.loadTeams();
        this.toggleForm();
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
    }
    else
    this.teamForm.markAllAsTouched();
  }

  viewTeamDetails(team: Team): void {
    this.selectedTeam = team;
    this.showDetails = true;
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
      team?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /** 🔍 Méthode ajoutée pour afficher le nom de la ville */
  getCityNameById(cityId: string | undefined): string {
    const ville = this.villes.find(v => v.id === cityId);
    return ville ? ville?.name : 'Ville inconnue';
  }
}
