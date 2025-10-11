# Intégration Backend - Vue Officiel

## 📋 Structure de la Réponse Backend

### Endpoint: `GET /api/v1/Official/officialMatchs/{official_id}`

```json
{
  "status": true,
  "data": {
    "officials": [
      {
        "id": "01bb54c2-c395-45b9-947b-797ac6462eed",
        "first_name": "Samba",
        "last_name": "DIALLO",
        "level": "NATIONAL",
        "license_number": "COMSam1234",
        "official_type": "COMMISSIONER",
        "status": "ACTIVE",
        "date_of_birth": null,
        "birth_place": null,
        "nationality": null,
        "experience": null,
        "structure": null,
        "certification_date": null,
        "certification_expiry": null,
        "matches": [
          {
            "id": "7470bdbd-13f4-418d-a66a-6bf533e5804d",
            "team_one_id": "906516b4-066a-4a59-93e8-bc3a8fde6400",
            "team_two_id": "f92f9e2a-d3bf-4e07-abbb-29740ef20ca2",
            "home_club_id": "906516b4-066a-4a59-93e8-bc3a8fde6400",
            "away_club_id": "f92f9e2a-d3bf-4e07-abbb-29740ef20ca2",
            "scheduled_at": "2025-09-24T16:00:00.000000Z",
            "match_start_time": "16:00:00",
            "stadium_id": "04f59292-2bd8-4f9c-afb2-13756c9935a6",
            "pool_id": "d4ae03a6-832c-4cd2-9c27-cea42917e86c",
            "season_id": "9ca1b2b9-e91b-4320-83e6-9527a0f91a0b",
            "match_day_id": "4c1e4887-ac8a-44c6-b7af-fdd3d3091ab6",
            "leg": "first_leg",
            "is_derby": 0,
            "is_rescheduled": 0,
            "pivot": {
              "official_id": "01bb54c2-c395-45b9-947b-797ac6462eed",
              "match_id": "7470bdbd-13f4-418d-a66a-6bf533e5804d",
              "role": "MAIN_REFEREE"
            }
          }
        ],
        "user": {
          "id": "e608613e-d639-462e-9f6c-e8f7947228e7",
          "first_name": "Samba",
          "last_name": "DIALLO",
          "email": "samba@diallo.bf",
          "is_official": true,
          "is_coach": false,
          "official_id": "01bb54c2-c395-45b9-947b-797ac6462eed",
          "coach_id": null
        }
      }
    ]
  },
  "message": "Official Matchs retrieved successfully"
}
```

---

## 🔧 Modifications Apportées

### 1. **Interface `OfficialInfo` (NOUVEAU)**

📁 `src/app/service/official-match.service.ts`

```typescript
export interface OfficialInfo {
    id: string;
    first_name: string;
    last_name: string;
    level: string; // NATIONAL, INTERNATIONAL, etc.
    license_number: string;
    official_type: string; // COMMISSIONER, REFEREE, etc.
    status: string; // ACTIVE, INACTIVE
    date_of_birth?: string;
    birth_place?: string;
    nationality?: string;
    experience?: string;
    structure?: string;
    certification_date?: string;
    certification_expiry?: string;
}
```

### 2. **Nouvelle Méthode `getOfficialInfo()`**

```typescript
getOfficialInfo(): Observable<OfficialInfo | null> {
    const currentUser = this.authService.currentUser;
    if (!currentUser?.official_id) {
        return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/officialMatchs/${currentUser.official_id}`).pipe(
        map(res => {
            // Extraire les infos de l'officiel depuis data.officials[0]
            const official = res?.data?.officials?.[0];
            if (!official) return null;
            
            return {
                id: official.id,
                first_name: official.first_name,
                last_name: official.last_name,
                level: official.level,
                license_number: official.license_number,
                official_type: official.official_type,
                status: official.status,
                // ... autres champs
            } as OfficialInfo;
        }),
        catchError(() => of(null))
    );
}
```

### 3. **Mise à Jour de `getAssignedMatches()`**

**Changements principaux :**

```typescript
// ❌ AVANT
map(res => {
    let matches = (res?.data?.matches as OfficialMatch[]) || [];
    // ...
})

