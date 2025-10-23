// src/app/services/player.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
    apiUrl = environment.apiUrl + '/players';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res: any) => res?.data?.players || [])
    );
  }

  create(player: Partial<any>): Observable<any> {
    return this.http.post<any>(this.apiUrl, player).pipe(
      map((res: any) => res?.data || res)
    );
  }

  update(id: string, player: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, player).pipe(
      map((res: any) => res?.data || res)
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`).pipe(
      map((res: any) => res?.data || res)
    );
  }

  getByTeamId(teamId: string): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/teams/${teamId}/players`).pipe(
      map((res: any) => res?.data?.players || [])
    );
  }

  show(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/show/${id}`).pipe(
      map((res: any) => res?.data || res)
    );
  }
}
