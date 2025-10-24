# 🧪 Guide de Test - Club Manager

## ✅ Checklist de test

### 1. 🔐 Connexion

**Test :** Se connecter avec un compte responsable de club

**Email de test :** `rfa.responsable@gmail.com`

**Vérifications :**
- [ ] La connexion réussit
- [ ] Redirection automatique vers `/mon-club/dashboard`

**Logs à vérifier dans la console :**
```
🔐 [AUTH] Réponse complète du backend
👤 [AUTH] User reçu
🏢 [AUTH] Club ID: a3e79a21-22e5-4e6c-b775-f6340f211d71
🏢 [AUTH] Is Club Manager: true
```

---

### 2. 📊 Dashboard (`/mon-club/dashboard`)

**Test :** Accéder au dashboard

**Vérifications visuelles :**
- [ ] Le nom du club s'affiche
- [ ] Le logo du club s'affiche (si disponible)
- [ ] Les informations du club sont visibles
- [ ] La liste des équipes s'affiche
- [ ] Chaque équipe montre :
  - [ ] Son nom
  - [ ] Sa catégorie
  - [ ] Son logo (si disponible)
  - [ ] Le nombre de joueurs (réel, pas 25 fixe)
  - [ ] Son statut (ACTIVE/INACTIVE)

**Logs à vérifier :**
```
🏢 [CLUB DASHBOARD] Chargement du club avec ClubManagerService: a3e79a21-...
✅ [CLUB DASHBOARD] Données du club reçues: {id: "...", name: "...", ...}
✅ [CLUB DASHBOARD] Manager créé avec X équipes
```

**Tests d'interaction :**
- [ ] Cliquer sur une équipe la sélectionne
- [ ] Les onglets du dashboard fonctionnent
- [ ] La dropdown de sélection d'équipe fonctionne

---

### 3. ⚽ Matchs (`/mon-club/matchs`)

**Test :** Accéder à la page des matchs

**Vérifications visuelles :**
- [ ] Le titre "Matchs du Club" s'affiche
- [ ] La liste des équipes s'affiche horizontalement
- [ ] Chaque carte d'équipe affiche :
  - [ ] Le nom de l'équipe
  - [ ] La catégorie
  - [ ] Le logo (si disponible)
  - [ ] Le nombre de joueurs RÉEL (pas hardcodé à 25)

**Logs à vérifier :**
```
🏢 [CLUB MATCHES] Chargement du club: a3e79a21-...
✅ [CLUB MATCHES] Club chargé: {id: "...", name: "...", teams: [...]}
✅ [CLUB MATCHES] Équipes chargées: X
```

**Tests d'interaction :**
- [ ] Cliquer sur une équipe la sélectionne (bordure bleue)
- [ ] Les matchs de l'équipe se chargent automatiquement
- [ ] Le composant `CoachMatchesComponent` s'affiche
- [ ] Les matchs affichés correspondent à l'équipe sélectionnée

**Log lors de la sélection :**
```
⚽ [CLUB MATCHES] Équipe sélectionnée: [team-id]
```

**Vérifier les états :**
- [ ] État de chargement : spinner visible pendant le chargement
- [ ] État d'erreur : message d'erreur si problème API
- [ ] État vide : message si aucune équipe
- [ ] État normal : liste des équipes et matchs

---

### 4. 👥 Joueurs (`/mon-club/joueurs`)

**Test :** Accéder à la page des joueurs

**Vérifications visuelles :**
- [ ] Le titre "Joueurs du Club" s'affiche
- [ ] La liste des équipes s'affiche horizontalement
- [ ] Chaque carte d'équipe affiche :
  - [ ] Le nom de l'équipe
  - [ ] La catégorie
  - [ ] Le logo (si disponible)
  - [ ] Le nombre de joueurs RÉEL avec icône (👥 X joueurs)

**Logs à vérifier :**
```
🏢 [CLUB PLAYERS] Chargement du club: a3e79a21-...
✅ [CLUB PLAYERS] Club chargé: {id: "...", name: "...", teams: [...]}
✅ [CLUB PLAYERS] Équipes chargées: X
```

**Tests d'interaction :**
- [ ] Cliquer sur une équipe la sélectionne (bordure bleue)
- [ ] Les joueurs de l'équipe se chargent automatiquement
- [ ] Le composant `CoachPlayersComponent` s'affiche
- [ ] Les joueurs affichés correspondent à l'équipe sélectionnée

**Log lors de la sélection :**
```
⚽ [CLUB PLAYERS] Équipe sélectionnée: [team-id]
```

**Vérifier les états :**
- [ ] État de chargement : spinner visible pendant le chargement
- [ ] État d'erreur : message d'erreur si problème API
- [ ] État vide : message si aucune équipe
- [ ] État normal : liste des équipes et joueurs

---

### 5. 🔄 Navigation

**Test :** Navigation entre les pages

**Vérifications :**
- [ ] `/mon-club` → redirige vers `/mon-club/dashboard`
- [ ] Navigation via le menu latéral fonctionne
- [ ] Pas de perte de données lors de la navigation
- [ ] Le breadcrumb/titre de la page se met à jour

---

### 6. 📱 Responsive

**Test :** Tester sur différentes tailles d'écran

**Vérifications :**
- [ ] Desktop (>1200px) : Tout s'affiche correctement
- [ ] Tablet (768-1200px) : Layout adapté
- [ ] Mobile (<768px) : Liste des équipes en colonne

---

### 7. 🚨 Gestion d'erreur

