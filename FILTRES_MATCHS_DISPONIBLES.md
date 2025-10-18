# 🔍 Guide Complet des Filtres pour les Matchs

Ce document détaille tous les filtres disponibles pour récupérer les matchs d'une équipe.

---

## 📋 Paramètres disponibles selon le backend

D'après l'endpoint **`GET /v1/teams/{team}/matches`**, voici les paramètres de filtrage disponibles :

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `status` | string | Statut du match | `upcoming`, `played`, `in_progress`, `postponed` |
| `season_id` | string | ID de la saison | `f9cb1a00-5da1-4c83-b925-dee64f9acc91` |
| `pool_id` | string | ID de la poule/compétition | `f14f1295-c0ec-48b5-a497-820ec4c3cb28` |
| `date_from` | string | Date de début (YYYY-MM-DD) | `2025-01-01` |
| `date_to` | string | Date de fin (YYYY-MM-DD) | `2025-12-31` |
| `type` | string | Type de match | `regular`, `playoff`, etc. |
| `stadium_id` | string | ID du stade | `ef865004-291e-4455-b10d-c88bf492e533` |
| `match_day_id` | string | ID de la journée | `9f01b4cf-c151-4f12-a539-2d7a3659e96d` |

---

## 🎯 Exemples d'utilisation

### 1️⃣ Filtre par statut

#### Matchs à venir uniquement
```typescript
this.coachService.getTeamMatches(teamId, {
  status: 'upcoming'
}).subscribe(matches => {
  console.log('Matchs à venir:', matches);
});

// OU utiliser la méthode dédiée
this.coachService.getUpcomingMatches(teamId).subscribe(matches => {
  console.log('Matchs à venir:', matches);
});
```

#### Matchs joués uniquement
```typescript
this.coachService.getTeamMatches(teamId, {
  status: 'played'
}).subscribe(matches => {
  console.log('Matchs passés:', matches);
});

// OU utiliser la méthode dédiée
this.coachService.getPastMatches(teamId).subscribe(matches => {
  console.log('Matchs passés:', matches);
});
```

#### Matchs en cours
```typescript
this.coachService.getTeamMatches(teamId, {
  status: 'in_progress'
}).subscribe(matches => {
  console.log('Matchs en cours:', matches);
});
```

#### Matchs reportés
```typescript
this.coachService.getTeamMatches(teamId, {
  status: 'postponed'
}).subscribe(matches => {
  console.log('Matchs reportés:', matches);
});
```

---

### 2️⃣ Filtre par saison

```typescript
const seasonId = 'f9cb1a00-5da1-4c83-b925-dee64f9acc91';

this.coachService.getTeamMatches(teamId, {
  season_id: seasonId
}).subscribe(matches => {
  console.log(`Matchs de la saison ${seasonId}:`, matches);
});
```

**Cas d'usage :**
- Afficher les matchs d'une saison spécifique
- Comparer les performances entre saisons
- Statistiques par saison

---

### 3️⃣ Filtre par compétition (pool)

```typescript
const poolId = 'f14f1295-c0ec-48b5-a497-820ec4c3cb28';

this.coachService.getTeamMatches(teamId, {
  pool_id: poolId
}).subscribe(matches => {
  console.log(`Matchs de la compétition ${poolId}:`, matches);
});
```

**Cas d'usage :**
- Afficher les matchs d'un championnat spécifique
- Afficher les matchs d'une coupe
- Séparer les matchs par compétition

---

### 4️⃣ Filtre par période de dates

#### Matchs d'une période précise
```typescript
this.coachService.getTeamMatches(teamId, {
  date_from: '2025-01-01',
  date_to: '2025-01-31'
}).subscribe(matches => {
  console.log('Matchs de janvier 2025:', matches);
});
```

#### Matchs depuis une date
```typescript
this.coachService.getTeamMatches(teamId, {
  date_from: '2025-01-01'
}).subscribe(matches => {
  console.log('Matchs depuis le 1er janvier:', matches);
});
```

#### Matchs jusqu'à une date
```typescript
this.coachService.getTeamMatches(teamId, {
  date_to: '2025-12-31'
}).subscribe(matches => {
  console.log('Matchs jusqu\'au 31 décembre:', matches);
});
```

**Cas d'usage :**
- Calendrier mensuel
- Matchs du trimestre
- Historique sur une période

---

### 5️⃣ Filtre par stade

```typescript
const stadiumId = 'ef865004-291e-4455-b10d-c88bf492e533';

this.coachService.getTeamMatches(teamId, {
  stadium_id: stadiumId
}).subscribe(matches => {
  console.log(`Matchs au stade ${stadiumId}:`, matches);
});
```

