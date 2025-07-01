import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ville } from '../../models/ville.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VilleService } from '../../service/ville.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-villes',
  templateUrl: './villes.component.html',
  standalone: true,
  styleUrls: ['./villes.component.scss'],
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
export class VillesComponent implements OnInit {
  villes: Ville[] = [];
  selectedVille!: Ville;
  searchTerm: string = '';
  loading: boolean = false;

  // Nouvelles propriétés pour le formulaire intégré
  showForm: boolean = false;
  newVille = { name: '' };
  isEditing: boolean = false;
  editingVilleId: number | null = null;

  constructor(private villeService: VilleService, private router: Router,private messageService: MessageService, private confirmationService: ConfirmationService,) {}

  ngOnInit(): void {
    this.loadVilles();
  }

  loadVilles(): void {
    this.loading = true;
    this.villeService.getAll().subscribe({
      next: (res:any) => {
         this.villes = res?.data?.cities;
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
    this.newVille = { name: '' };
    this.isEditing = false;
    this.editingVilleId = null;
  }

  // Enregistrer une nouvelle ville
  enregistrerVille(): void {
    if (this.newVille.name.trim()) {
      if (this.isEditing && this.editingVilleId) {
        // Mode édition
        const villeToUpdate = { id: this.editingVilleId, name: this.newVille.name.trim() };
        this.villeService.update(this.editingVilleId, villeToUpdate).subscribe({
          next: () => {
            this.loadVilles();
            this.toggleForm();
            this.messageService.add({
            severity: 'success',
            summary: 'Ville créée',
            detail: `${this.newVille.name} ajoutée.`,
            life: 3000
            });

          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la création de la ville',
            })

          }

        });
      } else {
        // Mode création
        const nouvelleVille = { name: this.newVille.name.trim() };
        this.villeService.create(nouvelleVille).subscribe({
          next: () => {
            this.loadVilles();
            this.toggleForm();
            this.messageService.add({
              severity: 'success',
              summary: 'Ville modifiée',
              /* detail: `${this.newVille.name} modifiée.`, */
              life: 3000
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la création de la ville',
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

  // Modifier une ville (ouvre le formulaire en mode édition)
  editVille(ville: Ville): void {
    this.newVille = { name: ville.name };
    this.isEditing = true;
    this.editingVilleId = ville.id;
    this.showForm = true;
  }

  deleteVille(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette ville ?')) {
      this.villeService.delete(id).subscribe(() => {
        this.loadVilles();
      });
    }
  }

  viewVille(ville: Ville): void {
    alert(`Détails de la ville:\n\nNom: ${ville.name}`);
  }

  get filteredVilles(): Ville[] {
    if (!this.searchTerm) {
      return this.villes;
    }
    return this.villes.filter(v =>
      v.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
