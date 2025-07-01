// src/app/services/stade.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Stade {
  id: number;
  name: string;
  city_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class StadeService {
    apiUrl=environment.apiUrl+'/stadiums/'

  constructor(private http: HttpClient) {}

  getAll(): Observable<Stade[]> {
    return this.http.get<Stade[]>(this.apiUrl);
  }

  create(stade: Partial<Stade>): Observable<Stade> {
    return this.http.post<Stade>(this.apiUrl, stade);
  }

  update(id: number, stade: Partial<Stade>): Observable<Stade> {
    return this.http.put<Stade>(`${this.apiUrl}${id}/`, stade);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
