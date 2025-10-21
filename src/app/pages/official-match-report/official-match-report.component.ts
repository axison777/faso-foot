import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { OfficialMatchService, OfficialMatch } from '../../service/official-match.service';
import { MatchReport, MatchEvent, CardEvent, RefereeEvaluation } from '../../models/match-report.model';
import { MatchCallupService, CallupPlayer, MatchCallups } from '../../service/match-callup.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-official-match-report',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
    template: `
        <div class="grid" *ngIf="match$ | async as match; else loadingMatch">
            <div class="col-12">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h5>Rapport de match</h5>
                        <div class="flex gap-2">
                            <button class="p-button p-button-outlined" (click)="goBack()">
                                <i class="pi pi-arrow-left mr-2"></i>
                                Retour
                            </button>
                            <button class="p-button p-button-success" 
                                    (click)="saveReport()"
                                    [disabled]="!reportForm.valid">
                                <i class="pi pi-save mr-2"></i>
                                Sauvegarder
                            </button>
                            <button class="p-button" 
                                    (click)="submitReport()"
                                    [disabled]="!reportForm.valid">
                                <i class="pi pi-send mr-2"></i>
                                Soumettre
                            </button>
                        </div>
                    </div>

                    <!-- Informations du match -->
                    <div class="match-summary mb-4">
                        <h6>{{ match.competition.name }}</h6>
                        <div class="match-teams">
                            <span class="team">{{ match.homeTeam.name }}</span>
                            <span class="vs">vs</span>
                            <span class="team">{{ match.awayTeam.name }}</span>
                        </div>
                        <div class="match-details">
                            {{ match.scheduledAt | date:'dd/MM/yyyy à HH:mm' }} - {{ match.stadium.name }}
                        </div>
                    </div>

                    <form [formGroup]="reportForm" class="report-form">
                        <!-- Informations générales -->
                        <div class="form-section" #generalSection>
                            <h6>Informations générales</h6>
                            <div class="grid">
                                <div class="col-12 md:col-6">
                                    <label for="weather">Météo</label>
                                    <input type="text" id="weather" formControlName="weather" 
                                           class="p-inputtext" placeholder="Ex: Ensoleillé, 25°C">
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="fieldCondition">État du terrain</label>
                                    <select id="fieldCondition" formControlName="fieldCondition" class="p-inputtext">
                                        <option value="">Sélectionner</option>
                                        <option value="EXCELLENT">Excellent</option>
                                        <option value="GOOD">Bon</option>
                                        <option value="FAIR">Correct</option>
                                        <option value="POOR">Mauvais</option>
                                    </select>
                                </div>
                                <div class="col-12 md:col-6">
                                    <label for="attendance">Affluence</label>
                                    <input type="number" id="attendance" formControlName="attendance" 
                                           class="p-inputtext" placeholder="Nombre de spectateurs">
                                </div>
                                <div class="col-12">
                                    <label for="incidents">Incidents particuliers</label>
                                    <textarea id="incidents" formControlName="incidents" 
                                              class="p-inputtext" rows="3" 
                                              placeholder="Décrire les incidents survenus pendant le match"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Score et événements (pour arbitres) -->
                        <div class="form-section" #eventsSection *ngIf="match.officialRole !== 'COMMISSIONER'">
                            <h6>Score et événements</h6>
                            <div class="grid">
                                <div class="col-12 md:col-4">
                                    <label for="firstHalfHome">Score 1ère mi-temps (Domicile)</label>
                                    <input type="number" id="firstHalfHome" formControlName="firstHalfHome" 
                                           class="p-inputtext" min="0">
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="firstHalfAway">Score 1ère mi-temps (Extérieur)</label>
                                    <input type="number" id="firstHalfAway" formControlName="firstHalfAway" 
                                           class="p-inputtext" min="0">
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="finalHome">Score final (Domicile)</label>
                                    <input type="number" id="finalHome" formControlName="finalHome" 
                                           class="p-inputtext" min="0">
                                </div>
                                <div class="col-12 md:col-4">
                                    <label for="finalAway">Score final (Extérieur)</label>
                                    <input type="number" id="finalAway" formControlName="finalAway" 
                                           class="p-inputtext" min="0">
                                </div>
                            </div>

                            <!-- Événements -->
                            <div class="events-section">
                                <div class="flex justify-content-between align-items-center mb-3">
                                    <h6>Événements du match</h6>
                                    <button type="button" class="p-button p-button-sm" (click)="addEvent()">
                                        <i class="pi pi-plus mr-1"></i>
                                        Ajouter événement
                                    </button>
                                </div>
                                <div class="events-list" formArrayName="events">
                                    <div class="event-item" *ngFor="let event of eventsArray.controls; let i = index" [formGroupName]="i">
                                        <div class="grid">
                                            <div class="col-12 md:col-2">
                                                <label>Minute</label>
                                                <input type="number" formControlName="minute" class="p-inputtext" min="0" max="120">
                                            </div>
                                            <div class="col-12 md:col-2">
                                                <label>Type</label>
                                                <select formControlName="type" class="p-inputtext">
                                                    <option value="GOAL">But</option>
                                                    <option value="PENALTY">Pénalty</option>
                                                    <option value="INJURY">Blessure</option>
                                                    <option value="SUBSTITUTION">Remplacement</option>
                                                    <option value="OTHER">Autre</option>
                                                </select>
                                            </div>
                                            <div class="col-12 md:col-2">
                                                <label>Équipe</label>
                                                <select formControlName="team" class="p-inputtext">
                                                    <option value="HOME">Domicile</option>
                                                    <option value="AWAY">Extérieur</option>
                                                </select>
                                            </div>
                                            <div class="col-12 md:col-3">
                                                <label>Joueur</label>
                                                <input type="text" formControlName="playerName" class="p-inputtext" placeholder="Nom du joueur" readonly>
                                            </div>
                                            <div class="col-12 md:col-2">
                                                <label>N°</label>
                                                <input type="number" formControlName="playerNumber" 
                                                       class="p-inputtext" min="1" max="99">
                                            </div>
                                            <div class="col-12 md:col-1">
                                                <label>&nbsp;</label>
                                                <button type="button" class="p-button p-button-danger p-button-sm" 
                                                        (click)="removeEvent(i)">
                                                    <i class="pi pi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Cartons -->
                            <div class="cards-section">
                                <div class="flex justify-content-between align-items-center mb-3">
                                    <h6>Cartons</h6>
                                    <button type="button" class="p-button p-button-sm" (click)="addCard()">
                                        <i class="pi pi-plus mr-1"></i>
                                        Ajouter carton
                                    </button>
                                </div>
                                <div class="cards-list" formArrayName="cards">
                                    <div class="card-item" *ngFor="let card of cardsArray.controls; let i = index" [formGroupName]="i">
                                        <div class="grid">
                                            <div class="col-12 md:col-2">
                                                <label>Minute</label>
                                                <input type="number" formControlName="minute" class="p-inputtext" min="0" max="120">
                                            </div>
                                            <div class="col-12 md:col-2">
                                                <label>Type</label>
                                                <select formControlName="type" class="p-inputtext">
                                                    <option value="YELLOW">Jaune</option>
                                                    <option value="RED">Rouge</option>
                                                </select>
                                            </div>
                                            <div class="col-12 md:col-2">
                                                <label>Équipe</label>
                                                <select formControlName="team" class="p-inputtext">
                                                    <option value="HOME">Domicile</option>
                                                    <option value="AWAY">Extérieur</option>
                                                </select>
                                            </div>
                                            <div class="col-12 md:col-3">
                                                <label>Joueur</label>
                                                <input type="text" formControlName="playerName" class="p-inputtext" placeholder="Nom du joueur" readonly>
                                            </div>
                                            <div class="col-12 md:col-2">
                                                <label>N°</label>
                                                <input type="number" formControlName="playerNumber" 
                                                       class="p-inputtext" min="1" max="99">
                                            </div>
                                            <div class="col-12 md:col-1">
                                                <label>&nbsp;</label>
                                                <button type="button" class="p-button p-button-danger p-button-sm" 
                                                        (click)="removeCard(i)">
                                                    <i class="pi pi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Évaluation des arbitres (pour commissaires) -->
                        <div class="form-section" #evaluationSection *ngIf="refereeEvaluationsArray.length > 0">
                            <h6>Évaluation des arbitres</h6>
                            <div class="evaluation-grid" formArrayName="refereeEvaluation">
                                <div class="evaluation-card" *ngFor="let evalGroup of refereeEvaluationsArray.controls; let i = index" [formGroupName]="i">
                                    <h6>{{ evalGroup.get('officialName')?.value }} - {{ getRoleLabel(evalGroup.get('role')?.value) }}</h6>
                                    <div class="evaluation-criteria" formGroupName="criteria">
                                        <!-- Critères spécifiques selon le rôle -->
                                        <ng-container *ngFor="let criterion of getCriteriaListAt(i)">
                                            <div class="criterion">
                                                <label>{{ criterion.label }}</label>
                                                <input type="range" 
                                                       [min]="0" 
                                                       [max]="criterion.max" 
                                                       step="1" 
                                                       [formControlName]="criterion.key"
                                                       class="p-inputtext">
                                                <span>{{ (evalGroup.get('criteria')?.get(criterion.key)?.value || 0) }}/{{ criterion.max }}</span>
                                            </div>
                                        </ng-container>
                                        
                                        <!-- Total calculé -->
                                        <div class="total-score">
                                            <strong>Total : {{ calculateTotalScoreFromForm(i) }}/{{ getMaxScoreForRole(evalGroup.get('role')?.value) }}</strong>
                                        </div>
                                    </div>
                                    <div class="evaluation-comments">
                                        <label>Commentaires</label>
                                        <textarea formControlName="comments"
                                                  class="p-inputtext" rows="3" 
                                                  placeholder="Commentaires sur cet officiel"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Résumé et signature -->
                        <div class="form-section" #summarySection>
                            <h6>Résumé et signature</h6>
                            <div class="grid">
                                <div class="col-12">
                                    <label for="summary">Résumé du match</label>
                                    <textarea id="summary" formControlName="summary" 
                                              class="p-inputtext" rows="4" 
                                              placeholder="Résumé général du match"></textarea>
                                </div>
                                <div class="col-12 md:col-6" *ngIf="match.officialRole === 'COMMISSIONER'">
                                    <label for="commissionerCode">Code commissaire</label>
                                    <input type="text" id="commissionerCode" formControlName="commissionerCode" 
                                           class="p-inputtext" placeholder="Votre code commissaire">
                                </div>
                                <div class="col-12">
                                    <label for="electronicSignature">Signature électronique</label>
                                    <input type="text" id="electronicSignature" formControlName="electronicSignature" 
                                           class="p-inputtext" placeholder="Votre nom complet">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <ng-template #loadingMatch>
            <div class="text-center p-4">
                <i class="pi pi-spin pi-spinner"></i>
                <p class="mt-2">Chargement des détails du match...</p>
            </div>
        </ng-template>
    `,
    styles: [`
        .match-summary {
            background: var(--surface-100);
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
        }

        .match-summary h6 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }

        .match-teams {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .vs {
            margin: 0 1rem;
            color: var(--text-color-secondary);
        }

        .match-details {
            color: var(--text-color-secondary);
            font-size: 0.875rem;
        }

        .form-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-card);
        }

        .form-section h6 {
            color: var(--primary-color);
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--surface-border);
        }

        .events-section, .cards-section {
            margin-top: 1.5rem;
        }

        .events-list, .cards-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .event-item, .card-item {
            padding: 1rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-100);
        }

        .evaluation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .evaluation-card {
            padding: 1.5rem;
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            background: var(--surface-100);
        }

        .evaluation-card h6 {
            color: var(--primary-color);
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: var(--surface-100);
            border-radius: 6px;
            text-align: center;
        }

        .evaluation-criteria {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            margin-bottom: 1rem;
        }

        .criterion {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem;
            background: var(--surface-50);
            border-radius: 6px;
            border-left: 3px solid var(--primary-color);
        }

        .criterion label {
            font-weight: 600;
            font-size: 0.875rem;
            color: #374151;
            line-height: 1.4;
        }

        .criterion input[type="range"] {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: #e5e7eb;
            outline: none;
            -webkit-appearance: none;
        }

        .criterion input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--primary-color);
            cursor: pointer;
        }

        .criterion input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--primary-color);
            cursor: pointer;
            border: none;
        }

        .criterion span {
            font-weight: 700;
            color: var(--primary-color);
            text-align: center;
            font-size: 1.1rem;
        }

        .total-score {
            margin-top: 1rem;
            padding: 1rem;
            background: var(--primary-color);
            color: white;
            border-radius: 6px;
            text-align: center;
            font-size: 1.2rem;
        }

        .total-score strong {
            font-size: 1.4rem;
        }

        .evaluation-comments {
            margin-top: 1rem;
        }

        .evaluation-comments label {
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: block;
        }

        /* Styles pour l'auto-complétion */
        .invalid-jersey {
            border-color: #ef4444 !important;
            background-color: #fef2f2;
        }

        input[readonly] {
            background-color: #f9fafb;
            color: #6b7280;
            cursor: not-allowed;
        }

        /* Indicateur visuel pour les champs auto-complétés */
        input[readonly]:not(:placeholder-shown) {
            background-color: #f0f9ff;
            border-color: #0ea5e9;
        }
        
        /* Scroll container */
        :host ::ng-deep .report-form {
            overflow-y: auto;
            max-height: calc(100vh - 250px);
            padding-right: 10px;
        }
        
        /* Scrollbar styling */
        :host ::ng-deep .report-form::-webkit-scrollbar {
            width: 8px;
        }
        
        :host ::ng-deep .report-form::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        :host ::ng-deep .report-form::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }
        
        :host ::ng-deep .report-form::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }
    `]
})
export class OfficialMatchReportComponent implements OnInit {
    @ViewChild('generalSection') generalSection!: ElementRef;
    @ViewChild('eventsSection') eventsSection!: ElementRef;
    @ViewChild('evaluationSection') evaluationSection!: ElementRef;
    @ViewChild('summarySection') summarySection!: ElementRef;
    
