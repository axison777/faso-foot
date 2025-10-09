# Implémentation des API pour les Officiels - Documentation

## 📋 Résumé des modifications

Ce document récapitule toutes les modifications apportées pour implémenter les API des officiels et la gestion des rapports de match.

## ✅ Services créés et modifiés

### 1. **Service OfficialReportService** (NOUVEAU)
📁 `src/app/service/official-report.service.ts`

Service pour gérer les rapports d'officiels avec les endpoints suivants :

#### Endpoints implémentés :
- ✅ `GET /api/v1/Official/officialMatchs/{officialId}` - Liste des matchs d'un officiel
- ✅ `GET /api/v1/Official/matchOfficials/{matchId}` - Liste des officiels d'un match
- ✅ `POST /api/v1/official-reports` - Créer un rapport
- ✅ `GET /api/v1/official-reports/{id}` - Récupérer un rapport
- ✅ `POST /api/v1/official-reports/{id}/submit` - Soumettre un rapport
- ✅ `PUT /api/v1/official-reports/{id}` - Mettre à jour un rapport (brouillon)

#### Méthodes disponibles :
```typescript
- getOfficialMatches(officialId: string): Observable<any>
- getMatchOfficials(matchId: string): Observable<any>
- createReport(payload: OfficialReportPayload): Observable<{ report: OfficialReport }>
- getReportById(reportId: string): Observable<{ report: OfficialReport }>
- submitReport(reportId: string): Observable<{ report: OfficialReport }>
- updateReport(reportId: string, payload: Partial<OfficialReportPayload>): Observable<{ report: OfficialReport }>
```

### 2. **Service OfficialMatchService** (MODIFIÉ)
📁 `src/app/service/official-match.service.ts`

**Modifications apportées :**
- ❌ Suppression de toutes les données mockées
- ✅ Utilisation des vraies API `/api/v1/Official/officialMatchs/{officialId}`
- ✅ Intégration avec AuthService pour récupérer l'ID de l'utilisateur connecté
- ✅ Filtrage côté client (status, competitionId, seasonId)
- ✅ Gestion d'erreurs améliorée

## 📊 Modèles et Interfaces

### OfficialReportPayload
Structure complète pour créer un rapport :
```typescript
{
  match_id: string;
  official_id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED';
  review_notes?: string;
  match_result: {
    team_one_final_score: number;
    team_two_final_score: number;
    team_one_half_time_score: number;
    team_two_half_time_score: number;
    has_extra_time: boolean;
    team_one_extra_time_score?: number;
    team_two_extra_time_score?: number;
    has_penalties: boolean;
    team_one_penalty_score?: number;
    team_two_penalty_score?: number;
  };
  match_evaluation: {
    difficulty_level: 'Easy' | 'Normal' | 'Difficult' | 'Very Difficult';
    team_one_attitude: string;
    team_two_attitude: string;
    public_attitude: string;
    field_condition: string;
    organization_observation: string;
    general_organization: string;
    control_service: string;
    police_service: string;
    medical_service: string;
    press_service: string;
    spectator_count: number;
    incidents_or_remarks: string;
  };
  main_referee_evaluation?: { ... };
  fourth_official_evaluation?: { ... };
  sanctions?: Array<{ ... }>;
  assistant_evaluations?: Array<{ ... }>;
}
```

### OfficialReport
Structure de réponse complète avec tous les détails du rapport.

## 🔧 Composants Existants

### 1. OfficialDashboardComponent
📁 `src/app/pages/official-dashboard/official-dashboard.component.ts`
- ✅ Affiche les statistiques des matchs
- ✅ Liste des prochains matchs (3 premiers)
- ✅ Notifications récentes
- ✅ Utilise les vraies API via OfficialMatchService

### 2. OfficialMatchesComponent
📁 `src/app/pages/official-matches/official-matches.component.ts`
- ✅ Liste complète des matchs avec filtrage
- ✅ Actions pour voir détails et saisir rapport
- ✅ Gestion des modales (MatchReportModal, MatchDetailsModal)

### 3. OfficialMatchDetailsComponent
📁 `src/app/pages/official-match-details/official-match-details.component.ts`
- ✅ Détails complets du match
- ✅ Liste des officiels assignés
- ✅ Actions spécifiques selon le rôle

### 4. OfficialMatchReportComponent
📁 `src/app/pages/official-match-report/official-match-report.component.ts`
- ✅ Formulaire de rapport complet
- ✅ Saisie des scores, événements, cartons
- ✅ Évaluation des arbitres (pour commissaires)

## 📝 À Implémenter (Prochaines étapes)

### 1. Intégration du Rapport avec les Nouvelles API

#### Dans OfficialMatchReportComponent :
```typescript
// Modifier la méthode saveReport()
saveReport() {
  if (this.reportForm.valid) {
    const reportPayload = this.buildReportPayload('DRAFT');
    this.officialReportService.createReport(reportPayload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Brouillon sauvegardé',
          detail: 'Votre rapport a été sauvegardé en brouillon'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la sauvegarde'
        });
      }
    });
  }
}

// Modifier la méthode submitReport()
submitReport() {
  if (this.reportForm.valid) {
    const reportPayload = this.buildReportPayload('SUBMITTED');
    this.officialReportService.createReport(reportPayload).subscribe({
      next: (res) => {
        if (res?.report?.id) {
          this.officialReportService.submitReport(res.report.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Rapport soumis',
                detail: 'Votre rapport a été soumis avec succès'
              });
              this.router.navigate(['/officiel/matchs']);
            }
          });
        }
      }
    });
  }
}

// Méthode helper pour construire le payload
private buildReportPayload(status: 'DRAFT' | 'SUBMITTED'): OfficialReportPayload {
  const formValue = this.reportForm.value;
  return {
    match_id: this.matchId,
    official_id: this.authService.currentUser?.id || '',
    status: status,
    match_result: {
      team_one_final_score: formValue.finalHome || 0,
      team_two_final_score: formValue.finalAway || 0,
      team_one_half_time_score: formValue.firstHalfHome || 0,
      team_two_half_time_score: formValue.firstHalfAway || 0,
      has_extra_time: false,
      has_penalties: false,
    },
    match_evaluation: {
      difficulty_level: 'Normal',
      team_one_attitude: '',
      team_two_attitude: '',
      public_attitude: '',
      field_condition: formValue.fieldCondition || '',
      organization_observation: '',
      general_organization: '',
      control_service: '',
      police_service: '',
      medical_service: '',
      press_service: '',
      spectator_count: formValue.attendance || 0,
      incidents_or_remarks: formValue.incidents || '',
    },
    sanctions: this.buildSanctions(formValue.cards),
    // ... autres champs selon le rôle
  };
}
```

