import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Official } from '../models/official.model';

interface AssignOfficialPayload {
  official_id: string;
  match_id: string;
  role: string;
}

interface UnassignOfficialPayload {
  reason?: string; // Raison optionnelle de la désassignation
}

@Injectable({
    providedIn: 'root'
})
export class OfficialService {
    private apiUrl = `${environment.apiUrl}/Official`;

    constructor(private http: HttpClient) {}

    // Liste simple
    getAll(): Observable<Official[]> {
        return this.http.get<Official[]>(this.apiUrl);
    }

    // Pagination
    paginate(perPage: number = 15, page: number = 1): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/paginate?per_page=${perPage}&page=${page}`);
    }

    // Détails
    getById(id: string): Observable<Official> {
        return this.http.get<Official>(`${this.apiUrl}/show/${id}`);
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

    // La liste des officiels désigné pour un match
    getOfficialsofMatch(matchId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/matchOfficials/${matchId}`);
    }

  // Assigner un officiel à un match
  assign(payload: AssignOfficialPayload): Observable<Official> {
    return this.http.post<Official>(`${this.apiUrl}/assign`, payload);
  }

  // Désassigner un officiel d'un match
  unassign(matchId: string, officialId: string, payload?: UnassignOfficialPayload): Observable<any> {
    const url = `${this.apiUrl}/unassign/${matchId}/${officialId}`;
    return this.http.delete<any>(url, { body: payload });
  }
}
