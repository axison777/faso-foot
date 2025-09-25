import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class MatchService {
    baseUrl = environment.apiUrl;
    apiUrl=environment.apiUrl+'/footballMatch'
  constructor(private http: HttpClient) { }
   getAll(): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl+'/all');
    }

    getBySeasonId(id:string): Observable<any[]> {
      return this.http.get<any[]>(this.baseUrl+"seasons"+"/"+id);
    }

    reschedule(id : string, data: any): Observable<any[]> {
      return this.http.put<any[]>(this.apiUrl+"/"+id,data);
    }

    getDetails(id : string): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl+"/"+id);
    }

    validate(id : string): Observable<any[]> {
      return this.http.post<any[]>(environment.apiUrl+`/match-results/${id}/verification/verify`,{id:id});
    }

    getPlayers(id : string): Observable<any[]> {
      return this.http.get<any[]>(environment.apiUrl+`/callups/match/${id}`);
    }




}