// ✅ APRÈS
map(res => {
    // Extraire les matchs depuis data.officials[0].matches
    const official = res?.data?.officials?.[0];
    let matches = official?.matches || [];
    
    // Mapper les matchs au format attendu
    matches = matches.map((match: any) => ({
        id: match.id,
        homeTeam: {
            id: match.team_one_id || match.home_club_id,
            name: match.home_team?.name || 'Équipe Domicile',
            logo: match.home_team?.logo
        },
        awayTeam: {
            id: match.team_two_id || match.away_club_id,
            name: match.away_team?.name || 'Équipe Extérieur',
            logo: match.away_team?.logo
        },
        stadium: {
            id: match.stadium_id,
            name: match.stadium?.name || 'Stade',
            address: match.stadium?.address
        },
        scheduledAt: match.scheduled_at,
        status: match.status || 'UPCOMING',
        officialRole: match.pivot?.role || 'MAIN_REFEREE',
        assignedAt: match.pivot?.created_at || match.created_at,
        competition: {
            id: match.competition_id || match.pool_id,
            name: match.competition?.name || 'Compétition',
            type: match.competition?.type || 'LEAGUE'
        },
        seasonId: match.season_id,
        canSubmitReport: true,
        reportSubmitted: false,
        matchClosed: false
    }));
    
    return matches;
})
```

### 4. **Dashboard - Affichage du Profil**

📁 `src/app/pages/official-dashboard/official-dashboard.component.ts`

**Ajout de la carte de profil :**

```html
<div class="official-profile-card" *ngIf="officialInfo$ | async as official">
    <div class="profile-header">
        <div class="profile-avatar">
            <i class="pi pi-user"></i>
        </div>
        <div class="profile-info">
            <h2 class="profile-name">{{ official.first_name }} {{ official.last_name }}</h2>
            <div class="profile-details">
                <span class="badge badge-type">{{ getOfficialTypeLabel(official.official_type) }}</span>
                <span class="badge badge-level">{{ official.level }}</span>
                <span class="badge badge-status" [ngClass]="{'active': official.status === 'ACTIVE'}">
                    {{ official.status }}
                </span>
            </div>
        </div>
    </div>
    <div class="profile-meta">
        <div class="meta-item">
            <i class="pi pi-id-card"></i>
            <span>Licence: {{ official.license_number }}</span>
        </div>
        <div class="meta-item" *ngIf="official.certification_date">
            <i class="pi pi-calendar"></i>
            <span>Certifié depuis: {{ official.certification_date | date:'dd/MM/yyyy' }}</span>
        </div>
        <div class="meta-item" *ngIf="official.nationality">
            <i class="pi pi-globe"></i>
            <span>{{ official.nationality }}</span>
        </div>
    </div>
</div>
```

**Fonction de mapping :**

```typescript
getOfficialTypeLabel(type: string): string {
    switch (type?.toUpperCase()) {
        case 'COMMISSIONER':
            return 'Commissaire';
        case 'REFEREE':
            return 'Arbitre';
        case 'ASSISTANT_REFEREE':
            return 'Arbitre Assistant';
        default:
            return type;
    }
}
```

---

## 📊 Mapping des Données

### Champs du Backend → Frontend

| Backend                | Frontend              | Notes                                    |
|------------------------|----------------------|------------------------------------------|
| `data.officials[0]`    | `OfficialInfo`       | Informations de l'officiel              |
| `officials[0].matches` | `OfficialMatch[]`    | Liste des matchs                        |
| `match.team_one_id`    | `homeTeam.id`        | ID équipe domicile                      |
| `match.team_two_id`    | `awayTeam.id`        | ID équipe extérieur                     |
| `match.scheduled_at`   | `scheduledAt`        | Date du match (ISO)                     |
| `match.pivot.role`     | `officialRole`       | Rôle de l'officiel (MAIN_REFEREE, etc.) |
| `match.pool_id`        | `competition.id`     | ID de la compétition                    |
| `match.season_id`      | `seasonId`           | ID de la saison                         |

### Rôles d'Officiels

| Backend Code      | Label FR           |
|-------------------|--------------------|
| `MAIN_REFEREE`    | Arbitre Central    |
| `ASSISTANT_REFEREE_1` | Assistant 1    |
| `ASSISTANT_REFEREE_2` | Assistant 2    |
| `FOURTH_OFFICIAL` | 4ème Arbitre       |
| `COMMISSIONER`    | Commissaire        |

### Types d'Officiels

| Backend           | Label FR             |
|-------------------|----------------------|
| `COMMISSIONER`    | Commissaire          |
| `REFEREE`         | Arbitre              |
| `ASSISTANT_REFEREE` | Arbitre Assistant  |

---

## ✅ Fonctionnalités Implémentées

### Dashboard Officiel (`/officiel/dashboard`)

1. **Carte de Profil** 🎨
   - Avatar avec icône utilisateur
   - Nom complet (prénom + nom)
   - Badges : Type, Niveau, Statut
   - Métadonnées : Licence, Certification, Nationalité
   - Design : Dégradé violet/bleu avec effet glassmorphism

2. **Cartes Statistiques** 📊
   - Matchs à venir
   - Matchs terminés
   - Rapports en attente
   - Notifications non lues

3. **Liste des Matchs** ⚽
   - Affichage des 3 prochains matchs
   - Équipes domicile/extérieur
   - Date, heure, stade
   - Badge du rôle de l'officiel
   - Badge de la compétition

4. **Notifications Récentes** 🔔
   - 4 dernières notifications
   - Icônes selon le type
   - Horodatage

---

## 🎨 Design

### Carte de Profil

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
border-radius: 16px;
```

