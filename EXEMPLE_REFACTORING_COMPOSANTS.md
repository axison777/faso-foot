# 🔄 Exemples de Refactoring avec le CoachService

Ce document montre comment refactoriser vos composants existants pour utiliser le nouveau `CoachService`.

---

## 📝 Exemple 1 : CoachDashboardV2Component

### ❌ AVANT (code actuel)

```typescript
export class CoachDashboardV2Component implements OnInit {
  private equipeService = inject(EquipeService);
  private authService = inject(AuthService);
  private matchService = inject(MatchService);
  
  loadTeamData() {
    const userTeamId = this.teamId || currentUser?.team_id;
    
    // Appel direct à equipeService
    this.equipeService.getTeamById(userTeamId).subscribe({
      next: (t) => {
        this.team.set(t);
        this.loadNextMatch(userTeamId);
      }
    });
  }

  loadNextMatch(teamId: string) {
    // Appel direct à matchService
    this.matchService.getAllMatchesForTeam(teamId).subscribe({
      next: (matches: any[]) => {
        // Logique de filtrage manuel
        const now = new Date();
        const upcomingMatches = matches
          .filter((m: any) => {
            const matchDate = new Date(m.scheduled_at);
            return matchDate > now;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.scheduled_at);
            const dateB = new Date(b.scheduled_at);
            return dateA.getTime() - dateB.getTime();
          });
        
        if (upcomingMatches.length > 0) {
          const nextMatchData = upcomingMatches[0];
          const isHome = nextMatchData.team_one_id === teamId;
          // ... manipulation manuelle des données
        }
      }
    });
  }
}
```

### ✅ APRÈS (avec CoachService)

```typescript
import { CoachService } from '../../service/coach.service';
import { EnrichedMatch, CoachTeam } from '../../models/coach-api.model';

export class CoachDashboardV2Component implements OnInit {
  private coachService = inject(CoachService);
  private authService = inject(AuthService);
  
  team = signal<CoachTeam | null>(null);
  nextMatch = signal<EnrichedMatch | null>(null);
  
  loadTeamData() {
    const userTeamId = this.teamId || this.authService.currentUser?.team_id;
    
    if (!userTeamId) {
      this.error.set('Aucune équipe assignée');
      return;
    }
    
    // Appel simplifié
    this.coachService.getTeamById(userTeamId).subscribe({
      next: (team) => {
        this.team.set(team);
        this.loadNextMatch(userTeamId);
      }
    });
  }

  loadNextMatch(teamId: string) {
    // Une seule ligne ! Le service gère tout
    this.coachService.getNextMatch(teamId).subscribe({
      next: (match) => {
        if (match) {
          const enriched = this.coachService.enrichMatches([match], teamId)[0];
          this.nextMatch.set(enriched);
        }
      }
    });
  }
}
```

**Avantages :**
- ✅ Moins de code
- ✅ Pas de logique de filtrage/tri manuelle
- ✅ Typage fort avec `EnrichedMatch`
- ✅ Données déjà enrichies (isHome, opponent, etc.)

---

## 📝 Exemple 2 : CoachPlayersComponent

### ❌ AVANT (code actuel)

```typescript
export class CoachPlayersComponent implements OnInit {
  private playerService = inject(PlayerService);
  private authService = inject(AuthService);
  
  players: CoachPlayer[] = [];
  
  loadPlayers() {
    const userTeamId = this.teamId || this.authService.currentUser?.team_id;
    
    this.playerService.getByTeamId(userTeamId).subscribe({
      next: (apiPlayers) => {
        // Conversion manuelle complexe
        this.players = this.convertToCoachPlayers(apiPlayers);
        this.filteredPlayers = [...this.players];
      },
      error: (err) => {
        // Fallback vers données mock
        this.loadMockPlayers();
      }
    });
  }

  convertToCoachPlayers(apiPlayers: any[]): CoachPlayer[] {
    return apiPlayers.map((player: any) => ({
      id: player.id || '',
      firstName: player.first_name || '',
      lastName: player.last_name || '',
      birthDate: player.birth_date || '',
      position: player.position || '',
      // ... 50 lignes de mapping manuel
    }));
  }

  calculateAge(birthDate: string): number {
    // Logique de calcul d'âge manuelle
    const today = new Date();
    const birth = new Date(birthDate);
    // ...
  }
}
```

