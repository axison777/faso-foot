import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AccordionModule } from 'primeng/accordion';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthService } from '../../../service/auth.service';
import { ClubManagerService } from '../../../service/club-manager.service';
import { TeamKitService } from '../../../service/team-kit.service';
import { ClubManagerStaffMember, ClubManagerTeam } from '../../../models/club-manager-api.model';
import { KitViewerComponent } from '../../../components/kit-viewer/kit-viewer.component';

interface TeamWithStaff extends ClubManagerTeam {
  staffMembers?: ClubManagerStaffMember[];
}

@Component({
  selector: 'app-parametres-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    AccordionModule,
    KitViewerComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="parametres-page">
      <div class="page-header">
        <h1>Paramètres</h1>
        <p>Gérez votre club et vos équipes</p>
      </div>

      <p-tabView>
        <!-- ONGLET STAFF PAR ÉQUIPE -->
        <p-tabPanel header="Staff">
          <div class="staff-section">
            <div class="section-header">
              <h3>Gestion du Staff par équipe</h3>
            </div>

            <div *ngIf="loadingTeams()" class="loading-state">
              <i class="pi pi-spin pi-spinner"></i>
              <p>Chargement des équipes...</p>
            </div>

            <p-accordion *ngIf="!loadingTeams() && teamsWithStaff().length > 0" [multiple]="true" [activeIndex]="[0]">
              <p-accordionTab *ngFor="let team of teamsWithStaff()" [header]="team.name">
                <ng-template pTemplate="header">
                  <div class="team-header">
                    <span class="team-name">{{ team.name }}</span>
                    <span class="team-badge">{{ team.staffMembers?.length || 0 }} membres</span>
                  </div>
                </ng-template>

                <div class="team-staff-content">
                  <div class="staff-actions">
                    <button pButton 
                            label="Ajouter un membre" 
                            icon="pi pi-plus" 
                            class="p-button-sm p-button-primary"
                            (click)="openStaffForm(team.id)"></button>
                  </div>

                  <p-table [value]="team.staffMembers || []" 
                           styleClass="p-datatable-sm p-datatable-striped">
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
                                  class="p-button-rounded p-button-text p-button-sm p-button-info"
                                  (click)="editStaff(staff, team.id)"></button>
                          <button pButton 
                                  icon="pi pi-trash" 
                                  class="p-button-rounded p-button-text p-button-sm p-button-danger"
                                  (click)="deleteStaff(staff, team.id)"></button>
                        </td>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                      <tr>
                        <td colspan="5" class="empty-message">
                          <div class="empty-state-small">
                            <i class="pi pi-users"></i>
                            <p>Aucun membre du staff pour cette équipe</p>
                          </div>
                        </td>
                      </tr>
                    </ng-template>
                  </p-table>
                </div>
              </p-accordionTab>
            </p-accordion>

            <div *ngIf="!loadingTeams() && teamsWithStaff().length === 0" class="empty-state">
              <i class="pi pi-sitemap"></i>
              <h4>Aucune équipe</h4>
              <p>Créez d'abord des équipes dans l'onglet "Équipes"</p>
            </div>
          </div>
        </p-tabPanel>

        <!-- ONGLET MAILLOTS (NIVEAU CLUB) -->
        <p-tabPanel header="Maillots">
          <div class="kits-section">
            <div class="section-header">
              <h3>Gestion des maillots du club</h3>
              <button pButton 
                      label="Ajouter un maillot" 
                      icon="pi pi-plus" 
                      class="p-button-primary"
                      (click)="openKitForm()"></button>
            </div>

            <div *ngIf="loadingKits()" class="loading-state">
              <i class="pi pi-spin pi-spinner"></i>
              <p>Chargement des maillots...</p>
            </div>

            <!-- Carrousel de maillots -->
            <div *ngIf="!loadingKits() && kits().length > 0" class="kit-carousel">
              <div class="carousel-controls">
                <button pButton 
                        icon="pi pi-trash" 
                        class="p-button-danger"
                        (click)="deleteKit(selectedKit()!)"
                        [disabled]="!selectedKit()?.id"></button>
                <div class="kit-title">
                  {{ getKitTypeName(selectedKit()?.type!) }} ({{ selectedKitIndex() + 1 }}/{{ kits().length }})
                </div>
                <div class="carousel-buttons">
                  <button pButton 
                          icon="pi pi-chevron-left" 
                          class="p-button-secondary"
                          (click)="prevKit()"></button>
                  <button pButton 
                          icon="pi pi-chevron-right" 
                          class="p-button-secondary"
                          (click)="nextKit()"></button>
                </div>
              </div>

              <div class="kit-editor">
                <div class="kit-viewer-container">
                  <app-kit-viewer
                    [shirtColor]="editorForm.value.primary_color"
                    [shortColor]="editorForm.value.secondary_color"
                    [socksColor]="editorForm.value.tertiary_color"
                    [width]="180"
                    [height]="220"
                    [autoRotate]="true"
                  ></app-kit-viewer>
                </div>

                <form [formGroup]="editorForm" class="color-editor">
                  <div class="color-field">
                    <label>Maillot</label>
                    <input type="color" formControlName="primary_color" />
                    <span class="color-code">{{ editorForm.value.primary_color }}</span>
                  </div>
                  <div class="color-field">
                    <label>Short</label>
                    <input type="color" formControlName="secondary_color" />
                    <span class="color-code">{{ editorForm.value.secondary_color }}</span>
                  </div>
                  <div class="color-field">
                    <label>Chaussettes</label>
                    <input type="color" formControlName="tertiary_color" />
                    <span class="color-code">{{ editorForm.value.tertiary_color }}</span>
                  </div>

                  <div class="editor-actions">
                    <button pButton 
                            label="Sauvegarder" 
                            icon="pi pi-check"
                            class="p-button-primary"
                            type="button"
                            [disabled]="!hasEditorChanges() || savingKit()"
                            [loading]="savingKit()"
                            (click)="saveSelectedKit()"></button>
                    <button pButton 
                            label="Réinitialiser" 
                            icon="pi pi-refresh"
                            class="p-button-secondary"
                            type="button"
                            [disabled]="!hasEditorChanges()"
                            (click)="resetEditor()"></button>
                  </div>
                </form>
              </div>
            </div>

            <div *ngIf="!loadingKits() && kits().length === 0" class="empty-state">
              <i class="pi pi-shield"></i>
              <h4>Aucun maillot</h4>
              <p>Cliquez sur "Ajouter un maillot" pour commencer</p>
            </div>
          </div>
        </p-tabPanel>

        <!-- ONGLET ÉQUIPES -->
        <p-tabPanel header="Équipes">
          <div class="teams-section">
            <div class="section-header">
              <h3>Gestion des équipes du club</h3>
              <button pButton 
                      label="Ajouter une équipe" 
                      icon="pi pi-plus" 
                      class="p-button-primary"
                      (click)="openTeamForm()"></button>
            </div>

            <p-table [value]="teams()" 
                     [loading]="loadingTeams()"
                     styleClass="p-datatable-striped">
              <ng-template pTemplate="header">
                <tr>
                  <th>Nom</th>
                  <th>Abréviation</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Staff</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-team>
                <tr>
                  <td><strong>{{ team.name }}</strong></td>
                  <td>{{ team.abbreviation }}</td>
                  <td>{{ team.email }}</td>
                  <td>{{ team.phone }}</td>
                  <td>
                    <span class="count-badge">{{ getTeamStaffCount(team.id) }}</span>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="'status-' + team.status.toLowerCase()">
                      {{ team.status }}
                    </span>
                  </td>
                  <td>
                    <button pButton 
                            icon="pi pi-pencil" 
                            class="p-button-rounded p-button-text p-button-info"
                            pTooltip="Modifier"
                            (click)="editTeam(team)"></button>
                    <button pButton 
                            icon="pi pi-trash" 
                            class="p-button-rounded p-button-text p-button-danger"
                            pTooltip="Supprimer"
                            (click)="deleteTeam(team)"></button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="empty-message">
                    <div class="empty-state">
                      <i class="pi pi-sitemap"></i>
                      <h4>Aucune équipe</h4>
                      <p>Cliquez sur "Ajouter une équipe" pour commencer</p>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </p-tabPanel>
      </p-tabView>
    </div>

    <!-- Modal Staff -->
    <p-dialog [(visible)]="showStaffForm" 
              [modal]="true"
              [style]="{width: '600px'}"
              [header]="isEditModeStaff ? 'Modifier le membre du staff' : 'Ajouter un membre du staff'">
      <div class="form-container">
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
                [label]="isEditModeStaff ? 'Enregistrer' : 'Créer'" 
                icon="pi pi-check" 
                class="p-button-primary"
                [loading]="savingStaff()"
                (click)="saveStaff()"></button>
      </ng-template>
    </p-dialog>

    <!-- Modal Création Maillot -->
    <p-dialog [(visible)]="showKitForm" 
              [modal]="true"
              [style]="{width: '600px'}"
              header="Ajouter un maillot">
      <form [formGroup]="kitForm" class="form-container">
        <div class="form-field">
          <label for="kitType">Type de maillot *</label>
          <p-dropdown id="kitType"
                      formControlName="type"
                      [options]="kitTypeOptions"
                      placeholder="Sélectionner un type"></p-dropdown>
        </div>
        <div class="color-fields">
          <div class="form-field">
            <label for="primaryColor">Couleur maillot *</label>
            <input type="color" id="primaryColor" formControlName="primary_color" />
            <span class="color-value">{{ kitForm.value.primary_color }}</span>
          </div>
          <div class="form-field">
            <label for="secondaryColor">Couleur short</label>
            <input type="color" id="secondaryColor" formControlName="secondary_color" />
            <span class="color-value">{{ kitForm.value.secondary_color }}</span>
          </div>
          <div class="form-field">
            <label for="tertiaryColor">Couleur chaussettes</label>
            <input type="color" id="tertiaryColor" formControlName="tertiary_color" />
            <span class="color-value">{{ kitForm.value.tertiary_color }}</span>
          </div>
        </div>
      </form>
      
      <ng-template pTemplate="footer">
        <button pButton 
                label="Annuler" 
                icon="pi pi-times" 
                class="p-button-secondary"
                (click)="closeKitForm()"></button>
        <button pButton 
                label="Créer" 
                icon="pi pi-check" 
                class="p-button-primary"
                [loading]="savingKit()"
                (click)="createKit()"></button>
      </ng-template>
    </p-dialog>

    <!-- Modal Équipe -->
    <p-dialog [(visible)]="showTeamForm" 
              [modal]="true"
              [style]="{width: '600px'}"
              [header]="isEditModeTeam ? 'Modifier l\\'équipe' : 'Ajouter une équipe'">
      <div class="form-container">
        <div class="form-field">
          <label for="teamName">Nom de l'équipe *</label>
          <input pInputText id="teamName" [(ngModel)]="teamData.name" />
        </div>
        <div class="form-field">
          <label for="teamAbbr">Abréviation *</label>
          <input pInputText id="teamAbbr" [(ngModel)]="teamData.abbreviation" />
        </div>
        <div class="form-field">
          <label for="teamEmail">Email</label>
          <input pInputText type="email" id="teamEmail" [(ngModel)]="teamData.email" />
        </div>
        <div class="form-field">
          <label for="teamPhone">Téléphone</label>
          <input pInputText id="teamPhone" [(ngModel)]="teamData.phone" />
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton 
                label="Annuler" 
                icon="pi pi-times" 
                class="p-button-secondary"
                (click)="closeTeamForm()"></button>
        <button pButton 
                [label]="isEditModeTeam ? 'Enregistrer' : 'Créer'" 
                icon="pi pi-check" 
                class="p-button-primary"
                [loading]="savingTeam()"
                (click)="saveTeam()"></button>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .parametres-page {
      padding: 2rem;
      background: #f8fafc;
      min-height: 100vh;
      
      .page-header {
        margin-bottom: 2rem;
        h1 { margin: 0 0 .5rem 0; font-size: 2rem; font-weight: 700; color: #0f172a; }
        p { margin: 0; color: #64748b; }
      }
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
      i { font-size: 2rem; margin-bottom: 1rem; }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      h3 { margin: 0; font-size: 1.5rem; font-weight: 600; color: #0f172a; }
    }

    .team-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      .team-name { font-weight: 600; font-size: 1.1rem; }
      .team-badge {
        background: #3b82f6;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 600;
      }
    }

    .team-staff-content { padding: 1rem 0; }
    .staff-actions { margin-bottom: 1rem; display: flex; justify-content: flex-end; }

    .kit-carousel {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      .carousel-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;

        .kit-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
        }

        .carousel-buttons {
          display: flex;
          gap: 0.5rem;
        }
      }

      .kit-editor {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 3rem;
        align-items: center;

        .kit-viewer-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .color-editor {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;

          .color-field {
            display: flex;
            align-items: center;
            gap: 1rem;

            label {
              min-width: 120px;
              font-weight: 600;
              color: #374151;
            }

            input[type="color"] {
              width: 80px;
              height: 50px;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              cursor: pointer;
              &:hover { border-color: #3b82f6; }
            }

            .color-code {
              font-family: monospace;
              font-size: 0.875rem;
              color: #64748b;
            }
          }

          .editor-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 1rem;
          }
        }
      }
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      &.role-coach { background: #dbeafe; color: #1e40af; }
      &.role-assistant_coach { background: #e0e7ff; color: #4338ca; }
      &.role-physiotherapist { background: #d1fae5; color: #065f46; }
      &.role-doctor { background: #fecaca; color: #991b1b; }
      &.role-fitness_coach { background: #fef3c7; color: #92400e; }
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      &.status-active { background: #d1fae5; color: #065f46; }
      &.status-inactive { background: #fee2e2; color: #991b1b; }
    }

    .count-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .empty-state, .empty-state-small {
      text-align: center;
      padding: 3rem;
      i { font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem; }
      h4 { margin: 0.5rem 0; color: #64748b; }
      p { color: #94a3b8; }
    }

    .empty-state-small {
      padding: 1.5rem;
      i { font-size: 2rem; }
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1rem 0;
      
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        label { font-weight: 600; color: #374151; font-size: 0.875rem; }

        input[type="color"] {
          width: 80px;
          height: 50px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          &:hover { border-color: #3b82f6; }
        }
      }

      .color-fields {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;

        .color-value {
          display: block;
          margin-top: 0.5rem;
          font-family: monospace;
          font-size: 0.875rem;
          color: #64748b;
        }
      }
    }

    :host ::ng-deep {
      .p-inputtext, .p-dropdown { width: 100%; }
      .p-accordion .p-accordion-header-link {
        background: white;
        border: 1px solid #e2e8f0;
        &:hover { background: #f8fafc; }
      }
      .p-accordion-content {
        background: #fafbfc;
        border: 1px solid #e2e8f0;
        border-top: none;
      }
    }
  `]
})
export class ParametresPageComponent implements OnInit {
  private authService = inject(AuthService);
  private clubManagerService = inject(ClubManagerService);
  private teamKitService = inject(TeamKitService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  clubId = '';
  teams = signal<ClubManagerTeam[]>([]);
  loadingTeams = signal(false);

  teamsWithStaff = computed<TeamWithStaff[]>(() => {
    return this.teams().map(team => ({
      ...team,
      staffMembers: this.staffByTeam.get(team.id) || []
    }));
  });

  private staffByTeam = new Map<string, ClubManagerStaffMember[]>();

  // Kits (niveau club)
  kits = signal<any[]>([]);
  selectedKitIndex = signal(0);
  selectedKit = computed(() => this.kits()[this.selectedKitIndex()]);
  loadingKits = signal(false);
  savingKit = signal(false);
  showKitForm = false;
  
  editorForm!: FormGroup;
  kitForm!: FormGroup;
  editorBaseline: any = { primary_color: null, secondary_color: null, tertiary_color: null };
  hasEditorChanges = signal(false);

  // Staff
  savingStaff = signal(false);
  showStaffForm = false;
  isEditModeStaff = false;
  currentTeamId = '';
  staffData: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    license_number: ''
  };

  // Teams
  savingTeam = signal(false);
  showTeamForm = false;
  isEditModeTeam = false;
  teamData: any = {
    name: '',
    abbreviation: '',
    email: '',
    phone: ''
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

  kitTypeOptions = [
    { label: 'Domicile', value: 'home' },
    { label: 'Extérieur', value: 'away' },
    { label: 'Neutre', value: 'third' }
  ];

  ngOnInit() {
    const currentUser = this.authService.currentUser;
    this.clubId = currentUser?.club_id || '';

    this.editorForm = this.fb.group({
      primary_color: [null],
      secondary_color: [null],
      tertiary_color: [null]
    });

    this.kitForm = this.fb.group({
      type: ['', Validators.required],
      primary_color: ['#ffffff'],
      secondary_color: ['#ffffff'],
      tertiary_color: ['#ffffff']
    });

    this.editorForm.valueChanges.subscribe(() => {
      this.hasEditorChanges.set(!this.colorsEqualToBaseline());
    });

    if (this.clubId) {
      this.loadAllData();
      this.loadKits();
    }
  }

  loadAllData() {
    this.loadingTeams.set(true);
    this.clubManagerService.getClubTeams(this.clubId).subscribe({
      next: (teams: ClubManagerTeam[]) => {
        this.teams.set(teams);
        teams.forEach(team => this.loadTeamStaff(team.id));
        this.loadingTeams.set(false);
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement équipes:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les équipes'
        });
        this.loadingTeams.set(false);
      }
    });
  }

  loadTeamStaff(teamId: string) {
    this.clubManagerService.getTeamStaff(teamId).subscribe({
      next: (staff: ClubManagerStaffMember[]) => {
        this.staffByTeam.set(teamId, staff);
        this.teams.set([...this.teams()]);
      },
      error: () => {
        this.staffByTeam.set(teamId, []);
      }
    });
  }

  getTeamStaffCount(teamId: string): number {
    return this.staffByTeam.get(teamId)?.length || 0;
  }

  // STAFF METHODS
  openStaffForm(teamId: string) {
    this.currentTeamId = teamId;
    this.isEditModeStaff = false;
    this.staffData = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      license_number: '',
      team_id: teamId
    };
    this.showStaffForm = true;
  }

  editStaff(staff: ClubManagerStaffMember, teamId: string) {
    this.currentTeamId = teamId;
    this.isEditModeStaff = true;
    this.staffData = { ...staff };
    this.showStaffForm = true;
  }

  deleteStaff(staff: ClubManagerStaffMember, teamId: string) {
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
              this.loadTeamStaff(teamId);
            },
            error: () => {
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
    this.savingStaff.set(true);

    const request$ = this.isEditModeStaff && this.staffData.id
      ? this.clubManagerService.updateStaff(this.staffData.id, this.staffData)
      : this.clubManagerService.createStaff(this.staffData);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: this.isEditModeStaff ? 'Membre du staff modifié' : 'Membre du staff créé'
        });
        this.closeStaffForm();
        this.loadTeamStaff(this.currentTeamId);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de sauvegarder le membre du staff'
        });
        this.savingStaff.set(false);
      }
    });
  }

  closeStaffForm() {
    this.showStaffForm = false;
    this.savingStaff.set(false);
  }

  getRoleLabel(role: string): string {
    const found = this.roleOptions.find(r => r.value === role);
    return found?.label || role;
  }

  // KITS METHODS
  loadKits() {
    this.loadingKits.set(true);
    this.teamKitService.getAll().subscribe({
      next: (res: any) => {
        this.kits.set(res?.data?.jerseys || []);
        if (this.kits().length > 0) {
          this.selectedKitIndex.set(0);
          this.patchEditorFromSelected();
        }
        this.loadingKits.set(false);
      },
      error: () => {
        this.loadingKits.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des maillots'
        });
      }
    });
  }

  patchEditorFromSelected() {
    const k = this.selectedKit();
    if (!k) return;
    const prim = k.primary_color ?? k.shirt_color_1 ?? null;
    const sec = k.secondary_color ?? k.shorts_color_1 ?? null;
    const ter = k.tertiary_color ?? k.socks_color ?? null;

    this.editorBaseline = { primary_color: prim, secondary_color: sec, tertiary_color: ter };
    this.editorForm.patchValue({
      primary_color: prim,
      secondary_color: sec,
      tertiary_color: ter
    }, { emitEvent: false });
    this.hasEditorChanges.set(false);
  }

  prevKit() {
    if (!this.kits().length) return;
    this.selectedKitIndex.set((this.selectedKitIndex() - 1 + this.kits().length) % this.kits().length);
    this.patchEditorFromSelected();
  }

  nextKit() {
    if (!this.kits().length) return;
    this.selectedKitIndex.set((this.selectedKitIndex() + 1) % this.kits().length);
    this.patchEditorFromSelected();
  }

  colorsEqualToBaseline(): boolean {
    const v = this.editorForm.value;
    return v.primary_color === this.editorBaseline.primary_color &&
           v.secondary_color === this.editorBaseline.secondary_color &&
           v.tertiary_color === this.editorBaseline.tertiary_color;
  }

  saveSelectedKit() {
    const k = this.selectedKit();
    if (!k?.id) return;

    const payload = {
      primary_color: this.editorForm.value.primary_color,
      secondary_color: this.editorForm.value.secondary_color,
      tertiary_color: this.editorForm.value.tertiary_color
    };

    this.savingKit.set(true);
    this.teamKitService.update(k.id, payload).subscribe({
      next: () => {
        Object.assign(k, payload);
        this.editorBaseline = { ...payload };
        this.hasEditorChanges.set(false);
        this.savingKit.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Maillot mis à jour'
        });
      },
      error: () => {
        this.savingKit.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la mise à jour du maillot'
        });
      }
    });
  }

  resetEditor() {
    this.patchEditorFromSelected();
  }

  openKitForm() {
    this.showKitForm = true;
    this.kitForm.reset({
      type: 'home',
      primary_color: '#ffffff',
      secondary_color: '#ffffff',
      tertiary_color: '#ffffff'
    });
  }

  closeKitForm() {
    this.showKitForm = false;
  }

  createKit() {
    if (this.kitForm.invalid) {
      this.kitForm.markAllAsTouched();
      return;
    }

    this.savingKit.set(true);
    const payload = {
      ...this.kitForm.value,
      club_id: this.clubId
    };

    this.teamKitService.create(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Maillot ajouté'
        });
        this.closeKitForm();
        this.loadKits();
      },
      error: () => {
        this.savingKit.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue'
        });
      }
    });
  }

  deleteKit(kit: any) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ce maillot ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (kit.id) {
          this.teamKitService.delete(kit.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Maillot supprimé'
              });
              this.loadKits();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de supprimer le maillot'
              });
            }
          });
        }
      }
    });
  }

  getKitTypeName(type: string): string {
    const found = this.kitTypeOptions.find(k => k.value === type);
    return found?.label || type;
  }

  // TEAMS METHODS
  openTeamForm() {
    this.isEditModeTeam = false;
    this.teamData = {
      name: '',
      abbreviation: '',
      email: '',
      phone: ''
    };
    this.showTeamForm = true;
  }

  editTeam(team: ClubManagerTeam) {
    this.isEditModeTeam = true;
    this.teamData = { ...team };
    this.showTeamForm = true;
  }

  deleteTeam(team: ClubManagerTeam) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'équipe ${team.name} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (team.id) {
          this.clubManagerService.deleteTeam(team.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Équipe supprimée avec succès'
              });
              this.loadAllData();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de supprimer l\'équipe'
              });
            }
          });
        }
      }
    });
  }

  saveTeam() {
    if (!this.teamData.name || !this.teamData.abbreviation) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    this.savingTeam.set(true);
    const payload = {
      ...this.teamData,
      club_id: this.clubId
    };

    const request$ = this.isEditModeTeam && this.teamData.id
      ? this.clubManagerService.updateTeam(this.teamData.id, payload)
      : this.clubManagerService.createTeam(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: this.isEditModeTeam ? 'Équipe modifiée' : 'Équipe créée'
        });
        this.closeTeamForm();
        this.loadAllData();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de sauvegarder l\'équipe'
        });
        this.savingTeam.set(false);
      }
    });
  }

  closeTeamForm() {
    this.showTeamForm = false;
    this.savingTeam.set(false);
  }
}
