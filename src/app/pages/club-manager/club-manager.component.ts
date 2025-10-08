import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CoachDashboardV2Component } from '../coach-dashboard-v2/coach-dashboard-v2.component';
import { CoachMatchesComponent } from '../coach-matches/coach-matches.component';
import { CoachPlayersComponent } from '../coach-players/coach-players.component';

interface ClubTeam {
    id: string;
    name: string;
    category: string;
    logo?: string;
    coach: {
        id: string;
        name: string;
        email: string;
    };
    players: number;
    status: 'ACTIVE' | 'INACTIVE';
}

interface ClubManager {
    id: string;
    name: string;
    email: string;
    club: {
        id: string;
        name: string;
        logo?: string;
        address: string;
        phone: string;
        email: string;
    };
    teams: ClubTeam[];
}

@Component({
    selector: 'app-club-manager',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, DropdownModule, CardModule,
        TabViewModule, DividerModule, ToastModule, CoachDashboardV2Component,
        CoachMatchesComponent, CoachPlayersComponent
    ],
    providers: [MessageService],
    template: `
        <div class="club-manager-page">
            <!-- En-tête avec sélection d'équipe -->
            <div class="page-header">
                <div class="header-content">
                    <div class="header-main">
                        <h1>Gestion du Club</h1>
                        <p>{{ manager()?.club?.name }}</p>
                    </div>
                    <div class="team-selector">
                        <label for="teamSelect">Équipe sélectionnée :</label>
                        <p-dropdown 
                            [options]="teamOptions" 
                            [(ngModel)]="selectedTeamId" 
                            (onChange)="onTeamChange()"
                            placeholder="Sélectionner une équipe"
                            optionLabel="name"
                            optionValue="id"
                            class="team-dropdown">
                        </p-dropdown>
                    </div>
                </div>
            </div>

            <!-- Navigation par onglets -->
            <div class="tabs-container">
                <p-tabView [(activeIndex)]="activeTabIndex">
                    <!-- Onglet Dashboard -->
                    <p-tabPanel header="Tableau de Bord">
                        <div class="tab-content">
                            <div class="team-info-card" *ngIf="selectedTeam() as team">
                                <div class="team-header">
                                    <div class="team-logo">
                                        <img *ngIf="team.logo" [src]="team.logo" [alt]="team.name">
                                        <div *ngIf="!team.logo" class="logo-placeholder">
                                            {{ getInitials(team.name) }}
                                        </div>
                                    </div>
                                    <div class="team-details">
                                        <h2>{{ team.name }}</h2>
                                        <p class="team-category">{{ team.category }}</p>
                                        <div class="team-stats">
                                            <span class="stat-item">
                                                <i class="pi pi-users"></i>
                                                {{ team.players }} joueurs
                                            </span>
                                            <span class="stat-item">
                                                <i class="pi pi-user"></i>
                                                Coach: {{ team.coach.name }}
                                            </span>
                                            <span class="stat-item" [ngClass]="team.status === 'ACTIVE' ? 'status-active' : 'status-inactive'">
                                                <i class="pi" [ngClass]="team.status === 'ACTIVE' ? 'pi-check-circle' : 'pi-times-circle'"></i>
                                                {{ team.status === 'ACTIVE' ? 'Active' : 'Inactive' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Dashboard de l'équipe sélectionnée -->
                            <app-coach-dashboard-v2 
                                *ngIf="selectedTeam()" 
                                [teamId]="selectedTeamId">
                            </app-coach-dashboard-v2>
                        </div>
                    </p-tabPanel>

                    <!-- Onglet Matchs -->
                    <p-tabPanel header="Matchs">
                        <div class="tab-content">
                            <div class="team-info-header" *ngIf="selectedTeam() as team">
                                <h3>Matchs - {{ team.name }}</h3>
                                <p>Gérez les matchs de l'équipe {{ team.category }}</p>
                            </div>
                            <app-coach-matches 
                                *ngIf="selectedTeamId" 
                                [teamId]="selectedTeamId">
                            </app-coach-matches>
                        </div>
                    </p-tabPanel>

                    <!-- Onglet Joueurs -->
                    <p-tabPanel header="Joueurs">
                        <div class="tab-content">
                            <div class="team-info-header" *ngIf="selectedTeam() as team">
                                <h3>Effectif - {{ team.name }}</h3>
                                <p>Gérez les joueurs de l'équipe {{ team.category }}</p>
                            </div>
                            <app-coach-players 
                                *ngIf="selectedTeamId" 
                                [teamId]="selectedTeamId">
                            </app-coach-players>
                        </div>
                    </p-tabPanel>

                    <!-- Onglet Paramètres -->
                    <p-tabPanel header="Paramètres">
                        <div class="tab-content">
                            <div class="settings-container">
                                <!-- Paramètres du Club -->
                                <div class="settings-section">
                                    <h3>Informations du Club</h3>
                                    <div class="settings-form">
                                        <div class="form-group">
                                            <label>Nom du Club</label>
                                            <input type="text" [(ngModel)]="clubSettings.name" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Adresse</label>
                                            <textarea [(ngModel)]="clubSettings.address" class="form-control" rows="3"></textarea>
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Téléphone</label>
                                                <input type="tel" [(ngModel)]="clubSettings.phone" class="form-control">
                                            </div>
                                            <div class="form-group">
                                                <label>Email</label>
                                                <input type="email" [(ngModel)]="clubSettings.email" class="form-control">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label>Logo du Club</label>
                                            <div class="file-upload">
                                                <input type="file" accept="image/*" (change)="onLogoChange($event)" class="file-input">
                                                <button type="button" class="upload-btn">
                                                    <i class="pi pi-upload"></i>
                                                    Choisir un logo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Paramètres de l'Équipe Sélectionnée -->
                                <div class="settings-section" *ngIf="selectedTeam() as team">
                                    <h3>Paramètres - {{ team.name }}</h3>
                                    <div class="settings-form">
                                        <div class="form-group">
                                            <label>Nom de l'Équipe</label>
                                            <input type="text" [(ngModel)]="teamSettings.name" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Catégorie</label>
                                            <p-dropdown 
                                                [options]="categoryOptions" 
                                                [(ngModel)]="teamSettings.category"
                                                placeholder="Sélectionner une catégorie"
                                                class="form-control">
                                            </p-dropdown>
                                        </div>
                                        <div class="form-group">
                                            <label>Coach Principal</label>
                                            <p-dropdown 
                                                [options]="coachOptions" 
                                                [(ngModel)]="teamSettings.coachId"
                                                placeholder="Sélectionner un coach"
                                                class="form-control">
                                            </p-dropdown>
                                        </div>
                                        <div class="form-group">
                                            <label>Statut</label>
                                            <p-dropdown 
                                                [options]="statusOptions" 
                                                [(ngModel)]="teamSettings.status"
                                                placeholder="Sélectionner un statut"
                                                class="form-control">
                                            </p-dropdown>
                                        </div>
                                    </div>
                                </div>

                                <!-- Paramètres de Notifications -->
                                <div class="settings-section">
                                    <h3>Notifications</h3>
                                    <div class="settings-form">
                                        <div class="checkbox-group">
                                            <label class="checkbox-item">
                                                <input type="checkbox" [(ngModel)]="notificationSettings.matchReminders">
                                                <span class="checkmark"></span>
                                                Rappels de matchs
                                            </label>
                                            <label class="checkbox-item">
                                                <input type="checkbox" [(ngModel)]="notificationSettings.teamSheetDeadlines">
                                                <span class="checkmark"></span>
                                                Échéances feuilles de match
                                            </label>
                                            <label class="checkbox-item">
                                                <input type="checkbox" [(ngModel)]="notificationSettings.playerInjuries">
                                                <span class="checkmark"></span>
                                                Blessures de joueurs
                                            </label>
                                            <label class="checkbox-item">
                                                <input type="checkbox" [(ngModel)]="notificationSettings.contractExpirations">
                                                <span class="checkmark"></span>
                                                Expiration de contrats
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="settings-actions">
                                    <button class="btn-primary" (click)="saveSettings()">
                                        <i class="pi pi-save"></i>
                                        Sauvegarder
                                    </button>
                                    <button class="btn-secondary" (click)="resetSettings()">
                                        <i class="pi pi-refresh"></i>
                                        Réinitialiser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </p-tabPanel>
                </p-tabView>
            </div>
        </div>

        <p-toast></p-toast>
    `,
    styles: [`
        .club-manager-page {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            background: #f8fafc;
            min-height: 100vh;
        }

        .page-header {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
        }

        .header-main h1 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
            font-size: 2.5rem;
            font-weight: 700;
        }

        .header-main p {
            margin: 0;
            color: #6b7280;
            font-size: 1.1rem;
        }

        .team-selector {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            min-width: 300px;
        }

        .team-selector label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
        }

        .team-dropdown {
            width: 100%;
        }

        .tabs-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            overflow: hidden;
        }

        .tab-content {
            padding: 2rem;
        }

        .team-info-card {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            border: 1px solid #e5e7eb;
        }

        .team-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .team-logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            border: 3px solid #e5e7eb;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .logo-placeholder {
            font-size: 2rem;
            font-weight: 700;
            color: #6b7280;
        }

        .team-details {
            flex: 1;
        }

        .team-details h2 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
            font-size: 1.5rem;
            font-weight: 700;
        }

        .team-category {
            margin: 0 0 1rem 0;
            color: #6b7280;
            font-size: 1rem;
        }

        .team-stats {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #6b7280;
            font-size: 0.875rem;

            i {
                color: #9ca3af;
            }

            &.status-active {
                color: #10b981;
            }

            &.status-inactive {
                color: #ef4444;
            }
        }

        .team-info-header {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;

            h3 {
                margin: 0 0 0.5rem 0;
                color: #1a1a1a;
                font-size: 1.5rem;
                font-weight: 700;
            }

            p {
                margin: 0;
                color: #6b7280;
                font-size: 1rem;
            }
        }

        .settings-container {
            max-width: 800px;
        }

        .settings-section {
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e5e7eb;

            &:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }

            h3 {
                margin: 0 0 1.5rem 0;
                color: #1a1a1a;
                font-size: 1.25rem;
                font-weight: 700;
            }
        }

        .settings-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            label {
                font-weight: 600;
                color: #374151;
                font-size: 0.875rem;
            }
        }

        .form-control {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.875rem;
            transition: all 0.2s ease;

            &:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
        }

        .file-upload {
            position: relative;
            display: inline-block;
        }

        .file-input {
            position: absolute;
            opacity: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }

        .upload-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                background: #e5e7eb;
            }
        }

        .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            font-size: 0.875rem;
            color: #374151;

            input[type="checkbox"] {
                display: none;
            }

            .checkmark {
                width: 20px;
                height: 20px;
                border: 2px solid #d1d5db;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            input[type="checkbox"]:checked + .checkmark {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;

                &::after {
                    content: '✓';
                    font-size: 12px;
                    font-weight: bold;
                }
            }
        }

        .settings-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
        }

        .btn-primary, .btn-secondary {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-primary {
            background: #3b82f6;
            color: white;

            &:hover {
                background: #2563eb;
            }
        }

        .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;

            &:hover {
                background: #e5e7eb;
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .club-manager-page {
                padding: 1rem;
            }

            .header-content {
                flex-direction: column;
                align-items: stretch;
            }

            .team-selector {
                min-width: auto;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .team-stats {
                flex-direction: column;
                gap: 0.5rem;
            }

            .settings-actions {
                flex-direction: column;
            }
        }
    `]
})
export class ClubManagerComponent implements OnInit {
    manager = signal<ClubManager | null>(null);
    selectedTeamId = '';
    activeTabIndex = 0;

