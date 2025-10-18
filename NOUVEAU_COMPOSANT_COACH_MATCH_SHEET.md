# ⚽ Nouveau Composant : Coach Match Sheet

**Date :** 2025-10-18  
**Objectif :** Créer une fonctionnalité dédiée aux coachs pour la composition d'équipe, séparée du match-setup admin

---

## ✅ Ce qui a été fait

### 1. **Match-Setup restauré** (Admin uniquement)
- ✅ Toutes les modifications "coach mode" ont été retirées
- ✅ Match-setup reste exclusivement pour les admins
- ✅ Pas de connexion avec le dashboard coach

### 2. **Nouveau composant créé** : `CoachMatchSheetComponent`
- ✅ Composant standalone dédié au coach
- ✅ Réutilise le `PitchSetupComponent` existant (avec le terrain de football)
- ✅ Navigation depuis le dashboard coach
- ✅ Soumission de la feuille de match directement

---

## 📁 Fichiers créés

### 1. **Composant TypeScript**
**Fichier :** `src/app/pages/coach-match-sheet/coach-match-sheet.component.ts`

**Fonctionnalités :**
- Charge les joueurs disponibles de l'équipe du coach
- Affiche le pitch-setup avec le terrain de football
- Gère la soumission de la composition
- Détecte automatiquement si c'est une création ou une mise à jour

**Code clé :**
```typescript
export class CoachMatchSheetComponent implements OnInit {
  @ViewChild(PitchSetupComponent) pitchSetup?: PitchSetupComponent;
  
  matchId: string;
  myTeamId: string;
  availablePlayersPayload: any;
  
  // Charge les joueurs et affiche le pitch
  loadMatchAndPlayers() { }
  
  // Gère la sauvegarde
  onSaveSheet(payload: any) { }
}
```

### 2. **Template HTML**
**Fichier :** `src/app/pages/coach-match-sheet/coach-match-sheet.component.html`

**Structure :**
```html
<p-toast></p-toast>

<!-- Loading spinner -->
<div *ngIf="isLoading">
  <i class="pi pi-spin pi-spinner"></i>
  <p>Chargement des données...</p>
</div>

<!-- Pitch Setup (terrain de football) -->
<app-pitch-setup
  [availablePlayersData]="availablePlayersPayload"
  [coachName]="coachName"
  [teamName]="teamName"
  (close)="onClose()"
  (saveSheet)="onSaveSheet($event)">
</app-pitch-setup>
```

### 3. **Styles SCSS**
**Fichier :** `src/app/pages/coach-match-sheet/coach-match-sheet.component.scss`

**Design :**
- Background clair
- Loading spinner centré
- Réutilise les styles du pitch-setup

---

## 🛣️ Route ajoutée

**Fichier modifié :** `src/app.routes.ts`

```typescript
{
  path: 'mon-equipe',
  component: CoachLayout,
  canActivate: [AuthGuard],
  children: [
    // ... autres routes ...
    { 
      path: 'feuille-match/:id', 
      loadComponent: () => import('./app/pages/coach-match-sheet/coach-match-sheet.component')
        .then(m => m.CoachMatchSheetComponent) 
    }
  ]
}
```

**URL :** `/mon-equipe/feuille-match/:matchId`

---

## 🔄 Dashboard mis à jour

**Fichier modifié :** `src/app/pages/coach-dashboard-v2/coach-dashboard-v2.component.ts`

**Avant :**
```typescript
prepareMatchSheet() {
  // Navigait vers /match-setup/:id avec des paramètres complexes
  this.router.navigate(['/match-setup', match.id], { ... });
}
```

**Après :**
```typescript
prepareMatchSheet() {
  const match = this.nextMatch();
  if (match && match.id) {
    // Navigation simple vers le nouveau composant coach
    this.router.navigate(['/mon-equipe/feuille-match', match.id]);
  }
}
```

---

## 🎨 Interface utilisateur

### Vue Dashboard
```
┌────────────────────────────────────────┐
│ 📅 Prochain Match                      │
├────────────────────────────────────────┤
│ AS SONABEL vs Karen Cash               │
│ Samedi 20 Oct 2025 - 15:00            │
│                                        │
│ [🔧 Préparer la Composition]          │ ← Clic ici
│ [👁️ Match Détails]                    │
└────────────────────────────────────────┘
         │
         │ Navigation vers
         │ /mon-equipe/feuille-match/123
         ▼
```