**Cas d'usage :**
- Matchs à domicile dans un stade spécifique
- Statistiques par stade
- Performance par lieu

---

### 6️⃣ Filtre par journée

```typescript
const matchDayId = '9f01b4cf-c151-4f12-a539-2d7a3659e96d';

this.coachService.getTeamMatches(teamId, {
  match_day_id: matchDayId
}).subscribe(matches => {
  console.log(`Matchs de la journée ${matchDayId}:`, matches);
});
```

**Cas d'usage :**
- Afficher une journée complète
- Détails d'une journée spécifique
- Planning d'une journée

---

## 🎨 Combinaison de filtres

### Exemple 1 : Matchs à venir d'une saison
```typescript
this.coachService.getTeamMatches(teamId, {
  status: 'upcoming',
  season_id: 'season-123'
}).subscribe(matches => {
  console.log('Matchs à venir de la saison:', matches);
});
```

### Exemple 2 : Matchs d'une compétition pour une période
```typescript
this.coachService.getTeamMatches(teamId, {
  pool_id: 'pool-456',
  date_from: '2025-01-01',
  date_to: '2025-06-30'
}).subscribe(matches => {
  console.log('Matchs de compétition pour le 1er semestre:', matches);
});
```

### Exemple 3 : Matchs joués dans un stade spécifique
```typescript
this.coachService.getTeamMatches(teamId, {
  status: 'played',
  stadium_id: 'stadium-789'
}).subscribe(matches => {
  console.log('Historique des matchs dans ce stade:', matches);
});
```

### Exemple 4 : Matchs à venir cette semaine
```typescript
const today = new Date();
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

this.coachService.getTeamMatches(teamId, {
  status: 'upcoming',
  date_from: today.toISOString().split('T')[0],
  date_to: nextWeek.toISOString().split('T')[0]
}).subscribe(matches => {
  console.log('Matchs de cette semaine:', matches);
});
```

---

## 🛠️ Filtres supplémentaires côté Frontend

Après avoir récupéré les matchs, vous pouvez utiliser les méthodes utilitaires du service :

### Filtrer par période prédéfinie
```typescript
this.coachService.getUpcomingMatches(teamId).subscribe(matches => {
  const enriched = this.coachService.enrichMatches(matches, teamId);
  
  // Matchs d'aujourd'hui
  const today = this.coachService.filterMatchesByPeriod(enriched, 'today');
  
  // Matchs de cette semaine
  const thisWeek = this.coachService.filterMatchesByPeriod(enriched, 'week');
  
  // Matchs de ce mois
  const thisMonth = this.coachService.filterMatchesByPeriod(enriched, 'month');
});
```

### Filtrer manuellement
```typescript
this.coachService.getTeamMatches(teamId).subscribe(matches => {
  const enriched = this.coachService.enrichMatches(matches, teamId);
  
  // Matchs à domicile uniquement
  const homeMatches = enriched.filter(m => m.isHome);
  
  // Matchs à l'extérieur uniquement
  const awayMatches = enriched.filter(m => !m.isHome);
  
  // Matchs contre un adversaire spécifique
  const vsOpponent = enriched.filter(m => m.opponent.id === 'opponent-id');
  
  // Matchs derby (rivalité)
  const derbies = enriched.filter(m => m.is_derby === 1);
});
```

---

## 📊 Cas d'usage complets

### Interface de sélection de filtres

```typescript
export class CoachMatchesComponent {
  // Filtres sélectionnés par l'utilisateur
  selectedSeason = signal<string | null>(null);
  selectedCompetition = signal<string | null>(null);
  selectedStatus = signal<'upcoming' | 'played' | 'all'>('all');
  selectedPeriod = signal<'today' | 'week' | 'month' | 'all'>('all');
  
  // Listes pour les dropdowns
  seasons = signal<any[]>([]);
  competitions = signal<any[]>([]);
  
  loadMatches() {
    const filters: MatchFilterOptions = {};
    
    // Ajouter les filtres sélectionnés
    if (this.selectedSeason()) {
      filters.season_id = this.selectedSeason()!;
    }
    
    if (this.selectedCompetition()) {
      filters.pool_id = this.selectedCompetition()!;
    }
    
    if (this.selectedStatus() !== 'all') {
      filters.status = this.selectedStatus() as any;
    }
    
    // Appel API avec filtres
    this.coachService.getTeamMatches(teamId, filters).subscribe(matches => {
      let enriched = this.coachService.enrichMatches(matches, teamId);
      
      // Filtrer par période côté frontend
      if (this.selectedPeriod() !== 'all') {
        enriched = this.coachService.filterMatchesByPeriod(
          enriched, 
          this.selectedPeriod() as any
        );
      }
      
      this.matches.set(enriched);
    });
  }
  
  // Appelé quand l'utilisateur change un filtre
  onFilterChange() {
    this.loadMatches();
  }
}
```

