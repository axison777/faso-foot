# 📘 Guide d'Utilisation du CoachService

## 🎯 Vue d'ensemble

Le **CoachService** est un service centralisé qui gère tous les appels API pour la vue Coach. Il remplace les appels directs aux services `PlayerService`, `MatchService`, et `EquipeService` avec une interface unifiée et bien typée.

---

## ✅ Avantages

1. **Centralisation** : Tous les appels API Coach au même endroit
2. **Typage fort** : Modèles TypeScript précis basés sur les réponses backend réelles
3. **Méthodes utilitaires** : Filtrage, tri, enrichissement des données
4. **Gestion d'erreurs** : Logging cohérent et fallbacks
5. **Maintenabilité** : Plus facile à maintenir et tester

---

## 📦 Structure des fichiers

```
src/app/
├── models/
│   └── coach-api.model.ts          # Tous les types/interfaces
└── service/
    └── coach.service.ts             # Service centralisé
```

---

## 🚀 Utilisation dans les composants

### 1. Import du service

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CoachService } from '../../service/coach.service';
import { EnrichedMatch, CoachPlayer, CoachTeam } from '../../models/coach-api.model';

@Component({
  selector: 'app-coach-dashboard',
  // ...
})
export class CoachDashboardComponent implements OnInit {
  private coachService = inject(CoachService);
  
  team: CoachTeam | null = null;
  players: CoachPlayer[] = [];
  matches: EnrichedMatch[] = [];
  nextMatch: EnrichedMatch | null = null;
}
```

---

## 📋 Exemples d'utilisation

### 🏟️ Récupérer l'équipe

```typescript
loadTeam(teamId: string) {
  this.coachService.getTeamById(teamId).subscribe({
    next: (team) => {
      console.log('Équipe chargée:', team);
      this.team = team;
    },
    error: (err) => {
      console.error('Erreur:', err);
    }
  });
}
```

---

### 👥 Récupérer les joueurs

```typescript
loadPlayers(teamId: string) {
  this.coachService.getTeamPlayers(teamId).subscribe({
    next: (players) => {
      console.log(`${players.length} joueurs chargés`);
      this.players = players;
      
      // Calculer l'âge de chaque joueur
      this.players.forEach(player => {
        const age = this.coachService.calculatePlayerAge(player.date_of_birth);
        console.log(`${player.first_name} ${player.last_name}: ${age} ans`);
      });
    }
  });
}
```

---

### ⚽ Récupérer tous les matchs

```typescript
loadAllMatches(teamId: string) {
  this.coachService.getTeamMatches(teamId).subscribe({
    next: (matches) => {
      console.log(`${matches.length} matchs chargés`);
      
      // Enrichir les matchs avec des données calculées
      const enriched = this.coachService.enrichMatches(matches, teamId);
      
      // Trier par date (plus récent en premier)
      this.matches = this.coachService.sortMatches(enriched, 'date_asc');
    }
  });
}
```

---

### 🔍 Filtrer les matchs

#### Par statut (à venir / passés)

```typescript
// Matchs à venir uniquement
loadUpcomingMatches(teamId: string) {
  this.coachService.getUpcomingMatches(teamId).subscribe({
    next: (matches) => {
      const enriched = this.coachService.enrichMatches(matches, teamId);
      this.upcomingMatches = enriched;
    }
  });
}

