# 🔍 Guide des Logs de Debug - Coach

## 📋 Vue d'ensemble

Des logs détaillés ont été ajoutés pour tracer le flux de données lors de la connexion d'un coach.

---

## 🔐 Logs d'Authentification

### Lors de la connexion (Login)

Ouvrez la console du navigateur (F12) et vous verrez :

```
🔐 [AUTH] Réponse complète du backend: { ... }
👤 [AUTH] User reçu: { id, email, first_name, ... }
🏷️ [AUTH] User ID: "abc-123"
🏟️ [AUTH] Team ID: "team-456"
👔 [AUTH] Coach ID: "coach-789"
✅ [AUTH] Is Coach: true
📋 [AUTH] Roles: [{ slug: "coach", name: "Coach", ... }]
🔑 [AUTH] Token: Token présent
```

### ✅ Que vérifier :

1. **Team ID présent** - Le `team_id` doit être une chaîne non vide
2. **Is Coach = true** - Confirme que l'utilisateur est un coach
3. **Token présent** - Le JWT est bien retourné
4. **Structure de l'objet User** - Noter les champs disponibles

### ❌ Problèmes courants :

**Problème :** `Team ID: undefined`
```
👔 [AUTH] Team ID: undefined
```
**Solution :** Le backend ne retourne pas `team_id` dans l'objet user. Vérifier l'API `/auth/login`.

**Problème :** `Is Coach: false` ou `undefined`
```
✅ [AUTH] Is Coach: false
```
**Solution :** Le champ `is_coach` n'est pas défini ou est faux. Vérifier les données utilisateur.

---

## 📊 Logs du Dashboard

### Chargement des données du coach

```
📊 [DASHBOARD] Chargement des données du coach
👤 [DASHBOARD] Current User: { id, team_id, ... }
🏟️ [DASHBOARD] Team ID à utiliser: "team-456"
🆔 [DASHBOARD] Team ID depuis @Input: undefined
🆔 [DASHBOARD] Team ID depuis user: "team-456"
🔄 [DASHBOARD] Appel API GET /teams/team-456
```

### Service EquipeService

```
🔄 [EQUIPE SERVICE] GET /teams/team-456
📥 [EQUIPE SERVICE] Réponse brute du backend: { status, data, message }
✅ [EQUIPE SERVICE] Extraction: res.data.team
```

### Réception des données

```
✅ [DASHBOARD] Équipe reçue du backend: { id, name, logo, ... }
📦 [DASHBOARD] Team Data formatée: { id, name, coach, ... }
```

### ✅ Que vérifier :

1. **Team ID correct** - Le même ID que celui du login
2. **Réponse du backend** - Structure de la réponse API
3. **Extraction réussie** - Les données sont bien extraites
4. **Données de l'équipe** - Nom, logo, catégorie, etc.

### ❌ Problèmes courants :

**Problème :** `Team ID: undefined`
```
❌ [DASHBOARD] Aucun team_id trouvé!
```
**Solution :** L'utilisateur n'a pas de `team_id`. Vérifier que le login retourne bien ce champ.

**Problème :** Erreur 404
```
❌ [DASHBOARD] Status: 404
❌ [DASHBOARD] Message: Not Found
```
**Solution :** L'équipe n'existe pas dans la base de données. Vérifier l'ID.

**Problème :** Erreur 401
```
❌ [DASHBOARD] Status: 401
❌ [DASHBOARD] Message: Unauthorized
```
**Solution :** Le token JWT n'est pas envoyé ou est invalide. Vérifier l'interceptor.

---

## ⚽ Logs des Matchs

### Chargement des matchs

```
⚽ [MATCHS] Chargement des matchs du coach
👤 [MATCHS] Current User: { ... }
🏟️ [MATCHS] Team ID: "team-456"
🔄 [MATCHS] Appel API GET /teams/team-456/matches
```

### Service MatchService

```
🔄 [MATCH SERVICE] GET https://.../api/v1/teams/team-456/matches
📋 [MATCH SERVICE] Params: { status: "upcoming" }
📥 [MATCH SERVICE] Réponse brute du backend: { status, data, message }
✅ [MATCH SERVICE] Extraction: res.data.data.matches
```

