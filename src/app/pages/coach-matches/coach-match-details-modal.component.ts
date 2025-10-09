import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface Player {
    id: string;
    name: string;
    position: string;
    jerseyNumber: number;
    isStarter: boolean;
    isCaptain: boolean;
    isGoalkeeper: boolean;
    licenseNumber: string;
}

interface CoachMatch {
    id: string;
    competition: {
        name: string;
        type: 'LEAGUE' | 'CUP' | 'FRIENDLY';
    };
    homeTeam: {
        id: string;
        name: string;
        logo?: string;
    };
    awayTeam: {
        id: string;
        name: string;
        logo?: string;
    };
    scheduledAt: string;
    stadium: {
        name: string;
        address: string;
    };
    status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
    score?: {
        home: number;
        away: number;
        halfTime?: {
            home: number;
            away: number;
        };
    };
    teamSheetSubmitted: boolean;
    teamSheetStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    teamSheetRejectionReason?: string;
    isHomeTeam: boolean;
    opponent: {
        name: string;
        logo?: string;
    };
    events?: Array<{
        id: string;
        minute: number;
        type: string;
        description: string;
    }>;
}

@Component({
    selector: 'app-coach-match-details-modal',
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
            [style]="{width: '95vw', maxWidth: '1200px'}" 
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
                            <label>Adresse</label>
                            <span>{{ match.stadium.address }}</span>
                        </div>
                        <div class="info-item">
                            <label>Statut</label>
                            <span class="status-badge" [ngClass]="getStatusClass(match.status)">
                                {{ getStatusLabel(match.status) }}
                            </span>
                        </div>
                        <div class="info-item" *ngIf="match.score">
                            <label>Score</label>
                            <span class="score-display">{{ match.score.home }} - {{ match.score.away }}</span>
                        </div>
                    </div>
                </div>

                <!-- Équipes -->
                <div class="teams-section">
                    <h3>Équipes</h3>
                    <div class="teams-display">
                        <div class="team-card" [ngClass]="{ 'home-team': match.isHomeTeam }">
                            <div class="team-logo" *ngIf="match.homeTeam.logo">
                                <img [src]="match.homeTeam.logo" [alt]="match.homeTeam.name">
                            </div>
                            <div class="team-name">{{ match.homeTeam.name }}</div>
                            <div class="team-role" *ngIf="match.isHomeTeam">Votre équipe</div>
                        </div>
                        
                        <div class="vs-section">
                            <div class="vs-text">VS</div>
                            <div class="score" *ngIf="match.score">
                                {{ match.score.home }} - {{ match.score.away }}
                            </div>
                        </div>
                        
                        <div class="team-card" [ngClass]="{ 'away-team': !match.isHomeTeam }">
                            <div class="team-logo" *ngIf="match.awayTeam.logo">
                                <img [src]="match.awayTeam.logo" [alt]="match.awayTeam.name">
                            </div>
                            <div class="team-name">{{ match.awayTeam.name }}</div>
                            <div class="team-role" *ngIf="!match.isHomeTeam">Votre équipe</div>
                        </div>
                    </div>
                </div>

                <!-- Feuille de match -->
                <div class="team-sheet-section" *ngIf="match.status === 'UPCOMING'">
                    <h3>Feuille de Match</h3>
                    
                    <!-- Statut de la feuille -->
                    <div class="sheet-status" *ngIf="match.teamSheetSubmitted">
                        <div class="status-badge" [ngClass]="getTeamSheetStatusClass(match.teamSheetStatus)">
                            <i class="pi" [ngClass]="getTeamSheetIcon(match.teamSheetStatus)"></i>
                            {{ getTeamSheetStatusLabel(match.teamSheetStatus) }}
                        </div>
                        <div class="rejection-reason" *ngIf="match.teamSheetRejectionReason">
                            <strong>Raison du rejet :</strong>
                            <p>{{ match.teamSheetRejectionReason }}</p>
                        </div>
                    </div>

                    <!-- Formulaire de soumission de la feuille -->
                    <div class="team-sheet-form" *ngIf="!match.teamSheetSubmitted || match.teamSheetStatus === 'REJECTED'">
                        <h4>Soumettre la liste des joueurs</h4>
                        
                        <!-- Informations de l'entraîneur -->
                        <div class="coach-info">
                            <h5>Informations de l'entraîneur</h5>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nom complet</label>
                                    <input type="text" [(ngModel)]="coachInfo.name" placeholder="Votre nom complet">
                                </div>
                                <div class="form-group">
                                    <label>Numéro de licence</label>
                                    <input type="text" [(ngModel)]="coachInfo.license" placeholder="N° de licence">
                                </div>
                            </div>
                        </div>

                        <!-- Liste des joueurs -->
                        <div class="players-section">
                            <div class="players-header">
                                <h5>Liste des joueurs ({{ players.length }}/18)</h5>
                                <button type="button" class="add-player-btn" (click)="addPlayer()" [disabled]="players.length >= 18">
                                    <i class="pi pi-plus"></i>
                                    Ajouter un joueur
                                </button>
                            </div>
                            
                            <div class="players-grid">
                                <div class="player-card" *ngFor="let player of players; let i = index">
                                    <div class="player-header">
                                        <div class="player-number">
                                            <input type="number" [(ngModel)]="player.jerseyNumber" 
                                                   placeholder="#" min="1" max="99" 
                                                   (ngModelChange)="validateJerseyNumber(i)">
                                        </div>
                                        <button type="button" class="remove-player-btn" (click)="removePlayer(i)">
                                            <i class="pi pi-times"></i>
                                        </button>
                                    </div>
                                    
                                    <div class="player-details">
                                        <div class="form-group">
                                            <label>Nom du joueur</label>
                                            <input type="text" [(ngModel)]="player.name" placeholder="Nom complet">
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>Position</label>
                                            <select [(ngModel)]="player.position">
                                                <option value="">Sélectionner</option>
                                                <option value="Gardien">Gardien</option>
                                                <option value="Défenseur">Défenseur</option>
                                                <option value="Milieu">Milieu</option>
                                                <option value="Attaquant">Attaquant</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label>N° de licence</label>
                                            <input type="text" [(ngModel)]="player.licenseNumber" placeholder="N° de licence">
                                        </div>
                                        
                                        <div class="player-options">
                                            <label class="checkbox-label">
                                                <input type="checkbox" [(ngModel)]="player.isStarter">
                                                <span>Titulaire</span>
                                            </label>
                                            <label class="checkbox-label">
                                                <input type="checkbox" [(ngModel)]="player.isCaptain">
                                                <span>Capitaine</span>
                                            </label>
                                            <label class="checkbox-label">
                                                <input type="checkbox" [(ngModel)]="player.isGoalkeeper">
                                                <span>Gardien</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="form-actions">
                            <button type="button" class="btn-cancel" (click)="onCancel()">
                                Annuler
                            </button>
                            <button type="button" class="btn-submit" 
                                    (click)="submitTeamSheet()"
                                    [disabled]="!canSubmitTeamSheet()">
                                <i class="pi pi-send"></i>
                                Soumettre la feuille
                            </button>
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

        .match-info-section, .teams-section, .team-sheet-section, .events-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f9fafb;
            border-radius: 12px;
        }

        .match-info-section h3, .teams-section h3, .team-sheet-section h3, .events-section h3 {
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
            display: inline-block;
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

        .teams-display {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2rem;
        }

        .team-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            border-radius: 12px;
            flex: 1;
        }

        .team-card.home-team {
            background: #f0f9ff;
            border: 2px solid #0ea5e9;
        }

        .team-card.away-team {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
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
        }

        .team-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .team-name {
            font-weight: 700;
            color: #1a1a1a;
            text-align: center;
            font-size: 1.1rem;
        }

        .team-role {
            font-size: 0.875rem;
            color: #3b82f6;
            font-weight: 600;
        }

        .vs-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .vs-text {
            font-weight: 700;
            color: #6b7280;
            font-size: 1.1rem;
        }

        .score {
            font-weight: 800;
            color: #3b82f6;
            font-size: 1.5rem;
        }

        .sheet-status {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .status-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }

        .status-pending {
            color: #d97706;
        }

        .status-approved {
            color: #166534;
        }

        .status-rejected {
            color: #dc2626;
        }

        .rejection-reason {
            color: #dc2626;
            font-size: 0.875rem;
        }

        .team-sheet-form {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .team-sheet-form h4 {
            margin: 0 0 1.5rem 0;
            color: #1a1a1a;
        }

        .coach-info {
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .coach-info h5 {
            margin: 0 0 1rem 0;
            color: #1a1a1a;
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
        }

        .form-group label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
        }

        .form-group input, .form-group select {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.875rem;
        }

        .players-section h5 {
            margin: 0 0 1rem 0;
            color: #1a1a1a;
        }

        .players-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .add-player-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .add-player-btn:hover:not(:disabled) {
            background: #2563eb;
        }

        .add-player-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }

        .players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
        }

        .player-card {
            background: #f8f9fa;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
        }

        .player-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .player-number input {
            width: 60px;
            text-align: center;
            font-weight: 700;
        }

        .remove-player-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .remove-player-btn:hover {
            background: #dc2626;
        }

        .player-details {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .player-options {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            cursor: pointer;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
        }

        .btn-cancel, .btn-submit {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-cancel {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
        }

        .btn-cancel:hover {
            background: #e5e7eb;
        }

        .btn-submit {
            background: #10b981;
            color: white;
        }

        .btn-submit:hover:not(:disabled) {
            background: #059669;
        }

        .btn-submit:disabled {
            background: #9ca3af;
            cursor: not-allowed;
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
            .teams-display {
                flex-direction: column;
                gap: 1rem;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .players-grid {
                grid-template-columns: 1fr;
            }

            .form-actions {
                flex-direction: column;
            }

            .btn-cancel, .btn-submit {
                width: 100%;
                justify-content: center;
            }
        }
    `]
})
export class CoachMatchDetailsModalComponent implements OnInit {
    @Input() visible = false;
    @Input() match: CoachMatch | null = null;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() teamSheetSubmitted = new EventEmitter<any>();

    players: Player[] = [];
    coachInfo = {
        name: '',
        license: ''
    };

    constructor(private messageService: MessageService) {}

    ngOnInit() {
        this.initializePlayers();
    }

    initializePlayers() {
        // Initialiser avec 11 joueurs par défaut
        this.players = [];
        for (let i = 0; i < 11; i++) {
            this.addPlayer();
        }
    }

    addPlayer() {
        if (this.players.length < 18) {
            this.players.push({
                id: `player-${Date.now()}-${Math.random()}`,
                name: '',
                position: '',
                jerseyNumber: 0,
                isStarter: this.players.length < 11,
                isCaptain: false,
                isGoalkeeper: false,
                licenseNumber: ''
            });
        }
    }

    removePlayer(index: number) {
        if (this.players.length > 11) {
            this.players.splice(index, 1);
        }
    }

    validateJerseyNumber(index: number) {
        const player = this.players[index];
        const usedNumbers = this.players
            .filter((p, i) => i !== index && p.jerseyNumber > 0)
            .map(p => p.jerseyNumber);
        
        if (usedNumbers.includes(player.jerseyNumber)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Ce numéro de maillot est déjà utilisé'
            });
            player.jerseyNumber = 0;
        }
    }

    canSubmitTeamSheet(): boolean {
        if (!this.coachInfo.name || !this.coachInfo.license) {
            return false;
        }

        const validPlayers = this.players.filter(p => 
            p.name && p.position && p.jerseyNumber > 0 && p.licenseNumber
        );

        return validPlayers.length >= 11 && validPlayers.length <= 18;
    }

    submitTeamSheet() {
        if (this.canSubmitTeamSheet()) {
            const teamSheetData = {
                matchId: this.match?.id,
                coach: this.coachInfo,
                players: this.players.filter(p => p.name && p.position && p.jerseyNumber > 0 && p.licenseNumber),
                submittedAt: new Date().toISOString()
            };

            this.teamSheetSubmitted.emit(teamSheetData);
            this.onClose();
        }
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'UPCOMING': return 'À venir';
            case 'IN_PROGRESS': return 'En cours';
            case 'COMPLETED': return 'Terminé';
            case 'POSTPONED': return 'Reporté';
            case 'CANCELLED': return 'Annulé';
            default: return status;
        }
    }

    getTeamSheetStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getTeamSheetStatusLabel(status: string): string {
        switch (status) {
            case 'PENDING': return 'En attente de validation';
            case 'APPROVED': return 'Approuvée';
            case 'REJECTED': return 'Rejetée';
            default: return status;
        }
    }

    getTeamSheetIcon(status: string): string {
        switch (status) {
            case 'PENDING': return 'pi-clock';
            case 'APPROVED': return 'pi-check-circle';
            case 'REJECTED': return 'pi-times-circle';
            default: return 'pi-clock';
        }
    }

    onClose() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onCancel() {
        this.onClose();
    }
}