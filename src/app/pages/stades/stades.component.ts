import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StadeService } from '../../service/stade.service';
import { Ville, VilleService } from '../../service/ville.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { Stadium } from '../../models/stadium.model';

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
    SelectModule,
    ReactiveFormsModule
  ]
})
export class StadesComponent implements OnInit {
  stadiums: Stadium[] = [];
  villes: Ville[] = [];

  selectedStadium!: Stadium;
  searchTerm: string = '';
  loading: boolean = false;

  showForm: boolean = false;
  newStadium: any = { name: '', city_id: null };
  isEditing: boolean = false;
  editingStadiumId?: string | null = null;
  stadiumForm!: FormGroup;

  //information du stade
  displayDialog: boolean = false;
  stadeDetails: any = {
    name: '',
    city: '',
    max_matches_per_day:'',
    type_of_field: ''
  };

  stadiumTypes=[
    { name: 'En gazon naturel', value: 'natural_grass' },
    { name: 'En gazon synthétique', value: 'artificial_grass' },
  ]
  constructor(
    private stadeService: StadeService,
    private villeService: VilleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb:FormBuilder
  ) {
     this.stadiumForm = this.fb.group({
          name: ['', Validators.required],
          abbreviation: [''],
          city_id: ['', Validators.required],
          type_of_field: ['', Validators.required]
        });
  }

  ngOnInit(): void {
    this.loadStadiums();
    this.loadVilles();
  }

  loadStadiums(): void {
    this.loading = true;
    this.stadeService.getAll().subscribe({
      next: (res: any) => {
        this.stadiums = res?.data?.stadiums || [];
        this.loading = false;
      },
      error: () =>{
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des stades',
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
    this.stadiumForm.reset();
    this.isEditing = false;
    this.editingStadiumId = null;
  }

  saveStadium(): void {

    if (this.stadiumForm.valid) {
        this.loading = true;
      let stadiumPayload: any = {}
      if (this.stadiumForm.get('name')?.value) {
        stadiumPayload['name'] = this.stadiumForm.get('name')?.value;
      }
      if (this.stadiumForm.get('city_id')?.value) {
        stadiumPayload['city_id'] = this.stadiumForm.get('city_id')?.value;
      }
      if (this.stadiumForm.get('type_of_field')?.value) {
        stadiumPayload['type_of_field'] = this.stadiumForm.get('type_of_field')?.value;
      }

      if (this.stadiumForm.get('abbreviation')?.value) {
        stadiumPayload['abbreviation'] = this.stadiumForm.get('abbreviation')?.value;
      }



      const onSuccess = () => {
        this.loading = false;
        this.loadStadiums();
        this.toggleForm();
        this.messageService.add({
          severity: 'success',
          summary: this.isEditing ? 'Stade modifié' : 'Stade créé',
          detail: `${this.newStadium.name}`,
          life: 3000
        });
      };


      const onError = () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} du stade`,
        });
      };

      if (this.isEditing && this.editingStadiumId) {
        this.stadeService.update(this.editingStadiumId, stadiumPayload).subscribe({ next: onSuccess, error: onError });
      } else {
        this.stadeService.create(stadiumPayload).subscribe({ next: onSuccess, error: onError });
      }
    }
    else {
        this.stadiumForm.markAllAsTouched();
    }
  }

  editStadium(stadium: Stadium): void {
    this.stadiumForm.get('name')?.setValue(stadium.name);
    this.stadiumForm.get('city_id')?.patchValue(stadium.city_id);
    this.stadiumForm.get('abbreviation')?.setValue(stadium.abbreviation);
/*     this.stadiumForm.get('max_matches_per_day')?.setValue(stadium.max_matches_per_day); */
    this.stadiumForm.get('type_of_field')?.setValue(stadium.type_of_field);
    this.isEditing = true;
    this.editingStadiumId = stadium.id;
    this.showForm = true;
  }

  deleteStadium(id?: string): void {
    this.confirmationService.confirm({
        icon: 'pi pi-exclamation-triangle',
      message: 'Voulez-vous vraiment supprimer ce stade ?',
      accept: () => {
        this.stadeService.delete(id).subscribe(() => {
          this.loadStadiums();
          this.messageService.add({
            severity: 'success',
            summary: 'Suppression réussie',
            detail: 'Le stade a été supprimé.'
          });
        });
      }
    });
  }

  get filteredStadiums(): Stadium[] {
    if (!this.searchTerm) return this.stadiums;
    return this.stadiums.filter(stadium =>
      stadium?.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

   showDialog(stade: any) {
  this.stadeDetails = {
    name: stade.name,
    location: stade.location,
    city: this.villes.find(ville => ville.id === stade.city_id)?.name || 'Non spécifiée',
    max_matches_per_day: stade.max_matches_per_day || 'Non spécifié',
    type_of_field: stade.type_of_field || 'Non spécifié'
  };
  this.displayDialog = true;
}

  getOriginalIndex(obj: any): number {
  return this.stadiums.indexOf(obj) + 1;
}

}