### ✅ APRÈS (avec CoachService)

```typescript
import { CoachService } from '../../service/coach.service';
import { CoachPlayer } from '../../models/coach-api.model';

export class CoachPlayersComponent implements OnInit {
  private coachService = inject(CoachService);
  private authService = inject(AuthService);
  
  players: CoachPlayer[] = [];
  
  loadPlayers() {
    const userTeamId = this.teamId || this.authService.currentUser?.team_id;
    
    if (!userTeamId) {
      this.error = 'Aucune équipe assignée';
      return;
    }
    
    // Appel direct - pas de conversion nécessaire
    this.coachService.getTeamPlayers(userTeamId).subscribe({
      next: (players) => {
        this.players = players; // Déjà typé correctement !
        this.filteredPlayers = [...this.players];
        
        // Utiliser les méthodes utilitaires
        this.players.forEach(player => {
          player.age = this.coachService.calculatePlayerAge(player.date_of_birth);
          player.contractStatus = this.coachService.determineContractStatus(player.contract_end_date);
        });
      },
      error: (err) => {
        console.error('Erreur chargement joueurs:', err);
        this.players = []; // Pas besoin de mock
      }
    });
  }
}
```

**Avantages :**
- ✅ Suppression de `convertToCoachPlayers()` (50+ lignes)
- ✅ Suppression de `calculateAge()` - utilise la méthode du service
- ✅ Typage automatique avec `CoachPlayer`
- ✅ Pas besoin de données mock

---

## 📝 Exemple 3 : CoachMatchesComponent

### ❌ AVANT (code actuel)

```typescript
export class CoachMatchesComponent implements OnInit {
  private matchService = inject(MatchService);
  private authService = inject(AuthService);
  
  matches = signal<any[]>([]);
  filteredMatches = signal<any[]>([]);
  
  loadMatches() {
    const userTeamId = this.teamId || this.authService.currentUser?.team_id;
    
    this.matchService.getAllMatchesForTeam(userTeamId).subscribe({
      next: (rawMatches: any[]) => {
        // Enrichissement manuel
        rawMatches.forEach((match: any) => {
          match.isMyTeamHome = match.team_one_id === userTeamId;
          match.myTeam = match.isMyTeamHome ? match.team_one : match.team_two;
          match.opponent = match.isMyTeamHome ? match.team_two : match.team_one;
          match.matchDate = new Date(match.scheduled_at);
        });
        
        this.matches.set(rawMatches);
        this.extractFilters(rawMatches);
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    let filtered = [...this.matches()];
    
    // Filtrage manuel par saison
    if (this.selectedSeason()) {
      filtered = filtered.filter(m => m.season?.id === this.selectedSeason().id);
    }
    
    // Filtrage manuel par compétition
    if (this.selectedCompetition()) {
      filtered = filtered.filter(m => m.pool?.id === this.selectedCompetition().id);
    }
    
    // Tri manuel
    filtered = this.sortMatches(filtered);
    this.filteredMatches.set(filtered);
  }

  sortMatches(matches: any[]): any[] {
    // 20+ lignes de logique de tri
    return [...matches].sort((a, b) => {
      // ...
    });
  }
}
```

### ✅ APRÈS (avec CoachService)