**Test 1 : Compte sans club_id**

**Comment tester :**
1. Modifier temporairement l'utilisateur pour retirer `club_id`
2. Accéder à `/mon-club/dashboard`

**Vérifications :**
- [ ] Message d'erreur s'affiche : "Aucun club associé à votre compte"
- [ ] Pas de crash de l'application
- [ ] Log dans la console : `❌ [CLUB ...] Club ID manquant`

**Test 2 : API ne répond pas**

**Comment tester :**
1. Désactiver temporairement l'API backend
2. Rafraîchir la page

**Vérifications :**
- [ ] Spinner de chargement s'affiche d'abord
- [ ] Message d'erreur s'affiche après timeout
- [ ] Pas de crash de l'application
- [ ] Log dans la console : `❌ [CLUB ...] Erreur lors du chargement`

**Test 3 : Club sans équipes**

**Comment tester :**
1. Utiliser un club_id qui n'a pas d'équipes

**Vérifications :**
- [ ] Message "Aucune équipe" s'affiche sur matchs/joueurs
- [ ] Pas de crash
- [ ] L'interface reste utilisable

---

### 8. 📊 Données réelles vs mockées

**Comparaison AVANT/APRÈS**

**AVANT (avec mock) :**
```typescript
players: 25,  // ❌ Toujours 25, hardcodé
coach: {
    name: 'Coach assigné',  // ❌ Toujours pareil
}
status: 'ACTIVE'  // ❌ Toujours ACTIVE
```

**APRÈS (avec API) :**
```typescript
players: team.player_count || 0,  // ✅ Nombre réel
coach: {
    name: 'Vrai nom du coach',  // ✅ Depuis l'API
}
status: team.status  // ✅ Statut réel (ACTIVE/INACTIVE)
```

**Vérifications :**
- [ ] Le nombre de joueurs varie selon l'équipe (pas toujours 25)
- [ ] Les statuts peuvent être différents (ACTIVE/INACTIVE)
- [ ] Les informations correspondent aux données backend

---

### 9. ⚡ Performance

**Test :** Vérifier les performances

**Vérifications :**
- [ ] Le club se charge en moins de 2 secondes
- [ ] Le changement d'équipe est instantané (déjà chargé)
- [ ] Pas de requêtes répétitives (cache actif)
- [ ] Le spinner s'affiche rapidement

**Dans l'onglet Network :**
- [ ] `/api/v1/clubs/{clubId}` appelé 1 seule fois
- [ ] Cache de 5 minutes actif (vérifier dans les headers)

---

### 10. 🔍 Logs de debug

**Test :** Vérifier que tous les logs sont présents

**Ouvrir la console et filtrer par emoji :**

**Club :**
```
🏢 [CLUB DASHBOARD] ...
🏢 [CLUB MATCHES] ...
🏢 [CLUB PLAYERS] ...
```

**Succès :**
```
✅ [CLUB ...] Club chargé
✅ [CLUB ...] Équipes chargées
✅ [CLUB ...] Données reçues
```

**Erreurs :**
```
❌ [CLUB ...] Erreur lors du chargement
❌ [CLUB ...] Club ID manquant
```

**Actions :**
```
⚽ [CLUB ...] Équipe sélectionnée
```

---

## 🎯 Résumé des tests

### Tests critiques (OBLIGATOIRES)
1. ✅ Connexion avec responsable de club
2. ✅ Dashboard affiche les équipes
3. ✅ Matchs affiche les équipes et leurs matchs
4. ✅ Joueurs affiche les équipes et leurs joueurs
5. ✅ Nombre de joueurs réel (pas 25 hardcodé)
6. ✅ Gestion d'erreur fonctionne

### Tests importants (RECOMMANDÉS)
7. ✅ Navigation entre les pages
8. ✅ Sélection d'équipes
9. ✅ États de chargement
10. ✅ Logs dans la console

### Tests optionnels (BONUS)
11. ✅ Responsive design
12. ✅ Performance/cache
13. ✅ Club sans équipes
14. ✅ Erreurs API

---

## 🐛 Problèmes connus et solutions

### Problème : "Aucun club associé à votre compte"
**Solution :** Vérifier que l'utilisateur a bien un `club_id` dans sa réponse de connexion

### Problème : Nombre de joueurs toujours à 0
**Solution :** Vérifier que le backend retourne bien `player_count` dans les équipes

### Problème : Les équipes ne s'affichent pas
**Solution :** Vérifier que `club.teams` existe et contient des données dans la réponse API

### Problème : Erreur 401 lors des appels API
**Solution :** Vérifier que le token est valide et non expiré

---

## 📝 Rapport de test

### Informations du test
- **Date :** _____________________
- **Testeur :** _____________________
- **Environnement :** DEV / STAGING / PROD
- **Navigateur :** _____________________

### Résultats

| Test | Statut | Commentaire |
|------|--------|-------------|
| Connexion | ⬜ Pass / ⬜ Fail | |
| Dashboard | ⬜ Pass / ⬜ Fail | |
| Matchs | ⬜ Pass / ⬜ Fail | |
| Joueurs | ⬜ Pass / ⬜ Fail | |
| Navigation | ⬜ Pass / ⬜ Fail | |
| Gestion erreur | ⬜ Pass / ⬜ Fail | |
| Performance | ⬜ Pass / ⬜ Fail | |
| Logs | ⬜ Pass / ⬜ Fail | |

### Bugs trouvés

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

### Commentaires

_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Version du guide :** 1.0  
**Dernière mise à jour :** 2025-10-24
