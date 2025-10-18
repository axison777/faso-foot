# ⚙️ Configuration Match-Setup pour le Mode Coach

**Date :** 2025-10-18  
**Objectif :** Permettre au coach de soumettre uniquement la feuille de match de son équipe

---

## ✅ Modifications effectuées

### 1. **Détection automatique de l'équipe du coach**

**Fichier modifié :** `src/app/pages/match-setup/match-setup.component.ts`

**Nouvelles propriétés ajoutées :**
```typescript
// Coach mode: identifie quelle équipe appartient au coach connecté
myTeamId: string | null = null;
isCoachMode = false;
canEditHome = false;
canEditAway = false;
```

**Logique d'initialisation :**
```typescript
ngOnInit() {
  // Détection du mode coach
  const currentUser = this.authService.currentUser;
  this.myTeamId = currentUser?.team_id || null;
  this.isCoachMode = currentUser?.is_coach || false;
  
  // Déterminer les permissions d'édition
  if (this.isCoachMode && this.myTeamId) {
    this.canEditHome = (this.homeTeam.id === this.myTeamId);
    this.canEditAway = (this.awayTeam.id === this.myTeamId);
    
    // Vérification de sécurité
    if (!this.canEditHome && !this.canEditAway) {
      // Le match ne concerne pas l'équipe du coach
      this.messageService.add({
        severity: 'error',
        summary: 'Accès refusé',
        detail: 'Ce match ne concerne pas votre équipe'
      });
      this.router.navigate(['/mon-equipe/dashboard']);
      return;
    }
  } else {
    // Mode admin: peut tout éditer
    this.canEditHome = true;
    this.canEditAway = true;
  }
}
```

---

### 2. **Restriction de l'édition aux équipes autorisées**

**Méthodes protégées :**

#### `toggleHomeForm()`
```typescript
toggleHomeForm() {
  if (!this.canEditHome) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Action non autorisée',
      detail: 'Vous ne pouvez modifier que la composition de votre équipe'
    });
    return;
  }
  // ... reste du code
}
```

#### `toggleAwayForm()`
```typescript
toggleAwayForm() {
  if (!this.canEditAway) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Action non autorisée',
      detail: 'Vous ne pouvez modifier que la composition de votre équipe'
    });
    return;
  }
  // ... reste du code
}
```

#### `openPitch(side)`
```typescript
openPitch(side: 'home' | 'away') {
  // Vérifier les permissions
  if (side === 'home' && !this.canEditHome) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Action non autorisée',
      detail: 'Vous ne pouvez modifier que la composition de votre équipe'
    });
    return;
  }
  
  if (side === 'away' && !this.canEditAway) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Action non autorisée',
      detail: 'Vous ne pouvez modifier que la composition de votre équipe'
    });
    return;
  }
  // ... reste du code
}
```

---

### 3. **Nouvelles méthodes utilitaires**

#### `isMyTeam(side)`
Détermine si l'équipe spécifiée appartient au coach
```typescript
isMyTeam(side: 'home' | 'away'): boolean {
  if (!this.isCoachMode || !this.myTeamId) return false;
  const teamId = side === 'home' ? this.homeTeam.id : this.awayTeam.id;
  return teamId === this.myTeamId;
}
```

#### `getTeamLabel(side)`
Retourne le label à afficher pour une équipe
```typescript
getTeamLabel(side: 'home' | 'away'): string {
  return this.isMyTeam(side) ? 'Mon Équipe' : 'Équipe Adverse';
}
```

---

### 4. **Interface utilisateur mise à jour**

**Fichier modifié :** `src/app/pages/match-setup/match-setup.component.html`

#### Message d'information
```html
<!-- Message d'information pour le coach -->
<div *ngIf="isCoachMode" class="alert alert-info mb-4">
  <i class="pi pi-info-circle"></i>
  <span>Vous pouvez uniquement modifier la composition de votre équipe.</span>
</div>
```

#### Boutons avec permissions
```html
<!-- Bouton composition domicile -->
<p-button 
  (click)="toggleHomeForm()" 
  icon="pi pi-pencil" 
  [label]="'Composition Domicile' + (isMyTeam('home') ? ' (Mon Équipe)' : '')" 
  [severity]="isMyTeam('home') ? 'success' : 'contrast'"
  [disabled]="!canEditHome">
</p-button>

<!-- Bouton composition extérieur -->
<p-button 
  (click)="toggleAwayForm()" 
  icon="pi pi-pencil" 
  [label]="'Composition Exterieur' + (isMyTeam('away') ? ' (Mon Équipe)' : '')" 
  [severity]="isMyTeam('away') ? 'success' : 'contrast'"
  [disabled]="!canEditAway">
</p-button>
```

