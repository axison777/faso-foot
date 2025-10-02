# Documentation - Espaces Dédiés (Mon Club / Mon Équipe)

## Vue d'ensemble

Cette implémentation ajoute deux espaces dédiés à l'application Angular :
- **Espace Responsable de Club** (`/mon-club`) : Vue globale du club avec toutes ses équipes
- **Espace Coach** (`/mon-equipe`) : Vue focalisée sur une équipe spécifique

## Structure des fichiers créés

### Modèles de données
- `src/app/models/dashboard.model.ts` : Interfaces TypeScript pour les dashboards
  - `ClubDashboard`, `ClubStats`, `TeamStats`
  - `MatchListItem`, `StandingItem`

### Services enrichis
- `src/app/service/club.service.ts` : Méthodes ajoutées
  - `getMyClub()` : Récupère les données du club de l'utilisateur connecté
  - `getClubStats(clubId, filters?)` : Statistiques globales du club
  
- `src/app/service/equipe.service.ts` : Méthodes ajoutées
  - `getMyTeam()` : Récupère l'équipe rattachée au coach
  - `getTeamStats(teamId, filters?)` : Statistiques d'une équipe
  
- `src/app/service/match.service.ts` : Méthodes ajoutées
  - `getUpcomingMatchForTeam(teamId)` : Prochain match d'une équipe
  - `getMatchesForTeam(teamId, filters?)` : Liste des matchs avec filtres
  - `getCompetitionPhases(teamId, filters?)` : Phases de compétition (coupes)

### Composants réutilisables
Tous dans `src/app/components/dashboard/` :

1. **NextMatchCardComponent** : Carte du prochain match
   - Affichage : date, heure, adversaire, stade
   - Badge domicile/extérieur
   - Countdown "J-X"

2. **TeamStatsCardComponent** : Statistiques d'une équipe
   - Matchs joués, Victoires, Nuls, Défaites
   - Buts marqués/encaissés
   - Forme récente (5 derniers matchs)

3. **ClubStatsCardComponent** : Statistiques globales du club
   - Agrégation de toutes les équipes
   - Total matchs, V/N/D, buts
   - Classement optionnel

4. **CompetitionFilterComponent** : Sélecteur de compétition
   - Dropdown avec icônes (ligue/coupe/tournoi)
   - Filtre par compétition

5. **MatchesListComponent** : Liste des matchs avec tabs
   - Onglet "À jouer" / "Joués"
   - Table responsive avec colonnes : N°, Date, Heure, Adversaire, Stade, Résultat
   - Filtre par compétition
   - Affichage phase si coupe

### Pages principales

#### Espace Club (`/mon-club`)
- `src/app/pages/club-dashboard/`
  - `club-dashboard.component.ts`
  - `club-dashboard.component.html`
  - `club-dashboard.component.scss`

**Fonctionnalités :**
- En-tête avec nom et logo du club
- Stats globales du club (ClubStatsCard)
- Tabs pour chaque équipe du club
- Pour chaque équipe :
  - Bandeau équipe (nom, catégorie, logo)
  - Prochain match (NextMatchCard)
  - Stats équipe (TeamStatsCard)
  - Liste matchs (MatchesList)

#### Espace Coach (`/mon-equipe`)
- `src/app/pages/coach-dashboard/`
  - `coach-dashboard.component.ts`
  - `coach-dashboard.component.html`
  - `coach-dashboard.component.scss`

**Fonctionnalités :**
- En-tête équipe (nom, logo, catégorie, club)
- Prochain match (NextMatchCard)
- Stats équipe (TeamStatsCard)
- Quick stats (différence de buts, nb joueurs)
- Liste matchs (MatchesList)

### Routes
Routes ajoutées dans `src/app.routes.ts` :
```typescript
{path: 'mon-club', component: ClubDashboardComponent, canActivate: [AuthGuard] }
{path: 'mon-equipe', component: CoachDashboardComponent, canActivate: [AuthGuard] }
```

## Permissions UI

Utilisation de la directive `HasPermissionDirective` :

### Slugs de permissions requis
- `acceder-espace-club` : Accès à `/mon-club`
- `acceder-espace-coach` : Accès à `/mon-equipe`
- `voir-matchs` : Affichage de la liste des matchs
- `voir-equipe` : Affichage des données équipe
- `voir-club` : Affichage des données club

### Exemples d'utilisation
```html
<div *hasPermission="'acceder-espace-club'">
  <!-- Contenu espace club -->
</div>

<app-matches-list *hasPermission="'voir-matchs'" [teamId]="teamId">
</app-matches-list>
```

