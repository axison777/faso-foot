import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ContractService {

    apiUrl=environment.apiUrl+'/player-contracts'

    constructor(private http: HttpClient) {}
    create(stade: Partial<any>): Observable<any> {
      return this.http.post<any>(this.apiUrl, stade);
    }

    update(id?: string, stade?: Partial<any>): Observable<any> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, stade);
    }

    delete(id?: string): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
