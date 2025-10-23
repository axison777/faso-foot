# Implémentation Redirection et Affichage Coach

## 📋 Vue d'ensemble

Ce document décrit l'implémentation du système de redirection et d'affichage des données pour les coachs connectés.

## 🎯 Objectif

Lorsqu'un coach se connecte, il doit :
1. ✅ Être redirigé vers `/mon-equipe/dashboard`
2. ✅ Voir uniquement les données de SON équipe (basé sur son `team_id`)
3. ✅ Accéder à ses joueurs, matchs et statistiques

## 🔧 Architecture

### 1. Modèle Utilisateur Coach

Le coach possède dans son profil utilisateur :
```typescript
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  team_id?: string;        // ✅ ID de l'équipe du coach
  coach_id?: string;       // ✅ ID du coach (staff)
  is_coach?: boolean;      // ✅ Indicateur coach
  ...
}
```

### 2. Service d'Authentification

**Fichier:** `src/app/service/auth.service.ts`

L'AuthService stocke l'utilisateur connecté et expose `currentUser`.

### 3. Redirection lors du Login

**Fichier:** `src/app/pages/login/login.component.ts`

```typescript
// Lignes 61-62 et 102-104
if (user?.is_coach === true || user?.is_coach === 1) {
  this.router.navigate(['/mon-equipe/dashboard']);
}
```

### 4. Routes Protégées

**Fichier:** `src/app.routes.ts`

```typescript
{
  path: 'mon-equipe',
  component: CoachLayout,
  canActivate: [AuthGuard],  // ✅ Protection par authentification
  children: [
    { path: 'dashboard', component: CoachDashboardV2Component },
    { path: 'matchs', component: CoachMatchesComponent },
    { path: 'joueurs', component: CoachPlayersComponent }
  ]
}
```

## 📊 Services Implémentés

### EquipeService

**Fichier:** `src/app/service/equipe.service.ts`

#### Méthodes principales :

1. **getMyTeam()** : Récupère l'équipe du coach connecté
   ```typescript
   getMyTeam(): Observable<Equipe>
   // Endpoint: GET /teams/me
   ```

2. **getTeamById(teamId)** : Récupère une équipe par son ID
   ```typescript
   getTeamById(teamId: string): Observable<Equipe>
   // Endpoint: GET /teams/:id
   ```

3. **getTeamStats(teamId)** : Récupère les statistiques d'une équipe
   ```typescript
   getTeamStats(teamId: string, opts?: {...}): Observable<TeamStats>
   // Endpoint: GET /teams/:id/stats
   ```

### PlayerService

**Fichier:** `src/app/service/player.service.ts`

#### Méthodes principales :

1. **getByTeamId(teamId)** : Récupère tous les joueurs d'une équipe
   ```typescript
   getByTeamId(teamId: string): Observable<any[]>
   // Endpoint: GET /teams/:id/players
   ```

## 🎨 Composants Implémentés

### CoachDashboardV2Component

**Fichier:** `src/app/pages/coach-dashboard-v2/coach-dashboard-v2.component.ts`

#### Fonctionnalités :
- ✅ Récupère automatiquement le `team_id` du coach connecté
- ✅ Charge les données de l'équipe via `getTeamById()`
- ✅ Affiche les informations de l'équipe
- ✅ Gère les erreurs (équipe non assignée)

#### Code clé :

```typescript
loadTeamData() {
  const currentUser = this.authService.currentUser;
  const userTeamId = this.teamId || currentUser?.team_id;
  
  if (!userTeamId) {
    this.error.set('Aucune équipe assignée à votre compte coach');
    return;
  }
  
  this.equipeService.getTeamById(userTeamId).subscribe({
    next: (team) => {
      // Afficher les données de l'équipe
      this.team.set(team);
      this.teamData.set({
        id: team.id,
        name: team.name,
        coach: { name: currentUser.first_name + ' ' + currentUser.last_name },
        ...
      });
    },
    error: (err) => {
      this.error.set('Impossible de charger les données de l\'équipe');
    }
  });
}
```

### CoachPlayersComponent

**Fichier:** `src/app/pages/coach-players/coach-players.component.ts`

#### Utilisation :
Pour afficher les joueurs de l'équipe du coach :

