import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class MatchDayService {
    baseUrl = environment.apiUrl;
    apiUrl=environment.apiUrl+'/matchdays'
  constructor(private http: HttpClient) { }


    reschedule(id : string, data: any): Observable<any[]> {
      return this.http.put<any[]>(this.apiUrl+"/"+id,data);
    }
    replace( data: any): Observable<any[]> {
      return this.http.post<any[]>(this.apiUrl+"/swap",data);
    }

    getSwappableMatchDays(id : string): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl+"/"+id+"/swappable",);
    }
}
