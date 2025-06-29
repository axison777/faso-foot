// src/app/services/ville.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Ville {
  id: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class VilleService {
    apiUrl=environment.apiUrl+'/cities/'

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'all');
  }

  create(ville: Partial<any>): Observable<any> {
    return this.http.post<any>(this.apiUrl, ville);
  }

  update(id: number, ville: Partial<any>): Observable<any> {
    return this.http.put<Ville>(`${this.apiUrl}${id}/`, ville);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
