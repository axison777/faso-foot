# Guide de Debugging - Affichage des Matchs

## Problème
Aucun match ne s'affiche sur la page `/mon-equipe/matchs`

## Étapes de Debugging

### 1. Ouvrez la Console du Navigateur
1. Appuyez sur `F12` ou `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Allez dans l'onglet **Console**
3. Naviguez vers la page `/mon-equipe/matchs`

### 2. Vérifiez les Logs dans la Console

Vous devriez voir une séquence de logs comme celle-ci :

```
⚽ [COACH MATCHES] Chargement des matchs
👤 [COACH MATCHES] User: { ... }
🏟️ [COACH MATCHES] Team ID: xxx-xxx-xxx
🔄 [MATCH SERVICE] GET ALL matches for team xxx-xxx-xxx
📍 [MATCH SERVICE] URL: https://....../api/v1/teams/xxx/matches
📥 [MATCH SERVICE] Réponse brute: [...]
✅ [COACH MATCHES] Matchs reçus: [...]
📊 [COACH MATCHES] Nombre de matchs bruts: X
🔄 [CONVERT] Conversion de X matchs pour team_id: xxx
📝 [CONVERT] Match 1: { ... }
✅ [CONVERT] Match 1 converti: ...
...
🔄 [COACH MATCHES] Matchs convertis: [...]
📊 [COACH MATCHES] Nombre de matchs convertis: X
🏆 [COACH MATCHES] Saisons extraites: [...]
🏆 [COACH MATCHES] Compétitions extraites: [...]
✅ [COACH MATCHES] Matchs filtrés: [...]
📊 [COACH MATCHES] Nombre de matchs filtrés: X
⭐ [COACH MATCHES] Match le plus proche: { ... }
```

### 3. Diagnostics Possibles

#### Cas 1 : Erreur "Aucune équipe assignée à votre compte"
```
❌ [COACH MATCHES] Aucun team_id trouvé!
```

**Solution** : Le coach n'a pas de `team_id` dans son profil utilisateur.
- Vérifiez dans la console : `👤 [COACH MATCHES] User: { ... }`
- Le champ `team_id` doit être présent et non null

**Action** :
1. Vérifiez dans la base de données que le coach a bien un `team_id`
2. Ou assurez-vous que le backend retourne le `team_id` dans les données utilisateur

---

#### Cas 2 : Erreur réseau (404, 500, etc.)
```
❌ [COACH MATCHES] Erreur: HttpErrorResponse {...}
❌ [COACH MATCHES] Status: 404
❌ [COACH MATCHES] Message: Not Found
```

**Problèmes possibles** :
- L'endpoint `/api/v1/teams/{teamId}/matches` n'existe pas
- Le serveur backend est arrêté
- URL incorrecte dans `environment.development.ts`

**Actions** :
1. Vérifiez que le backend est en cours d'exécution
2. Testez l'endpoint directement :
   ```bash
   curl https://votre-api.com/api/v1/teams/{teamId}/matches
   ```
3. Vérifiez l'URL dans [environment.development.ts](file:///c:/Users/LENOVO/Documents/fasofoot/calendrier-fasofoot-fronted/src/environments/environment.development.ts)

---

#### Cas 3 : Aucun match reçu du backend
```
⚠️ [COACH MATCHES] Aucun match reçu du backend
📊 [COACH MATCHES] Nombre de matchs bruts: 0
```

**Problème** : Le backend retourne un tableau vide ou null

**Actions** :
1. Vérifiez dans la base de données s'il y a des matchs pour cette équipe :
   ```sql
   SELECT * FROM matches 
   WHERE team_one_id = 'xxx' OR team_two_id = 'xxx';
   ```
2. Testez l'API directement avec Postman ou curl
3. Vérifiez les logs du backend

---

#### Cas 4 : Structure de données incorrecte
```
❌ [CONVERT] Erreur lors de la conversion du match 1: TypeError: Cannot read property 'name' of undefined
```

**Problème** : La structure des données du backend ne correspond pas à celle attendue

**Actions** :
1. Regardez la structure exacte dans la console :
   ```
   📥 [MATCH SERVICE] Réponse brute: [...]
   ```
2. Comparez avec la structure attendue dans `BackendMatch` interface
3. Vérifiez que tous les champs requis sont présents :
   - `team_one` avec `name`, `abbreviation`, `logo`
   - `team_two` avec `name`, `abbreviation`, `logo`
   - `pool` avec `id`, `name`
   - `season` avec `id`, `start_date`, `end_date`
   - `stadium` avec `id`, `name`
   - `match_day` avec `number`, `leg`

**Exemple de données correctes** :
```json
{
  "id": "xxx",
  "team_one_id": "yyy",
  "team_two_id": "zzz",
  "scheduled_at": "2027-05-30T16:00:00.000000Z",
  "team_one": {
    "id": "yyy",
    "name": "AS SONABEL",
    "abbreviation": "ASS",
    "logo": "http://..."
  },
  "team_two": {
    "id": "zzz",
    "name": "Karen Cash",
    "abbreviation": "KC",
    "logo": "http://..."
  },
  "pool": {
    "id": "aaa",
    "name": "Poule unique"
  },
  "season": {
    "id": "bbb",
    "start_date": "2025-07-30",
    "end_date": "2027-05-30"
  },
  "stadium": {
    "id": "ccc",
    "name": "Stade de Kossodo"
  },
  "match_day": {
    "number": 46,
    "leg": "second_led"
  }
}
```

---

#### Cas 5 : Matchs convertis mais aucun affiché (après filtrage)
```
📊 [COACH MATCHES] Nombre de matchs convertis: 5
✅ [COACH MATCHES] Matchs filtrés: []
📊 [COACH MATCHES] Nombre de matchs filtrés: 0
```

**Problème** : Les filtres éliminent tous les matchs

**Actions** :
1. Cliquez sur le bouton "Réinitialiser" dans les filtres
2. Vérifiez les valeurs des filtres dans la console
3. Désactivez temporairement les filtres en modifiant `applyFilters()`

---

#### Cas 6 : Problème de CORS
```
Access to XMLHttpRequest at 'https://...' from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solution** : Le backend doit autoriser les requêtes depuis localhost:4200

