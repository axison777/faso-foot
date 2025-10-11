// src/app/services/club.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface MyClubTeam { id: string; name: string; category?: string; logo?: string; }
export interface MyClub { id: string; name: string; logo?: string; teams: MyClubTeam[]; }
export interface ClubStats { played: number; wins: number; draws: number; losses: number; goals_for: number; goals_against: number; }

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  apiUrl = environment.apiUrl + '/clubs';

  constructor(private http: HttpClient) {}

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => res?.data || res)
    );
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

  // --- Read-only helpers for dashboards ---
  getMyClub(): Observable<MyClub> {
    // Try API endpoint if exists, else fallback to mock
    const url = `${this.apiUrl}/me`;
    return this.http.get<any>(url).pipe(
      map((res: any) => res?.data?.club as MyClub),
      catchError(() => of(this.mockMyClub()))
    );
  }

  getClubStats(clubId: string, opts?: { seasonId?: string }): Observable<ClubStats> {
    const url = `${this.apiUrl}/${clubId}/stats`;
    const params: any = opts?.seasonId ? { season_id: opts.seasonId } : {};
    return this.http.get<any>(url, { params }).pipe(
      map((res: any) => (res?.data?.stats as ClubStats) || this.mockClubStats()),
      catchError(() => of(this.mockClubStats()))
    );
  }

  // --- Mocks ---
  private mockMyClub(): MyClub {
    return {
      id: 'club-1',
      name: 'AS Fasofoot',
      logo: '',
      teams: [
        { id: 't1', name: 'AS Fasofoot A', category: 'Sénior', logo: '' },
        { id: 't2', name: "AS Fasofoot U20", category: 'U20', logo: '' },
        { id: 't3', name: "AS Fasofoot Féminin", category: 'Féminin', logo: '' },
      ],
    };
  }

  private mockClubStats(): ClubStats {
    return { played: 42, wins: 24, draws: 8, losses: 10, goals_for: 67, goals_against: 38 };
  }
}
