import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { City } from '../../models/city.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ville, VilleService } from '../../service/ville.service';
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
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule
  ]
})
export class VillesComponent implements OnInit {
  citys: City[] = [];
  selectedCity!: City;
  searchTerm: string = '';
  loading: boolean = false;
  showForm: boolean = false;
  isEditing: boolean = false;
  editingCityId?: string;
  cityForm!: FormGroup;

  //information de la ville
  displayDialog: boolean = false;
  cityDetails: any = {
    title: '',
    location: ''
  };

  constructor(private villeService: VilleService, private router: Router,private messageService: MessageService, private confirmationService: ConfirmationService,
   private fb:FormBuilder
  ) {
    this.cityForm = this.fb.group({
      name: ['', Validators.required],
/*       location: ['', Validators.required] */
    });
  }

  ngOnInit(): void {
    this.loadCitys();
  }

  loadCitys(): void {
    this.loading = true;
    this.villeService.getAll().subscribe({
      next: (res: any) => {
        this.citys = res?.data?.cities || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des villes',
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
    this.cityForm.reset();
    this.isEditing = false;
    this.editingCityId = undefined;
  }

  saveCity(): void {
    if (this.cityForm.invalid) {
      this.cityForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const cityData: City = this.cityForm.value;

    const onSuccess = () => {
      this.loadCitys();
      this.toggleForm();
      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: this.isEditing ? 'Ville modifiée' : 'Ville créée',
        detail: cityData.name,
        life: 3000
      });
    };

    const onError = () => {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} de la ville`,
      });
    };

    if (this.isEditing && this.editingCityId) {
      this.villeService.update(this.editingCityId, cityData).subscribe({ next: onSuccess, error: onError });
    } else {
      this.villeService.create(cityData).subscribe({ next: onSuccess, error: onError });
    }
  }

  annulerFormulaire(): void {
    this.showForm = false;
    this.resetForm();
  }

  editCity(city: City): void {
    this.cityForm.patchValue({
      name: city.name,
      location: city.location
    });
    this.isEditing = true;
    this.editingCityId = city.id;
    this.showForm = true;
  }

  deleteCity(id: string): void {
    this.confirmationService.confirm({
      message: 'Etes-vous sur de vouloir supprimer cette ville ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.villeService.delete(id).subscribe({
          next: () => {
            this.loading = false;
            this.loadCitys();
            this.messageService.add({
              severity: 'success',
              summary: 'Ville supprimée',
              life: 3000
            });
          },
          error: () => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression de la ville',
            });
          }
        });
      }
    });
  }

  get filteredCitys(): City[] {
    if (!this.searchTerm) {
      return this.citys;
    }
    return this.citys.filter(v =>
      v.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  //Afficher et faire disparaitre les details de la ville
  showDialog(city: any) {
    this.cityDetails = {
      name: city.name,
      location: city.location
    };
    this.displayDialog = true;
  }

  getOriginalIndex(obj: any): number {
  return this.citys.indexOf(obj) + 1;
}
}
