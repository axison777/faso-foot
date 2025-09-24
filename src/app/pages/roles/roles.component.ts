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
import { PermissionService } from '../../service/permission.service';
import { Role, Permission } from '../../models/role.model';
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
  providers: [MessageService, ConfirmationService, RoleService, PermissionService]
})
export class RolesComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  roles: Role[] = [];
  allPermissions: Permission[] = [];
  permissionsAdmin: Permission[] = [];
  permissionsMatch: Permission[] = [];
  permissionsOther: Permission[] = [];

  loading = true;
  isSubmitting = false;

  showForm = false;
  showDetails = false;
  isEditing = false;
  currentRole: Role | null = null;

  roleForm!: FormGroup;
  allSelected = false; // Pour le switch "Tout sélectionner"

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  private initializeForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      permissions: [[], [Validators.required, this.atLeastOneValidator]]
    });
  }

  private atLeastOneValidator(control: any) {
    const value = control.value;
    return !value || value.length === 0 ? { required: true } : null;
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      const [permissionsList, rolesRes] = await Promise.all([
        firstValueFrom(this.permissionService.getAllPages(100)),
        firstValueFrom(this.roleService.getAll())
      ]);

      this.allPermissions = (permissionsList as any[]) ?? [];

      const byName = (a: Permission, b: Permission) => a.name.localeCompare(b.name);
      this.permissionsAdmin = this.allPermissions.filter(p => this.getPermissionCategory(p.slug) === 'Administration').sort(byName);
      this.permissionsMatch = this.allPermissions.filter(p => this.getPermissionCategory(p.slug) === 'Match & Clubs').sort(byName);
      this.permissionsOther = this.allPermissions.filter(p => this.getPermissionCategory(p.slug) === 'Autres').sort(byName);

      this.roles = ((rolesRes as PaginatedRolesResponse)?.data ?? []).map((role: any) => ({
        ...role,
        permissions: (role.permissions ?? []).map((p: any) => (typeof p === 'object' ? p.slug : p))
      }));

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
    this.roleForm.reset({ name: '', permissions: [] });
    this.showForm = true;
  }

  openEdit(role: Role): void {
    this.isEditing = true;
    this.currentRole = { ...role };
    const permissionSlugs = (role.permissions ?? []).map((p: any) => (typeof p === 'string' ? p : p.slug)).filter(Boolean);
    this.roleForm.reset({ name: role.name || '', permissions: permissionSlugs });
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
      name: formValue.name.trim(),
      permissions: formValue.permissions
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

  getPermissionName(slug: string): string {
    return this.allPermissions.find(p => p.slug === slug)?.name || slug;
  }

  getPermissionBadgeClass(slug: string): string {
    const s = slug.toLowerCase();
    if (s.includes('admin') || s.includes('param')) return 'badge-red';
    if (s.includes('match') || s.includes('club') || s.includes('team')) return 'badge-green';
    return 'badge-gray';
  }

  getPermissionCategory(slug: string): string {
    const s = slug.toLowerCase();
    if (s.includes('admin') || s.includes('param')) return 'Administration';
    if (s.includes('match') || s.includes('club') || s.includes('team')) return 'Match & Clubs';
    return 'Autres';
  }

  togglePermission(slug: string, checked: boolean): void {
    const control = this.roleForm.get('permissions');
    if (!control) return;
    const current: string[] = control.value || [];
    if (checked && !current.includes(slug)) {
      control.setValue([...current, slug]);
    } else if (!checked && current.includes(slug)) {
      control.setValue(current.filter(s => s !== slug));
    }
    control.markAsDirty();
  }

  toggleAllPermissions(checked: boolean): void {
    const control = this.roleForm.get('permissions');
    if (!control) return;
    this.allSelected = checked;
    control.setValue(checked ? this.allPermissions.map(p => p.slug) : []);
    control.markAsDirty();
  }

  trackBySlug(index: number, item: Role): any {
    return item.slug || index;
  }
  trackPermission(index: number, item: Permission): any {
    return item.slug || index;
  }
}