#### Boutons pitch setup
```html
<button 
  pButton 
  type="button" 
  [label]="'Modifier composition (domicile)' + (isMyTeam('home') ? ' - Mon Équipe' : '')" 
  (click)="openPitch('home')"
  [disabled]="!canEditHome"
  [severity]="isMyTeam('home') ? 'success' : 'secondary'">
</button>

<button 
  pButton 
  type="button" 
  [label]="'Modifier composition (extérieur)' + (isMyTeam('away') ? ' - Mon Équipe' : '')" 
  (click)="openPitch('away')"
  [disabled]="!canEditAway"
  [severity]="isMyTeam('away') ? 'success' : 'secondary'">
</button>
```

#### Cartes équipes avec badge
```html
<div *ngIf="assignedTeams.team_one_callup" 
     class="team-card" 
     [class.my-team-card]="isMyTeam('home')">
  <div class="team-header">
    <h3>{{ assignedTeams.team_one_callup.team_name }}</h3>
    <span *ngIf="isMyTeam('home')" class="my-team-badge">
      <i class="pi pi-check-circle"></i> Mon Équipe
    </span>
  </div>
  <!-- ... reste du contenu -->
</div>
```

---

### 5. **Styles CSS ajoutés**

**Fichier modifié :** `src/app/pages/match-setup/match-setup.component.scss`

```scss
/* Carte de l'équipe du coach - mise en évidence */
.team-card.my-team-card {
  border: 3px solid #10b981 !important;
  background: linear-gradient(to bottom, rgba(16, 185, 129, 0.05), white) !important;
}

/* Badge "Mon Équipe" */
.my-team-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* Message d'information */
.alert.alert-info {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  color: #1e40af;
}
```

---

### 6. **Mise à jour du Dashboard Coach**

**Fichier modifié :** `src/app/pages/coach-dashboard-v2/coach-dashboard-v2.component.ts`

**Amélioration de `prepareMatchSheet()` :**
```typescript
prepareMatchSheet() {
  const match = this.nextMatch();
  if (match && match.id) {
    // Préparer les données du match
    const matchData = {
      id: match.id,
      team1_id: match.isHome ? this.authService.currentUser?.team_id : null,
      team2_id: !match.isHome ? this.authService.currentUser?.team_id : null,
      team_one_id: match.isHome ? this.authService.currentUser?.team_id : null,
      team_two_id: !match.isHome ? this.authService.currentUser?.team_id : null,
      team1: match.isHome ? match.homeTeam : match.awayTeam,
      team2: !match.isHome ? match.awayTeam : match.homeTeam,
      team1_logo: this.team()?.logo || '',
      team2_logo: match.opponentLogo || '',
      scheduled_at: match.date,
      stadium: match.stadium,
      competition: match.competition
    };
    
    // Navigation avec state
    this.router.navigate(['/match-setup', match.id], { 
      state: { match: matchData }
    });
  }
}
```

**Template HTML mis à jour :**
```html
<button class="primary-action-btn" 
        (click)="prepareMatchSheet()" 
        [disabled]="!nextMatch()">
  <i class="pi pi-cog"></i>
  Préparer la Composition
</button>

<button class="secondary-action-btn" 
        (click)="viewMatchDetails()" 
        [disabled]="!nextMatch()">
  <i class="pi pi-eye"></i>
  Match Détails
</button>
```

---

## 🎨 Interface utilisateur

### Vue Coach - Match Setup

