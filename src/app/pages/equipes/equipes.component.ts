import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//import { Equipe } from '../../models/equipe.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { Equipe, EquipeService } from '../../service/equipe.service';

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
    SelectModule
  ]
})
export class EquipesComponent implements OnInit {
  equipes: Equipe[] = [];
  selectedEquipe!: Equipe;
  searchTerm: string = '';
  loading: boolean = false;

  // Nouvelles propriétés pour le formulaire intégré
  showForm: boolean = false;
  newEquipe = { name: '' };
  isEditing: boolean = false;
  editingEquipeId: number | null = null;

  constructor(private equipeService: EquipeService, private router: Router,private messageService: MessageService, private confirmationService: ConfirmationService,) {}

  ngOnInit(): void {
    this.loadEquipes();
  }

  loadEquipes(): void {
    this.loading = true;
    this.equipeService.getAll().subscribe({
      next: (res:any) => {
         this.equipes = res?.data?.teams;
      this.loading = false;
      }

    });
  }

  // Nouvelle méthode pour afficher/masquer le formulaire
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.resetForm();
    }
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.newEquipe = { name: '' };
    this.isEditing = false;
    this.editingEquipeId = null;
  }

  // Enregistrer une nouvelle equipe
  enregistrerEquipe(): void {
    if (this.newEquipe.name.trim()) {
      if (this.isEditing && this.editingEquipeId) {
        // Mode édition
        const equipeToUpdate = { id: this.editingEquipeId, name: this.newEquipe.name.trim() };
        this.equipeService.update(this.editingEquipeId, equipeToUpdate).subscribe({
          next: () => {
            this.loadEquipes();
            this.toggleForm();
            this.messageService.add({
            severity: 'success',
            summary: 'Equipe modifiée',
            detail: `${this.newEquipe.name} modifiée.`,
            life: 3000
            });

          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la création de la equipe',
            })

          }

        });
      } else {
        // Mode création
        const nouvelleEquipe = { name: this.newEquipe.name.trim() };
        this.equipeService.create(nouvelleEquipe).subscribe({
          next: () => {
            this.loadEquipes();
            this.toggleForm();
            this.messageService.add({
              severity: 'success',
              summary: 'Equipe créée',
              /* detail: `${this.newEquipe.name} modifiée.`, */
              life: 3000
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la création de la equipe',
            })
          }
        });
      }
    }
  }

  // CORRECTION: Ajouter la méthode manquante
  annulerFormulaire(): void {
    this.showForm = false;
    this.resetForm();
  }

  // Modifier une equipe (ouvre le formulaire en mode édition)
  editEquipe(equipe: Equipe): void {
    this.newEquipe = { name: equipe.name };
    this.isEditing = true;
    this.editingEquipeId = equipe.id;
    this.showForm = true;
  }

  deleteEquipe(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette equipe ?')) {
      this.equipeService.delete(id).subscribe(() => {
        this.loadEquipes();
      });
    }
  }

  viewEquipe(equipe: Equipe): void {
    alert(`Détails de la equipe:\n\nNom: ${equipe.name}`);
  }

  get filteredEquipes(): Equipe[] {
    if (!this.searchTerm) {
      return this.equipes;
    }
    return this.equipes.filter(v =>
      v.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
