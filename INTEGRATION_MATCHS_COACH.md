# Intégration des Matchs de l'Équipe du Coach

## 📋 Vue d'ensemble

Implémentation de l'affichage des matchs d'une équipe dans le calendrier coach basé sur le `team_id` du coach connecté.

## ✅ Modifications Réalisées

### 1. Service MatchService (Déjà Existant)

**Fichier:** `src/app/service/match.service.ts`

Le service dispose déjà des méthodes nécessaires :

```typescript
// Récupérer les matchs d'une équipe
getMatchesForTeam(teamId: string, opts: { 
  status: 'UPCOMING' | 'PLAYED'; 
  competitionId?: string; 
  seasonId?: string 
}): Observable<MatchItem[]>

// Endpoint: GET /teams/:teamId/matches?status=...&competition_id=...&season_id=...
```

### 2. Composant CoachMatchesComponent Modifié

**Fichier:** `src/app/pages/coach-matches/coach-matches.component.ts`

#### Imports ajoutés :
```typescript
import { MatchService, MatchItem } from '../../service/match.service';
import { AuthService } from '../../service/auth.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
```

#### Services injectés :
```typescript
private matchService = inject(MatchService);
private authService = inject(AuthService);
```

#### Nouvelles propriétés :
```typescript
loading = false;
error: string | null = null;
```

#### Méthode `loadMatches()` remplacée :

```typescript
loadMatches() {
  this.loading = true;
  this.error = null;
  
  const currentUser = this.authService.currentUser;
  const userTeamId = this.teamId || currentUser?.team_id;
  
  if (!userTeamId) {
    this.error = 'Aucune équipe assignée à votre compte coach';
    this.loading = false;
    this.groupedMatches$ = of({});
    return;
  }
  
  // Charger matchs à venir et joués en parallèle
  Promise.all([
    this.matchService.getMatchesForTeam(userTeamId, { status: 'UPCOMING' }).toPromise(),
    this.matchService.getMatchesForTeam(userTeamId, { status: 'PLAYED' }).toPromise()
  ]).then(([upcomingMatches, playedMatches]) => {
    const allApiMatches = [...(upcomingMatches || []), ...(playedMatches || [])];
    const coachMatches = this.convertToCoachMatches(allApiMatches, userTeamId);
    
    this.groupedMatches$ = of(coachMatches).pipe(
      map(matches => {
        const filtered = this.applyFilters(matches);
        return this.groupMatchesByCompetition(filtered);
      })
    );
    
    this.loading = false;
  }).catch(err => {
    console.error('Erreur:', err);
    this.error = 'Impossible de charger les matchs';
    this.loading = false;
  });
}
```

#### Nouvelle méthode `convertToCoachMatches()` :

Convertit les données API (`MatchItem[]`) vers le format coach (`CoachMatch[]`) :

```typescript
convertToCoachMatches(apiMatches: MatchItem[], myTeamId: string): CoachMatch[] {
  return apiMatches.map(match => {
    const isHome = match.homeAway === 'HOME';
    const status = match.status === 'UPCOMING' ? 'UPCOMING' : 'COMPLETED';
    
    return {
      id: match.id,
      competition: {
        name: match.competition.name,
        type: match.competition.type
      },
      homeTeam: {
        id: isHome ? myTeamId : match.opponent.id,
        name: isHome ? 'Mon Équipe' : match.opponent.name,
        logo: isHome ? undefined : match.opponent.logo
      },
      awayTeam: {
        id: isHome ? match.opponent.id : myTeamId,
        name: isHome ? match.opponent.name : 'Mon Équipe',
        logo: isHome ? match.opponent.logo : undefined
      },
      scheduledAt: match.scheduledAt,
      stadium: { name: match.stadium.name, address: '' },
      status: status,
      score: match.score,
      isHomeTeam: isHome,
      opponent: {
        name: match.opponent.name,
        logo: match.opponent.logo
      },
      teamSheetSubmitted: false,
      teamSheetStatus: 'PENDING'
    };
  });
}
```

## 🔄 Flux de Données

```
1. Coach se connecte
   ↓
2. Redirection vers /mon-equipe/matchs
   ↓
3. CoachMatchesComponent.ngOnInit()
   ↓
4. loadMatches() récupère team_id
   ↓
5. Appels API parallèles:
   - GET /teams/:id/matches?status=UPCOMING
   - GET /teams/:id/matches?status=PLAYED
   ↓
6. Conversion des données (MatchItem → CoachMatch)
   ↓
7. Application des filtres (statut, compétition, mois)
   ↓
8. Groupement par compétition
   ↓
9. Affichage dans le calendrier
```

## 📊 Transformation des Données

### Format API (MatchItem)
```typescript
{
  id: "m123",
  competition: { id: "c1", name: "Championnat D1", type: "LEAGUE" },
  opponent: { id: "t456", name: "Adversaire FC", logo: "..." },
  homeAway: "HOME",
  stadium: { id: "s789", name: "Stade Municipal" },
  scheduledAt: "2024-10-20T15:00:00Z",
  status: "UPCOMING",
  score: { home: 2, away: 1 }
}
```

