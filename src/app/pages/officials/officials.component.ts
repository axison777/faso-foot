import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
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
    SelectModule,
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
      // Ancien modèle :
      /*
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      date_of_birth: [''],
      birth_place: [''],
      nationality: [''],
      email: ['', [Validators.required, Validators.email]],
      */

      // Nouveau modèle (les infos personnelles viennent de l’entité User associée à user_id)
      user_first_name: ['', Validators.required],
      user_last_name: ['', Validators.required],
      user_email: ['', [Validators.required, Validators.email]],

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
        if (res.status && res.data?.officials) {
          this.officials = res.data.officials.map((o: any) => ({
            ...o,
            // flatten pour simplifier l’affichage et le form
            first_name: o.user?.first_name,
            last_name: o.user?.last_name,
            email: o.user?.email,
          }));

          // séparer arbitres et commissaires
          /* this.referees = officials.filter((o) => o.official_type === 'REFEREE');
          this.commissioners = officials.filter((o) => o.official_type === 'COMMISSIONER'); */
        }
        this.loading = false;
      }, error: () => {
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

      const payload = {
        first_name: this.officialForm.value.user_first_name,
        last_name: this.officialForm.value.user_last_name,
        email: this.officialForm.value.user_email,
        official_type: this.officialForm.value.official_type,
        license_number: this.officialForm.value.license_number,
        level: this.officialForm.value.level,
        status: this.officialForm.value.status,
        certification_date: this.officialForm.value.certification_date,
        certification_expiry: this.officialForm.value.certification_expiry,
        structure: this.officialForm.value.structure,
        experience: this.officialForm.value.experience,
      };

      const onSuccess = () => {
        this.loadOfficials();
        this.toggleForm();
        this.loadingForm = false;
        this.messageService.add({
          severity: 'success',
          summary: this.isEditing ? 'Officiel modifié' : 'Officiel créé',
          detail: `${this.officialForm.get('user_first_name')?.value} ${this.officialForm.get('user_last_name')?.value}`,
          life: 3000
        });
      };

      const onError = (error: any) => {
        this.loadingForm = false;

        const specificMessage =
          error?.error?.message ||
          error?.error?.errors?.license_number?.[0] ||
          `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} de l'officiel`;

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: specificMessage
        });
      };

      if (this.isEditing && this.editingOfficialId) {
        this.officialService.update(this.editingOfficialId, payload)
          .subscribe({ next: onSuccess, error: onError });
      } else {
        this.officialService.create(payload)
          .subscribe({ next: onSuccess, error: onError });
      }

    } else {
      this.officialForm.markAllAsTouched();
    }
  }

  editOfficial(o: any) {
    this.isEditing = true;
    this.showForm = true;

    this.officialForm.patchValue({
      first_name: o.first_name,
      last_name: o.last_name,
      email: o.email,
      official_type: o.official_type,
      license_number: o.license_number,
      level: o.level,
      status: o.status,
      certification_date: o.certification_date ? new Date(o.certification_date) : null,
      certification_expiry: o.certification_expiry ? new Date(o.certification_expiry) : null,
      structure: o.structure,
      experience: o.experience,
    });

    this.editingOfficialId = o.id;
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
      // Ancien modèle :
      /*
      o.first_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      o.last_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      o.license_number?.toLowerCase().includes(this.searchTerm.toLowerCase())
      */
      o.user?.first_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      o.user?.last_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
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
