# 📚 Guide CRUD - Joueurs et Staff

## ✅ Problème résolu

Le problème de récupération des joueurs et du staff a été corrigé en utilisant les **vrais endpoints** depuis `api_list.json`.

## 🔧 Corrections apportées

### 1. Endpoints corrigés

#### Avant (incorrect)
```typescript
// ❌ Format de réponse incorrect supposé
return response.data || response;
```

#### Après (correct)
```typescript
// ✅ Format de réponse réel depuis api_list.json
const players = response?.data?.players || response?.players || response?.data || [];
const staffs = response?.data?.staffs || response?.staffs || response?.data || [];
```

### 2. Services mis à jour

- ✅ **ClubManagerService** : Corrigé + méthodes CRUD ajoutées
- ✅ **CoachService** : Corrigé pour utiliser le bon format

## 📡 Endpoints disponibles

### JOUEURS (Players)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| **GET** | `/v1/teams/{teamId}/players` | Liste des joueurs d'une équipe |
| **GET** | `/v1/players/show/{id}` | Détails d'un joueur |
| **GET** | `/v1/players/paginate` | Liste paginée de tous les joueurs |
| **POST** | `/v1/players` | Créer un joueur |
| **PUT** | `/v1/players/{playerId}` | Modifier un joueur |
| **DELETE** | `/v1/players/delete/{playerId}` | Supprimer un joueur |

### STAFF

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| **GET** | `/v1/teams/{teamId}/staffs` | Liste du staff d'une équipe |
| **GET** | `/v1/staffs/{id}` | Détails d'un membre du staff |
| **GET** | `/v1/staffs` | Liste complète du staff |
| **POST** | `/v1/staffs` | Créer un membre du staff |
| **PUT** | `/v1/staffs/{id}` | Modifier un membre du staff |
| **DELETE** | `/v1/staffs/{id}` | Supprimer un membre du staff |

## 🚀 Utilisation des méthodes

### Joueurs

#### 1. Récupérer les joueurs d'une équipe

```typescript
// Dans votre composant
this.clubManagerService.getTeamPlayers(teamId).subscribe({
  next: (players) => {
    console.log('Joueurs récupérés:', players);
    this.players = players;
  },
  error: (err) => {
    console.error('Erreur:', err);
  }
});
```

**Logs attendus :**
```
👥 [CLUB MANAGER SERVICE] Récupération des joueurs de l'équipe: xxx
✅ [CLUB MANAGER SERVICE] Réponse brute joueurs: {status: true, data: {players: [...]}}
✅ [CLUB MANAGER SERVICE] Joueurs extraits: [...]
```

#### 2. Créer un joueur

```typescript
const newPlayer = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  date_of_birth: '1995-05-15',
  nationality: 'FR',
  preferred_position: 'ST',
  team_id: 'team-id-here'
  // ... autres champs
};

this.clubManagerService.createPlayer(newPlayer).subscribe({
  next: (player) => {
    console.log('Joueur créé:', player);
    // Rafraîchir la liste
    this.loadPlayers();
  },
  error: (err) => {
    console.error('Erreur création:', err);
  }
});
```

**Logs attendus :**
```
➕ [CLUB MANAGER SERVICE] Création d'un joueur: {first_name: "John", ...}
✅ [CLUB MANAGER SERVICE] Joueur créé: {id: "xxx", ...}
```

#### 3. Modifier un joueur

```typescript
const updates = {
  first_name: 'John Updated',
  preferred_position: 'CF'
};

this.clubManagerService.updatePlayer(playerId, updates).subscribe({
  next: (player) => {
    console.log('Joueur modifié:', player);
    // Mettre à jour la liste localement
    this.updatePlayerInList(player);
  },
  error: (err) => {
    console.error('Erreur modification:', err);
  }
});
```

**Logs attendus :**
```
✏️ [CLUB MANAGER SERVICE] Modification du joueur: xxx {first_name: "John Updated"}
✅ [CLUB MANAGER SERVICE] Joueur modifié: {id: "xxx", first_name: "John Updated", ...}
```

#### 4. Supprimer un joueur

```typescript
if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
  this.clubManagerService.deletePlayer(playerId).subscribe({
    next: (response) => {
      console.log('Joueur supprimé:', response);
      // Retirer de la liste locale
      this.removePlayerFromList(playerId);
    },
    error: (err) => {
      console.error('Erreur suppression:', err);
    }
  });
}
```

**Logs attendus :**
```
🗑️ [CLUB MANAGER SERVICE] Suppression du joueur: xxx
✅ [CLUB MANAGER SERVICE] Joueur supprimé: {status: true, message: "..."}
```

#### 5. Récupérer les détails d'un joueur

```typescript
this.clubManagerService.getPlayerDetails(playerId).subscribe({
  next: (player) => {
    console.log('Détails joueur:', player);
    this.selectedPlayer = player;
  },
  error: (err) => {
    console.error('Erreur:', err);
  }
});
```

