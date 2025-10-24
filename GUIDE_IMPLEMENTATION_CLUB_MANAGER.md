# Guide d'implémentation - Gestion de Club Manager

## 📋 Vue d'ensemble

Ce guide explique comment utiliser les APIs pour la gestion des clubs par un responsable de club. Le système permet au responsable de gérer toutes les équipes de son club et le staff associé à chaque équipe.

## 🔑 Authentification et Identification

### Réponse de connexion du backend

Lors de la connexion, le responsable de club reçoit ces informations :

```json
{
  "id": "ebd9dc38-b447-42d1-8efa-822ce6167ead",
  "last_name": "Mansa",
  "first_name": "Moussa",
  "email": "rfa.responsable@gmail.com",
  "is_active": true,
  "is_club_manager": true,
  "is_coach": false,
  "is_official": false,
  "club_id": "a3e79a21-22e5-4e6c-b775-f6340f211d71",
  "coach_id": null,
  "official_id": null,
  "team_id": null,
  "roles": []
}
```

**Points importants :**
- `is_club_manager: true` → Identifie l'utilisateur comme responsable de club
- `club_id` → ID du club à gérer
- Pas de `team_id` car il gère plusieurs équipes

## 📁 Structure des fichiers créés

### 1. Modèles (`/src/app/models/club-manager-api.model.ts`)

Contient toutes les interfaces TypeScript pour :
- `ClubManagerClub` : Informations du club
- `ClubManagerTeam` : Informations d'une équipe
- `ClubManagerPlayer` : Informations d'un joueur
- `ClubManagerStaffMember` : Informations d'un membre du staff
- `ClubManagerMatch` : Informations d'un match
- Plus les interfaces pour les réponses API et les filtres

### 2. Service (`/src/app/service/club-manager.service.ts`)

Service centralisé pour tous les appels API avec les méthodes suivantes :

#### Méthodes Club
- `getClubById(clubId)` : Récupère les infos du club avec ses équipes
- `getClubTeams(clubId)` : Récupère uniquement les équipes

#### Méthodes Team
- `getTeamById(teamId)` : Récupère les infos d'une équipe
- `getTeamWithAllData(teamId)` : Récupère toutes les données (joueurs, staff, matchs)

#### Méthodes Players
- `getTeamPlayers(teamId)` : Récupère les joueurs d'une équipe
- `getPlayerDetails(playerId)` : Récupère les détails d'un joueur
- `getAllClubPlayers(clubId)` : Récupère tous les joueurs du club

#### Méthodes Staff
- `getTeamStaff(teamId)` : Récupère le staff d'une équipe
- `getAllClubStaff(clubId)` : Récupère tout le staff du club

#### Méthodes Matches
- `getTeamMatchesPaginated(teamId, filters?)` : Récupère les matchs (paginé)
- `getTeamMatches(teamId, filters?)` : Récupère les matchs (simple)
- `getUpcomingMatches(teamId)` : Récupère les matchs à venir
- `getPastMatches(teamId)` : Récupère les matchs passés
- `getNextMatch(teamId)` : Récupère le prochain match
- `getAllClubMatches(clubId, filters?)` : Récupère tous les matchs du club

#### Méthodes utilitaires
- `enrichMatches()` : Enrichit les matchs avec des données calculées
- `filterMatchesByPeriod()` : Filtre par période
- `sortMatches()` : Trie les matchs
- `calculatePlayerAge()` : Calcule l'âge d'un joueur
- `determineContractStatus()` : Détermine le statut du contrat

### 3. Composant exemple (`/src/app/pages/club-manager-dashboard/`)

Composant dashboard qui montre comment utiliser le service.

## 🚀 Utilisation du service

### Exemple 1 : Charger les données du club

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ClubManagerService } from '../../service/club-manager.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-my-component',
  standalone: true,
  // ...
})
export class MyComponent implements OnInit {
  private clubManagerService = inject(ClubManagerService);
  private authService = inject(AuthService);

  ngOnInit() {
    const user = this.authService.currentUser;
    
    if (user?.club_id) {
      // Charger le club avec toutes ses équipes
      this.clubManagerService.getClubById(user.club_id).subscribe({
        next: (club) => {
          console.log('Club chargé:', club);
          console.log('Équipes:', club.teams);
        },
        error: (err) => {
          console.error('Erreur:', err);
        }
      });
    }
  }
}
```

### Exemple 2 : Charger les données d'une équipe

```typescript
// Méthode 1 : Charger uniquement les infos de base
this.clubManagerService.getTeamById(teamId).subscribe(team => {
  console.log('Équipe:', team);
});