### Format Coach (CoachMatch)
```typescript
{
  id: "m123",
  competition: { name: "Championnat D1", type: "LEAGUE" },
  homeTeam: { id: "my-team", name: "Mon Équipe", logo: undefined },
  awayTeam: { id: "t456", name: "Adversaire FC", logo: "..." },
  scheduledAt: "2024-10-20T15:00:00Z",
  stadium: { name: "Stade Municipal", address: "" },
  status: "UPCOMING",
  score: { home: 2, away: 1 },
  isHomeTeam: true,
  opponent: { name: "Adversaire FC", logo: "..." },
  teamSheetSubmitted: false,
  teamSheetStatus: "PENDING"
}
```

## 🛠️ Endpoints API Requis

### Backend doit exposer :

**1. GET /teams/:teamId/matches**
```
Query params:
  - status: 'UPCOMING' | 'PLAYED' (required)
  - competition_id: string (optional)
  - season_id: string (optional)

Response:
{
  "data": {
    "matches": [
      {
        "id": "m123",
        "competition": {
          "id": "c1",
          "name": "Championnat D1",
          "type": "LEAGUE"
        },
        "opponent": {
          "id": "t456",
          "name": "Adversaire FC",
          "logo": "https://..."
        },
        "homeAway": "HOME" | "AWAY",
        "stadium": {
          "id": "s789",
          "name": "Stade Municipal"
        },
        "scheduledAt": "2024-10-20T15:00:00Z",
        "status": "UPCOMING" | "PLAYED",
        "score": {
          "home": 2,
          "away": 1
        },
        "phase": "1/4 finale" // Pour les coupes
      }
    ]
  }
}
```

## 🎨 Fonctionnalités du Composant

### Filtres Disponibles :
1. **Par Statut** : À venir, Terminés, Tous
2. **Par Compétition** : Championnat, Coupe, etc.
3. **Par Mois** : Septembre à Mai

### Affichage :
- Groupement par compétition
- Indication domicile/extérieur
- Score pour les matchs terminés
- Statut de la feuille de match
- Actions : Voir détails, Soumettre feuille de match

### États :
- **Loading** : Chargement des données
- **Error** : Erreur lors du chargement
- **Empty** : Aucun match trouvé
- **Data** : Matchs affichés

## 📝 Exemple d'utilisation

### Dans un autre composant coach :

```typescript
import { MatchService } from '../../service/match.service';
import { AuthService } from '../../service/auth.service';

export class MonComposant {
  constructor(
    private matchService: MatchService,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    const teamId = this.authService.currentUser?.team_id;
    
    if (teamId) {
      // Récupérer les prochains matchs
      this.matchService.getMatchesForTeam(teamId, { 
        status: 'UPCOMING' 
      }).subscribe(matches => {
        console.log('Prochains matchs:', matches);
      });
      
      // Récupérer les matchs d'une compétition spécifique
      this.matchService.getMatchesForTeam(teamId, { 
        status: 'UPCOMING',
        competitionId: 'c123'
      }).subscribe(matches => {
        console.log('Matchs de la compétition:', matches);
      });
      
      // Récupérer les matchs d'une saison
      this.matchService.getMatchesForTeam(teamId, { 
        status: 'PLAYED',
        seasonId: 's2024'
      }).subscribe(matches => {
        console.log('Matchs de la saison:', matches);
      });
    }
  }
}
```

## ✅ Points de Vérification

### Backend :
- [ ] Endpoint `/teams/:id/matches` implémenté
- [ ] Filtres par status, competition_id, season_id fonctionnels
- [ ] Format de réponse correct (voir ci-dessus)
- [ ] Gestion des erreurs (404, 403, etc.)

### Frontend :
- [x] Service MatchService avec méthode `getMatchesForTeam()`
- [x] CoachMatchesComponent modifié pour utiliser l'API
- [x] Conversion des données API → Format Coach
- [x] Gestion du loading state
- [x] Gestion des erreurs
- [x] Affichage des matchs groupés par compétition

## 🐛 Debugging

### Les matchs ne s'affichent pas :
1. Vérifier que `user.team_id` existe dans le profil coach
2. Vérifier l'endpoint `/teams/:id/matches` dans Network DevTools
3. Vérifier la console pour les erreurs
4. Vérifier que le JWT est envoyé dans les headers

### Format de données incorrect :
1. Vérifier la structure de la réponse API
2. Adapter la méthode `convertToCoachMatches()` si nécessaire
3. Vérifier les types dans l'interface `MatchItem`

## 📈 Améliorations Futures

1. **Cache** : Mettre en cache les matchs pour éviter les appels répétés
2. **Rafraîchissement automatique** : Polling toutes les X minutes
3. **Notifications** : Alertes pour les nouveaux matchs
4. **Export** : Export du calendrier au format PDF/ICS
5. **Statistiques** : Graphiques de performance sur la saison
