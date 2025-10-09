# Implémentation du Dashboard Club (mon-club/dashboard) - Documentation

## 📋 Résumé

Mise à jour du composant `ClubDashboardV2Component` pour utiliser les vraies API au lieu des données mockées.

## 🔄 Modifications apportées

### 1. **ClubDashboardV2Component**
📁 `src/app/pages/club-dashboard-v2/club-dashboard-v2.component.ts`

#### Imports ajoutés :
```typescript
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
```

#### Nouvelles propriétés :
```typescript
loading = false;              // État de chargement
clubId: string | null = null; // ID du club de l'utilisateur
```

#### Services injectés :
```typescript
private authService = inject(AuthService);
private router = inject(Router);
```

### 2. **Initialisation (ngOnInit)**

**Avant :** Appelait directement `loadClubData()` avec des données mockées

**Après :** Récupère l'ID du club depuis l'utilisateur connecté
```typescript
ngOnInit(): void {
  const currentUser = this.authService.currentUser;
  
  // Essayer de récupérer club_id depuis l'utilisateur
  if (currentUser && currentUser.club_id) {
    this.clubId = currentUser.club_id;
    this.loadClubData();
  } 
  // Sinon, essayer depuis localStorage
  else {
    const storedClubId = localStorage.getItem('user_club_id');
    if (storedClubId) {
      this.clubId = storedClubId;
      this.loadClubData();
    } 
    // Afficher erreur si aucun club trouvé
    else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Aucun club associé à cet utilisateur'
      });
    }
  }
}
```

### 3. **Chargement des données (loadClubData)**

**Avant :** Utilisait `getMyClub()` et créait des données mockées

**Après :** Utilise `getById(clubId)` avec les vraies données API
```typescript
loadClubData() {
  if (!this.clubId) return;

  this.loading = true;
  this.clubService.getById(this.clubId).subscribe({
    next: (res: any) => {
      const clubData = res?.club || res?.data?.club || res;
      this.club.set(clubData);
      
      const currentUser = this.authService.currentUser;
      
      // Mapper les données réelles de l'API
      const manager: ClubManager = {
        id: currentUser?.id || '1',
        name: `${currentUser?.first_name} ${currentUser?.last_name}`,
        email: currentUser?.email || '',
        club: {
          id: clubData?.id,
          name: clubData?.name,
          logo: clubData?.logo,
          address: clubData?.address || '',
          phone: clubData?.phone || '',
          email: clubData?.email || ''
        },
        teams: (clubData?.teams || []).map((team: any) => ({
          id: team.id,
          name: team.name,
          category: team.category?.name || 'Senior',
          logo: team.logo,
          coach: {
            id: team.coach?.id || '1',
            name: team.manager_first_name && team.manager_last_name 
              ? `${team.manager_first_name} ${team.manager_last_name}` 
              : 'Coach non assigné',
            email: team.email || ''
          },
          players: team.player_count || 0,
          status: team.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
        }))
      };

      this.manager.set(manager);
      // ... reste du code
    },
    error: (err) => {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du chargement des données du club'
      });
    }
  });
}
```

### 4. **Nouvelles méthodes de navigation**

```typescript
// Navigation vers les détails d'une équipe
goToTeamDetails(teamId: string) {
  this.router.navigate(['/equipe-details', teamId]);
}

// Navigation vers la vue complète du club
goToClubDetails() {
  if (this.clubId) {
    this.router.navigate(['/club-details', this.clubId]);
  }
}

// Navigation vers la gestion des joueurs
goToPlayers() {
  this.router.navigate(['/mon-club/joueurs']);
}

// Navigation vers les matchs du club
goToMatches() {
  this.router.navigate(['/mon-club/matchs']);
}
```

### 5. **Modèle User mis à jour**
📁 `src/app/models/user.model.ts`

```typescript
export interface User {
  id?: string;
  slug?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  roles?: UserRole[];
  club_id?: string;  // ✅ NOUVEAU - ID du club pour les managers
  team_id?: string;  // ✅ NOUVEAU - ID de l'équipe pour les coaches
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
```

## 🎯 Flux de fonctionnement

### Pour un Manager de Club :

1. **Connexion**
   - L'utilisateur se connecte avec role "club-manager"
   - Le backend retourne l'utilisateur avec `club_id`

2. **Redirection automatique**
   - Route : `/mon-club/dashboard`
   - Composant : `ClubDashboardV2Component`

3. **Chargement des données**
   ```
   ngOnInit()
   ├── Récupère currentUser de AuthService
   ├── Extrait club_id de l'utilisateur
   ├── Appelle loadClubData()
   │   ├── Appelle clubService.getById(club_id)
   │   ├── Récupère club avec toutes ses équipes
   │   └── Mappe les données vers l'interface ClubManager
   └── Affiche le dashboard
   ```

4. **Affichage**
   - En-tête avec nom du club
   - Grille de cartes des équipes
   - Sélection d'une équipe affiche son dashboard détaillé
   - Navigation vers différentes sections

## 📊 Structure des données

### Réponse API attendue :
```json
{
  "status": true,
  "data": {
    "club": {
      "id": "uuid",
      "name": "AS Fasofoot",
      "abbreviation": "ASF",
      "logo": "url",
      "address": "...",
      "phone": "...",
      "email": "...",
      "teams": [
        {
          "id": "uuid",
          "name": "AS Fasofoot U20",
          "abbreviation": "ASF U20",
          "logo": "url",
          "status": "ACTIVE",
          "manager_first_name": "Jean",
          "manager_last_name": "Dupont",
          "phone": "...",
          "email": "...",
          "player_count": 25,
          "category": {
            "id": "uuid",
            "name": "U20"
          },
          "league": {
            "id": "uuid",
            "name": "Ligue U20"
          }
        }
      ]
    }
  }
}
```

