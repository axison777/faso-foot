import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../service/user.service';
import { RoleService } from '../../service/role.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { User, UserRole } from '../../models/user.model';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  standalone: true,
  styleUrls: ['./users.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule,
    MultiSelectModule,
    ReactiveFormsModule,
    InputSwitchModule
  ],
  providers: [MessageService, ConfirmationService, RoleService]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUser!: User;
  searchTerm: string = '';
  loading: boolean = false;
  loadingRoles: boolean = false;

  showForm: boolean = false;
  isEditing: boolean = false;
  editingUserSlug?: string | null = null;
  showDetails: boolean = false;
  currentUser: User | null = null;
  userForm!: FormGroup;

  // Rôles chargés depuis le backend
  availableRoles: { name: string; value: string }[] = [];

  // Switch global "Tout sélectionner"
  allRolesSelected: boolean = false;

  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      roles: [[], Validators.required] // Array de rôles
    });
  }

  // Charger les rôles depuis le backend
  loadRoles(): void {
    this.loadingRoles = true;
    this.roleService.getAll().subscribe({
      next: (response) => {
        console.log('Réponse rôles du backend:', response);
        if (response.status && response.data) {
          this.availableRoles = Array.isArray(response.data)
            ? response.data.map((role: Role) => ({
                name: role.name,
                value: role.slug ?? ''
              }))
            : [];
        } else {
          this.availableRoles = [];
        }
        this.loadingRoles = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rôles:', error);
        this.availableRoles = [];
        this.loadingRoles = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention',
          detail: 'Impossible de charger les rôles',
          life: 3000
        });
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Réponse utilisateurs du backend:', response);
        if (response.status) {
          this.users = Array.isArray(response.data) ? response.data : [];
          if (response.meta) {
            this.totalItems = parseInt(response.meta.total);
            this.totalPages = parseInt(response.meta.last_page);
            this.currentPage = parseInt(response.meta.current_page);
          }
        } else {
          this.users = [];
          this.messageService.add({
            severity: 'warn',
            summary: 'Attention',
            detail: response.message || 'Aucun utilisateur trouvé',
            life: 3000
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.loading = false;
        this.users = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des utilisateurs',
          life: 5000
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

  openCreate(): void {
    this.isEditing = false;
    this.editingUserSlug = null;
    this.resetForm();
    this.showForm = true;
  }

  openEdit(user: User): void {
    console.log('=== OUVERTURE ÉDITION UTILISATEUR ===');
    console.log('Utilisateur à éditer:', user);

    this.isEditing = true;
    this.editingUserSlug = user.slug || null;

    // Extraire les slugs des rôles pour le formulaire
    const rolesSlugs = this.extractRoleSlugs(user.roles || []);
    console.log('Rôles extraits pour le formulaire:', rolesSlugs);

    this.userForm.reset({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      roles: rolesSlugs
    });

    this.updateAllRolesSelected(); // maj du switch global

    this.showForm = true;
  }

  resetForm(): void {
    this.userForm.reset();
    this.userForm.patchValue({
      roles: []
    });
    this.isEditing = false;
    this.editingUserSlug = null;
    this.allRolesSelected = false;
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const userPayload = {
        last_name: this.userForm.get('last_name')?.value?.trim(),
        first_name: this.userForm.get('first_name')?.value?.trim(),
        email: this.userForm.get('email')?.value?.trim().toLowerCase(),
        roles: this.userForm.get('roles')?.value || []
      };

      console.log('=== SAUVEGARDE UTILISATEUR ===');
      console.log('Mode édition:', this.isEditing);
      console.log('Slug à éditer:', this.editingUserSlug);
      console.log('Payload:', userPayload);

      const request$ = this.isEditing && this.editingUserSlug
        ? this.userService.update(this.editingUserSlug, userPayload)
        : this.userService.create(userPayload);

      request$.subscribe({
        next: (response) => {
          console.log('Réponse sauvegarde:', response);
          if (response.status) {
            this.loadUsers();
            this.toggleForm();
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: response.message || 'Utilisateur sauvegardé avec succès',
              life: 3000
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: response.message || 'Erreur lors de la sauvegarde',
              life: 5000
            });
          }
        },
        error: (error) => {
          console.error('Erreur sauvegarde utilisateur:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors de la sauvegarde de l\'utilisateur',
            life: 5000
          });
        }
      });
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulaire invalide',
        detail: 'Veuillez corriger les erreurs dans le formulaire',
        life: 3000
      });
    }
  }

  // MÉTHODE CORRIGÉE POUR AFFICHER LES DÉTAILS
  viewUser(user: User): void {
    console.log('=== AFFICHAGE DÉTAILS UTILISATEUR ===');
    console.log('Utilisateur sélectionné:', user);
    console.log('Slug à utiliser:', user.slug);

    if (!user.slug) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Identifiant utilisateur manquant',
        life: 3000
      });
      return;
    }

    // Debug de l'URL qui sera appelée
    console.log('URL qui sera appelée:', `${this.userService['apiUrl']}/${user.slug}`);

    this.userService.getBySlug(user.slug).subscribe({
      next: (response) => {
        console.log('=== RÉPONSE DU BACKEND ===');
        console.log('Réponse complète:', response);
        console.log('Status:', response?.status);
        console.log('Data:', response?.data);
        console.log('Message:', response?.message);

        if (response && response.status && response.data) {
          // CORRECTION : Gérer la structure data.user du backend
          const userData = (response.data as any).user || response.data;

          console.log('=== DONNÉES UTILISATEUR EXTRAITES ===');
          console.log('Données utilisateur:', userData);
          console.log('Rôles de l\'utilisateur:', userData.roles);

          this.currentUser = userData;
          this.showDetails = true;
        } else {
          console.error('Structure de réponse inattendue:', response);
          this.messageService.add({
            severity: 'warn',
            summary: 'Attention',
            detail: response?.message || 'Aucune donnée utilisateur disponible',
            life: 3000
          });
        }
      },
      error: (error) => {
        console.error('=== ERREUR RÉCUPÉRATION UTILISATEUR ===');
        console.error('Erreur complète:', error);
        console.error('Status:', error.status);
        console.error('URL:', error.url);
        console.error('Message:', error.message);

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Impossible de récupérer les détails de l'utilisateur (${error.status || 'Erreur inconnue'})`,
          life: 3000
        });
      }
    });
  }

  deleteUser(slug?: string): void {
    if (!slug) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Identifiant utilisateur manquant',
        life: 3000
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.userService.delete(slug).subscribe({
          next: (response) => {
            if (response.status) {
              this.loadUsers();
              this.messageService.add({
                severity: 'success',
                summary: 'Suppression réussie',
                detail: response.message || 'Utilisateur supprimé avec succès',
                life: 3000
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: response.message || 'Erreur lors de la suppression',
                life: 5000
              });
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression de l\'utilisateur',
              life: 5000
            });
          }
        });
      }
    });
  }

  get filteredUsers(): User[] {
    if (!this.searchTerm) return this.users;
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    return this.users.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower) ||
      this.getUserRolesAsString(user.roles || []).toLowerCase().includes(searchTermLower)
    );
  }

  // === MÉTHODES POUR GÉRER LES RÔLES ===

  extractRoleSlugs(roles: (string | UserRole)[]): string[] {
    return roles.map(role => {
      if (typeof role === 'string') {
        return role;
      } else if (role && typeof role === 'object' && role.slug) {
        return role.slug;
      }
      return '';
    }).filter(slug => slug !== '');
  }

  getRoleLabel(role: string | UserRole): string {
    if (typeof role === 'object' && role !== null) {
      return role.name || role.slug || 'Rôle inconnu';
    }

    const availableRole = this.availableRoles.find(r => r.value === role);
    return availableRole ? availableRole.name : role;
  }

  getUserRolesAsString(roles: (string | UserRole)[] = []): string {
    return roles.map(role => this.getRoleLabel(role)).join(', ');
  }

  getRoleLabels(roles: (string | UserRole)[] = []): string {
    return this.getUserRolesAsString(roles);
  }

  getRoleClasses(role: string | UserRole): string {
    const roleSlug = typeof role === 'object' ? (role.slug || '') : role;

    if (roleSlug && typeof roleSlug === 'string') {
      const slug = roleSlug.toLowerCase();
      if (slug.includes('admin')) return 'role-admin';
      if (slug.includes('manager')) return 'role-manager';
    }
    return 'role-user';
  }

  onToggleRole(value: string, checked: boolean): void {
    const control = this.userForm.get('roles');
    if (!control) return;

    const current: string[] = (control.value || []) as string[];
    const exists = current.includes(value);

    if (checked && !exists) {
      control.setValue([...current, value]);
    } else if (!checked && exists) {
      control.setValue(current.filter(v => v !== value));
    }

    control.markAsDirty();
    control.markAsTouched();

    this.updateAllRolesSelected();
  }

  toggleAllRoles(checked: boolean): void {
    const control = this.userForm.get('roles');
    if (!control) return;

    if (checked) {
      control.setValue(this.availableRoles.map(r => r.value));
    } else {
      control.setValue([]);
    }

    control.markAsDirty();
    control.markAsTouched();
    this.allRolesSelected = checked;
  }

  updateAllRolesSelected(): void {
    const control = this.userForm.get('roles');
    if (!control) return;

    this.allRolesSelected = control.value?.length === this.availableRoles.length;
  }

  // === MÉTHODES POUR LES DÉTAILS ===

  closeDetails(): void {
    this.showDetails = false;
    this.currentUser = null;
  }

  editFromDetails(): void {
    if (this.currentUser) {
      this.openEdit(this.currentUser);
      this.closeDetails();
    }
  }
}