    match$!: Observable<OfficialMatch | null>;
    reportForm: FormGroup;
    matchId: string = '';
    isCommissioner: boolean = false;
    // Ancienne structure d'évaluation supprimée au profit des Reactive Forms
    evaluationCriteriaConfig: Array<Array<{ key: string; label: string; max: number }>> = [];
    
    // Données des joueurs pour l'auto-complétion
    matchCallups: MatchCallups | null = null;
    homeTeamPlayers: CallupPlayer[] = [];
    awayTeamPlayers: CallupPlayer[] = [];

    constructor(
        private officialMatchService: OfficialMatchService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private matchCallupService: MatchCallupService
    ) {
        this.reportForm = this.createForm();
    }

    ngOnInit() {
        this.matchId = this.route.snapshot.paramMap.get('id') || '';
        this.match$ = this.officialMatchService.getMatchDetails(this.matchId);
        // Déterminer si l'utilisateur connecté est un commissaire
        this.officialMatchService.getOfficialInfo().subscribe(info => {
            this.isCommissioner = (info?.official_type === 'COMMISSIONER');
        });
        
        // Initialiser l'évaluation des arbitres quand le match est chargé
        this.match$.subscribe(match => {
            if (match) {
                if (match.otherOfficials && match.otherOfficials.length > 0) {
                    this.initializeEvaluationForm(match.otherOfficials as any);
                }
                // Charger les données des joueurs
                this.loadMatchPlayers(match.id);
            }
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            weather: [''],
            fieldCondition: [''],
            attendance: [null],
            incidents: [''],
            firstHalfHome: [null],
            firstHalfAway: [null],
            finalHome: [null],
            finalAway: [null],
            events: this.fb.array([]),
            cards: this.fb.array([]),
            refereeEvaluation: this.fb.array([]),
            summary: [''],
            commissionerCode: [''],
            electronicSignature: ['', Validators.required]
        });
    }

