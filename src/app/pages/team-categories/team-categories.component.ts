import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamCategory } from '../../models/team-category.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {  TeamCategoryService } from '../../service/team-category.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { Team } from '../../models/team.model';

@Component({
  selector: 'app-team-categories',
  templateUrl: './team-categories.component.html',
  standalone: true,
  styleUrls: ['./team-categories.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule,
  ]
})
export class TeamCategoriesComponent implements OnInit {
  categories: TeamCategory[] = [];
  selectedCategory!: TeamCategory;
  searchTerm: string = '';
  loading: boolean = false;

  showForm: boolean = false;
  isEditing: boolean = false;
  editingCategoryId?: string;
  categoryForm!: FormGroup;

  //information de la categorie
  displayDialog: boolean = false;
  categoryDetails: any = {
    title: '',
    location: ''
  };

  genderOptions = [
    { label: 'Homme', value: 'MALE' },
    { label: 'Femme', value: 'FEMALE' },
    { label: 'Mixte', value: 'MIXED' },
  ];

    teams:Team[] = [];
    teamSearchControl = new FormControl('');
    teamSearchTeam: string = '';
    isEditingTeams: boolean = false;

  constructor(private tcService: TeamCategoryService, private router: Router,private messageService: MessageService, private confirmationService: ConfirmationService,
   private fb:FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.tcService.getAll().subscribe({
      next: (res: any) => {
        this.categories = res?.data?.team_categories || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des categories',
        });
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
    this.categoryForm.reset();
    this.isEditing = false;
    this.editingCategoryId = undefined;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      console.error('Formulaire invalide');
      return;
    }
    this.loading = true;
    const categoryData: TeamCategory = this.categoryForm.value;

    const onSuccess = () => {
      this.loadCategories();
      this.toggleForm();
      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: this.isEditing ? 'Categorie modifiée' : 'Categorie créée',
        detail: categoryData.name,
        life: 3000
      });
    };

    const onError = () => {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} de la categorie`,
      });
    };

    if (this.isEditing && this.editingCategoryId) {
      this.tcService.update(this.editingCategoryId, categoryData).subscribe({ next: onSuccess, error: onError });
    } else {
      this.tcService.create(categoryData).subscribe({ next: onSuccess, error: onError });
    }
  }

  annulerFormulaire(): void {
    this.showForm = false;
    this.resetForm();
  }

  editCategory(category: TeamCategory): void {
    this.categoryForm.patchValue({
      name: category.name,
      gender: category.gender
    });
    this.isEditing = true;
    this.editingCategoryId = category.id;
    this.showForm = true;
  }

  deleteCategory(id: string): void {
    this.confirmationService.confirm({
      message: 'Etes-vous sur de vouloir supprimer cette categorie ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.tcService.delete(id).subscribe({
          next: () => {
            this.loading = false;
            this.loadCategories();
            this.messageService.add({
              severity: 'success',
              summary: 'Categorie supprimée',
              life: 3000
            });
          },
          error: () => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression de la categorie',
            });
          }
        });
      }
    });
  }

  get filteredCategories(): TeamCategory[] {
    if (!this.searchTerm) {
      return this.categories;
    }
    return this.categories.filter(v =>
      v.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  //Afficher et faire disparaitre les details de la categorie
  showDialog(category: any) {
    this.categoryDetails = {
      name: category.name,
      location: category.location
    };
    this.displayDialog = true;
  }

  getOriginalIndex(obj: any): number {
  return this.categories.indexOf(obj) + 1;
}

  filteredTeams(): any[] {
  const term = this.teamSearchControl.value?.toLowerCase() || '';
  return this.teams.filter(team =>
    team.name?.toLowerCase().includes(term) ||
    team.abbreviation?.toLowerCase().includes(term)
  );
}

   showCategoryTeams(category: TeamCategory): void {

    //this.selectedTeamIds = Array.from(club.teams_ids || []);

    this.tcService.get(category.id!).subscribe({
      next: (res: any) => {
        this.teams = res?.data.team_category.teams || [];
        this.isEditingTeams = true;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des équipes', err);
      }
    })
    this.selectedCategory= category;
    //this.updateTeamControls();
  }
}
