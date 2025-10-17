# Implémentation de la Page des Matchs du Coach

## Vue d'ensemble
Cette implémentation adapte l'affichage des matchs pour le coach en utilisant les données réelles du backend avec filtrage et tri avancés.

## Fichiers Créés/Modifiés

### 1. Nouveau Composant Principal
**Fichier**: `src/app/pages/coach-matches/coach-matches-new.component.ts`
- Composant Angular standalone utilisant signals
- Gère le chargement et l'affichage des matchs depuis le backend
- Implémente les filtres par saison, compétition et date
- Identifie et affiche le match le plus proche en carte principale

### 2. Template HTML
**Fichier**: `src/app/pages/coach-matches/coach-matches-new.component.html`
- Carte principale pour le match le plus proche avec design premium
- Section de filtres avec dropdowns pour saison, compétition et tri
- Grille de cartes pour tous les matchs avec informations essentielles
- Modal de détails complet pour chaque match

### 3. Styles SCSS
**Fichier**: `src/app/pages/coach-matches/coach-matches-new.component.scss`
- Design moderne avec gradients pour la carte principale
- Animations et transitions fluides
- Responsive design pour mobile et tablette
- Badges visuels pour derbies et matchs reportés

### 4. Service Match Adapté
**Fichier**: `src/app/service/match.service.ts`
- Méthode `getAllMatchesForTeam()` améliorée
- Gestion flexible de différentes structures de réponse API
- Logging détaillé pour le debugging

### 5. Routes Mises à Jour
**Fichier**: `src/app.routes.ts`
- Route `/mon-equipe/matchs` pointe vers le nouveau composant

## Structure des Données Backend

### Format Attendu
```typescript
interface BackendMatch {
  id: string;
  team_one_id: string;  // Équipe domicile
  team_two_id: string;  // Équipe extérieure
  scheduled_at: string; // Date ISO
  stadium: { id: string; name: string; }
  pool: { id: string; name: string; } // Compétition
  season: { id: string; start_date: string; end_date: string; }
  match_day: { number: number; leg: string; }
  team_one: { name: string; logo: string; abbreviation: string; }
  team_two: { name: string; logo: string; abbreviation: string; }
  is_derby: number;
  is_rescheduled: number;
}
```

## Fonctionnalités Implémentées

### 1. Carte du Match le Plus Proche
- **Affichage prioritaire** : Le match à venir le plus proche est affiché en grande carte en haut
- **Design premium** : Gradient coloré, animations pulse
- **Informations complètes** :
  - Date et heure avec badge animé
  - Logos et noms des deux équipes
  - Indication "Mon Équipe" pour l'équipe du coach
  - Stade, compétition, numéro de journée
  - Badge "Derby" si applicable
  - Bouton d'action pour voir les détails

### 2. Filtres Intelligents
- **Filtre par Saison** : Dropdown avec toutes les saisons disponibles
- **Filtre par Compétition** : Dropdown avec toutes les compétitions/leagues
- **Tri** : 
  - Par date (plus récent en premier)
  - Par compétition
  - Par saison
- **Boutons d'action** : Réinitialiser et actualiser

### 3. Liste des Matchs
- **Affichage en grille** responsive
- **Cartes compactes** avec :
  - Date et heure
  - Badge de statut (À venir / Terminé / Aujourd'hui / Demain)
  - Logos des équipes avec indication "Mon Équipe"
  - Stade et compétition
  - Badges spéciaux (Derby, Reporté)
  - Bouton "Détails"
- **Distinction visuelle** :
  - Bordure verte pour matchs à venir
  - Opacité réduite pour matchs passés

### 4. Modal de Détails
- **En-tête** : Confrontation visuelle avec logos et noms
- **Informations générales** :
  - Compétition et journée
  - Stade et date/heure complète
  - Badges derby et reporté
- **Section équipes** : Cartes détaillées pour chaque équipe
- **Section saison** : Dates de début et fin

## Logique de Tri et Filtrage

### Détermination du Match le Plus Proche
```typescript
findClosestMatch() {
  const now = new Date();
  const upcomingMatches = this.filteredMatches()
    .filter(m => m.date >= now);
  
  if (upcomingMatches.length > 0) {
    const closest = upcomingMatches.reduce((prev, curr) => {
      return curr.date < prev.date ? curr : prev;
    });
    this.closestMatch.set(closest);
  }
}
```

### Application des Filtres
1. Filtre les matchs selon la saison sélectionnée
2. Filtre selon la compétition sélectionnée
3. Applique le tri choisi (date, compétition, saison)
4. Met à jour l'affichage et recalcule le match le plus proche

## Gestion des Cas Particuliers

### Derby
- Détecté via `is_derby === 1`
- Badge jaune/doré avec étoile
- Mis en évidence visuellement

### Match Reporté
- Détecté via `is_rescheduled === 1`
- Badge rouge avec icône calendrier
- Information claire pour l'utilisateur

### Identification de "Mon Équipe"
```typescript
const isHome = match.team_one_id === myTeamId || 
               match.home_club_id === myTeamId;
```

## Responsive Design

### Desktop (> 1024px)
- Carte principale pleine largeur
- Grille de 3 colonnes pour les matchs
- Filtres sur une ligne

### Tablette (768px - 1024px)
- Grille de 2 colonnes
- Filtres empilés

### Mobile (< 768px)
- Carte principale adaptée en colonne
- Grille simple colonne
- Filtres empilés verticalement
- Modal plein écran

## États de l'Application

### Chargement
- Spinner avec message "Chargement des matchs..."

### Erreur
- Icône d'avertissement
- Message d'erreur explicite
- Bouton "Réessayer"

### Aucun Match
- Message "Aucun match trouvé"
- Suggestion de modifier les filtres

### Aucun Match à Venir
- La carte du match le plus proche n'est pas affichée
- Liste complète toujours visible

## Logs de Debugging
Le composant inclut des logs détaillés pour faciliter le debugging :
```
⚽ [COACH MATCHES] Chargement des matchs
👤 [COACH MATCHES] User: {...}
🏟️ [COACH MATCHES] Team ID: xxx
✅ [COACH MATCHES] Matchs reçus: [...]
```

## Configuration Requise

### Dépendances PrimeNG
- `p-card`
- `p-button`
- `p-dropdown`
- `p-dialog`
- `p-toast`

### Services Injectés
- `MatchService` : Récupération des matchs
- `AuthService` : Identification du coach et de son équipe
- `MessageService` : Notifications toast

## Points d'Amélioration Futurs

1. **Pagination** : Ajouter la pagination pour les grandes listes
2. **Cache** : Mettre en cache les données pour réduire les appels API
3. **Synchronisation temps réel** : WebSocket pour les mises à jour live
4. **Statistiques** : Ajouter des stats d'équipe dans le modal
5. **Export** : Permettre l'export du calendrier (PDF, iCal)
6. **Notifications** : Alertes pour les matchs à venir

## Utilisation

1. Le coach se connecte à son compte
2. Navigue vers `/mon-equipe/matchs`
3. Voit immédiatement son prochain match en grande carte
4. Peut filtrer par saison ou compétition
5. Clique sur "Détails" pour voir plus d'informations
6. Peut actualiser la liste à tout moment

## API Endpoint Utilisé

```
GET /api/v1/teams/{teamId}/matches
```

Retourne tous les matchs de l'équipe du coach, passés et à venir.
