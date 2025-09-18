import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CriteresResponse, Critere } from '../models/classement.model';

@Injectable({
  providedIn: 'root'
})
export class CriteresClassementService {
  constructor(private http: HttpClient) {}

  getCriteres(ligueId: number): Observable<CriteresResponse> {
    // MOCK temporaire
    return of({
      criteresDisponibles: [
        { id: '1', nom: 'Nombre de points', ordre: 'desc' },
        { id: '2', nom: 'Différence de buts', ordre: 'desc' },
        { id: '3', nom: 'Buts marqués', ordre: 'desc' },
        { id: '4', nom: 'Confrontation directe', ordre: 'desc' }
      ],
      criteresActuels: ['1', '2', '3']
    });
  }

  saveCriteres(ligueId: number, payload: any): Observable<any> {
    console.log('Payload envoyé au backend:', payload);
    return of({ success: true });
  }
}
