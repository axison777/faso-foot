# 📡 Endpoints API Disponibles pour le Coach

## ✅ Résumé des Découvertes

Après analyse du fichier `api_list.json`, voici les endpoints **DISPONIBLES** dans l'API backend.

---

## 🎯 1. Matchs de l'Équipe

### **GET /v1/teams/{team}/matches**

**Endpoint existant :** ✅ OUI

**Description :** Récupérer la liste des matchs d'une équipe

**Paramètres disponibles :**
- `team` (path, required) - ID de l'équipe
- `status` (query) - Statut du match
- `season_id` (query) - ID de la saison
- `date_from` (query) - Date de début
- `date_to` (query) - Date de fin
- `type` (query) - Type de match
- `pool_id` (query) - ID de la poule
- `stadium_id` (query) - ID du stade
- `match_day_id` (query) - ID de la journée

**Exemple d'appel :**
```
GET /v1/teams/123/matches?status=upcoming&season_id=456
```

**Réponse attendue :**
```json
{
  "status": true,
  "data": {
    "success": true,
    "message": "Liste des matchs récupérée avec succès",
    "data": {
      // Les matchs de l'équipe
    }
  },
  "message": 200
}
```

**✅ Modification nécessaire dans MatchService :**

Le service frontend existe déjà mais utilise un format différent. Il faut adapter :

```typescript
// Service actuel
getMatchesForTeam(teamId: string, opts: { 
  status: 'UPCOMING' | 'PLAYED'; 
  competitionId?: string; 
  seasonId?: string 
}): Observable<MatchItem[]>

// URL actuelle (incorrecte)
GET /teams/:teamId/matches

// URL correcte selon API
GET /v1/teams/:teamId/matches
```

---

## 👥 2. Joueurs de l'Équipe

### **GET /v1/teams/{teamId}/players**

**Endpoint existant :** ✅ OUI

**Description :** Liste de tous les joueurs d'une équipe

**Paramètres :**
- `teamId` (path, required) - ID de l'équipe

**Exemple d'appel :**
```
GET /v1/teams/123/players
```

**Réponse attendue :**
```json
{
  "status": true,
  "data": {
    "players": [
      {
        "id": "p1",
        "first_name": "Kylian",
        "last_name": "Mbappé",
        "jersey_number": 7,
        "position": "Attaquant",
        "birth_date": "1998-12-20",
        "nationality": "Française",
        "photo": "https://...",
        "license_number": "LIC123",
        ...
      }
    ]
  },
  "message": "succès"
}
```

**✅ Modification nécessaire dans PlayerService :**

Le service existe déjà et est correct :

```typescript
// Service actuel (CORRECT)
getByTeamId(teamId: string): Observable<any[]>

// URL actuelle
GET /teams/:teamId/players

// URL correcte (même format)
GET /v1/teams/:teamId/players
```

**⚠️ Note :** Vérifier que `environment.apiUrl` inclut `/api/v1` ou ajuster.

---

## 📋 3. Détails d'un Joueur

### **GET /v1/players/show/{id}**

**Endpoint existant :** ✅ OUI

**Description :** Récupérer les détails complets d'un joueur

**Paramètres :**
- `id` (path, required) - ID du joueur

**Exemple d'appel :**
```
GET /v1/players/show/abc-123
```

**Réponse attendue :**
```json
{
  "status": true,
  "data": {
    "player": {
      "id": "abc-123",
      "first_name": "Kylian",
      "last_name": "Mbappé",
      "jersey_number": 7,
      "position": "Attaquant",
      "birth_date": "1998-12-20",
      "nationality": "Française",
      "height": 178,
      "weight": 73,
      "photo": "https://...",
      "license_number": "LIC123",
      "team": {
        "id": "t123",
        "name": "Mon Équipe"
      },
      "statistics": {
        "matches_played": 25,
        "goals": 18,
        "assists": 12,
        "yellow_cards": 3,
        "red_cards": 0
      }
    }
  },
  "message": "Les détails du joueur ont été récupérés avec succès"
}
```

**✅ PlayerService a déjà cette méthode :**

```typescript
show(id: string): Observable<any>
// URL: GET /players/show/:id
```

---

## 🔧 Modifications Nécessaires

### 1. **MatchService** - Adapter l'URL

**Fichier:** `src/app/service/match.service.ts`

