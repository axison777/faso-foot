// src/app/pages/roles/roles.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';

// PrimeNG Modules
import { Table, TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputSwitchModule } from 'primeng/inputswitch';

// Services & Models
import { RoleService, PaginatedRolesResponse, SingleRoleResponse } from '../../service/role.service';
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
    InputTextModule, ConfirmDialogModule, ToastModule, MultiSelectModule,
    SidebarModule, TooltipModule, CardModule, TagModule, InputSwitchModule
  ],
  providers: [MessageService, ConfirmationService, RoleService, PermissionService]
})
export class RolesComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  roles: Role[] = [];
  allPermissions: Permission[] = [];
  loading = true;
  isSubmitting = false;

  // Propriétés pour les dialogs
  showForm = false;
  showDetails = false;
  isEditing = false;
  currentRole: Role | null = null;
  roleForm!: FormGroup;

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

  // Validateur personnalisé pour s'assurer qu'au moins une permission est sélectionnée
  private atLeastOneValidator(control: any) {
    const permissions = control.value;
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return { required: true };
    }
    return null;
  }

  async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      const [permissionsRes, rolesRes] = await Promise.all([
        firstValueFrom(this.permissionService.getAll()),
        firstValueFrom(this.roleService.getAll())
      ]);

      // Traitement des permissions
      this.allPermissions = (permissionsRes as any)?.data ?? [];
      
      // Traitement des rôles
      this.roles = ((rolesRes as PaginatedRolesResponse)?.data ?? []).map((role: any) => ({
        ...role,
        permissions: (role.permissions ?? []).map((p: any) => 
          typeof p === 'object' ? p.slug : p
        )
      }));

      console.log('Données chargées:', { 
        roles: this.roles.length, 
        permissions: this.allPermissions.length 
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Erreur', 
        detail: 'Impossible de charger les données initiales.' 
      });
    } finally {
      this.loading = false;
    }
  }

  // --- Méthodes CRUD ---
  
  openCreate(): void {
    console.log('Ouverture du formulaire de création');
    this.isEditing = false;
    this.currentRole = null;
    this.isSubmitting = false;
    
    this.roleForm.reset({
      name: '',
      permissions: []
    });
    
    // Marquer le formulaire comme non touché
    this.roleForm.markAsUntouched();
    this.roleForm.markAsPristine();
    
    this.showForm = true;
  }

  openEdit(role: Role): void {
    console.log('Ouverture du formulaire d\'édition pour:', role);
    this.isEditing = true;
    this.currentRole = { ...role };
    this.isSubmitting = false;
    
    const permissionSlugs = (role.permissions || []).map(p => 
      typeof p === 'string' ? p : (p as Permission).slug
    );

    this.roleForm.reset({
      name: role.name,
      permissions: permissionSlugs
    });
    
    // Marquer le formulaire comme non touché
    this.roleForm.markAsUntouched();
    this.roleForm.markAsPristine();
    
    this.showForm = true;
  }

  async saveRole(): Promise<void> {
    console.log('Tentative de sauvegarde du rôle');
    console.log('État du formulaire:', {
      valid: this.roleForm.valid,
      value: this.roleForm.value,
      errors: this.roleForm.errors
    });

    // Vérification de la validité du formulaire
    if (this.roleForm.invalid) {
      console.log('Formulaire invalide, marquage des champs comme touchés');
      this.roleForm.markAllAsTouched();
      
      // Affichage des erreurs spécifiques
      Object.keys(this.roleForm.controls).forEach(key => {
        const control = this.roleForm.get(key);
        if (control && control.errors) {
          console.log(`Erreurs pour ${key}:`, control.errors);
        }
      });
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulaire invalide',
        detail: 'Veuillez corriger les erreurs avant de continuer.'
      });
      return;
    }

    this.isSubmitting = true;
    const payload = this.roleForm.value;
    
    console.log('Payload à envoyer:', payload);

    try {
      let result: any;
      
      if (this.isEditing && this.currentRole?.slug) {
        console.log('Mise à jour du rôle:', this.currentRole.slug);
        result = await firstValueFrom(
          this.roleService.update(this.currentRole.slug, payload) as Observable<Role>
        );
      } else {
        console.log('Création d\'un nouveau rôle');
        result = await firstValueFrom(
          this.roleService.create(payload) as Observable<Role>
        );
      }
      
      console.log('Résultat de l\'opération:', result);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `Rôle ${this.isEditing ? 'mis à jour' : 'créé'} avec succès.`
      });

      this.showForm = false;
      await this.loadInitialData();
      
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      let errorMsg = 'Une erreur est survenue lors de l\'enregistrement.';
      
      if (error?.error?.message) {
        errorMsg = error.error.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Erreur', 
        detail: errorMsg 
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  confirmDelete(role: Role): void {
    if (!role.slug) {
      console.error('Impossible de supprimer un rôle sans slug');
      return;
    }

    this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`,
    header: 'Confirmation de suppression',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui, supprimer',
    rejectLabel: 'Annuler',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    accept: async () => {
    try {
    await firstValueFrom(this.roleService.delete(role.slug!));
    
    this.messageService.add({ 
    severity: 'success', 
      summary: 'Supprimé', 
      detail: `Rôle "${role.name}" supprimé avec succès.` 
    });
    
    // Mise à jour locale de la liste
      this.roles = this.roles.filter(r => r.slug !== role.slug);
    
    } catch (error: any) {
    console.error('Erreur lors de la suppression:', error);
    
    this.messageService.add({ 
    severity: 'error', 
      summary: 'Erreur', 
        detail: error?.error?.message || 'La suppression a échoué.' 
        });
        }
      }
    });
  }

  openDetails(role: Role): void {
    this.currentRole = role;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.currentRole = null;
  }

  // --- Méthodes utilitaires pour le template ---

  cancelForm(): void {
    this.showForm = false;
    this.roleForm.reset({ name: '', permissions: [] });
    this.currentRole = null;
    this.isEditing = false;
    this.isSubmitting = false;
  }

  editFromDetails(): void {
    this.showDetails = false;
    if (this.currentRole) {
      this.openEdit(this.currentRole);
    }
  }

  applyFilterGlobal(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(filterValue, 'contains');
  }

  getPermissionSeverity(count: number): string {
    if (count === 0) return 'danger';
    if (count <= 2) return 'warning';
    if (count <= 5) return 'info';
    return 'success';
  }

  getPermissionName(slug: string): string {
    const permission = this.allPermissions.find(p => p.slug === slug);
    return permission ? permission.name : slug;
  }

  getPermissionsCount(role: Role): number {
    return role.permissions?.length || 0;
  }

  getPermissionsText(role: Role): string {
    if (!role.permissions || role.permissions.length === 0) {
      return '—';
    }
    
    const permissionNames = role.permissions.map(slug => 
      this.getPermissionName(typeof slug === 'string' ? slug : slug)
    );
    
    return permissionNames.join(', ');
  }

  // --- Gestion des toggles de permissions dans le formulaire ---
  togglePermission(slug: string, checked: boolean): void {
    const control = this.roleForm.get('permissions');
    if (!control) return;

    const current: string[] = (control.value || []) as string[];
    const exists = current.includes(slug);

    if (checked && !exists) {
      control.setValue([...current, slug]);
    } else if (!checked && exists) {
      control.setValue(current.filter(s => s !== slug));
    }
    control.markAsDirty();
    control.markAsTouched();
  }

  // Méthodes trackBy pour optimiser les performances
  trackBySlug(index: number, item: Role): any {
    return item.slug || index;
  }

  trackPermission(index: number, item: any): any {
    return item || index;
  }

  // --- Méthodes de compatibilité (getters/setters) ---
  
  get isSidebarVisible(): boolean {
    return this.showForm;
  }

  set isSidebarVisible(value: boolean) {
    this.showForm = value;
  }

  get isDetailsVisible(): boolean {
    return this.showDetails;
  }

  set isDetailsVisible(value: boolean) {
    this.showDetails = value;
  }

  // --- Méthodes de debugging ---
  
  debugForm(): void {
    console.log('Debug du formulaire:', {
      valid: this.roleForm.valid,
      invalid: this.roleForm.invalid,
      value: this.roleForm.value,
      errors: this.roleForm.errors,
      nameControl: {
        value: this.roleForm.get('name')?.value,
        valid: this.roleForm.get('name')?.valid,
        errors: this.roleForm.get('name')?.errors
      },
      permissionsControl: {
        value: this.roleForm.get('permissions')?.value,
        valid: this.roleForm.get('permissions')?.valid,
        errors: this.roleForm.get('permissions')?.errors
      }
    });
  }
}