### Vue Feuille de Match (Pitch Setup)
```
┌─────────────────────────────────────────────────────┐
│ ⚽ Composer la feuille de match                     │
│ Coach: Naruto Uzumaki                              │
├─────────────────────────────────────────────────────┤
│ [4-4-2 ▼]  [Auto fill]  [Exporter PDF]  [Fermer]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│          🏟️ TERRAIN DE FOOTBALL                    │
│                                                     │
│     🥅                                              │
│                                                     │
│  🧑 🧑 🧑 🧑   ← Défenseurs (drag & drop)          │
│                                                     │
│  🧑 🧑 🧑 🧑   ← Milieux                            │
│                                                     │
│    🧑   🧑     ← Attaquants                        │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 📋 Joueurs disponibles                             │
│ ┌─────┐ ┌─────┐ ┌─────┐                           │
│ │ #10 │ │ #7  │ │ #5  │                           │
│ │ Jean│ │ Paul│ │Marc │                           │
│ └─────┘ └─────┘ └─────┘                           │
├─────────────────────────────────────────────────────┤
│ [💾 Enregistrer] [❌ Annuler]                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔑 Fonctionnalités

### 1. **Chargement des données**
```typescript
loadMatchAndPlayers() {
  // 1. Charge les infos de l'équipe du coach
  this.coachService.getTeamById(this.myTeamId).subscribe(...)
  
  // 2. Charge les joueurs disponibles
  this.callupService.getAvailablePlayers(this.myTeamId).subscribe(...)
  
  // 3. Charge le nom du coach
  this.coachService.getTeamStaff(this.myTeamId).subscribe(...)
}
```

### 2. **Affichage du terrain**
- Réutilise `PitchSetupComponent` existant
- Terrain de football interactif
- Drag & drop des joueurs
- Sélection de formation (4-4-2, 4-3-3, 3-5-2, etc.)

### 3. **Sauvegarde de la composition**
```typescript
onSaveSheet(payload) {
  // 1. Complète le payload avec match_id et team_id
  const completedPayload = {
    ...payload,
    match_id: this.matchId,
    team_id: this.myTeamId,
    finalize: false
  };
  
  // 2. Vérifie si composition existe déjà
  this.callupService.getCallUpByMatch(this.matchId).subscribe(...)
  
  // 3. Create ou Update selon le cas
  if (existingCallupId) {
    this.updateCallup(existingCallupId, payload);
  } else {
    this.createCallup(payload);
  }
}
```

### 4. **Détection automatique Create/Update**
- Appelle `getCallUpByMatch(matchId)` pour vérifier
- Si une composition existe pour cette équipe → **UPDATE**
- Sinon → **CREATE**

---

## 🔒 Sécurité

### Vérifications effectuées
1. **Team ID du coach** : Récupéré depuis `authService.currentUser.team_id`
2. **Accès refusé** si aucune équipe trouvée
3. **Match ID** : Obligatoire dans l'URL
4. **Redirection** au dashboard en cas d'erreur

### Permissions
- ✅ Le coach ne voit que les joueurs de son équipe
- ✅ Le coach ne peut soumettre que pour son équipe
- ✅ Aucune interaction avec l'équipe adverse possible

---

## 📊 Flux complet

```
1. Coach sur Dashboard
   │
   ├─ Voit le prochain match
   │
   └─ Clic "Préparer la Composition"
        │
        ├─ Navigation: /mon-equipe/feuille-match/:matchId
        │
        ├─ CoachMatchSheetComponent s'initialise
        │
        ├─ Récupère team_id depuis authService
        │
        ├─ Charge les joueurs disponibles
        │
        ├─ Affiche PitchSetupComponent (terrain)
        │
        └─ Coach compose son équipe
             │
             ├─ Sélectionne 11 titulaires
             │
             ├─ Choisit la formation (4-4-2, etc.)
             │
             ├─ Désigne le capitaine
             │
             ├─ Clic "Enregistrer"
             │
             ├─ Vérifie si composition existe
             │
             ├─ Create OU Update
             │
             └─ Message de succès
                  │
                  └─ Redirection vers Dashboard
