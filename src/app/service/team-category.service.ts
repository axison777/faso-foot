
// src/app/services/ville.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamCategoryService {
    apiUrl=environment.apiUrl+'/team-categories'

  constructor(private http: HttpClient) {}

  get(id: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/' + id);
  }
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  create(ville: Partial<any>): Observable<any> {
    return this.http.post<any>(this.apiUrl, ville);
  }

  update(id: string, ville: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, ville);
  }

  delete(id?: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
