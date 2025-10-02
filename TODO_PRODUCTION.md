# ✅ TODO avant mise en production

## 🔒 Permissions à réactiver

### Fichiers modifiés temporairement pour la démo

- [ ] **club-dashboard.component.html** (ligne ~3)
  ```html
  <!-- AVANT (démo) -->
  <div class="club-dashboard-container">
  
  <!-- APRÈS (production) -->
  <div class="club-dashboard-container" *hasPermission="'acceder-espace-club'">
  ```

- [ ] **coach-dashboard.component.html** (ligne ~3)
  ```html
  <!-- AVANT (démo) -->
  <div class="coach-dashboard-container">
  
  <!-- APRÈS (production) -->
  <div class="coach-dashboard-container" *hasPermission="'acceder-espace-coach'">
  ```

- [ ] **matches-list.component.ts** (ligne ~22)
  ```typescript
  // AVANT (démo)
  <div class="matches-list">
  
  // APRÈS (production)
  <div class="matches-list" *hasPermission="'voir-matchs'">
  ```

## 📊 Données mockées à remplacer

### Fichiers à modifier

- [ ] **club-dashboard.component.ts** (ligne ~41)
  ```typescript
  // AVANT (démo)
  useMockData = true;
  
  // APRÈS (production)
  useMockData = false;
  ```

- [ ] **coach-dashboard.component.ts** (ligne ~35)
  ```typescript
  // AVANT (démo)
  useMockData = true;
  
  // APRÈS (production)
  useMockData = false;
  ```

- [ ] **matches-list.component.ts** (ligne ~278)
  ```typescript
  // AVANT (démo)
  useMockData = true;
  
  // APRÈS (production)
  useMockData = false;
  ```

## 🔧 Backend requis

### Endpoints à implémenter (voir DASHBOARD_README.md)

- [ ] `GET /clubs/my-club` - Club de l'utilisateur connecté
- [ ] `GET /clubs/:id/stats` - Stats globales du club
- [ ] `GET /teams/my-team` - Équipe du coach connecté
- [ ] `GET /teams/:id/stats` - Stats d'une équipe
- [ ] `GET /teams/:teamId/next-match` - Prochain match
- [ ] `GET /teams/:teamId/matches` - Liste matchs avec filtres
- [ ] `GET /teams/:teamId/competition-phases` - Phases de compétition

## 👥 Permissions backend requises

### Slugs à créer dans la base de données

- [ ] `acceder-espace-club` - Accès espace responsable club
- [ ] `acceder-espace-coach` - Accès espace coach
- [ ] `voir-matchs` - Voir les matchs
- [ ] `voir-equipe` - Voir données équipe
- [ ] `voir-club` - Voir données club

### Rôles à créer

- [ ] **Responsable de Club**
  - Permission : `acceder-espace-club`
  - Permission : `voir-club`
  - Permission : `voir-equipe`
  - Permission : `voir-matchs`
  
- [ ] **Coach**
  - Permission : `acceder-espace-coach`
  - Permission : `voir-equipe`
  - Permission : `voir-matchs`

## 🧪 Tests à effectuer

### Avec vraies données

- [ ] Se connecter en tant que Responsable de Club
- [ ] Accéder à `/mon-club`
- [ ] Vérifier que toutes les équipes du club s'affichent
- [ ] Vérifier que les stats sont correctes
- [ ] Vérifier que le prochain match correspond
- [ ] Tester les filtres par compétition

- [ ] Se connecter en tant que Coach
- [ ] Accéder à `/mon-equipe`
- [ ] Vérifier que l'équipe rattachée s'affiche
- [ ] Vérifier les stats de l'équipe
- [ ] Vérifier la liste des matchs

### Sans permissions

- [ ] Utilisateur sans `acceder-espace-club` ne voit rien sur `/mon-club`
- [ ] Utilisateur sans `acceder-espace-coach` ne voit rien sur `/mon-equipe`
- [ ] Utilisateur sans `voir-matchs` ne voit pas la liste de matchs

## 📝 Fichiers à supprimer (optionnel)

Une fois en production, vous pouvez supprimer :

- [ ] `src/app/service/mock-data.service.ts` (données de démo)
- [ ] `QUICK_START_DEMO.md` (guide démo)
- [ ] `TODO_PRODUCTION.md` (ce fichier)

**À conserver :**
- ✅ `DASHBOARD_README.md` (documentation technique)
- ✅ `DEMO_GUIDE.md` (peut servir de guide utilisateur)

## 🎯 Checklist finale

Avant de déployer en production :

1. Permissions
   - [ ] Permissions réactivées dans les templates
   - [ ] Permissions créées dans la base de données
   - [ ] Rôles créés et assignés

2. Backend
   - [ ] Tous les endpoints implémentés
   - [ ] Endpoints testés avec Postman/Insomnia
   - [ ] Formats de réponse conformes aux interfaces TypeScript

3. Frontend
   - [ ] `useMockData = false` partout
   - [ ] Compilation sans erreurs
   - [ ] Pas de warnings TypeScript
   - [ ] Tests manuels passés

4. UX/UI
   - [ ] Design validé par l'équipe
   - [ ] Responsive testé (mobile/tablet/desktop)
   - [ ] Accessibilité vérifiée
   - [ ] Performance OK (pas de lag)

5. Documentation
   - [ ] README mis à jour avec les nouvelles routes
   - [ ] Guide utilisateur créé (si nécessaire)
   - [ ] Captures d'écran/vidéos pour formation

## 📞 Support

En cas de problème, référez-vous à :
- `DASHBOARD_README.md` pour la doc technique
- `DEMO_GUIDE.md` pour les visuels
- Les diagnostics VS Code (Ctrl+Shift+M)