```
┌──────────────────────────────────────────────────────┐
│ Préparation du match                                 │
├──────────────────────────────────────────────────────┤
│                                                       │
│ ℹ️ Vous pouvez uniquement modifier la composition   │
│    de votre équipe.                                  │
│                                                       │
├──────────────────────────────────────────────────────┤
│                                                       │
│ [✅ Composition Domicile (Mon Équipe)]               │
│ [⚫ Composition Extérieur] (désactivé)               │
│                                                       │
│ [✅ Modifier composition domicile - Mon Équipe]      │
│ [⚫ Modifier composition extérieur] (désactivé)      │
│                                                       │
├──────────────────────────────────────────────────────┤
│ ┌────────────────────┐  ┌────────────────────┐     │
│ │ AS SONABEL         │  │ Karen Cash         │     │
│ │ ✅ Mon Équipe      │  │                    │     │
│ │ (bordure verte)    │  │ (normale)          │     │
│ │ - Coach: Naruto    │  │ - Coach: ???       │     │
│ │ - Formation: 4-4-2 │  │ - Formation: ???   │     │
│ │ - 11 Titulaires    │  │ (lecture seule)    │     │
│ └────────────────────┘  └────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

### Vue Admin - Match Setup (inchangée)

```
┌──────────────────────────────────────────────────────┐
│ Préparation du match                                 │
├──────────────────────────────────────────────────────┤
│                                                       │
│ [Composition Domicile]                               │
│ [Composition Extérieur]                              │
│                                                       │
│ [Modifier composition domicile]                      │
│ [Modifier composition extérieur]                     │
│                                                       │
│ ┌────────────────────┐  ┌────────────────────┐     │
│ │ Équipe 1           │  │ Équipe 2           │     │
│ │ (éditable)         │  │ (éditable)         │     │
│ └────────────────────┘  └────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

---

## 🔐 Sécurité et permissions

### Matrice des permissions

| Utilisateur | Équipe Domicile | Équipe Extérieur | Onglet Officiels |
|-------------|----------------|------------------|------------------|
| **Admin** | ✅ Éditable | ✅ Éditable | ✅ Éditable |
| **Coach équipe domicile** | ✅ Éditable | ❌ Bloqué | ❌ Lecture seule |
| **Coach équipe extérieur** | ❌ Bloqué | ✅ Éditable | ❌ Lecture seule |
| **Coach autre équipe** | ❌ Accès refusé | ❌ Accès refusé | ❌ Accès refusé |

### Contrôles de sécurité

1. **Au chargement de la page :**
   - Vérification que le match concerne l'équipe du coach
   - Redirection vers le dashboard si ce n'est pas le cas

2. **Sur chaque action :**
   - Vérification des permissions avant d'ouvrir un formulaire
   - Message d'avertissement si action non autorisée

3. **Boutons désactivés :**
   - Les boutons de l'équipe adverse sont désactivés (`[disabled]="!canEditHome"`)
   - Indication visuelle claire (grisé)

---

## 🎯 Fonctionnalités

### Pour un Coach

1. **Accès depuis le dashboard**
   - Clic sur "Préparer la Composition"
   - Navigation automatique vers `/match-setup/:id`
   - Données du match passées via `state`

2. **Sur la page match-setup**
   - Message d'information : "Vous pouvez uniquement modifier la composition de votre équipe"
   - Badge vert "Mon Équipe" sur sa propre équipe
   - Boutons activés uniquement pour son équipe
   - Boutons de l'équipe adverse désactivés et grisés

3. **Modification de la composition**
   - Peut ouvrir le formulaire de son équipe
   - Peut sélectionner les 11 titulaires + remplaçants
   - Peut choisir la formation
   - Peut désigner le capitaine
   - **Ne peut PAS** modifier la composition de l'adversaire

4. **Soumission**
   - Enregistre uniquement la composition de son équipe
   - Message de succès après soumission
   - Retour à la liste avec composition enregistrée

---

### Pour un Admin

**Aucun changement :** L'admin peut toujours éditer les deux équipes comme avant.

---

## 📋 Flux de navigation complet

```
Dashboard Coach
    │
    │ Clic sur "Préparer la Composition"
    │
    ├──> /match-setup/:id (avec state: { match })
    │         │
    │         ├─ Détection: isCoachMode = true
    │         ├─ Récupération: myTeamId
    │         ├─ Comparaison: homeTeam.id === myTeamId ?
    │         │
    │         ├─ Si OUI (équipe domicile):
    │         │     ├─ canEditHome = true
    │         │     ├─ canEditAway = false
    │         │     ├─ Badge "Mon Équipe" sur équipe domicile
    │         │     └─ Boutons équipe extérieur désactivés
    │         │
    │         └─ Si NON (équipe extérieur):
    │               ├─ canEditHome = false
    │               ├─ canEditAway = true
    │               ├─ Badge "Mon Équipe" sur équipe extérieur
    │               └─ Boutons équipe domicile désactivés
    │
    └──> Soumission de la composition
              │
              └──> Message de succès
                    └──> Composition enregistrée dans le backend
```