    teamOptions: any[] = [];
    categoryOptions = [
        { label: 'U7', value: 'U7' },
        { label: 'U9', value: 'U9' },
        { label: 'U11', value: 'U11' },
        { label: 'U13', value: 'U13' },
        { label: 'U15', value: 'U15' },
        { label: 'U17', value: 'U17' },
        { label: 'U19', value: 'U19' },
        { label: 'Senior', value: 'Senior' },
        { label: 'Vétéran', value: 'Vétéran' }
    ];

    coachOptions: any[] = [];
    statusOptions = [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' }
    ];

    clubSettings = {
        name: '',
        address: '',
        phone: '',
        email: '',
        logo: ''
    };

    teamSettings = {
        name: '',
        category: '',
        coachId: '',
        status: 'ACTIVE'
    };

    notificationSettings = {
        matchReminders: true,
        teamSheetDeadlines: true,
        playerInjuries: true,
        contractExpirations: true
    };

    constructor(private messageService: MessageService) {}

    ngOnInit() {
        this.loadManagerData();
    }

    selectedTeam() {
        if (!this.manager() || !this.selectedTeamId) return null;
        return this.manager()!.teams.find(team => team.id === this.selectedTeamId);
    }

    loadManagerData() {
        // Données mockées pour le responsable de club
        const mockManager: ClubManager = {
            id: '1',
            name: 'Jean Dupont',
            email: 'jean.dupont@club.com',
            club: {
                id: '1',
                name: 'Club Sportif Municipal',
                logo: 'assets/images/club-logo.png',
                address: '123 Avenue du Sport, 75000 Paris',
                phone: '01 23 45 67 89',
                email: 'contact@club.com'
            },
            teams: [
                {
                    id: '1',
                    name: 'Équipe Senior A',
                    category: 'Senior',
                    logo: 'assets/images/team-senior.png',
                    coach: {
                        id: '1',
                        name: 'Pierre Martin',
                        email: 'pierre.martin@club.com'
                    },
                    players: 25,
                    status: 'ACTIVE'
                },
                {
                    id: '2',
                    name: 'Équipe U19',
                    category: 'U19',
                    logo: 'assets/images/team-u19.png',
                    coach: {
                        id: '2',
                        name: 'Marie Dubois',
                        email: 'marie.dubois@club.com'
                    },
                    players: 22,
                    status: 'ACTIVE'
                },
                {
                    id: '3',
                    name: 'Équipe U17',
                    category: 'U17',
                    logo: 'assets/images/team-u17.png',
                    coach: {
                        id: '3',
                        name: 'Paul Leroy',
                        email: 'paul.leroy@club.com'
                    },
                    players: 20,
                    status: 'ACTIVE'
                },
                {
                    id: '4',
                    name: 'Équipe Féminine',
                    category: 'Senior',
                    logo: 'assets/images/team-feminine.png',
                    coach: {
                        id: '4',
                        name: 'Sophie Bernard',
                        email: 'sophie.bernard@club.com'
                    },
                    players: 18,
                    status: 'ACTIVE'
                }
            ]
        };

        this.manager.set(mockManager);
        this.teamOptions = mockManager.teams.map(team => ({
            label: `${team.name} (${team.category})`,
            value: team.id,
            ...team
        }));

        this.coachOptions = mockManager.teams.map(team => ({
            label: team.coach.name,
            value: team.coach.id
        }));

        // Sélectionner la première équipe par défaut
        if (mockManager.teams.length > 0) {
            this.selectedTeamId = mockManager.teams[0].id;
            this.loadTeamSettings();
        }

        this.loadClubSettings();
    }

