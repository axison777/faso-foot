// src/app/services/equipe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Equipe {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
    apiUrl=environment.apiUrl+'/teams/'

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'all');
  }

  create(equipe: Partial<any>): Observable<any> {
    return this.http.post<any>(this.apiUrl, equipe);
  }

  update(id: number, equipe: Partial<any>): Observable<any> {
    return this.http.post<Equipe>(`${this.apiUrl}${id}/`, equipe);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