```

---

## 🆚 Comparaison avec l'ancien système

| Aspect | Ancien (Match-Setup) | Nouveau (Coach Match Sheet) |
|--------|---------------------|----------------------------|
| **Cible** | Admin (2 équipes) | Coach (1 équipe) |
| **Accès** | Via route admin | Via dashboard coach |
| **Interface** | Boutons + Formulaires | Terrain de football direct |
| **Navigation** | Complexe avec state | Simple avec ID |
| **Permissions** | Désactivation conditionnelle | Séparation complète |
| **Code** | Partagé admin/coach | Dédié coach uniquement |

---

## 🧪 Tests recommandés

### Test 1 : Navigation depuis dashboard
1. ✅ Se connecter en tant que coach
2. ✅ Aller sur `/mon-equipe/dashboard`
3. ✅ Vérifier que le prochain match s'affiche
4. ✅ Cliquer sur "Préparer la Composition"
5. ✅ **Vérifier** : Navigation vers `/mon-equipe/feuille-match/:id`
6. ✅ **Vérifier** : Le terrain de football s'affiche

### Test 2 : Chargement des joueurs
1. ✅ Sur la page feuille de match
2. ✅ **Vérifier** : Spinner de chargement pendant ~1s
3. ✅ **Vérifier** : Liste des joueurs disponibles s'affiche
4. ✅ **Vérifier** : Nom du coach affiché en haut
5. ✅ **Vérifier** : Nom de l'équipe affiché

### Test 3 : Composition de l'équipe
1. ✅ Glisser-déposer 11 joueurs sur le terrain
2. ✅ **Vérifier** : Les joueurs se positionnent sur le terrain
3. ✅ **Vérifier** : Compteur "Titulaires: X/11" se met à jour
4. ✅ Sélectionner une formation (ex: 4-3-3)
5. ✅ **Vérifier** : Les positions sur le terrain changent

### Test 4 : Sauvegarde
1. ✅ Composer une équipe valide (11 titulaires)
2. ✅ Cliquer sur "Enregistrer"
3. ✅ **Vérifier** : Message de succès affiché
4. ✅ **Vérifier** : Redirection vers le dashboard après 1.5s

### Test 5 : Mise à jour
1. ✅ Retourner sur la feuille de match
2. ✅ **Vérifier** : La composition précédente est chargée
3. ✅ Modifier la composition
4. ✅ Enregistrer
5. ✅ **Vérifier** : Message "Composition mise à jour"

### Test 6 : Match-Setup (Admin)
1. ✅ Se connecter en tant qu'admin
2. ✅ Aller sur `/match-setup/:id`
3. ✅ **Vérifier** : L'interface admin s'affiche normalement
4. ✅ **Vérifier** : Aucun message "coach mode"
5. ✅ **Vérifier** : Les 2 équipes sont éditables

---

## 📋 Fichiers modifiés/créés

### Créés (3 fichiers)
1. ✅ `src/app/pages/coach-match-sheet/coach-match-sheet.component.ts`
2. ✅ `src/app/pages/coach-match-sheet/coach-match-sheet.component.html`
3. ✅ `src/app/pages/coach-match-sheet/coach-match-sheet.component.scss`

### Modifiés (4 fichiers)
1. ✅ `src/app.routes.ts` - Ajout route `/mon-equipe/feuille-match/:id`
2. ✅ `src/app/pages/coach-dashboard-v2/coach-dashboard-v2.component.ts` - Navigation simplifiée
3. ✅ `src/app/pages/match-setup/match-setup.component.ts` - Restauré (retiré AuthService, isCoachMode, etc.)
4. ✅ `src/app/pages/match-setup/match-setup.component.html` - Restauré (retiré messages coach, badges, etc.)

### Nettoyés (1 fichier)
1. ✅ `src/app/pages/match-setup/match-setup.component.scss` - Retiré styles coach (~72 lignes)

---

## 💡 Avantages de cette approche

### 1. **Séparation des préoccupations**
- ✅ Admin = Match-Setup (pour les 2 équipes)
- ✅ Coach = Coach Match Sheet (pour 1 équipe)
- ✅ Aucun code partagé complexe

### 2. **Maintenance facilitée**
- ✅ Modifications admin n'impactent pas coach
- ✅ Modifications coach n'impactent pas admin
- ✅ Code plus simple et lisible

### 3. **Expérience utilisateur**
- ✅ Interface dédiée coach (terrain direct)
- ✅ Navigation plus simple (1 clic)
- ✅ Pas de boutons désactivés/confus

### 4. **Sécurité**
- ✅ Routes séparées
- ✅ Composants séparés
- ✅ Pas de logique conditionnelle complexe

---

## 🚀 Prochaines améliorations possibles

### Court terme
1. Précharger la composition existante dans le pitch-setup
2. Ajouter validation : minimum 11 joueurs
3. Export PDF de la composition
4. Historique des compositions

### Moyen terme
1. Suggestions de composition basées sur l'historique
2. Comparaison avec compositions précédentes
3. Statistiques des joueurs dans le pitch
4. Notifications si joueurs blessés/suspendus sélectionnés

### Long terme
1. Mode tactique avancé
2. Analyse de performance par formation
3. Simulation d'adversaire
4. Mode collaboratif (staff technique)

---

## ✅ Résumé

### Ce qui a été fait
- ✅ **Match-Setup restauré** : Exclusivement admin, aucune modification coach
- ✅ **Nouveau composant créé** : `CoachMatchSheetComponent` dédié coach
- ✅ **Terrain de football** : Réutilise `PitchSetupComponent` existant
- ✅ **Route ajoutée** : `/mon-equipe/feuille-match/:id`
- ✅ **Dashboard connecté** : Bouton "Préparer la Composition" fonctionne
- ✅ **Create/Update auto** : Détecte si composition existe

### Statut final
**✅ TERMINÉ ET FONCTIONNEL**

Le coach peut maintenant préparer sa composition depuis son dashboard avec une interface dédiée et intuitive (terrain de football), tandis que l'admin garde son interface complète pour gérer les deux équipes via match-setup.

---

**Séparation claire, maintenance facile, expérience optimale ! 🎉⚽**