// Matchs passés uniquement
loadPastMatches(teamId: string) {
  this.coachService.getPastMatches(teamId).subscribe({
    next: (matches) => {
      const enriched = this.coachService.enrichMatches(matches, teamId);
      this.pastMatches = enriched;
    }
  });
}
```

#### Par saison

```typescript
loadMatchesBySeason(teamId: string, seasonId: string) {
  this.coachService.getTeamMatches(teamId, { 
    season_id: seasonId 
  }).subscribe({
    next: (matches) => {
      const enriched = this.coachService.enrichMatches(matches, teamId);
      this.matches = enriched;
    }
  });
}
```

#### Par compétition (pool)

```typescript
loadMatchesByCompetition(teamId: string, poolId: string) {
  this.coachService.getTeamMatches(teamId, { 
    pool_id: poolId 
  }).subscribe({
    next: (matches) => {
      const enriched = this.coachService.enrichMatches(matches, teamId);
      this.matches = enriched;
    }
  });
}
```

#### Par période de dates

```typescript
loadMatchesByDateRange(teamId: string, dateFrom: string, dateTo: string) {
  this.coachService.getTeamMatches(teamId, {
    date_from: dateFrom,  // Format: YYYY-MM-DD
    date_to: dateTo       // Format: YYYY-MM-DD
  }).subscribe({
    next: (matches) => {
      const enriched = this.coachService.enrichMatches(matches, teamId);
      this.matches = enriched;
    }
  });
}
```

#### Filtres multiples combinés

```typescript
loadFilteredMatches(teamId: string) {
  this.coachService.getTeamMatches(teamId, {
    status: 'upcoming',
    season_id: 'season-123',
    pool_id: 'pool-456',
    date_from: '2025-01-01',
    date_to: '2025-12-31'
  }).subscribe({
    next: (matches) => {
      const enriched = this.coachService.enrichMatches(matches, teamId);
      this.matches = enriched;
    }
  });
}
```

---

### 🥇 Récupérer le prochain match

```typescript
loadNextMatch(teamId: string) {
  this.coachService.getNextMatch(teamId).subscribe({
    next: (match) => {
      if (match) {
        const enriched = this.coachService.enrichMatches([match], teamId)[0];
        this.nextMatch = enriched;
        
        console.log('Prochain match:', {
          opponent: enriched.opponent.name,
          date: enriched.matchDate,
          daysUntil: enriched.daysUntilMatch,
          isHome: enriched.isHome
        });
      } else {
        console.log('Aucun match à venir');
      }
    }
  });
}
```

---

### 👔 Récupérer le staff

```typescript
loadStaff(teamId: string) {
  this.coachService.getTeamStaff(teamId).subscribe({
    next: (staff) => {
      console.log(`${staff.length} membres du staff`);
      this.staff = staff;
    }
  });
}
```

---

## 🛠️ Méthodes utilitaires

### Enrichir les matchs

Ajoute des propriétés calculées aux matchs :

```typescript
const enriched = this.coachService.enrichMatches(rawMatches, teamId);

// Propriétés ajoutées :
// - isHome: boolean
// - opponent: CoachTeam
// - myTeam: CoachTeam
// - matchDate: Date
// - daysUntilMatch: number
// - isUpcoming: boolean
// - isPast: boolean
```

---

### Filtrer par période

```typescript
const enriched = this.coachService.enrichMatches(matches, teamId);

// Matchs d'aujourd'hui
const today = this.coachService.filterMatchesByPeriod(enriched, 'today');

// Matchs de cette semaine
const week = this.coachService.filterMatchesByPeriod(enriched, 'week');

// Matchs de ce mois
const month = this.coachService.filterMatchesByPeriod(enriched, 'month');

// Tous les matchs
const all = this.coachService.filterMatchesByPeriod(enriched, 'all');
```

---

### Trier les matchs

```typescript
const enriched = this.coachService.enrichMatches(matches, teamId);

// Trier par date (ascendant)
const byDateAsc = this.coachService.sortMatches(enriched, 'date_asc');

// Trier par date (descendant)
const byDateDesc = this.coachService.sortMatches(enriched, 'date_desc');

// Trier par compétition
const byCompetition = this.coachService.sortMatches(enriched, 'competition');

// Trier par adversaire
const byOpponent = this.coachService.sortMatches(enriched, 'opponent');
```

---

### Grouper les matchs

```typescript
const enriched = this.coachService.enrichMatches(matches, teamId);

// Grouper par saison
const bySeason = this.coachService.groupMatchesBySeason(enriched);
bySeason.forEach((matches, seasonId) => {
  console.log(`Saison ${seasonId}: ${matches.length} matchs`);
});