    /**
     * Initialise le FormArray refereeEvaluation avec un FormGroup par officiel
     */
    initializeEvaluationForm(officials: Array<{ id: string; name: string; role: string }>) {
        const formArray = this.fb.array<FormGroup>([]);
        this.evaluationCriteriaConfig = [];

        officials.forEach((official) => {
            // Ne pas évaluer le commissaire lui-même
            const canonicalRole = this.canonicalizeRole(official?.role);
            if (!canonicalRole || canonicalRole === 'COMMISSIONER') return;

            const criteriaConfig = this.getCriteriaForRole(canonicalRole);
            // Si aucun critère trouvé pour ce rôle, ignorer cet officiel pour éviter une carte vide
            if (!criteriaConfig || criteriaConfig.length === 0) {
                return;
            }
            const criteriaShape: Record<string, FormControl<number>> = {} as Record<string, FormControl<number>>;
            criteriaConfig.forEach((criterion) => {
                criteriaShape[criterion.key] = new FormControl<number>(0, { nonNullable: true });
            });

            const evalGroup = this.fb.group({
                officialId: new FormControl<string>(official.id, { nonNullable: true }),
                officialName: new FormControl<string>(official.name, { nonNullable: true }),
                role: new FormControl<string>(canonicalRole, { nonNullable: true }),
                comments: new FormControl<string>('', { nonNullable: true }),
                criteria: this.fb.group(criteriaShape)
            });

            formArray.push(evalGroup);
            this.evaluationCriteriaConfig.push(criteriaConfig);
        });

        this.reportForm.setControl('refereeEvaluation', formArray);
    }