## Intégration API (Backend requis)

### Endpoints à implémenter côté backend

#### Club
- `GET /clubs/my-club` : Renvoie le club de l'utilisateur connecté
- `GET /clubs/:id/stats?seasonId=xxx` : Stats globales du club

#### Équipe
- `GET /teams/my-team` : Renvoie l'équipe du coach connecté
- `GET /teams/:id/stats?seasonId=xxx&competitionId=xxx` : Stats de l'équipe

#### Matchs
- `GET /teams/:teamId/next-match` : Prochain match de l'équipe
- `GET /teams/:teamId/matches?status=UPCOMING|PLAYED&competitionId=xxx&seasonId=xxx` : Liste matchs
- `GET /teams/:teamId/competition-phases?competitionId=xxx` : Phases de compétition

### Formats de réponse attendus

**ClubDashboard :**
```json
{
  "id": "uuid",
  "name": "FC Example",
  "logo": "url",
  "teams": [
    {
      "id": "uuid",
      "name": "FC Example U19",
      "logo": "url",
      "category": { "id": "uuid", "name": "U19" }
    }
  ]
}
```

**TeamStats :**
```json
{
  "teamId": "uuid",
  "played": 10,
  "wins": 6,
  "draws": 2,
  "losses": 2,
  "goalsFor": 18,
  "goalsAgainst": 10,
  "goalDifference": 8,
  "recentForm": ["V", "V", "N", "D", "V"]
}
```

**MatchListItem :**
```json
{
  "id": "uuid",
  "number": 5,
  "competition": {
    "id": "uuid",
    "name": "Championnat D1",
    "type": "LEAGUE"
  },
  "opponent": {
    "id": "uuid",
    "name": "AS Rival",
    "logo": "url"
  },
  "homeAway": "HOME",
  "stadium": { "id": "uuid", "name": "Stade Municipal" },
  "scheduledAt": "2025-10-15T15:00:00Z",
  "status": "UPCOMING",
  "score": null,
  "phase": null
}
```

## Styles et design

### Palette de couleurs (cohérente avec l'existant)
- Vert principal : `rgb(50,145,87)` / `#329157`
- Vert foncé : `rgb(22,123,74)` / `#167B4A`
- Victoire : `#22c55e`
- Nul : `#f59e0b`
- Défaite : `#dc2626`
- Fond : `#f8fafc`
- Bordures : `#e2e8f0`

### Classes CSS principales
- `.btn-primary` : Boutons verts
- `.badge` : Pills pour statut/lieu
- `.stats-card` : Cartes de statistiques
- `.matches-table` : Tableaux de matchs
- `.loading` / `.no-results` : États vides

### Responsive
- Desktop : Grilles 4 colonnes (stats)
- Tablet (< 1024px) : Grilles 2 colonnes
- Mobile (< 768px) : 1 colonne, cartes empilées

## Tests suggérés

1. **Navigation**
   - Utilisateur "Responsable" accède à `/mon-club`
   - Utilisateur "Coach" accède à `/mon-equipe`

2. **Permissions**
   - Sans `acceder-espace-club` → message "pas d'accès"
   - Sans `voir-matchs` → section matchs masquée

3. **Données**
   - Club avec 3 équipes → 3 tabs affichés
   - Prochain match existe → carte verte affichée
   - Aucun match → "Aucun match programmé"

4. **Filtres**
   - Sélection compétition → liste matchs mise à jour
   - Changement tab À jouer/Joués → chargement différent

5. **Responsive**
   - Mobile → cartes en 1 colonne
   - Desktop → grilles multiples colonnes

## Dépendances

Aucune nouvelle dépendance ajoutée. Utilisation exclusive de :
- Angular 19 standalone
- PrimeNG (déjà présent)
- Modules standards : CommonModule, FormsModule, ReactiveFormsModule

## Points d'attention

1. **Gestion des erreurs** : Les services retournent des objets vides en cas d'erreur (évite les crashs)
2. **Loading states** : Indicateurs de chargement sur toutes les requêtes asynchrones
3. **Permissions** : Vérification UI uniquement (guards route non implémentés dans cette itération)
4. **Dates** : Format français (`fr-FR`) avec `toLocaleDateString` et `toLocaleTimeString`
5. **Images manquantes** : Placeholders avec initiales pour logos absents

## Évolutions futures possibles

- Graphiques de statistiques (chart.js, ngx-charts)
- Export PDF des stats
- Notifications temps réel (prochain match J-1)
- Historique des performances sur plusieurs saisons
- Classements détaillés par compétition
- Statistiques individuelles joueurs
