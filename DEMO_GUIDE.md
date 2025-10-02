# 🎯 Guide de démonstration visuelle

## 🚀 Comment voir les nouveaux espaces

### 1. Démarrer l'application

```bash
npm start
```

L'application sera accessible sur **http://localhost:4200**

### 2. Se connecter

Connectez-vous avec un utilisateur qui a les permissions appropriées :
- Pour `/mon-club` : permission `acceder-espace-club`
- Pour `/mon-equipe` : permission `acceder-espace-coach`

### 3. Accéder aux nouveaux espaces

#### Option A : Via URL directe

Une fois connecté, naviguez vers :
- **Espace Club** : http://localhost:4200/mon-club
- **Espace Coach** : http://localhost:4200/mon-equipe

#### Option B : Ajouter des liens dans la navigation

Vous pouvez temporairement ajouter des liens dans le menu de navigation pour faciliter l'accès.

## 📊 Mode Démonstration (données fictives)

Les composants sont configurés en **mode démonstration** avec des données mockées pour que vous puissiez voir le rendu visuel **sans backend**.

### Données de démonstration

#### Espace Club (`/mon-club`)
- **Club** : FC Ouagadougou
- **3 équipes** : Seniors, U19, U17
- **Stats globales** : 45 matchs, 28 V, 10 N, 7 D
- Pour chaque équipe :
  - Prochain match contre un adversaire
  - Statistiques détaillées
  - Liste de matchs (à jouer et joués)

#### Espace Coach (`/mon-equipe`)
- **Équipe** : AS Bobo-Dioulasso
- **Stats** : 15 matchs, 9 V, 4 N, 2 D
- **Prochain match** : dans 3 jours
- **25 joueurs** dans l'équipe

### Ce que vous verrez

✅ **Design responsive** (testez sur mobile/tablette/desktop)  
✅ **Cartes de statistiques** colorées et animées  
✅ **Prochain match** en carte verte mise en évidence  
✅ **Tabs par équipe** (espace club)  
✅ **Onglets À jouer / Joués** pour les matchs  
✅ **Badges** pour domicile/extérieur  
✅ **Forme récente** (V/N/D des 5 derniers matchs)  
✅ **Logos d'équipes** (placeholders colorés)  

## 🔧 Passer au mode production

Quand le backend sera prêt avec les vrais endpoints, modifiez cette ligne dans chaque composant :

```typescript
useMockData = false; // Au lieu de true
```

Fichiers à modifier :
- `src/app/pages/club-dashboard/club-dashboard.component.ts` (ligne ~41)
- `src/app/pages/coach-dashboard/coach-dashboard.component.ts` (ligne ~35)
- `src/app/components/dashboard/matches-list.component.ts` (ligne ~278)

## 🎨 Aperçu visuel attendu

### Espace Club
```
┌─────────────────────────────────────────────┐
│ Mon Club                                     │
├─────────────────────────────────────────────┤
│ [Logo] FC Ouagadougou                        │
│        3 équipe(s)                           │
├─────────────────────────────────────────────┤
│ Statistiques Globales du Club               │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                │
│ │ 45 │ │ 28 │ │ 10 │ │  7 │                │
│ │Joués│ │ V  │ │ N  │ │ D  │                │
│ └────┘ └────┘ └────┘ └────┘                │
│ Buts: 82 - 35                                │
├─────────────────────────────────────────────┤
│ [Seniors] [U19] [U17] ← Tabs                │
├─────────────────────────────────────────────┤
│ ┌─ Prochain Match ──────────────────────┐   │
│ │ ASFA Yennenga                          │   │
│ │ 📅 Mercredi 15 octobre 2025           │   │
│ │ 🕐 15:00  📍 Stade du 4 Août          │   │
│ │ 🏠 Domicile                  [J-3]     │   │
│ └────────────────────────────────────────┘   │
│ [Stats équipe]                               │
│ [Liste matchs: À jouer / Joués]              │
└─────────────────────────────────────────────┘
```

### Espace Coach
```
┌─────────────────────────────────────────────┐
│ Mon Équipe                                   │
├─────────────────────────────────────────────┤
│ [Logo] AS Bobo-Dioulasso                     │
│        Seniors - AS Bobo-Dioulasso           │
├─────────────────────────────────────────────┤
│ ┌─ Prochain Match ──────────────────────┐   │
│ │ ASFA Yennenga [Logo]                   │   │
│ │ 📅 Mercredi 15 octobre 2025           │   │
│ │ 🕐 15:00  📍 Stade du 4 Août          │   │
│ │ 🏠 Domicile                  [J-3]     │   │
│ └────────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│ Statistiques de l'équipe                     │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                │
│ │ 15 │ │  9 │ │  4 │ │  2 │                │
│ │Joués│ │ V  │ │ N  │ │ D  │                │
│ └────┘ └────┘ └────┘ └────┘                │
│ Buts: 28 marqués / 12 encaissés              │
│ Forme: V V N V D                             │
├─────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐                   │
│ │ Diff buts│ │ Joueurs  │                   │
│ │   +16    │ │    25    │                   │
│ └──────────┘ └──────────┘                   │
├─────────────────────────────────────────────┤
│ Compétition: [Toutes les compétitions ▼]    │
│ ┌─ À jouer ──┬─ Joués ─┐                   │
│ │ N° Date Adv. Stade    │                   │
│ │ 16 15/10 ASF Stade... │                   │
│ │ 17 22/10 RCK Muni...  │                   │
│ └───────────────────────┘                   │
└─────────────────────────────────────────────┘
```

## 📱 Test responsive

Testez ces dimensions :
- **Desktop** : > 1024px → Grilles 4 colonnes
- **Tablet** : 768-1024px → Grilles 2 colonnes
- **Mobile** : < 768px → 1 colonne, cartes empilées

Utilisez les DevTools Chrome (F12) > Toggle device toolbar

## 🎨 Palette de couleurs utilisée

- **Vert principal** : `rgb(50,145,87)` / `#329157`
- **Vert foncé** : `rgb(22,123,74)` / `#167B4A`
- **Victoire** : `#22c55e` (vert clair)
- **Nul** : `#f59e0b` (orange)
- **Défaite** : `#dc2626` (rouge)
- **Fond** : `#f8fafc` (gris très clair)

## 🔍 Points à vérifier

- [ ] Les cartes s'affichent correctement
- [ ] Les couleurs sont cohérentes avec le reste de l'app
- [ ] Les tabs fonctionnent (pour l'espace club)
- [ ] Les onglets À jouer / Joués fonctionnent
- [ ] Le responsive fonctionne (mobile/desktop)
- [ ] Les badges (Domicile/Extérieur, V/N/D) s'affichent
- [ ] Le prochain match montre le countdown "J-X"
- [ ] Les logos placeholder s'affichent quand pas d'image

## 🐛 Dépannage

### Erreur de compilation
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm start
```

### Page blanche
- Vérifiez la console du navigateur (F12)
- Vérifiez que vous êtes connecté
- Vérifiez que l'utilisateur a les permissions

### Pas de données affichées
- Vérifiez que `useMockData = true` dans les composants
- Regardez la console pour d'éventuelles erreurs

## 📸 Captures d'écran

N'hésitez pas à faire des captures d'écran et les partager pour feedback !

## 🔄 Prochaines étapes

1. ✅ Voir le rendu visuel avec les données mockées
2. ⏳ Implémenter les endpoints backend
3. ⏳ Passer `useMockData` à `false`
4. ⏳ Tester avec de vraies données
5. ⏳ Ajuster le design si nécessaire
