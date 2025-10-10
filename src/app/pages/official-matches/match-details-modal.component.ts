import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OfficialMatch, OfficialMatchService } from '../../service/official-match.service';

interface Player {
    id: string;
    name: string;
    position: string;
    jerseyNumber: number;
    isStarter: boolean;
    isCaptain: boolean;
    isGoalkeeper: boolean;
}

interface TeamSheet {
    teamId: string;
    teamName: string;
    players: Player[];
    coach: {
        name: string;
        license: string;
    };
    submittedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
}

@Component({
    selector: 'app-match-details-modal',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DialogModule, ButtonModule,
        InputTextModule, TextareaModule, CheckboxModule, ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-dialog 
            [(visible)]="visible" 
            [modal]="true" 
            [style]="{width: '95vw', maxWidth: '1400px'}" 
            [header]="'Détails du Match - ' + (match?.competition?.name || '')"
            [closable]="true"
            [draggable]="false"
            [resizable]="false">
            
            <div class="match-details-container" *ngIf="match">
                <!-- Informations générales du match -->
                <div class="match-info-section">
                    <h3>Informations du Match</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Compétition</label>
                            <span>{{ match.competition.name }}</span>
                        </div>
                        <div class="info-item">
                            <label>Date</label>
                            <span>{{ match.scheduledAt | date:'dd/MM/yyyy' }}</span>
                        </div>
                        <div class="info-item">
                            <label>Heure</label>
                            <span>{{ match.scheduledAt | date:'HH:mm' }}</span>
                        </div>
                        <div class="info-item">
                            <label>Stade</label>
                            <span>{{ match.stadium.name }}</span>
                        </div>
                        <div class="info-item">
                            <label>Statut</label>
                            <span class="status-badge" [ngClass]="getStatusClass(match?.status)">
                                {{ getStatusLabel(match?.status) }}
                            </span>
                        </div>
                        <div class="info-item" *ngIf="match.score">
                            <label>Score</label>
                            <span class="score-display">{{ match.score.home }} - {{ match.score.away }}</span>
                        </div>
                    </div>
                </div>

                <!-- Équipes et feuilles de match -->
                <div class="teams-section">
                    <h3>Équipes et Feuilles de Match</h3>
                    <div class="teams-grid">
                        <!-- Équipe domicile -->
                        <div class="team-card" [class.selected]="selectedTeam === 'home'">
                            <div class="team-header" (click)="selectTeam('home')">
                                <div class="team-info">
                                    <h4>{{ match?.homeTeam?.name || 'Équipe Domicile' }}</h4>
                                    <div class="team-status" [ngClass]="getTeamSheetStatusClass('home')">
                                        {{ getTeamSheetStatusLabel('home') }}
                                    </div>
                                </div>
                                <div class="team-actions">
                                    <i class="pi pi-chevron-right" [class.rotated]="selectedTeam === 'home'"></i>
                                </div>
                            </div>
                            
                            <!-- Détails de l'équipe domicile -->
                            <div class="team-details" *ngIf="selectedTeam === 'home'">
                                <div class="team-sheet-info">
                                    <div class="sheet-header">
                                        <h5>Feuille de Match</h5>
                                        <div class="sheet-status" [ngClass]="getTeamSheetStatusClass('home')">
                                            {{ getTeamSheetStatusLabel('home') }}
                                        </div>
                                    </div>
                                    
                                    <div class="coach-info" *ngIf="homeTeamSheet">
                                        <div class="coach-item">
                                            <label>Entraîneur</label>
                                            <span>{{ homeTeamSheet.coach.name }}</span>
                                        </div>
                                        <div class="coach-item">
                                            <label>N° Licence</label>
                                            <span>{{ homeTeamSheet.coach.license }}</span>
                                        </div>
                                        <div class="coach-item">
                                            <label>Soumis le</label>
                                            <span>{{ homeTeamSheet.submittedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                                        </div>
                                    </div>

                                    <!-- Liste des joueurs -->
                                    <div class="players-section" *ngIf="homeTeamSheet">
                                        <h6>Joueurs ({{ homeTeamSheet.players.length }})</h6>
                                        <div class="players-grid">
                                            <div class="player-card" *ngFor="let player of homeTeamSheet.players">
                                                <div class="player-info">
                                                    <div class="player-number">{{ player.jerseyNumber }}</div>
                                                    <div class="player-details">
                                                        <div class="player-name">{{ player.name }}</div>
                                                        <div class="player-position">{{ player.position }}</div>
                                                    </div>
                                                </div>
                                                <div class="player-badges">
                                                    <span class="badge starter" *ngIf="player.isStarter">Titulaire</span>
                                                    <span class="badge captain" *ngIf="player.isCaptain">Capitaine</span>
                                                    <span class="badge goalkeeper" *ngIf="player.isGoalkeeper">Gardien</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Actions de validation -->
                                    <div class="validation-actions" *ngIf="homeTeamSheet && homeTeamSheet.status === 'PENDING'">
                                        <div class="rejection-reason" *ngIf="showRejectionForm === 'home'">
                                            <label>Raison du rejet</label>
                                            <textarea [(ngModel)]="rejectionReasons.home" 
                                                      placeholder="Expliquez pourquoi la feuille de match est rejetée"
                                                      rows="3"></textarea>
                                        </div>
                                        <div class="action-buttons">
                                            <button class="btn-approve" (click)="approveTeamSheet('home')">
                                                <i class="pi pi-check"></i>
                                                Valider
                                            </button>
                                            <button class="btn-reject" (click)="toggleRejectionForm('home')">
                                                <i class="pi pi-times"></i>
                                                Rejeter
                                            </button>
                                            <button class="btn-confirm-reject" 
                                                    *ngIf="showRejectionForm === 'home'"
                                                    (click)="rejectTeamSheet('home')"
                                                    [disabled]="!rejectionReasons.home">
                                                Confirmer le rejet
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Équipe extérieure -->
                        <div class="team-card" [class.selected]="selectedTeam === 'away'">
                            <div class="team-header" (click)="selectTeam('away')">
                                <div class="team-info">
                                    <h4>{{ match.awayTeam.name }}</h4>
                                    <div class="team-status" [ngClass]="getTeamSheetStatusClass('away')">
                                        {{ getTeamSheetStatusLabel('away') }}
                                    </div>
                                </div>
                                <div class="team-actions">
                                    <i class="pi pi-chevron-right" [class.rotated]="selectedTeam === 'away'"></i>
                                </div>
                            </div>
                            
                            <!-- Détails de l'équipe extérieure -->
                            <div class="team-details" *ngIf="selectedTeam === 'away'">
                                <div class="team-sheet-info">
                                    <div class="sheet-header">
                                        <h5>Feuille de Match</h5>
                                        <div class="sheet-status" [ngClass]="getTeamSheetStatusClass('away')">
                                            {{ getTeamSheetStatusLabel('away') }}
                                        </div>
                                    </div>
                                    
                                    <div class="coach-info" *ngIf="awayTeamSheet">
                                        <div class="coach-item">
                                            <label>Entraîneur</label>
                                            <span>{{ awayTeamSheet.coach.name }}</span>
                                        </div>
                                        <div class="coach-item">
                                            <label>N° Licence</label>
                                            <span>{{ awayTeamSheet.coach.license }}</span>
                                        </div>
                                        <div class="coach-item">
                                            <label>Soumis le</label>
                                            <span>{{ awayTeamSheet.submittedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                                        </div>
                                    </div>

                                    <!-- Liste des joueurs -->
                                    <div class="players-section" *ngIf="awayTeamSheet">
                                        <h6>Joueurs ({{ awayTeamSheet.players.length }})</h6>
                                        <div class="players-grid">
                                            <div class="player-card" *ngFor="let player of awayTeamSheet.players">
                                                <div class="player-info">
                                                    <div class="player-number">{{ player.jerseyNumber }}</div>
                                                    <div class="player-details">
                                                        <div class="player-name">{{ player.name }}</div>
                                                        <div class="player-position">{{ player.position }}</div>
                                                    </div>
                                                </div>
                                                <div class="player-badges">
                                                    <span class="badge starter" *ngIf="player.isStarter">Titulaire</span>
                                                    <span class="badge captain" *ngIf="player.isCaptain">Capitaine</span>
                                                    <span class="badge goalkeeper" *ngIf="player.isGoalkeeper">Gardien</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Actions de validation -->
                                    <div class="validation-actions" *ngIf="awayTeamSheet && awayTeamSheet.status === 'PENDING'">
                                        <div class="rejection-reason" *ngIf="showRejectionForm === 'away'">
                                            <label>Raison du rejet</label>
                                            <textarea [(ngModel)]="rejectionReasons.away" 
                                                      placeholder="Expliquez pourquoi la feuille de match est rejetée"
                                                      rows="3"></textarea>
                                        </div>
                                        <div class="action-buttons">
                                            <button class="btn-approve" (click)="approveTeamSheet('away')">
                                                <i class="pi pi-check"></i>
                                                Valider
                                            </button>
                                            <button class="btn-reject" (click)="toggleRejectionForm('away')">
                                                <i class="pi pi-times"></i>
                                                Rejeter
                                            </button>
                                            <button class="btn-confirm-reject" 
                                                    *ngIf="showRejectionForm === 'away'"
                                                    (click)="rejectTeamSheet('away')"
                                                    [disabled]="!rejectionReasons.away">
                                                Confirmer le rejet
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Officiels assignés -->
                <div class="officials-section" *ngIf="matchOfficials.length > 0">
                    <h3>Officiels Assignés ({{ matchOfficials.length }})</h3>
                    <div class="officials-grid">
                        <div class="official-item" *ngFor="let official of matchOfficials">
                            <div class="official-role">{{ getRoleLabel(official.role) }}</div>
                            <div class="official-name">{{ official.name }}</div>
                        </div>
                    </div>
                </div>

                <!-- Événements du match -->
                <div class="events-section" *ngIf="match.events && match.events.length > 0">
                    <h3>Événements du Match</h3>
                    <div class="events-list">
                        <div class="event-item" *ngFor="let event of match.events">
                            <div class="event-time">{{ event.minute }}'</div>
                            <div class="event-type">{{ event.type }}</div>
                            <div class="event-description">{{ event.description }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="dialog-footer">
                    <button pButton type="button" label="Fermer" class="p-button-text" (click)="onClose()"></button>
                    <button pButton type="button" label="Saisir rapport" class="p-button-primary" 
                            *ngIf="match?.canSubmitReport && !match?.reportSubmitted"
                            (click)="onSubmitReport()"></button>
                </div>
            </ng-template>
        </p-dialog>

        <p-toast></p-toast>
    `,
    styles: [`
        .match-details-container {
            max-height: 70vh;
            overflow-y: auto;
            padding: 1rem;
        }

        .match-info-section, .teams-section, .officials-section, .events-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f9fafb;
            border-radius: 12px;
        }

        .match-info-section h3, .teams-section h3, .officials-section h3, .events-section h3 {
            margin: 0 0 1rem 0;
            color: #1a1a1a;
            font-size: 1.25rem;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .info-item label {
            font-weight: 600;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .info-item span {
            color: #1a1a1a;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-upcoming {
            background: #dbeafe;
            color: #1e40af;
        }

        .status-in-progress {
            background: #fed7aa;
            color: #c2410c;
        }

        .status-completed {
            background: #dcfce7;
            color: #166534;
        }

        .status-postponed {
            background: #fef3c7;
            color: #d97706;
        }

        .status-cancelled {
            background: #fecaca;
            color: #dc2626;
        }

        .score-display {
            font-size: 1.5rem;
            font-weight: 800;
            color: #3b82f6;
        }

        .teams-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }

        .team-card {
            background: white;
            border-radius: 12px;
            border: 2px solid #e5e7eb;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .team-card.selected {
            border-color: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .team-header {
            padding: 1.5rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
            transition: background 0.2s;
        }

        .team-header:hover {
            background: #f1f5f9;
        }

        .team-info h4 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
            font-size: 1.25rem;
        }

        .team-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-block;
        }

        .status-pending {
            background: #fef3c7;
            color: #d97706;
        }

        .status-approved {
            background: #dcfce7;
            color: #166534;
        }

        .status-rejected {
            background: #fecaca;
            color: #dc2626;
        }

        .team-actions i {
            font-size: 1.2rem;
            color: #6b7280;
            transition: transform 0.3s ease;
        }

        .team-actions i.rotated {
            transform: rotate(90deg);
        }

        .team-details {
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
        }

        .team-sheet-info {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .sheet-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .sheet-header h5 {
            margin: 0;
            color: #1a1a1a;
        }

        .coach-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .coach-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .coach-item label {
            font-weight: 600;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .coach-item span {
            color: #1a1a1a;
        }

        .players-section h6 {
            margin: 0 0 1rem 0;
            color: #1a1a1a;
            font-size: 1rem;
        }

        .players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
        }

        .player-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }

        .player-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .player-number {
            width: 40px;
            height: 40px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
        }

        .player-details {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .player-name {
            font-weight: 600;
            color: #1a1a1a;
        }

        .player-position {
            font-size: 0.875rem;
            color: #6b7280;
        }

        .player-badges {
            display: flex;
            gap: 0.5rem;
        }

        .badge {
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge.starter {
            background: #dcfce7;
            color: #166534;
        }

        .badge.captain {
            background: #fef3c7;
            color: #d97706;
        }

        .badge.goalkeeper {
            background: #dbeafe;
            color: #1e40af;
        }

        .validation-actions {
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .rejection-reason {
            margin-bottom: 1rem;
        }

        .rejection-reason label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }

        .rejection-reason textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.875rem;
            resize: vertical;
        }

        .action-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .btn-approve, .btn-reject, .btn-confirm-reject {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-approve {
            background: #10b981;
            color: white;
        }

        .btn-approve:hover {
            background: #059669;
        }

        .btn-reject {
            background: #ef4444;
            color: white;
        }

        .btn-reject:hover {
            background: #dc2626;
        }

        .btn-confirm-reject {
            background: #dc2626;
            color: white;
        }

        .btn-confirm-reject:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }

        .officials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .official-item {
            padding: 1rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .official-role {
            font-weight: 600;
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }

        .official-name {
            color: #1a1a1a;
            font-weight: 600;
        }

        .events-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .event-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .event-time {
            font-weight: 700;
            color: #3b82f6;
            min-width: 40px;
        }

        .event-type {
            font-weight: 600;
            color: #1a1a1a;
            min-width: 100px;
        }

        .event-description {
            color: #6b7280;
        }

        .dialog-footer {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .teams-grid {
                grid-template-columns: 1fr;
            }

            .players-grid {
                grid-template-columns: 1fr;
            }

            .action-buttons {
                flex-direction: column;
            }

            .btn-approve, .btn-reject, .btn-confirm-reject {
                width: 100%;
                justify-content: center;
            }
        }
    `]
})
export class MatchDetailsModalComponent implements OnInit {
    @Input() visible = false;
    @Input() match: OfficialMatch | null = null;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() submitReport = new EventEmitter<OfficialMatch>();

    selectedTeam: 'home' | 'away' | null = null;
    showRejectionForm: 'home' | 'away' | null = null;
    rejectionReasons = { home: '', away: '' };

    homeTeamSheet: TeamSheet | null = null;
    awayTeamSheet: TeamSheet | null = null;
    matchOfficials: any[] = [];

    constructor(
        private messageService: MessageService,
        private officialMatchService: OfficialMatchService
    ) {}

    ngOnInit() {
        this.initializeTeamSheets();
        this.loadMatchOfficials();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['match'] && this.match) {
            this.loadMatchOfficials();
        }
    }

    loadMatchOfficials() {
        if (this.match?.id) {
            this.officialMatchService.getMatchOfficials(this.match.id).subscribe({
                next: (officials) => {
                    this.matchOfficials = officials;
                },
                error: (err) => {
                    console.error('Erreur chargement officiels:', err);
                    this.matchOfficials = [];
                }
            });
        }
    }

    initializeTeamSheets() {
        if (this.match) {
            // Simuler des données de feuilles de match (à remplacer par des appels API réels)
            this.homeTeamSheet = {
                teamId: this.match.homeTeam.id,
                teamName: this.match.homeTeam.name,
                coach: {
                    name: 'Jean Dupont',
                    license: 'COACH-001'
                },
                submittedAt: new Date().toISOString(),
                status: 'PENDING',
                players: this.generateMockPlayers()
            };

            this.awayTeamSheet = {
                teamId: this.match.awayTeam.id,
                teamName: this.match.awayTeam.name,
                coach: {
                    name: 'Marie Martin',
                    license: 'COACH-002'
                },
                submittedAt: new Date().toISOString(),
                status: 'PENDING',
                players: this.generateMockPlayers()
            };
        }
    }

    generateMockPlayers(): Player[] {
        const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];
        const players: Player[] = [];
        
        for (let i = 1; i <= 18; i++) {
            players.push({
                id: `player-${i}`,
                name: `Joueur ${i}`,
                position: positions[Math.floor(Math.random() * positions.length)],
                jerseyNumber: i,
                isStarter: i <= 11,
                isCaptain: i === 1,
                isGoalkeeper: i === 1
            });
        }
        
        return players;
    }

    selectTeam(team: 'home' | 'away') {
        this.selectedTeam = this.selectedTeam === team ? null : team;
        this.showRejectionForm = null;
    }

    toggleRejectionForm(team: 'home' | 'away') {
        this.showRejectionForm = this.showRejectionForm === team ? null : team;
        if (this.showRejectionForm !== team) {
            this.rejectionReasons[team] = '';
        }
    }

    approveTeamSheet(team: 'home' | 'away') {
        const teamSheet = team === 'home' ? this.homeTeamSheet : this.awayTeamSheet;
        if (teamSheet) {
            teamSheet.status = 'APPROVED';
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `Feuille de match de ${teamSheet.teamName} approuvée`
            });
        }
    }

    rejectTeamSheet(team: 'home' | 'away') {
        const teamSheet = team === 'home' ? this.homeTeamSheet : this.awayTeamSheet;
        if (teamSheet && this.rejectionReasons[team]) {
            teamSheet.status = 'REJECTED';
            teamSheet.rejectionReason = this.rejectionReasons[team];
            this.messageService.add({
                severity: 'warn',
                summary: 'Rejeté',
                detail: `Feuille de match de ${teamSheet.teamName} rejetée`
            });
            this.showRejectionForm = null;
            this.rejectionReasons[team] = '';
        }
    }

    getTeamSheetStatusClass(team: 'home' | 'away'): string {
        const teamSheet = team === 'home' ? this.homeTeamSheet : this.awayTeamSheet;
        if (!teamSheet) return 'status-pending';
        
        switch (teamSheet.status) {
            case 'PENDING': return 'status-pending';
            case 'APPROVED': return 'status-approved';
            case 'REJECTED': return 'status-rejected';
            default: return 'status-pending';
        }
    }

    getTeamSheetStatusLabel(team: 'home' | 'away'): string {
        const teamSheet = team === 'home' ? this.homeTeamSheet : this.awayTeamSheet;
        if (!teamSheet) return 'En attente';
        
        switch (teamSheet.status) {
            case 'PENDING': return 'En attente';
            case 'APPROVED': return 'Approuvée';
            case 'REJECTED': return 'Rejetée';
            default: return 'En attente';
        }
    }

    getStatusClass(status: string | null | undefined): string {
        if (!status) return 'status-upcoming'; // Par défaut si status est null/undefined
        return `status-${status.toLowerCase()}`;
    }

    getStatusLabel(status: string | null | undefined): string {
        if (!status) return 'À venir'; // Par défaut si status est null/undefined
        switch (status) {
            case 'UPCOMING': return 'À venir';
            case 'IN_PROGRESS': return 'En cours';
            case 'COMPLETED': return 'Terminé';
            case 'POSTPONED': return 'Reporté';
            case 'CANCELLED': return 'Annulé';
            default: return status;
        }
    }

    getRoleLabel(role: string): string {
        switch (role) {
            case 'CENTRAL_REFEREE': return 'Arbitre Central';
            case 'ASSISTANT_REFEREE_1': return 'Assistant 1';
            case 'ASSISTANT_REFEREE_2': return 'Assistant 2';
            case 'FOURTH_OFFICIAL': return '4ème Arbitre';
            case 'COMMISSIONER': return 'Commissaire';
            default: return role;
        }
    }

    onClose() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.selectedTeam = null;
        this.showRejectionForm = null;
    }

    onSubmitReport() {
        if (this.match) {
            this.submitReport.emit(this.match);
            this.onClose();
        }
    }
}