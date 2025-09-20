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

  showForm: boolean = false;
  isEditing: boolean = false;
  editingUserSlug?: string | null = null;
  userForm!: FormGroup;
  
  // Adaptation des rôles selon votre système
  availableRoles = [
    { name: 'Administrateur', value: 'admin' },
    { name: 'Manager', value: 'manager' },
    { name: 'Utilisateur', value: 'user' },
    { name: 'Modérateur', value: 'moderator' }
  ];

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

  loadUsers(): void {
    this.loading = true;
    
    // Chargement de tous les utilisateurs (sans pagination pour la liste complète)
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.status) {
          this.users = Array.isArray(response.data) ? response.data : [];
          
          // Si vous avez des métadonnées de pagination
          if (response.meta) {
            this.totalItems = parseInt(response.meta.total);
            this.totalPages = parseInt(response.meta.last_page);
            this.currentPage = parseInt(response.meta.current_page);
          }
          
          console.log('Utilisateurs chargés:', this.users);
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
      const userPayload = {
        first_name: this.userForm.get('first_name')?.value?.trim(),
        last_name: this.userForm.get('last_name')?.value?.trim(),
        email: this.userForm.get('email')?.value?.trim().toLowerCase(),
        roles: this.userForm.get('roles')?.value || []
      };

      console.log('Données à envoyer:', userPayload);

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
        console.error('Erreur lors de la sauvegarde:', error);
        let errorMessage = 'Erreur lors de la création de l\'utilisateur';
        
        // Gestion des erreurs spécifiques
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 422) {
          errorMessage = 'Données invalides. Veuillez vérifier vos informations';
        } else if (error.status === 409) {
          errorMessage = 'Cet email est déjà utilisé par un autre utilisateur';
        } else if (error.status === 400) {
          errorMessage = 'Données invalides. Veuillez vérifier vos informations';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage,
          life: 5000
        });
      };

      // Pour l'instant, seulement la création (pas de modification dans l'API documentée)
      this.userService.create(userPayload).subscribe({
        next: onSuccess,
        error: onError
      });
      
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
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

  // Méthode pour voir les détails d'un utilisateur (au lieu d'éditer)
  viewUser(user: User): void {
    if (!user.slug) return;
    
    this.userService.getBySlug(user.slug).subscribe({
      next: (response) => {
        if (response.status) {
          console.log('Détails de l\'utilisateur:', response.data);
          // Vous pouvez ouvrir un dialog pour afficher les détails
          this.messageService.add({
            severity: 'info',
            summary: 'Détails utilisateur',
            detail: `${response.data.first_name} ${response.data.last_name}`,
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
      user.roles?.some(role => role.toLowerCase().includes(searchTermLower))
    );
  }

  // Méthode pour obtenir les libellés des rôles
  getRoleLabels(roles: string[] = []): string {
    return roles.map(roleValue => {
      const role = this.availableRoles.find(r => r.value === roleValue);
      return role ? role.name : roleValue;
    }).join(', ');
  }

  // Méthode pour obtenir le style des rôles
  getRoleClasses(roles: string[] = []): string {
    if (roles.includes('admin')) return 'role-admin';
    if (roles.includes('manager')) return 'role-manager';
    if (roles.includes('moderator')) return 'role-moderator';
    return 'role-user';
  }
}