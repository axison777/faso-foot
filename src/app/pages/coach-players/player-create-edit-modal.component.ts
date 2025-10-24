import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ClubManagerService } from '../../service/club-manager.service';
import { CoachService } from '../../service/coach.service';
import { ClubManagerPlayer } from '../../models/club-manager-api.model';

@Component({
    selector: 'app-player-create-edit-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        DropdownModule,
        CalendarModule,
        InputNumberModule
    ],
    template: `
        <p-dialog 
            [(visible)]="visible" 
            [modal]="true" 
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '90vw', maxWidth: '900px' }"
            [header]="isEditMode ? 'Modifier le joueur' : 'Ajouter un joueur'"
            styleClass="player-form-modal">
            
            <div class="form-content">
                <!-- Informations Personnelles -->
                <div class="form-section">
                    <h3><i class="pi pi-user"></i> Informations Personnelles</h3>
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="firstName">Prénom *</label>
                            <input pInputText id="firstName" [(ngModel)]="playerData.first_name" required />
                        </div>
                        <div class="form-field">
                            <label for="lastName">Nom *</label>
                            <input pInputText id="lastName" [(ngModel)]="playerData.last_name" required />
                        </div>
                        <div class="form-field">
                            <label for="email">Email *</label>
                            <input pInputText type="email" id="email" [(ngModel)]="playerData.email" required />
                        </div>
                        <div class="form-field">
                            <label for="phone">Téléphone *</label>
                            <input pInputText id="phone" [(ngModel)]="playerData.phone" required />
                        </div>
                        <div class="form-field">
                            <label for="birthDate">Date de naissance *</label>
                            <p-calendar 
                                id="birthDate" 
                                [(ngModel)]="birthDate"
                                dateFormat="dd/mm/yy"
                                [showIcon]="true"
                                appendTo="body">
                            </p-calendar>
                        </div>
                        <div class="form-field">
                            <label for="birthPlace">Lieu de naissance *</label>
                            <input pInputText id="birthPlace" [(ngModel)]="playerData.birth_place" required />
                        </div>
                        <div class="form-field">
                            <label for="nationality">Nationalité *</label>
                            <input pInputText id="nationality" [(ngModel)]="playerData.nationality" required />
                        </div>
                        <div class="form-field">
                            <label for="bloodType">Groupe sanguin</label>
                            <p-dropdown 
                                id="bloodType"
                                [(ngModel)]="playerData.blood_type"
                                [options]="bloodTypeOptions"
                                placeholder="Sélectionner">
                            </p-dropdown>
                        </div>
                    </div>
                </div>

                <!-- Caractéristiques Sportives -->
                <div class="form-section">
                    <h3><i class="pi pi-star"></i> Caractéristiques Sportives</h3>
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="jerseyNumber">Numéro de maillot *</label>
                            <p-inputNumber 
                                id="jerseyNumber"
                                [(ngModel)]="playerData.jersey_number"
                                [min]="1"
                                [max]="99"
                                [showButtons]="true">
                            </p-inputNumber>
                        </div>
                        <div class="form-field">
                            <label for="position">Position préférée *</label>
                            <p-dropdown 
                                id="position"
                                [(ngModel)]="playerData.preferred_position"
                                [options]="positionOptions"
                                placeholder="Sélectionner"
                                required>
                            </p-dropdown>
                        </div>
                        <div class="form-field">
                            <label for="foot">Pied préféré *</label>
                            <p-dropdown 
                                id="foot"
                                [(ngModel)]="playerData.foot_preference"
                                [options]="footOptions"
                                placeholder="Sélectionner"
                                required>
                            </p-dropdown>
                        </div>
                        <div class="form-field">
                            <label for="height">Taille (cm) *</label>
                            <p-inputNumber 
                                id="height"
                                [(ngModel)]="playerData.height"
                                [min]="140"
                                [max]="230"
                                [showButtons]="true">
                            </p-inputNumber>
                        </div>
                        <div class="form-field">
                            <label for="weight">Poids (kg) *</label>
                            <p-inputNumber 
                                id="weight"
                                [(ngModel)]="playerData.weight"
                                [min]="40"
                                [max]="150"
                                [showButtons]="true">
                            </p-inputNumber>
                        </div>
                        <div class="form-field">
                            <label for="license">Numéro de licence *</label>
                            <input pInputText id="license" [(ngModel)]="playerData.license_number" required />
                        </div>
                        <div class="form-field">
                            <label for="status">Statut</label>
                            <p-dropdown 
                                id="status"
                                [(ngModel)]="playerData.status"
                                [options]="statusOptions"
                                placeholder="Sélectionner">
                            </p-dropdown>
                        </div>
                        <div class="form-field">
                            <label for="photo">Photo URL</label>
                            <input pInputText id="photo" [(ngModel)]="playerData.photo" placeholder="https://..." />
                        </div>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button pButton label="Annuler" icon="pi pi-times" class="p-button-secondary" (click)="cancel()"></button>
                <button pButton 
                        [label]="isEditMode ? 'Enregistrer' : 'Créer'" 
                        icon="pi pi-check" 
                        class="p-button-primary" 
                        (click)="save()"
                        [loading]="saving"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        .form-content {
            padding: 1rem 0;
        }

        .form-section {
            margin-bottom: 2rem;
        }

        .form-section h3 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0 0 1.5rem 0;
            color: #1a1a1a;
            font-size: 1.25rem;
            font-weight: 600;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #e5e7eb;
        }

        .form-section h3 i {
            color: #667eea;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
        }

        .form-field {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-field label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
        }

        :host ::ng-deep {
            .p-inputtext, .p-dropdown, .p-calendar, .p-inputnumber {
                width: 100%;
            }
        }
    `]
})
export class PlayerCreateEditModalComponent implements OnInit {
    @Input() visible = false;
    @Input() player: ClubManagerPlayer | null = null;
    @Input() teamId: string = '';
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() playerSaved = new EventEmitter<ClubManagerPlayer>();

