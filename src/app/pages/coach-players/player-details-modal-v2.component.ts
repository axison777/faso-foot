import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { CoachPlayer } from '../../models/coach-api.model';

@Component({
    selector: 'app-player-details-modal-v2',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, TabViewModule],
    template: `
        <p-dialog 
            [(visible)]="visible" 
            [modal]="true" 
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '90vw', maxWidth: '1400px', maxHeight: '90vh' }"
            [header]="player ? player.first_name + ' ' + player.last_name : 'Détails du joueur'"
            styleClass="player-modal">
            
            <div class="modal-content" *ngIf="player">
                <!-- En-tête avec photo et infos principales -->
                <div class="player-header">
                    <div class="jersey-circle">{{ player.jersey_number }}</div>
                    
                    <div class="player-photo-section">
                        <img *ngIf="player.photo" 
                             [src]="player.photo" 
                             [alt]="player.first_name + ' ' + player.last_name"
                             class="player-photo">
                        <div *ngIf="!player.photo" class="photo-placeholder">
                            {{ getInitials(player.first_name, player.last_name) }}
                        </div>
                    </div>

                    <div class="player-main-info">
                        <h1>{{ player.first_name }} {{ player.last_name }}</h1>
                        <div class="position-badge" [ngClass]="getPositionClass(player.preferred_position)">
                            {{ player.preferred_position }}
                        </div>
                        <div class="status-badge" [ngClass]="'status-' + player.status.toLowerCase()">
                            {{ getStatusLabel(player.status) }}
                        </div>
                    </div>
                </div>

                <!-- Tabs pour organiser les données -->
                <p-tabView>
                    <!-- Informations Personnelles -->
                    <p-tabPanel header="Informations Personnelles">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Prénom</label>
                                <span>{{ player.first_name }}</span>
                            </div>
                            <div class="info-item">
                                <label>Nom</label>
                                <span>{{ player.last_name }}</span>
                            </div>
                            <div class="info-item">
                                <label>Email</label>
                                <span>{{ player.email }}</span>
                            </div>
                            <div class="info-item">
                                <label>Téléphone</label>
                                <span>{{ player.phone }}</span>
                            </div>
                            <div class="info-item">
                                <label>Date de naissance</label>
                                <span>{{ player.date_of_birth | date:'dd/MM/yyyy' }} ({{ calculateAge(player.date_of_birth) }} ans)</span>
                            </div>
                            <div class="info-item">
                                <label>Lieu de naissance</label>
                                <span>{{ player.birth_place }}</span>
                            </div>
                            <div class="info-item">
                                <label>Nationalité</label>
                                <span>{{ player.nationality }}</span>
                            </div>
                            <div class="info-item">
                                <label>Groupe sanguin</label>
                                <span>{{ player.blood_type }}</span>
                            </div>
                        </div>
                    </p-tabPanel>

                    <!-- Caractéristiques Sportives -->
                    <p-tabPanel header="Caractéristiques Sportives">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Numéro de maillot</label>
                                <span class="jersey-large">{{ player.jersey_number }}</span>
                            </div>
                            <div class="info-item">
                                <label>Position préférée</label>
                                <span>{{ player.preferred_position }}</span>
                            </div>
                            <div class="info-item">
                                <label>Pied préféré</label>
                                <span>{{ getFootLabel(player.foot_preference) }}</span>
                            </div>
                            <div class="info-item">
                                <label>Taille</label>
                                <span>{{ player.height }} cm</span>
                            </div>
                            <div class="info-item">
                                <label>Poids</label>
                                <span>{{ player.weight }} kg</span>
                            </div>
                            <div class="info-item">
                                <label>Numéro de licence</label>
                                <span>{{ player.license_number }}</span>
                            </div>
                            <div class="info-item">
                                <label>Statut</label>
                                <span [ngClass]="'status-' + player.status.toLowerCase()">
                                    {{ getStatusLabel(player.status) }}
                                </span>
                            </div>
                            <div class="info-item" *ngIf="player.fitness_level">
                                <label>Niveau de forme</label>
                                <span [ngClass]="'fitness-' + player.fitness_level.toLowerCase()">
                                    {{ getFitnessLabel(player.fitness_level) }}
                                </span>
                            </div>
                        </div>
                    </p-tabPanel>

                    <!-- Statistiques -->
                    <p-tabPanel header="Statistiques" *ngIf="player.statistics">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <i class="pi pi-bullseye"></i>
                                <div class="stat-value">{{ player.statistics.goals }}</div>
                                <div class="stat-label">Buts</div>
                            </div>
                            <div class="stat-card">
                                <i class="pi pi-send"></i>
                                <div class="stat-value">{{ player.statistics.assists }}</div>
                                <div class="stat-label">Passes décisives</div>
                            </div>
                            <div class="stat-card">
                                <i class="pi pi-calendar"></i>
                                <div class="stat-value">{{ player.statistics.matches_played }}</div>
                                <div class="stat-label">Matchs joués</div>
                            </div>
                            <div class="stat-card">
                                <i class="pi pi-clock"></i>
                                <div class="stat-value">{{ player.statistics.minutes_played }}</div>
                                <div class="stat-label">Minutes jouées</div>
                            </div>
                            <div class="stat-card yellow">
                                <i class="pi pi-exclamation-triangle"></i>
                                <div class="stat-value">{{ player.statistics.yellow_cards }}</div>
                                <div class="stat-label">Cartons jaunes</div>
                            </div>
                            <div class="stat-card red">
                                <i class="pi pi-times-circle"></i>
                                <div class="stat-value">{{ player.statistics.red_cards }}</div>
                                <div class="stat-label">Cartons rouges</div>
                            </div>
                            <div class="stat-card" *ngIf="player.statistics.shots_on_target !== undefined">
                                <i class="pi pi-target"></i>
                                <div class="stat-value">{{ player.statistics.shots_on_target }}</div>
                                <div class="stat-label">Tirs cadrés</div>
                            </div>
                            <div class="stat-card" *ngIf="player.statistics.pass_accuracy !== undefined">
                                <i class="pi pi-percentage"></i>
                                <div class="stat-value">{{ player.statistics.pass_accuracy }}%</div>
                                <div class="stat-label">Précision passes</div>
                            </div>
                            <div class="stat-card" *ngIf="player.statistics.tackles !== undefined">
                                <i class="pi pi-shield"></i>
                                <div class="stat-value">{{ player.statistics.tackles }}</div>
                                <div class="stat-label">Tacles</div>
                            </div>
                            <div class="stat-card" *ngIf="player.statistics.interceptions !== undefined">
                                <i class="pi pi-ban"></i>
                                <div class="stat-value">{{ player.statistics.interceptions }}</div>
                                <div class="stat-label">Interceptions</div>
                            </div>
                        </div>
                    </p-tabPanel>

                    <!-- État de santé/suspension -->
                    <p-tabPanel header="État & Disponibilité">
                        <div class="health-section">
                            <h3>Statut actuel</h3>
                            <div class="status-info">
                                <div class="status-badge-large" [ngClass]="'status-' + player.status.toLowerCase()">
                                    {{ getStatusLabel(player.status) }}
                                </div>
                            </div>

                            <div *ngIf="player.status === 'INJURED' && (player.injury_type || player.injury_start_date || player.injury_end_date)" class="alert alert-warning">
                                <h4><i class="pi pi-heart"></i> Blessure</h4>
                                <div class="alert-content">
                                    <p *ngIf="player.injury_type"><strong>Type:</strong> {{ player.injury_type }}</p>
                                    <p *ngIf="player.injury_start_date"><strong>Début:</strong> {{ player.injury_start_date | date:'dd/MM/yyyy' }}</p>
                                    <p *ngIf="player.injury_end_date"><strong>Retour prévu:</strong> {{ player.injury_end_date | date:'dd/MM/yyyy' }}</p>
                                </div>
                            </div>

                            <div *ngIf="player.status === 'SUSPENDED' && (player.suspension_reason || player.suspension_end_date)" class="alert alert-danger">
                                <h4><i class="pi pi-ban"></i> Suspension</h4>
                                <div class="alert-content">
                                    <p *ngIf="player.suspension_reason"><strong>Raison:</strong> {{ player.suspension_reason }}</p>
                                    <p *ngIf="player.suspension_end_date"><strong>Fin:</strong> {{ player.suspension_end_date | date:'dd/MM/yyyy' }}</p>
                                </div>
                            </div>

                            <div *ngIf="player.fitness_level" class="fitness-section">
                                <h4>Condition physique</h4>
                                <div class="fitness-bar-container">
                                    <div class="fitness-bar">
                                        <div class="fitness-fill" 
                                             [ngClass]="'fitness-' + player.fitness_level.toLowerCase()"
                                             [style.width.%]="getFitnessPercentage(player.fitness_level)">
                                        </div>
                                    </div>
                                    <span class="fitness-label">{{ getFitnessLabel(player.fitness_level) }}</span>
                                </div>
                            </div>

                            <div *ngIf="player.contract_end_date" class="contract-section">
                                <h4>Contrat</h4>
                                <p><strong>Fin de contrat:</strong> {{ player.contract_end_date | date:'dd/MM/yyyy' }}</p>
                                <span class="contract-status" [ngClass]="getContractClass(player.contract_end_date)">
                                    {{ getContractStatus(player.contract_end_date) }}
                                </span>
                            </div>
                        </div>
                    </p-tabPanel>

                    <!-- Données brutes (pour debug) -->
                    <p-tabPanel header="Données complètes">
                        <div class="raw-data">
                            <pre>{{ player | json }}</pre>
                        </div>
                    </p-tabPanel>
                </p-tabView>
            </div>

            <ng-template pTemplate="footer">
                <button pButton label="Fermer" icon="pi pi-times" class="p-button-secondary" (click)="close()"></button>
                <button pButton label="Modifier" icon="pi pi-pencil" class="p-button-primary" (click)="edit()"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        .modal-content {
            padding: 1rem;
        }

        .player-header {
            display: flex;
            align-items: center;
            gap: 2rem;
            margin-bottom: 2rem;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
        }

        .jersey-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: white;
            color: #667eea;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .player-photo-section {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .player-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.3);
            font-size: 3rem;
            font-weight: 700;
        }

        .player-main-info {
            flex: 1;
        }

        .player-main-info h1 {
            margin: 0 0 1rem 0;
            font-size: 2.5rem;
            font-weight: 700;
        }

        .position-badge, .status-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            margin-right: 0.5rem;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            padding: 1.5rem;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .info-item label {
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-item span {
            font-size: 1.1rem;
            color: #1a1a1a;
            font-weight: 500;
        }

        .jersey-large {
            font-size: 2rem !important;
            font-weight: 700 !important;
            color: #667eea !important;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.5rem;
            padding: 1.5rem;
        }

        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 2px solid #e5e7eb;
            text-align: center;
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .stat-card i {
            font-size: 2rem;
            color: #667eea;
            margin-bottom: 0.5rem;
        }

        .stat-card.yellow i {
            color: #f59e0b;
        }

        .stat-card.red i {
            color: #ef4444;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0.5rem 0;
        }

        .stat-label {
            font-size: 0.875rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .health-section {
            padding: 1.5rem;
        }

        .health-section h3, .health-section h4 {
            color: #1a1a1a;
            margin-bottom: 1rem;
        }

        .status-info {
            margin-bottom: 2rem;
        }

        .status-badge-large {
            display: inline-block;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-size: 1.25rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        .status-active {
            background: #dcfce7;
            color: #166534;
        }

        .status-injured {
            background: #fed7aa;
            color: #c2410c;
        }

        .status-suspended {
            background: #fecaca;
            color: #dc2626;
        }

        .status-tired {
            background: #e5e7eb;
            color: #6b7280;
        }

        .alert {
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }

        .alert-warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
        }

        .alert-danger {
            background: #fecaca;
            border-left: 4px solid #ef4444;
        }

        .alert h4 {
            margin: 0 0 1rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .alert-content p {
            margin: 0.5rem 0;
        }

        .fitness-section, .contract-section {
            margin-top: 2rem;
        }

        .fitness-bar-container {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .fitness-bar {
            flex: 1;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }

        .fitness-fill {
            height: 100%;
            transition: width 0.3s ease;
        }

        .fitness-excellent {
            background: #10b981;
        }

        .fitness-good {
            background: #84cc16;
        }

        .fitness-fair {
            background: #f59e0b;
        }

        .fitness-poor {
            background: #ef4444;
        }

        .fitness-label {
            font-weight: 600;
            font-size: 1.1rem;
        }

        .contract-status {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 0.5rem;
        }

        .contract-valid {
            background: #dcfce7;
            color: #166534;
        }

        .contract-expiring {
            background: #fed7aa;
            color: #c2410c;
        }

        .contract-expired {
            background: #fecaca;
            color: #dc2626;
        }

        .raw-data {
            padding: 1rem;
            background: #f3f4f6;
            border-radius: 8px;
        }

        .raw-data pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 0.875rem;
        }
    `]
})
export class PlayerDetailsModalV2Component {
    @Input() visible = false;
    @Input() player: CoachPlayer | null = null;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() editPlayerEvent = new EventEmitter<CoachPlayer>();

