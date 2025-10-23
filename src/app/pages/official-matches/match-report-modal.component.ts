import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OfficialMatch } from '../../service/official-match.service';
import { MatchCallupService, CallupPlayer, MatchCallups } from '../../service/match-callup.service';

interface Sanction {
    id: string;
    maillot: string;
    equipe: string;
    licence: string;
    joueur: string;
    minute: number;
    raisons: string;
}

interface EvaluationOfficiel {
    officielId: string;
    officielName: string;
    role: string;
    criteres: {
        [key: string]: {
            note: number;
            commentaires: string;
        };
    };
    total: number;
    totalMax?: number;
}

@Component({
    selector: 'app-match-report-modal',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, DialogModule, ButtonModule,
        InputTextModule, InputNumberModule, TextareaModule, DropdownModule,
        RadioButtonModule, CheckboxModule, ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-dialog
            [(visible)]="visible"
            [modal]="true"
            [style]="{width: '95vw', maxWidth: '1200px', maxHeight: '90vh'}"
            [header]="'Rapport de Match - ' + (match?.competition?.name || '')"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [contentStyle]="{'overflow-y': 'auto', 'max-height': 'calc(90vh - 120px)'}">

            <div class="report-container">
                <!-- Progress Bar -->
                <div class="progress-bar">
                    <div class="progress-step"
                         *ngFor="let step of steps; let i = index"
                         [class.active]="currentStep === i + 1"
                         [class.completed]="currentStep > i + 1"
                         (click)="goToStep(i + 1)"
                         [style.cursor]="'pointer'">
                        <div class="step-number">{{ i + 1 }}</div>
                        <div class="step-label">{{ step }}</div>
                    </div>
                </div>

                <!-- Step 1: Résultat -->
                <div *ngIf="currentStep === 1" class="step-content" #step1>
                    <h3>Résultat du Match</h3>
                    <div class="form-section">
                        <div class="result-grid">
                            <div class="result-item">
                                <label>Résultat final</label>
                                <div class="score-input">
                                    <input type="number" [(ngModel)]="reportData.resultatFinal.home"
                                           class="score-field" placeholder="0" min="0">
                                    <span class="vs">-</span>
                                    <input type="number" [(ngModel)]="reportData.resultatFinal.away"
                                           class="score-field" placeholder="0" min="0">
                                </div>
                            </div>
                            <div class="result-item">
                                <label>Résultat à la mi-temps</label>
                                <div class="score-input">
                                    <input type="number" [(ngModel)]="reportData.resultatMiTemps.home"
                                           class="score-field" placeholder="0" min="0">
                                    <span class="vs">-</span>
                                    <input type="number" [(ngModel)]="reportData.resultatMiTemps.away"
                                           class="score-field" placeholder="0" min="0">
                                </div>
                            </div>
                            <div class="result-item" *ngIf="reportData.prolongations">
                                <label>Résultat après prolongations</label>
                                <div class="score-input">
                                    <input type="number" [(ngModel)]="reportData.resultatProlongations.home"
                                           class="score-field" placeholder="0" min="0">
                                    <span class="vs">-</span>
                                    <input type="number" [(ngModel)]="reportData.resultatProlongations.away"
                                           class="score-field" placeholder="0" min="0">
                                </div>
                            </div>
                            <div class="result-item" *ngIf="reportData.tirsAuxButsEnabled">
                                <label>Tirs aux buts</label>
                                <div class="score-input">
                                    <input type="number" [(ngModel)]="reportData.tirsAuxButs.home"
                                           class="score-field" placeholder="0" min="0">
                                    <span class="vs">-</span>
                                    <input type="number" [(ngModel)]="reportData.tirsAuxButs.away"
                                           class="score-field" placeholder="0" min="0">
                                </div>
                            </div>
                        </div>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" [(ngModel)]="reportData.prolongations">
                                <span>Prolongations jouées</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" [(ngModel)]="reportData.tirsAuxButsEnabled">
                                <span>Tirs aux buts</span>
                            </label>
                        </div>
                    </div>

                    <!-- Section Buteurs et Passeurs -->
                    <div class="goals-section" *ngIf="reportData.resultatFinal.home > 0 || reportData.resultatFinal.away > 0">
                        <h4>Buteurs et Passeurs Décisifs</h4>
                        <div class="goals-validation" *ngIf="getGoalsValidationMessage()">
                            <i class="pi pi-exclamation-triangle"></i>
                            <span>{{ getGoalsValidationMessage() }}</span>
                        </div>
                        <div class="goals-list">
                            <div class="goal-item" *ngFor="let buteur of reportData.buteurs; let i = index">
                                <div class="goal-header">
                                    <div class="goal-info">
                                        <span class="goal-number">{{ i + 1 }}</span>
                                        <span class="goal-team" [ngClass]="buteur.equipe">
                                            {{ buteur.equipe === 'home' ? match?.homeTeam?.name : match?.awayTeam?.name }}
                                        </span>
                                    </div>
                                    <button type="button" class="remove-goal-btn" (click)="removeGoal(i)">
                                        <i class="pi pi-trash"></i>
                                    </button>
                                </div>

                                <div class="goal-details">
                                    <div class="goal-scorer">
                                        <h5>Buteur</h5>
                                        <div class="player-fields">
                                            <input type="text" [(ngModel)]="buteur.maillot"
                                                   (ngModelChange)="onJerseyNumberChange('buteur', i)"
                                                   placeholder="Maillot" class="field-small"
                                                   [class.invalid-jersey]="buteur.maillot && !isValidJerseyNumber(buteur.maillot, buteur.equipe)">
                                            <input type="text" [(ngModel)]="buteur.licence" placeholder="N° Licence" class="field-medium" readonly>
                                            <input type="text" [(ngModel)]="buteur.joueur" placeholder="Nom du joueur" class="field-large" readonly>
                                            <input type="number" [(ngModel)]="buteur.minute" placeholder="Min" min="0" max="120" class="field-small">
                                        </div>
                                    </div>

                                    <div class="goal-assist">
                                        <h5>Passeur Décisif (optionnel)</h5>
                                        <div class="player-fields">
                                            <input type="text" [(ngModel)]="buteur.passeur.maillot"
                                                   (ngModelChange)="onJerseyNumberChange('passeur', i)"
                                                   placeholder="Maillot" class="field-small"
                                                   [class.invalid-jersey]="buteur.passeur.maillot && !isValidJerseyNumber(buteur.passeur.maillot, buteur.equipe)">
                                            <input type="text" [(ngModel)]="buteur.passeur.licence" placeholder="N° Licence" class="field-medium" readonly>
                                            <input type="text" [(ngModel)]="buteur.passeur.joueur" placeholder="Nom du joueur" class="field-large" readonly>
                                            <button type="button" class="clear-assist-btn" (click)="clearAssist(i)" *ngIf="buteur.passeur.joueur">
                                                <i class="pi pi-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="button" class="add-goal-btn" (click)="addGoal()">
                            <i class="pi pi-plus"></i> Ajouter un but
                        </button>
                    </div>
                </div>

                <!-- Step 2: Sanctions -->
                <div *ngIf="currentStep === 2" class="step-content" #step2>
                    <h3>Sanctions Disciplinaires</h3>

                    <!-- Avertissements -->
                    <div class="sanctions-section">
                        <h4>Avertissements</h4>
                        <div class="sanctions-table">
                            <div class="table-header">
                                <div>Maillot</div>
                                <div>Équipe</div>
                                <div>N° Licence</div>
                                <div>Joueur</div>
                                <div>Min.</div>
                                <div>Raisons</div>
                                <div>Actions</div>
                            </div>
                            <div class="table-row" *ngFor="let sanction of reportData.avertissements; let i = index">
                                <input type="text" [(ngModel)]="sanction.maillot"
                                       (ngModelChange)="onJerseyNumberChange('avertissement', i)"
                                       placeholder="N°"
                                       [class.invalid-jersey]="sanction.maillot && !isValidJerseyNumber(sanction.maillot, sanction.equipe)">
                                <select [(ngModel)]="sanction.equipe" (ngModelChange)="onTeamChange('avertissement', i)">
                                    <option value="home">{{ match?.homeTeam?.name }}</option>
                                    <option value="away">{{ match?.awayTeam?.name }}</option>
                                </select>
                                <input type="text" [(ngModel)]="sanction.licence" placeholder="Licence" readonly>
                                <input type="text" [(ngModel)]="sanction.joueur" placeholder="Nom" readonly>
                                <input type="number" [(ngModel)]="sanction.minute" placeholder="Min" min="0" max="120">
                                <input type="text" [(ngModel)]="sanction.raisons" placeholder="Raisons">
                                <button type="button" class="remove-btn" (click)="removeAvertissement(i)">
                                    <i class="pi pi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <button type="button" class="add-btn" (click)="addAvertissement()">
                            <i class="pi pi-plus"></i> Ajouter un avertissement
                        </button>
                    </div>

                    <!-- Expulsions -->
                    <div class="sanctions-section">
                        <h4>Expulsions</h4>
                        <div class="sanctions-table">
                            <div class="table-header">
                                <div>Maillot</div>
                                <div>Équipe</div>
                                <div>N° Licence</div>
                                <div>Joueur</div>
                                <div>Min.</div>
                                <div>Raisons</div>
                                <div>Actions</div>
                            </div>
                            <div class="table-row" *ngFor="let sanction of reportData.expulsions; let i = index">
                                <input type="text" [(ngModel)]="sanction.maillot"
                                       (ngModelChange)="onJerseyNumberChange('expulsion', i)"
                                       placeholder="N°"
                                       [class.invalid-jersey]="sanction.maillot && !isValidJerseyNumber(sanction.maillot, sanction.equipe)">
                                <select [(ngModel)]="sanction.equipe" (ngModelChange)="onTeamChange('expulsion', i)">
                                    <option value="home">{{ match?.homeTeam?.name }}</option>
                                    <option value="away">{{ match?.awayTeam?.name }}</option>
                                </select>
                                <input type="text" [(ngModel)]="sanction.licence" placeholder="Licence" readonly>
                                <input type="text" [(ngModel)]="sanction.joueur" placeholder="Nom" readonly>
                                <input type="number" [(ngModel)]="sanction.minute" placeholder="Min" min="0" max="120">
                                <input type="text" [(ngModel)]="sanction.raisons" placeholder="Raisons">
                                <button type="button" class="remove-btn" (click)="removeExpulsion(i)">
                                    <i class="pi pi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <button type="button" class="add-btn" (click)="addExpulsion()">
                            <i class="pi pi-plus"></i> Ajouter une expulsion
                        </button>
                    </div>
                </div>

                <!-- Step 3: Évaluation du Match -->
                <div *ngIf="currentStep === 3" class="step-content" #step3>
                    <h3>Évaluation du Match</h3>
                    <div class="form-section">
                        <div class="evaluation-group">
                            <label>Degré de difficulté du match</label>
                            <div class="radio-group">
                                <label class="radio-label">
                                    <input type="radio" name="difficulte" value="normal" [(ngModel)]="reportData.degreDifficulte">
                                    <span>Normal</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="difficulte" value="eleve" [(ngModel)]="reportData.degreDifficulte">
                                    <span>Élevé</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="difficulte" value="tres_eleve" [(ngModel)]="reportData.degreDifficulte">
                                    <span>Très élevé</span>
                                </label>
                            </div>
                        </div>

                        <div class="observations-grid">
                            <div class="observation-item">
                                <label>Attitude des joueurs de l'équipe A</label>
                                <textarea [(ngModel)]="reportData.attitudeJoueursA" rows="3"
                                          placeholder="Décrire l'attitude des joueurs"></textarea>
                            </div>
                            <div class="observation-item">
                                <label>Attitude des joueurs de l'équipe B</label>
                                <textarea [(ngModel)]="reportData.attitudeJoueursB" rows="3"
                                          placeholder="Décrire l'attitude des joueurs"></textarea>
                            </div>
                            <div class="observation-item">
                                <label>Attitude du public</label>
                                <textarea [(ngModel)]="reportData.attitudePublic" rows="3"
                                          placeholder="Décrire l'attitude du public"></textarea>
                            </div>
                            <div class="observation-item">
                                <label>État du terrain et des installations</label>
                                <textarea [(ngModel)]="reportData.etatTerrain" rows="3"
                                          placeholder="Décrire l'état du terrain"></textarea>
                            </div>
                            <div class="observation-item">
                                <label>Observation sur l'organisation</label>
                                <textarea [(ngModel)]="reportData.observationOrganisation" rows="3"
                                          placeholder="Observations sur l'organisation"></textarea>
                            </div>
                            <div class="observation-item">
                                <label>Organisation générale</label>
                                <select [(ngModel)]="reportData.organisationGenerale">
                                    <option value="excellente">Excellente</option>
                                    <option value="bonne">Bonne</option>
                                    <option value="moyenne">Moyenne</option>
                                    <option value="mauvaise">Mauvaise</option>
                                </select>
                            </div>
                            <div class="observation-item">
                                <label>Service de contrôle</label>
                                <select [(ngModel)]="reportData.serviceControle">
                                    <option value="excellent">Excellent</option>
                                    <option value="bon">Bon</option>
                                    <option value="moyen">Moyen</option>
                                    <option value="mauvais">Mauvais</option>
                                </select>
                            </div>
                            <div class="observation-item">
                                <label>Service de police</label>
                                <select [(ngModel)]="reportData.servicePolice">
                                    <option value="excellent">Excellent</option>
                                    <option value="bon">Bon</option>
                                    <option value="moyen">Moyen</option>
                                    <option value="mauvais">Mauvais</option>
                                </select>
                            </div>
                            <div class="observation-item">
                                <label>Service sanitaire</label>
                                <select [(ngModel)]="reportData.serviceSanitaire">
                                    <option value="excellent">Excellent</option>
                                    <option value="bon">Bon</option>
                                    <option value="moyen">Moyen</option>
                                    <option value="mauvais">Mauvais</option>
                                </select>
                            </div>
                            <div class="observation-item">
                                <label>Service presse</label>
                                <select [(ngModel)]="reportData.servicePresse">
                                    <option value="excellent">Excellent</option>
                                    <option value="bon">Bon</option>
                                    <option value="moyen">Moyen</option>
                                    <option value="mauvais">Mauvais</option>
                                </select>
                            </div>
                            <div class="observation-item">
                                <label>Nombre de spectateurs</label>
                                <input type="number" [(ngModel)]="reportData.nombreSpectateurs"
                                       placeholder="Nombre de spectateurs" min="0">
                            </div>
                            <div class="observation-item full-width">
                                <label>Incidents ou Autres Remarques</label>
                                <textarea [(ngModel)]="reportData.incidentsRemarques" rows="4"
                                          placeholder="Décrire les incidents ou autres remarques"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 4: Évaluation des Officiels (Commissaire seulement) -->
                <div *ngIf="shouldShowEvaluationStep" class="step-content" #step4>
                    <h3>Évaluation des Officiels</h3>
                    <div class="officials-evaluation">
                        <div class="evaluation-accordion" *ngFor="let evaluation of reportData.evaluationsOfficiels; let i = index; trackBy: trackByEvaluation">
                            <div class="evaluation-header" (click)="toggleEvaluation(i)">
                                <div class="header-left">
                                    <i class="pi" [ngClass]="evaluation.expanded ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
                                    <div class="official-info">
                                        <h4>{{ evaluation.officielName }} - {{ getRoleLabel(evaluation.role) }}</h4>
                                        <span class="total-score">Note globale: {{ evaluation.total || 0 }}/{{ evaluation.totalMax || getTotalMaxForRole(evaluation.role) }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="evaluation-content" *ngIf="evaluation.expanded">
                                <table class="criteria-table">
                                    <thead>
                                        <tr>
                                            <th class="col-criteria">Critère</th>
                                            <th class="col-note">Note</th>
                                            <th class="col-comments">Commentaires</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let critere of getCriteresForRole(evaluation.role); let j = index; trackBy: trackByCriteres">
                                            <td class="criteria-cell">
                                                <div class="criteria-name">{{ critere.label }}</div>
                                                <div class="criteria-desc" *ngIf="critere.description">{{ critere.description }}</div>
                                            </td>
                                            <td class="note-cell">
                                                <input type="number"
                                                       [(ngModel)]="evaluation.criteres[critere.key].note"
                                                       min="0" [max]="critere.max" step="1"
                                                       (ngModelChange)="onNoteChange(i)"
                                                       class="note-input"
                                                       placeholder="0">
                                                <span class="note-max">/ {{ critere.max }}</span>
                                            </td>
                                            <td class="comment-cell">
                                                <textarea [(ngModel)]="evaluation.criteres[critere.key].commentaires"
                                                          rows="2"
                                                          placeholder="Ajoutez vos commentaires..."
                                                          class="comment-input"></textarea>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="dialog-footer">
                    <button pButton type="button" label="Annuler" class="p-button-text" (click)="onCancel()"></button>
                    <button pButton type="button" label="Précédent" class="p-button-secondary"
                            *ngIf="currentStep > 1" (click)="previousStep()"></button>
                    <button pButton type="button" [label]="isLastStep ? 'Soumettre' : 'Suivant'"
                            class="p-button-primary" (click)="nextStep()"></button>
                </div>
            </ng-template>
        </p-dialog>

        <p-toast></p-toast>
    `,
    styles: [`
        .report-container {
            padding: 1rem;
            max-height: calc(90vh - 120px);
            overflow-y: auto;
        }

        .progress-bar {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            position: relative;
        }

        .progress-step:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 20px;
            left: 60%;
            right: -40%;
            height: 2px;
            background: #e5e7eb;
            z-index: 1;
        }

        .progress-step.completed:not(:last-child)::after {
            background: #3b82f6;
        }

        .step-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e5e7eb;
            color: #6b7280;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 2;
        }

        .progress-step.active .step-number {
            background: #3b82f6;
            color: white;
        }

        .progress-step.completed .step-number {
            background: #10b981;
            color: white;
        }

        .step-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
            text-align: center;
        }

        .progress-step.active .step-label {
            color: #3b82f6;
            font-weight: 600;
        }

        .step-content {
            min-height: 400px;
        }

        .step-content h3 {
            margin: 0 0 1.5rem 0;
            color: #1a1a1a;
            font-size: 1.5rem;
        }

        .form-section {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }

        .result-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .result-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .result-item label {
            font-weight: 600;
            color: #374151;
        }

        .score-input {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .score-field {
            width: 80px;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            text-align: center;
            font-size: 1.25rem;
            font-weight: 600;
        }

        .vs {
            font-weight: 700;
            color: #6b7280;
            font-size: 1.25rem;
        }

        .checkbox-group {
            display: flex;
            gap: 2rem;
            margin-top: 1rem;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }

        /* Section Buteurs */
        .goals-section {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }

        .goals-section h4 {
            margin: 0 0 1.5rem 0;
            color: #1a1a1a;
            font-size: 1.1rem;
        }

        .goals-validation {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            margin-bottom: 1rem;
            color: #92400e;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .goals-validation i {
            color: #f59e0b;
        }

        .goals-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .goal-item {
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
        }

        .goal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f3f4f6;
            border-bottom: 1px solid #e5e7eb;
        }

        .goal-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .goal-number {
            width: 30px;
            height: 30px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.875rem;
        }

        .goal-team {
            font-weight: 600;
            color: #1a1a1a;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.875rem;
        }

        .goal-team.home {
            background: #dbeafe;
            color: #1e40af;
        }

        .goal-team.away {
            background: #fef3c7;
            color: #d97706;
        }

        .remove-goal-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .remove-goal-btn:hover {
            background: #dc2626;
        }

        .goal-details {
            padding: 1.5rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        .goal-scorer, .goal-assist {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .goal-scorer h5, .goal-assist h5 {
            margin: 0;
            color: #374151;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .player-fields {
            display: grid;
            grid-template-columns: 60px 120px 1fr 60px auto;
            gap: 0.75rem;
            align-items: center;
        }

        .field-small {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.875rem;
            text-align: center;
        }

        .field-medium {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.875rem;
        }

        .field-large {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.875rem;
        }

        .clear-assist-btn {
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 6px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .clear-assist-btn:hover {
            background: #4b5563;
        }

        .add-goal-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .add-goal-btn:hover {
            background: #059669;
        }

        /* Responsive pour les buteurs */
        @media (max-width: 768px) {
            .goal-details {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .player-fields {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }

            .field-small, .field-medium, .field-large {
                width: 100%;
            }
        }

        .sanctions-section {
            margin-bottom: 2rem;
        }

        .sanctions-section h4 {
            margin: 0 0 1rem 0;
            color: #1a1a1a;
            font-size: 1.25rem;
        }

        .sanctions-table {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 1rem;
        }

        .table-header {
            display: grid;
            grid-template-columns: 80px 1fr 120px 1fr 80px 1fr 60px;
            background: #f8f9fa;
            font-weight: 600;
            color: #374151;
            padding: 0.75rem;
            gap: 0.5rem;
        }

        .table-row {
            display: grid;
            grid-template-columns: 80px 1fr 120px 1fr 80px 1fr 60px;
            padding: 0.75rem;
            gap: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
            align-items: center;
        }

        .table-row:last-child {
            border-bottom: none;
        }

        .table-row input, .table-row select {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .remove-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .add-btn {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .evaluation-group {
            margin-bottom: 2rem;
        }

        .evaluation-group label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1rem;
        }

        .radio-group {
            display: flex;
            gap: 2rem;
        }

        .radio-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }

        .observations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .observation-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .observation-item.full-width {
            grid-column: 1 / -1;
        }

        .observation-item label {
            font-weight: 600;
            color: #374151;
        }

        .observation-item input, .observation-item select, .observation-item textarea {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.875rem;
        }

        .officials-evaluation {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .evaluation-accordion {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }

        .evaluation-header {
            padding: 1rem 1.5rem;
            background: #f8f9fa;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background 0.2s;
            border-bottom: 1px solid #e5e7eb;
        }

        .evaluation-header:hover {
            background: #e9ecef;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
        }

        .header-left i {
            font-size: 1rem;
            color: #6b7280;
            transition: transform 0.2s;
        }

        .official-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .official-info h4 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: #1a1a1a;
        }

        .total-score {
            font-size: 0.875rem;
            color: #059669;
            font-weight: 600;
            background: #d1fae5;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            display: inline-block;
        }

        .evaluation-content {
            padding: 1.5rem;
            animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .criteria-table {
            width: 100%;
            border-collapse: collapse;
        }

        .criteria-table thead {
            background: #f8f9fa;
        }

        .criteria-table th {
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
            border-bottom: 2px solid #e5e7eb;
        }

        .col-criteria {
            width: 40%;
        }

        .col-note {
            width: 20%;
            text-align: center;
        }

        .col-comments {
            width: 40%;
        }

        .criteria-table tbody tr {
            border-bottom: 1px solid #e5e7eb;
            transition: background 0.2s;
        }

        .criteria-table tbody tr:hover {
            background: #f9fafb;
        }

        .criteria-table td {
            padding: 1rem 0.75rem;
            vertical-align: top;
        }

        .criteria-cell {
            padding-right: 1rem;
        }

        .criteria-name {
            font-weight: 600;
            color: #1f2937;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }

        .criteria-desc {
            font-size: 0.8rem;
            color: #6b7280;
            font-style: italic;
            line-height: 1.4;
        }

        .note-cell {
            text-align: center;
            white-space: nowrap;
        }

        .note-cell .note-input {
            width: 70px;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            text-align: center;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.2s;
        }

        .note-cell .note-input:focus {
            border-color: #3b82f6;
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .note-max {
            margin-left: 0.5rem;
            color: #6b7280;
            font-weight: 600;
        }

        .comment-cell {
            padding-left: 1rem;
        }

        .comment-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 0.875rem;
            resize: vertical;
            min-height: 50px;
            font-family: inherit;
            transition: all 0.2s;
        }

        .comment-input:focus {
            border-color: #3b82f6;
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .note-level {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .note-excellent { background: #dcfce7; color: #166534; }
        .note-very-good { background: #dbeafe; color: #1e40af; }
        .note-good { background: #e0e7ff; color: #7c3aed; }
        .note-medium { background: #fef3c7; color: #d97706; }
        .note-insufficient { background: #fed7aa; color: #c2410c; }
        .note-bad { background: #fecaca; color: #dc2626; }

        /* Styles pour l'auto-complétion */
        .invalid-jersey {
            border-color: #ef4444 !important;
            background-color: #fef2f2;
        }

        .field-small[readonly], .field-medium[readonly], .field-large[readonly] {
            background-color: #f9fafb;
            color: #6b7280;
            cursor: not-allowed;
        }

        .table-row input[readonly], .table-row select[readonly] {
            background-color: #f9fafb;
            color: #6b7280;
            cursor: not-allowed;
        }

        /* Indicateur visuel pour les champs auto-complétés */
        .field-small[readonly]:not(:placeholder-shown),
        .field-medium[readonly]:not(:placeholder-shown),
        .field-large[readonly]:not(:placeholder-shown),
        .table-row input[readonly]:not(:placeholder-shown) {
            background-color: #f0f9ff;
            border-color: #0ea5e9;
        }

        .dialog-footer {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }

        @media (max-width: 768px) {
            .progress-bar {
                flex-direction: column;
                gap: 1rem;
            }

            .progress-step:not(:last-child)::after {
                display: none;
            }

            .table-header, .table-row {
                grid-template-columns: 1fr;
                gap: 0.25rem;
            }

            .observations-grid {
                grid-template-columns: 1fr;
            }

            .evaluation-criteria {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class MatchReportModalComponent implements OnInit, OnChanges {
    @Input() visible = false;
    @Input() match: OfficialMatch | null = null;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() reportSubmitted = new EventEmitter<any>();

    @ViewChild('step1') step1!: ElementRef;
    @ViewChild('step2') step2!: ElementRef;
    @ViewChild('step3') step3!: ElementRef;
    @ViewChild('step4') step4!: ElementRef;

    currentStep = 1;
    steps: string[] = [];
    isCommissioner = false;

    reportData: any = {
        resultatFinal: { home: 0, away: 0 },
        resultatMiTemps: { home: 0, away: 0 },
        resultatProlongations: { home: 0, away: 0 },
        tirsAuxButs: { home: 0, away: 0 },
        prolongations: false,
        tirsAuxButsEnabled: false,
        buteurs: [],
        avertissements: [],
        expulsions: [],
        degreDifficulte: 'normal',
        attitudeJoueursA: '',
        attitudeJoueursB: '',
        attitudePublic: '',
        etatTerrain: '',
        observationOrganisation: '',
        organisationGenerale: 'bonne',
        serviceControle: 'bon',
        servicePolice: 'bon',
        serviceSanitaire: 'bon',
        servicePresse: 'bon',
        nombreSpectateurs: 0,
        incidentsRemarques: '',
        evaluationsOfficiels: []
    };

    // Données des joueurs pour l'auto-complétion
    matchCallups: MatchCallups | null = null;
    homeTeamPlayers: CallupPlayer[] = [];
    awayTeamPlayers: CallupPlayer[] = [];

    constructor(
        private messageService: MessageService,
        private matchCallupService: MatchCallupService
    ) {}

    ngOnInit() {
        this.initializeSteps();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['match'] && this.match) {
            this.initializeReportData();
        }
        if (changes['visible'] && this.visible && this.match) {
            this.initializeReportData();
            this.currentStep = 1;
        }
    }

    initializeSteps() {
        this.steps = ['Résultat', 'Sanctions', 'Évaluation du Match'];
        if (this.isCommissioner) {
            this.steps.push('Évaluation des Officiels');
        }
    }

    initializeReportData() {
        if (this.match) {
            this.isCommissioner = this.match.officialRole === 'COMMISSIONER';
            this.initializeSteps();

            // Charger les données des joueurs pour l'auto-complétion
            this.loadMatchPlayers();

            if (this.isCommissioner && this.match.otherOfficials) {
                console.log('=== INITIALISATION DES EVALUATIONS ===');
                console.log('Nombre d\'officiels:', this.match.otherOfficials.length);
                console.log('Officiels:', this.match.otherOfficials);

                this.reportData.evaluationsOfficiels = this.match.otherOfficials.map((official, index) => {
                    console.log(`\nInitialisation pour ${official.name} (${official.role})`);
                    const criteres = this.getInitialCriteres(official.role);
                    console.log('Critères initialisés:', criteres);

                    return {
                        officielId: official.id,
                        officielName: official.name,
                        role: official.role,
                        criteres: criteres,
                        total: 0,
                        expanded: index === 0  // Premier élément ouvert par défaut
                    };
                });

                console.log('\nÉvaluations finales:', this.reportData.evaluationsOfficiels);
                console.log('=== FIN INITIALISATION ===');
            }
        }
    }

    /**
     * Charger les données des joueurs du match pour l'auto-complétion
     */
    loadMatchPlayers() {
        if (this.match?.id) {
            this.matchCallupService.getMatchCallups(this.match.id).subscribe({
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
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Attention',
                        detail: 'Impossible de charger les données des joueurs pour l\'auto-complétion'
                    });
                }
            });
        }
    }

    getInitialCriteres(role: string): any {
        console.log(`  -> getInitialCriteres pour role: ${role}`);
        const criteresDefinition = this.getCriteresForRole(role);
        console.log(`  -> Définitions trouvées:`, criteresDefinition);
        const criteres: any = {};

        criteresDefinition.forEach(critere => {
            criteres[critere.key] = { note: 0, commentaires: '' };
        });

        console.log(`  -> Critères initiaux créés:`, criteres);
        return criteres;
    }

    getCriteresForRole(role: string): any[] {
        console.log(`    -> getCriteresForRole appelé pour: ${role}`);

        // Vérifier le cache d'abord
        if (this.criteresCache.has(role)) {
            console.log(`    -> Critères trouvés dans le cache`);
            return this.criteresCache.get(role)!;
        }

        console.log(`    -> Création des critères pour ${role}`);
        let criteres: any[] = [];

        if (role === 'CENTRAL_REFEREE' || role === 'CENTRAL') {
            criteres = [
                {
                    key: 'controleMatch',
                    label: 'Contrôle du match & Interprétation des lois du jeu (Sanctions disciplinaire et les lois du jeux)',
                    max: 50,
                    description: 'Évaluation du contrôle du match et de l\'interprétation des lois du jeu'
                },
                {
                    key: 'conditionPhysique',
                    label: 'Condition physique (Endurance, Placement & déplacement, vitesse de réaction)',
                    max: 30,
                    description: 'Évaluation de la condition physique de l\'arbitre'
                },
                {
                    key: 'personnalite',
                    label: 'Personnalité (Décidé ou indécis, anxieux, Influençable par le public ou les joueurs, Partial ou impartial, Personnalité forte ou faible)',
                    max: 10,
                    description: 'Évaluation de la personnalité de l\'arbitre'
                },
                {
                    key: 'collaboration',
                    label: 'Collaboration (Coopération avec les autres arbitres, décisions claires, utilisation des sifflets, signaux claires, chronométrage)',
                    max: 10,
                    description: 'Évaluation de la collaboration avec les autres arbitres'
                }
            ];
        } else if (role === 'ASSISTANT_REFEREE_1' || role === 'ASSISTANT_REFEREE_2' || role === 'ASSISTANT_1' || role === 'ASSISTANT_2') {
            criteres = [
                {
                    key: 'interpretationLois',
                    label: 'Interprétations et application des lois du jeu (Décisions sur le hors jeu, Sorties de balles et fautes)',
                    max: 50,
                    description: 'Évaluation des décisions sur le hors jeu et les fautes'
                },
                {
                    key: 'conditionPhysique',
                    label: 'Condition Physique (vitesse, endurance, alignement sur le hors jeu)',
                    max: 30,
                    description: 'Évaluation de la condition physique de l\'assistant'
                },
                {
                    key: 'collaboration',
                    label: 'Collaboration (Coopération avec les autres arbitres)',
                    max: 20,
                    description: 'Évaluation de la collaboration avec les autres arbitres'
                }
            ];
        } else if (role === 'FOURTH_OFFICIAL' || role === 'FOURTH') {
            criteres = [
                {
                    key: 'controleSurfaces',
                    label: 'Contrôle des surfaces techniques et Assistance dans le contrôle du match',
                    max: 30,
                    description: 'Évaluation du contrôle des surfaces techniques'
                },
                {
                    key: 'gestionRemplacements',
                    label: 'Gestion des remplacements, gestion du temps additionnel',
                    max: 20,
                    description: 'Évaluation de la gestion des remplacements et du temps'
                }
            ];
        }

        // Mettre en cache
        this.criteresCache.set(role, criteres);
        return criteres;
    }

    addAvertissement() {
        this.reportData.avertissements.push({
            id: Date.now().toString(),
            maillot: '',
            equipe: 'home',
            licence: '',
            joueur: '',
            minute: 0,
            raisons: ''
        });
    }

    removeAvertissement(index: number) {
        this.reportData.avertissements.splice(index, 1);
    }

    addExpulsion() {
        this.reportData.expulsions.push({
            id: Date.now().toString(),
            maillot: '',
            equipe: 'home',
            licence: '',
            joueur: '',
            minute: 0,
            raisons: ''
        });
    }

    removeExpulsion(index: number) {
        this.reportData.expulsions.splice(index, 1);
    }

    addGoal() {
        // Déterminer l'équipe par défaut basée sur le score
        const totalHomeGoals = this.reportData.buteurs.filter((b: any) => b.equipe === 'home').length;
        const totalAwayGoals = this.reportData.buteurs.filter((b: any) => b.equipe === 'away').length;

        let defaultTeam: 'home' | 'away' = 'home';
        if (totalHomeGoals >= this.reportData.resultatFinal.home && totalAwayGoals < this.reportData.resultatFinal.away) {
            defaultTeam = 'away';
        }

        this.reportData.buteurs.push({
            id: Date.now().toString(),
            maillot: '',
            equipe: defaultTeam,
            licence: '',
            joueur: '',
            minute: 0,
            passeur: {
                maillot: '',
                equipe: defaultTeam,
                licence: '',
                joueur: ''
            }
        });
    }

    removeGoal(index: number) {
        this.reportData.buteurs.splice(index, 1);
    }

    clearAssist(index: number) {
        this.reportData.buteurs[index].passeur = {
            maillot: '',
            equipe: 'home',
            licence: '',
            joueur: ''
        };
    }

    getGoalsCount(team: 'home' | 'away'): number {
        return this.reportData.buteurs.filter((b: any) => b.equipe === team).length;
    }

    getGoalsValidationMessage(): string {
        const homeGoals = this.getGoalsCount('home');
        const awayGoals = this.getGoalsCount('away');
        const expectedHome = this.reportData.resultatFinal.home;
        const expectedAway = this.reportData.resultatFinal.away;

        if (homeGoals !== expectedHome || awayGoals !== expectedAway) {
            return `Attention: ${homeGoals}/${expectedHome} buts domicile, ${awayGoals}/${expectedAway} buts extérieur`;
        }
        return '';
    }

    private calculateTimeout: any;
    private criteresCache: Map<string, any[]> = new Map();

    onNoteChange(index: number) {
        // Annuler le timeout précédent s'il existe
        if (this.calculateTimeout) {
            clearTimeout(this.calculateTimeout);
        }

        // Programmer le calcul avec un délai de 100ms
        this.calculateTimeout = setTimeout(() => {
            this.calculateTotal(index);
        }, 100);
    }

    calculateTotal(index: number) {
        if (!this.reportData.evaluationsOfficiels || index >= this.reportData.evaluationsOfficiels.length) {
            return;
        }

        const evaluation = this.reportData.evaluationsOfficiels[index];
        if (!evaluation || !evaluation.criteres) {
            return;
        }

        const criteres = this.getCriteresForRole(evaluation.role);
        if (!criteres || criteres.length === 0) {
            return;
        }

        let total = 0;
        let totalMax = 0;

        criteres.forEach(critere => {
            const note = evaluation.criteres[critere.key]?.note || 0;
            total += note;
            totalMax += critere.max;
        });

        evaluation.total = total;
        evaluation.totalMax = totalMax;
    }

    getNoteLevel(total: number): string {
        if (total >= 9.0) return 'note-excellent';
        if (total >= 8.4) return 'note-very-good';
        if (total >= 7.9) return 'note-good';
        if (total >= 7.0) return 'note-medium';
        if (total >= 6.5) return 'note-insufficient';
        return 'note-bad';
    }

    getNoteLevelLabel(total: number): string {
        if (total >= 9.0) return 'Excellent';
        if (total >= 8.4) return 'Très bien';
        if (total >= 7.9) return 'Bien';
        if (total >= 7.0) return 'Moyen';
        if (total >= 6.5) return 'Insuffisant';
        return 'Mauvais';
    }

    getRoleLabel(role: string): string {
        switch (role) {
            case 'CENTRAL_REFEREE':
            case 'CENTRAL':
                return 'Arbitre Principal';
            case 'ASSISTANT_REFEREE_1':
            case 'ASSISTANT_1':
                return 'Arbitre Assistant N°1';
            case 'ASSISTANT_REFEREE_2':
            case 'ASSISTANT_2':
                return 'Arbitre Assistant N°2';
            case 'FOURTH_OFFICIAL':
                return '4e Arbitre';
            case 'COMMISSIONER':
                return 'Commissaire';
            default:
                return role;
        }
    }

    getTotalMaxForRole(role: string): number {
        const criteres = this.getCriteresForRole(role);
        return criteres.reduce((sum, critere) => sum + critere.max, 0);
    }

    toggleEvaluation(index: number) {
        if (this.reportData.evaluationsOfficiels[index]) {
            this.reportData.evaluationsOfficiels[index].expanded = !this.reportData.evaluationsOfficiels[index].expanded;
        }
    }

    trackByEvaluation(index: number, evaluation: any): any {
        return evaluation.officielId || index;
    }

    trackByCriteres(index: number, critere: any): any {
        return critere.key || index;
    }

    nextStep() {
        if (this.isLastStep) {
            this.submitReport();
        } else {
            this.currentStep++;
            this.scrollToTop();
        }
    }

    goToStep(step: number) {
        if (step >= 1 && step <= this.steps.length) {
            this.currentStep = step;
            this.scrollToTop();
        }
    }

    scrollToTop() {
        // Scroll vers le haut du contenu du modal
        setTimeout(() => {
            const container = document.querySelector('.report-container');
            if (container) {
                container.scrollTop = 0;
            }
        }, 100);
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            // Scroll to top when changing steps
            const container = document.querySelector('.report-container');
            if (container) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    get isLastStep(): boolean {
        return this.currentStep === this.steps.length;
    }

    get shouldShowEvaluationStep(): boolean {
        return this.isCommissioner && this.currentStep === 4;
    }

    submitReport() {
        // Calculer les totaux pour toutes les évaluations
        this.reportData.evaluationsOfficiels.forEach((evaluation: any, index: number) => {
            this.calculateTotal(index);
        });

        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Rapport soumis avec succès'
        });

        this.reportSubmitted.emit(this.reportData);
        this.onCancel();
    }

    onCancel() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.currentStep = 1;
        this.initializeReportData();
    }

    /**
     * Auto-complétion des données du joueur basée sur le numéro de maillot
     */
    onJerseyNumberChange(type: 'buteur' | 'passeur' | 'avertissement' | 'expulsion', index: number, subIndex?: number) {
        let item: any;
        let team: 'home' | 'away';
        let jerseyNumber: string;

        // Récupérer l'élément et le numéro de maillot selon le type
        if (type === 'buteur') {
            item = this.reportData.buteurs[index];
            team = item.equipe;
            jerseyNumber = item.maillot;
        } else if (type === 'passeur' && subIndex !== undefined) {
            item = this.reportData.buteurs[index].passeur;
            team = item.equipe || this.reportData.buteurs[index].equipe;
            jerseyNumber = item.maillot;
        } else if (type === 'avertissement') {
            item = this.reportData.avertissements[index];
            team = item.equipe;
            jerseyNumber = item.maillot;
        } else if (type === 'expulsion') {
            item = this.reportData.expulsions[index];
            team = item.equipe;
            jerseyNumber = item.maillot;
        } else {
            return;
        }

        // Si le numéro de maillot est vide, vider les autres champs
        if (!jerseyNumber || jerseyNumber.trim() === '') {
            item.licence = '';
            item.joueur = '';
            return;
        }

        // Trouver le joueur correspondant
        const players = team === 'home' ? this.homeTeamPlayers : this.awayTeamPlayers;
        const player = players.find(p =>
            p.jersey_number?.toString() === jerseyNumber.toString()
        );

        if (player) {
            // Auto-compléter les champs
            item.licence = player.player_id || '';
            item.joueur = `${player.first_name || ''} ${player.last_name || ''}`.trim();

            console.log(`Auto-complétion pour ${type}:`, {
                jerseyNumber,
                player: item.joueur,
                licence: item.licence
            });
        } else {
            // Joueur non trouvé, vider les champs mais garder le numéro de maillot
            item.licence = '';
            item.joueur = '';

            // Afficher un message d'avertissement si le numéro n'est pas trouvé
            if (jerseyNumber.trim() !== '') {
                console.warn(`Joueur avec le maillot ${jerseyNumber} non trouvé dans l'équipe ${team}`);
            }
        }
    }

    /**
     * Auto-complétion lors du changement d'équipe
     */
    onTeamChange(type: 'buteur' | 'passeur' | 'avertissement' | 'expulsion', index: number, subIndex?: number) {
        // Réappliquer l'auto-complétion avec la nouvelle équipe
        this.onJerseyNumberChange(type, index, subIndex);
    }

    /**
     * Obtenir la liste des joueurs pour une équipe donnée (pour affichage/debug)
     */
    getPlayersForTeam(team: 'home' | 'away'): CallupPlayer[] {
        return team === 'home' ? this.homeTeamPlayers : this.awayTeamPlayers;
    }

    /**
     * Vérifier si un numéro de maillot existe dans une équipe
     */
    isValidJerseyNumber(jerseyNumber: string, team: 'home' | 'away'): boolean {
        if (!jerseyNumber) return false;
        const players = this.getPlayersForTeam(team);
        return players.some(p => p.jersey_number?.toString() === jerseyNumber.toString());
    }
}