    /**
     * Retourne les critères d'évaluation spécifiques à chaque rôle
     */
    getCriteriaForRole(role: string): Array<{key: string, label: string, max: number}> {
        role = this.canonicalizeRole(role);
        switch (role) {
            case 'CENTRAL_REFEREE':
                return [
                    { key: 'matchControlAndLaws', label: 'Contrôle du match & Interprétation des lois du jeu', max: 50 },
                    { key: 'physicalCondition', label: 'Condition physique', max: 30 },
                    { key: 'personality', label: 'Personnalité', max: 10 },
                    { key: 'collaboration', label: 'Collaboration', max: 10 }
                ];
            case 'ASSISTANT_REFEREE_1':
            case 'ASSISTANT_REFEREE_2':
                return [
                    { key: 'lawInterpretation', label: 'Interprétation des lois (hors-jeu, sorties, fautes)', max: 50 },
                    { key: 'physicalCondition', label: 'Condition physique', max: 30 },
                    { key: 'collaboration', label: 'Collaboration', max: 20 }
                ];
            case 'FOURTH_OFFICIAL':
                return [
                    { key: 'technicalAreaControl', label: 'Contrôle des surfaces techniques', max: 30 },
                    { key: 'substitutionManagement', label: 'Gestion des remplacements/temps additionnel', max: 20 }
                ];
            case 'COMMISSIONER':
                return [];
            default:
                return [];
        }
    }