    close() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    edit() {
        if (this.player) {
            this.editPlayerEvent.emit(this.player);
        }
    }

    getInitials(firstName: string, lastName: string): string {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

    getStatusLabel(status: string): string {
        const labels: any = {
            'ACTIVE': 'Actif',
            'INJURED': 'Blessé',
            'SUSPENDED': 'Suspendu',
            'TIRED': 'Fatigué'
        };
        return labels[status] || status;
    }

    getFootLabel(foot: string): string {
        const labels: any = {
            'LEFT': 'Gauche',
            'RIGHT': 'Droit',
            'BOTH': 'Ambidextre'
        };
        return labels[foot] || foot;
    }

    getFitnessLabel(level: string): string {
        const labels: any = {
            'EXCELLENT': 'Excellent',
            'GOOD': 'Bon',
            'FAIR': 'Moyen',
            'POOR': 'Faible'
        };
        return labels[level] || level;
    }

    getFitnessPercentage(level: string): number {
        const percentages: any = {
            'EXCELLENT': 100,
            'GOOD': 75,
            'FAIR': 50,
            'POOR': 25
        };
        return percentages[level] || 75;
    }

    getPositionClass(position: string): string {
        if (['GK'].includes(position)) return 'position-goalkeeper';
        if (['CB', 'RB', 'LB', 'RWB', 'LWB'].includes(position)) return 'position-defender';
        if (['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(position)) return 'position-midfielder';
        if (['RW', 'LW', 'ST', 'CF'].includes(position)) return 'position-forward';
        return '';
    }

    getContractClass(endDate: string): string {
        const end = new Date(endDate);
        const now = new Date();
        const sixMonths = new Date(now.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
        
        if (end < now) return 'contract-expired';
        if (end <= sixMonths) return 'contract-expiring';
        return 'contract-valid';
    }

    getContractStatus(endDate: string): string {
        const classStatus = this.getContractClass(endDate);
        const labels: any = {
            'contract-valid': 'Contrat valide',
            'contract-expiring': 'Expire bientôt',
            'contract-expired': 'Contrat expiré'
        };
        return labels[classStatus] || 'Contrat valide';
    }
}