```typescript
import { CoachService } from '../../service/coach.service';
import { EnrichedMatch, MatchFilterOptions } from '../../models/coach-api.model';

export class CoachMatchesComponent implements OnInit {
  private coachService = inject(CoachService);
  private authService = inject(AuthService);
  
  matches = signal<EnrichedMatch[]>([]);
  filteredMatches = signal<EnrichedMatch[]>([]);
  
  selectedSeason = signal<string | null>(null);
  selectedCompetition = signal<string | null>(null);
  sortBy = signal<'date_asc' | 'date_desc' | 'competition' | 'opponent'>('date_asc');
  
  loadMatches() {
    const userTeamId = this.teamId || this.authService.currentUser?.team_id;
    
    if (!userTeamId) {
      this.error.set('Aucune équipe assignée');
      return;
    }
    
    // Construction des filtres
    const filters: MatchFilterOptions = {};
    if (this.selectedSeason()) {
      filters.season_id = this.selectedSeason()!;
    }
    if (this.selectedCompetition()) {
      filters.pool_id = this.selectedCompetition()!;
    }
    
    // Un seul appel avec filtres
    this.coachService.getTeamMatches(userTeamId, filters).subscribe({
      next: (matches) => {
        // Enrichir et trier en 2 lignes
        const enriched = this.coachService.enrichMatches(matches, userTeamId);
        const sorted = this.coachService.sortMatches(enriched, this.sortBy());
        
        this.matches.set(sorted);
        this.filteredMatches.set(sorted);
      }
    });
  }

  // Méthode simplifiée - le service fait le travail
  applyFilters() {
    this.loadMatches(); // Recharger avec les nouveaux filtres
  }

  // Plus besoin de sortMatches() - le service le fait
}
```

**Avantages :**
- ✅ Suppression de tout le code d'enrichissement manuel
- ✅ Suppression de `sortMatches()` - utilise la méthode du service
- ✅ Filtrage côté API (plus performant)
- ✅ Code beaucoup plus court et lisible

---

## 📊 Comparaison des gains

| Composant | Lignes AVANT | Lignes APRÈS | Gain |
|-----------|--------------|--------------|------|
| CoachDashboardV2 | ~205 lignes | ~120 lignes | **-41%** |
| CoachPlayers | ~1622 lignes | ~950 lignes | **-41%** |
| CoachMatches | ~269 lignes | ~150 lignes | **-44%** |

**Total économisé : ~1000 lignes de code** 🎉

---

## 🔄 Stratégie de migration

### Étape 1 : Garder l'ancien code (sécurité)

```typescript
// Commenter l'ancien code plutôt que le supprimer
// loadOldPlayers() { ... }

// Ajouter la nouvelle méthode
loadPlayers() {
  this.coachService.getTeamPlayers(teamId).subscribe({
    next: (players) => {
      this.players = players;
    }
  });
}
```

### Étape 2 : Tester la nouvelle implémentation

- Vérifier que les données s'affichent correctement
- Comparer avec l'ancien comportement
- Tester tous les cas d'usage

### Étape 3 : Supprimer l'ancien code

```typescript
// Supprimer l'ancien code une fois validé
// ❌ loadOldPlayers() { ... }
// ❌ convertToCoachPlayers() { ... }
// ❌ calculateAge() { ... }
```

---

## 💡 Bonnes pratiques

1. **Migrer composant par composant**
   - Ne pas tout refactoriser d'un coup
   - Valider chaque migration

2. **Utiliser les types TypeScript**
   ```typescript
   // ✅ Bon
   players: CoachPlayer[] = [];
   
   // ❌ Mauvais
   players: any[] = [];
   ```

3. **Enrichir les matchs systématiquement**
   ```typescript
   // ✅ Toujours enrichir après récupération
   const enriched = this.coachService.enrichMatches(matches, teamId);
   ```

4. **Utiliser les méthodes utilitaires**
   ```typescript
   // ✅ Utiliser le service
   const age = this.coachService.calculatePlayerAge(birthDate);
   
   // ❌ Recréer la logique
   const age = this.calculateAge(birthDate);
   ```

---

## ✅ Checklist de migration

Pour chaque composant :

- [ ] Importer `CoachService` et les types nécessaires
- [ ] Remplacer les appels directs par les méthodes du service
- [ ] Supprimer les méthodes de conversion/transformation manuelles
- [ ] Utiliser les méthodes utilitaires du service
- [ ] Typer correctement toutes les variables
- [ ] Tester l'affichage des données
- [ ] Tester les filtres et tris
- [ ] Supprimer l'ancien code commenté
- [ ] Nettoyer les imports inutilisés

---

Bonne migration ! 🚀