### Template correspondant

```html
<div class="filters">
  <!-- Filtre par saison -->
  <p-dropdown 
    [options]="seasons()" 
    [(ngModel)]="selectedSeason" 
    (onChange)="onFilterChange()"
    placeholder="Toutes les saisons"
    optionLabel="label"
    optionValue="id">
  </p-dropdown>
  
  <!-- Filtre par compétition -->
  <p-dropdown 
    [options]="competitions()" 
    [(ngModel)]="selectedCompetition" 
    (onChange)="onFilterChange()"
    placeholder="Toutes les compétitions"
    optionLabel="name"
    optionValue="id">
  </p-dropdown>
  
  <!-- Filtre par statut -->
  <p-dropdown 
    [options]="[
      {label: 'Tous', value: 'all'},
      {label: 'À venir', value: 'upcoming'},
      {label: 'Joués', value: 'played'}
    ]" 
    [(ngModel)]="selectedStatus" 
    (onChange)="onFilterChange()"
    optionLabel="label"
    optionValue="value">
  </p-dropdown>
  
  <!-- Filtre par période -->
  <p-dropdown 
    [options]="[
      {label: 'Tous', value: 'all'},
      {label: 'Aujourd\'hui', value: 'today'},
      {label: 'Cette semaine', value: 'week'},
      {label: 'Ce mois', value: 'month'}
    ]" 
    [(ngModel)]="selectedPeriod" 
    (onChange)="onFilterChange()"
    optionLabel="label"
    optionValue="value">
  </p-dropdown>
  
  <!-- Bouton reset -->
  <button (click)="resetFilters()">
    <i class="pi pi-times"></i> Réinitialiser
  </button>
</div>
```

---

## 💡 Bonnes pratiques

### 1. Filtrer côté API quand possible
```typescript
// ✅ BON : Filtrer via l'API
this.coachService.getTeamMatches(teamId, {
  status: 'upcoming',
  season_id: seasonId
});

// ❌ MAUVAIS : Récupérer tout puis filtrer
this.coachService.getTeamMatches(teamId).pipe(
  map(matches => matches.filter(m => m.season_id === seasonId))
);
```

**Pourquoi ?** Plus performant, moins de données transférées.

---

### 2. Enrichir avant de filtrer côté frontend
```typescript
// ✅ BON
const enriched = this.coachService.enrichMatches(matches, teamId);
const homeMatches = enriched.filter(m => m.isHome);

// ❌ MAUVAIS
const homeMatches = matches.filter(m => m.team_one_id === teamId);
```

---

### 3. Utiliser les méthodes utilitaires
```typescript
// ✅ BON
const sorted = this.coachService.sortMatches(matches, 'date_asc');

// ❌ MAUVAIS
const sorted = [...matches].sort((a, b) => {
  return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
});
```

---

## 📚 Référence rapide

| Besoin | Méthode | Filtres |
|--------|---------|---------|
| Tous les matchs | `getTeamMatches(teamId)` | Aucun |
| Matchs à venir | `getUpcomingMatches(teamId)` | `status: 'upcoming'` |
| Matchs passés | `getPastMatches(teamId)` | `status: 'played'` |
| Prochain match | `getNextMatch(teamId)` | - |
| Par saison | `getTeamMatches(teamId, {season_id})` | `season_id` |
| Par compétition | `getTeamMatches(teamId, {pool_id})` | `pool_id` |
| Par période | `getTeamMatches(teamId, {date_from, date_to})` | `date_from`, `date_to` |
| Matchs d'aujourd'hui | `filterMatchesByPeriod(matches, 'today')` | Frontend |
| Matchs de la semaine | `filterMatchesByPeriod(matches, 'week')` | Frontend |

---

## ✅ Checklist

- [ ] Comprendre les filtres disponibles côté API
- [ ] Utiliser les filtres API autant que possible
- [ ] Enrichir les matchs après récupération
- [ ] Utiliser les méthodes utilitaires pour filtrer/trier
- [ ] Combiner plusieurs filtres si nécessaire
- [ ] Documenter les filtres utilisés dans le code

---

Bon filtrage ! 🎯
