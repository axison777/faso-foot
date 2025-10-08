import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';

interface CoachPlayer {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    position: string;
    jerseyNumber: number;
    status: 'ACTIVE' | 'INJURED' | 'SUSPENDED' | 'TIRED';
    contractEndDate: string;
    photo?: string;
    stats: {
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
    };
    fitnessLevel: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    injuryType?: string;
    suspensionReason?: string;
    suspensionEndDate?: string;
}

@Component({
    selector: 'app-coach-players',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule,
        TagModule, TableModule, MenuModule, DialogModule, ToastModule
    ],
    providers: [MessageService],
    template: `
        <div class="players-page">
            <!-- En-tête de la page -->
            <div class="page-header">
                <div class="header-content">
                    <h1>Effectif de l'Équipe</h1>
                    <p>Gérez les joueurs de votre équipe</p>
                </div>
            </div>

            <!-- Barre d'Action et de Filtrage -->
            <div class="filters-section">
                <div class="search-and-actions">
                    <div class="search-container">
                        <i class="pi pi-search"></i>
                        <input 
                            type="text" 
                            [(ngModel)]="searchTerm" 
                            (input)="filterPlayers()"
                            placeholder="Rechercher un joueur..."
                            class="search-input">
                    </div>
                    
                    <div class="action-buttons">
                        <button class="add-player-btn" (click)="addPlayer()">
                            <i class="pi pi-plus"></i>
                            Ajouter un joueur
                        </button>
                        <button class="export-btn" (click)="exportToSheets()">
                            <i class="pi pi-file-excel"></i>
                            Exporter vers Sheets
                        </button>
                    </div>
                </div>

                <!-- Filtres Rapides -->
                <div class="quick-filters">
                    <div class="filter-group">
                        <h4>Filtres Rapides</h4>
                        <div class="filter-tags">
                            <button class="filter-tag" 
                                    [class.active]="selectedFilters.includes('ALL')"
                                    (click)="toggleFilter('ALL')">
                                Tous
                            </button>
                            <button class="filter-tag injured" 
                                    [class.active]="selectedFilters.includes('INJURED')"
                                    (click)="toggleFilter('INJURED')">
                                <i class="pi pi-heart"></i>
                                Blessés
                            </button>
                            <button class="filter-tag suspended" 
                                    [class.active]="selectedFilters.includes('SUSPENDED')"
                                    (click)="toggleFilter('SUSPENDED')">
                                <i class="pi pi-ban"></i>
                                Suspendus
                            </button>
                            <button class="filter-tag contract-ending" 
                                    [class.active]="selectedFilters.includes('CONTRACT_ENDING')"
                                    (click)="toggleFilter('CONTRACT_ENDING')">
                                <i class="pi pi-clock"></i>
                                Fin de Contrat
                            </button>
                            <button class="filter-tag optimal-form" 
                                    [class.active]="selectedFilters.includes('OPTIMAL_FORM')"
                                    (click)="toggleFilter('OPTIMAL_FORM')">
                                <i class="pi pi-star"></i>
                                Forme Optimale
                            </button>
                        </div>
                    </div>

                    <div class="filter-group">
                        <h4>Position</h4>
                        <p-dropdown 
                            [options]="positionOptions" 
                            [(ngModel)]="selectedPosition" 
                            (onChange)="filterPlayers()"
                            placeholder="Toutes les positions"
                            class="position-dropdown">
                        </p-dropdown>
                    </div>
                </div>
            </div>

            <!-- Tableau des Joueurs -->
            <div class="players-table-section">
                <div class="table-header">
                    <h3>Effectif ({{ filteredPlayers.length }} joueurs)</h3>
                    <div class="table-actions">
                        <button class="action-btn" (click)="refreshPlayers()">
                            <i class="pi pi-refresh"></i>
                        </button>
                    </div>
                </div>

                <div class="table-container">
                    <p-table 
                        [value]="filteredPlayers" 
                        [paginator]="true" 
                        [rows]="10"
                        [showCurrentPageReport]="true"
                        currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} joueurs"
                        [rowsPerPageOptions]="[5, 10, 25, 50]"
                        styleClass="players-table">
                        
                        <ng-template pTemplate="header">
                            <tr>
                                <th style="width: 60px">#</th>
                                <th style="width: 200px">Joueur & Photo</th>
                                <th style="width: 80px">Âge</th>
                                <th style="width: 100px">Position</th>
                                <th style="width: 120px">Stats (B/PD)</th>
                                <th style="width: 120px">Forme</th>
                                <th style="width: 100px">Actions</th>
                            </tr>
                        </ng-template>

                        <ng-template pTemplate="body" let-player let-rowIndex="rowIndex">
                            <tr [ngClass]="getRowClass(player)">
                                <td class="jersey-number">
                                    <span class="jersey-badge">{{ player.jerseyNumber }}</span>
                                </td>
                                
                                <td class="player-info">
                                    <div class="player-avatar">
                                        <img *ngIf="player.photo" 
                                             [src]="player.photo" 
                                             [alt]="player.firstName + ' ' + player.lastName">
                                        <div *ngIf="!player.photo" class="avatar-placeholder">
                                            {{ getInitials(player.firstName, player.lastName) }}
                                        </div>
                                    </div>
                                    <div class="player-details">
                                        <div class="player-name">{{ player.firstName }} {{ player.lastName }}</div>
                                        <div class="player-status" [ngClass]="getStatusClass(player.status)">
                                            {{ getStatusLabel(player.status) }}
                                        </div>
                                    </div>
                                </td>

                                <td class="age">
                                    <div class="age-value">{{ calculateAge(player.birthDate) }} ans</div>
                                    <div class="birth-date">{{ player.birthDate | date:'dd/MM/yyyy' }}</div>
                                </td>

                                <td class="position">
                                    <span class="position-badge" [ngClass]="getPositionClass(player.position)">
                                        {{ player.position }}
                                    </span>
                                </td>

                                <td class="stats">
                                    <div class="stats-container">
                                        <div class="stat-item">
                                            <i class="pi pi-bullseye"></i>
                                            <span>{{ player.stats.goals }}</span>
                                        </div>
                                        <div class="stat-separator">/</div>
                                        <div class="stat-item">
                                            <i class="pi pi-send"></i>
                                            <span>{{ player.stats.assists }}</span>
                                        </div>
                                    </div>
                                    <div class="cards-info">
                                        <span class="yellow-cards">{{ player.stats.yellowCards }}🟨</span>
                                        <span class="red-cards">{{ player.stats.redCards }}🟥</span>
                                    </div>
                                </td>

                                <td class="fitness">
                                    <div class="fitness-indicator" [ngClass]="getFitnessClass(player.fitnessLevel)">
                                        <div class="fitness-bar">
                                            <div class="fitness-fill" [style.width.%]="getFitnessPercentage(player.fitnessLevel)"></div>
                                        </div>
                                        <span class="fitness-label">{{ getFitnessLabel(player.fitnessLevel) }}</span>
                                    </div>
                                </td>

                                <td class="actions">
                                    <div class="action-buttons">
                                        <button class="action-btn details" (click)="viewPlayerDetails(player)" title="Voir détails">
                                            <i class="pi pi-eye"></i>
                                        </button>
                                        <button class="action-btn edit" (click)="editPlayer(player)" title="Modifier">
                                            <i class="pi pi-pencil"></i>
                                        </button>
                                        <button class="action-btn delete" (click)="deletePlayer(player)" title="Supprimer">
                                            <i class="pi pi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </ng-template>

                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td colspan="7" class="empty-message">
                                    <div class="empty-state">
                                        <i class="pi pi-users"></i>
                                        <h4>Aucun joueur trouvé</h4>
                                        <p>Aucun joueur ne correspond à vos critères de recherche.</p>
                                    </div>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>
        </div>

        <p-toast></p-toast>
    `,
    styles: [`
        .players-page {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            background: #f8fafc;
            min-height: 100vh;
        }

        .page-header {
            margin-bottom: 2rem;
        }

        .header-content h1 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
            font-size: 2.5rem;
            font-weight: 700;
        }

        .header-content p {
            margin: 0;
            color: #6b7280;
            font-size: 1.1rem;
        }

        /* Barre d'Action et de Filtrage */
        .filters-section {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }

        .search-and-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            gap: 2rem;
        }

        .search-container {
            position: relative;
            flex: 1;
            max-width: 400px;
        }

        .search-container i {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
            z-index: 1;
        }

        .search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.3s ease;

            &:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
        }

        .action-buttons {
            display: flex;
            gap: 1rem;
        }

        .add-player-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

            &:hover {
                background: #059669;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            }
        }

        .export-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                background: #2563eb;
                transform: translateY(-2px);
            }
        }

        .quick-filters {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 2rem;
            align-items: end;
        }

        .filter-group h4 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #374151;
        }

        .filter-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
        }

        .filter-tag {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 20px;
            background: white;
            color: #6b7280;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                border-color: #3b82f6;
                color: #3b82f6;
                transform: translateY(-1px);
            }

            &.active {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
                transform: translateY(-1px);
            }

            &.injured.active {
                background: #f59e0b;
                border-color: #f59e0b;
            }

            &.suspended.active {
                background: #ef4444;
                border-color: #ef4444;
            }

            &.contract-ending.active {
                background: #6b7280;
                border-color: #6b7280;
            }

            &.optimal-form.active {
                background: #10b981;
                border-color: #10b981;
            }

            i {
                font-size: 0.875rem;
            }
        }

        .position-dropdown {
            min-width: 200px;
        }

        /* Tableau des Joueurs */
        .players-table-section {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            overflow: hidden;
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f8fafc;

            h3 {
                margin: 0;
                color: #1a1a1a;
                font-size: 1.25rem;
                font-weight: 600;
            }
        }

        .table-actions {
            display: flex;
            gap: 0.5rem;
        }

        .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                background: #f3f4f6;
                color: #374151;
            }
        }

        .table-container {
            overflow-x: auto;
        }

        .players-table {
            width: 100%;
            border-collapse: collapse;

            th {
                background: #f8fafc;
                color: #374151;
                font-weight: 600;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 1rem;
                text-align: left;
                border-bottom: 2px solid #e5e7eb;
            }

            td {
                padding: 1rem;
                border-bottom: 1px solid #f3f4f6;
                vertical-align: middle;
            }

            tr {
                transition: all 0.2s ease;

                &:hover {
                    background: #f8fafc;
                }

                &.injured {
                    background: #fef3c7;
                }

                &.suspended {
                    background: #fecaca;
                }

                &.contract-ending {
                    background: #f3f4f6;
                }
            }
        }

        .jersey-number {
            text-align: center;
        }

        .jersey-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            font-weight: 700;
            font-size: 1.1rem;
        }

        .player-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .player-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            border: 2px solid #e5e7eb;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .avatar-placeholder {
            font-weight: 700;
            color: #6b7280;
            font-size: 1.1rem;
        }

        .player-details {
            flex: 1;
        }

        .player-name {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 0.25rem;
        }

        .player-status {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;

            &.status-active {
                color: #10b981;
            }

            &.status-injured {
                color: #f59e0b;
            }

            &.status-suspended {
                color: #ef4444;
            }

            &.status-tired {
                color: #6b7280;
            }
        }

        .age {
            text-align: center;
        }

        .age-value {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 1.1rem;
        }

        .birth-date {
            font-size: 0.75rem;
            color: #6b7280;
        }

        .position {
            text-align: center;
        }

        .position-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;

            &.position-defender {
                background: #dbeafe;
                color: #1e40af;
            }

            &.position-midfielder {
                background: #fef3c7;
                color: #d97706;
            }

            &.position-forward {
                background: #fecaca;
                color: #dc2626;
            }

            &.position-goalkeeper {
                background: #e5e7eb;
                color: #374151;
            }
        }

        .stats {
            text-align: center;
        }

        .stats-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-weight: 600;
            color: #1a1a1a;

            i {
                font-size: 0.875rem;
                color: #6b7280;
            }
        }

        .stat-separator {
            color: #9ca3af;
            font-weight: 600;
        }

        .cards-info {
            font-size: 0.75rem;
            color: #6b7280;
        }

        .fitness {
            text-align: center;
        }

        .fitness-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .fitness-bar {
            width: 80px;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }

        .fitness-fill {
            height: 100%;
            transition: width 0.3s ease;

            &.fitness-excellent {
                background: #10b981;
            }

            &.fitness-good {
                background: #84cc16;
            }

            &.fitness-fair {
                background: #f59e0b;
            }

            &.fitness-poor {
                background: #ef4444;
            }
        }

        .fitness-label {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .actions {
            text-align: center;
        }

        .action-buttons {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
        }

        .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: white;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                background: #f3f4f6;
                color: #374151;
            }

            &.details:hover {
                background: #dbeafe;
                color: #1e40af;
            }

            &.edit:hover {
                background: #fef3c7;
                color: #d97706;
            }

            &.delete:hover {
                background: #fecaca;
                color: #dc2626;
            }
        }

        .empty-message {
            text-align: center;
            padding: 3rem;
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            color: #6b7280;

            i {
                font-size: 3rem;
                color: #9ca3af;
            }

            h4 {
                margin: 0;
                color: #374151;
            }

            p {
                margin: 0;
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .players-page {
                padding: 1rem;
            }

            .search-and-actions {
                flex-direction: column;
                align-items: stretch;
            }

            .action-buttons {
                justify-content: center;
            }

            .quick-filters {
                grid-template-columns: 1fr;
            }

            .filter-tags {
                justify-content: center;
            }

            .table-container {
                overflow-x: auto;
            }
        }
    `]
})
export class CoachPlayersComponent implements OnInit {
    searchTerm = '';
    selectedFilters: string[] = ['ALL'];
    selectedPosition = '';
    
