# Configuration des Redirections après Login - Documentation

## 📋 Résumé

Configuration du système de redirection automatique après la connexion basée sur le type d'utilisateur (Officiel, Coach, Admin).

## ✅ Modifications apportées

### 1. **Interface User étendue**
📁 `src/app/models/user.model.ts`

Ajout de deux nouvelles propriétés pour identifier le type d'utilisateur :

```typescript
export interface User {
  id?: string;
  slug?: string | null;
  email?: string;
  first_name?: string;
  last_name?: string;
  roles?: UserRole[];
  club_id?: string;
  team_id?: string;
  is_active?: boolean;
  is_official?: boolean;        // ✅ NOUVEAU - Pour les officiels
  is_coach?: boolean | number;  // ✅ NOUVEAU - Pour les coachs (true ou 1)
  created_at?: string;
  updated_at?: string;
}
```

### 2. **LoginComponent - Redirection après connexion**
📁 `src/app/pages/login/login.component.ts`

#### Modification de la méthode `onSubmit()` :

```typescript
onSubmit(): void {
  if (this.loginForm.invalid) {
    this.error = "Veuillez remplir tous les champs correctement.";
    return;
  }

  this.loading = true;
  const credentials = this.loginForm.value;

  this.authService.login(credentials)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Connexion réussie' 
        });
        
        // ✅ Récupérer l'utilisateur connecté
        const user = this.authService.currentUser;
        
        // ✅ Redirection basée sur le type d'utilisateur
        if (user?.is_official === true) {
          // Rediriger vers le dashboard des officiels
          this.router.navigate(['/officiel/dashboard']);
        } 
        else if (user?.is_coach === true || user?.is_coach === 1) {
          // Rediriger vers le dashboard des coachs
          this.router.navigate(['/mon-equipe/dashboard']);
        } 
        else {
          // Redirection par défaut (admin ou autre)
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Connexion échouée', 
          detail: err.error?.message || 'Identifiants incorrects' 
        });
        this.loading = false;
      }
    });
}
```

#### Modification de la méthode `ngOnInit()` :

Pour gérer les utilisateurs déjà connectés qui reviennent sur la page de login :

```typescript
ngOnInit(): void {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  // ✅ Si l'utilisateur est déjà connecté, le rediriger vers son dashboard
  if (this.authService.isAuthenticated()) {
    const user = this.authService.currentUser;
    
    if (user?.is_official === true) {
      this.router.navigate(['/officiel/dashboard']);
    } else if (user?.is_coach === true || user?.is_coach === 1) {
      this.router.navigate(['/mon-equipe/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
```

## 📊 Structure de données attendue du Backend

### Réponse de l'API de login :

```json
{
  "status": true,
  "data": {
    "user": {
      "id": "uuid",
      "slug": null,
      "email": "lauryndabire@gmail.com",
      "first_name": "Lauryn",
      "last_name": "DABIRE",
      "is_active": false,
      "is_official": true,    // ✅ Pour les officiels
      "is_coach": 0,          // ✅ Pour les coachs (0/1 ou false/true)
      "roles": []
    },
    "access_token": "..."
  }
}
```

### Exemple pour un Officiel :
```json
{
  "slug": null,
  "last_name": "DABIRE",
  "first_name": "Lauryn",
  "email": "lauryndabire@gmail.com",
  "is_active": false,
  "is_coach": 0,
  "is_official": true,    // ✅ TRUE = Officiel
  "roles": []
}
```

### Exemple pour un Coach :
```json
{
  "slug": null,
  "last_name": "TRAORE",
  "first_name": "Jean",
  "email": "jean.traore@club.com",
  "is_active": true,
  "is_coach": true,        // ✅ TRUE ou 1 = Coach
  "is_official": false,
  "team_id": "team-uuid",  // ID de l'équipe du coach
  "roles": []
}
```

### Exemple pour un Admin :
```json
{
  "slug": "admin",
  "last_name": "Admin",
  "first_name": "Super",
  "email": "admin@fasoleague.com",
  "is_active": true,
  "is_coach": 0,
  "is_official": false,
  "roles": [
    {
      "slug": "admin",
      "name": "Administrateur",
      "permissions": [...]
    }
  ]
}
```

## 🔄 Flux de Redirection

```
┌──────────────────────────────────────────────────────┐
│                  Page de Login                       │
└──────────────────────────────────────────────────────┘
                        ↓
              Saisie des identifiants
                        ↓
                  Appel API Login
                        ↓
           Réception des données User
                        ↓
         ┌──────────────┴──────────────┐
         ↓                             ↓
   is_official === true ?      is_coach === true/1 ?
         │                             │
         ↓ OUI                         ↓ OUI
 /officiel/dashboard          /mon-equipe/dashboard
         │                             │
         ↓ NON                         ↓ NON
         └──────────────┬──────────────┘
                        ↓
                  / (Dashboard Admin)
```

