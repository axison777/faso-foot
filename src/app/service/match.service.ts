import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatchListItem } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
    baseUrl = environment.apiUrl;
    apiUrl=environment.apiUrl+'/footballMatch'
  constructor(private http: HttpClient) { }
   getAll(): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl+'/all');
    }

    getBySeasonId(id:string): Observable<any[]> {
      return this.http.get<any[]>(this.baseUrl+"seasons"+"/"+id);
    }

    reschedule(id : string, data: any): Observable<any[]> {
      return this.http.put<any[]>(this.apiUrl+"/"+id,data);
    }

    getDetails(id : string): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl+"/"+id);
    }

    validate(id : string): Observable<any[]> {
      return this.http.post<any[]>(environment.apiUrl+`/match-results/${id}/verification/verify`,{id:id});
    }

    getPlayers(id : string): Observable<any[]> {
      return this.http.get<any[]>(environment.apiUrl+`/callups/match/${id}`);
    }

    getUpcomingMatchForTeam(teamId: string): Observable<MatchListItem | null> {
      return this.http.get<MatchListItem | null>(`${this.baseUrl}/teams/${teamId}/next-match`);
    }

    getMatchesForTeam(teamId: string, filters?: {
      status?: 'UPCOMING' | 'PLAYED';
      competitionId?: string;
      seasonId?: string;
    }): Observable<MatchListItem[]> {
      let params = new HttpParams();
      if (filters?.status) {
        params = params.set('status', filters.status);
      }
      if (filters?.competitionId) {
        params = params.set('competitionId', filters.competitionId);
      }
      if (filters?.seasonId) {
        params = params.set('seasonId', filters.seasonId);
      }
      return this.http.get<MatchListItem[]>(`${this.baseUrl}/teams/${teamId}/matches`, { params });
    }

    getCompetitionPhases(teamId: string, filters?: { competitionId?: string }): Observable<string[]> {
      let params = new HttpParams();
      if (filters?.competitionId) {
        params = params.set('competitionId', filters.competitionId);
      }
      return this.http.get<string[]>(`${this.baseUrl}/teams/${teamId}/competition-phases`, { params });
    }



}
