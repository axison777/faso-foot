# 🔧 Correction Erreurs TypeScript - Match Status

**Date :** 2025-10-18

---

## ❌ Erreurs

```
[ERROR] TS2322: Type '"upcoming"' is not assignable to type 'MatchStatus | undefined'.
[ERROR] TS2322: Type '"played"' is not assignable to type 'MatchStatus | undefined'.
```

---

## 🔍 Cause

Le type `MatchStatus` contient les statuts réels du backend :
```typescript
type MatchStatus = 
  | 'not_started'
  | 'in_progress'
  | 'finished'
  | 'cancelled'
  | 'postponed'
  | 'planned'
  | 'completed'
  | 'validated';
```

Mais le service utilisait encore les anciens statuts :
- `'upcoming'` ❌ (n'existe pas dans MatchStatus)
- `'played'` ❌ (n'existe pas dans MatchStatus)

---

## ✅ Solution

Filtrer les matchs par **date** au lieu d'utiliser des statuts inexistants.

### Avant
```typescript
getUpcomingMatches(teamId: string, filters?: any): Observable<CoachMatch[]> {
  return this.getTeamMatches(teamId, { ...filters, status: 'upcoming' }); // ❌
}

getPastMatches(teamId: string, filters?: any): Observable<CoachMatch[]> {
  return this.getTeamMatches(teamId, { ...filters, status: 'played' }); // ❌
}
```

### Après
```typescript
getUpcomingMatches(teamId: string, filters?: any): Observable<CoachMatch[]> {
  return this.getTeamMatches(teamId, { ...filters }).pipe(
    map(matches => {
      const now = new Date().getTime();
      return matches.filter(m => new Date(m.scheduled_at).getTime() > now);
    })
  );
}

getPastMatches(teamId: string, filters?: any): Observable<CoachMatch[]> {
  return this.getTeamMatches(teamId, { ...filters }).pipe(
    map(matches => {
      const now = new Date().getTime();
      return matches.filter(m => new Date(m.scheduled_at).getTime() <= now);
    })
  );
}
```

---

## 📊 Logique de filtrage

### Matchs à venir (upcoming)
```typescript
const now = new Date().getTime();
matches.filter(m => new Date(m.scheduled_at).getTime() > now)
```

**Critère :** `scheduled_at` > maintenant

### Matchs passés (played)
```typescript
const now = new Date().getTime();
matches.filter(m => new Date(m.scheduled_at).getTime() <= now)
```

**Critère :** `scheduled_at` <= maintenant

---

## 🎯 Pourquoi filtrer par date ?

1. **Plus fiable** : La date est une donnée sûre
2. **Indépendant du statut** : Un match peut avoir différents statuts mais une seule date
3. **Compatible** : Fonctionne avec tous les statuts backend
4. **Précis** : Basé sur la date réelle de programmation

---

## 💡 Alternative (si le backend supporte)

Si le backend accepte un filtre de date, on pourrait aussi faire :

```typescript
getUpcomingMatches(teamId: string, filters?: any): Observable<CoachMatch[]> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return this.getTeamMatches(teamId, { 
    ...filters, 
    date_from: today // Matchs à partir d'aujourd'hui
  });
}

getPastMatches(teamId: string, filters?: any): Observable<CoachMatch[]> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return this.getTeamMatches(teamId, { 
    ...filters, 
    date_to: today // Matchs jusqu'à aujourd'hui
  });
}
```

---

## 📋 Fichier modifié

✅ `src/app/service/coach.service.ts`
- `getUpcomingMatches()` : filtre par date (futur)
- `getPastMatches()` : filtre par date (passé)

---

## 🧪 Tests

### Test 1 : getUpcomingMatches()
```typescript
this.coachService.getUpcomingMatches(teamId).subscribe(matches => {
  // Tous les matchs retournés ont scheduled_at > maintenant
  console.log('Matchs à venir:', matches);
});
```

### Test 2 : getPastMatches()
```typescript
this.coachService.getPastMatches(teamId).subscribe(matches => {
  // Tous les matchs retournés ont scheduled_at <= maintenant
  console.log('Matchs passés:', matches);
});
```

---

## ✅ Résumé

**Problème :**
- Utilisation de statuts inexistants (`'upcoming'`, `'played'`)

**Solution :**
- Filtrage par date (`scheduled_at`)

**Avantages :**
- ✅ Pas d'erreur TypeScript
- ✅ Plus fiable
- ✅ Compatible avec tous les statuts backend

---

**Status :** ✅ CORRIGÉ

Le projet devrait maintenant compiler sans erreur ! 🎉
