import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { TabViewModule } from 'primeng/tabview';
import { DatePickerModule } from 'primeng/datepicker';

import { Official } from '../../models/official.model';
import { OfficialService } from '../../service/official.service';

@Component({
  selector: 'app-officials',
  templateUrl: './officials.component.html',
  styleUrls: ['./officials.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    ReactiveFormsModule,
    DropdownModule,
    TabViewModule,
    DatePickerModule
  ]
})
export class OfficialsComponent implements OnInit {
  officials: Official[] = [];
  selectedOfficial: Official | null = null;
  searchTerm: string = '';
  loading: boolean = false;
  loadingForm: boolean = false;
  showForm: boolean = false;
  isEditing: boolean = false;
  editingOfficialId?: string | null = null;
  activeIndex: number = 0;

  officialForm!: FormGroup;

  // Enums pour dropdowns
  officialTypes = [
    { label: 'Arbitre', value: 'REFEREE' },
    { label: 'Commissaire', value: 'COMMISSIONER' }
  ];
  levels = [
    { label: 'Régional', value: 'REGIONAL' },
    { label: 'National', value: 'NATIONAL' },
    { label: 'International', value: 'INTERNATIONAL' }
  ];
  statuses = [
    { label: 'Actif', value: 'ACTIVE' },
    { label: 'Suspendu', value: 'SUSPENDED' },
    { label: 'Retraité', value: 'RETIRED' }
  ];

  constructor(
    private officialService: OfficialService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.officialForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      date_of_birth: [''],
      birth_place: [''],
      nationality: [''],
      official_type: ['', Validators.required],
      license_number: ['', Validators.required],
      level: ['', Validators.required],
      status: ['', Validators.required],
      certification_date: [''],
      certification_expiry: [''],
      structure: [''],
      experience: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadOfficials();
  }

  loadOfficials(): void {
    this.loading = true;
    this.officialService.getAll().subscribe({
      next: (res: any) => {
        this.officials = res?.data?.officials || res || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des officiels'
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
    this.officialForm.reset();
    this.isEditing = false;
    this.editingOfficialId = null;
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  saveOfficial(): void {
    if (this.officialForm.valid) {
      this.loadingForm = true;
      //const payload = this.officialForm.value;
      const payload = {
        ...this.officialForm.value,
        date_of_birth: this.formatDate(this.officialForm.value.date_of_birth),
        certification_date: this.formatDate(this.officialForm.value.certification_date),
        certification_expiry: this.formatDate(this.officialForm.value.certification_expiry)
      };

      const onSuccess = () => {
        this.loadOfficials();
        this.toggleForm();
        this.loadingForm = false;
        this.messageService.add({
          severity: 'success',
          summary: this.isEditing ? 'Officiel modifié' : 'Officiel créé',
          detail: `${this.officialForm.get('first_name')?.value} ${this.officialForm.get('last_name')?.value}`,
          life: 3000
        });
      };

      const onError = () => {
        this.loadingForm = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} de l'officiel`
        });
      };

      if (this.isEditing && this.editingOfficialId) {
        this.officialService.update(this.editingOfficialId, payload).subscribe({ next: onSuccess, error: onError });
      } else {
        this.officialService.create(payload).subscribe({ next: onSuccess, error: onError });
      }
    } else {
      this.officialForm.markAllAsTouched();
    }
  }

  editOfficial(official: Official): void {
    this.officialForm.patchValue({
      first_name: official.first_name,
      last_name: official.last_name,
      date_of_birth: official.date_of_birth,
      birth_place: official.birth_place,
      nationality: official.nationality,
      official_type: official.official_type,
      license_number: official.license_number,
      level: official.level,
      status: official.status,
      certification_date: official.certification_date,
      certification_expiry: official.certification_expiry,
      structure: official.structure,
      experience: official.experience
    });
    this.isEditing = true;
    this.editingOfficialId = official.id;
    this.showForm = true;
  }

  deleteOfficial(id?: string): void {
    if (!id) return;
    this.confirmationService.confirm({
      icon: 'pi pi-exclamation-triangle',
      message: 'Voulez-vous vraiment supprimer cet officiel ?',
      accept: () => {
        this.officialService.delete(id).subscribe({
          next: () => {
            this.loadOfficials();
            this.messageService.add({
              severity: 'success',
              summary: 'Suppression réussie',
              detail: "L'officiel a été supprimé."
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression de l\'officiel'
            });
          }
        });
      }
    });
  }

  viewOfficialDetails(official: Official): void {
    this.router.navigate(['/officiel-details', official.id], { state: { official } });
  }

  get filteredOfficials(): Official[] {
    if (!this.searchTerm) return this.officials;
    return this.officials.filter(o =>
      o.first_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      o.last_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      o.license_number?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get referees() {
    return this.filteredOfficials.filter(o => o.official_type === 'REFEREE');
  }

  get commissioners() {
    return this.filteredOfficials.filter(o => o.official_type === 'COMMISSIONER');
  }

  getOriginalIndex(obj: any): number {
    return this.officials.indexOf(obj) + 1;
  }
}
