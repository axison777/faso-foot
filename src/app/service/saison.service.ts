// src/app/services/saison.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Saison {
  id?: string;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class SaisonService {
    apiUrl=environment.apiUrl+'/seasons'

  constructor(private http: HttpClient) {}


  get(id?: string): Observable<Saison> {
    return this.http.get<Saison>(environment.apiUrl+'/calendar/'+id);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/all');
  }

  create(saison: Partial<any>): Observable<any> {
    return this.http.post<any>(this.apiUrl+'/generate-calendar', saison);
  }

  update(id?: string, saison?: Partial<any>): Observable<any> {
    return this.http.put<Saison>(`${this.apiUrl}/${id}`, saison);
  }


  delete(id?: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByGroupId(seasonId: string, pool_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/calendar/${seasonId}/show`, { params: {  pool_id } });
  }

  generate(data:any): Observable<any[]> {
    return this.http.post<any[]>(`${environment.apiUrl}/calendar/return-phase/regenerate`, data);
  }
}
