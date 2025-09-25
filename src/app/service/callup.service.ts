import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CallupService {
  private apiUrl = `${environment.apiUrl}/callups`;

  constructor(private http: HttpClient) { }

  // Créer un nouvel appel
  createCallup(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  // Ajouter des joueurs à un appel
  addPlayersToCallup(callupId: string | number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${callupId}/players`, payload);
  }

  // Définir uniquement la formation
  setFormation(callupId: string | number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${callupId}/formation`, payload);
  }

  // Définir uniquement le capitaine
  setCaptain(callupId: string | number, payload: { formation: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${callupId}/captain`, payload);
  }

  // Définir formation et capitaine en une fois
  setFormationAndCaptain(callupId: string | number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${callupId}/formation-captain`, payload);
  }

  // Mise à jour complète (joueurs + formation + capitaine)
  updateCallup(callupId: string | number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${callupId}`, payload);
  }

  // Voir les détails d'un appel
  getCallupDetails(callupId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${callupId}`);
  }

  // Finaliser un appel
  finalizeCallup(callupId: string | number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${callupId}/finalize`, {});
  }

  // Obtenir les joueurs disponibles pour une équipe donnée
  getAvailablePlayers(teamId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/available-players/${teamId}`);
  }

  // Obtenir laliste des joueurs déjà assigné d'un match
  getCallUpByMatch(matchId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/match/${matchId}`)
  }
}
