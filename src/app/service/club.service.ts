// src/app/services/club.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class ClubService {
  apiUrl = environment.apiUrl + '/clubs';

  constructor(private http: HttpClient) {}

  get(id: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/' + id);
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
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