    players: CoachPlayer[] = [];
    filteredPlayers: CoachPlayer[] = [];

    positionOptions = [
        { label: 'Toutes les positions', value: '' },
        { label: 'Gardien', value: 'GK' },
        { label: 'Défenseur Central', value: 'CB' },
        { label: 'Défenseur Droit', value: 'RB' },
        { label: 'Défenseur Gauche', value: 'LB' },
        { label: 'Milieu Défensif', value: 'CDM' },
        { label: 'Milieu Central', value: 'CM' },
        { label: 'Milieu Droit', value: 'RM' },
        { label: 'Milieu Gauche', value: 'LM' },
        { label: 'Ailier Droit', value: 'RW' },
        { label: 'Ailier Gauche', value: 'LW' },
        { label: 'Attaquant', value: 'ST' }
    ];

    constructor(private messageService: MessageService) {}

    ngOnInit() {
        this.loadPlayers();
    }

    loadPlayers() {
        // Données mockées pour les joueurs
        this.players = [
            {
                id: '1',
                firstName: 'Amadou',
                lastName: 'Ouedraogo',
                birthDate: '2005-03-15',
                position: 'RW',
                jerseyNumber: 7,
                status: 'ACTIVE',
                contractEndDate: '2026-06-30',
                fitnessLevel: 'EXCELLENT',
                stats: { goals: 7, assists: 3, yellowCards: 2, redCards: 0 }
            },
            {
                id: '2',
                firstName: 'Mamadi',
                lastName: 'Drago',
                birthDate: '2000-08-22',
                position: 'CDM',
                jerseyNumber: 6,
                status: 'TIRED',
                contractEndDate: '2025-06-30',
                fitnessLevel: 'FAIR',
                stats: { goals: 1, assists: 4, yellowCards: 3, redCards: 0 }
            },
            {
                id: '3',
                firstName: 'Amadou',
                lastName: 'Zerbo',
                birthDate: '1992-11-10',
                position: 'RW',
                jerseyNumber: 10,
                status: 'INJURED',
                contractEndDate: '2024-12-31',
                injuryType: 'Entorse cheville',
                fitnessLevel: 'POOR',
                stats: { goals: 0, assists: 1, yellowCards: 1, redCards: 0 }
            },
            {
                id: '4',
                firstName: 'Boubacar',
                lastName: 'Traoré',
                birthDate: '1998-05-18',
                position: 'ST',
                jerseyNumber: 9,
                status: 'SUSPENDED',
                contractEndDate: '2025-06-30',
                suspensionReason: 'Carton rouge',
                suspensionEndDate: '2024-12-15',
                fitnessLevel: 'GOOD',
                stats: { goals: 12, assists: 2, yellowCards: 4, redCards: 1 }
            },
            {
                id: '5',
                firstName: 'Ibrahim',
                lastName: 'Sangaré',
                birthDate: '1997-12-02',
                position: 'CM',
                jerseyNumber: 8,
                status: 'ACTIVE',
                contractEndDate: '2026-06-30',
                fitnessLevel: 'EXCELLENT',
                stats: { goals: 3, assists: 8, yellowCards: 2, redCards: 0 }
            },
            {
                id: '6',
                firstName: 'Sékou',
                lastName: 'Doumbia',
                birthDate: '1995-09-14',
                position: 'CB',
                jerseyNumber: 4,
                status: 'ACTIVE',
                contractEndDate: '2024-06-30',
                fitnessLevel: 'GOOD',
                stats: { goals: 0, assists: 1, yellowCards: 5, redCards: 0 }
            },
            {
                id: '7',
                firstName: 'Moussa',
                lastName: 'Diabaté',
                birthDate: '2001-07-25',
                position: 'GK',
                jerseyNumber: 1,
                status: 'ACTIVE',
                contractEndDate: '2027-06-30',
                fitnessLevel: 'EXCELLENT',
                stats: { goals: 0, assists: 0, yellowCards: 1, redCards: 0 }
            },
            {
                id: '8',
                firstName: 'Karim',
                lastName: 'Konaté',
                birthDate: '1999-04-12',
                position: 'LB',
                jerseyNumber: 3,
                status: 'ACTIVE',
                contractEndDate: '2025-06-30',
                fitnessLevel: 'GOOD',
                stats: { goals: 1, assists: 3, yellowCards: 2, redCards: 0 }
            }
        ];

        this.filteredPlayers = [...this.players];
    }