    private clubManagerService = inject(ClubManagerService);
    private messageService = inject(MessageService);

    playerData: any = {};
    birthDate: Date | null = null;
    saving = false;
    isEditMode = false;

    positionOptions = [
        { label: 'Gardien (GK)', value: 'GK' },
        { label: 'Défenseur Central (CB)', value: 'CB' },
        { label: 'Défenseur Droit (RB)', value: 'RB' },
        { label: 'Défenseur Gauche (LB)', value: 'LB' },
        { label: 'Milieu Défensif (CDM)', value: 'CDM' },
        { label: 'Milieu Central (CM)', value: 'CM' },
        { label: 'Milieu Droit (RM)', value: 'RM' },
        { label: 'Milieu Gauche (LM)', value: 'LM' },
        { label: 'Ailier Droit (RW)', value: 'RW' },
        { label: 'Ailier Gauche (LW)', value: 'LW' },
        { label: 'Attaquant (ST)', value: 'ST' }
    ];

    footOptions = [
        { label: 'Gauche', value: 'LEFT' },
        { label: 'Droit', value: 'RIGHT' },
        { label: 'Ambidextre', value: 'BOTH' }
    ];

    bloodTypeOptions = [
        { label: 'A+', value: 'A+' },
        { label: 'A-', value: 'A-' },
        { label: 'B+', value: 'B+' },
        { label: 'B-', value: 'B-' },
        { label: 'AB+', value: 'AB+' },
        { label: 'AB-', value: 'AB-' },
        { label: 'O+', value: 'O+' },
        { label: 'O-', value: 'O-' }
    ];

    statusOptions = [
        { label: 'Actif', value: 'ACTIVE' },
        { label: 'Blessé', value: 'INJURED' },
        { label: 'Suspendu', value: 'SUSPENDED' },
        { label: 'Fatigué', value: 'TIRED' }
    ];

    ngOnInit() {
        if (this.player) {
            this.isEditMode = true;
            this.playerData = { ...this.player };
            if (this.player.date_of_birth) {
                this.birthDate = new Date(this.player.date_of_birth);
            }
        } else {
            this.resetForm();
        }
    }

    resetForm() {
        this.playerData = {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            birth_place: '',
            nationality: '',
            blood_type: 'O+',
            jersey_number: 1,
            preferred_position: '',
            foot_preference: 'RIGHT',
            height: 175,
            weight: 70,
            license_number: '',
            status: 'ACTIVE',
            photo: '',
            team_id: this.teamId
        };
        this.birthDate = null;
        this.isEditMode = false;
    }

    save() {
        // Validation
        if (!this.playerData.first_name || !this.playerData.last_name || !this.playerData.email) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez remplir tous les champs obligatoires'
            });
            return;
        }

        // Convertir la date
        if (this.birthDate) {
            const year = this.birthDate.getFullYear();
            const month = String(this.birthDate.getMonth() + 1).padStart(2, '0');
            const day = String(this.birthDate.getDate()).padStart(2, '0');
            this.playerData.date_of_birth = `${year}-${month}-${day}`;
        }

        this.playerData.team_id = this.teamId;

        this.saving = true;

        if (this.isEditMode && this.player?.id) {
            // Modifier
            this.clubManagerService.updatePlayer(this.player.id, this.playerData).subscribe({
                next: (updatedPlayer) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Joueur modifié avec succès'
                    });
                    this.playerSaved.emit(updatedPlayer);
                    this.close();
                },
                error: (err) => {
                    console.error('Erreur modification joueur:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de modifier le joueur'
                    });
                    this.saving = false;
                }
            });
        } else {
            // Créer
            this.clubManagerService.createPlayer(this.playerData).subscribe({
                next: (newPlayer) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Joueur créé avec succès'
                    });
                    this.playerSaved.emit(newPlayer);
                    this.close();
                },
                error: (err) => {
                    console.error('Erreur création joueur:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de créer le joueur'
                    });
                    this.saving = false;
                }
            });
        }
    }

    cancel() {
        this.close();
    }

    close() {
        this.saving = false;
        this.visible = false;
        this.visibleChange.emit(false);
        if (!this.isEditMode) {
            this.resetForm();
        }
    }
}
