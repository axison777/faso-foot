import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ville } from '../../models/ville.model';
import { VilleService } from '../service/ville.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-villes',
  templateUrl: './villes.component.html',
  standalone: true,
  styleUrls: ['./villes.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
  ]
})
export class VillesComponent implements OnInit {
  villes: Ville[] = [];
  selectedVille!: Ville;
  searchTerm: string = '';
  loading: boolean = false;
  
  // Nouvelles propriétés pour le formulaire intégré
  showForm: boolean = false;
  newVille = { nom: '' };
  isEditing: boolean = false;
  editingVilleId: number | null = null;

  constructor(private villeService: VilleService, private router: Router) {}

  ngOnInit(): void {
    this.loadVilles();
  }

  loadVilles(): void {
    this.loading = true;
    this.villeService.getAll().subscribe((data: Ville[]) => {
      this.villes = data;
      this.loading = false;
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
    this.newVille = { nom: '' };
    this.isEditing = false;
    this.editingVilleId = null;
  }

  // Enregistrer une nouvelle ville
  enregistrerVille(): void {
    if (this.newVille.nom.trim()) {
      if (this.isEditing && this.editingVilleId) {
        // Mode édition
        const villeToUpdate = { id: this.editingVilleId, nom: this.newVille.nom.trim() };
        this.villeService.update(this.editingVilleId, villeToUpdate).subscribe(() => {
          this.loadVilles();
          this.toggleForm();
        });
      } else {
        // Mode création
        const nouvelleVille = { nom: this.newVille.nom.trim() };
        this.villeService.create(nouvelleVille).subscribe(() => {
          this.loadVilles();
          this.toggleForm();
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
    this.newVille = { nom: ville.nom };
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
    alert(`Détails de la ville:\n\nNom: ${ville.nom}`);
  }

  get filteredVilles(): Ville[] {
    if (!this.searchTerm) {
      return this.villes;
    }
    return this.villes.filter(v => 
      v.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
