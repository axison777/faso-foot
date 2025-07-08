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
    ReactiveFormsModule
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
  editingTeamId?: number | null = null;
  teamForm!: FormGroup;
  logoFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;

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
      abbreviation: ['', Validators.required],
      address: ['', Validators.required],
      city_id: ['', Validators.required],
      logo: ['']
    });
  }

  ngOnInit(): void {
    this.loadTeams();
    this.loadVilles();
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logoFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
      };
      reader.readAsDataURL(this.logoFile);
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
    this.logoFile = null;
    this.logoPreview = null;
  }

  saveTeam(): void {
    if (this.teamForm.valid) {
      const formData = new FormData();
      formData.append('name', this.teamForm.get('name')?.value);
      formData.append('abbreviation', this.teamForm.get('abbreviation')?.value);
      formData.append('address', this.teamForm.get('address')?.value);
      formData.append('city_id', this.teamForm.get('city_id')?.value);

      if (this.logoFile) {
        formData.append('logo', this.logoFile);
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
  }

  viewTeamDetails(team: Team): void {
    this.selectedTeam = team;
    this.showDetails = true;
  }

  editTeam(team: Team): void {
    this.teamForm.get('name')?.setValue(team.name);
    this.teamForm.get('abbreviation')?.setValue(team.abbreviation);
    this.teamForm.get('address')?.setValue(team.address);
    this.teamForm.get('city_id')?.patchValue(team.city_id);
    this.isEditing = true;
    this.editingTeamId = team.id;
    this.showForm = true;
  }

  deleteTeam(id: number): void {
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

  get filteredTeams(): Team[] {
    if (!this.searchTerm) return this.teams;
    return this.teams.filter(team =>
      team?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /** 🔍 Méthode ajoutée pour afficher le nom de la ville */
  getCityNameById(cityId: number | undefined): string {
    const ville = this.villes.find(v => v.id === cityId);
    return ville ? ville.nom : 'Ville inconnue';
  }
}
