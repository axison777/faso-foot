import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../service/user.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { User } from '../../models/user.model';

// Interface pour les rôles récupérés du backend
interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

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
    ReactiveFormsModule
  ],
  providers: [MessageService, ConfirmationService]
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
  userForm!: FormGroup;
  
  // Rôles chargés depuis le backend
  availableRoles: { name: string; value: string }[] = [];

  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;

  constructor(
    private userService: UserService,
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
    this.userService.getRoles().subscribe({
      next: (response) => {
        console.log('Réponse rôles du backend:', response);
        if (response.status && response.data) {
          // Adapter les rôles selon la structure retournée par votre API
          this.availableRoles = Array.isArray(response.data) 
            ? response.data.map((role: Role) => ({
                name: role.name,
                value: role.slug || role.id // Utiliser slug ou id selon votre API
              }))
            : [];
          console.log('Rôles disponibles adaptés:', this.availableRoles);
        } else {
          // Rôles par défaut si l'API n'est pas disponible
          this.availableRoles = [
            { name: 'Administrateur', value: 'admin' },
            { name: 'Manager', value: 'manager' },
            { name: 'Utilisateur', value: 'user' }
          ];
          console.log('Utilisation des rôles par défaut');
        }
        this.loadingRoles = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rôles:', error);
        // Utiliser des rôles par défaut en cas d'erreur
        this.availableRoles = [
          { name: 'Administrateur', value: 'admin' },
          { name: 'Manager', value: 'manager' },
          { name: 'Utilisateur', value: 'user' }
        ];
        this.loadingRoles = false;
        console.log('Rôles par défaut chargés après erreur');
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    
    // Chargement de tous les utilisateurs (sans pagination pour la liste complète)
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Réponse utilisateurs du backend:', response);
        if (response.status) {
          this.users = Array.isArray(response.data) ? response.data : [];
          
          // Debug pour voir la structure des rôles dans les utilisateurs
          if (this.users.length > 0) {
            console.log('Exemple d\'utilisateur avec rôles:', this.users[0]);
            console.log('Structure des rôles du premier utilisateur:', this.users[0].roles);
          }
          
          // Si vous avez des métadonnées de pagination
          if (response.meta) {
            this.totalItems = parseInt(response.meta.total);
            this.totalPages = parseInt(response.meta.last_page);
            this.currentPage = parseInt(response.meta.current_page);
          }
          
          console.log('Utilisateurs chargés:', this.users.length);
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
        
        let errorMessage = 'Erreur lors du chargement des utilisateurs';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage,
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

  resetForm(): void {
    this.userForm.reset();
    this.userForm.patchValue({
      roles: [] // Réinitialiser avec un array vide
    });
    this.isEditing = false;
    this.editingUserSlug = null;
  }

  saveUser(): void {
    if (this.userForm.valid) {
      // IMPORTANT: Ordre exact selon votre API (last_name en premier)
      const userPayload = {
        last_name: this.userForm.get('last_name')?.value?.trim(),
        first_name: this.userForm.get('first_name')?.value?.trim(), 
        email: this.userForm.get('email')?.value?.trim().toLowerCase(),
        roles: this.userForm.get('roles')?.value || []
      };

      // Validation complète des données avant envoi
      console.log('=== VALIDATION DES DONNÉES ===');
      console.log('Formulaire valide:', this.userForm.valid);
      console.log('Payload final:', userPayload);
      console.log('============================');

      // Validation supplémentaire 
      if (!userPayload.last_name || userPayload.last_name.length < 2) {
        this.messageService.add({
          severity: 'error',
          summary: 'Nom invalide',
          detail: 'Le nom doit contenir au moins 2 caractères',
          life: 3000
        });
        return;
      }

      if (!userPayload.first_name || userPayload.first_name.length < 2) {
        this.messageService.add({
          severity: 'error',
          summary: 'Prénom invalide', 
          detail: 'Le prénom doit contenir au moins 2 caractères',
          life: 3000
        });
        return;
      }

      if (!userPayload.email || !userPayload.email.includes('@')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Email invalide',
          detail: 'L\'email doit être valide et contenir @',
          life: 3000
        });
        return;
      }

      if (!userPayload.roles || !Array.isArray(userPayload.roles) || userPayload.roles.length === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Rôles manquants',
          detail: 'Au moins un rôle doit être sélectionné',
          life: 3000
        });
        return;
      }

      const onSuccess = (response: any) => {
        if (response.status) {
          this.loadUsers();
          this.toggleForm();
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: response.message || 'Utilisateur créé avec succès',
            life: 3000
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Erreur lors de la création',
            life: 5000
          });
        }
      };

      const onError = (error: any) => {
        console.error('=== ERREUR COMPLÈTE ===');
        console.error('Statut HTTP:', error.status);
        console.error('Corps de l\'erreur:', error.error);
        console.error('======================');
        
        let errorMessage = 'Erreur lors de la création de l\'utilisateur';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.errors) {
          const validationErrors = error.error.errors;
          const errorMessages = Object.keys(validationErrors).map(field => {
            const fieldErrors = Array.isArray(validationErrors[field]) 
              ? validationErrors[field] 
              : [validationErrors[field]];
            return `${field}: ${fieldErrors.join(', ')}`;
          });
          errorMessage = `Erreurs de validation:\n${errorMessages.join('\n')}`;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur création utilisateur',
          detail: errorMessage,
          life: 10000
        });
      };

      this.userService.create(userPayload).subscribe({
        next: onSuccess,
        error: onError
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

  // Méthode pour voir les détails d'un utilisateur
  viewUser(user: User): void {
    if (!user.slug) return;
    
    console.log('Récupération des détails pour:', user.slug);
    this.userService.getBySlug(user.slug).subscribe({
      next: (response) => {
        console.log('Réponse détails utilisateur:', response);
        if (response.status && response.data) {
          const userData = response.data;
          this.messageService.add({
            severity: 'info',
            summary: 'Détails utilisateur',
            detail: `${userData.first_name || 'user'} ${userData.last_name || 'user'}`,
            life: 3000
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Attention',
            detail: 'Aucune donnée utilisateur disponible',
            life: 3000
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des détails:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de récupérer les détails de l\'utilisateur',
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
      accept: () => {
        this.userService.delete(slug).subscribe({
          next: (response) => {
            if (response.status) {
              this.loadUsers();
              this.messageService.add({
                severity: 'success',
                summary: 'Suppression réussie',
                detail: response.message || 'L\'utilisateur a été supprimé avec succès',
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
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            let errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
            if (error.error?.message) {
              errorMessage = error.error.message;
            }
            
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: errorMessage,
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
      this.getUserRolesAsString(user.roles).toLowerCase().includes(searchTermLower)
    );
  }

  // Méthode pour obtenir le libellé d'un seul rôle
  getRoleLabel(roleValue: string | any): string {
    // Gérer le cas où roleValue est un objet
    if (typeof roleValue === 'object' && roleValue !== null) {
      return roleValue.name || roleValue.slug || roleValue.id || 'Rôle inconnu';
    }
    
    // Si c'est un string, chercher dans availableRoles
    const role = this.availableRoles.find(r => r.value === roleValue);
    return role ? role.name : roleValue;
  }

  // Méthode pour convertir les rôles en chaîne pour la recherche
  getUserRolesAsString(roles: any[] = []): string {
    return roles.map(role => this.getRoleLabel(role)).join(', ');
  }

  // Méthode pour obtenir les libellés des rôles (pour plusieurs rôles)
  getRoleLabels(roles: any[] = []): string {
    return roles.map(role => this.getRoleLabel(role)).join(', ');
  }

  // Méthode pour obtenir le style des rôles
  getRoleClasses(role: any): string {
    const roleValue = typeof role === 'object' ? (role.slug || role.id) : role;
    
    if (roleValue && typeof roleValue === 'string') {
      if (roleValue.toLowerCase().includes('admin')) return 'role-admin';
      if (roleValue.toLowerCase().includes('manager')) return 'role-manager';
    }
    return 'role-user';
  }
}