### Interface ClubManager (Frontend) :
```typescript
interface ClubManager {
  id: string;
  name: string;
  email: string;
  club: {
    id: string;
    name: string;
    logo?: string;
    address: string;
    phone: string;
    email: string;
  };
  teams: ClubTeam[];
}

interface ClubTeam {
  id: string;
  name: string;
  category: string;
  logo?: string;
  coach: {
    id: string;
    name: string;
    email: string;
  };
  players: number;
  status: 'ACTIVE' | 'INACTIVE';
}
```

## 🎨 Interface Utilisateur

```
┌─────────────────────────────────────────────────────────┐
│ Gestion du Club                                         │
│ AS Fasofoot                                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Équipes du Club                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│ │  [Logo]  │  │  [Logo]  │  │  [Logo]  │             │
│ │ ASF U20  │  │ ASF U17  │  │ Séniors  │             │
│ │   U20    │  │   U17    │  │  Senior  │             │
│ │ 👥 25    │  │ 👥 22    │  │ 👥 30    │             │
│ │ ✓ Active │  │ ✓ Active │  │ ✓ Active │             │
│ └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Équipe sélectionnée]                                   │
│                                                         │
│ [Dashboard détaillé de l'équipe avec CoachDashboard]   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ⚙️ Configuration requise

### Backend doit retourner dans l'objet User :

```json
{
  "id": "uuid",
  "email": "manager@club.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "club_id": "club-uuid",  // ✅ IMPORTANT
  "roles": [
    {
      "slug": "club-manager",
      "name": "Manager de Club",
      "permissions": [...]
    }
  ]
}
```

### OU stocker dans localStorage :

```javascript
localStorage.setItem('user_club_id', 'club-uuid');
```

## 🔧 Utilisation dans d'autres composants

### Récupérer l'ID du club de l'utilisateur :

```typescript
import { AuthService } from '../../service/auth.service';

export class MyComponent {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    const currentUser = this.authService.currentUser;
    const clubId = currentUser?.club_id;
    
    if (clubId) {
      // Charger les données du club
      this.loadClubData(clubId);
    }
  }
}
```

## 🚀 Routes disponibles

```typescript
{
  path: 'mon-club',
  component: ClubLayout,
  canActivate: [AuthGuard],
  children: [
    { 
      path: 'dashboard', 
      component: ClubDashboardV2Component  // ✅ Dashboard principal
    },
    { 
      path: 'matchs', 
      component: ClubMatchesComponent     // Matchs du club
    },
    { 
      path: 'joueurs', 
      component: ClubPlayersComponent     // Joueurs du club
    },
    { 
      path: 'parametres', 
      component: ParametresPageComponent  // Paramètres
    }
  ]
}
```

## 📝 Améliorations suggérées

### 1. **Guard de redirection automatique**

Créer un guard qui redirige automatiquement vers `/mon-club/dashboard` si l'utilisateur est un manager :

```typescript
@Injectable({ providedIn: 'root' })
export class ClubManagerGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.authService.currentUser;
    
    if (user?.roles?.some(r => r.slug === 'club-manager') && user.club_id) {
      this.router.navigate(['/mon-club/dashboard']);
      return false;
    }
    
    return true;
  }
}
```

### 2. **Boutons d'action rapide dans le dashboard**

Ajouter des boutons de navigation rapide :
```html
<div class="quick-actions">
  <button (click)="goToClubDetails()">
    <i class="pi pi-building"></i>
    Détails du club
  </button>
  <button (click)="goToPlayers()">
    <i class="pi pi-users"></i>
    Tous les joueurs
  </button>
  <button (click)="goToMatches()">
    <i class="pi pi-calendar"></i>
    Tous les matchs
  </button>
</div>
```

### 3. **Statistiques globales du club**

Ajouter des statistiques en haut du dashboard :
- Nombre total d'équipes
- Nombre total de joueurs
- Prochains matchs (toutes équipes)
- Équipes actives/inactives

### 4. **Gestion des permissions**

Vérifier les permissions avant d'afficher certaines actions :
```typescript
canAddTeam(): boolean {
  return this.authService.hasPermission('teams.create');
}

canEditClub(): boolean {
  return this.authService.hasPermission('clubs.update');
}
```

## ✅ Checklist

- [x] ClubDashboardV2Component mis à jour
- [x] Utilisation des vraies API
- [x] Récupération du club_id depuis l'utilisateur
- [x] Mapping des données API vers l'interface
- [x] Gestion des erreurs
- [x] Méthodes de navigation ajoutées
- [x] Interface User mise à jour avec club_id
- [x] Compilation réussie
- [ ] Guard de redirection automatique
- [ ] Boutons d'action rapide
- [ ] Statistiques globales
- [ ] Gestion des permissions

## 📊 État

```
✅ Compilation réussie
✅ API v1 intégrée
✅ Données mockées supprimées
✅ Navigation implémentée
✅ Gestion d'erreurs en place
✅ Prêt pour test avec backend
```

---
**Date de mise à jour:** 2025-10-09
**Version:** 1.0.0