**Action** : Configurez CORS sur le backend Laravel :
```php
// config/cors.php
'allowed_origins' => ['http://localhost:4200'],
```

---

### 4. Tests Manuels

#### Test 1 : Vérifier l'API directement
```bash
# Remplacez {teamId} par l'ID de votre équipe
curl -X GET "https://117012887f613816ccc2df239546d16e.serveo.net/api/v1/teams/{teamId}/matches" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer {votre_token}"
```

#### Test 2 : Forcer l'affichage de données de test
Temporairement, modifiez le composant pour utiliser des données mockées :

```typescript
// Dans loadMatches(), après le subscribe
next: (rawMatches: any[]) => {
  // TEMPORAIRE - Données de test
  const testMatches = [{
    id: 'test-1',
    team_one_id: userTeamId,
    team_two_id: 'other-team',
    scheduled_at: '2025-12-25T15:00:00Z',
    team_one: { id: userTeamId, name: 'Mon Équipe', abbreviation: 'MON', logo: '' },
    team_two: { id: 'other', name: 'Adversaire', abbreviation: 'ADV', logo: '' },
    pool: { id: 'p1', name: 'Championnat' },
    season: { id: 's1', start_date: '2025-01-01', end_date: '2025-12-31' },
    stadium: { id: 'st1', name: 'Stade Test' },
    match_day: { number: 1, leg: 'first' },
    is_derby: 0,
    is_rescheduled: 0
  }];
  
  console.log('🧪 [TEST] Utilisation de données de test');
  // Continuez avec testMatches au lieu de rawMatches
  const displayMatches = this.convertMatches(testMatches as any, userTeamId);
  // ...
}
```

Si les données de test s'affichent, le problème vient du backend.

---

### 5. Checklist de Vérification

- [ ] Le serveur backend est démarré
- [ ] L'URL de l'API est correcte dans `environment.development.ts`
- [ ] Le coach a un `team_id` valide dans son profil
- [ ] L'endpoint `/api/v1/teams/{teamId}/matches` retourne des données
- [ ] La structure des données correspond à l'interface `BackendMatch`
- [ ] Il n'y a pas d'erreur CORS
- [ ] Il y a au moins un match dans la base de données pour cette équipe
- [ ] Le token d'authentification est valide

---

### 6. Informations à Fournir pour Support

Si le problème persiste, fournissez :

1. **Logs de la console** (copier tout le texte)
2. **Réponse de l'API** (le contenu exact de `📥 [MATCH SERVICE] Réponse brute`)
3. **Team ID** utilisé
4. **Capture d'écran** de la page
5. **Erreurs éventuelles** dans l'onglet Network (F12 → Network)

---

## Solutions Rapides

### Redémarrage Complet
```bash
# Arrêter le serveur Angular (Ctrl+C)
# Nettoyer le cache
rm -rf node_modules/.cache
# Redémarrer
npm start
```

### Vider le Cache du Navigateur
1. `Ctrl+Shift+Delete`
2. Cocher "Cookies" et "Cache"
3. Effacer
4. Recharger la page (`Ctrl+F5`)

### Vérifier la Connexion
Ouvrez [environment.development.ts](file:///c:/Users/LENOVO/Documents/fasofoot/calendrier-fasofoot-fronted/src/environments/environment.development.ts) et vérifiez que l'URL est correcte.

Actuellement : `https://117012887f613816ccc2df239546d16e.serveo.net/api/v1`

Testez l'URL dans le navigateur : `https://117012887f613816ccc2df239546d16e.serveo.net/api/v1/teams/{teamId}/matches`
