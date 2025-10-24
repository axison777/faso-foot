import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthService } from '../../../service/auth.service';
import { ClubManagerService } from '../../../service/club-manager.service';
import { ClubManagerStaffMember } from '../../../models/club-manager-api.model';

@Component({
  selector: 'app-parametres-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="parametres-page">
      <div class="page-header">
        <h1>Paramètres</h1>
        <p>Gérez votre club et vos équipes</p>
      </div>

      <p-tabView>
        <p-tabPanel header="Staff">
          <div class="staff-section">
            <div class="section-header">
              <h3>Gestion du Staff</h3>
              <button pButton 
                      label="Ajouter un membre" 
                      icon="pi pi-plus" 
                      class="p-button-primary"
                      (click)="openStaffForm()"></button>
            </div>

            <p-table [value]="staffMembers()" 
                     [loading]="loading()"
                     styleClass="p-datatable-striped">
              <ng-template pTemplate="header">
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-staff>
                <tr>
                  <td>{{ staff.first_name }} {{ staff.last_name }}</td>
                  <td>{{ staff.email }}</td>
                  <td>{{ staff.phone }}</td>
                  <td>
                    <span class="role-badge" [ngClass]="'role-' + staff.role.toLowerCase()">
                      {{ getRoleLabel(staff.role) }}
                    </span>
                  </td>
                  <td>
                    <button pButton 
                            icon="pi pi-pencil" 
                            class="p-button-rounded p-button-text p-button-info"
                            (click)="editStaff(staff)"></button>
                    <button pButton 
                            icon="pi pi-trash" 
                            class="p-button-rounded p-button-text p-button-danger"
                            (click)="deleteStaff(staff)"></button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="empty-message">
                    <div class="empty-state">
                      <i class="pi pi-users"></i>
                      <h4>Aucun membre du staff</h4>
                      <p>Cliquez sur "Ajouter un membre" pour commencer</p>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </p-tabPanel>

        <p-tabPanel header="Maillots">
          <p-card>
            <h3>Gestion des maillots</h3>
            <p>Fonctionnalité à venir...</p>
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Équipes">
          <p-card>
            <h3>Gestion des équipes</h3>
            <p>Fonctionnalité à venir...</p>
          </p-card>
        </p-tabPanel>
      </p-tabView>
    </div>

    <!-- Modal de formulaire staff -->
    <p-dialog [(visible)]="showStaffForm" 
              [modal]="true"
              [style]="{width: '600px'}"
              [header]="isEditMode ? 'Modifier le membre du staff' : 'Ajouter un membre du staff'">
      <div class="staff-form">
        <div class="form-field">
          <label for="firstName">Prénom *</label>
          <input pInputText id="firstName" [(ngModel)]="staffData.first_name" />
        </div>
        <div class="form-field">
          <label for="lastName">Nom *</label>
          <input pInputText id="lastName" [(ngModel)]="staffData.last_name" />
        </div>
        <div class="form-field">
          <label for="email">Email *</label>
          <input pInputText type="email" id="email" [(ngModel)]="staffData.email" />
        </div>
        <div class="form-field">
          <label for="phone">Téléphone *</label>
          <input pInputText id="phone" [(ngModel)]="staffData.phone" />
        </div>
        <div class="form-field">
          <label for="role">Rôle *</label>
          <p-dropdown id="role"
                      [(ngModel)]="staffData.role"
                      [options]="roleOptions"
                      placeholder="Sélectionner un rôle"></p-dropdown>
        </div>
        <div class="form-field">
          <label for="license">Numéro de licence</label>
          <input pInputText id="license" [(ngModel)]="staffData.license_number" />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton 
                label="Annuler" 
                icon="pi pi-times" 
                class="p-button-secondary"
                (click)="closeStaffForm()"></button>
        <button pButton 
                [label]="isEditMode ? 'Enregistrer' : 'Créer'" 
                icon="pi pi-check" 
                class="p-button-primary"
                [loading]="saving()"
                (click)="saveStaff()"></button>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .parametres-page {
      padding: 2rem;
      
      .page-header {
        margin-bottom: 2rem;
        h1 { margin: 0 0 .5rem 0; font-size: 2rem; font-weight: 700; color: #0f172a; }
        p { margin: 0; color: #64748b; }
      }
    }

    .staff-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        
        h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
      }
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      
      &.role-coach {
        background: #dbeafe;
        color: #1e40af;
      }
      
      &.role-assistant_coach {
        background: #e0e7ff;
        color: #4338ca;
      }
      
      &.role-physiotherapist {
        background: #d1fae5;
        color: #065f46;
      }
      
      &.role-doctor {
        background: #fecaca;
        color: #991b1b;
      }
      
      &.role-fitness_coach {
        background: #fef3c7;
        color: #92400e;
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      
      i {
        font-size: 3rem;
        color: #9ca3af;
        margin-bottom: 1rem;
      }
      
      h4 {
        margin: 0.5rem 0;
        color: #6b7280;
      }
      
      p {
        color: #9ca3af;
      }
    }

    .staff-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1rem 0;
      
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        label {
          font-weight: 600;
          color: #374151;
        }
      }
    }

    :host ::ng-deep {
      .p-inputtext, .p-dropdown {
        width: 100%;
      }
    }
  `]
})
export class ParametresPageComponent implements OnInit {
  private authService = inject(AuthService);
  private clubManagerService = inject(ClubManagerService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  staffMembers = signal<ClubManagerStaffMember[]>([]);
  loading = signal(false);
  saving = signal(false);
  showStaffForm = false;
  isEditMode = false;
  currentTeamId = '';

  staffData: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    license_number: ''
  };

  roleOptions = [
    { label: 'Entraîneur', value: 'COACH' },
    { label: 'Entraîneur Adjoint', value: 'ASSISTANT_COACH' },
    { label: 'Kinésithérapeute', value: 'PHYSIOTHERAPIST' },
    { label: 'Médecin', value: 'DOCTOR' },
    { label: 'Préparateur Physique', value: 'FITNESS_COACH' },
    { label: 'Analyste Vidéo', value: 'VIDEO_ANALYST' },
    { label: 'Sélectionneur', value: 'SCOUT' },
    { label: 'Équipementier', value: 'EQUIPMENT_MANAGER' },
    { label: 'Agent de Sécurité', value: 'SECURITY_OFFICER' },
    { label: 'Analyste', value: 'ANALYST' }
  ];

  ngOnInit() {
    const currentUser = this.authService.currentUser;
    this.currentTeamId = currentUser?.team_id || '';
    
    if (this.currentTeamId) {
      this.loadStaff();
    }
  }

  loadStaff() {
    this.loading.set(true);
    this.clubManagerService.getTeamStaff(this.currentTeamId).subscribe({
      next: (staff: any) => {
        console.log('✅ Staff chargé:', staff);
        this.staffMembers.set(staff);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement staff:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger le staff'
        });
        this.loading.set(false);
      }
    });
  }

  openStaffForm() {
    this.isEditMode = false;
    this.staffData = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      license_number: '',
      team_id: this.currentTeamId
    };
    this.showStaffForm = true;
  }

  editStaff(staff: ClubManagerStaffMember) {
    this.isEditMode = true;
    this.staffData = { ...staff };
    this.showStaffForm = true;
  }

  deleteStaff(staff: ClubManagerStaffMember) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${staff.first_name} ${staff.last_name} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (staff.id) {
          this.clubManagerService.deleteStaff(staff.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Membre du staff supprimé avec succès'
              });
              this.loadStaff();
            },
            error: (err: any) => {
              console.error('Erreur suppression:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de supprimer le membre du staff'
              });
            }
          });
        }
      }
    });
  }

  saveStaff() {
    if (!this.staffData.first_name || !this.staffData.last_name || !this.staffData.email || !this.staffData.role) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    this.staffData.team_id = this.currentTeamId;
    this.saving.set(true);

    if (this.isEditMode && this.staffData.id) {
      this.clubManagerService.updateStaff(this.staffData.id, this.staffData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Membre du staff modifié avec succès'
          });
          this.closeStaffForm();
          this.loadStaff();
        },
        error: (err: any) => {
          console.error('Erreur modification:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de modifier le membre du staff'
          });
          this.saving.set(false);
        }
      });
    } else {
      this.clubManagerService.createStaff(this.staffData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Membre du staff créé avec succès'
          });
          this.closeStaffForm();
          this.loadStaff();
        },
        error: (err: any) => {
          console.error('Erreur création:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de créer le membre du staff'
          });
          this.saving.set(false);
        }
      });
    }
  }

  closeStaffForm() {
    this.showStaffForm = false;
    this.saving.set(false);
  }

  getRoleLabel(role: string): string {
    const roleMap: any = {
      'COACH': 'Entraîneur',
      'ASSISTANT_COACH': 'Entraîneur Adjoint',
      'PHYSIOTHERAPIST': 'Kinésithérapeute',
      'DOCTOR': 'Médecin',
      'FITNESS_COACH': 'Préparateur Physique',
      'VIDEO_ANALYST': 'Analyste Vidéo',
      'SCOUT': 'Sélectionneur',
      'EQUIPMENT_MANAGER': 'Équipementier',
      'SECURITY_OFFICER': 'Agent de Sécurité',
      'ANALYST': 'Analyste'
    };
    return roleMap[role] || role;
  }
}
