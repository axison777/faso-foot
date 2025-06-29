import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VilleService } from '../../service/ville.service';
import { Ville } from '../../../models/ville.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-ville',
  standalone: true,
  templateUrl: './add-ville.component.html',
  styleUrls: ['./add-ville.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class AddVilleComponent {
  newVille: Ville = {
    id: 0,
    nom: ''
  };

  constructor(private villeService: VilleService, private router: Router) {}

  saveVille(): void {
    if (!this.newVille.nom.trim()) {
      alert('Le nom de la ville est requis.');
      return;
    }

    this.villeService.create(this.newVille).subscribe(() => {
      this.router.navigate(['/villes']);
    });
  }

  cancel(): void {
    this.router.navigate(['/villes']);
  }
}