```typescript
// AVANT
getMatchesForTeam(teamId: string, opts: { ... }): Observable<MatchItem[]> {
  const url = `${environment.apiUrl}/teams/${teamId}/matches`;
  // ...
}

// APRÈS (si environment.apiUrl = "http://.../api")
getMatchesForTeam(teamId: string, opts: { ... }): Observable<MatchItem[]> {
  const url = `${environment.apiUrl}/v1/teams/${teamId}/matches`;
  // ...
}

// OU (si environment.apiUrl = "http://.../api/v1")
// Garder tel quel
```

### 2. **PlayerService** - Vérifier l'URL

**Fichier:** `src/app/service/player.service.ts`

```typescript
// AVANT
getByTeamId(teamId: string): Observable<any[]> {
  return this.http.get<any>(`${environment.apiUrl}/teams/${teamId}/players`);
}

// VÉRIFIER environment.apiUrl
// Si = "http://.../api" alors ajouter /v1
// Si = "http://.../api/v1" alors OK
```

### 3. **environment.ts** - Vérifier la configuration

**Fichier:** `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  // Option 1: Inclure /v1 dans apiUrl
  apiUrl: 'http://0cc7895703c7e06e842e35476157fc31.serveo.net/api/v1',
  
  // Option 2: Ajouter /v1 dans chaque service
  // apiUrl: 'http://0cc7895703c7e06e842e35476157fc31.serveo.net/api'
};
```

---

## 🎯 Tableau Récapitulatif

| Fonctionnalité | Endpoint API | Service Frontend | Status |
|---------------|-------------|------------------|--------|
| **Matchs d'équipe** | `GET /v1/teams/{team}/matches` | `MatchService.getMatchesForTeam()` | ✅ Existe (adapter URL) |
| **Joueurs d'équipe** | `GET /v1/teams/{teamId}/players` | `PlayerService.getByTeamId()` | ✅ Existe (vérifier URL) |
| **Détails joueur** | `GET /v1/players/show/{id}` | `PlayerService.show()` | ✅ Existe |
| **Staff d'équipe** | `GET /v1/teams/{teamId}/staffs` | `EquipeService.getStaff()` | ✅ Existe |

---

## 🚀 Plan d'Action

### Étape 1 : Vérifier environment.apiUrl ✅
```typescript
// src/environments/environment.ts
apiUrl: 'http://.../api/v1'  // Inclure /v1 dans la base URL
```

### Étape 2 : Tester l'endpoint matchs
```typescript
// Dans CoachMatchesComponent
const teamId = this.authService.currentUser?.team_id;
this.matchService.getMatchesForTeam(teamId, { 
  status: 'UPCOMING' 
}).subscribe(matches => {
  console.log('Matchs:', matches);
});
```

### Étape 3 : Tester l'endpoint joueurs
```typescript
// Dans CoachPlayersComponent
const teamId = this.authService.currentUser?.team_id;
this.playerService.getByTeamId(teamId).subscribe(players => {
  console.log('Joueurs:', players);
});
```

### Étape 4 : Adapter le format de réponse si nécessaire

Si la structure de réponse est différente, adapter les méthodes `map()` :

```typescript
getMatchesForTeam(teamId: string, opts: any): Observable<MatchItem[]> {
  return this.http.get<any>(url, { params }).pipe(
    map(res => {
      // Adapter selon la réponse réelle
      if (res?.data?.data?.matches) {
        return res.data.data.matches;
      }
      if (res?.data?.matches) {
        return res.data.matches;
      }
      return res?.data || [];
    })
  );
}
```

---

## 📝 Exemple d'Utilisation Complète

### Dans CoachDashboardV2Component :

```typescript
ngOnInit() {
  const teamId = this.authService.currentUser?.team_id;
  
  if (teamId) {
    // Charger l'équipe
    this.equipeService.getTeamById(teamId).subscribe(team => {
      this.team = team;
    });
    
    // Charger les matchs à venir
    this.matchService.getMatchesForTeam(teamId, { 
      status: 'UPCOMING' 
    }).subscribe(matches => {
      this.upcomingMatches = matches;
    });
    
    // Charger les joueurs
    this.playerService.getByTeamId(teamId).subscribe(players => {
      this.players = players;
      this.playerCount = players.length;
    });
    
    // Charger le staff
    this.equipeService.getStaff(teamId).subscribe(staff => {
      this.staff = staff;
    });
  }
}
```

---

## ✅ Conclusion

**Tous les endpoints nécessaires existent dans l'API !**

Les seules modifications à faire :
1. ✅ Vérifier que `environment.apiUrl` inclut `/v1`
2. ✅ Tester les appels API
3. ✅ Adapter le parsing des réponses si nécessaire

Le code frontend est déjà prêt, il suffit de s'assurer que les URLs correspondent exactement à celles du backend.
