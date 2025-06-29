import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stades.component.html',
  styleUrls: ['./stades.component.scss']
})
export class StadesComponent {
  showForm = false;
  newStade = { ville: '', nom: '' };
  villes = ['Ouagadougou', 'Koudougou', 'Bobo-Dioulasso']; // Liste statique pour l'instant
  stades = [
    { ville: 'Ouagadougou', nom: 'Stade du 4 Août' },
    { ville: 'Koudougou', nom: 'Stade de Koudougou' }
  ];

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.newStade = { ville: '', nom: '' }; // Réinitialiser le formulaire
    }
  }

  enregistrerStade() {
    if (this.newStade.ville && this.newStade.nom) {
      this.stades.push({ ...this.newStade });
      this.toggleForm(); // Ferme le formulaire après enregistrement
    }
  }
}