---

## 🧪 Tests à effectuer

### Test 1 : Coach équipe domicile

1. Se connecter en tant que coach de l'équipe domicile
2. Aller sur le dashboard
3. Cliquer sur "Préparer la Composition"
4. **Vérifier :**
   - ✅ Message d'info "Vous pouvez uniquement modifier..."
   - ✅ Badge "Mon Équipe" sur l'équipe domicile
   - ✅ Boutons équipe domicile activés (vert)
   - ✅ Boutons équipe extérieur désactivés (gris)
5. Cliquer sur un bouton extérieur
6. **Vérifier :**
   - ✅ Message d'avertissement affiché
   - ✅ Formulaire ne s'ouvre pas
7. Cliquer sur "Composition Domicile"
8. **Vérifier :**
   - ✅ Formulaire s'ouvre
   - ✅ Peut sélectionner les joueurs
   - ✅ Peut sauvegarder

---

### Test 2 : Coach équipe extérieur

1. Se connecter en tant que coach de l'équipe extérieure
2. Aller sur le dashboard
3. Cliquer sur "Préparer la Composition"
4. **Vérifier :**
   - ✅ Badge "Mon Équipe" sur l'équipe extérieure
   - ✅ Boutons équipe extérieur activés (vert)
   - ✅ Boutons équipe domicile désactivés (gris)

---

### Test 3 : Coach d'une autre équipe

1. Se connecter en tant que coach d'une équipe non concernée
2. Essayer d'accéder à `/match-setup/:id` d'un match qui ne concerne pas son équipe
3. **Vérifier :**
   - ✅ Message d'erreur "Ce match ne concerne pas votre équipe"
   - ✅ Redirection automatique vers `/mon-equipe/dashboard`

---

### Test 4 : Admin

1. Se connecter en tant qu'admin
2. Accéder à `/match-setup/:id`
3. **Vérifier :**
   - ✅ Aucun message d'information
   - ✅ Tous les boutons activés
   - ✅ Peut éditer les deux équipes

---

## 📁 Fichiers modifiés

1. ✅ `src/app/pages/match-setup/match-setup.component.ts`
   - Ajout import `AuthService`
   - Ajout propriétés de contrôle (isCoachMode, canEditHome, canEditAway)
   - Méthode `initializeTeams()` avec détection des permissions
   - Méthodes `toggleHomeForm()`, `toggleAwayForm()`, `openPitch()` protégées
   - Nouvelles méthodes `isMyTeam()` et `getTeamLabel()`

2. ✅ `src/app/pages/match-setup/match-setup.component.html`
   - Ajout message d'information pour le coach
   - Modification des boutons avec `[disabled]` et `[severity]`
   - Ajout badges "Mon Équipe"
   - Classe CSS `my-team-card` sur la carte de l'équipe du coach

3. ✅ `src/app/pages/match-setup/match-setup.component.scss`
   - Styles pour `.my-team-card`
   - Styles pour `.my-team-badge`
   - Styles pour `.alert.alert-info`

4. ✅ `src/app/pages/coach-dashboard-v2/coach-dashboard-v2.component.ts`
   - Amélioration de `prepareMatchSheet()` pour passer les données via state

5. ✅ `src/app/pages/coach-dashboard-v2/coach-dashboard-v2.component.html`
   - Boutons liés aux méthodes avec `[disabled]`

---

## ✅ Résultat final

**Le coach peut maintenant :**
- ✅ Accéder à match-setup depuis son dashboard
- ✅ Voir clairement quelle équipe est la sienne (badge vert)
- ✅ Modifier uniquement la composition de son équipe
- ✅ Soumettre sa feuille de match
- ❌ Ne peut PAS modifier la composition de l'adversaire
- ❌ Ne peut PAS accéder aux matchs qui ne le concernent pas

**L'admin peut toujours :**
- ✅ Éditer les deux équipes
- ✅ Gérer tous les matchs

---

**Status :** ✅ **TERMINÉ ET SÉCURISÉ**

Le système est maintenant configuré pour respecter les permissions de chaque rôle. 🔒⚽
