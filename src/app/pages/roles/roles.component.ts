// src/app/pages/roles/roles.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// PrimeNG
import { Table, TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputSwitchModule } from 'primeng/inputswitch';

// Services & Models
import { RoleService, PaginatedRolesResponse } from '../../service/role.service';
import { Role } from '../../models/role.model';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-roles',
  standalone: true,
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, TableModule, DialogModule, ButtonModule,
    InputTextModule, ConfirmDialogModule, ToastModule, InputSwitchModule
  ],
  providers: [MessageService, ConfirmationService, RoleService]
})
export class RolesComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  roles: Role[] = [];

  loading = true;
  isSubmitting = false;

  showForm = false;
  showDetails = false;
  isEditing = false;
  currentRole: Role | null = null;

  roleForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  private initializeForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      const rolesRes = await firstValueFrom(this.roleService.getAll());
      this.roles = ((rolesRes as PaginatedRolesResponse)?.data ?? []);
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les données.' });
    } finally {
      this.loading = false;
    }
  }

  // --- CRUD ---

  openCreate(): void {
    this.isEditing = false;
    this.currentRole = null;
    this.roleForm.reset({ name: '' });
    this.showForm = true;
  }

  openEdit(role: Role): void {
    this.isEditing = true;
    this.currentRole = { ...role };
    this.roleForm.reset({ name: role.name || '' });
    this.showForm = true;
  }

  async saveRole(): Promise<void> {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.roleForm.value;
    const payload = {
      name: formValue.name.trim()
    };

    try {
      if (this.isEditing && this.currentRole?.slug) {
        await firstValueFrom(this.roleService.update(this.currentRole.slug, payload));
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Rôle mis à jour avec succès.' });
      } else {
        await firstValueFrom(this.roleService.create(payload));
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Rôle créé avec succès.' });
      }
      this.showForm = false;
      await this.loadInitialData();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement.' });
    } finally {
      this.isSubmitting = false;
    }
  }

  confirmDelete(role: Role): void {
    if (!role.slug) return;
    this.confirmationService.confirm({
      message: `Supprimer le rôle "${role.name}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await firstValueFrom(this.roleService.delete(role.slug!));
          this.roles = this.roles.filter(r => r.slug !== role.slug);
          this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: `Rôle "${role.name}" supprimé.` });
        } catch {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La suppression a échoué.' });
        }
      }
    });
  }

  // --- Détails ---
  openDetails(role: Role): void {
    this.currentRole = role;
    this.showDetails = true;
  }
  closeDetails(): void {
    this.showDetails = false;
    this.currentRole = null;
  }
  editFromDetails(): void {
    if (this.currentRole) {
      this.openEdit(this.currentRole);
      this.showDetails = false;
    }
  }

  // --- Utils ---
  cancelForm(): void {
    this.showForm = false;
    this.roleForm.reset();
    this.currentRole = null;
  }

  applyFilterGlobal(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(filterValue, 'contains');
  }

  trackBySlug(index: number, item: Role): any {
    return item.slug || index;
  }
}