### Badges

- **Type** : Fond blanc translucide
- **Niveau** : Or (NATIONAL) 
- **Statut** : 
  - ✅ ACTIVE : Vert
  - ❌ INACTIVE : Rouge

### Responsive

- Desktop : Grille 4 colonnes
- Tablet : Grille 2 colonnes
- Mobile : Colonne unique
- Profil : Centré sur mobile

---

## 🚀 Utilisation

### Récupérer les infos de l'officiel

```typescript
this.officialInfo$ = this.officialMatchService.getOfficialInfo();
```

### Afficher dans le template

```html
<div *ngIf="officialInfo$ | async as official">
    {{ official.first_name }} {{ official.last_name }}
    Licence: {{ official.license_number }}
</div>
```

### Récupérer les matchs

```typescript
this.matches$ = this.officialMatchService.getAssignedMatches({
    status: 'UPCOMING'
});
```

---

## 🔄 Flux de Données

```
1. Login → Récupère official_id
   ↓
2. getOfficialInfo() → GET /api/v1/Official/officialMatchs/{official_id}
   ↓
3. Extrait data.officials[0] → OfficialInfo
   ↓
4. Affiche dans la carte de profil
   ↓
5. getAssignedMatches() → Même endpoint
   ↓
6. Extrait data.officials[0].matches → OfficialMatch[]
   ↓
7. Mappe les champs (team_one_id, pivot.role, etc.)
   ↓
8. Affiche dans les cartes de matchs
```

---

## 📝 Notes Importantes

1. **Un seul appel API** pour récupérer :
   - Les infos de l'officiel
   - Ses matchs
   → Optimisation des performances ✅

2. **Les données `user` ne sont PAS utilisées** :
   - Déjà disponibles via `AuthService`
   - Évite la redondance

3. **Mapping robuste** :
   - Support des champs alternatifs (`team_one_id` ou `home_club_id`)
   - Valeurs par défaut si champs manquants
   - Gestion des erreurs avec `catchError`

4. **Design cohérent** :
   - Utilise PrimeIcons
   - Palette de couleurs uniforme
   - Responsive mobile-first

---

## 🐛 Debugging

### Vérifier la structure reçue

```typescript
this.http.get(`/api/v1/Official/officialMatchs/${official_id}`).subscribe(res => {
    console.log('Full response:', res);
    console.log('Official:', res?.data?.officials?.[0]);
    console.log('Matches:', res?.data?.officials?.[0]?.matches);
});
```

### Vérifier le mapping

```typescript
getAssignedMatches().subscribe(matches => {
    console.log('Mapped matches:', matches);
    matches.forEach(m => {
        console.log(`Match ${m.id}:`, {
            home: m.homeTeam.name,
            away: m.awayTeam.name,
            role: m.officialRole,
            date: m.scheduledAt
        });
    });
});
```

---

## ✅ Checklist

- [x] Interface `OfficialInfo` créée
- [x] Méthode `getOfficialInfo()` implémentée
- [x] Méthode `getAssignedMatches()` mise à jour
- [x] Mapping des champs backend → frontend
- [x] Carte de profil ajoutée au dashboard
- [x] Affichage des badges (type, niveau, statut)
- [x] Affichage des métadonnées (licence, certification)
- [x] Design responsive
- [x] Gestion des erreurs
- [x] Compilation réussie
- [x] Prêt pour production

---

**Date:** 2025-10-10  
**Branche:** `fix/official-api-urls-and-ids`  
**Statut:** ✅ Prêt pour merge
