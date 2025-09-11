// src/app/services/equipe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Equipe {
  id?: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  apiUrl = environment.apiUrl + '/teams';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/all');
  }

  create(equipe: Partial<any>): Observable<any> {
    return this.http.post<any>(this.apiUrl, equipe);
  }

  update(id?: string, equipe?: Partial<any>): Observable<any> {
    return this.http.post<Equipe>(`${this.apiUrl}/${id}`, equipe);
  }

  delete(id?: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Nouvelle méthode pour changer la ligue d'une équipe
  setLeague(teamId: string, leagueId: string): Observable<any> {


    return this.http.post(`${this.apiUrl}/${teamId}/attach-league`, {league_id:leagueId});
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
