import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

export type MatchStatus = 'UPCOMING'|'PLAYED';
export type CompetitionType = 'LEAGUE'|'CUP'|'TOURNAMENT';
export interface MatchScore { home: number; away: number; }
export interface MatchItem {
  id: string;
  number?: number;
  competition: { id: string; name: string; type: CompetitionType };
  seasonId?: string;
  opponent: { id: string; name: string; logo?: string };
  homeAway: 'HOME'|'AWAY';
  stadium: { id: string; name: string };
  scheduledAt: string; // ISO
  status: MatchStatus;
  score?: MatchScore;
  phase?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  baseUrl = environment.apiUrl;
  apiUrl = environment.apiUrl + '/footballMatch';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/all');
  }

  getBySeasonId(id: string): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + 'seasons' + '/' + id);
  }

  reschedule(id: string, data: any): Observable<any[]> {
    return this.http.put<any[]>(this.apiUrl + '/' + id, data);
  }

  getDetails(id: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/' + id);
  }

  validate(id: string): Observable<any[]> {
    return this.http.post<any[]>(environment.apiUrl + `/match-results/${id}/verification/verify`, { id: id });
  }

  getPlayers(id: string): Observable<any[]> {
    return this.http.get<any[]>(environment.apiUrl + `/callups/match/${id}`);
  }

  // --- Read-only helpers for dashboards ---
  getUpcomingMatchForTeam(teamId: string): Observable<MatchItem | null> {
    const url = `${environment.apiUrl}/teams/${teamId}/matches/upcoming`;
    return this.http.get<any>(url).pipe(
      map(res => (res?.data?.match as MatchItem) || null),
      catchError(() => of(this.mockUpcomingMatch(teamId)))
    );
  }

  getMatchesForTeam(teamId: string, opts: { status: MatchStatus; competitionId?: string; seasonId?: string }): Observable<MatchItem[]> {
    const url = `${environment.apiUrl}/teams/${teamId}/matches`;
    const params: any = { status: opts.status, ...(opts.competitionId && { competition_id: opts.competitionId }), ...(opts.seasonId && { season_id: opts.seasonId }) };
    return this.http.get<any>(url, { params }).pipe(
      map(res => (res?.data?.matches as MatchItem[]) || []),
      catchError(() => of(this.mockMatches(teamId, opts.status)))
    );
  }

  getCompetitionPhases(teamId: string, opts?: { competitionId?: string }): Observable<string[]> {
    const url = `${environment.apiUrl}/teams/${teamId}/competition-phases`;
    const params: any = { ...(opts?.competitionId && { competition_id: opts.competitionId }) };
    return this.http.get<any>(url, { params }).pipe(
      map(res => (res?.data?.phases as string[]) || []),
      catchError(() => of(['1/8e', '1/4', '1/2', 'Finale']))
    );
  }

  // --- Mocks ---
  private mockUpcomingMatch(teamId: string): MatchItem | null {
    return {
      id: 'm-upc-1',
      competition: { id: 'c1', name: 'Championnat D1', type: 'LEAGUE' },
      opponent: { id: 'op1', name: 'USO' },
      homeAway: 'HOME',
      stadium: { id: 's1', name: 'Stade Municipal' },
      scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      status: 'UPCOMING',
      phase: undefined,
    };
  }

  private mockMatches(teamId: string, status: MatchStatus): MatchItem[] {
    const base = new Date();
    const list: MatchItem[] = [];
    for (let i = 0; i < 8; i++) {
      const isPlayed = status === 'PLAYED';
      const dt = new Date(base.getTime() - (isPlayed ? i + 1 : -(i + 1)) * 7 * 24 * 3600 * 1000);
      list.push({
        id: `${teamId}-${status}-${i}`,
        number: i + 1,
        competition: { id: i % 2 === 0 ? 'c1' : 'c2', name: i % 2 === 0 ? 'Championnat D1' : 'Coupe Nationale', type: i % 2 === 0 ? 'LEAGUE' : 'CUP' },
        opponent: { id: 'op' + i, name: 'Adversaire ' + (i + 1) },
        homeAway: i % 2 === 0 ? 'HOME' : 'AWAY',
        stadium: { id: 's' + i, name: 'Stade ' + (i + 1) },
        scheduledAt: dt.toISOString(),
        status,
        score: isPlayed ? { home: Math.floor(Math.random() * 4), away: Math.floor(Math.random() * 4) } : undefined,
        phase: i % 2 === 1 ? ['1/8e', '1/4', '1/2', 'Finale'][i % 4] : undefined,
      });
    }
    return list;
  }
}
