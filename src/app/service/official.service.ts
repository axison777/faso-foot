import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Official } from '../models/official.model';

@Injectable({
  providedIn: 'root'
})
export class OfficialService {
  private apiUrl = `${environment.apiUrl}/Official`;

  constructor(private http: HttpClient) { }

  // Liste simple
  getAll(): Observable<Official[]> {
    return this.http.get<Official[]>(this.apiUrl);
  }

  // Pagination
  paginate(perPage: number = 15, page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paginate?per_page=${perPage}&page=${page}`);
  }

  // Détails
  /* getById(id: string): Observable<Official> {
    return this.http.get<Official>(`${this.apiUrl}/show/${id}`);
  } */
  getById(id: string): Observable<Official> {
    return this.http.get<Official>(`${this.apiUrl}/show/${id}`)
  }

  // Création
  create(payload: Partial<Official>): Observable<Official> {
    return this.http.post<Official>(this.apiUrl, payload);
  }

  // Mise à jour
  update(id: string, payload: Partial<Official>): Observable<Official> {
    return this.http.put<Official>(`${this.apiUrl}/${id}`, payload);
  }

  // Suppression
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