```typescript
const teamId = this.authService.currentUser?.team_id;
if (teamId) {
  this.playerService.getByTeamId(teamId).subscribe(players => {
    this.players = players;
  });
}
```

### CoachMatchesComponent

**Fichier:** `src/app/pages/coach-matches/coach-matches.component.ts`

#### Utilisation :
Pour afficher les matchs de l'équipe du coach, utiliser le même pattern avec `team_id`.

## 🔄 Flux de Connexion

```
1. Coach saisit email/password
   ↓
2. AuthService.login() → API
   ↓
3. API retourne: { user: { team_id: "123", is_coach: true } }
   ↓
4. AuthService stocke user
   ↓
5. LoginComponent vérifie is_coach
   ↓
6. Router.navigate('/mon-equipe/dashboard')
   ↓
7. CoachDashboardV2 charge
   ↓
8. Récupère currentUser.team_id
   ↓
9. EquipeService.getTeamById(team_id)
   ↓
10. API → GET /teams/123
   ↓
11. Affichage des données de l'équipe 123
```

## 🛠️ Endpoints API Nécessaires

### Backend doit exposer :

1. **GET /teams/me**
   - Retourne l'équipe du coach connecté
   - Utilise le JWT pour identifier le coach

2. **GET /teams/:id**
   - Retourne les détails d'une équipe
   - Format: `{ data: { id, name, logo, category, ... } }`

3. **GET /teams/:id/players**
   - Retourne tous les joueurs d'une équipe
   - Format: `{ data: { players: [...] } }`

4. **GET /teams/:id/stats**
   - Retourne les statistiques de l'équipe
   - Format: `{ data: { stats: { played, wins, ... } } }`

5. **GET /teams/:id/matches**
   - Retourne les matchs de l'équipe
   - Format: `{ data: { matches: [...] } }`

## ✅ Points de Vérification

### Backend :
- [ ] Endpoint `/teams/me` implémenté
- [ ] Endpoint `/teams/:id` retourne les bonnes données
- [ ] Les joueurs sont accessibles via `/teams/:id/players`
- [ ] Le `team_id` est bien retourné lors du login
- [ ] Le champ `is_coach` est présent dans la réponse user

### Frontend :
- [x] Redirection vers `/mon-equipe/dashboard` fonctionnelle
- [x] `EquipeService.getTeamById()` implémenté
- [x] Dashboard charge les données avec le `team_id`
- [x] Gestion des erreurs (équipe non assignée)
- [x] Affichage des informations de l'équipe

## 🎯 Exemple d'utilisation

### Dans n'importe quel composant coach :

```typescript
import { AuthService } from '../../service/auth.service';
import { EquipeService } from '../../service/equipe.service';
import { PlayerService } from '../../service/player.service';

export class MonComposantCoach {
  constructor(
    private authService: AuthService,
    private equipeService: EquipeService,
    private playerService: PlayerService
  ) {}
  
  ngOnInit() {
    const teamId = this.authService.currentUser?.team_id;
    
    if (teamId) {
      // Charger l'équipe
      this.equipeService.getTeamById(teamId).subscribe(team => {
        console.log('Mon équipe:', team);
      });
      
      // Charger les joueurs
      this.playerService.getByTeamId(teamId).subscribe(players => {
        console.log('Mes joueurs:', players);
      });
    }
  }
}
```

## 📝 Notes Importantes

1. **Sécurité** : Le backend doit vérifier que le coach a bien accès à l'équipe demandée
2. **Performance** : Mettre en cache les données de l'équipe pour éviter les appels répétés
3. **Erreurs** : Gérer le cas où le coach n'a pas d'équipe assignée
4. **Multi-équipes** : Si un coach gère plusieurs équipes, adapter la logique

## 🐛 Debugging

### Coach ne voit pas ses données :
1. Vérifier que `user.team_id` est présent après login
2. Vérifier l'endpoint `/teams/:id` avec le bon ID
3. Vérifier la console pour les erreurs API
4. Vérifier que le JWT est bien envoyé dans les headers

### Redirection ne fonctionne pas :
1. Vérifier `user.is_coach` dans la réponse login
2. Vérifier les routes dans `app.routes.ts`
3. Vérifier le guard `AuthGuard`