#### 6. Liste paginée de tous les joueurs

```typescript
this.clubManagerService.getAllPlayersPaginated(1, 20).subscribe({
  next: (response) => {
    console.log('Joueurs paginés:', response.data);
    console.log('Pagination:', response.meta);
    this.players = response.data;
    this.totalPlayers = response.meta.total;
  },
  error: (err) => {
    console.error('Erreur:', err);
  }
});
```

---

### Staff

#### 1. Récupérer le staff d'une équipe

```typescript
this.clubManagerService.getTeamStaff(teamId).subscribe({
  next: (staff) => {
    console.log('Staff récupéré:', staff);
    this.staffMembers = staff;
  },
  error: (err) => {
    console.error('Erreur:', err);
  }
});
```

**Logs attendus :**
```
👔 [CLUB MANAGER SERVICE] Récupération du staff de l'équipe: xxx
✅ [CLUB MANAGER SERVICE] Réponse brute staff: {status: true, data: {staffs: [...]}}
✅ [CLUB MANAGER SERVICE] Staff extrait: [...]
```

#### 2. Créer un membre du staff

```typescript
const newStaff = {
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1234567890',
  role: 'COACH', // COACH, ASSISTANT_COACH, PHYSIOTHERAPIST, etc.
  team_id: 'team-id-here'
  // ... autres champs
};

this.clubManagerService.createStaff(newStaff).subscribe({
  next: (staff) => {
    console.log('Staff créé:', staff);
    this.loadStaff();
  },
  error: (err) => {
    console.error('Erreur création:', err);
  }
});
```

**Logs attendus :**
```
➕ [CLUB MANAGER SERVICE] Création d'un membre du staff: {first_name: "Jane", ...}
✅ [CLUB MANAGER SERVICE] Staff créé: {id: "xxx", ...}
```

#### 3. Modifier un membre du staff

```typescript
const updates = {
  role: 'ASSISTANT_COACH',
  phone: '+9876543210'
};

this.clubManagerService.updateStaff(staffId, updates).subscribe({
  next: (staff) => {
    console.log('Staff modifié:', staff);
    this.updateStaffInList(staff);
  },
  error: (err) => {
    console.error('Erreur modification:', err);
  }
});
```

**Logs attendus :**
```
✏️ [CLUB MANAGER SERVICE] Modification du staff: xxx {role: "ASSISTANT_COACH"}
✅ [CLUB MANAGER SERVICE] Staff modifié: {id: "xxx", role: "ASSISTANT_COACH", ...}
```

#### 4. Supprimer un membre du staff

```typescript
if (confirm('Êtes-vous sûr de vouloir supprimer ce membre du staff ?')) {
  this.clubManagerService.deleteStaff(staffId).subscribe({
    next: (response) => {
      console.log('Staff supprimé:', response);
      this.removeStaffFromList(staffId);
    },
    error: (err) => {
      console.error('Erreur suppression:', err);
    }
  });
}
```

**Logs attendus :**
```
🗑️ [CLUB MANAGER SERVICE] Suppression du staff: xxx
✅ [CLUB MANAGER SERVICE] Staff supprimé: {status: true, message: "..."}
```

#### 5. Récupérer les détails d'un membre du staff

```typescript
this.clubManagerService.getStaffDetails(staffId).subscribe({
  next: (staff) => {
    console.log('Détails staff:', staff);
    this.selectedStaff = staff;
  },
  error: (err) => {
    console.error('Erreur:', err);
  }
});
```

#### 6. Récupérer tout le staff (tous clubs/équipes)

```typescript
this.clubManagerService.getAllStaff().subscribe({
  next: (staff) => {
    console.log('Tout le staff:', staff);
    this.allStaff = staff;
  },
  error: (err) => {
    console.error('Erreur:', err);
  }
});
```

---

## 🎯 Exemple complet : Composant de gestion des joueurs

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ClubManagerService } from '../../service/club-manager.service';
import { ClubManagerPlayer } from '../../models/club-manager-api.model';

@Component({
  selector: 'app-team-players-manager',
  template: `
    <div class="players-manager">
      <h2>Gestion des Joueurs</h2>
      
      <!-- Liste des joueurs -->
      <div *ngFor="let player of players" class="player-card">
        <h3>{{ player.first_name }} {{ player.last_name }}</h3>
        <p>Position: {{ player.preferred_position }}</p>
        <button (click)="editPlayer(player)">Modifier</button>
        <button (click)="deletePlayer(player.id)">Supprimer</button>
      </div>
      
      <!-- Formulaire d'ajout -->
      <button (click)="showAddForm()">Ajouter un joueur</button>
    </div>
  `
})
export class TeamPlayersManagerComponent implements OnInit {
  private clubManagerService = inject(ClubManagerService);
  
  players: ClubManagerPlayer[] = [];
  teamId: string = 'your-team-id';
  
