// src/app/services/ligue.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
export interface Ligue {
  id?: string;
  nom: string;
}

export interface StandingItem { teamId: string; rank: number; points: number; played: number; wins: number; draws: number; losses: number; gf: number; ga: number; gd: number; }

@Injectable({
  providedIn: 'root'
})
export class LigueService {
    apiUrl=environment.apiUrl+'/leagues'

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/all');
  }

  create(ligue: Partial<any>): Observable<any> {
    return this.http.post<any>(this.apiUrl, ligue);
  }

  update(id?: string, ligue?: Partial<any>): Observable<any> {
    return this.http.post<Ligue>(`${this.apiUrl}/${id}`, ligue);
  }

  delete(id?: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setTeams(ligueId: string,leagueName: string, teamIds: string[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ligueId}`,  {name:leagueName,teams:teamIds});
  }

  getStanding(leagueId: string, opts?: { teamId?: string }): Observable<StandingItem[]> {
    const url = `${this.apiUrl}/${leagueId}/standing`;
    const params: any = { ...(opts?.teamId && { team_id: opts.teamId }) };
    return this.http.get<any>(url, { params }).pipe(
      map(res => (res?.data?.items as StandingItem[]) || []),
      catchError(() => of([] as StandingItem[]))
    );
  }
}
