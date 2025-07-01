import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Stade, StadeService } from '../../service/stade.service';
import { Ville, VilleService } from '../../service/ville.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-stades',
  templateUrl: './stades.component.html',
  standalone: true,
  styleUrls: ['./stades.component.scss'],
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
export class StadesComponent implements OnInit {
  stades: Stade[] = [];
  villes: Ville[] = [];

  selectedStade!: Stade;
  searchTerm: string = '';
  loading: boolean = false;

  showForm: boolean = false;
  newStade: any = { name: '', city_id: null };
  isEditing: boolean = false;
  editingStadeId: number | null = null;

  constructor(
    private stadeService: StadeService,
    private villeService: VilleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadStades();
    this.loadVilles();
  }

  loadStades(): void {
    this.loading = true;
    this.stadeService.getAll().subscribe({
      next: (res: any) => {
        this.stades = res?.data || [];
        this.loading = false;
      },
      error: () => this.loading = false
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
    this.newStade = { name: '', city_id: null };
    this.isEditing = false;
    this.editingStadeId = null;
  }

  enregistrerStade(): void {
    if (this.newStade.name.trim() && this.newStade.city_id) {
      const stadePayload = {
        name: this.newStade.name.trim(),
        city_id: this.newStade.city_id
      };

      const onSuccess = () => {
        this.loadStades();
        this.toggleForm();
        this.messageService.add({
          severity: 'success',
          summary: this.isEditing ? 'Stade modifié' : 'Stade créé',
          detail: `${this.newStade.name}`,
          life: 3000
        });
      };

      const onError = () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} du stade`,
        });
      };

      if (this.isEditing && this.editingStadeId) {
        this.stadeService.update(this.editingStadeId, {name: stadePayload.name}).subscribe({ next: onSuccess, error: onError });
      } else {
        this.stadeService.create({name: stadePayload.name, city_id: stadePayload.city_id}).subscribe({ next: onSuccess, error: onError });
      }
    }
  }

  annulerFormulaire(): void {
    this.showForm = false;
    this.resetForm();
  }

  editStade(stade: Stade): void {
    this.newStade = {
      name: stade.name,
      city_id: stade.city_id || null
    };
    this.isEditing = true;
    this.editingStadeId = stade.id;
    this.showForm = true;
  }

  deleteStade(id: number): void {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer ce stade ?',
      accept: () => {
        this.stadeService.delete(id).subscribe(() => {
          this.loadStades();
          this.messageService.add({
            severity: 'success',
            summary: 'Suppression réussie',
            detail: 'Le stade a été supprimé.'
          });
        });
      }
    });
  }

  get filteredStades(): Stade[] {
    if (!this.searchTerm) return this.stades;
    return this.stades.filter(stade =>
      stade.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
