import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Ville } from '../../models/ville.model'; // Corrigé : ajouté un "../" de plus

@Injectable({
  providedIn: 'root'
})
export class VilleService {
  
  private villes: Ville[] = [
    { id: 1, nom: 'Ouagadougou' },
    { id: 2, nom: 'Bobo-Dioulasso'},
    { id: 3, nom: 'Koudougou' },
    { id: 4, nom: 'Banfora'},
    { id: 5, nom: 'Ouahigouya' }
  ];

  private nextId = 6;

  constructor() {}

  getAll(): Observable<Ville[]> {
    return of([...this.villes]).pipe(delay(500));
  }

  getById(id: number): Observable<Ville> {
    const ville = this.villes.find(v => v.id === id);
    if (!ville) {
      throw new Error(`Ville avec l'ID ${id} non trouvée`);
    }
    return of({ ...ville }).pipe(delay(300));
  }

  create(ville: Ville): Observable<Ville> {
    const newVille = { ...ville, id: this.nextId++ };
    this.villes.push(newVille);
    return of({ ...newVille }).pipe(delay(500));
  }

  update(id: number, ville: Ville): Observable<Ville> {
    const index = this.villes.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error(`Ville avec l'ID ${id} non trouvée`);
    }
    this.villes[index] = { ...ville, id };
    return of({ ...this.villes[index] }).pipe(delay(500));
  }

  delete(id: number): Observable<void> {
    const index = this.villes.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error(`Ville avec l'ID ${id} non trouvée`);
    }
    this.villes.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }
}