### 2. Feuille de Match pour Validation (Commissaire)

Créer un composant pour afficher et valider la feuille de match :

**Composant à créer :** `MatchSheetValidationComponent`
📁 `src/app/pages/official-match-details/match-sheet-validation.component.ts`

**Fonctionnalités :**
- Afficher la composition des équipes (inspiré de match-setup)
- Liste des titulaires et remplaçants
- Vérification de la conformité (nombre de joueurs, etc.)
- Validation par le commissaire

**Code de base :**
```typescript
@Component({
  selector: 'app-match-sheet-validation',
  // ...
})
export class MatchSheetValidationComponent {
  homeTeamComposition: any[] = [];
  awayTeamComposition: any[] = [];
  
  loadMatchSheet(matchId: string) {
    // Récupérer la composition via CallupService
    this.callupService.getCallUpByMatch(matchId).subscribe({
      next: (res) => {
        const callups = res?.data?.match_callups || [];
        this.homeTeamComposition = callups.find(c => c.team_type === 'home')?.players || [];
        this.awayTeamComposition = callups.find(c => c.team_type === 'away')?.players || [];
      }
    });
  }
  
  validateSheet() {
    // Valider la feuille de match
    const validation = {
      teamsReady: true,
      playersPresent: true,
      fieldReady: true,
      comments: ''
    };
    
    this.officialMatchService.validateMatchSheet(this.matchId, validation).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Validation réussie',
          detail: 'La feuille de match a été validée'
        });
      }
    });
  }
}
```

### 3. Affichage du Rapport Soumis

Dans `OfficialMatchDetailsComponent`, ajouter la récupération du rapport :

```typescript
loadMatchReport() {
  // Si le rapport est soumis, le récupérer
  if (this.match?.reportSubmitted && this.match?.reportId) {
    this.officialReportService.getReportById(this.match.reportId).subscribe({
      next: (res) => {
        this.matchReport = res?.report;
      }
    });
  }
}
```

## 🗂️ Structure des Fichiers

```
src/app/
├── service/
│   ├── official-report.service.ts     ✅ NOUVEAU
│   ├── official-match.service.ts      ✅ MODIFIÉ
│   └── official.service.ts             ✅ EXISTANT
├── pages/
│   ├── official-dashboard/
│   │   └── official-dashboard.component.ts
│   ├── official-matches/
│   │   ├── official-matches.component.ts
│   │   ├── match-report-modal.component.ts
│   │   └── match-details-modal.component.ts
│   ├── official-match-details/
│   │   ├── official-match-details.component.ts
│   │   └── match-sheet-validation.component.ts  ❌ À CRÉER
│   └── official-match-report/
│       └── official-match-report.component.ts   ✅ À MODIFIER
└── models/
    └── match-report.model.ts           ✅ EXISTANT
```

## 🔄 Flux de Travail

### Pour un Arbitre :
1. Se connecte → Voit ses matchs assignés dans le dashboard
2. Clique sur un match → Voit les détails
3. Après le match → Saisit le rapport (scores, événements, cartons)
4. Soumet le rapport → État "Soumis"

### Pour un Commissaire :
1. Se connecte → Voit ses matchs assignés
2. Avant le match → Valide la feuille de match (composition des équipes)
3. Pendant le match → Note les incidents
4. Après le match → Évalue les arbitres et soumet le rapport

## 📋 Checklist Finale

- [x] Service OfficialReportService créé
- [x] Service OfficialMatchService mis à jour
- [x] Données mockées supprimées
- [x] Intégration avec AuthService
- [ ] Implémentation complète du rapport dans OfficialMatchReportComponent
- [ ] Création du composant MatchSheetValidationComponent
- [ ] Affichage du rapport soumis dans les détails du match
- [ ] Tests des flux complets (arbitre, commissaire)

## 🚀 Utilisation

### Pour créer un rapport :
```typescript
const payload: OfficialReportPayload = {
  match_id: "...",
  official_id: "...",
  status: "DRAFT",
  match_result: { ... },
  match_evaluation: { ... },
  // ...
};

this.officialReportService.createReport(payload).subscribe(res => {
  console.log('Rapport créé:', res.report);
});
```

### Pour soumettre un rapport :
```typescript
this.officialReportService.submitReport(reportId).subscribe(res => {
  console.log('Rapport soumis:', res.report);
});
```

### Pour récupérer un rapport :
```typescript
this.officialReportService.getReportById(reportId).subscribe(res => {
  console.log('Rapport:', res.report);
});
```

## 📞 Support

Pour toute question sur l'implémentation, consultez :
- Service principal: `src/app/service/official-report.service.ts`
- Modèles de données: Voir les interfaces dans le service
- Exemples d'utilisation: Voir les composants existants

---
**Date de mise à jour:** 2025-10-09
**Version:** 1.0.0