    // calculateTotalScore() retiré, remplacé par calculateTotalScoreFromForm()

    /**
     * Retourne le score maximum pour un rôle
     */
    getMaxScoreForRole(role: string): number {
        const criteria = this.getCriteriaForRole(role);
        return criteria.reduce((total, criterion) => total + criterion.max, 0);
    }

    get eventsArray() {
        return this.reportForm.get('events') as FormArray;
    }

    get cardsArray() {
        return this.reportForm.get('cards') as FormArray;
    }

    /**
     * Accès pratique au FormArray refereeEvaluation
     */
    get refereeEvaluationsArray(): FormArray<FormGroup> {
        const arr = this.reportForm.get('refereeEvaluation');
        return (arr instanceof FormArray ? arr : this.fb.array<FormGroup>([])) as FormArray<FormGroup>;
    }

    /**
     * Calcule le total d'une évaluation depuis les valeurs du formulaire
     */
    calculateTotalScoreFromForm(index: number): number {
        const array = this.refereeEvaluationsArray;
        const group = array?.at(index) as FormGroup | null;
        if (!group) return 0;
        const criteria = this.evaluationCriteriaConfig[index] || [];
        const criteriaGroup = group.get('criteria') as FormGroup;
        return criteria.reduce((sum, c) => sum + (criteriaGroup.get(c.key)?.value || 0), 0);
    }

