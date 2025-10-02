// src/app/services/equipe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TeamStats } from '../models/dashboard.model';
import { Team } from '../models/team.model';

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

    suspend(id?: string, data?:any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/suspend`, data);
  }

  reactivate(id?: string, data?:any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reactivate`, data);
  }

  getMyTeam(): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/my-team`);
  }

  getTeamStats(teamId: string, filters?: { seasonId?: string; competitionId?: string }): Observable<TeamStats> {
    let params = new HttpParams();
    if (filters?.seasonId) {
      params = params.set('seasonId', filters.seasonId);
    }
    if (filters?.competitionId) {
      params = params.set('competitionId', filters.competitionId);
    }
    return this.http.get<TeamStats>(`${this.apiUrl}/${teamId}/stats`, { params });
  }

}
