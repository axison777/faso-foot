// src/app/services/equipe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Equipe {
  id?: string;
  name: string;
  category?: string;
  logo?: string;
}

export interface TeamStats {
  played: number; wins: number; draws: number; losses: number; goals_for: number; goals_against: number; recent_form?: Array<'V'|'N'|'D'>;
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

  // --- Read-only helpers
  getMyTeam(): Observable<Equipe> {
    const url = `${this.apiUrl}/me`;
    return this.http.get<any>(url).pipe(
      map((res: any) => res?.data?.team as Equipe),
      catchError(() => of(this.mockTeam()))
    );
  }

  getTeamStats(teamId: string, opts?: { seasonId?: string; competitionId?: string }): Observable<TeamStats> {
    const url = `${this.apiUrl}/${teamId}/stats`;
    const params: any = { ...(opts?.seasonId && { season_id: opts.seasonId }), ...(opts?.competitionId && { competition_id: opts.competitionId }) };
    return this.http.get<any>(url, { params }).pipe(
      map((res: any) => (res?.data?.stats as TeamStats) || this.mockTeamStats()),
      catchError(() => of(this.mockTeamStats()))
    );
  }

  // --- Mocks ---
  private mockTeam(): Equipe { return { id: 't1', name: 'AS Fasofoot A', category: 'Sénior' }; }
  private mockTeamStats(): TeamStats { return { played: 18, wins: 10, draws: 4, losses: 4, goals_for: 28, goals_against: 16, recent_form: ['V','N','D','V','V'] }; }
}