    getMaxScoreFromConfig(index: number): number {
        const criteria = this.evaluationCriteriaConfig[index] || [];
        return criteria.reduce((total, c) => total + c.max, 0);
    }

    /**
     * Sécurise la récupération de la liste de critères pour l'index courant
     */
    getCriteriaListAt(index: number) {
        const group = this.refereeEvaluationsArray?.at(index) as FormGroup | null;
        const role = (group?.get('role')?.value as string) || '';
        const list = this.getCriteriaForRole(role);
        return Array.isArray(list) ? list : [];
    }

    addEvent() {
        const eventGroup = this.fb.group({
            minute: [null, Validators.required],
            type: ['GOAL', Validators.required],
            team: ['HOME', Validators.required],
            playerName: [''],
            playerNumber: [null],
            description: ['']
        });
        
        // Ajouter les listeners pour l'auto-complétion
        this.setupAutoCompleteListeners(eventGroup);
        
        this.eventsArray.push(eventGroup);
    }

    removeEvent(index: number) {
        this.eventsArray.removeAt(index);
    }

    addCard() {
        const cardGroup = this.fb.group({
            minute: [null, Validators.required],
            type: ['YELLOW', Validators.required],
            team: ['HOME', Validators.required],
            playerName: ['', Validators.required],
            playerNumber: [null, Validators.required],
            reason: ['']
        });
        
        // Ajouter les listeners pour l'auto-complétion
        this.setupAutoCompleteListeners(cardGroup);
        
        this.cardsArray.push(cardGroup);
    }

    removeCard(index: number) {
        this.cardsArray.removeAt(index);
    }


    getRoleLabel(role: string): string {
        switch (role) {
            case 'CENTRAL_REFEREE':
                return 'Arbitre central';
            case 'ASSISTANT_REFEREE_1':
                return 'Arbitre assistant 1';
            case 'ASSISTANT_REFEREE_2':
                return 'Arbitre assistant 2';
            case 'FOURTH_OFFICIAL':
                return 'Arbitre 4';
            case 'COMMISSIONER':
                return 'Commissionnaire';
            case 'MAIN_REFEREE':
                return 'Arbitre central';
            case 'ASSISTANT_1':
                return 'Arbitre assistant 1';
            case 'ASSISTANT_2':
                return 'Arbitre assistant 2';
            default:
                return role;
        }
    }

    saveReport() {
        if (this.reportForm.valid) {
            const reportData = this.buildReportDataWithEvaluationTotals();
            console.log('Sauvegarder rapport:', reportData);
            // Implémenter la sauvegarde
        }
    }

    submitReport() {
        if (this.reportForm.valid) {
            const reportData = this.buildReportDataWithEvaluationTotals();
            console.log('Soumettre rapport:', reportData);
            // Implémenter la soumission
        }
    }

    goBack() {
        window.history.back();
    }

    /**
     * Charger les données des joueurs du match pour l'auto-complétion
     */
    loadMatchPlayers(matchId: string) {
        this.matchCallupService.getMatchCallups(matchId).subscribe({
            next: (callups) => {
                this.matchCallups = callups;
                if (callups) {
                    this.homeTeamPlayers = callups.team_one_callup?.players || [];
                    this.awayTeamPlayers = callups.team_two_callup?.players || [];
                    console.log('Joueurs chargés:', {
                        home: this.homeTeamPlayers.length,
                        away: this.awayTeamPlayers.length
                    });
                }
            },
            error: (error) => {
                console.error('Erreur lors du chargement des joueurs:', error);
            }
        });
    }

    /**
     * Configurer les listeners pour l'auto-complétion sur un FormGroup
     */
    setupAutoCompleteListeners(formGroup: FormGroup) {
        // Listener pour le changement de numéro de maillot
        formGroup.get('playerNumber')?.valueChanges.subscribe(() => {
            this.performAutoComplete(formGroup);
        });
        
        // Listener pour le changement d'équipe
        formGroup.get('team')?.valueChanges.subscribe(() => {
            this.performAutoComplete(formGroup);
        });
    }

