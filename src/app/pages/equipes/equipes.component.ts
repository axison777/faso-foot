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

  selectedTeam!: Team;
  searchTerm: string = '';
  loading: boolean = false;

  showForm: boolean = false;
  newTeam: any = { name: '', city_id: null };
  isEditing: boolean = false;
  editingTeamId?: number | null = null;
  teamForm!: FormGroup;

  constructor(
    private equipeService: EquipeService,
    private villeService: VilleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb:FormBuilder
  ) {
     this.teamForm = this.fb.group({
          name: ['', Validators.required],
          abbreviation: ['', Validators.required],
          city_id: ['', Validators.required]
        });
  }

  ngOnInit(): void {
    this.loadTeams();

  }

  loadTeams(): void {
    this.loading = true;
    this.equipeService.getAll().subscribe({
      next: (res: any) => {
        this.teams = res?.data.teams || [];
        this.loading = false;
      },
      error: () =>{
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des equipes',
        })
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
  }

  saveTeam(): void {
    if (this.newTeam.name.trim() && this.newTeam.city_id) {
      const teamPayload = {
        name: this.newTeam.name.trim(),
        city_id: this.newTeam.city_id
      };

      const onSuccess = () => {
        this.loadTeams();
        this.toggleForm();
        this.messageService.add({
          severity: 'success',
          summary: this.isEditing ? 'Equipe modifié' : 'Equipe créé',
          detail: `${this.newTeam.name}`,
          life: 3000
        });
      };

      const onError = () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} du equipe`,
        });
      };

      if (this.isEditing && this.editingTeamId) {
        this.equipeService.update(this.editingTeamId, {name: teamPayload.name}).subscribe({ next: onSuccess, error: onError });
      } else {
        this.equipeService.create({name: teamPayload.name, city_id: teamPayload.city_id}).subscribe({ next: onSuccess, error: onError });
      }
    }
  }


  editTeam(team: Team): void {
    this.teamForm.get('name')?.setValue(team.name);
    this.teamForm.get('city_id')?.patchValue(team.city_id);
    this.isEditing = true;
    this.editingTeamId = team.id;
    this.showForm = true;
  }

  deleteTeam(id: number): void {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer ce equipe ?',
      accept: () => {
        this.equipeService.delete(id).subscribe(() => {
          this.loadTeams();
          this.messageService.add({
            severity: 'success',
            summary: 'Suppression réussie',
            detail: 'Le equipe a été supprimé.'
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
}
