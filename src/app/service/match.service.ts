import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class MatchService {
    apiUrl=environment.apiUrl+'/matches/'
  constructor(private http: HttpClient) { }
   getAll(): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl+'all');
    }
}
