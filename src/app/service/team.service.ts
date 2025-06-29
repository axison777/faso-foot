// team.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { Team, League } from './team.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = 'http://localhost:8000/api'; // à adapter

  constructor(private http: HttpClient) {}

  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/teams/`);
  }

  createTeam(data: { name: string; leagueId: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/teams/`, data);
  }

  getLeagues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leagues/`);
  }
}