// Méthode 2 : Charger toutes les données en parallèle (recommandé)
this.clubManagerService.getTeamWithAllData(teamId).subscribe(teamData => {
  console.log('Équipe:', teamData);
  console.log('Joueurs:', teamData.players);
  console.log('Staff:', teamData.staff);
  console.log('Matchs à venir:', teamData.upcomingMatches);
  console.log('Matchs passés:', teamData.pastMatches);
});
```

### Exemple 3 : Gérer les joueurs

```typescript
// Récupérer les joueurs d'une équipe
this.clubManagerService.getTeamPlayers(teamId).subscribe(players => {
  console.log('Joueurs de l\'équipe:', players);
});

// Récupérer tous les joueurs du club
this.clubManagerService.getAllClubPlayers(clubId).subscribe(players => {
  console.log('Tous les joueurs du club:', players);
});

// Récupérer les détails d'un joueur
this.clubManagerService.getPlayerDetails(playerId).subscribe(player => {
  console.log('Détails du joueur:', player);
  
  // Calculer son âge
  const age = this.clubManagerService.calculatePlayerAge(player.date_of_birth);
  console.log('Âge:', age);
  
  // Vérifier le statut du contrat
  const status = this.clubManagerService.determineContractStatus(player.contract_end_date);
  console.log('Statut contrat:', status); // 'VALID', 'EXPIRING', ou 'EXPIRED'
});
```

### Exemple 4 : Gérer le staff

```typescript
// Récupérer le staff d'une équipe
this.clubManagerService.getTeamStaff(teamId).subscribe(staff => {
  console.log('Staff de l\'équipe:', staff);
});

// Récupérer tout le staff du club
this.clubManagerService.getAllClubStaff(clubId).subscribe(staff => {
  console.log('Tout le staff du club:', staff);
});
```

### Exemple 5 : Gérer les matchs

```typescript
// Récupérer les matchs avec pagination
this.clubManagerService.getTeamMatchesPaginated(teamId, {
  per_page: 20,
  page: 1,
  status: 'planned'
}).subscribe(response => {
  console.log('Matchs:', response.data);
  console.log('Pagination:', response.meta);
  console.log('Liens:', response.links);
});

// Récupérer les matchs à venir
this.clubManagerService.getUpcomingMatches(teamId).subscribe(matches => {
  console.log('Matchs à venir:', matches);
});

// Récupérer les matchs passés
this.clubManagerService.getPastMatches(teamId).subscribe(matches => {
  console.log('Matchs passés:', matches);
});

// Récupérer le prochain match
this.clubManagerService.getNextMatch(teamId).subscribe(match => {
  console.log('Prochain match:', match);
});

// Enrichir les matchs avec des données calculées
const enrichedMatches = this.clubManagerService.enrichMatches(matches, teamId);
console.log('Matchs enrichis:', enrichedMatches);

// Filtrer par période
const thisWeek = this.clubManagerService.filterMatchesByPeriod(enrichedMatches, 'week');
console.log('Matchs de la semaine:', thisWeek);

// Trier les matchs
const sorted = this.clubManagerService.sortMatches(enrichedMatches, 'date_asc');
console.log('Matchs triés:', sorted);
```

### Exemple 6 : Récupérer toutes les données d'un club

```typescript
// Récupérer tous les matchs de toutes les équipes
this.clubManagerService.getAllClubMatches(clubId, {
  status: 'planned',
  per_page: 50
}).subscribe(matches => {
  console.log('Tous les matchs du club:', matches);
});

// Récupérer tous les joueurs de toutes les équipes
this.clubManagerService.getAllClubPlayers(clubId).subscribe(players => {
  console.log('Tous les joueurs du club:', players);
});

// Récupérer tout le staff de toutes les équipes
this.clubManagerService.getAllClubStaff(clubId).subscribe(staff => {
  console.log('Tout le staff du club:', staff);
});
```

## 🔄 Flux de données

### 1. Connexion
```
Utilisateur se connecte
    ↓
AuthService récupère les infos (dont club_id)
    ↓
Logs dans la console avec club_id
    ↓
Redirection vers dashboard club manager
```

### 2. Chargement du dashboard
```
Dashboard s'initialise
    ↓
Récupère club_id de l'utilisateur connecté
    ↓
Appelle getClubById(club_id)
    ↓
Reçoit club avec liste des équipes
    ↓
Pour chaque équipe, peut charger les détails
```

### 3. Chargement d'une équipe
```
Sélection d'une équipe
    ↓
