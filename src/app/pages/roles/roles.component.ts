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

  permissionsAdmin: Permission[] = [];
  permissionsMatch: Permission[] = [];
  permissionsOther: Permission[] = [];

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
      const [permissionsList, rolesRes] = await Promise.all([
        firstValueFrom(this.permissionService.getAllPages(100)),
        firstValueFrom(this.roleService.getAll())
      ]);

      // Traitement des permissions
      this.allPermissions = (permissionsList as any[]) ?? [];
      // Regrouper et trier
      const byName = (a: Permission, b: Permission) => a.name.localeCompare(b.name);
      this.permissionsAdmin = this.allPermissions.filter(p => this.getPermissionCategory(p.slug) === 'Administration').sort(byName);
      this.permissionsMatch = this.allPermissions.filter(p => this.getPermissionCategory(p.slug) === 'Match & Clubs').sort(byName);
      this.permissionsOther = this.allPermissions.filter(p => this.getPermissionCategory(p.slug) === 'Autres').sort(byName);
      
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

    // Conversion plus robuste des permissions
    let permissionSlugs: string[] = [];
    
    if (role.permissions && Array.isArray(role.permissions)) {
      permissionSlugs = role.permissions.map((p: any) => {
        if (typeof p === 'string') {
          return p;
        } else if (p && typeof p === 'object' && p.slug) {
          return p.slug;
        }
        return '';
      }).filter(slug => slug !== ''); // Filtrer les valeurs vides
    }

    console.log('Permissions extraites:', permissionSlugs);

    this.roleForm.reset({
      name: role.name || '',
      permissions: permissionSlugs
    });

    this.roleForm.markAsUntouched();
    this.roleForm.markAsPristine();
    this.showForm = true;
  }

  async saveRole(): Promise<void> {
    console.log('Tentative de sauvegarde du rôle');
    
    // Debug du formulaire avant validation
    this.debugForm();

    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      
      // Messages d'erreur plus spécifiques
      const nameControl = this.roleForm.get('name');
      const permissionsControl = this.roleForm.get('permissions');
      
      let errorDetails = 'Veuillez corriger les erreurs suivantes : ';
      if (nameControl?.errors) {
        if (nameControl.errors['required']) {
          errorDetails += 'Le nom est requis. ';
        }
        if (nameControl.errors['minlength']) {
          errorDetails += 'Le nom doit contenir au moins 2 caractères. ';
        }
      }
      if (permissionsControl?.errors) {
        if (permissionsControl.errors['required']) {
          errorDetails += 'Au moins une permission doit être sélectionnée.';
        }
      }

      this.messageService.add({
        severity: 'warn',
        summary: 'Formulaire invalide',
        detail: errorDetails
      });
      return;
    }

    this.isSubmitting = true;

    // Nettoyage et validation du payload
    const formValue = this.roleForm.value;
    
    // Validation supplémentaire
    if (!formValue.name || typeof formValue.name !== 'string' || formValue.name.trim().length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de validation',
        detail: 'Le nom du rôle est requis.'
      });
      this.isSubmitting = false;
      return;
    }

    if (!formValue.permissions || !Array.isArray(formValue.permissions) || formValue.permissions.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de validation',
        detail: 'Au moins une permission doit être sélectionnée.'
      });
      this.isSubmitting = false;
      return;
    }

    const payload = {
      name: formValue.name.trim(),
      permissions: formValue.permissions.filter((p: any) => {
        const slug = typeof p === 'string' ? p : (p && p.slug ? p.slug : '');
        return slug && slug.trim() !== '';
      })
    };

    // Vérifier si quelque chose a réellement changé
    if (this.isEditing && this.currentRole) {
      const originalPermissions = Array.isArray(this.currentRole.permissions) ? 
        this.currentRole.permissions.sort() : [];
      const newPermissions = payload.permissions.sort();
      
      const nameChanged = payload.name !== this.currentRole.name;
      const permissionsChanged = JSON.stringify(originalPermissions) !== JSON.stringify(newPermissions);
      
      console.log('Changements détectés:', {
        nameChanged,
        permissionsChanged,
        originalName: this.currentRole.name,
        newName: payload.name,
        originalPermissions,
        newPermissions
      });
      
      if (!nameChanged && !permissionsChanged) {
        this.messageService.add({
          severity: 'info',
          summary: 'Aucun changement',
          detail: 'Aucune modification n\'a été détectée.'
        });
        this.isSubmitting = false;
        return;
      }
    }

    // Validation finale du payload
    if (payload.permissions.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de validation',
        detail: 'Aucune permission valide trouvée.'
      });
      this.isSubmitting = false;
      return;
    }

    try {
      let result: any;

      if (this.isEditing && this.currentRole?.slug) {
        console.log('=== MISE À JOUR D\'UN RÔLE ===');
        console.log('Slug du rôle à modifier:', this.currentRole.slug);
        console.log('Nom original:', this.currentRole.name);
        console.log('Nouveau nom:', payload.name);
        console.log('Permissions originales:', this.currentRole.permissions);
        console.log('Nouvelles permissions:', payload.permissions);
        console.log('URL complète:', `${this.roleService['apiUrl']}/${this.currentRole.slug}`);
        console.log('Payload envoyé:', payload);
        console.log('=== FIN DEBUG MISE À JOUR ===');
        
        result = await firstValueFrom(
          this.roleService.update(this.currentRole.slug, payload)
        );
      } else {
        console.log('Création d\'un nouveau rôle');
        result = await firstValueFrom(this.roleService.create(payload));
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
      console.error('Détails de l\'erreur:', {
        status: error.status,
        statusText: error.statusText,
        error: error.error,
        message: error.message
      });

      let errorMsg = 'Une erreur est survenue lors de l\'enregistrement.';
      
      if (error.status === 400) {
        if (error.error && error.error.message) {
          errorMsg = `Erreur de validation : ${error.error.message}`;
        } else if (error.error && typeof error.error === 'object') {
          // Si l'erreur contient des détails de validation
          const errorDetails = Object.values(error.error).flat().join(', ');
          errorMsg = `Erreur de validation : ${errorDetails}`;
        } else {
          errorMsg = 'Données invalides. Vérifiez le nom et les permissions sélectionnées.';
        }
      } else if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
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

  // Catégories de permissions (heuristique par slug)
  getPermissionCategory(slug: string): string {
    const s = slug.toLowerCase();
    if (s.includes('admin') || s.includes('param')) return 'Administration';
    if (s.includes('match') || s.includes('club') || s.includes('team')) return 'Match & Clubs';
    return 'Autres';
  }

  getPermissionBadgeClass(slug: string): string {
    const s = slug.toLowerCase();
    if (s.includes('admin') || s.includes('param')) return 'badge-red';
    if (s.includes('match') || s.includes('club') || s.includes('team')) return 'badge-green';
    return 'badge-gray';
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
    const formValue = this.roleForm.value;
    const nameControl = this.roleForm.get('name');
    const permissionsControl = this.roleForm.get('permissions');

    console.log('=== DEBUG FORMULAIRE ===');
    console.log('Formulaire valide:', this.roleForm.valid);
    console.log('Formulaire invalide:', this.roleForm.invalid);
    console.log('Valeur du formulaire:', formValue);
    console.log('Erreurs du formulaire:', this.roleForm.errors);
    
    console.log('--- Contrôle Name ---');
    console.log('Valeur:', nameControl?.value);
    console.log('Valide:', nameControl?.valid);
    console.log('Erreurs:', nameControl?.errors);
    
    console.log('--- Contrôle Permissions ---');
    console.log('Valeur:', permissionsControl?.value);
    console.log('Type:', Array.isArray(permissionsControl?.value) ? 'Array' : typeof permissionsControl?.value);
    console.log('Longueur:', permissionsControl?.value?.length);
    console.log('Valide:', permissionsControl?.valid);
    console.log('Erreurs:', permissionsControl?.errors);
    
    if (this.isEditing && this.currentRole) {
      console.log('--- Rôle en cours d\'édition ---');
      console.log('Slug:', this.currentRole.slug);
      console.log('Nom:', this.currentRole.name);
      console.log('Permissions originales:', this.currentRole.permissions);
    }
    
    console.log('=== FIN DEBUG ===');
  }
}