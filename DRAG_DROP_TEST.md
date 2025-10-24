# 🧪 Guide de Test - Système Drag & Drop

## ✅ Configuration Desktop

Le système drag & drop est maintenant configuré et devrait fonctionner en desktop.

### 📋 Liste de vérification

#### 1. **Test de base - Liste vers Terrain**
- [ ] Ouvrir le composant pitch-setup
- [ ] Vérifier que la liste des joueurs disponibles est visible à droite
- [ ] Essayer de glisser un joueur de la liste vers une position vide sur le terrain
- [ ] Le joueur devrait apparaître sur le terrain
- [ ] Il devrait disparaître de la liste disponible

#### 2. **Test - Position à Position**
- [ ] Glisser un joueur déjà sur le terrain vers une autre position
- [ ] La position devrait se mettre à jour correctement

#### 3. **Test - Terrain vers Remplaçants**
- [ ] Glisser un joueur du terrain vers la zone remplaçants
- [ ] Il devrait apparaître dans la liste des remplaçants
- [ ] La position sur le terrain devrait redevenir vide

#### 4. **Test - Liste vers Remplaçants**
- [ ] Glisser un joueur de la liste disponible vers les remplaçants
- [ ] Il devrait être ajouté aux remplaçants

#### 5. **Test - Retour à la liste**
- [ ] Glisser un titulaire vers la liste disponible
- [ ] Il devrait redevenir disponible

### 🎨 Retours Visuels Attendus

#### Pendant le drag
- ✨ Le joueur devient légèrement transparent (opacity: 0.9)
- ✨ Ombre portée accentuée
- ✨ Curseur change en "grabbing" (main fermée)

#### Sur les zones de drop
- 🎯 Les positions vides s'agrandissent légèrement
- 🟢 Bordure verte apparaît sur survol
- 📦 Placeholder (espace vide) indique où le joueur sera déposé

#### Sur les listes
- 🟢 Fond vert clair sur la liste disponible pendant survol
- 🟠 Fond orange clair sur les remplaçants pendant survol

---

## 🐛 Problèmes Potentiels

### Si le drag ne fonctionne pas :

#### 1. **Vérifier la console du navigateur**
```
F12 > Console
```
Chercher des erreurs liées à CDK ou DragDrop

#### 2. **Vérifier que les joueurs sont bien chargés**
- La liste des joueurs doit être remplie depuis `availablePlayersData`
- Vérifier dans les DevTools : `this.roster` doit contenir des joueurs

#### 3. **Vérifier les IDs des drop lists**
Ouvrir les DevTools et inspecter :
- Les positions doivent avoir des IDs : `position-0`, `position-1`, etc.
- La liste disponible doit avoir l'ID : `available-players`
- Les remplaçants doivent avoir l'ID : `substitutes-list`

#### 4. **Vérifier les connexions**
Dans la console Angular :
```javascript
// Chaque drop list doit être connecté aux autres
document.querySelectorAll('[cdkdroplist]')
```

---

## 💡 Points Techniques

### Structure du Drag & Drop

1. **Liste Disponible** (`available-players`)
   - Connectée à : toutes les positions + remplaçants
   - Contient : `this.unselected`

2. **Positions sur Terrain** (`position-0` à `position-10`)
   - Connectées à : liste disponible + remplaçants
   - Contiennent : un seul joueur ou vide

3. **Remplaçants** (`substitutes-list`)
   - Connectés à : toutes les positions + liste disponible
   - Contient : `this.substitutes`

### Méthodes importantes

- `getPositionIds()` : Retourne tous les IDs des positions
- `onPlayerDropped()` : Gère le drop sur une position du terrain
- `onPlayerListDrop()` : Gère le drop sur la liste disponible
- `onSubstitutesDrop()` : Gère le drop sur les remplaçants
- `syncLists()` : Synchronise toutes les listes après un changement

---

## 🎯 Test Complet

### Scénario de test complet :

1. **Initialisation**
   - Ouvrir le composant avec des joueurs chargés
   - Vérifier que 11+ joueurs sont disponibles

2. **Composition d'équipe**
   - Glisser 11 joueurs sur le terrain (tous les postes)
   - Vérifier que le compteur "Titulaires : 11/11" est correct
   - Glisser 5 joueurs vers les remplaçants
   - Vérifier que le compteur "Remplaçants : 5/7" est correct

3. **Modifications**
   - Échanger 2 joueurs de position
   - Remplacer un titulaire par un remplaçant
   - Retirer un joueur du terrain

4. **Validation**
   - Sélectionner un capitaine
   - Vérifier que le bouton "Sauvegarder" est activé
   - Tester la sauvegarde

---

## 📱 Test Mobile/Tablette

En mode mobile/tablette (< 1024px) :

1. Le bouton "Joueurs" flottant doit apparaître en bas à droite
2. Cliquer dessus pour ouvrir la sidebar
3. Le drag & drop doit fonctionner depuis la sidebar ouverte
4. L'overlay sombre doit apparaître derrière la sidebar
5. Cliquer sur l'overlay doit fermer la sidebar

---

## ✅ Critères de Succès

Le drag & drop fonctionne correctement si :

- ✅ Tous les types de déplacements fonctionnent
- ✅ Les listes se synchronisent automatiquement
- ✅ Les retours visuels sont présents
- ✅ Aucune erreur dans la console
- ✅ Le compteur de joueurs est toujours correct
- ✅ Les données sont bien sauvegardées

---

## 🆘 Support

Si le drag & drop ne fonctionne toujours pas :

1. Vérifier la version d'Angular CDK installée
2. Vérifier que `DragDropModule` est bien importé
3. Vérifier les styles CSS (certains styles peuvent bloquer le drag)
4. Tester dans un autre navigateur (Chrome recommandé)

**Version Angular CDK requise** : >= 15.0.0
