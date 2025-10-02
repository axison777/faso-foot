// src/app/services/club.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClubDashboard, ClubStats } from '../models/dashboard.model';



@Injectable({
  providedIn: 'root'
})
export class ClubService {
  apiUrl = environment.apiUrl + '/clubs';

  constructor(private http: HttpClient) {}

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl );
  }

  create(club: Partial<any>): Observable<any> {
    return this.http.post<any>(this.apiUrl, club);
  }

  update(id?: string, club?: Partial<any>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}`, club);
  }

  delete(id?: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  suspend(id?: string, data?:any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/suspend`, data);
  }

  reactivate(id?: string, data?:any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reactivate`, data);
  }

  getMyClub(): Observable<ClubDashboard> {
    return this.http.get<ClubDashboard>(`${this.apiUrl}/my-club`);
  }

  getClubStats(clubId: string, filters?: { seasonId?: string }): Observable<ClubStats> {
    let params = new HttpParams();
    if (filters?.seasonId) {
      params = params.set('seasonId', filters.seasonId);
    }
    return this.http.get<ClubStats>(`${this.apiUrl}/${clubId}/stats`, { params });
  }


}