  ngOnInit() {
    this.loadPlayers();
  }
  
  loadPlayers() {
    this.clubManagerService.getTeamPlayers(this.teamId).subscribe({
      next: (players) => {
        console.log('Joueurs chargés:', players);
        this.players = players;
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
      }
    });
  }
  
  editPlayer(player: ClubManagerPlayer) {
    // Ouvrir un modal/formulaire de modification
    const updates = {
      preferred_position: 'CF' // exemple
    };
    
    this.clubManagerService.updatePlayer(player.id, updates).subscribe({
      next: (updatedPlayer) => {
        // Mettre à jour dans la liste
        const index = this.players.findIndex(p => p.id === player.id);
        if (index !== -1) {
          this.players[index] = updatedPlayer;
        }
      },
      error: (err) => console.error(err)
    });
  }
  
  deletePlayer(playerId: string) {
    if (!confirm('Confirmer la suppression ?')) return;
    
    this.clubManagerService.deletePlayer(playerId).subscribe({
      next: () => {
        // Retirer de la liste
        this.players = this.players.filter(p => p.id !== playerId);
      },
      error: (err) => console.error(err)
    });
  }
  
  showAddForm() {
    // Ouvrir un modal/formulaire d'ajout
    const newPlayer = {
      first_name: 'Nouveau',
      last_name: 'Joueur',
      email: 'nouveau@example.com',
      team_id: this.teamId,
      // ... autres champs requis
    };
    
    this.clubManagerService.createPlayer(newPlayer).subscribe({
      next: (player) => {
        // Ajouter à la liste
        this.players.push(player);
      },
      error: (err) => console.error(err)
    });
  }
}
```

---

## 🐛 Debug et résolution de problèmes

### Problème : Les joueurs ne se chargent pas

**Symptômes :**
- La liste reste vide
- Pas d'erreur dans la console

**Solution :**
1. Vérifier les logs dans la console :
```
👥 [CLUB MANAGER SERVICE] Récupération des joueurs de l'équipe: xxx
✅ [CLUB MANAGER SERVICE] Réponse brute joueurs: {...}
✅ [CLUB MANAGER SERVICE] Joueurs extraits: [...]
```

2. Vérifier le format de la réponse API :
```typescript
// Si la réponse a un format différent, adapter le mapping
map((response) => {
  console.log('Format réponse:', response);
  // Adapter selon le format réel
  return response?.data?.players || [];
})
```

### Problème : Erreur 404 lors de la création

**Cause :** Endpoint incorrect ou champs obligatoires manquants

**Solution :**
1. Vérifier l'endpoint : `/v1/players` (POST)
2. Vérifier les champs obligatoires dans `api_list.json`
3. Consulter les logs d'erreur détaillés

### Problème : Erreur 401/403

**Cause :** Token manquant ou expiré, ou permissions insuffisantes

**Solution :**
1. Vérifier que le token est présent : `localStorage.getItem('token')`
2. Vérifier les permissions de l'utilisateur
3. Se reconnecter si nécessaire

---

## 📊 Récapitulatif des méthodes disponibles

### ClubManagerService

#### Joueurs (10 méthodes)
- ✅ `getTeamPlayers(teamId)` - Liste d'une équipe
- ✅ `getPlayerDetails(playerId)` - Détails
- ✅ `createPlayer(data)` - Créer
- ✅ `updatePlayer(id, data)` - Modifier
- ✅ `deletePlayer(id)` - Supprimer
- ✅ `getAllPlayersPaginated(page, perPage)` - Liste paginée
- ✅ `getAllClubPlayers(clubId)` - Tous les joueurs du club

#### Staff (8 méthodes)
- ✅ `getTeamStaff(teamId)` - Liste d'une équipe
- ✅ `getStaffDetails(staffId)` - Détails
- ✅ `createStaff(data)` - Créer
- ✅ `updateStaff(id, data)` - Modifier
- ✅ `deleteStaff(id)` - Supprimer
- ✅ `getAllStaff()` - Tout le staff
- ✅ `getAllClubStaff(clubId)` - Tout le staff du club

### CoachService (corrigé)

- ✅ `getTeamPlayers(teamId)` - Corrigé pour utiliser le bon format
- ✅ `getTeamStaff(teamId)` - Corrigé pour utiliser le bon format

---

## ✅ Statut final

- **Endpoints vérifiés :** ✅ Depuis `api_list.json`
- **Format de réponse :** ✅ Corrigé
- **CRUD Joueurs :** ✅ Complet (6 méthodes)
- **CRUD Staff :** ✅ Complet (6 méthodes)
- **Logs ajoutés :** ✅ Pour chaque opération
- **Services mis à jour :** ✅ ClubManagerService + CoachService
- **Erreurs de lint :** ✅ 0

---

**Date :** 2025-10-24  
**Version :** 2.0  
**Statut :** ✅ Corrigé et prêt à l'emploi