Appelle getTeamWithAllData(team_id)
    ↓
Charge en parallèle :
  - Infos de l'équipe
  - Liste des joueurs
  - Liste du staff
  - Matchs à venir
  - Matchs passés
    ↓
Affiche toutes les données
```

## 📡 Endpoints API utilisés

### Club
- `GET /api/v1/clubs/{clubId}` → Récupère le club et ses équipes

### Équipes
- `GET /api/v1/teams/{teamId}` → Récupère une équipe
- `GET /api/v1/teams/{teamId}/players` → Récupère les joueurs
- `GET /api/v1/teams/{teamId}/staffs` → Récupère le staff
- `GET /api/v1/teams/{teamId}/matches` → Récupère les matchs (avec pagination)
- `GET /api/v1/teams/{teamId}/seasons` → Récupère les saisons

### Joueurs
- `GET /api/v1/players/show/{playerId}` → Récupère un joueur

## 🎨 Fonctionnalités du service

### Cache automatique
Le service utilise un cache de 5 minutes pour éviter les requêtes répétitives :
```typescript
shareReplay(1, this.CACHE_DURATION) // 5 minutes
```

### Gestion des erreurs
Toutes les méthodes incluent une gestion d'erreur avec fallback :
```typescript
catchError((err) => {
  console.error('Erreur:', err);
  return of([]); // Retourne un tableau vide au lieu de planter
})
```

### Logs détaillés
Le service log toutes les opérations importantes pour faciliter le debug :
```typescript
console.log('🏢 [CLUB MANAGER SERVICE] Récupération du club:', clubId);
console.log('✅ [CLUB MANAGER SERVICE] Club reçu:', club);
console.log('❌ [CLUB MANAGER SERVICE] Erreur:', err);
```

### Chargement parallèle optimisé
La méthode `getTeamWithAllData()` utilise `forkJoin` pour charger toutes les données en parallèle au lieu de séquentiellement, ce qui améliore considérablement les performances.

## 🔐 Vérification des droits

Dans vos composants, vérifiez toujours que l'utilisateur est bien un responsable de club :

```typescript
ngOnInit() {
  const user = this.authService.currentUser;
  
  if (!user?.is_club_manager) {
    console.error('Utilisateur non autorisé');
    this.router.navigate(['/']);
    return;
  }
  
  if (!user.club_id) {
    console.error('Club ID manquant');
    return;
  }
  
  // Continuer le chargement...
}
```

## 📝 Conseils d'utilisation

1. **Utilisez les signals Angular** : Pour une réactivité optimale
2. **Préférez `getTeamWithAllData()`** : Pour charger toutes les données d'une équipe en une fois
3. **Utilisez la pagination** : Pour les listes de matchs longues
4. **Enrichissez les matchs** : Utilisez `enrichMatches()` pour avoir plus d'informations
5. **Gérez les erreurs** : Affichez des messages d'erreur clairs à l'utilisateur
6. **Utilisez le cache** : Les données sont cachées 5 minutes automatiquement

## 🐛 Debug

Les logs sont préfixés pour faciliter le debug :
- `🏢 [CLUB MANAGER SERVICE]` : Opérations sur le club
- `⚽ [CLUB MANAGER SERVICE]` : Opérations sur les équipes
- `👥 [CLUB MANAGER SERVICE]` : Opérations sur les joueurs
- `👔 [CLUB MANAGER SERVICE]` : Opérations sur le staff
- `📅 [CLUB MANAGER SERVICE]` : Opérations sur les saisons
- `✅ [CLUB MANAGER SERVICE]` : Succès
- `❌ [CLUB MANAGER SERVICE]` : Erreurs
- `⚠️ [CLUB MANAGER SERVICE]` : Avertissements

## 🎯 Prochaines étapes

1. Créer les routes pour les pages du club manager
2. Créer les composants pour afficher les listes (joueurs, staff, matchs)
3. Ajouter les fonctionnalités CRUD si nécessaire
4. Implémenter les statistiques du club
5. Ajouter des graphiques et visualisations

## 📚 Ressources

- Modèles : `/src/app/models/club-manager-api.model.ts`
- Service : `/src/app/service/club-manager.service.ts`
- Exemple composant : `/src/app/pages/club-manager-dashboard/`
- AuthService : `/src/app/service/auth.service.ts` (avec logs club_id)

---

**Créé le :** 2025-10-24  
**Version :** 1.0  
**Auteur :** Cursor AI Assistant