    /**
     * Effectuer l'auto-complétion des données du joueur
     */
    performAutoComplete(formGroup: FormGroup) {
        const jerseyNumber = formGroup.get('playerNumber')?.value;
        const team = formGroup.get('team')?.value;
        
        if (!jerseyNumber || !team) {
            formGroup.patchValue({
                playerName: ''
            }, { emitEvent: false });
            return;
        }

        // Trouver le joueur correspondant
        const players = team === 'HOME' ? this.homeTeamPlayers : this.awayTeamPlayers;
        const player = players.find(p => 
            p.jersey_number?.toString() === jerseyNumber.toString()
        );

        if (player) {
            // Auto-compléter le nom
            const playerName = `${player.first_name || ''} ${player.last_name || ''}`.trim();
            formGroup.patchValue({
                playerName: playerName
            }, { emitEvent: false });
            
            console.log('Auto-complétion:', {
                jerseyNumber,
                playerName,
                team
            });
        } else {
            // Joueur non trouvé, vider le nom
            formGroup.patchValue({
                playerName: ''
            }, { emitEvent: false });
        }
    }

    /**
     * Vérifier si un numéro de maillot existe dans une équipe
     */
    isValidJerseyNumber(jerseyNumber: number, team: 'HOME' | 'AWAY'): boolean {
        if (!jerseyNumber) return false;
        const players = team === 'HOME' ? this.homeTeamPlayers : this.awayTeamPlayers;
        return players.some(p => p.jersey_number?.toString() === jerseyNumber.toString());
    }
    
    /**
     * Scroll to a specific section of the form
     */
    scrollToSection(section: string) {
        let element: ElementRef | undefined;
        
        switch (section) {
            case 'general':
                element = this.generalSection;
                break;
            case 'events':
                element = this.eventsSection;
                break;
            case 'evaluation':
                element = this.evaluationSection;
                break;
            case 'summary':
                element = this.summarySection;
                break;
        }
        
        if (element && element.nativeElement) {
            element.nativeElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    /**
     * Construit les données du formulaire en y ajoutant les totaux d'évaluation
     */
    private buildReportDataWithEvaluationTotals() {
        const raw = this.reportForm.getRawValue();
        const evaluations = (this.refereeEvaluationsArray?.controls || []).map((ctrl, idx) => {
            const group = ctrl as FormGroup;
            const role = group.get('role')?.value as string;
            const maxScore = this.getMaxScoreForRole(role);
            const totalScore = this.calculateTotalScoreFromForm(idx);
            return {
                ...group.getRawValue(),
                totalScore,
                maxScore
            };
        });
        return {
            ...raw,
            refereeEvaluation: evaluations
        };
    }

    /**
     * Normalise différents formats de retour d'officiels en { id, name, role }
     */
    private normalizeOfficials(officials: any[]): Array<{ id: string; name: string; role: string }> {
        if (!Array.isArray(officials)) return [];
        return officials.map((o) => {
            // Utiliser exclusivement le rôle terrain via pivot.role si disponible
            const pivotRole = o?.pivot?.role;
            const role = this.canonicalizeRole(pivotRole || o?.role || '');
            const id = o?.id || o?.official_id || o?.referee_id || o?.official?.id || o?.user?.id || '';
            const name = o?.name 
                || [o?.first_name, o?.last_name].filter(Boolean).join(' ').trim()
                || [o?.user?.first_name, o?.user?.last_name].filter(Boolean).join(' ').trim()
                || o?.official?.name 
                || o?.referee?.name 
                || 'Officiel';
            return { id, name, role };
        }).filter((o: any) => !!o.id);
    }

    private canonicalizeRole(role: string | null | undefined): string {
        if (!role) return '';
        const map: Record<string, string> = {
            MAIN_REFEREE: 'CENTRAL_REFEREE',
            CENTRAL: 'CENTRAL_REFEREE',
            ASSISTANT_1: 'ASSISTANT_REFEREE_1',
            ASSISTANT_2: 'ASSISTANT_REFEREE_2'
        } as any;
        return map[role as keyof typeof map] || role;
    }
}