// Grouper par compétition
const byCompetition = this.coachService.groupMatchesByCompetition(enriched);
byCompetition.forEach((matches, competitionId) => {
  console.log(`Compétition ${competitionId}: ${matches.length} matchs`);
});
```

---

### Calculer l'âge d'un joueur

```typescript
const age = this.coachService.calculatePlayerAge('1996-02-24');
console.log(`Âge: ${age} ans`);
```

---

### Déterminer le statut du contrat

```typescript
const status = this.coachService.determineContractStatus('2025-03-15');
console.log(`Statut contrat: ${status}`); // 'VALID' | 'EXPIRING' | 'EXPIRED'
```

---

## 📊 Exemple complet : Dashboard Coach

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CoachService } from '../../service/coach.service';
import { AuthService } from '../../service/auth.service';
import { EnrichedMatch, CoachPlayer, CoachTeam } from '../../models/coach-api.model';

@Component({
  selector: 'app-coach-dashboard',
  templateUrl: './coach-dashboard.component.html',
  styleUrls: ['./coach-dashboard.component.scss']
})
export class CoachDashboardComponent implements OnInit {
  private coachService = inject(CoachService);
  private authService = inject(AuthService);
  
  team = signal<CoachTeam | null>(null);
  players = signal<CoachPlayer[]>([]);
  nextMatch = signal<EnrichedMatch | null>(null);
  upcomingMatches = signal<EnrichedMatch[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const teamId = this.authService.currentUser?.team_id;
    if (teamId) {
      this.loadDashboardData(teamId);
    }
  }

  loadDashboardData(teamId: string) {
    this.loading.set(true);
    
    // Charger l'équipe
    this.coachService.getTeamById(teamId).subscribe({
      next: (team) => {
        this.team.set(team);
      },
      error: (err) => {
        console.error('Erreur équipe:', err);
      }
    });

    // Charger les joueurs
    this.coachService.getTeamPlayers(teamId).subscribe({
      next: (players) => {
        this.players.set(players);
      },
      error: (err) => {
        console.error('Erreur joueurs:', err);
      }
    });

    // Charger le prochain match
    this.coachService.getNextMatch(teamId).subscribe({
      next: (match) => {
        if (match) {
          const enriched = this.coachService.enrichMatches([match], teamId)[0];
          this.nextMatch.set(enriched);
        }
      },
      error: (err) => {
        console.error('Erreur match:', err);
      }
    });

    // Charger les matchs à venir
    this.coachService.getUpcomingMatches(teamId).subscribe({
      next: (matches) => {
        const enriched = this.coachService.enrichMatches(matches, teamId);
        const sorted = this.coachService.sortMatches(enriched, 'date_asc');
        this.upcomingMatches.set(sorted.slice(0, 5)); // Prendre les 5 prochains
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur matchs:', err);
        this.loading.set(false);
      }
    });
  }
}
```

---

## 🔑 Points clés

1. **Toujours enrichir les matchs** après les avoir récupérés pour avoir accès aux propriétés calculées
2. **Utiliser les filtres API** quand possible (plus performant que filtrer côté client)
3. **Les méthodes utilitaires** sont là pour simplifier le code dans les composants
4. **Le typage TypeScript** vous guide et évite les erreurs

---

## 📚 Référence des méthodes

### Méthodes principales

| Méthode | Description | Retour |
|---------|-------------|--------|
| `getTeamById(teamId)` | Récupère une équipe | `Observable<CoachTeam>` |
| `getTeamPlayers(teamId)` | Récupère les joueurs | `Observable<CoachPlayer[]>` |
| `getPlayerDetails(playerId)` | Détails d'un joueur | `Observable<CoachPlayer>` |
| `getTeamMatches(teamId, filters?)` | Tous les matchs (avec filtres) | `Observable<CoachMatch[]>` |
| `getUpcomingMatches(teamId, filters?)` | Matchs à venir | `Observable<CoachMatch[]>` |
| `getPastMatches(teamId, filters?)` | Matchs passés | `Observable<CoachMatch[]>` |
| `getNextMatch(teamId)` | Prochain match | `Observable<CoachMatch \| null>` |
| `getTeamStaff(teamId)` | Staff de l'équipe | `Observable<CoachStaffMember[]>` |

### Méthodes utilitaires

| Méthode | Description | Retour |
|---------|-------------|--------|
| `enrichMatches(matches, teamId)` | Enrichit avec données calculées | `EnrichedMatch[]` |
| `filterMatchesByPeriod(matches, period)` | Filtre par période | `EnrichedMatch[]` |
| `sortMatches(matches, sortBy)` | Trie les matchs | `EnrichedMatch[]` |
| `groupMatchesBySeason(matches)` | Groupe par saison | `Map<string, EnrichedMatch[]>` |
| `groupMatchesByCompetition(matches)` | Groupe par compétition | `Map<string, EnrichedMatch[]>` |
| `calculatePlayerAge(birthDate)` | Calcule l'âge | `number` |
| `determineContractStatus(endDate?)` | Statut du contrat | `'VALID' \| 'EXPIRING' \| 'EXPIRED'` |

---

## 🎯 Prochaines étapes

1. ✅ Le service est prêt à l'emploi
2. Remplacer progressivement les appels dans les composants existants
3. Utiliser le service pour tous les nouveaux composants Coach
4. Étendre avec de nouvelles méthodes si nécessaire

---

## 💡 Conseils

- **Ne pas modifier les données backend** dans le service (read-only)
- **Utiliser les signals Angular** dans les composants pour la réactivité
- **Logger les erreurs** pour faciliter le debug
- **Tester avec les données réelles** du backend

---

Bon développement ! 🚀
