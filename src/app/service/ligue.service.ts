// src/app/services/ligue.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Ligue {
  id?: string;
  nom: string;
}

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
}