    filterPlayers() {
        this.filteredPlayers = this.players.filter(player => {
            const matchesSearch = !this.searchTerm || 
                `${player.firstName} ${player.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            const matchesPosition = !this.selectedPosition || player.position === this.selectedPosition;
            
            const matchesFilters = this.selectedFilters.includes('ALL') || this.selectedFilters.some(filter => {
                switch (filter) {
                    case 'INJURED':
                        return player.status === 'INJURED';
                    case 'SUSPENDED':
                        return player.status === 'SUSPENDED';
                    case 'CONTRACT_ENDING':
                        return this.isContractEnding(player.contractEndDate);
                    case 'OPTIMAL_FORM':
                        return player.fitnessLevel === 'EXCELLENT';
                    default:
                        return false;
                }
            });

            return matchesSearch && matchesPosition && matchesFilters;
        });
    }

    toggleFilter(filter: string) {
        if (filter === 'ALL') {
            this.selectedFilters = ['ALL'];
        } else {
            this.selectedFilters = this.selectedFilters.filter(f => f !== 'ALL');
            if (this.selectedFilters.includes(filter)) {
                this.selectedFilters = this.selectedFilters.filter(f => f !== filter);
            } else {
                this.selectedFilters.push(filter);
            }
            if (this.selectedFilters.length === 0) {
                this.selectedFilters = ['ALL'];
            }
        }
        this.filterPlayers();
    }

    isContractEnding(contractEndDate: string): boolean {
        const endDate = new Date(contractEndDate);
        const now = new Date();
        const sixMonthsFromNow = new Date(now.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
        return endDate <= sixMonthsFromNow;
    }

    calculateAge(birthDate: string): number {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    getInitials(firstName: string, lastName: string): string {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    getRowClass(player: CoachPlayer): string {
        const classes = [];
        if (player.status === 'INJURED') classes.push('injured');
        if (player.status === 'SUSPENDED') classes.push('suspended');
        if (this.isContractEnding(player.contractEndDate)) classes.push('contract-ending');
        return classes.join(' ');
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'ACTIVE': return 'Actif';
            case 'INJURED': return 'Blessé';
            case 'SUSPENDED': return 'Suspendu';
            case 'TIRED': return 'Fatigué';
            default: return status;
        }
    }

    getPositionClass(position: string): string {
        if (['CB', 'RB', 'LB'].includes(position)) return 'position-defender';
        if (['CDM', 'CM', 'RM', 'LM'].includes(position)) return 'position-midfielder';
        if (['RW', 'LW', 'ST'].includes(position)) return 'position-forward';
        if (position === 'GK') return 'position-goalkeeper';
        return '';
    }

    getFitnessClass(level: string): string {
        return `fitness-${level.toLowerCase()}`;
    }

    getFitnessLabel(level: string): string {
        switch (level) {
            case 'EXCELLENT': return 'Excellent';
            case 'GOOD': return 'Bon';
            case 'FAIR': return 'Correct';
            case 'POOR': return 'Faible';
            default: return level;
        }
    }

    getFitnessPercentage(level: string): number {
        switch (level) {
            case 'EXCELLENT': return 100;
            case 'GOOD': return 75;
            case 'FAIR': return 50;
            case 'POOR': return 25;
            default: return 0;
        }
    }

    addPlayer() {
        this.messageService.add({
            severity: 'info',
            summary: 'Ajouter un joueur',
            detail: 'Fonctionnalité à implémenter'
        });
    }

    editPlayer(player: CoachPlayer) {
        this.messageService.add({
            severity: 'info',
            summary: 'Modifier le joueur',
            detail: `Modification de ${player.firstName} ${player.lastName}`
        });
    }

    deletePlayer(player: CoachPlayer) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Supprimer le joueur',
            detail: `Suppression de ${player.firstName} ${player.lastName}`
        });
    }

    viewPlayerDetails(player: CoachPlayer) {
        this.messageService.add({
            severity: 'info',
            summary: 'Détails du joueur',
            detail: `Voir les détails de ${player.firstName} ${player.lastName}`
        });
    }

    exportToSheets() {
        this.messageService.add({
            severity: 'success',
            summary: 'Export réussi',
            detail: 'Export vers Google Sheets en cours...'
        });
    }

    refreshPlayers() {
        this.messageService.add({
            severity: 'info',
            summary: 'Actualisation',
            detail: 'Liste des joueurs actualisée'
        });
        this.loadPlayers();
    }
}