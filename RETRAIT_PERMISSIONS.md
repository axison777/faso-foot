# 🔓 Retrait complet du système de permissions

## Décision

Le système de permissions sera réimplémenté **APRÈS** la finalisation complète de la plateforme.

## Fichiers à modifier

### Pages principales (17 composants)

1. **accueil** - Dashboard principal
2. **villes** - Gestion des villes  
3. **stades** - Gestion des stades
4. **users** - Gestion des utilisateurs
5. **saisons** - Gestion des saisons
6. **roles** - Gestion des rôles
7. **team-categories** - Catégories d'équipes
8. **matchs** - Gestion des matchs
9. **ligues** - Gestion des ligues
10. **club-details** - Détails club
11. **club-dashboard** - Espace club (déjà fait)
12. **coach-dashboard** - Espace coach (déjà fait)

## Actions à effectuer

### 1. Dans les templates (.html)
Retirer **toutes** les directives `*hasPermission="'...'"` et `*hasPermission`

### 2. Dans les composants (.ts)
- Retirer l'import : `import { HasPermissionDirective } from '../../directives/has-permission.directive';`
- Retirer de l'array `imports: []` : `HasPermissionDirective`

## Réactivation future

Le fichier `has-permission.directive.ts` sera conservé pour réactivation ultérieure.

### Pour réactiver les permissions (plus tard) :
1. Réimporter `HasPermissionDirective` dans les composants
2. Rajouter les directives `*hasPermission` dans les templates
3. Créer les permissions dans la base de données
4. Assigner les permissions aux rôles