    onTeamChange() {
        this.loadTeamSettings();
        this.messageService.add({
            severity: 'info',
            summary: 'Équipe sélectionnée',
            detail: `Affichage des données de ${this.selectedTeam()?.name}`
        });
    }

    loadClubSettings() {
        const club = this.manager()?.club;
        if (club) {
            this.clubSettings = {
                name: club.name,
                address: club.address,
                phone: club.phone,
                email: club.email,
                logo: club.logo || ''
            };
        }
    }

    loadTeamSettings() {
        const team = this.selectedTeam();
        if (team) {
            this.teamSettings = {
                name: team.name,
                category: team.category,
                coachId: team.coach.id,
                status: team.status
            };
        }
    }

    onLogoChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            // Ici vous pourriez uploader le fichier vers le serveur
            this.messageService.add({
                severity: 'info',
                summary: 'Logo sélectionné',
                detail: 'Le logo sera uploadé lors de la sauvegarde'
            });
        }
    }

    saveSettings() {
        // Ici vous feriez l'appel API pour sauvegarder les paramètres
        this.messageService.add({
            severity: 'success',
            summary: 'Paramètres sauvegardés',
            detail: 'Tous les paramètres ont été sauvegardés avec succès'
        });
    }

    resetSettings() {
        this.loadClubSettings();
        this.loadTeamSettings();
        this.messageService.add({
            severity: 'info',
            summary: 'Paramètres réinitialisés',
            detail: 'Les paramètres ont été remis à leur valeur d\'origine'
        });
    }

    getInitials(name: string): string {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    }
}