## 🎯 Cas d'utilisation

### 1. **Officiel se connecte**
```
Login → is_official: true
      → Redirect: /officiel/dashboard
      → Affiche: Dashboard des matchs assignés
```

### 2. **Coach se connecte**
```
Login → is_coach: true (ou 1)
      → Redirect: /mon-equipe/dashboard
      → Affiche: Dashboard de son équipe
```

### 3. **Admin se connecte**
```
Login → is_official: false, is_coach: false
      → Redirect: /
      → Affiche: Dashboard administrateur
```

### 4. **Manager de Club se connecte** (À venir)
```
Login → club_id: "uuid"
      → Redirect: /mon-club/dashboard
      → Affiche: Dashboard du club
```

## 🔒 Sécurité et Guards

Les routes sont protégées par `AuthGuard` :

```typescript
{
  path: 'officiel',
  component: OfficialLayout,
  canActivate: [AuthGuard],  // ✅ Protection
  children: [...]
}

{
  path: 'mon-equipe',
  component: CoachLayout,
  canActivate: [AuthGuard],  // ✅ Protection
  children: [...]
}
```

## 📝 Notes importantes

### Pour les Coachs :
- Le backend peut retourner `is_coach` comme :
  - **Boolean** : `true` ou `false`
  - **Number** : `1` ou `0`
- La condition gère les deux cas : `is_coach === true || is_coach === 1`

### Pour les Officiels :
- Le champ `is_official` doit être un **boolean** strict
- Seul `true` déclenche la redirection vers `/officiel/dashboard`

### Gestion des utilisateurs déjà connectés :
- Si un utilisateur déjà connecté accède à `/login`, il est automatiquement redirigé vers son dashboard approprié
- Évite que l'utilisateur reste bloqué sur la page de login

## 🚀 Test

### Tester la redirection :

1. **Pour un Officiel :**
   ```json
   POST /api/auth/login
   {
     "email": "officiel@test.com",
     "password": "password"
   }
   
   Réponse attendue :
   {
     "is_official": true,
     ...
   }
   
   ✅ Doit rediriger vers: /officiel/dashboard
   ```

2. **Pour un Coach :**
   ```json
   POST /api/auth/login
   {
     "email": "coach@test.com",
     "password": "password"
   }
   
   Réponse attendue :
   {
     "is_coach": true,  // ou is_coach: 1
     "team_id": "uuid",
     ...
   }
   
   ✅ Doit rediriger vers: /mon-equipe/dashboard
   ```

3. **Pour un Admin :**
   ```json
   POST /api/auth/login
   {
     "email": "admin@test.com",
     "password": "password"
   }
   
   Réponse attendue :
   {
     "is_official": false,
     "is_coach": 0,
     "roles": [{"slug": "admin", ...}],
     ...
   }
   
   ✅ Doit rediriger vers: /
   ```

## 🔧 Améliorations futures

### 1. **Ajout du Manager de Club**

Quand le backend sera prêt, ajouter dans `onSubmit()` :

```typescript
// Après les vérifications existantes
if (user?.club_id) {
  this.router.navigate(['/mon-club/dashboard']);
}
```

### 2. **Guard spécifique par rôle**

Créer des guards pour vérifier le type d'utilisateur :

```typescript
// official.guard.ts
@Injectable({ providedIn: 'root' })
export class OfficialGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.currentUser;
    if (user?.is_official === true) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
```

### 3. **Message de bienvenue personnalisé**

Afficher un message selon le type d'utilisateur :

```typescript
if (user?.is_official === true) {
  this.messageService.add({ 
    severity: 'success', 
    summary: 'Bienvenue Officiel',
    detail: 'Accès à vos matchs assignés'
  });
  this.router.navigate(['/officiel/dashboard']);
}
```

## ✅ Checklist

- [x] Interface User mise à jour avec `is_official` et `is_coach`
- [x] LoginComponent configure les redirections
- [x] Gestion des utilisateurs déjà connectés
- [x] Support des deux formats pour `is_coach` (boolean et number)
- [x] Compilation réussie
- [ ] Tests avec backend réel
- [ ] Ajout du Manager de Club (quand backend prêt)
- [ ] Guards spécifiques par rôle
- [ ] Messages de bienvenue personnalisés

## 📊 État

```
✅ Configuration terminée
✅ Compilation réussie
✅ Support Officiel
✅ Support Coach
✅ Support Admin
⏳ Manager de Club (à venir)
✅ Prêt pour test avec backend
```

---
**Date de mise à jour:** 2025-10-09
**Version:** 1.0.0
