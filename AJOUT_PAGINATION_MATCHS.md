# 📄 Ajout Pagination des Matchs

**Date :** 2025-10-18  
**Objectif :** Ajouter le paramètre `per_page` pour contrôler le nombre de matchs récupérés

---

## ✅ Modifications effectuées

### 1. **Interface `MatchFilterOptions` mise à jour**

**Fichier :** `src/app/models/coach-api.model.ts`

```typescript
export interface MatchFilterOptions {
  status?: MatchStatus;
  season_id?: string;
  pool_id?: string;
  date_from?: string;
  date_to?: string;
  type?: string;
  stadium_id?: string;
  match_day_id?: string;
  per_page?: number; // ✅ NOUVEAU : Nombre de matchs par page
  page?: number;     // ✅ NOUVEAU : Numéro de la page
}
```

### 2. **Utilisation dans le composant**

**Fichier :** `src/app/pages/coach-matches/coach-matches.component.ts`

```typescript
loadMatches() {
  // Construire les filtres API
  const filters: any = {};
  
  // ... autres filtres ...
  
  // Ajouter pagination
  filters.per_page = 1000; // Récupérer tous les matchs
  
  this.coachService.getTeamMatches(userTeamId, filters).subscribe({
    // ...
  });
}
```

---

## 🎯 Paramètres disponibles

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `per_page` | number | Nombre de matchs par page | `10`, `20`, `50`, `100`, `1000` |
| `page` | number | Numéro de la page (commence à 1) | `1`, `2`, `3` |

---

## 📊 Exemples d'utilisation

### Exemple 1 : Récupérer tous les matchs
```typescript
const filters = {
  per_page: 1000 // Nombre suffisamment grand
};
this.coachService.getTeamMatches(teamId, filters);
```

### Exemple 2 : Pagination par 20
```typescript
const filters = {
  per_page: 20,
  page: 1 // Première page
};
this.coachService.getTeamMatches(teamId, filters);
```

### Exemple 3 : Avec filtres + pagination
```typescript
const filters = {
  status: 'planned',
  season_id: 'xxx',
  per_page: 50,
  page: 2 // Deuxième page
};
this.coachService.getTeamMatches(teamId, filters);
```

---

## 🔄 Requêtes HTTP générées

### Sans pagination (avant)
```
GET /api/v1/teams/123/matches?status=planned
```

### Avec pagination (après)
```
GET /api/v1/teams/123/matches?status=planned&per_page=1000
```

### Avec page spécifique
```
GET /api/v1/teams/123/matches?status=planned&per_page=20&page=2
```

---

## 💡 Recommandations

### Pour la vue coach (liste complète)
```typescript
filters.per_page = 1000; // Récupérer tous les matchs
```

**Pourquoi ?**
- Le coach a besoin de voir tous ses matchs
- Le filtrage côté client fonctionne mieux avec toutes les données
- Les équipes ont rarement plus de 1000 matchs

### Pour une pagination UI (si besoin futur)

Si vous voulez ajouter une pagination dans l'interface :

```typescript
// Dans le composant
currentPage = signal(1);
perPage = signal(20);
totalMatches = signal(0);

loadMatches() {
  const filters = {
    per_page: this.perPage(),
    page: this.currentPage()
  };
  
  // L'API devrait retourner aussi le total
  this.coachService.getTeamMatches(teamId, filters).subscribe({
    next: (response) => {
      this.matches.set(response.data);
      this.totalMatches.set(response.total); // Si l'API le retourne
    }
  });
}

nextPage() {
  this.currentPage.update(p => p + 1);
  this.loadMatches();
}

previousPage() {
  this.currentPage.update(p => Math.max(1, p - 1));
  this.loadMatches();
}
```

---

## 🎨 Interface UI (optionnel)

Si vous voulez ajouter un sélecteur de pagination :

```html
<div class="pagination-controls">
  <label>Matchs par page :</label>
  <p-dropdown 
    [options]="perPageOptions" 
    [(ngModel)]="perPage"
    (onChange)="loadMatches()">
  </p-dropdown>
  
  <button pButton (click)="previousPage()" [disabled]="currentPage() === 1">
    Précédent
  </button>
  
  <span>Page {{ currentPage() }}</span>
  
  <button pButton (click)="nextPage()">
    Suivant
  </button>
</div>
```

```typescript
perPageOptions = [
  { label: '10 matchs', value: 10 },
  { label: '20 matchs', value: 20 },
  { label: '50 matchs', value: 50 },
  { label: '100 matchs', value: 100 },
  { label: 'Tous', value: 1000 }
];
```

---

## 📋 Fichiers modifiés

1. ✅ `src/app/models/coach-api.model.ts`
   - Ajout `per_page` et `page` dans `MatchFilterOptions`

2. ✅ `src/app/pages/coach-matches/coach-matches.component.ts`
   - Ajout `filters.per_page = 1000` dans `loadMatches()`

---

## 🧪 Tests

### Test 1 : Récupération avec per_page
1. ✅ Démarrer : `npm start`
2. ✅ Aller sur `/mon-equipe/matchs`
3. ✅ Ouvrir DevTools Network
4. ✅ **Vérifier** : La requête contient `per_page=1000`
   ```
   GET /api/v1/teams/xxx/matches?per_page=1000
   ```

### Test 2 : Nombre de matchs affichés
1. ✅ **Vérifier** : Tous les matchs de l'équipe s'affichent
2. ✅ **Vérifier** : Le compteur affiche le bon nombre

---

## ✅ Résumé

**Ajouté :**
- ✅ `per_page` et `page` dans `MatchFilterOptions`
- ✅ `per_page: 1000` par défaut pour récupérer tous les matchs
- ✅ Paramètres passés automatiquement à l'API via `HttpParams`

**Résultat :**
- Tous les matchs de l'équipe sont maintenant récupérés
- Le backend peut contrôler le nombre de résultats
- Base prête pour une pagination UI si besoin futur

---

**Status :** ✅ TERMINÉ

La pagination est maintenant configurée pour récupérer tous les matchs ! 📄⚽
