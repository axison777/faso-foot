import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-ligues',
  templateUrl: './ligues.component.html',
  standalone: true,
  styleUrls: ['./ligues.component.scss'],
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
    InputNumberModule
  ]
})
export class LiguesComponent implements OnInit {
  @ViewChild('fileUploader') fileUploader!: FileUpload;
  
  leagues: League[] = [];
  villes: Ville[] = [];
  selectedLeague!: League;
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

  constructor(
    private ligueService: LigueService,
    private villeService: VilleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.leagueForm = this.fb.group({
      name: ['', Validators.required],
      teams_count: ['', Validators.required],
      group_count: [1, Validators.required], // Ajouté avec valeur par défaut 1
      logo: ['']
    });
  }

  ngOnInit(): void {
    this.loadLeagues();
    this.loadVilles();
  }

  loadLeagues(): void {
    this.loading = true;
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
    if (this.showForm) this.resetForm();
  }

  resetForm(): void {
    this.leagueForm.reset({
      name: '',
      teams_count: '',
      group_count: 1, // Valeur par défaut
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
    if (this.leagueForm.get('group_count')?.value)
      formData.append('group_count', this.leagueForm.get('group_count')?.value);
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
      group_count: league.group_count || 1, // Valeur par défaut si non définie
      logo: league.logo ? league.logo : ''
    });
    this.selectedFile = null;
    this.showForm = true;
  }

  deleteLeague(id?: string): void {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer cette ligue ?',
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

  get filteredLeagues(): League[] {
    if (!this.searchTerm) return this.leagues;
    return this.leagues.filter(league =>
      league?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