### Traitement des données

```
✅ [MATCHS] Matchs à venir reçus: [{ id, competition, opponent, ... }]
✅ [MATCHS] Matchs joués reçus: [{ ... }]
📊 [MATCHS] Nombre matchs à venir: 5
📊 [MATCHS] Nombre matchs joués: 12
📦 [MATCHS] Total matchs combinés: 17
🔄 [MATCHS] Matchs convertis au format coach: [{ ... }]
📋 [MATCHS] Matchs groupés par compétition: { "Championnat D1": [...], "Coupe": [...] }
```

### ✅ Que vérifier :

1. **Nombre de matchs** - Vérifier que des matchs sont retournés
2. **Structure des matchs** - Format de chaque match
3. **Conversion réussie** - Les matchs sont bien convertis
4. **Groupement correct** - Matchs groupés par compétition

### ❌ Problèmes courants :

**Problème :** Nombre de matchs = 0
```
📊 [MATCHS] Nombre matchs à venir: 0
📊 [MATCHS] Nombre matchs joués: 0
```
**Solution :** L'équipe n'a pas de matchs ou le filtre ne fonctionne pas. Vérifier les données.

**Problème :** Structure non reconnue
```
⚠️ [MATCH SERVICE] Aucune structure reconnue, retour tableau vide
```
**Solution :** La structure de réponse du backend est différente. Noter la structure exacte dans les logs et adapter le code.

**Problème :** Utilisation des données de mock
```
⚠️ [MATCH SERVICE] Utilisation des données de mock
```
**Solution :** L'API a échoué, les données de test sont utilisées. Vérifier l'erreur précédente.

---

## 📖 Comment Utiliser les Logs

### 1. Ouvrir la Console du Navigateur

**Chrome/Edge/Firefox :**
- Appuyez sur `F12`
- Allez dans l'onglet `Console`
- Assurez-vous que tous les niveaux de logs sont activés (Info, Warn, Error)

### 2. Effacer les Logs

```javascript
// Dans la console
console.clear()
```

### 3. Filtrer les Logs

**Filtrer par catégorie :**
```javascript
// Voir uniquement les logs d'authentification
[AUTH]

// Voir uniquement les logs du dashboard
[DASHBOARD]

// Voir uniquement les logs des matchs
[MATCHS]
```

**Filtrer par niveau :**
```javascript
// Voir uniquement les erreurs
❌

// Voir uniquement les succès
✅

// Voir les appels API
🔄
```

### 4. Copier les Logs

1. Clic droit sur un log
2. "Copy message" ou "Copy object"
3. Coller dans un éditeur de texte

### 5. Examiner un Objet

```javascript
// Dans la console, cliquer sur l'objet pour l'explorer
▶ {status: true, data: {...}, message: "succès"}
  ▶ data:
    ▶ team:
        id: "team-456"
        name: "Mon Équipe"
        logo: "https://..."
```

---

## 🔍 Exemples de Scénarios

### Scénario 1 : Connexion Réussie

```
🔐 [AUTH] Réponse complète du backend: {status: true, data: {...}}
👤 [AUTH] User reçu: {id: "u123", team_id: "t456", is_coach: true}
🏟️ [AUTH] Team ID: "t456"
✅ [AUTH] Is Coach: true
🔑 [AUTH] Token: Token présent

📊 [DASHBOARD] Chargement des données du coach
🏟️ [DASHBOARD] Team ID à utiliser: "t456"
🔄 [DASHBOARD] Appel API GET /teams/t456
📥 [EQUIPE SERVICE] Réponse brute du backend: {status: true, data: {...}}
✅ [DASHBOARD] Équipe reçue du backend: {id: "t456", name: "AS Fasofoot"}
```

**✅ Résultat :** Connexion réussie, données chargées

---

### Scénario 2 : Team ID Manquant

