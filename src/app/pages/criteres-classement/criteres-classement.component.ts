import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CriteresClassementService } from '../../service/classement.service';
import { CritereClassement } from '../../models/classement.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-criteres-classement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    DragDropModule
  ],
  templateUrl: './criteres-classement.component.html',
  styleUrls: ['./criteres-classement.component.scss']
})
export class CriteresClassementComponent {
  criteresDisponibles: CritereClassement[] = [];
  criteresActuels: CritereClassement[] = [];
  nouveauNom = '';
  nouveauCode = '';
  editingCritere: CritereClassement | null = null;
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<CriteresClassementComponent>,
    private service: CriteresClassementService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { ligueId: number }
  ) {
    this.chargerCriteres();
  }

  chargerCriteres() {
    this.service.getCriteres(this.data.ligueId).subscribe({
      next: (res: any) => {
        this.criteresDisponibles = res.criteresDisponibles;
        this.criteresActuels = this.criteresDisponibles.filter(c =>
          res.criteresActuels.includes(c.id)
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur de chargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  drop(event: CdkDragDrop<CritereClassement[]>) {
    moveItemInArray(this.criteresActuels, event.previousIndex, event.currentIndex);
  }

  toggleCritere(critere: CritereClassement) {
    const index = this.criteresActuels.findIndex(c => c.id === critere.id);
    if (index > -1) this.criteresActuels.splice(index, 1);
    else this.criteresActuels.push(critere);
  }

  ajouterCritere() {
    if (!this.nouveauNom || !this.nouveauCode) return;
    const nouveau: CritereClassement = {
      id: Date.now().toString(),
      nom: this.nouveauNom,
      code: this.nouveauCode,
      priorite: this.criteresActuels.length + 1,
      ordre: 'desc',
      actif: true
    };
    this.criteresDisponibles.push(nouveau);
    this.criteresActuels.push(nouveau);
    this.nouveauNom = '';
    this.nouveauCode = '';
  }

  modifierCritere(critere: CritereClassement) {
    this.editingCritere = { ...critere };
  }

  enregistrerModification() {
    if (!this.editingCritere) return;
    const index = this.criteresDisponibles.findIndex(c => c.id === this.editingCritere!.id);
    if (index > -1) this.criteresDisponibles[index] = this.editingCritere!;
    const actifIndex = this.criteresActuels.findIndex(c => c.id === this.editingCritere!.id);
    if (actifIndex > -1) this.criteresActuels[actifIndex] = this.editingCritere!;
    this.editingCritere = null;
  }

  supprimerCritere(critere: CritereClassement) {
    this.criteresDisponibles = this.criteresDisponibles.filter(c => c.id !== critere.id);
    this.criteresActuels = this.criteresActuels.filter(c => c.id !== critere.id);
  }

  enregistrer() {
    const payload = {
      criteresSelectionnes: this.criteresActuels.map(c => c.id),
      ordre: this.criteresActuels.map(c => c.nom)
    };
    this.service.saveCriteres(this.data.ligueId, payload).subscribe({
      next: () => {
        this.snackBar.open('Critères enregistrés avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close();
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
      }
    });
  }
}