```
🔐 [AUTH] Réponse complète du backend: {status: true, data: {...}}
👤 [AUTH] User reçu: {id: "u123", is_coach: true}
🏟️ [AUTH] Team ID: undefined
⚠️ [AUTH] Team ID manquant dans la réponse!

📊 [DASHBOARD] Chargement des données du coach
🏟️ [DASHBOARD] Team ID à utiliser: undefined
❌ [DASHBOARD] Aucun team_id trouvé!
```

**❌ Résultat :** Échec - Le backend ne retourne pas `team_id`

**🔧 Solution :** Corriger l'API `/auth/login` pour inclure `team_id` dans l'objet user

---

### Scénario 3 : Structure de Réponse Différente

```
🔄 [MATCH SERVICE] GET /teams/t456/matches
📥 [MATCH SERVICE] Réponse brute du backend: {
  success: true,
  result: {
    matches: [...]
  }
}
⚠️ [MATCH SERVICE] Aucune structure reconnue, retour tableau vide
```

**❌ Résultat :** Structure non reconnue, aucun match affiché

**🔧 Solution :** Adapter le service pour extraire `res.result.matches` :

```typescript
// Dans match.service.ts
map(res => {
  if (res?.result?.matches) {
    console.log('✅ [MATCH SERVICE] Extraction: res.result.matches');
    return res.result.matches as MatchItem[];
  }
  // ...
})
```

---

## 🎯 Checklist de Debug

### Étape 1 : Vérifier la Connexion

- [ ] Logs `[AUTH]` présents
- [ ] `Team ID` défini et non undefined
- [ ] `Is Coach` = true
- [ ] `Token` présent
- [ ] Structure de l'objet User notée

### Étape 2 : Vérifier le Dashboard

- [ ] Logs `[DASHBOARD]` présents
- [ ] `Team ID` correct (même que login)
- [ ] Appel API `/teams/:id` effectué
- [ ] Réponse du backend reçue
- [ ] Données de l'équipe extraites
- [ ] Aucune erreur 404/401

### Étape 3 : Vérifier les Matchs

- [ ] Logs `[MATCHS]` présents
- [ ] Appels API pour matchs à venir et joués
- [ ] Réponses reçues du backend
- [ ] Nombre de matchs > 0
- [ ] Conversion au format coach réussie
- [ ] Groupement par compétition OK

### Étape 4 : Noter les Structures

Copier et sauvegarder les structures exactes :

```javascript
// Structure de l'objet User
{
  id: "...",
  team_id: "...",
  is_coach: true,
  // ... autres champs
}

// Structure de la réponse /teams/:id
{
  status: true,
  data: {
    // ... structure exacte
  }
}

// Structure de la réponse /teams/:id/matches
{
  status: true,
  data: {
    // ... structure exacte
  }
}
```

---

## 📚 Documentation Associée

- [IMPLEMENTATION_COACH_REDIRECTION.md](./IMPLEMENTATION_COACH_REDIRECTION.md)
- [INTEGRATION_MATCHS_COACH.md](./INTEGRATION_MATCHS_COACH.md)
- [ENDPOINTS_DISPONIBLES_COACH.md](./ENDPOINTS_DISPONIBLES_COACH.md)
- [CORRECTIONS_FINALES.md](./CORRECTIONS_FINALES.md)

---

## 💡 Conseils

1. **Toujours commencer par les logs d'authentification** - Si `team_id` manque ici, tout le reste échouera
2. **Copier les structures exactes** - Ne pas deviner, noter exactement ce que le backend retourne
3. **Vérifier les erreurs HTTP** - 401, 403, 404 donnent des indices sur le problème
4. **Utiliser les émojis pour filtrer** - Chercher `❌` pour voir uniquement les erreurs
5. **Prendre des captures d'écran** - Pour partager avec l'équipe backend si nécessaire

---

## ✅ Résultat Attendu

Avec une connexion réussie, vous devriez voir cette séquence complète :

```
🔐 [AUTH] Connexion réussie
👤 [AUTH] User avec team_id
📊 [DASHBOARD] Chargement équipe
✅ [DASHBOARD] Équipe reçue
⚽ [MATCHS] Chargement matchs
✅ [MATCHS] X matchs reçus
📋 [MATCHS] Matchs groupés et affichés
```

Bon debug ! 🚀
